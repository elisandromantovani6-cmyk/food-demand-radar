import { z } from "zod";
import { router, publicProcedure } from "../trpc";
import { campaignEngine } from "../engines/campaign-engine";

export const campaignsRouter = router({
  getSuggested: publicProcedure
    .input(z.object({ restaurantId: z.string().optional() }))
    .query(() => {
      return campaignEngine.generateSuggestions();
    }),

  list: publicProcedure
    .input(z.object({ restaurantId: z.string().optional() }))
    .query(() => {
      return {
        active: [],
        history: [],
        suggested: campaignEngine.generateSuggestions(),
      };
    }),

  activate: publicProcedure
    .input(z.object({ campaignId: z.string() }))
    .mutation(({ input }) => {
      return { success: true, campaignId: input.campaignId, status: "active" };
    }),

  pause: publicProcedure
    .input(z.object({ campaignId: z.string() }))
    .mutation(({ input }) => {
      return { success: true, campaignId: input.campaignId, status: "paused" };
    }),
});
