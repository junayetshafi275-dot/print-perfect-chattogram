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
  if (!key || key.length > 300 || key.includes("\\") || /[\u0000-\u001f]/.test(key)) return commercial;
  if (PRODUCT_IMAGES[key]) return PRODUCT_IMAGES[key];
  if (key.startsWith("/") && !key.startsWith("//")) return key;
  try {
    const url = new URL(key);
    if (url.protocol === "https:") return url.href;
  } catch {
    // Unknown image keys should safely fall back to the bundled default.
  }
  return commercial;
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
