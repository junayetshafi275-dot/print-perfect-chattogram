import commercial from "@/assets/commercial.jpg";
import office from "@/assets/office.jpg";
import marketing from "@/assets/marketing.jpg";
import education from "@/assets/education.jpg";
import event from "@/assets/event.jpg";
import custom from "@/assets/custom.jpg";
import { Briefcase, Megaphone, Sparkles, Palette, type LucideIcon } from "lucide-react";

/** Image keys stored in products.image_url map to bundled assets. */
export const PRODUCT_IMAGES: Record<string, string> = {
  commercial,
  office,
  marketing,
  education,
  event,
  custom,
};

export function productImage(key: string | null | undefined) {
  return (key && PRODUCT_IMAGES[key]) || commercial;
}

export const CATEGORY_META: Record<string, { title: string; eyebrow: string; icon: LucideIcon }> = {
  "business-essentials": { title: "Business Essentials", eyebrow: "Everyday essentials", icon: Briefcase },
  marketing: { title: "Marketing & Promotion", eyebrow: "Reach & attract", icon: Megaphone },
  events: { title: "Events & Invitations", eyebrow: "Occasions & moments", icon: Sparkles },
  custom: { title: "Custom & Bespoke Print", eyebrow: "Made-to-order", icon: Palette },
};

export const CATEGORY_ORDER = ["business-essentials", "marketing", "events", "custom"];

export function formatBDT(n: number) {
  return `৳${Number(n).toLocaleString("en-BD")}`;
}
