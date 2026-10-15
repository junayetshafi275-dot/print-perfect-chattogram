import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { useServerFn } from "@tanstack/react-start";
import { CheckCircle2, Loader2, ShoppingBag } from "lucide-react";
import { useCart } from "@/lib/cart";
import { formatBDT } from "@/lib/catalog";
import { placeOrder, type PlacedOrder } from "@/lib/checkout.functions";

export const Route = createFileRoute("/_site/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout | Friends Printers" },
      { name: "description", content: "Place your Friends Printers print order — enter delivery details, choose bKash, Nagad, card, bank or cash on pickup, and get an order number to track." },
      { property: "og:title", content: "Checkout — Friends Printers" },
      { property: "og:description", content: "Complete your print order with Friends Printers, Chattogram." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  validateSearch: (search: Record<string, unknown>) =>
    z.object({ payment: z.string().max(20).optional() }).catch({}).parse(search),
  component: CheckoutPage,
});

const PAYMENT_OPTIONS = [
  { value: "bkash", label: "bKash" },
  { value: "nagad", label: "Nagad" },
  { value: "rocket", label: "Rocket" },
  { value: "card", label: "Card" },
  { value: "bank", label: "Bank transfer" },
  { value: "cash_on_pickup", label: "Cash on pickup" },
] as const;

function CheckoutPage() {
  const { lines, subtotal, count, clear } = useCart();
  const submit = useServerFn(placeOrder);
  const navigate = useNavigate();
  const { payment } = Route.useSearch();
  const paymentIncomplete = payment === "failed" || payment === "cancelled";

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [placed, setPlaced] = useState<PlacedOrder | null>(null);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    paymentMethod: "bkash" as (typeof PAYMENT_OPTIONS)[number]["value"],
  });

  function field(key: keyof typeof form) {
    return {
      value: form[key],
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
        setForm((f) => ({ ...f, [key]: e.target.value })),
    };
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const result = await submit({
        data: {
          ...form,
          items: lines.map((l) => ({ slug: l.slug, quantity: l.quantity })),
        },
      });
      if (result.gatewayUrl) {
        window.location.href = result.gatewayUrl;
        return;
      }
      clear();
      setPlaced(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "We couldn't place your order. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (placed) {
    return (
      <section className="container-x py-20 max-w-xl text-center">
        <CheckCircle2 className="mx-auto h-12 w-12 text-primary" />
        <h1 className="mt-4 font-display text-3xl text-ink">Order placed</h1>
        <p className="mt-2 text-ink-soft">
          Your order number is{" "}
          <span className="font-display text-lg text-ink">{placed.orderNumber}</span>. Keep it handy — you can
          track progress any time with this number or the phone number you gave us.
        </p>
        <p className="mt-3 text-sm text-ink-soft">Total: {formatBDT(placed.total)}</p>
        {placed.gatewayNote && (
          <p className="mt-4 rounded-md border border-border bg-paper p-4 text-sm text-ink-soft">{placed.gatewayNote}</p>
        )}
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={() => navigate({ to: "/track", search: { order: placed.orderNumber } })}
            className="rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground"
          >
            Track this order
          </button>
          <Link to="/shop" className="rounded-md border border-border px-5 py-2.5 text-sm font-medium text-ink">
            Keep shopping
          </Link>
        </div>
      </section>
    );
  }

  if (count === 0) {
    return (
      <section className="container-x py-20 max-w-xl text-center">
        <ShoppingBag className="mx-auto h-8 w-8 text-ink-soft" />
        <h1 className="mt-3 font-display text-3xl text-ink">Your cart is empty</h1>
        <p className="mt-2 text-sm text-ink-soft">Add a few items in the shop and come back to check out.</p>
        <Link
          to="/shop"
          className="mt-6 inline-flex rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground"
        >
          Browse the shop
        </Link>
      </section>
    );
  }

  return (
    <>
      <section className="border-b border-border bg-paper bg-paper-grain">
        <div className="container-x py-14 text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-primary font-medium">Checkout</p>
          <h1 className="mt-3 font-display text-4xl text-ink">Where should we send it?</h1>
        </div>
      </section>

      <section className="container-x py-14 max-w-4xl">
        {paymentIncomplete && (
          <p role="alert" className="mb-6 rounded-md border border-primary/40 bg-paper p-4 text-sm text-ink">
            Your payment wasn't completed. Your cart is still here, you can try again or choose another method.
          </p>
        )}
        <form onSubmit={onSubmit} className="grid gap-8 lg:grid-cols-[1fr_320px] items-start">
          <div className="grid gap-4 rounded-xl border border-border bg-card p-6 shadow-card sm:grid-cols-2">
            <label className="grid gap-2 text-sm">
              <span className="font-medium text-ink">Full name</span>
              <input {...field("name")} required maxLength={100} className="rounded-md border border-border bg-background px-3 py-2 text-ink outline-none focus:border-primary" />
            </label>
            <label className="grid gap-2 text-sm">
              <span className="font-medium text-ink">Phone</span>
              <input {...field("phone")} required inputMode="tel" placeholder="01712345678" className="rounded-md border border-border bg-background px-3 py-2 text-ink outline-none focus:border-primary" />
            </label>
            <label className="grid gap-2 text-sm sm:col-span-2">
              <span className="font-medium text-ink">Email <span className="text-ink-soft">(optional)</span></span>
              <input {...field("email")} type="email" maxLength={255} className="rounded-md border border-border bg-background px-3 py-2 text-ink outline-none focus:border-primary" />
            </label>
            <label className="grid gap-2 text-sm sm:col-span-2">
              <span className="font-medium text-ink">Delivery address</span>
              <textarea
                {...field("address")}
                required
                rows={3}
                maxLength={500}
                placeholder="House, road, area, city"
                className="rounded-md border border-border bg-background px-3 py-2 text-ink outline-none focus:border-primary"
              />
            </label>
            <label className="grid gap-2 text-sm sm:col-span-2">
              <span className="font-medium text-ink">Payment method</span>
              <select
                {...field("paymentMethod")}
                className="rounded-md border border-border bg-background px-3 py-2 text-ink outline-none focus:border-primary"
              >
                {PAYMENT_OPTIONS.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </label>

            {error && <p className="text-sm text-primary sm:col-span-2">{error}</p>}
          </div>

          <aside className="rounded-xl border border-border bg-paper p-6">
            <h2 className="font-display text-xl text-ink">Order summary</h2>
            <ul className="mt-4 grid gap-2 text-sm">
              {lines.map((l) => (
                <li key={l.slug} className="flex justify-between gap-3">
                  <span className="min-w-0 text-ink-soft">
                    {l.name} × {l.quantity}
                  </span>
                  <span className="text-ink">{formatBDT(l.price * l.quantity)}</span>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex justify-between border-t border-border pt-4 text-sm">
              <span className="text-ink-soft">Subtotal</span>
              <span className="font-display text-lg text-ink">{formatBDT(subtotal)}</span>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary px-5 py-3 text-sm font-medium text-primary-foreground shadow-soft hover:opacity-90 transition disabled:opacity-60"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Place order
            </button>
            <p className="mt-3 text-xs text-ink-soft">
              We confirm every order by phone before it goes on the press.
            </p>
          </aside>
        </form>
      </section>
    </>
  );
}
