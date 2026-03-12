import { z } from "zod";
import { router, publicProcedure } from "../trpc";
import { demandEngine } from "../engines/demand-engine";

export const demandRouter = router({
  getByNeighborhood: publicProcedure
    .input(z.object({ neighborhoodId: z.string() }))
    .query(async ({ input }) => {
      return {
        neighborhoodId: input.neighborhoodId,
        demandScore: await demandEngine.calculateDemandScore(input.neighborhoodId),
        hungerScore: await demandEngine.calculateHungerScore(input.neighborhoodId),
        timestamp: new Date(),
      };
    }),

  getHungerScore: publicProcedure
    .input(z.object({ neighborhoodId: z.string() }))
    .query(async ({ input }) => {
      return {
        neighborhoodId: input.neighborhoodId,
        score: await demandEngine.calculateHungerScore(input.neighborhoodId),
        timestamp: new Date(),
      };
    }),

  getHeatmapData: publicProcedure
    .input(z.object({
      city: z.string().default("Tangara da Serra"),
      foodCategory: z.string().default("pizza"),
    }))
    .query(async ({ input }) => {
      return demandEngine.getHeatmapData(input.city, input.foodCategory);
    }),

  getHotNeighborhoods: publicProcedure
    .input(z.object({
      city: z.string().default("Tangara da Serra"),
      limit: z.number().default(5),
    }))
    .query(async ({ input }) => {
      return demandEngine.getHotNeighborhoods(input.city, input.limit);
    }),

  getTimeline: publicProcedure
    .input(z.object({ neighborhoodId: z.string().optional() }))
    .query(async ({ input }) => {
      return demandEngine.getDemandTimeline(input.neighborhoodId);
    }),

  getCityScore: publicProcedure
    .input(z.object({ city: z.string().default("Tangara da Serra") }))
    .query(async ({ input }) => {
      return {
        hungerScore: await demandEngine.getCityHungerScore(input.city),
        peak: await demandEngine.getPeakForecast(input.city),
        timestamp: new Date(),
      };
    }),
});
