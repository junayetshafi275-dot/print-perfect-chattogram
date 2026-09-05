import { z } from "zod";

export const bdPhone = z
  .string()
  .trim()
  .transform((v) => v.replace(/[\s-]/g, ""))
  .refine((v) => /^(?:\+?880|0)1[3-9]\d{8}$/.test(v), {
    message: "Enter a valid Bangladeshi mobile number, e.g. 01712345678.",
  });

export const enquirySchema = z.object({
  name: z.string().trim().min(2, "Please enter your full name.").max(100),
  phone: bdPhone,
  email: z.union([z.string().trim().email("Enter a valid email address.").max(255), z.literal("")]).optional(),
  message: z.string().trim().min(10, "Tell us a little more about your project.").max(2000),
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
        slug: z.string().trim().min(1).max(80),
        quantity: z.number().int().min(1).max(999),
      }),
    )
    .min(1, "Your cart is empty.")
    .max(50),
});

// The phone number on the order is the shared secret for tracking. Order
// numbers are sequential, so an order-number-only lookup would let anyone walk
// the counter and read every order — phone is therefore always required.
export const trackSchema = z.object({
  orderNumber: z.string().trim().max(32).optional(),
  phone: z
    .string()
    .trim()
    .min(8, "Enter the phone number used on the order.")
    .max(24),
});


export function firstIssue(error: z.ZodError) {
  return error.issues[0]?.message ?? "Please check the details and try again.";
}
