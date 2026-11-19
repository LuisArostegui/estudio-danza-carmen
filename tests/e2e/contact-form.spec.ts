import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page, type Route } from "@playwright/test";
import { waitForRevealsSettled } from "./helpers";

/**
 * Live-mode contact form. The default build runs in test mode (no endpoint),
 * so each test takes the real built /contacto/ HTML and adds the live
 * attributes to the enquiry form. Turnstile and the Worker are stubbed.
 */

const CONTACT_URL = "**/contacto/**";
const API_URL = "**/api/contact";
const TURNSTILE_URL = "https://challenges.cloudflare.com/**";

const TURNSTILE_STUB = `
window.turnstile = {
  render(el) {
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = "cf-turnstile-response";
    input.value = "tok";
    el.appendChild(input);
    return "w1";
  },
  reset() {
    window.__resets = (window.__resets || 0) + 1;
  },
};
`;

// Same as TURNSTILE_STUB, but the widget never writes the token input
// (for example when a content blocker stops the challenge).
const TURNSTILE_STUB_NO_TOKEN = `
window.turnstile = {
  render() {
    return "w1";
  },
  reset() {
    window.__resets = (window.__resets || 0) + 1;
  },
};
`;

type TurnstileMode = "widget" | "no-token" | "blocked";

const TURNSTILE_MISSING_TOKEN_MESSAGE =
  "Todavía no hemos podido verificar el envío. Espera unos segundos e inténtalo de nuevo; si usas un bloqueador de contenido, puede impedir la verificación. También puedes escribirnos por WhatsApp o llamarnos.";

const PHONE_FORMAT_MESSAGE =
  "Usa solo cifras, espacios y los signos + ( ) . -, con al menos 9 cifras.";

const LIVE_ATTRIBUTES =
  'data-endpoint="/api/contact" data-turnstile-sitekey="test-site-key"';

type ApiReply =
  { kind: "json"; status: number; body: unknown } | { kind: "abort" };

async function routeLiveForm(page: Page, mode: TurnstileMode = "widget") {
  await page.route(CONTACT_URL, async (route) => {
    const response = await route.fetch();
    const html = (await response.text()).replace(
      "data-enquiry-form",
      `data-enquiry-form ${LIVE_ATTRIBUTES}`,
    );
    expect(html, "enquiry form marker").toContain(LIVE_ATTRIBUTES);
    await route.fulfill({
      status: 200,
      contentType: "text/html; charset=utf-8",
      body: html,
    });
  });
  await page.route(TURNSTILE_URL, (route) => {
    if (mode === "blocked") return route.abort();
    return route.fulfill({
      status: 200,
      contentType: "application/javascript",
      body: mode === "no-token" ? TURNSTILE_STUB_NO_TOKEN : TURNSTILE_STUB,
    });
  });
}

/** Mocks the Worker. Returns a counter and the captured request bodies. */
async function mockApi(page: Page, reply: ApiReply) {
  const seen = { count: 0, bodies: [] as string[] };
  await page.route(API_URL, async (route: Route) => {
    seen.count += 1;
    seen.bodies.push(route.request().postData() ?? "");
    if (reply.kind === "abort") {
      await route.abort();
      return;
    }
    await route.fulfill({
      status: reply.status,
      contentType: "application/json; charset=utf-8",
      body: JSON.stringify(reply.body),
    });
  });
  return seen;
}

async function openContact(
  page: Page,
  query = "",
  mode: TurnstileMode = "widget",
) {
  await routeLiveForm(page, mode);
  await page.goto(`/contacto/${query}`);
  await expect(page.locator("[data-enquiry-form]")).toHaveAttribute(
    "data-turnstile-sitekey",
    "test-site-key",
  );
  if (mode === "widget") {
    // The stub widget writes the hidden token input into the form.
    await expect(page.locator('[name="cf-turnstile-response"]')).toHaveCount(1);
  }
}

async function fillValidForm(page: Page) {
  await page.locator('[name="nombre"]').fill("Ana Prueba");
  await page.locator('[name="correo"]').fill("ana@example.com");
  await page.locator('[name="telefono"]').fill("600 123 456");
  await page
    .locator('[name="mensaje"]')
    .fill("Me gustaría probar una clase de ballet.");
  await page
    .locator('select[name="actividad"]')
    .selectOption("ballet-para-adultos");
  await page.getByLabel(/He leído y acepto la/).check();
}

async function submit(page: Page) {
  await page.getByRole("button", { name: "Enviar consulta" }).click();
}

async function expectValuesKept(page: Page) {
  await expect(page.locator('[name="nombre"]')).toHaveValue("Ana Prueba");
  await expect(page.locator('[name="correo"]')).toHaveValue("ana@example.com");
  await expect(page.locator('[name="privacidad"]')).toBeChecked();
}

async function expectNoAxeViolations(page: Page) {
  await waitForRevealsSettled(page);
  const results = await new AxeBuilder({ page }).analyze();
  expect(
    results.violations.map((violation) => ({
      id: violation.id,
      impact: violation.impact,
      nodes: violation.nodes.map((node) => node.target),
    })),
  ).toEqual([]);
}

test.describe("live contact form: delivery states", () => {
  test("200 ok shows success, clears the fields and sends the Turnstile token", async ({
    page,
  }) => {
    await openContact(page, "?actividad=ballet-para-adultos");
    const api = await mockApi(page, {
      kind: "json",
      status: 200,
      body: { ok: true },
    });
    await fillValidForm(page);
    await submit(page);

    const status = page.getByTestId("enquiry-status");
    await expect(status).toContainText("Gracias, hemos recibido tu consulta");
    await expect(status).toBeFocused();
    await expect(page.locator('[name="nombre"]')).toHaveValue("");
    await expect(page.locator('[name="correo"]')).toHaveValue("");
    await expect(page.locator('[name="mensaje"]')).toHaveValue("");
    await expect(page.locator('[name="privacidad"]')).not.toBeChecked();
    await expect(
      page.getByRole("button", { name: "Enviar consulta" }),
    ).toBeEnabled();

    expect(api.count).toBe(1);
    expect(api.bodies[0]).toContain("cf-turnstile-response");
    expect(api.bodies[0]).toContain("tok");
    await expectNoAxeViolations(page);
  });

  test("403 verification keeps the values, shows the message and resets Turnstile", async ({
    page,
  }) => {
    await openContact(page);
    await mockApi(page, {
      kind: "json",
      status: 403,
      body: { ok: false, error: "verification" },
    });
    await fillValidForm(page);
    await submit(page);

    await expect(page.getByTestId("enquiry-status")).toContainText(
      "No hemos podido verificar el envío",
    );
    await expectValuesKept(page);
    await expect
      .poll(() =>
        page.evaluate(
          () => (window as Window & { __resets?: number }).__resets ?? 0,
        ),
      )
      .toBeGreaterThanOrEqual(1);
    await expectNoAxeViolations(page);
  });

  test("502 delivery error shows the generic message and keeps the values", async ({
    page,
  }) => {
    await openContact(page);
    await mockApi(page, {
      kind: "json",
      status: 502,
      body: { ok: false, error: "delivery" },
    });
    await fillValidForm(page);
    await submit(page);

    await expect(page.getByTestId("enquiry-status")).toContainText(
      "No hemos podido enviar la consulta",
    );
    await expectValuesKept(page);
  });

  test("429 shows the rate limit message and keeps the values", async ({
    page,
  }) => {
    await openContact(page);
    await mockApi(page, {
      kind: "json",
      status: 429,
      body: { ok: false, error: "rate_limited" },
    });
    await fillValidForm(page);
    await submit(page);

    await expect(page.getByTestId("enquiry-status")).toContainText(
      "Has enviado varias consultas seguidas",
    );
    await expectValuesKept(page);
  });

  test("network failure shows the connection message and keeps the values", async ({
    page,
  }) => {
    await openContact(page);
    await mockApi(page, { kind: "abort" });
    await fillValidForm(page);
    await submit(page);

    await expect(page.getByTestId("enquiry-status")).toContainText(
      "No hemos podido conectar",
    );
    await expectValuesKept(page);
    await expect(
      page.getByRole("button", { name: "Enviar consulta" }),
    ).toBeEnabled();
  });

  test("400 with a server field code marks that field and shows the summary", async ({
    page,
  }) => {
    await openContact(page);
    await mockApi(page, {
      kind: "json",
      status: 400,
      body: { ok: false, error: "validation", fields: { correo: "format" } },
    });
    await fillValidForm(page);
    await submit(page);

    const summary = page.getByTestId("enquiry-errors");
    await expect(summary).toBeVisible();
    await expect(summary).toBeFocused();
    await expect(summary).toContainText("Revisa el correo");
    await expect(page.locator('[name="correo"]')).toHaveAttribute(
      "aria-invalid",
      "true",
    );
    await expect(page.locator('[name="nombre"]')).not.toHaveAttribute(
      "aria-invalid",
      "true",
    );
    await expectValuesKept(page);
    await expectNoAxeViolations(page);
  });
});

test.describe("live contact form: client rules", () => {
  test("empty submit is blocked on the client and sends no request", async ({
    page,
  }) => {
    await openContact(page);
    const api = await mockApi(page, {
      kind: "json",
      status: 200,
      body: { ok: true },
    });
    await submit(page);

    await expect(page.getByTestId("enquiry-errors")).toBeVisible();
    await expect(page.getByTestId("enquiry-errors")).toBeFocused();
    await expect(page.locator('[name="correo"]')).toHaveAttribute(
      "aria-invalid",
      "true",
    );
    await page.waitForTimeout(300);
    expect(api.count).toBe(0);
  });

  test("the honeypot stays hidden from visitors and assistive tech", async ({
    page,
  }) => {
    await openContact(page);
    const honeypot = page.locator('[name="sitio_web"]');
    await expect(honeypot).toHaveAttribute("tabindex", "-1");
    await expect(honeypot).toHaveAttribute("autocomplete", "off");
    const wrapper = honeypot.locator(
      "xpath=ancestor::*[@aria-hidden='true'][1]",
    );
    await expect(wrapper).toHaveCount(1);
  });
});

test.describe("live contact form: Turnstile token missing", () => {
  for (const mode of ["no-token", "blocked"] as const) {
    test(`widget ${mode} sends nothing, keeps the values and explains how to continue`, async ({
      page,
    }) => {
      await openContact(page, "", mode);
      const api = await mockApi(page, {
        kind: "json",
        status: 200,
        body: { ok: true },
      });
      await fillValidForm(page);
      await submit(page);

      const status = page.getByTestId("enquiry-status");
      await expect(status).toContainText(TURNSTILE_MISSING_TOKEN_MESSAGE);
      await expect(status).toBeFocused();
      await expect(
        page.getByRole("button", { name: "Enviar consulta" }),
      ).toBeEnabled();
      await page.waitForTimeout(300);
      expect(api.count).toBe(0);
      await expectValuesKept(page);
      await expectNoAxeViolations(page);
    });
  }
});

test.describe("live contact form: phone message", () => {
  test("an invalid telefono shows the digits-and-symbols message and sends nothing", async ({
    page,
  }) => {
    await openContact(page);
    const api = await mockApi(page, {
      kind: "json",
      status: 200,
      body: { ok: true },
    });
    await fillValidForm(page);
    await page.locator('[name="telefono"]').fill("12345678");
    await submit(page);

    await expect(
      page.locator('[data-error-for="telefono"] [data-error-text]'),
    ).toHaveText(PHONE_FORMAT_MESSAGE);
    await page.waitForTimeout(300);
    expect(api.count).toBe(0);
  });
});

test.describe("enquiry status region spacing", () => {
  test("an empty status region adds no space below the form", async ({
    page,
  }) => {
    await page.goto("/contacto/");
    const form = (await page.getByTestId("enquiry-form").boundingBox())!;
    const preview = (await page.getByTestId("enquiry-preview").boundingBox())!;
    // The preview is the last visible item; the form must end right after it.
    expect(form.y + form.height - (preview.y + preview.height)).toBeLessThan(1);
    // The region stays in the accessibility tree while it is empty.
    await expect(page.getByTestId("enquiry-status")).toBeAttached();
  });
});

test.describe("live contact form without JavaScript", () => {
  test.use({ javaScriptEnabled: false });

  test("the noscript fallback points to the existing WhatsApp and phone details", async ({
    page,
  }) => {
    await page.goto("/contacto/");
    await expect(page.locator("[data-enquiry-noscript]")).toContainText(
      "JavaScript",
    );
    await expect(
      page.locator("[data-enquiry-noscript] a[href='tel:+34958961504']"),
    ).toHaveCount(1);
    await expect(
      page.locator(
        "[data-enquiry-noscript] a[href='https://wa.me/34653424880']",
      ),
    ).toHaveCount(1);
  });
});
