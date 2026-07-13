import { createFileRoute } from "@tanstack/react-router";
import { ProductCard } from "@/components/product-card";
import { productCategories } from "@/lib/products-data";

export const Route = createFileRoute("/_site/shop")({
  head: () => ({
    meta: [
      { title: "Shop — Friends Printers | Custom Printing in Chattogram" },
      { name: "description", content: "Browse our full range of print products: business cards, banners, invitations, packaging and custom print work. Delivered from Anderkilla, Chattogram." },
      { property: "og:title", content: "Shop — Friends Printers" },
      { property: "og:description", content: "Custom printing products delivered from Anderkilla, Chattogram." },
    ],
  }),
  component: ShopPage,
});

function ShopPage() {
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

      {productCategories.map((cat, i) => (
        <section key={cat.slug} className={i % 2 === 1 ? "bg-paper-grain" : ""}>
          <div className="container-x py-14">
            <h2 className="font-display text-2xl sm:text-3xl text-ink">{cat.title}</h2>
            <div className="mt-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {cat.products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </section>
      ))}
    </>
  );
}
