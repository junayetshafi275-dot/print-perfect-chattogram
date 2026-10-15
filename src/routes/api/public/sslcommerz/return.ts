import { createFileRoute } from "@tanstack/react-router";

/**
 * Browser return point for SSLCommerz (it POSTs here). Reads only query params,
 * never the body, and never changes payment state — only the IPN does that.
 */
export function returnTarget(url: URL): string {
  const result = url.searchParams.get("result");
  const order = url.searchParams.get("order") ?? "";
  const validOrder = /^[A-Za-z0-9-]{1,32}$/.test(order);
  if (result === "fail") return "/checkout?payment=failed";
  if (result === "cancel") return "/checkout?payment=cancelled";
  if (result === "success" && validOrder) {
    return `/track?order=${encodeURIComponent(order)}&payment=success`;
  }
  return "/track";
}

function redirect(request: Request) {
  const url = new URL(request.url);
  return new Response(null, {
    status: 303,
    headers: { Location: new URL(returnTarget(url), url.origin).toString(), "Cache-Control": "no-store" },
  });
}

export const Route = createFileRoute("/api/public/sslcommerz/return")({
  server: {
    handlers: {
      POST: async ({ request }) => redirect(request),
      GET: async ({ request }) => redirect(request),
    },
  },
});
