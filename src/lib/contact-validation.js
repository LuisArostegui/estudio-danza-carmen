// Pure contact form validation shared by the Worker endpoint.
// No DOM or Node APIs: this module only inspects plain strings.

/** @typedef {"required" | "format" | "too_long" | "too_short"} FieldError */
/** @typedef {Record<string, FieldError>} FieldErrors */
/**
 * @typedef {{ ok: true, data: ContactData }
 *   | { ok: false, reason: "unknown_field" | "duplicate" | "not_text" | "honeypot" }
 *   | { ok: false, reason: "validation", fields: FieldErrors }} ContactResult
 */
/**
 * @typedef {object} ContactData
 * @property {string} nombre
 * @property {string} correo
 * @property {string} telefono
 * @property {string} actividad
 * @property {string} mensaje
 */

export const LIMITS = {
  nombre: { min: 1, max: 100 },
  correo: { max: 254 },
  telefono: { max: 30, minDigits: 9 },
  actividad: { max: 80 },
  mensaje: { min: 10, max: 5000 },
};

// Same pattern the client uses in EnquiryForm.astro.
export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const HONEYPOT_FIELD = "sitio_web";
export const TURNSTILE_FIELD = "cf-turnstile-response";

export const ALLOWED_FIELDS = [
  "nombre",
  "correo",
  "telefono",
  "actividad",
  "mensaje",
  "privacidad",
  HONEYPOT_FIELD,
  TURNSTILE_FIELD,
];

const PHONE_CHARS = /^[0-9 +().-]*$/;
const ACTIVITY_SLUG = /^[a-z0-9-]{1,80}$/;

/**
 * Trims a text value. CRLF becomes LF first, so each line break counts as one
 * character in the length limits and in the stored data.
 *
 * @param {unknown} value
 * @returns {string}
 */
function text(value) {
  return typeof value === "string" ? value.replace(/\r\n/g, "\n").trim() : "";
}

/**
 * Validates the business fields of a submission.
 *
 * @param {Record<string, string | undefined>} values
 * @returns {FieldErrors}
 */
export function validateFields(values) {
  /** @type {FieldErrors} */
  const errors = {};

  const nombre = text(values.nombre);
  if (nombre.length < LIMITS.nombre.min) {
    errors.nombre = "required";
  } else if (nombre.length > LIMITS.nombre.max) {
    errors.nombre = "too_long";
  }

  const correo = text(values.correo);
  if (correo.length === 0) {
    errors.correo = "required";
  } else if (correo.length > LIMITS.correo.max) {
    errors.correo = "too_long";
  } else if (!EMAIL_PATTERN.test(correo)) {
    errors.correo = "format";
  }

  const telefono = text(values.telefono);
  if (telefono.length > 0) {
    if (telefono.length > LIMITS.telefono.max) {
      errors.telefono = "too_long";
    } else if (!PHONE_CHARS.test(telefono)) {
      errors.telefono = "format";
    } else if (telefono.replace(/\D/g, "").length < LIMITS.telefono.minDigits) {
      errors.telefono = "format";
    }
  }

  const actividad = text(values.actividad);
  if (actividad.length === 0) {
    errors.actividad = "required";
  } else if (actividad.length > LIMITS.actividad.max) {
    errors.actividad = "too_long";
  } else if (!ACTIVITY_SLUG.test(actividad)) {
    errors.actividad = "format";
  }

  const mensaje = text(values.mensaje);
  if (mensaje.length === 0) {
    errors.mensaje = "required";
  } else if (mensaje.length < LIMITS.mensaje.min) {
    errors.mensaje = "too_short";
  } else if (mensaje.length > LIMITS.mensaje.max) {
    errors.mensaje = "too_long";
  }

  if (text(values.privacidad) !== "on") {
    errors.privacidad = "required";
  }

  return errors;
}

/**
 * Checks a FormData-style entry list end to end.
 *
 * Order: not_text / unknown_field / duplicate, then honeypot, then fields.
 *
 * @param {Array<[string, unknown]>} entries
 * @returns {ContactResult}
 */
export function validateContact(entries) {
  /** @type {Record<string, string>} */
  const values = {};
  const seen = new Set();

  for (const [key, value] of entries) {
    if (typeof value !== "string") {
      return { ok: false, reason: "not_text" };
    }
    if (!ALLOWED_FIELDS.includes(key)) {
      return { ok: false, reason: "unknown_field" };
    }
    if (seen.has(key)) {
      return { ok: false, reason: "duplicate" };
    }
    seen.add(key);
    values[key] = value;
  }

  if (text(values[HONEYPOT_FIELD]).length > 0) {
    return { ok: false, reason: "honeypot" };
  }

  const fields = validateFields(values);
  if (Object.keys(fields).length > 0) {
    return { ok: false, reason: "validation", fields };
  }

  return {
    ok: true,
    data: {
      nombre: text(values.nombre),
      correo: text(values.correo),
      telefono: text(values.telefono),
      actividad: text(values.actividad),
      mensaje: text(values.mensaje),
    },
  };
}
