import { createFileRoute } from "@tanstack/react-router";

/**
 * SSLCommerz IPN endpoint.
 * The notification payload is untrusted: every field is re-checked against the
 * SSLCommerz Validation API, and the order's current state is read before any
 * write so duplicate notifications are no-ops (idempotent).
 */
export const Route = createFileRoute("/api/public/sslcommerz/ipn")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const form = await request.formData();
        const valId = String(form.get("val_id") ?? "");
        const tranId = String(form.get("tran_id") ?? "");

        if (!valId || !tranId) {
          return new Response("Missing val_id or tran_id", { status: 400 });
        }

        const { validateSslcommerzTransaction } = await import("@/lib/sslcommerz.server");
        const validated = await validateSslcommerzTransaction(valId);

        if (!validated) {
          return new Response("Validation unavailable", { status: 503 });
        }
        if (validated.tran_id !== tranId) {
          console.error("[ipn] tran_id mismatch", tranId, validated.tran_id);
          return new Response("Transaction mismatch", { status: 400 });
        }

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data: order, error } = await supabaseAdmin
          .from("orders")
          .select("id, payment_status, total_amount, status")
          .eq("order_number", tranId)
          .maybeSingle();

        if (error || !order) {
          console.error("[ipn] unknown order", tranId, error);
          return new Response("Unknown order", { status: 404 });
        }

        const paid = validated.status === "VALID" || validated.status === "VALIDATED";
        const amountMatches =
          Math.abs(Number(validated.amount ?? 0) - Number(order.total_amount)) < 0.01 &&
          (validated.currency ?? "BDT") === "BDT";

        if (paid && !amountMatches) {
          console.error("[ipn] amount mismatch", validated.amount, order.total_amount);
          return new Response("Amount mismatch", { status: 400 });
        }

        const nextStatus = paid ? "paid" : "failed";

        // Idempotency: already in the target state → acknowledge and stop.
        if (order.payment_status === nextStatus) {
          return new Response("ok (duplicate)");
        }
        // Never downgrade a settled payment.
        if (order.payment_status === "paid" || order.payment_status === "refunded") {
          return new Response("ok (already settled)");
        }

        const { error: updateError } = await supabaseAdmin
          .from("orders")
          .update({
            payment_status: nextStatus,
            ssl_transaction_id: validated.bank_tran_id ?? valId,
          })
          .eq("id", order.id)
          .in("payment_status", ["pending", "failed"]);

        if (updateError) {
          console.error("[ipn] order update failed", updateError);
          return new Response("Update failed", { status: 500 });
        }

        await supabaseAdmin.from("order_status_history").insert({
          order_id: order.id,
          status: order.status,
          note: paid
            ? `Payment confirmed by SSLCommerz (${validated.bank_tran_id ?? valId}).`
            : `Payment attempt failed (${validated.status ?? "unknown"}).`,
        });

        return new Response("ok");
      },
    },
  },
});
