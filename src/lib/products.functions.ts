import { createServerFn } from "@tanstack/react-start";

export type CatalogProduct = {
  id: string;
  slug: string;
  name: string;
  category: string;
  label: string | null;
  imageKey: string | null;
  price: number;
  salePrice: number | null;
  isQuoteOnly: boolean;
};

export const listProducts = createServerFn({ method: "GET" }).handler(
  async (): Promise<CatalogProduct[]> => {
    const { createPublicClient } = await import("./supabase-public.server");
    const supabase = createPublicClient();

    const { data, error } = await supabase
      .from("products")
      .select("id, slug, name, category, description, image_url, price, sale_price, is_quote_only")
      .order("created_at", { ascending: true });

    if (error) {
      console.error("[products] list failed", error);
      return [];
    }

    return (data ?? []).map((p) => ({
      id: p.id,
      slug: p.slug,
      name: p.name,
      category: p.category,
      label: p.description,
      imageKey: p.image_url,
      price: Number(p.price),
      salePrice: p.sale_price === null ? null : Number(p.sale_price),
      isQuoteOnly: p.is_quote_only,
    }));
  },
);

export type PublicTestimonial = {
  id: string;
  customerName: string;
  company: string | null;
  quote: string;
  rating: number;
};

export const listTestimonials = createServerFn({ method: "GET" }).handler(
  async (): Promise<PublicTestimonial[]> => {
    const { createPublicClient } = await import("./supabase-public.server");
    const supabase = createPublicClient();

    const { data, error } = await supabase
      .from("testimonials")
      .select("id, customer_name, company, quote, rating")
      .eq("is_published", true)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[testimonials] list failed", error);
      return [];
    }

    return (data ?? []).map((t) => ({
      id: t.id,
      customerName: t.customer_name,
      company: t.company,
      quote: t.quote,
      rating: t.rating,
    }));
  },
);
