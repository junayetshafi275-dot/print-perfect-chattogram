import { getRequestUrl } from "@tanstack/react-start/server";

type InitArgs = {
  orderId: string;
  orderNumber: string;
  amount: number;
  customerName: string;
  customerPhone: string;
  customerEmail: string | null;
  address: string;
  paymentMethod: string;
};

export function sslcommerzConfig() {
  const storeId = process.env["SSLCZ_STORE_ID"];
  const storePassword = process.env["SSLCZ_STORE_PASSWORD"];
  const sandbox = process.env["SSLCZ_SANDBOX"] !== "false";
  const host = sandbox ? "https://sandbox.sslcommerz.com" : "https://securepay.sslcommerz.com";
  return {
    storeId,
    storePassword,
    configured: Boolean(storeId && storePassword),
    sessionUrl: `${host}/gwprocess/v4/api.php`,
    validationUrl: `${host}/validator/api/validationserverAPI.php`,
  };
}

/**
 * Creates an SSLCommerz hosted-checkout session.
 * Returns { url: null } when store credentials are not configured yet — the order
 * is still recorded and treated as a manual/offline payment.
 */
export async function initSslcommerzSession(
  args: InitArgs,
): Promise<{ url: string | null; note: string | null }> {
  const cfg = sslcommerzConfig();

  const offlineMethods = ["cash_on_pickup", "bank"];
  if (offlineMethods.includes(args.paymentMethod)) {
    return { url: null, note: "We'll confirm payment with you directly for this method." };
  }

  if (!cfg.configured) {
    return {
      url: null,
      note: "Online payment isn't live yet — our team will send you payment instructions on this number.",
    };
  }

  const origin = getRequestUrl().origin;
  const body = new URLSearchParams({
    store_id: cfg.storeId!,
    store_passwd: cfg.storePassword!,
    total_amount: args.amount.toFixed(2),
    currency: "BDT",
    tran_id: args.orderNumber,
    success_url: `${origin}/track?order=${encodeURIComponent(args.orderNumber)}`,
    fail_url: `${origin}/checkout?payment=failed`,
    cancel_url: `${origin}/checkout?payment=cancelled`,
    ipn_url: `${origin}/api/public/sslcommerz/ipn`,
    cus_name: args.customerName,
    cus_phone: args.customerPhone,
    cus_email: args.customerEmail ?? "noreply@friendsprinters.com",
    cus_add1: args.address,
    cus_city: "Chattogram",
    cus_country: "Bangladesh",
    shipping_method: "Courier",
    // SSLCommerz rejects the session when shipping_method is set without ship_* fields.
    ship_name: args.customerName,
    ship_add1: args.address,
    ship_city: "Chattogram",
    ship_postcode: "4000",
    ship_country: "Bangladesh",
    num_of_item: "1",
    product_name: `Friends Printers order ${args.orderNumber}`,
    product_category: "Printing",
    product_profile: "physical-goods",
    value_a: args.orderId,
  });

  try {
    // Hard timeout — the sandbox host stalls occasionally; never leave checkout hanging.
    const res = await fetch(cfg.sessionUrl, {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body,
      signal: AbortSignal.timeout(20_000),
    });
    const json = (await res.json()) as { status?: string; GatewayPageURL?: string; failedreason?: string };

    if (json.status !== "SUCCESS" || !json.GatewayPageURL) {
      console.error("[sslcommerz] session init failed", json.status, json.failedreason);
      return { url: null, note: "The payment gateway is unavailable — we'll contact you with payment details." };
    }
    return { url: json.GatewayPageURL, note: null };
  } catch (error) {
    console.error("[sslcommerz] session init error", error);
    return { url: null, note: "The payment gateway is unavailable — we'll contact you with payment details." };
  }
}

/** Server-to-server validation. Never trust the IPN payload on its own. */
export async function validateSslcommerzTransaction(valId: string) {
  const cfg = sslcommerzConfig();
  if (!cfg.configured) return null;

  const url = `${cfg.validationUrl}?val_id=${encodeURIComponent(valId)}&store_id=${encodeURIComponent(
    cfg.storeId!,
  )}&store_passwd=${encodeURIComponent(cfg.storePassword!)}&v=1&format=json`;

  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(15_000) });
    if (!res.ok) {
      console.error("[sslcommerz] validation http error", res.status);
      return null;
    }
    return (await res.json()) as {
      status?: string;
      tran_id?: string;
      amount?: string;
      currency?: string;
      bank_tran_id?: string;
      value_a?: string;
    };
  } catch (error) {
    console.error("[sslcommerz] validation error", error);
    return null;
  }
}
