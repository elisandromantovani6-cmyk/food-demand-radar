import { z } from "zod";
import { router, publicProcedure, supabaseAdmin } from "../trpc";

export const onboardingRouter = router({
  completeOnboarding: publicProcedure
    .input(z.object({
      restaurantName: z.string().min(1),
      foodCategory: z.string(),
      city: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      if (!ctx.userId) throw new Error("Não autenticado");

      const slug = input.restaurantName
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

      // Criar tenant via service role (ignora RLS)
      const { data: tenant, error: tenantError } = await supabaseAdmin
        .from("tenants")
        .insert({
          name: input.restaurantName,
          slug: `${slug}-${Date.now()}`,
          food_category: input.foodCategory,
          city: input.city,
          onboarding_completed: true,
        })
        .select()
        .single();

      if (tenantError) throw new Error(tenantError.message);

      // Vincular profile ao tenant
      const { error: profileError } = await supabaseAdmin
        .from("profiles")
        .update({ tenant_id: tenant.id })
        .eq("id", ctx.userId);

      if (profileError) throw new Error(profileError.message);

      return { tenantId: tenant.id, restaurantName: tenant.name };
    }),

  // Vincular usuário a tenant existente (ex: seed Domino's)
  linkToTenant: publicProcedure
    .input(z.object({ tenantSlug: z.string() }))
    .mutation(async ({ input, ctx }) => {
      if (!ctx.userId) throw new Error("Não autenticado");

      const { data: tenant, error } = await supabaseAdmin
        .from("tenants")
        .select("id, name")
        .eq("slug", input.tenantSlug)
        .single();

      if (error || !tenant) throw new Error("Tenant não encontrado");

      const { error: profileError } = await supabaseAdmin
        .from("profiles")
        .update({ tenant_id: tenant.id })
        .eq("id", ctx.userId);

      if (profileError) throw new Error(profileError.message);

      return { tenantId: tenant.id, restaurantName: tenant.name };
    }),
});
