import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Award,
  Clock,
  HandCoins,
  Layers,
  MapPin,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import heroImg from "@/assets/hero-print.jpg";
import { services } from "@/lib/services-data";

export const Route = createFileRoute("/_site/")({
  component: HomePage,
});

const values = [
  { icon: Award, title: "Quality First", desc: "Meticulous craftsmanship on every job, from proof to press." },
  { icon: Users, title: "Customer Satisfaction", desc: "Friendly, consultative service from first enquiry to final delivery." },
  { icon: HandCoins, title: "Honest Pricing", desc: "Transparent quotes with no surprises — real value for real work." },
  { icon: Clock, title: "Fast Turnaround", desc: "Efficient workflows for both short and large print runs." },
  { icon: Sparkles, title: "Attention to Detail", desc: "Colour accuracy, crisp finishing, and consistent results." },
  { icon: ShieldCheck, title: "Reliable Delivery", desc: "Dependable timelines you can build a launch around." },
];

function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="container-x pt-16 pb-20 md:pt-24 md:pb-28 grid gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-accent px-3 py-1 text-xs font-medium text-primary">
              <MapPin className="h-3.5 w-3.5" />
              Anderkilla · Chattogram · Bangladesh
            </span>
            <h1 className="mt-6 text-4xl sm:text-5xl lg:text-6xl leading-[1.05] text-ink">
              Professional Printing
              <br />
              Solutions for{" "}
              <span className="text-primary">Every Need</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg text-ink-soft leading-relaxed">
              From business essentials to custom print projects, Friends
              Printers delivers dependable quality, precision, and service from
              the heart of Chattogram's printing district.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-soft hover:opacity-90 transition"
              >
                Request a Quote <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/services"
                className="inline-flex items-center gap-2 rounded-md border border-border bg-background px-6 py-3 text-sm font-medium text-ink hover:bg-accent transition"
              >
                Explore Services
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 rounded-md px-6 py-3 text-sm font-medium text-ink-soft hover:text-primary transition"
              >
                Contact Us
              </Link>
            </div>

            <dl className="mt-12 grid grid-cols-3 gap-6 max-w-md">
              <div>
                <dt className="text-xs uppercase tracking-wider text-ink-soft">Years</dt>
                <dd className="mt-1 font-display text-2xl text-ink">Trusted</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wider text-ink-soft">Runs</dt>
                <dd className="mt-1 font-display text-2xl text-ink">Any size</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wider text-ink-soft">Finish</dt>
                <dd className="mt-1 font-display text-2xl text-ink">Premium</dd>
              </div>
            </dl>
          </div>

          <div className="relative">
            <div className="absolute -inset-6 bg-gradient-to-br from-primary/10 to-transparent rounded-3xl blur-2xl" />
            <div className="relative overflow-hidden rounded-2xl shadow-elegant ring-1 ring-border">
              <img
                src={heroImg}
                alt="Offset printing press at Friends Printers producing colour sheets"
                width={1600}
                height={1200}
                className="w-full h-auto object-cover"
              />
            </div>
            <div className="hidden md:block absolute -bottom-6 -left-6 bg-background border border-border rounded-xl p-4 shadow-soft max-w-xs">
              <div className="flex items-center gap-3">
                <Layers className="h-8 w-8 text-primary" />
                <div>
                  <div className="text-sm font-medium text-ink">Offset + Digital</div>
                  <div className="text-xs text-ink-soft">Best of both worlds</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services preview */}
      <section className="border-t border-border bg-paper">
        <div className="container-x py-20">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-primary font-medium">What we print</p>
              <h2 className="mt-3 text-3xl sm:text-4xl text-ink">
                A full-service print house under one roof
              </h2>
            </div>
            <Link
              to="/services"
              className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:gap-3 transition-all"
            >
              View all services <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {services.map((s) => (
              <article
                key={s.slug}
                className="group overflow-hidden rounded-xl bg-background border border-border hover:shadow-elegant hover:-translate-y-1 transition-all duration-300"
              >
                <div className="aspect-[4/3] overflow-hidden">
                  <img
                    src={s.image}
                    alt={s.title}
                    loading="lazy"
                    width={1024}
                    height={768}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-6">
                  <h3 className="font-display text-xl text-ink">{s.title}</h3>
                  <p className="mt-2 text-sm text-ink-soft">{s.tagline}</p>
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {s.items.slice(0, 4).map((it) => (
                      <span key={it} className="text-xs px-2 py-1 rounded-full bg-muted text-ink-soft">
                        {it}
                      </span>
                    ))}
                    {s.items.length > 4 && (
                      <span className="text-xs px-2 py-1 rounded-full bg-accent text-primary font-medium">
                        +{s.items.length - 4} more
                      </span>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="border-t border-border">
        <div className="container-x py-20">
          <div className="max-w-2xl">
            <p className="text-xs uppercase tracking-[0.2em] text-primary font-medium">Why Friends Printers</p>
            <h2 className="mt-3 text-3xl sm:text-4xl text-ink">
              Craftsmanship you can trust, service you can rely on
            </h2>
            <p className="mt-4 text-ink-soft leading-relaxed">
              Located in the heart of Anderkilla — Chattogram's renowned
              printing district — we combine skilled press work with a network
              of specialised finishing partners to deliver dependable results
              on every project.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {values.map((v) => (
              <div key={v.title} className="group p-6 rounded-xl border border-border bg-background hover:border-primary/40 transition-colors">
                <div className="grid h-11 w-11 place-items-center rounded-lg bg-accent text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <v.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-display text-lg text-ink">{v.title}</h3>
                <p className="mt-2 text-sm text-ink-soft leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Location strip */}
      <section className="border-t border-border bg-ink text-primary-foreground">
        <div className="container-x py-16 grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-primary font-medium">Anderkilla advantage</p>
            <h2 className="mt-3 text-3xl sm:text-4xl text-white">
              Built inside Chattogram's printing district
            </h2>
            <p className="mt-4 text-white/70 leading-relaxed">
              Our Anderkilla location gives us direct access to a rich local
              ecosystem of binding, laminating, die-cutting and finishing
              specialists — enabling reliable production workflows and
              competitive turnaround times for every project.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              ["Binding", "Perfect, saddle, spiral"],
              ["Laminating", "Matte, gloss, soft-touch"],
              ["Die-cutting", "Custom shapes & shapes"],
              ["Foil & UV", "Premium finishing touches"],
            ].map(([t, d]) => (
              <div key={t} className="rounded-lg border border-white/10 bg-white/5 p-5">
                <div className="font-display text-lg text-white">{t}</div>
                <div className="text-sm text-white/60 mt-1">{d}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section>
        <div className="container-x py-20 text-center">
          <h2 className="text-3xl sm:text-4xl text-ink max-w-2xl mx-auto">
            Have a project in mind? Let's bring it to print.
          </h2>
          <p className="mt-4 text-ink-soft max-w-xl mx-auto">
            Share your requirements and we'll get back with a tailored quote,
            paper recommendations, and a realistic timeline.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-soft hover:opacity-90 transition"
            >
              Request a Quote <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/services"
              className="inline-flex items-center gap-2 rounded-md border border-border px-6 py-3 text-sm font-medium text-ink hover:bg-accent transition"
            >
              Explore Services
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
