import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
import { firstIssue } from "./validation";
import type { OrderStatus } from "./order-status";

export type AdminRole = "admin" | "staff" | null;

export type AdminOrder = {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string | null;
  shippingAddress: string;
  status: OrderStatus;
  paymentStatus: string;
  paymentMethod: string;
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
  items: { name: string; quantity: number; price: number }[];
  history: { status: OrderStatus; note: string | null; createdAt: string }[];
};

export type AdminProduct = {
  id: string;
  slug: string;
  name: string;
  category: string;
  price: number;
  salePrice: number | null;
  imageUrl: string | null;
  description: string | null;
  isQuoteOnly: boolean;
};

export type AdminSubmission = {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  message: string;
  status: "new" | "read" | "responded";
  createdAt: string;
};

export type AdminTestimonial = {
  id: string;
  customerName: string;
  company: string | null;
  quote: string;
  rating: number;
  isPublished: boolean;
  createdAt: string;
};

const orderStatusEnum = z.enum([
  "received",
  "production",
  "shipped",
  "in_city",
  "at_hub",
  "ready_for_pickup",
  "delivered",
  "cancelled",
]);

const productSchema = z.object({
  id: z.string().uuid().optional(),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(80)
    .regex(/^[a-z0-9-]+$/, "Slug can use lowercase letters, numbers and dashes only."),
  name: z.string().trim().min(2).max(120),
  category: z.string().trim().min(2).max(60),
  price: z.number().min(0).max(10_000_000),
  salePrice: z.number().min(0).max(10_000_000).nullable(),
  imageUrl: z.string().trim().max(200).nullable(),
  description: z.string().trim().max(500).nullable(),
  isQuoteOnly: z.boolean(),
});

const testimonialSchema = z.object({
  id: z.string().uuid().optional(),
  customerName: z.string().trim().min(2).max(100),
  company: z.string().trim().max(120).nullable(),
  quote: z.string().trim().min(10).max(1000),
  rating: z.number().int().min(1).max(5),
  isPublished: z.boolean(),
});

function parse<T extends z.ZodTypeAny>(schema: T, input: unknown): z.infer<T> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) throw new Error(firstIssue(parsed.error as z.ZodError));
  return parsed.data;
}

/** Resolves the caller's staff role; null when signed in but not staff. */
export const myAdminRole = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<{ role: AdminRole; email: string | null }> => {
    const { data } = await context.supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId);
    const roles = (data ?? []).map((r) => r.role);
    const role: AdminRole = roles.includes("admin") ? "admin" : roles.includes("staff") ? "staff" : null;
    const email = typeof context.claims["email"] === "string" ? (context.claims["email"] as string) : null;
    return { role, email };
  });

export const listAdminOrders = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<AdminOrder[]> => {
    const { data, error } = await context.supabase
      .from("orders")
      .select(
        "id, order_number, customer_name, customer_phone, customer_email, shipping_address, status, payment_status, payment_method, total_amount, created_at, updated_at, order_items(product_name_snapshot, quantity, price_at_time), order_status_history(status, note, created_at)",
      )
      .order("created_at", { ascending: false })
      .limit(200);

    if (error) {
      console.error("[admin] orders list failed", error);
      throw new Error("Could not load orders.");
    }

    return (data ?? []).map((o) => ({
      id: o.id,
      orderNumber: o.order_number,
      customerName: o.customer_name,
      customerPhone: o.customer_phone,
      customerEmail: o.customer_email,
      shippingAddress: o.shipping_address,
      status: o.status,
      paymentStatus: o.payment_status,
      paymentMethod: o.payment_method,
      totalAmount: Number(o.total_amount),
      createdAt: o.created_at,
      updatedAt: o.updated_at,
      items: (o.order_items ?? []).map((i) => ({
        name: i.product_name_snapshot,
        quantity: i.quantity,
        price: Number(i.price_at_time),
      })),
      history: [...(o.order_status_history ?? [])]
        .sort((a, b) => a.created_at.localeCompare(b.created_at))
        .map((h) => ({ status: h.status, note: h.note, createdAt: h.created_at })),
    }));
  });

export const updateOrderStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    parse(
      z.object({
        id: z.string().uuid(),
        status: orderStatusEnum,
        note: z.string().trim().max(300).optional(),
      }),
      input,
    ),
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("orders")
      .update({ status: data.status })
      .eq("id", data.id);
    if (error) {
      console.error("[admin] order status update failed", error);
      throw new Error("Could not update this order.");
    }
    if (data.note) {
      await context.supabase
        .from("order_status_history")
        .insert({ order_id: data.id, status: data.status, note: data.note, changed_by: context.userId });
    }
    return { ok: true };
  });

export const updatePaymentStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    parse(
      z.object({
        id: z.string().uuid(),
        paymentStatus: z.enum(["pending", "paid", "failed", "refunded"]),
      }),
      input,
    ),
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("orders")
      .update({ payment_status: data.paymentStatus })
      .eq("id", data.id);
    if (error) throw new Error("Could not update the payment status.");
    return { ok: true };
  });

export const listAdminProducts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<AdminProduct[]> => {
    const { data, error } = await context.supabase
      .from("products")
      .select("id, slug, name, category, price, sale_price, image_url, description, is_quote_only")
      .order("category", { ascending: true });
    if (error) throw new Error("Could not load products.");
    return (data ?? []).map((p) => ({
      id: p.id,
      slug: p.slug,
      name: p.name,
      category: p.category,
      price: Number(p.price),
      salePrice: p.sale_price === null ? null : Number(p.sale_price),
      imageUrl: p.image_url,
      description: p.description,
      isQuoteOnly: p.is_quote_only,
    }));
  });

export const saveProduct = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => parse(productSchema, input))
  .handler(async ({ data, context }) => {
    const row = {
      slug: data.slug,
      name: data.name,
      category: data.category,
      price: data.price,
      sale_price: data.salePrice,
      image_url: data.imageUrl,
      description: data.description,
      is_quote_only: data.isQuoteOnly,
    };
    const query = data.id
      ? context.supabase.from("products").update(row).eq("id", data.id)
      : context.supabase.from("products").insert(row);
    const { error } = await query;
    if (error) {
      console.error("[admin] product save failed", error);
      throw new Error(error.message.includes("duplicate") ? "That slug is already used." : "Could not save the product.");
    }
    return { ok: true };
  });

export const deleteProduct = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => parse(z.object({ id: z.string().uuid() }), input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("products").delete().eq("id", data.id);
    if (error) throw new Error("Could not delete the product. It may be used on an existing order.");
    return { ok: true };
  });

export const listSubmissions = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<AdminSubmission[]> => {
    const { data, error } = await context.supabase
      .from("contact_submissions")
      .select("id, name, phone, email, message, status, created_at")
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) throw new Error("Could not load enquiries.");
    return (data ?? []).map((s) => ({
      id: s.id,
      name: s.name,
      phone: s.phone,
      email: s.email,
      message: s.message,
      status: s.status,
      createdAt: s.created_at,
    }));
  });

export const updateSubmissionStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    parse(z.object({ id: z.string().uuid(), status: z.enum(["new", "read", "responded"]) }), input),
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("contact_submissions")
      .update({ status: data.status })
      .eq("id", data.id);
    if (error) throw new Error("Could not update this enquiry.");
    return { ok: true };
  });

export const listAdminTestimonials = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<AdminTestimonial[]> => {
    const { data, error } = await context.supabase
      .from("testimonials")
      .select("id, customer_name, company, quote, rating, is_published, created_at")
      .order("created_at", { ascending: false });
    if (error) throw new Error("Could not load reviews.");
    return (data ?? []).map((t) => ({
      id: t.id,
      customerName: t.customer_name,
      company: t.company,
      quote: t.quote,
      rating: t.rating,
      isPublished: t.is_published,
      createdAt: t.created_at,
    }));
  });

export const saveTestimonial = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => parse(testimonialSchema, input))
  .handler(async ({ data, context }) => {
    const row = {
      customer_name: data.customerName,
      company: data.company,
      quote: data.quote,
      rating: data.rating,
      is_published: data.isPublished,
    };
    const query = data.id
      ? context.supabase.from("testimonials").update(row).eq("id", data.id)
      : context.supabase.from("testimonials").insert(row);
    const { error } = await query;
    if (error) throw new Error("Could not save the review.");
    return { ok: true };
  });

export const deleteTestimonial = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => parse(z.object({ id: z.string().uuid() }), input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("testimonials").delete().eq("id", data.id);
    if (error) throw new Error("Could not delete the review.");
    return { ok: true };
  });
