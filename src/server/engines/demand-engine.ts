// Bairros de Tangara da Serra - MT
// Coordenadas aproximadas baseadas na geografia da cidade
// Centro da cidade: -14.6229, -57.4933

import { dataCache, CACHE_KEYS } from "../data/cache";
import type { WeatherData } from "../collectors/weather-collector";

const NEIGHBORHOODS = [
  { id: "n1", name: "Centro", lat: -14.6229, lng: -57.4933, population: 12000, baseDemand: 85 },
  { id: "n2", name: "Jardim Europa", lat: -14.6180, lng: -57.4870, population: 5500, baseDemand: 72 },
  { id: "n3", name: "Parque da Serra", lat: -14.6310, lng: -57.5010, population: 4800, baseDemand: 65 },
  { id: "n4", name: "Jardim Shangri-la", lat: -14.6150, lng: -57.4990, population: 3800, baseDemand: 60 },
  { id: "n5", name: "Progresso", lat: -14.6280, lng: -57.4850, population: 6200, baseDemand: 68 },
  { id: "n6", name: "Jardim Goias", lat: -14.6350, lng: -57.4900, population: 4200, baseDemand: 55 },
  { id: "n7", name: "Parque Universitario", lat: -14.6120, lng: -57.5050, population: 3500, baseDemand: 70 },
  { id: "n8", name: "Jardim Cidade Alta", lat: -14.6190, lng: -57.5030, population: 4000, baseDemand: 58 },
  { id: "n9", name: "Jardim Monte Libano", lat: -14.6270, lng: -57.5080, population: 3200, baseDemand: 52 },
  { id: "n10", name: "Jardim Sao Paulo", lat: -14.6160, lng: -57.4830, population: 5000, baseDemand: 63 },
  { id: "n11", name: "Parque Tangara", lat: -14.6330, lng: -57.4960, population: 4500, baseDemand: 56 },
  { id: "n12", name: "Jardim Buritis", lat: -14.6100, lng: -57.4920, population: 3000, baseDemand: 50 },
  { id: "n13", name: "Triangulo", lat: -14.6250, lng: -57.4800, population: 3800, baseDemand: 62 },
  { id: "n14", name: "Jardim Nazare", lat: -14.6200, lng: -57.5100, population: 2800, baseDemand: 48 },
  { id: "n15", name: "Parque Leblon", lat: -14.6380, lng: -57.4870, population: 3500, baseDemand: 54 },
  { id: "n16", name: "Jardim Dona Julia", lat: -14.6140, lng: -57.4780, population: 2500, baseDemand: 45 },
  { id: "n17", name: "Sao Jorge", lat: -14.6300, lng: -57.4780, population: 4000, baseDemand: 58 },
  { id: "n18", name: "Jardim Alto da Boa Vista", lat: -14.6080, lng: -57.4960, population: 2200, baseDemand: 42 },
  { id: "n19", name: "Jardim Morada do Sol", lat: -14.6360, lng: -57.5050, population: 2800, baseDemand: 47 },
  { id: "n20", name: "Jardim dos Ipes", lat: -14.6220, lng: -57.4760, population: 3200, baseDemand: 53 },
];

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
  // Tenta usar dados reais de clima do cache
  const cached = dataCache.get<WeatherData>(CACHE_KEYS.WEATHER);
  if (cached) {
    let boost = 0;
    if (cached.data.isRaining) boost += 0.25;
    if (cached.data.temperature < 20) boost += 0.15;
    if (cached.data.temperature > 33) boost += 0.10;
    return boost;
  }
  return 0; // Sem dados de clima, sem boost
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

export class DemandEngine {
  calculateDemandScore(neighborhoodId: string, foodCategory: string = "pizza"): number {
    const hood = NEIGHBORHOODS.find(n => n.id === neighborhoodId);
    if (!hood) return 50;

    const now = new Date();
    const hour = now.getHours();
    const day = now.getDay();

    const timeMultiplier = getTimeMultiplier(hour);
    const dayMultiplier = getDayMultiplier(day);
    const weatherBoost = getWeatherBoost();
    const noise = pseudoRandom(`${neighborhoodId}-${hour}-${day}`) * 10 - 5;

    const score = hood.baseDemand * timeMultiplier * dayMultiplier * (1 + weatherBoost) + noise;
    return Math.max(0, Math.min(100, Math.round(score)));
  }

  calculateHungerScore(neighborhoodId: string, timestamp?: Date): number {
    const hood = NEIGHBORHOODS.find(n => n.id === neighborhoodId);
    if (!hood) return 50;

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
    baseScore += pseudoRandom(`hunger-${neighborhoodId}-${hour}`) * 8;

    return Math.max(0, Math.min(100, Math.round(baseScore)));
  }

  getHeatmapData(city: string = "Tangara da Serra", foodCategory: string = "pizza") {
    return NEIGHBORHOODS.map(hood => ({
      neighborhoodId: hood.id,
      name: hood.name,
      lat: hood.lat,
      lng: hood.lng,
      demandScore: this.calculateDemandScore(hood.id, foodCategory),
      hungerScore: this.calculateHungerScore(hood.id),
      h3Index: `89283082${hood.id.replace("n", "")}ffff`,
    }));
  }

  getHotNeighborhoods(city: string = "Tangara da Serra", limit: number = 5) {
    const data = this.getHeatmapData(city);
    return data
      .sort((a, b) => b.demandScore - a.demandScore)
      .slice(0, limit);
  }

  getDemandTimeline(neighborhoodId?: string) {
    const hours = Array.from({ length: 24 }, (_, i) => i);
    return hours.map(hour => {
      const mockDate = new Date();
      mockDate.setHours(hour, 0, 0, 0);

      const id = neighborhoodId || "n1";
      return {
        hour,
        label: `${hour.toString().padStart(2, "0")}:00`,
        demandScore: this.calculateHungerScore(id, mockDate),
      };
    });
  }

  getCityHungerScore(city: string = "Tangara da Serra"): number {
    const scores = NEIGHBORHOODS.map(h => this.calculateHungerScore(h.id));
    return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  }

  getPeakForecast(city: string = "Tangara da Serra"): { hour: string; score: number } {
    const timeline = this.getDemandTimeline("n1");
    const peak = timeline.reduce((max, curr) =>
      curr.demandScore > max.demandScore ? curr : max
    );
    return { hour: peak.label, score: peak.demandScore };
  }

  /** Retorna dados de clima atual (do cache, se disponivel) */
  getCurrentWeather(): WeatherData | null {
    const cached = dataCache.get<WeatherData>(CACHE_KEYS.WEATHER);
    return cached?.data ?? null;
  }
}

export const demandEngine = new DemandEngine();
