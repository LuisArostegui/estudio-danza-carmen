// Contact endpoint: validates a submission, checks Turnstile, sends via Resend.
// Logs carry only an event name and status. Never log submitted values,
// email addresses, IPs or secrets.

import { TURNSTILE_FIELD, validateContact } from "../lib/contact-validation.js";

// Cap on the bytes actually read, checked whether or not Content-Length is
// declared. Field limits still bound the stored values.
const MAX_BODY_BYTES = 65536;
// Upper bound for each upstream call so a stalled service cannot hold the
// request open. A timeout surfaces as the existing 502 unavailable/delivery.
const UPSTREAM_TIMEOUT_MS = 8000;
const SITEVERIFY_URL =
  "https://challenges.cloudflare.com/turnstile/v0/siteverify";
const RESEND_URL = "https://api.resend.com/emails";
const REQUIRED_ENV = [
  "CONTACT_TO_EMAIL",
  "CONTACT_FROM_EMAIL",
  "RESEND_API_KEY",
  "TURNSTILE_SECRET_KEY",
];

/**
 * @typedef {object} ContactDeps
 * @property {typeof fetch} fetch
 * @property {{ error: (message: string) => void, warn: (message: string) => void }} log
 */

/**
 * @param {number} status
 * @param {Record<string, unknown>} body
 * @param {Record<string, string>} [headers]
 * @returns {Response}
 */
function json(status, body, headers = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      ...headers,
    },
  });
}

/**
 * @param {ContactDeps} deps
 * @param {number} status
 * @param {string} error
 * @param {Record<string, unknown>} [extra]
 * @returns {Response}
 */
function fail(deps, status, error, extra = {}, headers = {}) {
  if (status >= 500) {
    deps.log.error(JSON.stringify({ event: `contact_${error}`, status }));
  }
  return json(status, { ok: false, error, ...extra }, headers);
}

/**
 * @param {string} subject
 * @returns {string}
 */
function stripLineBreaks(subject) {
  return subject.replace(/[\r\n]/g, "");
}

/**
 * @param {import("../lib/contact-validation.js").ContactData} data
 * @returns {string}
 */
function plainTextBody(data) {
  return [
    `Nombre: ${data.nombre}`,
    `Correo: ${data.correo}`,
    `Teléfono: ${data.telefono || "—"}`,
    `Actividad: ${data.actividad}`,
    "Mensaje:",
    data.mensaje,
  ].join("\n");
}

/**
 * Reads the body while counting bytes, so the cap holds even when the
 * Content-Length header is missing or wrong.
 * @param {Request} request
 * @returns {Promise<Uint8Array | "too_large">}
 * @throws {Error} when the body is missing or cannot be read
 */
async function readCappedBody(request) {
  if (request.body === null) throw new Error("no body");
  const reader = request.body.getReader();
  const chunks = [];
  let total = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > MAX_BODY_BYTES) {
      await reader.cancel();
      return "too_large";
    }
    chunks.push(value);
  }
  const bytes = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return bytes;
}

/**
 * @param {Request} request
 * @param {Record<string, any>} env
 * @param {ContactDeps} deps
 * @returns {Promise<Response>}
 */
export async function handleContact(request, env, deps) {
  if (request.method !== "POST") {
    return json(405, { ok: false, error: "method" }, { Allow: "POST" });
  }

  const contentType = (request.headers.get("content-type") ?? "")
    .trim()
    .toLowerCase();
  if (
    !contentType.startsWith("multipart/form-data") &&
    !contentType.startsWith("application/x-www-form-urlencoded")
  ) {
    return json(415, { ok: false, error: "content_type" });
  }

  const declaredLength = request.headers.get("content-length");
  if (declaredLength !== null && Number(declaredLength) > MAX_BODY_BYTES) {
    return json(413, { ok: false, error: "too_large" });
  }

  if (REQUIRED_ENV.some((key) => !env[key])) {
    return fail(deps, 503, "not_configured");
  }

  if (env.CONTACT_RATE_LIMITER) {
    const { success } = await env.CONTACT_RATE_LIMITER.limit({
      key: request.headers.get("CF-Connecting-IP") ?? "unknown",
    });
    if (!success) {
      return json(
        429,
        { ok: false, error: "rate_limited" },
        { "Retry-After": "60" },
      );
    }
  }

  let bytes;
  try {
    bytes = await readCappedBody(request);
  } catch {
    return json(400, { ok: false, error: "bad_request" });
  }
  if (bytes === "too_large") {
    return json(413, { ok: false, error: "too_large" });
  }

  let formData;
  try {
    // Parse the bytes we actually read, so a missing or wrong Content-Length
    // cannot bypass the cap. A failed parse is a bad request.
    formData = await new Response(bytes, {
      headers: { "content-type": request.headers.get("content-type") ?? "" },
    }).formData();
  } catch {
    return json(400, { ok: false, error: "bad_request" });
  }

  const result = validateContact([...formData.entries()]);
  if (!result.ok) {
    if (result.reason === "validation") {
      return json(400, {
        ok: false,
        error: "validation",
        fields: result.fields,
      });
    }
    if (result.reason === "honeypot") {
      return json(403, { ok: false, error: "verification" });
    }
    return json(400, { ok: false, error: "bad_request" });
  }

  const token = formData.get(TURNSTILE_FIELD);
  if (typeof token !== "string" || token.trim() === "") {
    return json(403, { ok: false, error: "verification" });
  }

  const clientIp = request.headers.get("CF-Connecting-IP");
  const verifyBody = new URLSearchParams({
    secret: env.TURNSTILE_SECRET_KEY,
    response: token,
  });
  if (clientIp) verifyBody.set("remoteip", clientIp);

  let verdict;
  try {
    const siteverify = await deps.fetch(SITEVERIFY_URL, {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: verifyBody,
      signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
    });
    if (!siteverify.ok) {
      return fail(deps, 502, "unavailable");
    }
    verdict = await siteverify.json();
  } catch {
    return fail(deps, 502, "unavailable");
  }

  if (verdict?.success !== true) {
    return json(403, { ok: false, error: "verification" });
  }

  const { data } = result;
  try {
    const delivery = await deps.fetch(RESEND_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        from: env.CONTACT_FROM_EMAIL,
        to: [env.CONTACT_TO_EMAIL],
        reply_to: data.correo,
        subject: stripLineBreaks(`Nueva consulta web: ${data.nombre}`),
        text: plainTextBody(data),
      }),
      signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
    });
    if (!delivery.ok) {
      return fail(deps, 502, "delivery");
    }
  } catch {
    return fail(deps, 502, "delivery");
  }

  return json(200, { ok: true });
}
