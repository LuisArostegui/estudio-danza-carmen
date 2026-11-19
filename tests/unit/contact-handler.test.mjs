import { describe, test } from "node:test";
import assert from "node:assert/strict";

import { handleContact } from "../../src/worker/contact.js";

const URL_ = "https://x/api/contact";
const SITEVERIFY = "https://challenges.cloudflare.com/turnstile/v0/siteverify";
const RESEND = "https://api.resend.com/emails";

// Values are fake and only exist inside this test file.
const ENV = {
  CONTACT_TO_EMAIL: "contacto@example.test",
  CONTACT_FROM_EMAIL: "web@example.test",
  RESEND_API_KEY: "re_fake_secret_for_tests",
  TURNSTILE_SECRET_KEY: "turnstile_fake_secret_for_tests",
};

const SUBMITTED = {
  nombre: "Ana Prueba",
  correo: "ana.visitante@example.test",
  telefono: "600 987 654",
  actividad: "ballet-adultos",
  mensaje: "Quiero información sobre las clases de adultos.",
  privacidad: "on",
  sitio_web: "",
  "cf-turnstile-response": "turnstile-token-fake",
};

function formOf(values) {
  const form = new FormData();
  for (const [key, value] of Object.entries(values)) {
    if (value !== undefined) form.append(key, value);
  }
  return form;
}

function postForm(values, headers = {}) {
  return new Request(URL_, {
    method: "POST",
    headers,
    body: formOf(values),
  });
}

function scriptedFetch(queue) {
  const calls = [];
  const fetch = async (url, init) => {
    calls.push({ url: String(url), init });
    const next = queue.shift();
    if (next === undefined) throw new Error("unexpected fetch call");
    if (next instanceof Error) throw next;
    return next;
  };
  return { fetch, calls };
}

function fakeLog() {
  const lines = [];
  return {
    lines,
    error: (message) => lines.push(String(message)),
    warn: (message) => lines.push(String(message)),
  };
}

function json(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

async function run(request, { env = ENV, responses = [] } = {}) {
  const { fetch, calls } = scriptedFetch([...responses]);
  const log = fakeLog();
  const response = await handleContact(request, env, { fetch, log });
  const body = await response.json();
  return { response, body, calls, log };
}

function assertNoLeaks(log, values) {
  const haystack = log.lines.join("\n");
  for (const value of values) {
    if (value && value.length > 0) {
      assert.equal(
        haystack.includes(value),
        false,
        `log leaked a submitted or secret value`,
      );
    }
  }
}

// The privacy checkbox value "on" is excluded: it is a substring of log event
// names such as "contact_unavailable" and carries no personal data.
const SECRETS_AND_VALUES = [
  ...Object.entries(SUBMITTED)
    .filter(([key]) => key !== "privacidad")
    .map(([, value]) => value)
    .filter(Boolean),
  ...Object.values(ENV),
  "192.0.2.10",
];

describe("request guards", () => {
  test("rejects non-POST methods with 405 and Allow header", async () => {
    const request = new Request(URL_, { method: "GET" });
    const { response, body, calls } = await run(request);
    assert.equal(response.status, 405);
    assert.equal(response.headers.get("allow"), "POST");
    assert.deepEqual(body, { ok: false, error: "method" });
    assert.equal(calls.length, 0);
  });

  test("rejects unsupported content types with 415", async () => {
    const request = new Request(URL_, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: "{}",
    });
    const { response, body, calls } = await run(request);
    assert.equal(response.status, 415);
    assert.deepEqual(body, { ok: false, error: "content_type" });
    assert.equal(calls.length, 0);
  });

  test("rejects bodies declared above 65536 bytes with 413", async () => {
    const request = new Request(URL_, {
      method: "POST",
      headers: {
        "content-type": "application/x-www-form-urlencoded",
        "content-length": "65537",
      },
      body: "nombre=Ana",
    });
    const { response, body, calls } = await run(request);
    assert.equal(response.status, 413);
    assert.deepEqual(body, { ok: false, error: "too_large" });
    assert.equal(calls.length, 0);
  });

  test("accepts a declared body above the old 16 KB cap", async () => {
    const request = new Request(URL_, {
      method: "POST",
      headers: {
        "content-type": "application/x-www-form-urlencoded",
        "content-length": "20000",
      },
      body: new URLSearchParams(SUBMITTED).toString(),
    });
    const { response, body, calls } = await run(request, {
      responses: [
        json(200, { success: true }),
        json(200, { id: "email_fake_id" }),
      ],
    });
    assert.equal(response.status, 200);
    assert.deepEqual(body, { ok: true });
    assert.equal(calls.length, 2);
  });

  test("accepts a 5000-character accented and emoji mensaje under 64 KB", async () => {
    const mensaje = "á".repeat(2500) + "😀".repeat(1250);
    assert.equal(mensaje.length, 5000);
    const request = postForm({ ...SUBMITTED, mensaje });
    const { response, body, calls } = await run(request, {
      responses: [
        json(200, { success: true }),
        json(200, { id: "email_fake_id" }),
      ],
    });
    assert.equal(response.status, 200);
    assert.deepEqual(body, { ok: true });
    assert.equal(calls.length, 2);
    assert.equal(JSON.parse(calls[1].init.body).text.endsWith(mensaje), true);
  });

  test("counts each CRLF line break as one character in mensaje", async () => {
    // 4950 + 50 CRLF pairs (100 units) is 5050 raw, but 5000 after normalising.
    const mensaje = "a".repeat(2475) + "\r\n".repeat(50) + "a".repeat(2475);
    const request = postForm({ ...SUBMITTED, mensaje });
    const { response, body, calls } = await run(request, {
      responses: [
        json(200, { success: true }),
        json(200, { id: "email_fake_id" }),
      ],
    });
    assert.equal(response.status, 200);
    assert.deepEqual(body, { ok: true });
    const text = JSON.parse(calls[1].init.body).text;
    assert.equal(text.endsWith(mensaje.replace(/\r\n/g, "\n")), true);
    assert.equal(text.includes("\r"), false);
  });

  test("returns 503 not_configured when a required secret or variable is missing", async () => {
    for (const key of Object.keys(ENV)) {
      const env = { ...ENV, [key]: "" };
      const { response, body, calls, log } = await run(postForm(SUBMITTED), {
        env,
      });
      assert.equal(response.status, 503, key);
      assert.deepEqual(body, { ok: false, error: "not_configured" });
      assert.equal(calls.length, 0);
      assert.equal(log.lines.length, 1);
      assert.deepEqual(JSON.parse(log.lines[0]), {
        event: "contact_not_configured",
        status: 503,
      });
    }
  });

  test("returns 429 with Retry-After when the rate limiter refuses", async () => {
    const limitCalls = [];
    const env = {
      ...ENV,
      CONTACT_RATE_LIMITER: {
        limit: async (options) => {
          limitCalls.push(options);
          return { success: false };
        },
      },
    };
    const request = postForm(SUBMITTED, { "CF-Connecting-IP": "192.0.2.10" });
    const { response, body, calls } = await run(request, { env });
    assert.equal(response.status, 429);
    assert.equal(response.headers.get("retry-after"), "60");
    assert.deepEqual(body, { ok: false, error: "rate_limited" });
    assert.deepEqual(limitCalls, [{ key: "192.0.2.10" }]);
    assert.equal(calls.length, 0);
  });

  test("keys the rate limiter by unknown when CF-Connecting-IP is absent", async () => {
    const limitCalls = [];
    const env = {
      ...ENV,
      CONTACT_RATE_LIMITER: {
        limit: async (options) => {
          limitCalls.push(options);
          return { success: true };
        },
      },
    };
    const { response } = await run(postForm(SUBMITTED), {
      env,
      responses: [
        json(200, { success: true }),
        new Response("{}", { status: 200 }),
      ],
    });
    assert.equal(response.status, 200);
    assert.deepEqual(limitCalls, [{ key: "unknown" }]);
  });
});

describe("payload checks", () => {
  test("returns 400 bad_request for an unknown field and makes no network calls", async () => {
    const { response, body, calls, log } = await run(
      postForm({ ...SUBMITTED, admin: "1" }),
    );
    assert.equal(response.status, 400);
    assert.deepEqual(body, { ok: false, error: "bad_request" });
    assert.equal(calls.length, 0);
    assertNoLeaks(log, SECRETS_AND_VALUES);
  });

  test("returns 400 bad_request for a repeated field", async () => {
    const form = formOf(SUBMITTED);
    form.append("nombre", "Otra Persona");
    const request = new Request(URL_, { method: "POST", body: form });
    const { response, body, calls } = await run(request);
    assert.equal(response.status, 400);
    assert.deepEqual(body, { ok: false, error: "bad_request" });
    assert.equal(calls.length, 0);
  });

  test("returns 400 bad_request when a file is posted as a field", async () => {
    const form = formOf({ ...SUBMITTED, nombre: undefined });
    form.append("nombre", new File(["x"], "a.txt", { type: "text/plain" }));
    const request = new Request(URL_, { method: "POST", body: form });
    const { response, body } = await run(request);
    assert.equal(response.status, 400);
    assert.deepEqual(body, { ok: false, error: "bad_request" });
  });

  test("returns 400 bad_request when the body cannot be parsed", async () => {
    const request = new Request(URL_, {
      method: "POST",
      headers: { "content-type": "multipart/form-data; boundary=missing" },
      body: "not a multipart body",
    });
    const { response, body } = await run(request);
    assert.equal(response.status, 400);
    assert.deepEqual(body, { ok: false, error: "bad_request" });
  });

  test("returns 400 validation with the failing field map", async () => {
    const { response, body, calls } = await run(
      postForm({ ...SUBMITTED, correo: "no-es-correo", mensaje: "corto" }),
    );
    assert.equal(response.status, 400);
    assert.deepEqual(body, {
      ok: false,
      error: "validation",
      fields: { correo: "format", mensaje: "too_short" },
    });
    assert.equal(calls.length, 0);
  });
});

describe("spam and verification", () => {
  test("returns 403 verification for a filled honeypot with zero network calls", async () => {
    const { response, body, calls, log } = await run(
      postForm({ ...SUBMITTED, sitio_web: "https://spam.example.test" }),
    );
    assert.equal(response.status, 403);
    assert.deepEqual(body, { ok: false, error: "verification" });
    assert.equal(calls.length, 0);
    assertNoLeaks(log, SECRETS_AND_VALUES);
  });

  test("returns 403 verification when the Turnstile token is missing", async () => {
    const { response, body, calls } = await run(
      postForm({ ...SUBMITTED, "cf-turnstile-response": undefined }),
    );
    assert.equal(response.status, 403);
    assert.deepEqual(body, { ok: false, error: "verification" });
    assert.equal(calls.length, 0);
  });

  test("returns 403 verification when the Turnstile token is empty", async () => {
    const { response, body, calls } = await run(
      postForm({ ...SUBMITTED, "cf-turnstile-response": "" }),
    );
    assert.equal(response.status, 403);
    assert.deepEqual(body, { ok: false, error: "verification" });
    assert.equal(calls.length, 0);
  });

  test("returns 403 verification when Siteverify reports success false, without calling Resend", async () => {
    const { response, body, calls, log } = await run(
      postForm({
        ...SUBMITTED,
        "cf-turnstile-response": "turnstile-token-fake",
      }),
      {
        responses: [
          json(200, {
            success: false,
            "error-codes": ["invalid-input-response"],
          }),
        ],
      },
    );
    assert.equal(response.status, 403);
    assert.deepEqual(body, { ok: false, error: "verification" });
    assert.equal(calls.length, 1);
    assert.equal(calls[0].url, SITEVERIFY);
    assertNoLeaks(log, SECRETS_AND_VALUES);
  });

  test("returns 502 unavailable when Siteverify throws", async () => {
    const { response, body, calls, log } = await run(postForm(SUBMITTED), {
      responses: [new TypeError("network down")],
    });
    assert.equal(response.status, 502);
    assert.deepEqual(body, { ok: false, error: "unavailable" });
    assert.equal(calls.length, 1);
    assert.deepEqual(JSON.parse(log.lines[0]), {
      event: "contact_unavailable",
      status: 502,
    });
    assertNoLeaks(log, SECRETS_AND_VALUES);
  });

  test("aborts a stalled Siteverify call with a signal and returns 502 unavailable", async () => {
    const { response, body, calls, log } = await run(postForm(SUBMITTED), {
      responses: [new DOMException("The operation was aborted.", "AbortError")],
    });
    assert.equal(response.status, 502);
    assert.deepEqual(body, { ok: false, error: "unavailable" });
    assert.equal(calls.length, 1);
    assert.ok(calls[0].init.signal instanceof AbortSignal);
    assertNoLeaks(log, SECRETS_AND_VALUES);
  });

  test("passes an abort signal to the Resend call as well", async () => {
    const { calls } = await run(postForm(SUBMITTED), {
      responses: [
        json(200, { success: true }),
        json(200, { id: "email_fake_id" }),
      ],
    });
    assert.ok(calls[0].init.signal instanceof AbortSignal);
    assert.ok(calls[1].init.signal instanceof AbortSignal);
  });

  test("returns 502 unavailable when Siteverify answers non-2xx", async () => {
    const { response, body, calls } = await run(postForm(SUBMITTED), {
      responses: [new Response("oops", { status: 500 })],
    });
    assert.equal(response.status, 502);
    assert.deepEqual(body, { ok: false, error: "unavailable" });
    assert.equal(calls.length, 1);
  });

  test("sends Siteverify secret, response token and remoteip", async () => {
    const { calls } = await run(
      postForm(SUBMITTED, { "CF-Connecting-IP": "192.0.2.10" }),
      {
        responses: [json(200, { success: false })],
      },
    );
    const body = new URLSearchParams(calls[0].init.body);
    assert.equal(calls[0].init.method, "POST");
    assert.equal(body.get("secret"), ENV.TURNSTILE_SECRET_KEY);
    assert.equal(body.get("response"), "turnstile-token-fake");
    assert.equal(body.get("remoteip"), "192.0.2.10");
  });
});

describe("delivery", () => {
  test("returns 502 delivery when Resend answers non-2xx", async () => {
    const { response, body, calls, log } = await run(postForm(SUBMITTED), {
      responses: [
        json(200, { success: true }),
        json(422, { message: "rejected" }),
      ],
    });
    assert.equal(response.status, 502);
    assert.deepEqual(body, { ok: false, error: "delivery" });
    assert.equal(calls.length, 2);
    assert.deepEqual(JSON.parse(log.lines[0]), {
      event: "contact_delivery",
      status: 502,
    });
    assertNoLeaks(log, SECRETS_AND_VALUES);
  });

  test("returns 502 delivery when Resend throws", async () => {
    const { response, body, calls, log } = await run(postForm(SUBMITTED), {
      responses: [
        json(200, { success: true }),
        new TypeError("socket hang up"),
      ],
    });
    assert.equal(response.status, 502);
    assert.deepEqual(body, { ok: false, error: "delivery" });
    assert.equal(calls.length, 2);
    assertNoLeaks(log, SECRETS_AND_VALUES);
  });

  test("sends the exact Resend payload and returns 200", async () => {
    const { response, body, calls, log } = await run(
      postForm({ ...SUBMITTED, nombre: "Ana\r\nBcc: otra@example.test  " }),
      {
        responses: [
          json(200, { success: true }),
          json(200, { id: "email_fake_id" }),
        ],
      },
    );
    assert.equal(response.status, 200);
    assert.equal(
      response.headers.get("content-type"),
      "application/json; charset=utf-8",
    );
    assert.equal(response.headers.get("cache-control"), "no-store");
    assert.deepEqual(body, { ok: true });
    assert.equal(calls.length, 2);

    const resend = calls[1];
    assert.equal(resend.url, RESEND);
    assert.equal(resend.init.method, "POST");
    assert.equal(
      resend.init.headers.Authorization,
      `Bearer ${ENV.RESEND_API_KEY}`,
    );
    assert.equal(resend.init.headers["content-type"], "application/json");

    const payload = JSON.parse(resend.init.body);
    assert.deepEqual(Object.keys(payload).sort(), [
      "from",
      "reply_to",
      "subject",
      "text",
      "to",
    ]);
    assert.equal(payload.from, ENV.CONTACT_FROM_EMAIL);
    assert.deepEqual(payload.to, [ENV.CONTACT_TO_EMAIL]);
    assert.equal(payload.reply_to, SUBMITTED.correo);
    assert.equal(
      payload.subject,
      "Nueva consulta web: AnaBcc: otra@example.test",
    );
    assert.equal(/[\r\n]/.test(payload.subject), false);
    assert.equal(
      payload.text,
      [
        "Nombre: Ana\nBcc: otra@example.test",
        `Correo: ${SUBMITTED.correo}`,
        `Teléfono: ${SUBMITTED.telefono}`,
        `Actividad: ${SUBMITTED.actividad}`,
        "Mensaje:",
        SUBMITTED.mensaje,
      ].join("\n"),
    );

    assertNoLeaks(log, [
      ENV.RESEND_API_KEY,
      ENV.TURNSTILE_SECRET_KEY,
      SUBMITTED.correo,
      SUBMITTED.mensaje,
    ]);
  });

  test("uses an em dash when the optional phone is omitted", async () => {
    const { calls } = await run(
      postForm({ ...SUBMITTED, telefono: undefined }),
      {
        responses: [
          json(200, { success: true }),
          json(200, { id: "email_fake_id" }),
        ],
      },
    );
    const payload = JSON.parse(calls[1].init.body);
    assert.equal(payload.text.includes("Teléfono: —"), true);
    assert.equal("html" in payload, false);
  });
});

function streamOf(bytes, chunkSize) {
  return new ReadableStream({
    start(controller) {
      for (let offset = 0; offset < bytes.length; offset += chunkSize) {
        controller.enqueue(bytes.slice(offset, offset + chunkSize));
      }
      controller.close();
    },
  });
}

describe("streamed body cap", () => {
  test("rejects a streamed body over 64 KiB without Content-Length with 413 and no network calls", async () => {
    const bytes = new TextEncoder().encode("nombre=" + "a".repeat(65536 + 10));
    const request = new Request(URL_, {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: streamOf(bytes, 8192),
      duplex: "half",
    });
    assert.equal(request.headers.get("content-length"), null);
    const { response, body, calls } = await run(request);
    assert.equal(response.status, 413);
    assert.deepEqual(body, { ok: false, error: "too_large" });
    assert.equal(calls.length, 0);
  });

  test("accepts a streamed valid multipart body under the cap and reaches Siteverify", async () => {
    const built = new Response(formOf(SUBMITTED));
    const contentType = built.headers.get("content-type");
    const bytes = new Uint8Array(await built.arrayBuffer());
    assert.ok(bytes.length < 65536);
    const request = new Request(URL_, {
      method: "POST",
      headers: { "content-type": contentType },
      body: streamOf(bytes, 512),
      duplex: "half",
    });
    assert.equal(request.headers.get("content-length"), null);
    const { response, body, calls } = await run(request, {
      responses: [
        json(200, { success: true }),
        json(200, { id: "email_fake_id" }),
      ],
    });
    assert.equal(response.status, 200);
    assert.deepEqual(body, { ok: true });
    assert.equal(calls[0].url, SITEVERIFY);
    assert.equal(calls.length, 2);
  });

  test("returns 400 bad_request for a request with no body", async () => {
    const request = new Request(URL_, {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
    });
    const { response, body, calls } = await run(request);
    assert.equal(response.status, 400);
    assert.deepEqual(body, { ok: false, error: "bad_request" });
    assert.equal(calls.length, 0);
  });
});
