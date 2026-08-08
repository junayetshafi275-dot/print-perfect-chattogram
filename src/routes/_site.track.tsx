import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Check, Loader2, PackageSearch, Search } from "lucide-react";
import { trackOrder, type TrackedOrder } from "@/lib/tracking.functions";
import { ORDER_FLOW, STATUS_BLURB, statusLabel, stageIndex } from "@/lib/order-status";
import { Reveal } from "@/components/reveal";

export const Route = createFileRoute("/_site/track")({
  head: () => ({
    meta: [
      { title: "Track Your Print Order | Friends Printers" },
      { name: "description", content: "Follow your Friends Printers order from press to doorstep — received, in production, shipped, at your local hub, ready for pickup or delivered." },
      { property: "og:title", content: "Track Your Order — Friends Printers" },
      { property: "og:description", content: "Enter your order number and phone to see exactly where your print job is." },
      { property: "og:url", content: "/track" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/track" }],
  }),
  component: TrackPage,
});

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}

function TrackPage() {
  const lookup = useServerFn(trackOrder);
  const [orderNumber, setOrderNumber] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<TrackedOrder | null>(null);
  const [searched, setSearched] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await lookup({ data: { orderNumber, phone } });
      setResult(res.order);
      setSearched(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const current = result ? stageIndex(result.status) : -1;
  const cancelled = result?.status === "cancelled";
  const stampFor = (stage: string) =>
    result?.timeline.filter((t) => t.status === stage).slice(-1)[0] ?? null;

  return (
    <>
      <section className="border-b border-border bg-paper bg-paper-grain">
        <div className="container-x py-14 md:py-20 text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-primary font-medium">Order Tracking</p>
          <h1 className="mt-3 font-display text-4xl sm:text-5xl text-ink">Where's my print job?</h1>
          <p className="mt-4 max-w-xl mx-auto text-ink-soft">
            Enter your order number and the phone number you gave us. We'll show you every step from our Anderkilla press to your hands.
          </p>
        </div>
      </section>

      <section>
        <div className="container-x py-14 max-w-3xl">
          <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-[1fr_1fr_auto] items-end rounded-xl border border-border bg-card p-5 shadow-card">
            <label className="grid gap-2 text-sm">
              <span className="text-ink font-medium">Order number</span>
              <input
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                required
                placeholder="FP-2847"
                className="rounded-md border border-border bg-background px-3 py-2 text-ink outline-none focus:border-primary"
              />
            </label>
            <label className="grid gap-2 text-sm">
              <span className="text-ink font-medium">Phone number</span>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                inputMode="tel"
                placeholder="01XXXXXXXXX"
                className="rounded-md border border-border bg-background px-3 py-2 text-ink outline-none focus:border-primary"
              />
            </label>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-soft transition hover:opacity-90 active:scale-[0.98] disabled:opacity-60"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              Track
            </button>
          </form>

          {error && <p className="mt-4 text-sm text-primary">{error}</p>}

          {searched && !result && !error && (
            <div className="mt-8 rounded-xl border border-border bg-paper p-8 text-center">
              <PackageSearch className="mx-auto h-8 w-8 text-ink-soft" />
              <h2 className="mt-3 font-display text-2xl text-ink">No order matches those details</h2>
              <p className="mt-2 text-sm text-ink-soft">
                Double-check the order number and phone number on your receipt. Still stuck? Call the press room and we'll look it up by hand.
              </p>
            </div>
          )}

          {result && (
            <Reveal className="mt-10">
              <div className="rounded-xl border border-border bg-card p-6 shadow-card">
                <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-border pb-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-ink-soft">Order</p>
                    <p className="font-display text-2xl text-ink">{result.orderNumber}</p>
                  </div>
                  <div className="text-right text-sm">
                    <p className="text-ink font-medium">{statusLabel(result.status, result.city)}</p>
                    <p className="text-ink-soft">Updated {formatDate(result.updatedAt)}</p>
                  </div>
                </div>

                {result.items.length > 0 && (
                  <ul className="mt-4 flex flex-wrap gap-2">
                    {result.items.map((it, i) => (
                      <li key={i} className="rounded-full border border-border bg-paper px-3 py-1 text-xs text-ink-soft">
                        {it.name} × {it.quantity}
                      </li>
                    ))}
                  </ul>
                )}

                {cancelled ? (
                  <p className="mt-6 rounded-md border border-border bg-paper p-4 text-sm text-ink-soft">
                    {STATUS_BLURB.cancelled}
                  </p>
                ) : (
                  <ol className="mt-8 relative">
                    {ORDER_FLOW.map((stage, i) => {
                      const done = i <= current;
                      const isCurrent = i === current;
                      const stamp = stampFor(stage);
                      return (
                        <li key={stage} className="relative flex gap-4 pb-7 last:pb-0">
                          {i < ORDER_FLOW.length - 1 && (
                            <span
                              aria-hidden="true"
                              className={`absolute left-[13px] top-7 bottom-0 w-px ${i < current ? "bg-primary" : "bg-border"}`}
                            />
                          )}
                          <span
                            className={`relative z-10 mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition ${
                              done
                                ? "border-primary bg-primary text-primary-foreground"
                                : "border-border bg-background text-ink-soft"
                            }`}
                          >
                            {done ? <Check className="h-4 w-4" /> : <span className="h-1.5 w-1.5 rounded-full bg-current" />}
                          </span>
                          <div className="min-w-0">
                            <p className={`text-sm ${isCurrent ? "font-semibold text-ink" : done ? "text-ink" : "text-ink-soft"}`}>
                              {statusLabel(stage, result.city)}
                            </p>
                            <p className="mt-1 text-sm text-ink-soft">{stamp?.note ?? STATUS_BLURB[stage]}</p>
                            {stamp && <p className="mt-1 text-xs text-ink-soft/80">{formatDate(stamp.createdAt)}</p>}
                          </div>
                        </li>
                      );
                    })}
                  </ol>
                )}
              </div>
            </Reveal>
          )}
        </div>
      </section>
    </>
  );
}
