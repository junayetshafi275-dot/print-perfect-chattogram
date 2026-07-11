import { Eye } from "lucide-react";
import type { Product } from "@/lib/products-data";
import { Link } from "@tanstack/react-router";

function formatPrice(n: number) {
  if (n === 0) return "Get Quote";
  return `৳${n.toLocaleString("en-BD")}`;
}

export function ProductCard({ product }: { product: Product }) {
  const onSale = product.originalPrice && product.originalPrice > product.price;
  return (
    <article className="group relative flex flex-col overflow-hidden rounded-xl bg-background border border-border transition-all duration-300 hover:-translate-y-1 hover:shadow-elegant">
      <div className="relative aspect-square overflow-hidden bg-muted">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {product.badge && (
          <span className="absolute top-3 left-3 rounded-full bg-primary px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-primary-foreground shadow-soft">
            {product.badge}
          </span>
        )}
        <Link
          to="/contact"
          className="absolute inset-x-3 bottom-3 inline-flex items-center justify-center gap-2 rounded-md bg-background/95 px-3 py-2 text-xs font-medium text-ink opacity-0 backdrop-blur transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0 translate-y-2 hover:bg-primary hover:text-primary-foreground"
        >
          <Eye className="h-3.5 w-3.5" /> Quick View
        </Link>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <div className="text-[11px] uppercase tracking-wider text-ink-soft">{product.category}</div>
        <h3 className="mt-1 text-sm font-medium text-ink leading-snug line-clamp-2">{product.name}</h3>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="font-display text-base font-semibold text-primary">{formatPrice(product.price)}</span>
          {onSale && (
            <span className="text-xs text-ink-soft/70 line-through">
              ৳{product.originalPrice!.toLocaleString("en-BD")}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
