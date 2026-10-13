import { z } from "zod";

export const bdPhone = z
  .string()
  .trim()
  .transform((v) => v.replace(/[\s-]/g, ""))
  .refine((v) => /^(?:\+?880|0)1[3-9]\d{8}$/.test(v), {
    message: "Enter a valid Bangladeshi mobile number, e.g. 01712345678.",
  });

/**
 * Product image locations can be a known bundled asset key, a same-origin
 * relative path, or an absolute HTTPS URL. Everything else (javascript:,
 * data:, file:, ftp:, protocol-relative //host, and backslash tricks) is
 * rejected before it can reach an image src.
 */
const builtInImageKeys = new Set(["commercial", "office", "marketing", "education", "event", "custom"]);

export const imageUrlSchema = z
  .string()
  .trim()
  .max(300)
  .refine((value) => {
    if (builtInImageKeys.has(value)) return true;
    if (value.includes("\\") || /[\u0000-\u001f]/.test(value)) return false;
    if (value.startsWith("//")) return false; // protocol-relative
    if (value.startsWith("/")) return true; // same-origin relative path
    let url: URL;
    try {
      url = new URL(value);
    } catch {
      return false;
    }
    return url.protocol === "https:";
  }, "Use a built-in image key, a relative path like /assets/photo.jpg, or a full https:// address.");

export const enquirySchema = z.object({
  name: z.string().trim().min(2, "Please enter your full name.").max(100),
  phone: bdPhone,
  email: z.union([z.string().trim().email("Enter a valid email address.").max(255), z.literal("")]).optional(),
  message: z.string().trim().min(10, "Tell us a little more about your project.").max(2000),
  /** Hidden honeypot — real people never fill this in. */
  company_website: z.string().max(200).optional(),
  /** Cloudflare Turnstile token, when the widget is configured. */
  captchaToken: z.string().max(4000).optional(),
});

export const paymentMethods = [
  "bkash",
  "nagad",
  "rocket",
  "card",
  "bank",
  "cash_on_pickup",
] as const;

export const checkoutSchema = z.object({
  name: z.string().trim().min(2, "Please enter your full name.").max(100),
  phone: bdPhone,
  email: z.union([z.string().trim().email("Enter a valid email address.").max(255), z.literal("")]).optional(),
  address: z.string().trim().min(10, "Please enter a full delivery address including your city.").max(500),
  paymentMethod: z.enum(paymentMethods),
  items: z
    .array(
      z.object({
        slug: z
          .string()
          .trim()
          .min(1)
          .max(80)
          .regex(/^[a-z0-9-]+$/, "That product reference isn't valid."),
        quantity: z.number().int().min(1).max(999),
      }),
    )
    .min(1, "Your cart is empty.")
    .max(50),
});

// Order numbers are sequential and phone numbers are often known to others, so
// neither alone unlocks an order. A lookup needs EITHER the unguessable
// tracking token from the confirmation link, OR order number + phone together.
export const trackingTokenSchema = z
  .string()
  .trim()
  .regex(/^[a-f0-9]{64}$/, "That tracking link looks incomplete.");

export const trackSchema = z.union([
  z.object({ token: trackingTokenSchema }),
  z.object({
    orderNumber: z
      .string()
      .trim()
      .min(3, "Enter the order number from your receipt.")
      .max(32)
      .regex(/^[A-Za-z0-9-]+$/, "Order numbers look like FP-2847."),
    phone: z
      .string()
      .trim()
      .min(8, "Enter the phone number used on the order.")
      .max(24),
  }),
]);

export function firstIssue(error: z.ZodError) {
  return error.issues[0]?.message ?? "Please check the details and try again.";
}
