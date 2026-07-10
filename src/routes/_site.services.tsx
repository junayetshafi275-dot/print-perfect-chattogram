import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Check } from "lucide-react";
import { services } from "@/lib/services-data";

export const Route = createFileRoute("/_site/services")({
  head: () => ({
    meta: [
      { title: "Printing Services — Friends Printers, Chattogram" },
      {
        name: "description",
        content:
          "Explore commercial, office, marketing, educational, event and custom printing services from Friends Printers in Anderkilla, Chattogram.",
      },
      { property: "og:title", content: "Printing Services — Friends Printers" },
      {
        property: "og:description",
        content:
          "Business cards, brochures, banners, books, invitations and custom print work — professionally produced in Chattogram.",
      },
    ],
  }),
  component: ServicesPage,
});

function ServicesPage() {
  return (
    <>
      <section className="border-b border-border bg-paper">
        <div className="container-x py-20 max-w-3xl">
          <p className="text-xs uppercase tracking-[0.2em] text-primary font-medium">Services</p>
          <h1 className="mt-3 text-4xl sm:text-5xl text-ink">
            Everything you need to print, done right.
          </h1>
          <p className="mt-4 text-lg text-ink-soft leading-relaxed">
            From daily office essentials to premium marketing collateral, we
            handle the full spectrum of print production with careful attention
            to detail and honest pricing.
          </p>
        </div>
      </section>

      <div className="container-x py-16 space-y-24">
        {services.map((s, i) => (
          <section
            key={s.slug}
            id={s.slug}
            className={`grid gap-10 lg:grid-cols-2 lg:items-center ${
              i % 2 === 1 ? "lg:[&>*:first-child]:order-2" : ""
            }`}
          >
            <div className="overflow-hidden rounded-2xl border border-border shadow-soft">
              <img
                src={s.image}
                alt={s.title}
                loading="lazy"
                width={1024}
                height={768}
                className="w-full h-auto object-cover aspect-[4/3]"
              />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-primary font-medium">
                0{i + 1} · Category
              </p>
              <h2 className="mt-3 text-3xl sm:text-4xl text-ink">{s.title}</h2>
              <p className="mt-4 text-ink-soft leading-relaxed">{s.tagline}</p>
              <ul className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-2">
                {s.items.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-ink">
                    <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 transition"
                >
                  Request a Quote <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </section>
        ))}
      </div>

      <section className="border-t border-border bg-paper">
        <div className="container-x py-16 text-center">
          <h2 className="text-3xl text-ink">Don't see what you're looking for?</h2>
          <p className="mt-3 text-ink-soft max-w-xl mx-auto">
            We handle custom print projects of all shapes, sizes and finishes.
            Tell us about your idea — we'll figure out how to make it.
          </p>
          <Link
            to="/contact"
            className="mt-6 inline-flex items-center gap-2 rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:opacity-90 transition"
          >
            Talk to us <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </>
  );
}
