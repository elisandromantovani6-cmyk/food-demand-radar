import { z } from "zod";
import { router, publicProcedure } from "../trpc";
import { scoringEngine } from "../engines/scoring-engine";

export const expansionRouter = router({
  getRanking: publicProcedure
    .input(z.object({
      city: z.string().default("Tangara da Serra"),
      foodCategory: z.string().default("pizza"),
    }))
    .query(async () => {
      return scoringEngine.getExpansionRanking();
    }),

  getOpportunityScore: publicProcedure
    .input(z.object({
      neighborhoodId: z.string(),
      foodCategory: z.string().default("pizza"),
    }))
    .query(async ({ input }) => {
      return {
        neighborhoodId: input.neighborhoodId,
        posScore: await scoringEngine.pizzaOpportunityScore(input.neighborhoodId, input.foodCategory),
        competitionDensity: await scoringEngine.getCompetitionDensity(input.neighborhoodId),
      };
    }),
});
