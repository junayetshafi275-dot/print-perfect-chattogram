import { useState, useEffect } from "react";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";

type Review = {
  name: string;
  company?: string;
  quote: string;
  rating: number;
  initials: string;
};

const reviews: Review[] = [
  { name: "Rezaul Karim", company: "Karim Trading Co.", initials: "RK", rating: 5, quote: "Business cards and letterheads came out sharper than we expected. Delivery was on time and pricing was fair." },
  { name: "Farhana Akter", company: "Bloom Events", initials: "FA", rating: 5, quote: "Our wedding invitations were absolutely beautiful. The gold foil finish felt premium — every guest complimented them." },
  { name: "Mahmud Hasan", company: "Chattogram School", initials: "MH", rating: 5, quote: "We print all our exam papers, certificates and diaries with Friends Printers. Consistent quality year after year." },
  { name: "Tanvir Ahmed", company: "Grand Restaurant", initials: "TA", rating: 5, quote: "Menu cards and banners for our launch — turnaround was under two days. Highly recommend for any small business." },
  { name: "Sadia Rahman", initials: "SR", rating: 5, quote: "Ordered custom stickers and packaging for my online store. Colours are vivid and the finish is professional." },
  { name: "Iqbal Chowdhury", company: "IC Real Estate", initials: "IC", rating: 4, quote: "Roll-up stands and brochures for our office. Friendly team, good advice on paper and finish options." },
];

export function ReviewCarousel() {
  const [index, setIndex] = useState(0);
  const [perView, setPerView] = useState(3);

  useEffect(() => {
    const update = () => setPerView(window.innerWidth < 768 ? 1 : window.innerWidth < 1024 ? 2 : 3);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const max = reviews.length - perView;

  useEffect(() => {
    const t = setInterval(() => setIndex((i) => (i >= max ? 0 : i + 1)), 5000);
    return () => clearInterval(t);
  }, [max]);

  const step = 100 / perView;

  return (
    <div className="relative">
      <div className="overflow-hidden">
        <div
          className="flex transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${index * step}%)` }}
        >
          {reviews.map((r, i) => (
            <div key={i} className="shrink-0 px-3" style={{ width: `${step}%` }}>
              <div className="h-full rounded-xl border border-border bg-background p-6 shadow-soft">
                <div className="flex items-center gap-1 text-primary">
                  {Array.from({ length: r.rating }).map((_, k) => (
                    <Star key={k} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <p className="mt-4 text-sm text-ink-soft leading-relaxed">"{r.quote}"</p>
                <div className="mt-5 flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-full bg-accent font-display text-sm font-semibold text-primary">
                    {r.initials}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-ink">{r.name}</div>
                    {r.company && <div className="text-xs text-ink-soft">{r.company}</div>}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 flex items-center justify-center gap-2">
        <button
          onClick={() => setIndex((i) => Math.max(0, i - 1))}
          aria-label="Previous reviews"
          className="grid h-9 w-9 place-items-center rounded-full border border-border bg-background text-ink hover:bg-accent hover:text-primary transition"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button
          onClick={() => setIndex((i) => Math.min(max, i + 1))}
          aria-label="Next reviews"
          className="grid h-9 w-9 place-items-center rounded-full border border-border bg-background text-ink hover:bg-accent hover:text-primary transition"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
