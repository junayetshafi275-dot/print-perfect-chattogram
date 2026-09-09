import { getRequestIP, getRequestHeader } from "@tanstack/react-start/server";
import { log, maskIdentifier } from "./logging.server";

/**
 * Best-effort caller identity for rate limiting.
 *
 * Prefer platform-set headers (cf-connecting-ip) over client-suppliable
 * x-forwarded-for: a client can send a fresh fake XFF on every request and
 * get a new rate-limit bucket each time, so XFF is only a last-resort
 * fallback.
 *
 * IPv6 addresses are collapsed to their /64 prefix — a single subscriber is
 * routinely handed a whole /64, so limiting per full address is trivially
 * bypassed by rotating the host part.
 */
export function callerIp() {
  const raw =
    getRequestHeader("cf-connecting-ip") ??
    getRequestHeader("x-real-ip") ??
    getRequestIP({ xForwardedFor: true }) ??
    "unknown";
  return normalizeIp(String(raw).trim().slice(0, 64));
}

export function normalizeIp(ip: string) {
  if (!ip.includes(":")) return ip;
  const groups = ip.split("%")[0]!.split(":");
  if (groups.length < 4) return ip;
  return `${groups.slice(0, 4).join(":")}::/64`;
}

/** Digits-only, last 11 digits — matches the generated column used on orders. */
export function normalizePhone(phone: string) {
  return String(phone).replace(/[^0-9]/g, "").slice(-11);
}

export type RateLimitRule = {
  bucket: string;
  identifier: string;
  limit: number;
  windowMinutes: number;
};

/** Central, configurable limits so every endpoint reads from one place. */
export const RATE_LIMITS = {
  contactIp: { bucket: "contact:ip", limit: 5, windowMinutes: 60 },
  contactPhone: { bucket: "contact:phone", limit: 3, windowMinutes: 60 },
  trackIp: { bucket: "track:ip", limit: 20, windowMinutes: 15 },
  trackPhone: { bucket: "track:phone", limit: 10, windowMinutes: 15 },
  checkoutIp: { bucket: "checkout:ip", limit: 10, windowMinutes: 60 },
  checkoutPhone: { bucket: "checkout:phone", limit: 5, windowMinutes: 60 },
} as const satisfies Record<string, Omit<RateLimitRule, "identifier">>;

export class RateLimitError extends Error {}

/**
 * Fixed-window rate limit backed by public.rate_limit_events.
 *
 * Counting and recording happen inside the `consume_rate_limit` database
 * function, which takes a transaction-scoped advisory lock on the
 * bucket+identifier pair. That makes the check atomic, so two concurrent
 * requests can no longer both observe a below-limit count and both proceed.
 * The same function prunes expired rows, so the table cleans itself up.
 *
 * FAILS CLOSED: if the limiter cannot reach its storage we reject the request
 * rather than waving unlimited traffic through.
 */
export async function enforceRateLimit(
  rule: RateLimitRule,
  message = "Too many attempts. Please try again later.",
) {
  if (!rule.identifier) {
    throw new RateLimitError(message);
  }

  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  let allowed: boolean | null = null;
  try {
    const { data, error } = await supabaseAdmin.rpc("consume_rate_limit", {
      _bucket: rule.bucket,
      _identifier: rule.identifier,
      _limit: rule.limit,
      _window_minutes: rule.windowMinutes,
    });
    if (error) throw error;
    allowed = data as boolean;
  } catch (error) {
    log.error("rate-limit", "limiter storage unavailable — failing closed", {
      bucket: rule.bucket,
      error,
    });
    throw new RateLimitError(
      "We can't verify this request right now. Please try again in a moment, or call the press room.",
    );
  }

  if (!allowed) {
    log.warn("rate-limit", "request throttled", {
      bucket: rule.bucket,
      identifier: maskIdentifier(rule.identifier),
    });
    throw new RateLimitError(message);
  }
}

/**
 * Applies an IP limit and a normalized-phone limit together. The phone limit
 * survives proxy/IPv6 rotation because it keys on the value the abuser must
 * keep constant to be useful.
 */
export async function enforceIpAndPhoneLimit(opts: {
  ip: { bucket: string; limit: number; windowMinutes: number };
  phone: { bucket: string; limit: number; windowMinutes: number };
  phoneValue: string;
  message: string;
}) {
  await enforceRateLimit({ ...opts.ip, identifier: callerIp() }, opts.message);
  const phone = normalizePhone(opts.phoneValue);
  if (phone.length >= 6) {
    await enforceRateLimit({ ...opts.phone, identifier: phone }, opts.message);
  }
}
