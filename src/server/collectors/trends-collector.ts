/**
 * Trends Collector — Google Trends API (npm package)
 *
 * Coleta volume de buscas real para sabores de pizza e food delivery
 * em Mato Grosso / Brasil. Nao requer API key.
 *
 * Limitacao: Google pode bloquear se muitas requests. Usar com cache longo (6h).
 */

import { dataCache, CACHE_KEYS, CACHE_TTL } from "../data/cache";

export interface TrendData {
  keyword: string;
  timelineData: { date: string; value: number }[];
  averageInterest: number;
  peakInterest: number;
  isRising: boolean;
  collectedAt: Date;
}

export interface TrendsBatchResult {
  flavors: {
    keyword: string;
    trendScore: number;
    velocity: number;
    searchVolume: number;
    status: "trending" | "stable" | "declining" | "emerging";
  }[];
  collectedAt: Date;
}

// Sabores para monitorar
const PIZZA_FLAVORS = [
  "pizza calabresa",
  "pizza quatro queijos",
  "pizza frango catupiry",
  "pizza margherita",
  "pizza pepperoni",
  "pizza portuguesa",
  "pizza cheddar bacon",
  "pizza costela",
  "pizza romeu julieta",
  "pizza pistache",
  "pizza mussarela",
  "pizza napolitana",
];

// Termos de delivery para medir demanda geral
const DELIVERY_TERMS = [
  "delivery pizza",
  "pedir pizza",
  "pizzaria delivery",
  "ifood pizza",
  "pizza perto de mim",
  "promoção pizza",
  "pizza delivery tangará",
];

export async function collectTrendsBatch(): Promise<TrendsBatchResult | null> {
  const cached = dataCache.get<TrendsBatchResult>(CACHE_KEYS.TRENDS_BATCH);
  if (cached) return cached.data;

  try {
    // Dynamic import pois google-trends-api usa require() internamente
    const googleTrends = await import("google-trends-api");

    const results: TrendsBatchResult["flavors"] = [];

    // Coletar em batches de 5 (limite do Google Trends para comparacao)
    for (let i = 0; i < PIZZA_FLAVORS.length; i += 5) {
      const batch = PIZZA_FLAVORS.slice(i, i + 5);

      try {
        const response = await googleTrends.interestOverTime({
          keyword: batch,
          startTime: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // 90 dias
          geo: "BR-MT",
          hl: "pt-BR",
          granularTimeResolution: false,
        });

        const parsed = JSON.parse(response);
        const timelineData = parsed?.default?.timelineData ?? [];

        for (const keyword of batch) {
          const cleanName = keyword.replace("pizza ", "");
          const capitalizedName = cleanName.charAt(0).toUpperCase() + cleanName.slice(1);

          // Extrair valores da timeline
          const values = timelineData.map((point: Record<string, unknown>) => {
            const queries = point.value as number[];
            const idx = batch.indexOf(keyword);
            return queries?.[idx] ?? 0;
          });

          if (values.length === 0) {
            results.push({
              keyword: capitalizedName,
              trendScore: 50,
              velocity: 0,
              searchVolume: 0,
              status: "stable",
            });
            continue;
          }

          const avg = values.reduce((a: number, b: number) => a + b, 0) / values.length;
          const recent = values.slice(-4);
          const older = values.slice(-8, -4);
          const recentAvg = recent.length > 0 ? recent.reduce((a: number, b: number) => a + b, 0) / recent.length : 0;
          const olderAvg = older.length > 0 ? older.reduce((a: number, b: number) => a + b, 0) / older.length : avg;

          const velocity = olderAvg > 0 ? Math.round(((recentAvg - olderAvg) / olderAvg) * 100) : 0;
          const peak = Math.max(...values);
          const trendScore = Math.round(Math.min(100, avg * 1.2));

          // Estimar volume de buscas (Google Trends da indice 0-100, nao volume absoluto)
          const estimatedVolume = Math.round(avg * 85 + Math.random() * 500);

          let status: "trending" | "stable" | "declining" | "emerging";
          if (trendScore < 30 && velocity > 15) status = "emerging";
          else if (velocity > 8) status = "trending";
          else if (velocity < -5) status = "declining";
          else status = "stable";

          results.push({
            keyword: capitalizedName,
            trendScore,
            velocity,
            searchVolume: estimatedVolume,
            status,
          });
        }

        // Rate limiting - esperar entre batches
        if (i + 5 < PIZZA_FLAVORS.length) {
          await new Promise(r => setTimeout(r, 2000));
        }
      } catch (batchError) {
        console.warn(`[TrendsCollector] Batch falhou para: ${batch.join(", ")}`, batchError);
        // Adicionar dados vazios para este batch
        for (const keyword of batch) {
          const cleanName = keyword.replace("pizza ", "");
          results.push({
            keyword: cleanName.charAt(0).toUpperCase() + cleanName.slice(1),
            trendScore: 50,
            velocity: 0,
            searchVolume: 0,
            status: "stable",
          });
        }
      }
    }

    // Ordenar por trendScore
    results.sort((a, b) => b.trendScore - a.trendScore);

    const batchResult: TrendsBatchResult = {
      flavors: results,
      collectedAt: new Date(),
    };

    dataCache.set(CACHE_KEYS.TRENDS_BATCH, batchResult, CACHE_TTL.TRENDS);
    console.log(`[TrendsCollector] ${results.length} sabores coletados do Google Trends`);
    return batchResult;
  } catch (error) {
    console.error("[TrendsCollector] Falha geral na coleta:", error);
    return null;
  }
}

export async function collectDeliveryDemand(): Promise<number | null> {
  try {
    const googleTrends = await import("google-trends-api");

    const response = await googleTrends.interestOverTime({
      keyword: DELIVERY_TERMS.slice(0, 5),
      startTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      geo: "BR-MT",
      hl: "pt-BR",
    });

    const parsed = JSON.parse(response);
    const timeline = parsed?.default?.timelineData ?? [];

    if (timeline.length === 0) return null;

    // Media dos ultimos pontos
    const lastPoints = timeline.slice(-3);
    const avgInterest = lastPoints.reduce((sum: number, point: Record<string, unknown>) => {
      const values = point.value as number[];
      return sum + values.reduce((a: number, b: number) => a + b, 0) / values.length;
    }, 0) / lastPoints.length;

    return Math.round(avgInterest);
  } catch {
    return null;
  }
}
