/**
 * API Route — Data Collection Trigger
 *
 * GET /api/collect — Executa coleta de todas as fontes
 * GET /api/collect?source=weather — Coleta apenas clima
 * GET /api/collect?source=trends — Coleta apenas tendencias
 * GET /api/collect?source=competitors — Coleta apenas concorrentes
 *
 * Em producao, seria chamado por um cron job (Vercel Cron, etc.)
 */

import { NextRequest, NextResponse } from "next/server";
import { collectCurrentWeather, collectWeatherForecast } from "@/server/collectors/weather-collector";
import { collectTrendsBatch } from "@/server/collectors/trends-collector";
import { collectCompetitors } from "@/server/collectors/competitors-collector";
import { dataCache } from "@/server/data/cache";

export async function GET(req: NextRequest) {
  const source = req.nextUrl.searchParams.get("source");
  const results: Record<string, unknown> = {};
  const errors: string[] = [];

  const startTime = Date.now();

  try {
    if (!source || source === "weather") {
      try {
        const weather = await collectCurrentWeather();
        const forecast = await collectWeatherForecast();
        results.weather = {
          current: weather ? { temp: weather.temperature, desc: weather.description, raining: weather.isRaining } : "mock (sem API key)",
          forecast: forecast ? `${forecast.entries.length} entradas` : "indisponivel",
        };
      } catch (e) {
        errors.push(`weather: ${e instanceof Error ? e.message : "erro desconhecido"}`);
      }
    }

    if (!source || source === "trends") {
      try {
        const trends = await collectTrendsBatch();
        results.trends = trends
          ? { count: trends.flavors.length, top3: trends.flavors.slice(0, 3).map(f => `${f.keyword} (${f.trendScore})`) }
          : "falha na coleta";
      } catch (e) {
        errors.push(`trends: ${e instanceof Error ? e.message : "erro desconhecido"}`);
      }
    }

    if (!source || source === "competitors") {
      try {
        const competitors = await collectCompetitors();
        results.competitors = competitors
          ? { total: competitors.totalCompetitors, neighborhoods: competitors.neighborhoods.length }
          : "falha na coleta";
      } catch (e) {
        errors.push(`competitors: ${e instanceof Error ? e.message : "erro desconhecido"}`);
      }
    }
  } catch (e) {
    errors.push(`geral: ${e instanceof Error ? e.message : "erro desconhecido"}`);
  }

  const duration = Date.now() - startTime;

  return NextResponse.json({
    status: errors.length > 0 ? "partial" : "ok",
    duration: `${duration}ms`,
    results,
    errors: errors.length > 0 ? errors : undefined,
    cache: dataCache.stats(),
    timestamp: new Date().toISOString(),
  });
}
