import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Truck, ShieldCheck, Star, Headphones, MapPin } from "lucide-react";
import heroImg from "@/assets/hero-print.jpg";
import { productCategories } from "@/lib/products-data";
import { ProductCard } from "@/components/product-card";
import { ReviewCarousel } from "@/components/review-carousel";
import { Reveal, StaggerGrid, StaggerItem } from "@/components/reveal";
import { StatCounter } from "@/components/stat-counter";

const ctaBtn =
  "inline-flex items-center gap-2 rounded-md bg-primary px-7 py-3.5 text-sm font-semibold text-primary-foreground shadow-soft transition-[transform,background-color,opacity] duration-150 ease-out hover:opacity-95 hover:scale-[1.02] active:scale-[0.98] motion-reduce:transform-none";


export const Route = createFileRoute("/_site/")({
  head: () => ({
    meta: [
      { title: "Friends Printers — Trusted Printing in Anderkilla, Chattogram" },
      {
        name: "description",
        content:
          "Custom business cards, brochures, banners, books and packaging — printed at our Anderkilla press in Chattogram. Fast turnaround, honest pricing.",
      },
      { property: "og:title", content: "Friends Printers — Trusted Printing in Chattogram" },
      {
        property: "og:description",
        content:
          "Full-service printing from Anderkilla — Chattogram's printing district. Request a quote for your next project.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/" },
    ],
    links: [{ rel: "canonical", href: "/" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "LocalBusiness",
          name: "Friends Printers",
          description:
            "Full-service printing company in Anderkilla, Chattogram — business cards, brochures, banners, books, invitations and custom print work.",
          address: {
            "@type": "PostalAddress",
            streetAddress: "Anderkilla",
            addressLocality: "Chattogram",
            addressCountry: "BD",
          },
          areaServed: "Chattogram, Bangladesh",
          priceRange: "৳৳",
          url: "/",
        }),
      },
    ],
  }),
  component: HomePage,
});

const trust = [
  { Icon: Truck, label: "Fast Shipping" },
  { Icon: ShieldCheck, label: "Quality Guarantee" },
  { Icon: Star, label: "4.9★ Rated" },
  { Icon: Headphones, label: "24/7 Support" },
];

function HomePage() {
  return (
    <>
      {/* Hero — split layout */}
      <section className="relative overflow-hidden">
        {/* Soft accent glow behind hero image */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 right-[-10%] h-[520px] w-[520px] rounded-full bg-primary/10 blur-3xl"
        />
        {/* Subtle diagonal line texture */}
        <svg
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 h-full w-full"
          viewBox="0 0 400 400"
          preserveAspectRatio="none"
        >
          <g stroke="var(--color-primary)" strokeWidth={1.5} strokeOpacity={0.18}>
            <line x1={-50} y1={450} x2={550} y2={-150} />
            <line x1={0} y1={450} x2={600} y2={-150} />
            <line x1={50} y1={450} x2={650} y2={-150} />
          </g>
        </svg>

        <div className="container-x relative pt-14 pb-16 md:pt-20 md:pb-24 grid gap-10 lg:grid-cols-[minmax(0,45%)_minmax(0,55%)] lg:items-center">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-accent px-3 py-1 text-xs font-medium text-primary">
              <MapPin className="h-3.5 w-3.5" />
              Anderkilla · Chattogram
            </span>
            <h1 className="mt-6 font-display text-4xl sm:text-5xl lg:text-6xl leading-[1.05] text-ink">
              Custom Print, Delivered Fast <span className="text-primary">to Your Door</span>
            </h1>
            <p className="mt-5 max-w-lg text-base text-ink-soft leading-relaxed">
              Business cards, banners, invitations and bespoke print — designed, produced and shipped by a print house you can trust.
            </p>
            <div className="mt-8">
              <Link to="/shop" className={ctaBtn}>
                Shop Now <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

          </div>

          <div className="relative">
            <div className="absolute -inset-6 bg-gradient-to-br from-primary/10 to-transparent rounded-3xl blur-2xl" />
            <div className="relative overflow-hidden rounded-2xl shadow-elegant ring-1 ring-border aspect-[5/4]">
              <img
                src={heroImg}
                alt="Freshly printed materials from Friends Printers"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="absolute -bottom-5 -left-5 sm:left-6 rounded-xl bg-background border border-border px-4 py-3 shadow-elegant">
              <div className="text-[10px] uppercase tracking-wider text-ink-soft">Limited offer</div>
              <div className="mt-0.5 font-display text-sm font-semibold text-ink">Free shipping over ৳5,000</div>
            </div>
          </div>
        </div>
      </section>


      {/* Trust strip — slim bar */}
      <Reveal as="section" className="relative overflow-hidden border-y border-border bg-paper">
        {/* Continuation of the hero diagonal texture — same angle, spacing and opacity */}
        <svg
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 h-full w-full"
          viewBox="0 0 400 400"
          preserveAspectRatio="none"
        >
          <g stroke="var(--color-primary)" strokeWidth={1.5} strokeOpacity={0.18}>
            <line x1={-50} y1={450} x2={550} y2={-150} />
            <line x1={0} y1={450} x2={600} y2={-150} />
            <line x1={50} y1={450} x2={650} y2={-150} />
          </g>
        </svg>
        <div className="container-x relative py-4">
          <ul className="grid grid-cols-2 md:flex md:items-center md:justify-between gap-3 md:gap-6 text-sm">
            {trust.map(({ Icon, label }) => (
              <li key={label} className="flex items-center justify-center md:justify-start gap-2 text-ink">
                <Icon className="h-4 w-4 text-primary shrink-0" />
                <span className="font-medium">{label}</span>
              </li>
            ))}
          </ul>
        </div>
      </Reveal>


      {/* Product grids — alternating backgrounds */}
      {productCategories.map((cat, i) => {
        const Icon = cat.icon;
        return (
          <section key={cat.slug} className={i % 2 === 1 ? "bg-paper-grain" : ""}>
            <div className="container-x py-16 md:py-20">
              <Reveal className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <span className="divider-mark mb-5" aria-hidden />
                  <div className="flex items-center gap-3">
                    <span className="grid h-9 w-9 place-items-center rounded-lg bg-accent text-primary ring-1 ring-primary/10">
                      <Icon className="h-5 w-5" strokeWidth={1.75} />
                    </span>
                    <p className="text-xs uppercase tracking-[0.2em] text-primary font-medium">{cat.eyebrow}</p>
                  </div>
                  <h2 className="mt-3 font-display text-3xl sm:text-4xl text-ink">{cat.title}</h2>
                </div>
                <Link
                  to="/shop"
                  className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:gap-3 transition-all"
                >
                  View all <ArrowRight className="h-4 w-4" />
                </Link>
              </Reveal>

              <StaggerGrid className="mt-10 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                {cat.products.slice(0, 4).map((p) => (
                  <StaggerItem key={p.id}>
                    <ProductCard product={p} />
                  </StaggerItem>
                ))}
              </StaggerGrid>
            </div>
          </section>
        );
      })}


      {/* By the numbers */}
      <Reveal as="section" className="border-y border-border bg-paper-grain">
        <div className="container-x py-16 md:py-20">
          <div className="text-center max-w-xl mx-auto mb-12">
            <span className="divider-mark mx-auto mb-5" aria-hidden />
            <p className="text-xs uppercase tracking-[0.2em] text-primary font-medium">By the numbers</p>
            <h2 className="mt-3 font-display text-3xl sm:text-4xl text-ink">A press-room built on trust</h2>
          </div>
          <StatCounter
            stats={[
              { value: 15, suffix: "+", label: "Years in Anderkilla" },
              { value: 2400, suffix: "+", label: "Orders delivered" },
              { value: 24, suffix: "h", label: "Typical turnaround" },
              { value: 98, suffix: "%", label: "Repeat clients" },
            ]}
          />
        </div>
      </Reveal>

      {/* Short trust paragraph */}
      <Reveal as="section" className="border-b border-border">
        <div className="container-x py-16 max-w-3xl text-center">
          <span className="divider-mark mx-auto mb-5" aria-hidden />
          <p className="text-xs uppercase tracking-[0.25em] text-primary font-medium">Why customers stay with us</p>
          <p className="mt-5 font-display text-2xl sm:text-3xl text-ink leading-snug">
            Rooted in Anderkilla, Chattogram's printing district — Friends Printers combines skilled offset and digital press work with a trusted network of finishing partners, so your order arrives on time, on brand and on budget.
          </p>
        </div>
      </Reveal>

      {/* Social proof — single consolidated carousel */}
      <Reveal as="section" className="bg-paper-grain">
        <div className="container-x py-16 md:py-20">
          <div className="text-center max-w-2xl mx-auto">
            <span className="divider-mark mx-auto mb-5" aria-hidden />
            <p className="text-xs uppercase tracking-[0.2em] text-primary font-medium">What clients say</p>
            <h2 className="mt-3 font-display text-3xl sm:text-4xl text-ink">Rated 4.9 by hundreds of businesses across Chattogram</h2>
          </div>
          <div className="mt-12">
            <ReviewCarousel />
          </div>
        </div>
      </Reveal>



      {/* Closing CTA */}
      <section>
        <div className="container-x py-20 text-center">
          <h2 className="font-display text-3xl sm:text-4xl text-ink max-w-2xl mx-auto">
            Ready to bring your next project to print?
          </h2>
          <p className="mt-4 text-ink-soft max-w-xl mx-auto">
            Browse our shop or send us your specs — we'll reply with a tailored quote within one business day.
          </p>
          <div className="mt-8">
            <Link to="/shop" className={ctaBtn}>
              Shop Now <ArrowRight className="h-4 w-4" />
            </Link>

          </div>
        </div>
      </section>
    </>
  );
}
