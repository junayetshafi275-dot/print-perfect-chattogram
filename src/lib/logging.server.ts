/**
 * Structured, redacting server logger.
 *
 * Every server-side log goes through here so customer PII (phone numbers,
 * addresses, emails, card/transaction identifiers) and any secret-looking
 * value never reaches the log stream. Logs are emitted as single-line JSON so
 * they stay greppable.
 */

const SECRET_KEY_PATTERN =
  /(pass|password|secret|token|key|authorization|auth|cookie|jwt|signature|sign_key|store_passwd|apikey)/i;

const PII_KEY_PATTERN =
  /(phone|mobile|address|email|customer_name|card|cus_|ship_|bank|account|tran_id|transaction|val_id)/i;

const EMAIL_RE = /[\w.+-]+@[\w-]+\.[\w.-]+/g;
const LONG_DIGITS_RE = /\b\d{6,}\b/g;

function maskEmail(value: string) {
  return value.replace(EMAIL_RE, (email) => {
    const [user = "", domain = ""] = email.split("@");
    return `${user.slice(0, 1)}***@${domain}`;
  });
}

/** Keeps just enough of an identifier to correlate records, never enough to identify a person. */
export function maskIdentifier(value: string) {
  const trimmed = String(value);
  if (trimmed.length <= 4) return "***";
  return `***${trimmed.slice(-4)}`;
}

function redactString(value: string) {
  return maskEmail(value).replace(LONG_DIGITS_RE, (digits) => `***${digits.slice(-2)}`);
}

function redactValue(value: unknown, depth = 0): unknown {
  if (value == null) return value;
  if (typeof value === "string") return redactString(value);
  if (typeof value === "number" || typeof value === "boolean") return value;
  if (depth >= 4) return "[truncated]";
  if (Array.isArray(value)) return value.slice(0, 20).map((v) => redactValue(v, depth + 1));
  if (value instanceof Error) {
    return { name: value.name, message: redactString(value.message), stack: value.stack };
  }
  if (typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
      if (SECRET_KEY_PATTERN.test(key)) {
        out[key] = "[redacted]";
      } else if (PII_KEY_PATTERN.test(key)) {
        out[key] = typeof val === "string" ? maskIdentifier(val) : "[redacted]";
      } else {
        out[key] = redactValue(val, depth + 1);
      }
    }
    return out;
  }
  return "[unserialisable]";
}

type Fields = Record<string, unknown>;

function emit(level: "info" | "warn" | "error", scope: string, message: string, fields?: Fields) {
  const line = JSON.stringify({
    level,
    scope,
    message,
    at: new Date().toISOString(),
    ...(fields ? (redactValue(fields) as Fields) : {}),
  });
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.info(line);
}

export const log = {
  info: (scope: string, message: string, fields?: Fields) => emit("info", scope, message, fields),
  warn: (scope: string, message: string, fields?: Fields) => emit("warn", scope, message, fields),
  error: (scope: string, message: string, fields?: Fields) => emit("error", scope, message, fields),
};

/** Exposed for tests. */
export const __redactForTest = (value: unknown) => redactValue(value);
