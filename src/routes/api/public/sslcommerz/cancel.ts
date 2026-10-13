import { createFileRoute } from "@tanstack/react-router";

async function handleReturn(request: Request) {
  const target = new URL("/checkout", request.url);
  target.searchParams.set("payment", "cancelled");
  let orderNumber = new URL(request.url).searchParams.get("tran_id") ?? new URL(request.url).searchParams.get("order");

  if (request.method === "POST") {
    try {
      const form = await request.formData();
      orderNumber = String(form.get("tran_id") ?? orderNumber ?? "");
    } catch {
      // A malformed callback still gets a safe generic result page.
    }
  }

  if (orderNumber && /^[A-Za-z0-9-]{3,32}$/.test(orderNumber)) {
    target.searchParams.set("order", orderNumber);
  }

  // This browser return is not proof of payment. The server-to-server IPN
  // and SSLCommerz Validation API remain the source of truth.
  return Response.redirect(target, 303);
}

export const Route = createFileRoute("/api/public/sslcommerz/cancel")({
  server: {
    handlers: {
      GET: async ({ request }) => handleReturn(request),
      POST: async ({ request }) => handleReturn(request),
    },
  },
});
