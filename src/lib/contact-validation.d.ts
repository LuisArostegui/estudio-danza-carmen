export type FieldError = "required" | "format" | "too_long" | "too_short";

export type FieldErrors = Record<string, FieldError>;

export interface ContactData {
  nombre: string;
  correo: string;
  telefono: string;
  actividad: string;
  mensaje: string;
}

export type ContactResult =
  | { ok: true; data: ContactData }
  | {
      ok: false;
      reason: "unknown_field" | "duplicate" | "not_text" | "honeypot";
    }
  | { ok: false; reason: "validation"; fields: FieldErrors };

export declare const LIMITS: {
  readonly nombre: { readonly min: 1; readonly max: 100 };
  readonly correo: { readonly max: 254 };
  readonly telefono: { readonly max: 30; readonly minDigits: 9 };
  readonly actividad: { readonly max: 80 };
  readonly mensaje: { readonly min: 10; readonly max: 5000 };
};

export declare const EMAIL_PATTERN: RegExp;
export declare const HONEYPOT_FIELD: "sitio_web";
export declare const TURNSTILE_FIELD: "cf-turnstile-response";
export declare const ALLOWED_FIELDS: readonly string[];

export declare function validateFields(
  values: Record<string, string | undefined>,
): FieldErrors;

export declare function validateContact(
  entries: Array<[string, unknown]>,
): ContactResult;
