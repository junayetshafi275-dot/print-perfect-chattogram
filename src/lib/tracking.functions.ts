import { createServerFn } from "@tanstack/react-start";
import type { OrderStatus } from "./order-status";

export type TrackedOrder = {
  orderNumber: string;
  status: OrderStatus;
  paymentStatus: string;
  city: string | null;
  createdAt: string;
  updatedAt: string;
  timeline: { status: OrderStatus; note: string | null; createdAt: string }[];
  items: { name: string; quantity: number }[];
};

function cityFromAddress(address: string): string | null {
  const parts = address.split(",").map((p) => p.trim()).filter(Boolean);
  return parts.length > 1 ? (parts[parts.length - 1] ?? null) : null;
}

function normalizePhone(phone: string) {
  return phone.replace(/[^0-9]/g, "").slice(-11);
}

/**
 * Public order lookup. Requires BOTH the order number and the phone number on
 * the order, and returns only tracking-safe fields (no address, email or totals).
 */
export const trackOrder = createServerFn({ method: "POST" })
  .inputValidator((input: { orderNumber: string; phone: string }) => {
    const orderNumber = String(input?.orderNumber ?? "").trim().toUpperCase();
    const phone = String(input?.phone ?? "").trim();
    if (orderNumber.length < 3 || orderNumber.length > 32) throw new Error("Please enter a valid order number.");
    if (normalizePhone(phone).length < 8) throw new Error("Please enter the phone number used on the order.");
    return { orderNumber, phone };
  })
  .handler(async ({ data }): Promise<{ order: TrackedOrder | null }> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: order, error } = await supabaseAdmin
      .from("orders")
      .select("id, order_number, customer_phone, shipping_address, status, payment_status, created_at, updated_at")
      .eq("order_number", data.orderNumber)
      .maybeSingle();

    if (error) throw new Error("We couldn't reach our order system. Please try again.");
    if (!order) return { order: null };
    if (normalizePhone(order.customer_phone) !== normalizePhone(data.phone)) return { order: null };

    const [{ data: history }, { data: items }] = await Promise.all([
      supabaseAdmin
        .from("order_status_history")
        .select("status, note, created_at")
        .eq("order_id", order.id)
        .order("created_at", { ascending: true }),
      supabaseAdmin
        .from("order_items")
        .select("product_name_snapshot, quantity")
        .eq("order_id", order.id),
    ]);

    return {
      order: {
        orderNumber: order.order_number,
        status: order.status,
        paymentStatus: order.payment_status,
        city: cityFromAddress(order.shipping_address),
        createdAt: order.created_at,
        updatedAt: order.updated_at,
        timeline: (history ?? []).map((h) => ({ status: h.status, note: h.note, createdAt: h.created_at })),
        items: (items ?? []).map((i) => ({ name: i.product_name_snapshot, quantity: i.quantity })),
      },
    };
  });
