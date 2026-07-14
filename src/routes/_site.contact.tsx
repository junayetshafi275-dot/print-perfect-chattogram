import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Mail, MapPin, Phone, Send, Clock } from "lucide-react";
import { services } from "@/lib/services-data";

export const Route = createFileRoute("/_site/contact")({
  head: () => ({
    meta: [
      { title: "Contact Friends Printers — Request a Print Quote in Chattogram" },
      {
        name: "description",
        content:
          "Request a quote or get in touch with Friends Printers in Anderkilla, Chattogram. Fast responses on business, marketing and custom print jobs.",
      },
      { property: "og:title", content: "Contact Friends Printers — Get a Print Quote" },
      {
        property: "og:description",
        content:
          "Reach out for quotes, consultations or custom printing enquiries in Chattogram.",
      },
      { property: "og:url", content: "/contact" },
    ],
    links: [{ rel: "canonical", href: "/contact" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "LocalBusiness",
          name: "Friends Printers",
          address: {
            "@type": "PostalAddress",
            streetAddress: "Anderkilla",
            addressLocality: "Chattogram",
            addressCountry: "BD",
          },
          url: "/contact",
        }),
      },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const [sent, setSent] = useState(false);

  return (
    <>
      <section className="border-b border-border bg-paper">
        <div className="container-x py-20 max-w-3xl">
          <p className="text-xs uppercase tracking-[0.2em] text-primary font-medium">Contact</p>
          <h1 className="mt-3 text-4xl sm:text-5xl text-ink">
            Request a quote or start a conversation.
          </h1>
          <p className="mt-4 text-lg text-ink-soft leading-relaxed">
            Tell us about your project — quantity, size, paper, finish, or just
            an idea. We'll come back with a clear quote and a realistic
            timeline.
          </p>
        </div>
      </section>

      <div className="container-x py-16 grid gap-12 lg:grid-cols-5">
        <aside className="lg:col-span-2 space-y-6">
          {[
            {
              icon: MapPin,
              label: "Visit us",
              value: "Anderkilla, Chattogram, Bangladesh",
              hint: "Chattogram's printing district",
            },
            {
              icon: Phone,
              label: "Call",
              value: "+880 1XXX-XXXXXX",
              hint: "Sat – Thu, business hours",
            },
            {
              icon: Mail,
              label: "Email",
              value: "hello@friendsprinters.com",
              hint: "Replies within one business day",
            },
            {
              icon: Clock,
              label: "Hours",
              value: "9:00 AM – 8:00 PM",
              hint: "Closed Fridays",
            },
          ].map((c) => (
            <div key={c.label} className="p-6 rounded-xl border border-border bg-background">
              <div className="flex items-start gap-4">
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-accent text-primary">
                  <c.icon className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wider text-ink-soft">{c.label}</div>
                  <div className="mt-1 font-display text-lg text-ink">{c.value}</div>
                  <div className="text-sm text-ink-soft">{c.hint}</div>
                </div>
              </div>
            </div>
          ))}
        </aside>

        <div className="lg:col-span-3">
          <form
            className="p-8 rounded-2xl border border-border bg-background shadow-soft"
            onSubmit={(e) => {
              e.preventDefault();
              setSent(true);
            }}
          >
            {sent ? (
              <div className="py-16 text-center">
                <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-accent text-primary">
                  <Send className="h-6 w-6" />
                </div>
                <h3 className="mt-6 font-display text-2xl text-ink">Thanks — message received</h3>
                <p className="mt-2 text-ink-soft max-w-sm mx-auto">
                  Your enquiry just landed on the press-room desk. A real human from Anderkilla will reply within one business day — usually much sooner.
                </p>
              </div>
            ) : (
              <>
                <h2 className="font-display text-2xl text-ink">Request a Quote</h2>
                <p className="mt-2 text-sm text-ink-soft">
                  Share a few details — we'll take it from there.
                </p>

                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <Field label="Full name" name="name" required />
                  <Field label="Phone" name="phone" type="tel" required />
                  <Field label="Email" name="email" type="email" className="sm:col-span-2" required />

                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-ink mb-1.5">Service</label>
                    <select
                      name="service"
                      className="w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                    >
                      <option>Select a category</option>
                      {services.map((s) => (
                        <option key={s.slug}>{s.title}</option>
                      ))}
                      <option>Not sure — please advise</option>
                    </select>
                  </div>

                  <Field label="Quantity" name="quantity" placeholder="e.g. 500 pcs" />
                  <Field label="Preferred deadline" name="deadline" type="date" />

                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-ink mb-1.5">Project details</label>
                    <textarea
                      name="details"
                      rows={5}
                      placeholder="Size, paper, finishing, colours, or anything else we should know…"
                      className="w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="mt-6 w-full inline-flex items-center justify-center gap-2 rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:opacity-90 transition"
                >
                  Send Enquiry <Send className="h-4 w-4" />
                </button>
              </>
            )}
          </form>
        </div>
      </div>
    </>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
  placeholder,
  className = "",
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <label htmlFor={name} className="block text-sm font-medium text-ink mb-1.5">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        className="w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm text-ink placeholder:text-ink-soft/60 focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
      />
    </div>
  );
}
