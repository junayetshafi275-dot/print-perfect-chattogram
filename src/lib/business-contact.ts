/**
 * Single source of truth for public business contact details.
 *
 * Only put VERIFIED details here. Any value left as `null` is treated as
 * "not yet confirmed" and the site shows a neutral "coming soon" message plus
 * the contact form instead of a made-up number or address.
 */
export const BUSINESS_CONTACT: {
  /** Display phone, e.g. "+880 1711-000000". */
  phone: string | null;
  /** International digits only for wa.me links, e.g. "8801711000000". */
  whatsapp: string | null;
  email: string | null;
  /** Street-level address. The area below is from the owner's brief. */
  streetAddress: string | null;
  area: string;
  hours: string | null;
} = {
  phone: null,
  whatsapp: null,
  email: null,
  streetAddress: null,
  area: "Anderkilla, Chattogram, Bangladesh",
  hours: null,
};

export const CONTACT_COMING_SOON = "Contact details coming soon — please use the enquiry form.";

export function whatsappLink(text: string): string | null {
  const n = BUSINESS_CONTACT.whatsapp;
  if (!n || !/^\d{10,15}$/.test(n)) return null;
  return `https://wa.me/${n}?text=${encodeURIComponent(text)}`;
}
