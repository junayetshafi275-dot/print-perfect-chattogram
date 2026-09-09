import { createServerFn } from "@tanstack/react-start";
import { enquirySchema, firstIssue } from "./validation";
import { z } from "zod";

export const submitEnquiry = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => {
    const parsed = enquirySchema.safeParse(input);
    if (!parsed.success) throw new Error(firstIssue(parsed.error as z.ZodError));
    return parsed.data;
  })
  .handler(async ({ data }): Promise<{ ok: true }> => {
    const { log } = await import("./logging.server");
    const { callerIp, enforceIpAndPhoneLimit, RATE_LIMITS } = await import("./rate-limit.server");

    // Honeypot: bots fill every field, humans never see this one. Answer with a
    // success shape so the bot gets no signal, but store nothing.
    if (data.company_website && data.company_website.trim() !== "") {
      log.warn("contact", "honeypot triggered — enquiry discarded");
      return { ok: true };
    }

    await enforceIpAndPhoneLimit({
      ip: RATE_LIMITS.contactIp,
      phone: RATE_LIMITS.contactPhone,
      phoneValue: data.phone,
      message:
        "You've sent several enquiries recently. Please try again in an hour, or call the press room.",
    });

    const { verifyCaptcha } = await import("./turnstile.server");
    await verifyCaptcha(data.captchaToken, callerIp());

    const { createPublicClient } = await import("./supabase-public.server");
    const supabase = createPublicClient();

    const { error } = await supabase.from("contact_submissions").insert({
      name: data.name,
      phone: data.phone,
      email: data.email ? data.email : null,
      message: data.message,
    });

    if (error) {
      log.error("contact", "enquiry insert failed", { error });
      throw new Error("We couldn't save your enquiry. Please try again, or call us directly.");
    }

    log.info("contact", "enquiry stored");
    return { ok: true };
  });
