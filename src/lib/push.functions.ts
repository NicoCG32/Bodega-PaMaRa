import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const savePushToken = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { token: string }) => {
    if (!input || typeof input.token !== "string" || input.token.length < 10) {
      throw new Error("Token inválido");
    }
    return { token: input.token };
  })
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("push_tokens")
      .upsert({ user_id: context.userId, token: data.token });
    if (error) throw new Error(error.message);
    return { ok: true };
  });
