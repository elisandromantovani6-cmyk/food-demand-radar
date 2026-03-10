import { z } from "zod";
import { router, publicProcedure } from "../trpc";
import { scoringEngine } from "../engines/scoring-engine";

export const expansionRouter = router({
  getRanking: publicProcedure
    .input(z.object({
      city: z.string().default("Tangara da Serra"),
      foodCategory: z.string().default("pizza"),
    }))
    .query(() => {
      return scoringEngine.getExpansionRanking();
    }),

  getOpportunityScore: publicProcedure
    .input(z.object({
      neighborhoodId: z.string(),
      foodCategory: z.string().default("pizza"),
    }))
    .query(({ input }) => {
      return {
        neighborhoodId: input.neighborhoodId,
        posScore: scoringEngine.pizzaOpportunityScore(input.neighborhoodId, input.foodCategory),
        competitionDensity: scoringEngine.getCompetitionDensity(input.neighborhoodId),
      };
    }),
});
