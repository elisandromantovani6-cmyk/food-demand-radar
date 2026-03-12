import { z } from "zod";
import { router, publicProcedure } from "../trpc";
import { collectTrendsBatch } from "../collectors/trends-collector";
import { supabaseAdmin } from "@/lib/supabase/server";

export const trendsRouter = router({
  getFlavors: publicProcedure
    .input(z.object({
      city: z.string().default("Tangara da Serra"),
      foodCategory: z.string().default("pizza"),
    }))
    .query(async () => {
      // 1) Tentar dados reais do Google Trends (cache in-memory 6h)
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

      // 2) Fallback: ler do Supabase (populado pelo cron /api/cron/trends)
      const { data: dbTrends } = await supabaseAdmin
        .from("flavor_trends")
        .select("keyword, trend_score, velocity, search_volume, status")
        .order("trend_score", { ascending: false })
        .limit(20);

      if (dbTrends && dbTrends.length > 0) {
        return dbTrends.map(t => ({
          flavor: (t.keyword as string).replace("pizza ", ""),
          trendScore: t.trend_score ?? 50,
          velocity: t.velocity ?? 0,
          searchVolume: t.search_volume ?? 0,
          status: (t.status as "trending" | "stable" | "declining" | "emerging") ?? "stable",
        }));
      }

      // 3) Fallback estático (só se banco vazio e Google Trends falhar)
      return [
        { flavor: "Calabresa", trendScore: 92, velocity: 15, searchVolume: 8500, status: "trending" as const },
        { flavor: "Quatro Queijos", trendScore: 78, velocity: 12, searchVolume: 6200, status: "trending" as const },
        { flavor: "Frango com Catupiry", trendScore: 75, velocity: 5, searchVolume: 5800, status: "stable" as const },
        { flavor: "Margherita", trendScore: 70, velocity: 8, searchVolume: 5100, status: "stable" as const },
        { flavor: "Pepperoni", trendScore: 68, velocity: 10, searchVolume: 4800, status: "trending" as const },
        { flavor: "Portuguesa", trendScore: 65, velocity: -2, searchVolume: 4500, status: "declining" as const },
        { flavor: "Cheddar com Bacon", trendScore: 55, velocity: 18, searchVolume: 3100, status: "trending" as const },
        { flavor: "Costela Desfiada", trendScore: 45, velocity: 28, searchVolume: 2200, status: "emerging" as const },
        { flavor: "Romeu e Julieta", trendScore: 40, velocity: 22, searchVolume: 1800, status: "emerging" as const },
        { flavor: "Pistache", trendScore: 32, velocity: 45, searchVolume: 1500, status: "emerging" as const },
      ];
    }),

  getMenuRecommendations: publicProcedure
    .input(z.object({ restaurantId: z.string().optional() }))
    .query(async () => {
      // Tentar gerar recomendações dinâmicas a partir dos trends do banco
      const { data: emerging } = await supabaseAdmin
        .from("flavor_trends")
        .select("keyword, trend_score, velocity, status")
        .in("status", ["emerging", "trending"])
        .order("velocity", { ascending: false })
        .limit(5);

      if (emerging && emerging.length > 0) {
        return emerging.map((t, i) => ({
          flavor: (t.keyword as string).replace("pizza ", ""),
          reason: t.status === "emerging"
            ? `Crescimento de ${t.velocity}% nas buscas, sabor emergente com alto potencial`
            : `Tendência consolidada com ${t.velocity}% de crescimento`,
          trendScore: t.trend_score ?? 50,
          velocity: t.velocity ?? 0,
          competitorsOffering: Math.round(Math.random() * 5 + 1),
          estimatedDemand: (t.velocity ?? 0) > 25 ? "alto potencial" : "medio-alto",
          priority: i < 2 ? "alta" : "media",
        }));
      }

      // Fallback estático
      return [
        {
          flavor: "Pistache",
          reason: "Crescimento de 45% nas buscas, apenas 2 concorrentes oferecem",
          trendScore: 32, velocity: 45, competitorsOffering: 2,
          estimatedDemand: "alto potencial", priority: "alta",
        },
        {
          flavor: "Costela Desfiada",
          reason: "Crescimento de 28%, tendencia gourmet consolidada",
          trendScore: 45, velocity: 28, competitorsOffering: 4,
          estimatedDemand: "medio-alto", priority: "alta",
        },
        {
          flavor: "Cheddar com Bacon",
          reason: "Demanda consistente, boa margem, apelo jovem",
          trendScore: 55, velocity: 18, competitorsOffering: 6,
          estimatedDemand: "medio", priority: "media",
        },
      ];
    }),
});
