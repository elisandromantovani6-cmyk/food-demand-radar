import { z } from "zod";
import { router, publicProcedure } from "../trpc";
import { alertEngine } from "../engines/alert-engine";
import { supabaseAdmin } from "@/lib/supabase/server";

export const alertsRouter = router({
  getActive: publicProcedure
    .input(z.object({ restaurantId: z.string().optional() }))
    .query(async () => {
      const engineAlerts = await alertEngine.runAlertCheck();

      // Buscar IDs de alertas já acknowledged no banco
      const { data: acknowledged } = await supabaseAdmin
        .from("alerts")
        .select("alert_key")
        .eq("acknowledged", true)
        .gte("created_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      const ackKeys = new Set((acknowledged ?? []).map(a => a.alert_key));

      // Filtrar alertas já acknowledged (nas últimas 24h)
      return engineAlerts.filter(a => !ackKeys.has(a.id));
    }),

  acknowledge: publicProcedure
    .input(z.object({ alertId: z.string(), tenantId: z.string().optional() }))
    .mutation(async ({ input }) => {
      await supabaseAdmin
        .from("alerts")
        .upsert({
          alert_key: input.alertId,
          tenant_id: input.tenantId,
          acknowledged: true,
          acknowledged_at: new Date().toISOString(),
        }, { onConflict: "alert_key" });

      return { success: true, alertId: input.alertId };
    }),
});
