import { createStart, createMiddleware } from "@tanstack/react-start";

import { renderErrorPage } from "./lib/error-page";
import { securityHeaders } from "./lib/security-headers";
import { attachSupabaseAuth } from "@/integrations/supabase/auth-attacher";

/** Adds hardening headers (CSP, HSTS, XFO, Referrer/Permissions policy) to every response. */
const securityHeadersMiddleware = createMiddleware().server(async ({ next, request }) => {
  const response = await next();
  const host = request.headers.get("host") ?? "";
  const isDev = process.env["NODE_ENV"] !== "production";
  const headers = securityHeaders({ host, isDev });

  const target = (response as unknown as { response?: Response }).response ?? response;
  const sink = (target as Response).headers;
  if (sink && typeof sink.set === "function") {
    for (const [key, value] of Object.entries(headers)) sink.set(key, value);
  }
  return response;
});

const errorMiddleware = createMiddleware().server(async ({ next }) => {
  try {
    return await next();
  } catch (error) {
    if (error != null && typeof error === "object" && "statusCode" in error) {
      throw error;
    }
    // Detailed diagnostics stay server-side; the client only gets a generic page.
    console.error(error);
    return new Response(renderErrorPage(), {
      status: 500,
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  }
});

export const startInstance = createStart(() => ({
  functionMiddleware: [attachSupabaseAuth],
  requestMiddleware: [securityHeadersMiddleware, errorMiddleware],
}));
