import { createServerFn } from "@tanstack/react-start";
import { checkoutSchema, firstIssue } from "./validation";
import { z } from "zod";

export type PlacedOrder = {
  orderNumber: string;
  total: number;
  /** Set when the SSLCommerz hosted checkout is configured; otherwise null. */
  gatewayUrl: string | null;
  gatewayNote: string | null;
};

export const placeOrder = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => {
    const parsed = checkoutSchema.safeParse(input);
    if (!parsed.success) throw new Error(firstIssue(parsed.error as z.ZodError));
    return parsed.data;
  })
  .handler(async ({ data }): Promise<PlacedOrder> => {
    const { callerIp, enforceRateLimit } = await import("./rate-limit.server");
    await enforceRateLimit({
      bucket: "checkout",
      identifier: callerIp(),
      limit: 10,
      windowMinutes: 60,
      message: "Too many order attempts from this connection. Please try again later or call us.",
    });

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Prices always come from the database, never from the client.
    const slugs = [...new Set(data.items.map((i) => i.slug))];
    const { data: products, error: productError } = await supabaseAdmin
      .from("products")
      .select("id, slug, name, price, sale_price, is_quote_only")
      .in("slug", slugs);

    if (productError) {
      console.error("[checkout] product lookup failed", productError);
      throw new Error("We couldn't price your order. Please try again.");
    }

    const byslug = new Map((products ?? []).map((p) => [p.slug, p]));
    const lines = data.items.map((item) => {
      const product = byslug.get(item.slug);
      if (!product) throw new Error("One of the items in your cart is no longer available.");
      if (product.is_quote_only) {
        throw new Error(`"${product.name}" is quote-only — please request a quote for it instead.`);
      }
      const unit = Number(product.sale_price ?? product.price);
      return {
        product_id: product.id,
        product_name_snapshot: product.name,
        price_at_time: unit,
        quantity: item.quantity,
      };
    });

    const total = lines.reduce((sum, l) => sum + l.price_at_time * l.quantity, 0);

    const { data: order, error: orderError } = await supabaseAdmin
      .from("orders")
      .insert({
        customer_name: data.name,
        customer_phone: data.phone,
        customer_email: data.email ? data.email : null,
        shipping_address: data.address,
        payment_method: data.paymentMethod,
        payment_status: "pending",
        total_amount: total,
      })
      .select("id, order_number")
      .single();

    if (orderError || !order) {
      console.error("[checkout] order insert failed", orderError);
      throw new Error("We couldn't place your order. Please try again.");
    }

    const { error: itemError } = await supabaseAdmin
      .from("order_items")
      .insert(lines.map((l) => ({ ...l, order_id: order.id })));

    if (itemError) {
      console.error("[checkout] order items insert failed", itemError);
      throw new Error("Your order was created but the items didn't save. Please call us to confirm.");
    }

    const { initSslcommerzSession } = await import("./sslcommerz.server");
    const gateway = await initSslcommerzSession({
      orderId: order.id,
      orderNumber: order.order_number,
      amount: total,
      customerName: data.name,
      customerPhone: data.phone,
      customerEmail: data.email || null,
      address: data.address,
      paymentMethod: data.paymentMethod,
    });

    return {
      orderNumber: order.order_number,
      total,
      gatewayUrl: gateway.url,
      gatewayNote: gateway.note,
    };
  });
