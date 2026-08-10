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
    const { callerIp, enforceRateLimit } = await import("./rate-limit.server");
    await enforceRateLimit({
      bucket: "contact",
      identifier: callerIp(),
      limit: 5,
      windowMinutes: 60,
      message: "You've sent several enquiries recently. Please try again in an hour, or call the press room.",
    });

    const { createPublicClient } = await import("./supabase-public.server");
    const supabase = createPublicClient();

    const { error } = await supabase.from("contact_submissions").insert({
      name: data.name,
      phone: data.phone,
      email: data.email ? data.email : null,
      message: data.message,
    });

    if (error) {
      console.error("[contact] insert failed", error);
      throw new Error("We couldn't save your enquiry. Please try again, or call us directly.");
    }

    return { ok: true };
  });
