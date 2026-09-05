import { createMiddleware } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * Defence in depth for the admin surface: RLS already restricts these tables to
 * staff, but every admin server function should also refuse non-staff callers in
 * code so a signed-in customer can never reach admin logic at all.
 */
export const requireStaff = createMiddleware({ type: "function" })
  .middleware([requireSupabaseAuth])
  .server(async ({ next, context }) => {
    const { data, error } = await context.supabase.rpc("is_staff", { _user_id: context.userId });
    if (error || data !== true) {
      throw new Error("Forbidden: staff access only.");
    }
    return next({ context });
  });
