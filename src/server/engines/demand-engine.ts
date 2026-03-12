// Demand Engine — lê bairros do Supabase com cache local
import { dataCache, CACHE_KEYS } from "../data/cache";
import type { WeatherData } from "../collectors/weather-collector";
import { supabaseAdmin } from "@/lib/supabase/server";

interface Neighborhood {
  id: string;
  name: string;
  lat: number;
  lng: number;
  population: number;
  avg_income: number;
  tenant_id: string;
}

const NEIGHBORHOODS_CACHE_KEY = "neighborhoods_list";
const NEIGHBORHOODS_CACHE_TTL = 5 * 60 * 1000; // 5 min

async function getNeighborhoods(tenantId?: string): Promise<Neighborhood[]> {
  const cacheKey = `${NEIGHBORHOODS_CACHE_KEY}_${tenantId ?? "all"}`;
  const cached = dataCache.get<Neighborhood[]>(cacheKey);
  if (cached) return cached.data;

  let query = supabaseAdmin
    .from("neighborhoods")
    .select("id, name, lat, lng, population, avg_income, tenant_id");

  if (tenantId) {
    query = query.eq("tenant_id", tenantId);
  }

  const { data, error } = await query;

  if (error || !data || data.length === 0) {
    console.warn("[DemandEngine] Falha ao buscar bairros do Supabase, usando fallback vazio");
    return [];
  }

  const neighborhoods = data as Neighborhood[];
  dataCache.set(cacheKey, neighborhoods, NEIGHBORHOODS_CACHE_TTL);
  return neighborhoods;
}

function getTimeMultiplier(hour: number): number {
  if (hour >= 11 && hour <= 13) return 1.3;
  if (hour >= 18 && hour <= 21) return 1.5;
  if (hour >= 22 && hour <= 23) return 1.2;
  if (hour >= 0 && hour <= 5) return 0.3;
  if (hour >= 6 && hour <= 10) return 0.5;
  return 0.8;
}

function getDayMultiplier(dayOfWeek: number): number {
  if (dayOfWeek === 5) return 1.4; // sexta
  if (dayOfWeek === 6) return 1.3; // sabado
  if (dayOfWeek === 0) return 1.2; // domingo
  return 1.0;
}

function getWeatherBoost(): number {
  const cached = dataCache.get<WeatherData>(CACHE_KEYS.WEATHER);
  if (cached) {
    let boost = 0;
    if (cached.data.isRaining) boost += 0.25;
    if (cached.data.temperature < 20) boost += 0.15;
    if (cached.data.temperature > 33) boost += 0.10;
    return boost;
  }
  return 0;
}

function pseudoRandom(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return Math.abs(hash % 100) / 100;
}

function calcDemandScore(hood: Neighborhood, foodCategory: string = "pizza"): number {
  const now = new Date();
  const hour = now.getHours();
  const day = now.getDay();

  const baseDemand = Math.min(100, (hood.population / 8000) * 60 + (hood.avg_income / 5000) * 25);
  const timeMultiplier = getTimeMultiplier(hour);
  const dayMultiplier = getDayMultiplier(day);
  const weatherBoost = getWeatherBoost();
  const noise = pseudoRandom(`${hood.id}-${hour}-${day}`) * 10 - 5;

  const score = baseDemand * timeMultiplier * dayMultiplier * (1 + weatherBoost) + noise;
  return Math.max(0, Math.min(100, Math.round(score)));
}

function calcHungerScore(hood: Neighborhood, timestamp?: Date): number {
  const now = timestamp || new Date();
  const hour = now.getHours();
  const day = now.getDay();
  const minute = now.getMinutes();
  const hourFraction = hour + minute / 60;

  let baseScore = 20;

  // Almoco peak
  if (hourFraction >= 11 && hourFraction <= 14) {
    const peakDist = Math.abs(hourFraction - 12.5);
    baseScore += Math.max(0, 50 - peakDist * 25);
  }

  // Jantar peak
  if (hourFraction >= 18 && hourFraction <= 23) {
    const peakDist = Math.abs(hourFraction - 20);
    baseScore += Math.max(0, 65 - peakDist * 20);
  }

  // Late night
  if (hourFraction >= 22 || hourFraction <= 1) {
    baseScore += 15;
  }

  baseScore *= getDayMultiplier(day);
  baseScore *= (1 + getWeatherBoost());
  baseScore += pseudoRandom(`hunger-${hood.id}-${hour}`) * 8;

  return Math.max(0, Math.min(100, Math.round(baseScore)));
}

export class DemandEngine {
  async calculateDemandScore(neighborhoodId: string, foodCategory: string = "pizza"): Promise<number> {
    const neighborhoods = await getNeighborhoods();
    const hood = neighborhoods.find(n => n.id === neighborhoodId);
    if (!hood) return 50;
    return calcDemandScore(hood, foodCategory);
  }

  async calculateHungerScore(neighborhoodId: string, timestamp?: Date): Promise<number> {
    const neighborhoods = await getNeighborhoods();
    const hood = neighborhoods.find(n => n.id === neighborhoodId);
    if (!hood) return 50;
    return calcHungerScore(hood, timestamp);
  }

  async getHeatmapData(city: string = "Tangara da Serra", foodCategory: string = "pizza") {
    const neighborhoods = await getNeighborhoods();
    return neighborhoods.map(hood => ({
      neighborhoodId: hood.id,
      name: hood.name,
      lat: hood.lat,
      lng: hood.lng,
      demandScore: calcDemandScore(hood, foodCategory),
      hungerScore: calcHungerScore(hood),
      h3Index: `89283082${hood.id.slice(-4)}ffff`,
    }));
  }

  async getHotNeighborhoods(city: string = "Tangara da Serra", limit: number = 5) {
    const data = await this.getHeatmapData(city);
    return data
      .sort((a, b) => b.demandScore - a.demandScore)
      .slice(0, limit);
  }

  async getDemandTimeline(neighborhoodId?: string) {
    const neighborhoods = await getNeighborhoods();
    const hood = neighborhoodId
      ? neighborhoods.find(n => n.id === neighborhoodId)
      : neighborhoods[0];

    if (!hood) return [];

    const hours = Array.from({ length: 24 }, (_, i) => i);
    return hours.map(hour => {
      const mockDate = new Date();
      mockDate.setHours(hour, 0, 0, 0);
      return {
        hour,
        label: `${hour.toString().padStart(2, "0")}:00`,
        demandScore: calcHungerScore(hood, mockDate),
      };
    });
  }

  async getCityHungerScore(city: string = "Tangara da Serra"): Promise<number> {
    const neighborhoods = await getNeighborhoods();
    if (neighborhoods.length === 0) return 50;
    const scores = neighborhoods.map(h => calcHungerScore(h));
    return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  }

  async getPeakForecast(city: string = "Tangara da Serra"): Promise<{ hour: string; score: number }> {
    const timeline = await this.getDemandTimeline();
    if (timeline.length === 0) return { hour: "20:00", score: 75 };
    const peak = timeline.reduce((max, curr) =>
      curr.demandScore > max.demandScore ? curr : max
    );
    return { hour: peak.label, score: peak.demandScore };
  }

  getCurrentWeather(): WeatherData | null {
    const cached = dataCache.get<WeatherData>(CACHE_KEYS.WEATHER);
    return cached?.data ?? null;
  }
}

export const demandEngine = new DemandEngine();
