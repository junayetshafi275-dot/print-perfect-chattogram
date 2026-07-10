import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Target, Eye, Heart } from "lucide-react";
import aboutImg from "@/assets/about.jpg";

export const Route = createFileRoute("/_site/about")({
  head: () => ({
    meta: [
      { title: "About Friends Printers — Anderkilla, Chattogram" },
      {
        name: "description",
        content:
          "Friends Printers is a full-service printing company in Anderkilla, Chattogram — combining craftsmanship, efficient production and dependable service.",
      },
      { property: "og:title", content: "About Friends Printers" },
      {
        property: "og:description",
        content:
          "Trusted printing partner in Chattogram's printing district, delivering quality print for businesses, schools and individuals.",
      },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <>
      <section className="border-b border-border">
        <div className="container-x py-20 grid gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-primary font-medium">About us</p>
            <h1 className="mt-3 text-4xl sm:text-5xl text-ink leading-tight">
              A trusted print house in the heart of Anderkilla.
            </h1>
            <p className="mt-5 text-lg text-ink-soft leading-relaxed">
              Friends Printers is a full-service printing company based in
              Anderkilla — widely recognised as the centre of Chattogram's
              printing industry. We combine skilled craftsmanship, efficient
              production and dependable customer service to deliver
              professional printing solutions for businesses, educational
              institutions, organisations and individual customers.
            </p>
            <p className="mt-4 text-ink-soft leading-relaxed">
              Being located inside one of Bangladesh's most established
              printing districts gives us direct access to specialised
              finishing services — binding, laminating, die-cutting and
              post-press processes — supporting reliable workflows and
              competitive turnaround times.
            </p>
          </div>
          <div className="overflow-hidden rounded-2xl border border-border shadow-elegant">
            <img
              src={aboutImg}
              alt="Interior of the Friends Printers workshop"
              loading="lazy"
              width={1408}
              height={1008}
              className="w-full h-auto object-cover"
            />
          </div>
        </div>
      </section>

      <section className="border-b border-border bg-paper">
        <div className="container-x py-20 grid gap-8 md:grid-cols-3">
          {[
            {
              icon: Target,
              label: "Mission",
              body:
                "To provide high-quality, reliable and affordable printing solutions while helping our customers bring their ideas, brands and businesses to life through exceptional print craftsmanship.",
            },
            {
              icon: Eye,
              label: "Vision",
              body:
                "To become one of Chattogram's most trusted printing partners by combining quality, innovation, customer satisfaction and continuous improvement.",
            },
            {
              icon: Heart,
              label: "Approach",
              body:
                "We treat every job — small or large — as an opportunity to build a long-term relationship. Honest pricing, attention to detail, and reliable delivery on every project.",
            },
          ].map((b) => (
            <div key={b.label} className="p-8 rounded-2xl bg-background border border-border">
              <div className="grid h-11 w-11 place-items-center rounded-lg bg-primary text-primary-foreground">
                <b.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-5 font-display text-2xl text-ink">{b.label}</h3>
              <p className="mt-3 text-ink-soft leading-relaxed">{b.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="container-x py-20">
          <div className="max-w-2xl">
            <p className="text-xs uppercase tracking-[0.2em] text-primary font-medium">Core values</p>
            <h2 className="mt-3 text-3xl sm:text-4xl text-ink">
              The principles behind every job we print.
            </h2>
          </div>
          <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              "Quality First",
              "Customer Satisfaction",
              "Honest Pricing",
              "Fast Turnaround",
              "Attention to Detail",
              "Professional Service",
              "Reliable Delivery",
              "Long-Term Relationships",
            ].map((v, i) => (
              <li
                key={v}
                className="group p-6 rounded-xl border border-border hover:border-primary hover:bg-accent/40 transition-colors"
              >
                <div className="font-display text-3xl text-primary/70 group-hover:text-primary">
                  {String(i + 1).padStart(2, "0")}
                </div>
                <div className="mt-2 font-medium text-ink">{v}</div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="border-t border-border bg-ink text-primary-foreground">
        <div className="container-x py-16 flex flex-wrap items-center justify-between gap-6">
          <div>
            <h2 className="text-3xl text-white">Let's print something great together.</h2>
            <p className="mt-2 text-white/70">Get a fast quote for your next project.</p>
          </div>
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:opacity-90 transition"
          >
            Request a Quote <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </>
  );
}
