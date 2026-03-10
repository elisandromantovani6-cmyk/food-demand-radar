import { z } from "zod";
import { router, publicProcedure } from "../trpc";
import { collectTrendsBatch } from "../collectors/trends-collector";

// Fallback quando Google Trends nao esta disponivel
const FALLBACK_FLAVORS = [
  { flavor: "Calabresa", trendScore: 92, velocity: 15, searchVolume: 8500, status: "trending" as const },
  { flavor: "Quatro Queijos", trendScore: 78, velocity: 12, searchVolume: 6200, status: "trending" as const },
  { flavor: "Frango com Catupiry", trendScore: 75, velocity: 5, searchVolume: 5800, status: "stable" as const },
  { flavor: "Margherita", trendScore: 70, velocity: 8, searchVolume: 5100, status: "stable" as const },
  { flavor: "Portuguesa", trendScore: 65, velocity: -2, searchVolume: 4500, status: "declining" as const },
  { flavor: "Pepperoni", trendScore: 68, velocity: 10, searchVolume: 4800, status: "trending" as const },
  { flavor: "Cheddar com Bacon", trendScore: 55, velocity: 18, searchVolume: 3100, status: "trending" as const },
  { flavor: "Costela Desfiada", trendScore: 45, velocity: 28, searchVolume: 2200, status: "emerging" as const },
  { flavor: "Romeu e Julieta", trendScore: 40, velocity: 22, searchVolume: 1800, status: "emerging" as const },
  { flavor: "Pistache", trendScore: 32, velocity: 45, searchVolume: 1500, status: "emerging" as const },
];

const MENU_RECOMMENDATIONS = [
  {
    flavor: "Pistache",
    reason: "Crescimento de 45% nas buscas, apenas 2 concorrentes oferecem",
    trendScore: 32,
    velocity: 45,
    competitorsOffering: 2,
    estimatedDemand: "alto potencial",
    priority: "alta",
  },
  {
    flavor: "Costela Desfiada",
    reason: "Crescimento de 28%, tendencia gourmet consolidada",
    trendScore: 45,
    velocity: 28,
    competitorsOffering: 4,
    estimatedDemand: "medio-alto",
    priority: "alta",
  },
  {
    flavor: "Cheddar com Bacon",
    reason: "Demanda consistente, boa margem, apelo jovem",
    trendScore: 55,
    velocity: 18,
    competitorsOffering: 6,
    estimatedDemand: "medio",
    priority: "media",
  },
];

export const trendsRouter = router({
  getFlavors: publicProcedure
    .input(z.object({
      city: z.string().default("Tangara da Serra"),
      foodCategory: z.string().default("pizza"),
    }))
    .query(async () => {
      // Tentar dados reais do Google Trends
      const realData = await collectTrendsBatch();

      if (realData && realData.flavors.length > 0) {
        return realData.flavors
          .map(f => ({
            flavor: f.keyword,
            trendScore: f.trendScore,
            velocity: f.velocity,
            searchVolume: f.searchVolume,
            status: f.status,
          }))
          .sort((a, b) => b.trendScore - a.trendScore);
      }

      // Fallback para dados estimados
      return FALLBACK_FLAVORS.sort((a, b) => b.trendScore - a.trendScore);
    }),

  getMenuRecommendations: publicProcedure
    .input(z.object({ restaurantId: z.string().optional() }))
    .query(() => {
      return MENU_RECOMMENDATIONS;
    }),
});
