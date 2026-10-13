import { createServerFn } from "@tanstack/react-start";
import { trackSchema, firstIssue } from "./validation";
import type { OrderStatus } from "./order-status";
import { z } from "zod";

/** Minimal, non-personal tracking view. No address, phone, email, totals, notes or payment refs. */
export type TrackedOrder = {
  orderNumber: string;
  status: OrderStatus;
  paymentStatus: string;
  createdAt: string;
  updatedAt: string;
  timeline: { status: OrderStatus; createdAt: string }[];
  items: { name: string; quantity: number }[];
};

type Lookup = { token: string } | { orderNumber: string; phone: string };

/**
 * Public order lookup. Unlocks exactly one order, by either:
 *  - the unguessable 256-bit tracking token from the confirmation link, or
 *  - order number AND phone number together (both must match).
 * A phone number alone never lists orders. Rate-limited per connection (and
 * per phone when given); fails closed if the limiter is unavailable.
 */
export const trackOrder = createServerFn({ method: "POST" })
  .inputValidator((input: unknown): Lookup => {
    const parsed = trackSchema.safeParse(input);
    if (!parsed.success) throw new Error(firstIssue(parsed.error as z.ZodError));
    if ("token" in parsed.data) return { token: parsed.data.token.toLowerCase() };
    return { orderNumber: parsed.data.orderNumber.toUpperCase(), phone: parsed.data.phone };
  })
  .handler(async ({ data }): Promise<{ orders: TrackedOrder[] }> => {
    const { log } = await import("./logging.server");
    const { enforceRateLimit, enforceIpAndPhoneLimit, normalizePhone, RATE_LIMITS } = await import(
      "./rate-limit.server"
    );
    const message = "Too many lookups from this connection. Please wait a few minutes and try again.";

    if ("token" in data) {
      await enforceRateLimit(RATE_LIMITS.trackIp, undefined, message);
    } else {
      await enforceIpAndPhoneLimit({
        ip: RATE_LIMITS.trackIp,
        phone: RATE_LIMITS.trackPhone,
        phoneValue: data.phone,
        message,
      });
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    let query = supabaseAdmin
      .from("orders")
      .select("id, order_number, status, payment_status, created_at, updated_at");

    if ("token" in data) {
      query = query.eq("tracking_token", data.token);
    } else {
      const phone = normalizePhone(data.phone);
      if (phone.length < 6) return { orders: [] };
      query = query.eq("order_number", data.orderNumber).eq("customer_phone_normalized", phone);
    }

    const { data: order, error } = await query.limit(1).maybeSingle();
    if (error) {
      log.error("track", "order lookup failed", { error });
      throw new Error("We couldn't reach our order system. Please try again.");
    }
    if (!order) return { orders: [] };

    const [{ data: history }, { data: items }] = await Promise.all([
      supabaseAdmin
        .from("order_status_history")
        .select("status, created_at")
        .eq("order_id", order.id)
        .order("created_at", { ascending: true }),
      supabaseAdmin
        .from("order_items")
        .select("product_name_snapshot, quantity")
        .eq("order_id", order.id),
    ]);

    return {
      orders: [
        {
          orderNumber: order.order_number,
          status: order.status,
          paymentStatus: order.payment_status,
          createdAt: order.created_at,
          updatedAt: order.updated_at,
          timeline: (history ?? []).map((h) => ({ status: h.status, createdAt: h.created_at })),
          items: (items ?? []).map((i) => ({ name: i.product_name_snapshot, quantity: i.quantity })),
        },
      ],
    };
  });
