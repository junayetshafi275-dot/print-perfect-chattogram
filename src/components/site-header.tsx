import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X, Facebook, Instagram, Youtube, ShoppingBag } from "lucide-react";
import logo from "@/assets/friends-printers-logo.png";
import { useCart } from "@/lib/cart";

function CartButton({ onNavigate }: { onNavigate?: () => void }) {
  const { count } = useCart();
  return (
    <Link
      to="/cart"
      onClick={onNavigate}
      className="relative inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm text-ink hover:border-primary hover:text-primary transition"
      aria-label={`Cart, ${count} item${count === 1 ? "" : "s"}`}
    >
      <ShoppingBag className="h-4 w-4" />
      <span className="hidden xl:inline">Cart</span>
      {count > 0 && (
        <span className="grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground">
          {count}
        </span>
      )}
    </Link>
  );
}

const nav = [
  { to: "/", label: "Home" },
  { to: "/shop", label: "Shop" },
  { to: "/track", label: "Track Order" },
  { to: "/about", label: "About" },
  { to: "/blog", label: "Blog" },
  { to: "/contact", label: "Contact" },
];

const socials = [
  { href: "https://facebook.com", label: "Facebook", Icon: Facebook },
  { href: "https://instagram.com", label: "Instagram", Icon: Instagram },
  { href: "https://youtube.com", label: "YouTube", Icon: Youtube },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/85 backdrop-blur">
      <div className="container-x flex h-20 items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-3 shrink-0" aria-label="Friends Printers home">
          <img
            src={logo}
            alt="Friends Printers"
            className="h-12 w-auto md:h-14"
          />
        </Link>

        <nav className="hidden lg:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="text-sm text-ink-soft hover:text-primary transition-colors [&.active]:text-primary [&.active]:font-medium"
              activeOptions={{ exact: n.to === "/" }}
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-4">
          <div className="flex items-center gap-3 pr-4 border-r border-border">
            {socials.map(({ href, label, Icon }) => (
              <a key={label} href={href} target="_blank" rel="noreferrer" aria-label={label} className="text-ink-soft hover:text-primary transition-colors">
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
          <Link
            to="/contact"
            className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-soft hover:opacity-90 transition"
          >
            Request Quote
          </Link>
        </div>

        <button
          className="lg:hidden inline-flex items-center justify-center rounded-md p-2 text-ink"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="lg:hidden border-t border-border bg-background">
          <div className="container-x py-4 flex flex-col gap-2">
            {nav.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                onClick={() => setOpen(false)}
                className="text-sm py-2 text-ink-soft [&.active]:text-primary"
                activeOptions={{ exact: n.to === "/" }}
              >
                {n.label}
              </Link>
            ))}
            <div className="flex items-center gap-4 py-3">
              {socials.map(({ href, label, Icon }) => (
                <a key={label} href={href} target="_blank" rel="noreferrer" aria-label={label} className="text-ink-soft">
                  <Icon className="h-5 w-5" />
                </a>
              ))}
            </div>
            <Link
              to="/contact"
              onClick={() => setOpen(false)}
              className="inline-flex justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
            >
              Request Quote
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
