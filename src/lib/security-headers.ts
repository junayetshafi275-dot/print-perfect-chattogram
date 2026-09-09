/**
 * Security response headers.
 *
 * Applied by a request middleware to every server response (documents, server
 * function responses, API routes). Values are deliberately compatible with the
 * existing assets: bundled JS/CSS, Google-hosted fonts, Supabase requests and
 * the Lovable editor preview frame all keep working.
 */

function supabaseOrigin() {
  const url = process.env["SUPABASE_URL"];
  if (!url) return "";
  try {
    return new URL(url).origin;
  } catch {
    return "";
  }
}

const LOVABLE_FRAME_ANCESTORS = [
  "'self'",
  "https://lovable.dev",
  "https://*.lovable.dev",
  "https://*.lovable.app",
  "https://*.lovableproject.com",
];

export function buildCsp(isDev: boolean) {
  const supabase = supabaseOrigin();
  const connect = [
    "'self'",
    supabase,
    supabase ? supabase.replace("https://", "wss://") : "",
    "https://challenges.cloudflare.com",
    isDev ? "ws:" : "",
    isDev ? "http://localhost:*" : "",
  ].filter(Boolean);

  return [
    "default-src 'self'",
    // The framework streams hydration state in inline <script> tags, so inline
    // scripts cannot be forbidden outright without breaking SSR. Everything
    // else is locked to our own origin: no third-party script hosts, and
    // 'unsafe-eval' is refused outside dev.
    `script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com${isDev ? " 'unsafe-eval'" : ""}`,
    // Tailwind/Framer Motion write inline styles at runtime.
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' data: https://fonts.gstatic.com",
    "img-src 'self' data: blob: https:",
    `connect-src ${connect.join(" ")}`,
    "frame-src 'self' https://challenges.cloudflare.com https://sandbox.sslcommerz.com https://securepay.sslcommerz.com",
    "form-action 'self' https://sandbox.sslcommerz.com https://securepay.sslcommerz.com",
    "object-src 'none'",
    "base-uri 'self'",
    `frame-ancestors ${LOVABLE_FRAME_ANCESTORS.join(" ")}`,
    "upgrade-insecure-requests",
  ].join("; ");
}

/** The editor preview embeds the app, so XFO is only safe on real domains. */
export function shouldSetFrameOptions(host: string) {
  return !/(^|\.)(lovable\.dev|lovable\.app|lovableproject\.com)$/i.test(host.split(":")[0] ?? "");
}

export function securityHeaders(opts: { host: string; isDev: boolean }): Record<string, string> {
  const headers: Record<string, string> = {
    "content-security-policy": buildCsp(opts.isDev),
    "x-content-type-options": "nosniff",
    "referrer-policy": "strict-origin-when-cross-origin",
    "permissions-policy":
      "camera=(), microphone=(), geolocation=(), payment=(), usb=(), magnetometer=(), accelerometer=()",
    "cross-origin-opener-policy": "same-origin",
    "x-dns-prefetch-control": "off",
  };

  if (!opts.isDev) {
    headers["strict-transport-security"] = "max-age=31536000; includeSubDomains; preload";
  }
  if (shouldSetFrameOptions(opts.host)) {
    headers["x-frame-options"] = "SAMEORIGIN";
  }

  return headers;
}
