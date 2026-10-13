import { describe, it, expect } from "vitest";
import { imageUrlSchema, enquirySchema, trackSchema, checkoutSchema } from "../src/lib/validation";
import { buildCsp, securityHeaders, shouldSetFrameOptions } from "../src/lib/security-headers";
import { normalizeIp, normalizePhone } from "../src/lib/rate-limit.server";
import { __redactForTest, maskIdentifier } from "../src/lib/logging.server";

describe("product image validation", () => {
  it("accepts built-in image keys, relative paths and https URLs", () => {
    for (const key of ["commercial", "office", "marketing", "education", "event", "custom"]) {
      expect(imageUrlSchema.safeParse(key).success, key).toBe(true);
    }
    expect(imageUrlSchema.safeParse("/assets/card.jpg").success).toBe(true);
    expect(imageUrlSchema.safeParse("https://cdn.example.com/a.png").success).toBe(true);
  });

  it("rejects dangerous schemes and tricks", () => {
    for (const bad of [
      "javascript:alert(1)",
      "JavaScript:alert(1)",
      "data:text/html;base64,PHN2Zz4=",
      "file:///etc/passwd",
      "ftp://example.com/a.jpg",
      "http://example.com/a.jpg",
      "//evil.example.com/a.jpg",
      "\\\\evil\\share",
    ]) {
      expect(imageUrlSchema.safeParse(bad).success, bad).toBe(false);
    }
  });
});

describe("tracking input", () => {
  it("requires a token or both order number and phone number", () => {
    expect(trackSchema.safeParse({ orderNumber: "FP-2847" }).success).toBe(false);
    expect(trackSchema.safeParse({ phone: "01712345678" }).success).toBe(false);
    expect(trackSchema.safeParse({ orderNumber: "FP-2847", phone: "01712345678" }).success).toBe(true);
    expect(trackSchema.safeParse({ token: "a".repeat(64) }).success).toBe(true);
  });

  it("rejects injection-shaped order numbers", () => {
    expect(trackSchema.safeParse({ phone: "01712345678", orderNumber: "FP-1' OR 1=1--" }).success).toBe(
      false,
    );
  });

  it("normalizes phone numbers to the last 11 digits", () => {
    expect(normalizePhone("+880 1712-345678")).toBe("01712345678");
    expect(normalizePhone("01712345678")).toBe("01712345678");
  });
});

describe("checkout input", () => {
  it("rejects non-slug product references and empty carts", () => {
    const base = {
      name: "Test User",
      phone: "01712345678",
      address: "12 Anderkilla Road, Chattogram",
      paymentMethod: "cash_on_pickup" as const,
    };
    expect(checkoutSchema.safeParse({ ...base, items: [] }).success).toBe(false);
    expect(
      checkoutSchema.safeParse({ ...base, items: [{ slug: "../../etc/passwd", quantity: 1 }] }).success,
    ).toBe(false);
    expect(checkoutSchema.safeParse({ ...base, items: [{ slug: "business-cards", quantity: 2 }] }).success).toBe(
      true,
    );
  });
});

describe("contact form", () => {
  it("accepts the honeypot and captcha fields", () => {
    const parsed = enquirySchema.safeParse({
      name: "Test User",
      phone: "01712345678",
      message: "I need 500 business cards printed.",
      company_website: "",
      captchaToken: "abc",
    });
    expect(parsed.success).toBe(true);
  });

  it("rejects a too-short message", () => {
    expect(
      enquirySchema.safeParse({ name: "Test User", phone: "01712345678", message: "hi" }).success,
    ).toBe(false);
  });
});

describe("rate limit identity", () => {
  it("collapses IPv6 addresses to their /64 prefix", () => {
    expect(normalizeIp("2400:adc1:0001:0002:aaaa:bbbb:cccc:dddd")).toBe("2400:adc1:0001:0002::/64");
    expect(normalizeIp("203.0.113.9")).toBe("203.0.113.9");
  });
});

describe("security headers", () => {
  const headers = securityHeaders({ host: "friendsprinters.com", isDev: false });

  it("sets every required header in production", () => {
    expect(headers["content-security-policy"]).toBeTruthy();
    expect(headers["strict-transport-security"]).toContain("max-age=31536000");
    expect(headers["x-content-type-options"]).toBe("nosniff");
    expect(headers["referrer-policy"]).toBe("strict-origin-when-cross-origin");
    expect(headers["permissions-policy"]).toContain("camera=()");
    expect(headers["x-frame-options"]).toBe("SAMEORIGIN");
  });

  it("keeps the editor preview frameable but blocks other embedders", () => {
    expect(shouldSetFrameOptions("id-preview--x.lovable.app")).toBe(false);
    expect(buildCsp(false)).toContain("frame-ancestors 'self' https://lovable.dev");
  });

  it("blocks plugins, base tag hijacking and eval outside dev", () => {
    const csp = buildCsp(false);
    expect(csp).toContain("object-src 'none'");
    expect(csp).toContain("base-uri 'self'");
    expect(csp).not.toContain("'unsafe-eval'");
  });
});

describe("log redaction", () => {
  it("redacts secrets, tokens and customer PII", () => {
    const redacted = __redactForTest({
      store_passwd: "super-secret",
      authorization: "Bearer abc.def.ghi",
      customer_phone: "01712345678",
      shipping_address: "12 Anderkilla Road",
      customer_email: "person@example.com",
      tran_id: "FP-2851",
      note: "call 01712345678 or person@example.com",
    }) as Record<string, string>;

    expect(redacted["store_passwd"]).toBe("[redacted]");
    expect(redacted["authorization"]).toBe("[redacted]");
    expect(redacted["customer_phone"]).not.toContain("1712345");
    expect(redacted["shipping_address"]).not.toContain("Anderkilla");
    expect(redacted["customer_email"]).not.toContain("person@example.com");
    expect(redacted["note"]).not.toContain("person@example.com");
    expect(redacted["note"]).not.toContain("01712345678");
  });

  it("keeps only a short suffix of an identifier", () => {
    expect(maskIdentifier("01712345678")).toBe("***5678");
  });
});
