import { describe, test } from "node:test";
import assert from "node:assert/strict";

import {
  ALLOWED_FIELDS,
  EMAIL_PATTERN,
  HONEYPOT_FIELD,
  LIMITS,
  TURNSTILE_FIELD,
  validateContact,
  validateFields,
} from "../../src/lib/contact-validation.js";

const VALID = {
  nombre: "Ana Prueba",
  correo: "ana@example.test",
  telefono: "600 123 456",
  actividad: "ballet-adultos",
  mensaje: "Quiero información sobre las clases.",
  privacidad: "on",
  sitio_web: "",
  "cf-turnstile-response": "token",
};

function withField(overrides) {
  return { ...VALID, ...overrides };
}

describe("constants", () => {
  test("exposes the agreed limits, field names and email pattern", () => {
    assert.deepEqual(LIMITS, {
      nombre: { min: 1, max: 100 },
      correo: { max: 254 },
      telefono: { max: 30, minDigits: 9 },
      actividad: { max: 80 },
      mensaje: { min: 10, max: 5000 },
    });
    assert.equal(HONEYPOT_FIELD, "sitio_web");
    assert.equal(TURNSTILE_FIELD, "cf-turnstile-response");
    assert.deepEqual([...ALLOWED_FIELDS].sort(), [
      "actividad",
      "cf-turnstile-response",
      "correo",
      "mensaje",
      "nombre",
      "privacidad",
      "sitio_web",
      "telefono",
    ]);
    assert.equal(EMAIL_PATTERN.test("ana@example.test"), true);
    assert.equal(EMAIL_PATTERN.test("ana example.test"), false);
  });
});

describe("line break normalisation", () => {
  test("counts CRLF as one character, so 5000 LF-counted characters pass", () => {
    const mensaje = "a".repeat(2475) + "\r\n".repeat(50) + "a".repeat(2475);
    assert.equal(mensaje.length, 5050);
    assert.deepEqual(validateFields(withField({ mensaje })), {});
  });

  test("returns mensaje with LF line breaks only", () => {
    const mensaje = "Primera línea.\r\nSegunda línea del mensaje.";
    const result = validateContact(Object.entries(withField({ mensaje })));
    assert.equal(result.ok, true);
    assert.equal(
      result.data.mensaje,
      "Primera línea.\nSegunda línea del mensaje.",
    );
  });

  test("normalises CRLF in every text field", () => {
    const result = validateContact(
      Object.entries(withField({ nombre: "Ana\r\nPrueba" })),
    );
    assert.equal(result.ok, true);
    assert.equal(result.data.nombre, "Ana\nPrueba");
  });
});

describe("validateFields", () => {
  test("accepts a complete valid submission", () => {
    assert.deepEqual(validateFields(VALID), {});
  });

  test("treats phone as optional", () => {
    assert.deepEqual(validateFields(withField({ telefono: "" })), {});
    assert.deepEqual(validateFields(withField({ telefono: undefined })), {});
  });

  test("nombre is required and limited to 100 characters", () => {
    assert.deepEqual(validateFields(withField({ nombre: "" })), {
      nombre: "required",
    });
    assert.deepEqual(validateFields(withField({ nombre: "   " })), {
      nombre: "required",
    });
    assert.deepEqual(
      validateFields(withField({ nombre: "a".repeat(100) })),
      {},
    );
    assert.deepEqual(validateFields(withField({ nombre: "a".repeat(101) })), {
      nombre: "too_long",
    });
  });

  test("correo is required, limited to 254 characters and must match EMAIL_PATTERN", () => {
    assert.deepEqual(validateFields(withField({ correo: "" })), {
      correo: "required",
    });
    assert.deepEqual(
      validateFields(withField({ correo: "ana.example.test" })),
      {
        correo: "format",
      },
    );
    const longLocal = `${"a".repeat(250)}@x.test`;
    assert.equal(longLocal.length > 254, true);
    assert.deepEqual(validateFields(withField({ correo: longLocal })), {
      correo: "too_long",
    });
  });

  test("telefono accepts only digits, spaces, plus, parentheses, dots and hyphens", () => {
    assert.deepEqual(
      validateFields(withField({ telefono: "+34 (600) 123-456" })),
      {},
    );
    assert.deepEqual(
      validateFields(withField({ telefono: "600.123.456" })),
      {},
    );
    assert.deepEqual(validateFields(withField({ telefono: "600abc12345" })), {
      telefono: "format",
    });
  });

  test("telefono needs at least 9 digits", () => {
    assert.deepEqual(validateFields(withField({ telefono: "12345678" })), {
      telefono: "format",
    });
    assert.deepEqual(
      validateFields(withField({ telefono: "+34 600 12 34 5" })),
      {},
    );
  });

  test("telefono is limited to 30 characters", () => {
    assert.deepEqual(validateFields(withField({ telefono: "1".repeat(31) })), {
      telefono: "too_long",
    });
  });

  test("actividad is required and must be a lowercase slug", () => {
    assert.deepEqual(validateFields(withField({ actividad: "" })), {
      actividad: "required",
    });
    assert.deepEqual(
      validateFields(withField({ actividad: "Ballet Adultos" })),
      {
        actividad: "format",
      },
    );
    assert.deepEqual(
      validateFields(withField({ actividad: "ballet_adultos" })),
      {
        actividad: "format",
      },
    );
    assert.deepEqual(
      validateFields(withField({ actividad: "a".repeat(80) })),
      {},
    );
    assert.deepEqual(validateFields(withField({ actividad: "a".repeat(81) })), {
      actividad: "too_long",
    });
  });

  test("mensaje is required, at least 10 characters and at most 5000", () => {
    assert.deepEqual(validateFields(withField({ mensaje: "" })), {
      mensaje: "required",
    });
    assert.deepEqual(validateFields(withField({ mensaje: "123456789" })), {
      mensaje: "too_short",
    });
    assert.deepEqual(validateFields(withField({ mensaje: "1234567890" })), {});
    assert.deepEqual(
      validateFields(withField({ mensaje: "m".repeat(5000) })),
      {},
    );
    assert.deepEqual(validateFields(withField({ mensaje: "m".repeat(5001) })), {
      mensaje: "too_long",
    });
  });

  test("privacidad must be accepted (value on)", () => {
    assert.deepEqual(validateFields(withField({ privacidad: "" })), {
      privacidad: "required",
    });
    assert.deepEqual(validateFields(withField({ privacidad: "off" })), {
      privacidad: "required",
    });
    assert.deepEqual(validateFields(withField({ privacidad: undefined })), {
      privacidad: "required",
    });
  });

  test("reports every failing field at once", () => {
    assert.deepEqual(validateFields({ privacidad: "" }), {
      nombre: "required",
      correo: "required",
      actividad: "required",
      mensaje: "required",
      privacidad: "required",
    });
  });

  test("trims surrounding whitespace before checking", () => {
    assert.deepEqual(validateFields(withField({ nombre: "  Ana  " })), {});
    assert.deepEqual(
      validateFields(withField({ correo: "  ana@example.test  " })),
      {},
    );
    assert.deepEqual(validateFields(withField({ mensaje: "   corto    " })), {
      mensaje: "too_short",
    });
    assert.deepEqual(
      validateFields(withField({ mensaje: "   diez chars!   " })),
      {},
    );
  });
});

describe("validateContact", () => {
  function entriesOf(record) {
    return Object.entries(record);
  }

  test("returns trimmed data for a valid submission", () => {
    const result = validateContact(
      entriesOf(
        withField({
          nombre: "  Ana Prueba ",
          correo: " ana@example.test ",
          telefono: " 600 123 456 ",
          actividad: "ballet-adultos",
          mensaje: "  Quiero información sobre las clases.  ",
        }),
      ),
    );
    assert.deepEqual(result, {
      ok: true,
      data: {
        nombre: "Ana Prueba",
        correo: "ana@example.test",
        telefono: "600 123 456",
        actividad: "ballet-adultos",
        mensaje: "Quiero información sobre las clases.",
      },
    });
  });

  test("returns an empty telefono when the optional phone is omitted", () => {
    const { telefono: _omit, ...rest } = VALID;
    const result = validateContact(entriesOf(rest));
    assert.equal(result.ok, true);
    assert.equal(result.data.telefono, "");
  });

  test("rejects unknown fields", () => {
    assert.deepEqual(validateContact([...entriesOf(VALID), ["admin", "1"]]), {
      ok: false,
      reason: "unknown_field",
    });
  });

  test("rejects a repeated field as duplicate", () => {
    assert.deepEqual(
      validateContact([...entriesOf(VALID), ["nombre", "Otra Persona"]]),
      { ok: false, reason: "duplicate" },
    );
  });

  test("rejects non-string values such as files", () => {
    const file = new File(["hola"], "foto.png", { type: "image/png" });
    assert.deepEqual(validateContact([...entriesOf(VALID), ["nombre", file]]), {
      ok: false,
      reason: "not_text",
    });
  });

  test("reports honeypot when sitio_web is filled", () => {
    assert.deepEqual(
      validateContact(
        entriesOf(withField({ sitio_web: "https://spam.example.test" })),
      ),
      { ok: false, reason: "honeypot" },
    );
  });

  test("ignores an empty or whitespace-only honeypot", () => {
    assert.equal(
      validateContact(entriesOf(withField({ sitio_web: "" }))).ok,
      true,
    );
    assert.equal(
      validateContact(entriesOf(withField({ sitio_web: "   " }))).ok,
      true,
    );
  });

  test("reports field problems with the failing field map", () => {
    assert.deepEqual(
      validateContact(entriesOf(withField({ correo: "nope", privacidad: "" }))),
      {
        ok: false,
        reason: "validation",
        fields: { correo: "format", privacidad: "required" },
      },
    );
  });

  test("checks unknown, duplicate and non-text before honeypot and fields", () => {
    assert.deepEqual(
      validateContact([
        ...entriesOf(withField({ sitio_web: "x", nombre: "" })),
        ["extra", "1"],
      ]),
      { ok: false, reason: "unknown_field" },
    );
    assert.deepEqual(
      validateContact([
        ...entriesOf(withField({ sitio_web: "x" })),
        ["correo", "dup@example.test"],
      ]),
      { ok: false, reason: "duplicate" },
    );
    assert.deepEqual(
      validateContact([
        ...entriesOf(withField({ sitio_web: "x" })),
        ["telefono", new Blob(["a"])],
      ]),
      { ok: false, reason: "not_text" },
    );
  });

  test("checks honeypot before field validation", () => {
    assert.deepEqual(
      validateContact(entriesOf(withField({ sitio_web: "x", nombre: "" }))),
      { ok: false, reason: "honeypot" },
    );
  });
});
