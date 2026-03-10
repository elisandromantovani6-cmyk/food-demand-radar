import { z } from "zod";
import { router, publicProcedure } from "../trpc";
import { alertEngine } from "../engines/alert-engine";

export const alertsRouter = router({
  getActive: publicProcedure
    .input(z.object({ restaurantId: z.string().optional() }))
    .query(async () => {
      return alertEngine.runAlertCheck();
    }),

  acknowledge: publicProcedure
    .input(z.object({ alertId: z.string() }))
    .mutation(({ input }) => {
      return { success: true, alertId: input.alertId };
    }),
});
