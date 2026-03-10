import { z } from "zod";
import { router, publicProcedure } from "../trpc";
import { demandEngine } from "../engines/demand-engine";

export const demandRouter = router({
  getByNeighborhood: publicProcedure
    .input(z.object({ neighborhoodId: z.string() }))
    .query(({ input }) => {
      return {
        neighborhoodId: input.neighborhoodId,
        demandScore: demandEngine.calculateDemandScore(input.neighborhoodId),
        hungerScore: demandEngine.calculateHungerScore(input.neighborhoodId),
        timestamp: new Date(),
      };
    }),

  getHungerScore: publicProcedure
    .input(z.object({ neighborhoodId: z.string() }))
    .query(({ input }) => {
      return {
        neighborhoodId: input.neighborhoodId,
        score: demandEngine.calculateHungerScore(input.neighborhoodId),
        timestamp: new Date(),
      };
    }),

  getHeatmapData: publicProcedure
    .input(z.object({
      city: z.string().default("Tangara da Serra"),
      foodCategory: z.string().default("pizza"),
    }))
    .query(({ input }) => {
      return demandEngine.getHeatmapData(input.city, input.foodCategory);
    }),

  getHotNeighborhoods: publicProcedure
    .input(z.object({
      city: z.string().default("Tangara da Serra"),
      limit: z.number().default(5),
    }))
    .query(({ input }) => {
      return demandEngine.getHotNeighborhoods(input.city, input.limit);
    }),

  getTimeline: publicProcedure
    .input(z.object({ neighborhoodId: z.string().optional() }))
    .query(({ input }) => {
      return demandEngine.getDemandTimeline(input.neighborhoodId);
    }),

  getCityScore: publicProcedure
    .input(z.object({ city: z.string().default("Tangara da Serra") }))
    .query(({ input }) => {
      return {
        hungerScore: demandEngine.getCityHungerScore(input.city),
        peak: demandEngine.getPeakForecast(input.city),
        timestamp: new Date(),
      };
    }),
});
