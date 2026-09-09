import { log } from "./logging.server";

/**
 * Cloudflare Turnstile verification.
 *
 * Enabled only when TURNSTILE_SECRET_KEY is configured; without it the check is
 * skipped so local development and existing deployments keep working unchanged.
 * When the key IS configured the token is mandatory and verification failures
 * reject the request (fail closed).
 */
export async function verifyCaptcha(token: string | undefined, remoteIp: string) {
  const secret = process.env["TURNSTILE_SECRET_KEY"];
  if (!secret) return; // development / not configured — bypass

  if (!token) {
    throw new Error("Please complete the anti-spam check and try again.");
  }

  try {
    const body = new URLSearchParams({ secret, response: token });
    if (remoteIp && remoteIp !== "unknown") body.set("remoteip", remoteIp);

    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body,
      signal: AbortSignal.timeout(8000),
    });
    const result = (await res.json()) as { success?: boolean; "error-codes"?: string[] };
    if (result.success !== true) {
      log.warn("turnstile", "verification rejected", { codes: result["error-codes"] });
      throw new Error("The anti-spam check didn't pass. Please try again.");
    }
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("The anti-spam")) throw error;
    log.error("turnstile", "verification unavailable", { error });
    throw new Error("We couldn't verify this request right now. Please try again shortly.");
  }
}
