import { createFileRoute, Link } from "@tanstack/react-router";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { useCart } from "@/lib/cart";
import { formatBDT } from "@/lib/catalog";

export const Route = createFileRoute("/_site/cart")({
  head: () => ({
    meta: [
      { title: "Your Cart | Friends Printers" },
      { name: "description", content: "Review your Friends Printers print order — adjust quantities, check your total in BDT, and continue to checkout." },
      { property: "og:title", content: "Your Cart — Friends Printers" },
      { property: "og:description", content: "Review your print order before checkout." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  const { lines, subtotal, count, setQuantity, remove } = useCart();

  return (
    <>
      <section className="border-b border-border bg-paper bg-paper-grain">
        <div className="container-x py-14 text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-primary font-medium">Cart</p>
          <h1 className="mt-3 font-display text-4xl text-ink">Your print order</h1>
        </div>
      </section>

      <section className="container-x py-14 max-w-4xl">
        {count === 0 ? (
          <div className="rounded-xl border border-border bg-paper p-12 text-center">
            <ShoppingBag className="mx-auto h-8 w-8 text-ink-soft" />
            <h2 className="mt-3 font-display text-2xl text-ink">Nothing here yet</h2>
            <p className="mt-2 text-sm text-ink-soft">
              Browse the shop and add what you need — or send us a custom job and we'll quote it.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link to="/shop" className="rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground">
                Browse the shop
              </Link>
              <Link to="/contact" className="rounded-md border border-border px-5 py-2.5 text-sm font-medium text-ink">
                Request a quote
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[1fr_320px] items-start">
            <ul className="grid gap-3">
              {lines.map((line) => (
                <li key={line.slug} className="flex flex-wrap items-center gap-4 rounded-xl border border-border bg-card p-4 shadow-card">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-ink">{line.name}</p>
                    {line.label && <p className="text-xs uppercase tracking-wider text-ink-soft">{line.label}</p>}
                    <p className="mt-1 text-sm text-primary">{formatBDT(line.price)}</p>
                  </div>

                  <div className="flex items-center rounded-md border border-border">
                    <button
                      type="button"
                      aria-label={`Decrease quantity of ${line.name}`}
                      onClick={() => setQuantity(line.slug, line.quantity - 1)}
                      className="p-2 text-ink-soft hover:text-primary"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="w-10 text-center text-sm text-ink">{line.quantity}</span>
                    <button
                      type="button"
                      aria-label={`Increase quantity of ${line.name}`}
                      onClick={() => setQuantity(line.slug, line.quantity + 1)}
                      className="p-2 text-ink-soft hover:text-primary"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <p className="w-24 text-right text-sm font-medium text-ink">
                    {formatBDT(line.price * line.quantity)}
                  </p>

                  <button
                    type="button"
                    aria-label={`Remove ${line.name}`}
                    onClick={() => remove(line.slug)}
                    className="p-2 text-ink-soft hover:text-primary"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>

            <aside className="rounded-xl border border-border bg-paper p-6">
              <h2 className="font-display text-xl text-ink">Summary</h2>
              <dl className="mt-4 grid gap-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-ink-soft">Items</dt>
                  <dd className="text-ink">{count}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-ink-soft">Subtotal</dt>
                  <dd className="text-ink font-medium">{formatBDT(subtotal)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-ink-soft">Delivery</dt>
                  <dd className="text-ink-soft">Confirmed at checkout</dd>
                </div>
              </dl>
              <Link
                to="/checkout"
                className="mt-6 inline-flex w-full items-center justify-center rounded-md bg-primary px-5 py-3 text-sm font-medium text-primary-foreground shadow-soft hover:opacity-90 transition"
              >
                Continue to checkout
              </Link>
              <p className="mt-3 text-xs text-ink-soft">
                Final prices are re-checked against our press-room price list when you place the order.
              </p>
            </aside>
          </div>
        )}
      </section>
    </>
  );
}
