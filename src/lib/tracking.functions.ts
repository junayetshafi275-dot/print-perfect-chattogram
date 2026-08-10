import { createServerFn } from "@tanstack/react-start";
import { trackSchema, firstIssue } from "./validation";
import type { OrderStatus } from "./order-status";
import { z } from "zod";

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
 * Public order lookup by order number, phone number, or both.
 * Returns only tracking-safe fields (no address, email or totals) and is
 * rate-limited to blunt order-number / phone enumeration.
 */
export const trackOrder = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => {
    const parsed = trackSchema.safeParse(input);
    if (!parsed.success) throw new Error(firstIssue(parsed.error as z.ZodError));
    return {
      orderNumber: parsed.data.orderNumber?.toUpperCase() ?? "",
      phone: parsed.data.phone ?? "",
    };
  })
  .handler(async ({ data }): Promise<{ orders: TrackedOrder[] }> => {
    const { callerIp, enforceRateLimit } = await import("./rate-limit.server");
    await enforceRateLimit({
      bucket: "track",
      identifier: callerIp(),
      limit: 20,
      windowMinutes: 15,
      message: "Too many lookups from this connection. Please wait a few minutes and try again.",
    });

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    let query = supabaseAdmin
      .from("orders")
      .select("id, order_number, customer_phone, shipping_address, status, payment_status, created_at, updated_at")
      .order("created_at", { ascending: false })
      .limit(10);

    if (data.orderNumber) query = query.eq("order_number", data.orderNumber);

    const { data: rows, error } = await query;
    if (error) throw new Error("We couldn't reach our order system. Please try again.");

    let matches = rows ?? [];

    // A phone number, when supplied, must match — it's the shared secret for
    // order-number lookups and the only key for phone-only lookups.
    if (data.phone) {
      const wanted = normalizePhone(data.phone);
      matches = matches.filter((o) => normalizePhone(o.customer_phone) === wanted);
    }

    if (matches.length === 0) return { orders: [] };

    const ids = matches.map((o) => o.id);
    const [{ data: history }, { data: items }] = await Promise.all([
      supabaseAdmin
        .from("order_status_history")
        .select("order_id, status, note, created_at")
        .in("order_id", ids)
        .order("created_at", { ascending: true }),
      supabaseAdmin
        .from("order_items")
        .select("order_id, product_name_snapshot, quantity")
        .in("order_id", ids),
    ]);

    return {
      orders: matches.map((order) => ({
        orderNumber: order.order_number,
        status: order.status,
        paymentStatus: order.payment_status,
        city: cityFromAddress(order.shipping_address),
        createdAt: order.created_at,
        updatedAt: order.updated_at,
        timeline: (history ?? [])
          .filter((h) => h.order_id === order.id)
          .map((h) => ({ status: h.status, note: h.note, createdAt: h.created_at })),
        items: (items ?? [])
          .filter((i) => i.order_id === order.id)
          .map((i) => ({ name: i.product_name_snapshot, quantity: i.quantity })),
      })),
    };
  });
