import { getRequestIP, getRequestHeader } from "@tanstack/react-start/server";

/**
 * Best-effort caller identity for rate limiting.
 *
 * Prefer platform-set headers (cf-connecting-ip) over client-suppliable
 * x-forwarded-for: a client can send a fresh fake XFF on every request and
 * get a new rate-limit bucket each time, so XFF is only a last-resort
 * fallback.
 */
export function callerIp() {
  const ip =
    getRequestHeader("cf-connecting-ip") ??
    getRequestHeader("x-real-ip") ??
    getRequestIP({ xForwardedFor: true }) ??
    "unknown";
  return String(ip).slice(0, 64);
}

/**
 * Ad-hoc fixed-window rate limit backed by public.rate_limit_events.
 * Server-only: the table has no policies, so it is reachable by the service role alone.
 */
export async function enforceRateLimit(opts: {
  bucket: string;
  identifier: string;
  limit: number;
  windowMinutes: number;
  message?: string;
}) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const since = new Date(Date.now() - opts.windowMinutes * 60_000).toISOString();

  const { count, error } = await supabaseAdmin
    .from("rate_limit_events")
    .select("id", { count: "exact", head: true })
    .eq("bucket", opts.bucket)
    .eq("identifier", opts.identifier)
    .gte("created_at", since);

  if (error) {
    console.error("[rate-limit] count failed", error);
    return; // fail open rather than blocking legitimate traffic
  }

  if ((count ?? 0) >= opts.limit) {
    throw new Error(opts.message ?? "Too many attempts. Please try again later.");
  }

  await supabaseAdmin
    .from("rate_limit_events")
    .insert({ bucket: opts.bucket, identifier: opts.identifier });
}
