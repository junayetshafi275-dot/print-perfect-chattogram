import commercial from "@/assets/commercial.jpg";
import office from "@/assets/office.jpg";
import marketing from "@/assets/marketing.jpg";
import education from "@/assets/education.jpg";
import event from "@/assets/event.jpg";
import custom from "@/assets/custom.jpg";
import { Briefcase, Megaphone, Sparkles, Palette, type LucideIcon } from "lucide-react";

export type Product = {
  id: string;
  name: string;
  category: string;
  image: string;
  price: number;
  originalPrice?: number;
  badge?: string;
};

export type CategoryGrid = {
  slug: string;
  title: string;
  href: string;
  icon: LucideIcon;
  eyebrow: string;
  products: Product[];
};

export const productCategories: CategoryGrid[] = [
  {
    slug: "business-essentials",
    title: "Business Essentials",
    href: "/shop",
    icon: Briefcase,
    eyebrow: "Everyday essentials",
    products: [
      { id: "bc-premium", name: "Premium Business Cards (500)", category: "Business Cards", image: commercial, price: 1200, originalPrice: 1500, badge: "Bestseller" },
      { id: "bc-matte", name: "Matte Business Cards (500)", category: "Business Cards", image: commercial, price: 950 },
      { id: "letterhead", name: "Custom Letterheads (100)", category: "Stationery", image: office, price: 800 },
      { id: "envelopes", name: "Branded Envelopes (100)", category: "Stationery", image: office, price: 700 },
      { id: "brochure", name: "Tri-fold Brochures (250)", category: "Brochures", image: commercial, price: 2200, originalPrice: 2600 },
      { id: "folder", name: "Presentation Folders (100)", category: "Folders", image: commercial, price: 3500 },
    ],
  },
  {
    slug: "marketing",
    title: "Marketing & Promotion",
    href: "/shop",
    products: [
      { id: "poster-a3", name: "A3 Full-Colour Posters (50)", category: "Posters", image: marketing, price: 1400, badge: "Popular" },
      { id: "banner-vinyl", name: "Vinyl Banner (per sq. ft)", category: "Banners", image: marketing, price: 45 },
      { id: "rollup", name: "Roll-Up Stand (2x6 ft)", category: "Displays", image: marketing, price: 3200, originalPrice: 3800 },
      { id: "stickers-die", name: "Die-Cut Stickers (250)", category: "Stickers", image: marketing, price: 900 },
      { id: "flyer-a5", name: "A5 Flyers (500)", category: "Flyers", image: marketing, price: 1100 },
      { id: "label-roll", name: "Custom Product Labels (1000)", category: "Labels", image: marketing, price: 1800 },
    ],
  },
  {
    slug: "events",
    title: "Events & Invitations",
    href: "/shop",
    products: [
      { id: "wedding-classic", name: "Classic Wedding Invitation (100)", category: "Weddings", image: event, price: 2800, originalPrice: 3200, badge: "New" },
      { id: "wedding-foil", name: "Gold Foil Invitation (100)", category: "Weddings", image: event, price: 4500 },
      { id: "greeting", name: "Custom Greeting Cards (50)", category: "Cards", image: event, price: 950 },
      { id: "certificate", name: "Premium Certificates (25)", category: "Certificates", image: education, price: 750 },
      { id: "invite-corp", name: "Corporate Event Invites (100)", category: "Cards", image: event, price: 1600 },
      { id: "thank-you", name: "Thank You Cards (50)", category: "Cards", image: event, price: 650 },
    ],
  },
  {
    slug: "custom",
    title: "Custom & Bespoke Print",
    href: "/shop",
    products: [
      { id: "book", name: "Perfect-Bound Book Print", category: "Books", image: education, price: 0, badge: "Quote" },
      { id: "diary", name: "Custom Diary / Notebook", category: "Notebooks", image: office, price: 350 },
      { id: "packaging", name: "Custom Packaging Boxes", category: "Packaging", image: custom, price: 0, badge: "Quote" },
      { id: "menu", name: "Restaurant Menu Cards (100)", category: "Menus", image: custom, price: 1800 },
      { id: "id-card", name: "PVC ID Cards (50)", category: "ID Cards", image: office, price: 1500 },
      { id: "specialty", name: "Specialty Finish Print", category: "Bespoke", image: custom, price: 0, badge: "Quote" },
    ],
  },
];

export const allProducts: Product[] = productCategories.flatMap((c) => c.products);
