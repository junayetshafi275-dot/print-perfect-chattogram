import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Loader2 } from "lucide-react";
import { ProductCard } from "@/components/product-card";
import { productCategories, type Product } from "@/lib/products-data";
import { listProducts } from "@/lib/products.functions";
import { productImage } from "@/lib/catalog";

export const Route = createFileRoute("/_site/shop")({
  head: () => ({
    meta: [
      { title: "Shop Print Products — Business Cards, Banners & More | Friends Printers" },
      { name: "description", content: "Browse our full range of print products: business cards, banners, invitations, packaging and custom print work. Delivered from Anderkilla, Chattogram." },
      { property: "og:title", content: "Shop Print Products — Friends Printers Chattogram" },
      { property: "og:description", content: "Custom printing products delivered from Anderkilla, Chattogram." },
      { property: "og:url", content: "/shop" },
    ],
    links: [{ rel: "canonical", href: "/shop" }],
  }),
  component: ShopPage,
});

function ShopPage() {
  const fetchProducts = useServerFn(listProducts);
  const { data: dbProducts, isLoading } = useQuery({
    queryKey: ["public-products"],
    queryFn: () => fetchProducts({}),
  });

  const managedProducts: Product[] = (dbProducts ?? []).map((p) => ({
    id: p.slug,
    name: p.name,
    category: p.category,
    image: productImage(p.imageKey),
    price: p.isQuoteOnly ? 0 : p.price,
    ...(p.salePrice !== null && !p.isQuoteOnly ? { originalPrice: p.price } : {}),
    ...(p.label ? { badge: p.label } : {}),
  }));
  const products = managedProducts.length > 0 ? managedProducts : productCategories.flatMap((cat) => cat.products);

  return (
    <>
      <section className="border-b border-border bg-paper">
        <div className="container-x py-14 md:py-20 text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-primary font-medium">Shop</p>
          <h1 className="mt-3 font-display text-4xl sm:text-5xl text-ink">Everything we print, in one place</h1>
          <p className="mt-4 max-w-xl mx-auto text-ink-soft">
            Order from stock configurations or request a custom quote — every item is produced at our Anderkilla press.
          </p>
        </div>
      </section>

      <section>
        <div className="container-x py-14">
          {isLoading ? (
            <p className="flex items-center justify-center gap-2 py-12 text-sm text-ink-soft"><Loader2 className="h-4 w-4 animate-spin" /> Loading products…</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {products.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
