import { createFileRoute } from "@tanstack/react-router";

function returnToCheckout(request: Request, status: "processing") {
  return async () => {
    const target = new URL("/checkout", request.url);
    target.searchParams.set("payment", status);
    let orderNumber = new URL(request.url).searchParams.get("tran_id") ?? new URL(request.url).searchParams.get("order");

    if (request.method === "POST") {
      try {
        const form = await request.clone().formData();
        orderNumber = String(form.get("tran_id") ?? orderNumber ?? "");
      } catch {
        // The redirect still provides a safe generic result if the callback body is malformed.
      }
    }

    if (orderNumber && /^[A-Za-z0-9-]{3,32}$/.test(orderNumber)) {
      target.searchParams.set("order", orderNumber);
    }
    // Browser returns are only UX signals. The IPN/Validation API remains the
    // source of truth for whether the order has actually been paid.
    return Response.redirect(target, 303);
  };
}

export const Route = createFileRoute("/api/public/sslcommerz/success")({
  server: {
    handlers: {
      GET: async ({ request }) => returnToCheckout(request, "processing")(),
      POST: async ({ request }) => returnToCheckout(request, "processing")(),
    },
  },
});
