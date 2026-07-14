import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import commercial from "@/assets/commercial.jpg";
import marketing from "@/assets/marketing.jpg";
import event from "@/assets/event.jpg";

export const Route = createFileRoute("/_site/blog")({
  head: () => ({
    meta: [
      { title: "Print Blog — Paper Guides & Design Tips | Friends Printers" },
      { name: "description", content: "Guides on paper, finishing, print design and getting the best results from your next print job — from the Friends Printers press floor." },
      { property: "og:title", content: "Print Tips & Ideas — Friends Printers Blog" },
      { property: "og:description", content: "Print tips, paper guides and ideas from Friends Printers in Chattogram." },
      { property: "og:url", content: "/blog" },
    ],
    links: [{ rel: "canonical", href: "/blog" }],
  }),
  component: BlogPage,
});

const posts = [
  { title: "Choosing the right paper weight for your business cards", excerpt: "300gsm, 350gsm or 400gsm? A quick guide to picking the right stock for your brand.", image: commercial, date: "Jun 2026" },
  { title: "Offset vs digital printing — which is right for you?", excerpt: "When each method makes sense and how to save money on your next print run.", image: marketing, date: "May 2026" },
  { title: "5 wedding invitation trends we're loving in 2026", excerpt: "From gold foil to modern minimal — the styles clients are asking for most.", image: event, date: "Apr 2026" },
];

function BlogPage() {
  return (
    <>
      <section className="border-b border-border bg-paper">
        <div className="container-x py-14 md:py-20 text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-primary font-medium">Blog</p>
          <h1 className="mt-3 font-display text-4xl sm:text-5xl text-ink">Ideas from the press floor</h1>
          <p className="mt-4 max-w-xl mx-auto text-ink-soft">Practical tips on paper, finishing and getting the most out of your print budget.</p>
        </div>
      </section>

      <section>
        <div className="container-x py-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((p) => (
            <article key={p.title} className="group overflow-hidden rounded-xl border border-border bg-background transition-all hover:-translate-y-1 hover:shadow-elegant">
              <div className="aspect-[4/3] overflow-hidden bg-muted">
                <img src={p.image} alt={p.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
              </div>
              <div className="p-6">
                <div className="text-xs uppercase tracking-wider text-ink-soft">{p.date}</div>
                <h2 className="mt-2 font-display text-xl text-ink leading-snug">{p.title}</h2>
                <p className="mt-2 text-sm text-ink-soft">{p.excerpt}</p>
                <Link to="/contact" className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:gap-2 transition-all">
                  Read more <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
