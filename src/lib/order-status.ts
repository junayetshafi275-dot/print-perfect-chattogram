import type { Database } from "@/integrations/supabase/types";

export type OrderStatus = Database["public"]["Enums"]["order_status"];

/** The canonical customer-facing order journey, in order. */
export const ORDER_FLOW: OrderStatus[] = [
  "received",
  "production",
  "shipped",
  "in_city",
  "at_hub",
  "ready_for_pickup",
  "delivered",
];

export const STATUS_LABEL: Record<OrderStatus, string> = {
  received: "Order Received",
  production: "In Production",
  shipped: "Shipped",
  in_city: "Arrived in City",
  at_hub: "At Local Hub",
  ready_for_pickup: "Ready for Pickup / Out for Delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export const STATUS_BLURB: Record<OrderStatus, string> = {
  received: "We have your order and our team is checking the artwork.",
  production: "On the press in Anderkilla — printing and finishing underway.",
  shipped: "Packed and handed to the courier.",
  in_city: "Your parcel has reached your city.",
  at_hub: "Sitting at your local hub, waiting for the last leg.",
  ready_for_pickup: "Ready to collect, or with the rider for delivery today.",
  delivered: "Delivered. Thank you for printing with Friends Printers.",
  cancelled: "This order was cancelled. Call us and we'll sort it out.",
};

/** Label with the destination city filled in, when we know it. */
export function statusLabel(status: OrderStatus, city?: string | null) {
  if (status === "in_city" && city) return `Arrived in ${city}`;
  return STATUS_LABEL[status];
}

export function stageIndex(status: OrderStatus) {
  return ORDER_FLOW.indexOf(status);
}
