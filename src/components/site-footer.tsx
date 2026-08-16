import { Link } from "@tanstack/react-router";
import { Facebook, Instagram, Youtube } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="mt-24 bg-ink text-primary-foreground">
      <div className="container-x py-16 grid gap-10 md:grid-cols-4">
        <div className="md:col-span-2 max-w-md">
          <div className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-md bg-primary text-primary-foreground font-display text-lg font-semibold">F</span>
            <span className="font-display text-lg">Friends Printers</span>
          </div>
          <p className="mt-4 text-sm text-white/70 leading-relaxed">
            Trusted printing partner in Anderkilla, Chattogram — quality craftsmanship, honest pricing, and dependable delivery for every job.
          </p>
          <div className="mt-5 flex items-center gap-4 text-white/70">
            <a href="https://facebook.com" aria-label="Facebook" className="hover:text-primary"><Facebook className="h-4 w-4" /></a>
            <a href="https://instagram.com" aria-label="Instagram" className="hover:text-primary"><Instagram className="h-4 w-4" /></a>
            <a href="https://youtube.com" aria-label="YouTube" className="hover:text-primary"><Youtube className="h-4 w-4" /></a>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium text-white">Quick Links</h4>
          <ul className="mt-4 space-y-2 text-sm text-white/70">
            <li><Link to="/about" className="hover:text-primary">About</Link></li>
            <li><Link to="/services" className="hover:text-primary">Services</Link></li>
            <li><Link to="/contact" className="hover:text-primary">Contact</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-medium text-white">Site Map</h4>
          <ul className="mt-4 space-y-2 text-sm text-white/70">
            <li><Link to="/" className="hover:text-primary">Home</Link></li>
            <li><Link to="/shop" className="hover:text-primary">Shop</Link></li>
            <li><Link to="/blog" className="hover:text-primary">Blog</Link></li>
            <li><Link to="/track" className="hover:text-primary">Track Order</Link></li>
            <li><Link to="/auth" className="hover:text-primary">Staff Login</Link></li>

          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container-x py-6 text-xs text-white/50 flex flex-wrap items-center justify-between gap-2">
          <span>© {new Date().getFullYear()} Friends Printers. All rights reserved.</span>
          <span>Anderkilla · Chattogram · Bangladesh</span>
        </div>
      </div>
    </footer>
  );
}
