import { z } from "zod";
import { router, publicProcedure } from "../trpc";
import { campaignEngine } from "../engines/campaign-engine";
import { supabaseAdmin } from "@/lib/supabase/server";

export const campaignsRouter = router({
  getSuggested: publicProcedure
    .input(z.object({ restaurantId: z.string().optional() }))
    .query(() => {
      return campaignEngine.generateSuggestions();
    }),

  list: publicProcedure
    .input(z.object({ restaurantId: z.string().optional() }))
    .query(async () => {
      // Buscar campanhas ativas e históricas do Supabase
      const { data: dbCampaigns } = await supabaseAdmin
        .from("campaigns")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      const active = (dbCampaigns ?? []).filter(c => c.status === "active");
      const history = (dbCampaigns ?? []).filter(c => c.status !== "active");

      return {
        active,
        history,
        suggested: campaignEngine.generateSuggestions(),
      };
    }),

  activate: publicProcedure
    .input(z.object({
      campaignId: z.string(),
      tenantId: z.string().optional(),
      title: z.string().optional(),
      type: z.string().optional(),
      triggerType: z.string().optional(),
      copyTitle: z.string().optional(),
      copyBody: z.string().optional(),
      offer: z.string().optional(),
      platforms: z.array(z.string()).optional(),
      estimatedBudget: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      // Salvar campanha ativada no Supabase
      const { error } = await supabaseAdmin
        .from("campaigns")
        .upsert({
          id: input.campaignId.startsWith("sug-") ? undefined : input.campaignId,
          tenant_id: input.tenantId,
          title: input.title ?? "Campanha ativada",
          type: input.type ?? "manual",
          trigger_type: input.triggerType,
          copy_title: input.copyTitle,
          copy_body: input.copyBody,
          offer: input.offer,
          platforms: input.platforms,
          estimated_budget: input.estimatedBudget,
          status: "active",
          activated_at: new Date().toISOString(),
        });

      if (error) {
        console.error("[Campaigns] Erro ao ativar:", error);
      }

      return { success: !error, campaignId: input.campaignId, status: "active" };
    }),

  pause: publicProcedure
    .input(z.object({ campaignId: z.string() }))
    .mutation(async ({ input }) => {
      const { error } = await supabaseAdmin
        .from("campaigns")
        .update({ status: "paused", paused_at: new Date().toISOString() })
        .eq("id", input.campaignId);

      if (error) {
        console.error("[Campaigns] Erro ao pausar:", error);
      }

      return { success: !error, campaignId: input.campaignId, status: "paused" };
    }),
});
