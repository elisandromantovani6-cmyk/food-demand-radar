import { demandEngine } from "./demand-engine";
import { supabaseAdmin } from "@/lib/supabase/server";
import { dataCache } from "../data/cache";

interface NeighborhoodData {
  id: string;
  name: string;
  population: number;
  avg_income: number;
  lat: number;
  lng: number;
}

const SCORING_CACHE_KEY = "scoring_neighborhoods";
const SCORING_CACHE_TTL = 5 * 60 * 1000; // 5 min

async function getNeighborhoodData(): Promise<NeighborhoodData[]> {
  const cached = dataCache.get<NeighborhoodData[]>(SCORING_CACHE_KEY);
  if (cached) return cached.data;

  const { data, error } = await supabaseAdmin
    .from("neighborhoods")
    .select("id, name, population, avg_income, lat, lng");

  if (error || !data || data.length === 0) {
    return [];
  }

  const neighborhoods = data as NeighborhoodData[];
  dataCache.set(SCORING_CACHE_KEY, neighborhoods, SCORING_CACHE_TTL);
  return neighborhoods;
}

// Estima concorrência baseado em população e renda (sem dados reais de concorrentes)
function estimateCompetition(pop: number, income: number): number {
  // Bairros maiores e mais ricos tendem a ter mais concorrência
  const popFactor = Math.min(pop / 8000, 1) * 50;
  const incomeFactor = Math.min(income / 5000, 1) * 30;
  return Math.round(popFactor + incomeFactor);
}

export class ScoringEngine {
  async pizzaOpportunityScore(neighborhoodId: string, foodCategory: string = "pizza"): Promise<number> {
    const demand = await demandEngine.calculateDemandScore(neighborhoodId, foodCategory);
    const neighborhoods = await getNeighborhoodData();
    const n = neighborhoods.find(n => n.id === neighborhoodId);
    if (!n) return 50;

    const popScore = Math.min((n.population ?? 3000) / 8000, 1) * 100;
    const incomeScore = Math.min((n.avg_income ?? 2500) / 5000, 1) * 100;
    const competition = estimateCompetition(n.population ?? 3000, n.avg_income ?? 2500);

    const score =
      demand * 0.35 +
      popScore * 0.25 +
      incomeScore * 0.15 -
      competition * 0.25;

    return Math.max(0, Math.min(100, Math.round(score)));
  }

  async getCompetitionDensity(neighborhoodId: string): Promise<number> {
    const neighborhoods = await getNeighborhoodData();
    const n = neighborhoods.find(n => n.id === neighborhoodId);
    if (!n) return 50;
    return estimateCompetition(n.population ?? 3000, n.avg_income ?? 2500);
  }

  async getExpansionRanking(city: string = "Tangara da Serra") {
    const neighborhoods = await getNeighborhoodData();
    const heatmap = await demandEngine.getHeatmapData(city);

    const rankings = await Promise.all(
      neighborhoods.map(async (n) => {
        const pos = await this.pizzaOpportunityScore(n.id);
        const heatData = heatmap.find(h => h.neighborhoodId === n.id);
        const demand = heatData?.demandScore ?? 50;
        const competition = estimateCompetition(n.population ?? 3000, n.avg_income ?? 2500);
        const growth = Math.round(Math.random() * 30 + 5);
        const estimatedRevenue = Math.round(15000 + pos * 350 + Math.random() * 5000);

        return {
          neighborhoodId: n.id,
          name: n.name,
          posScore: pos,
          demandScore: demand,
          competitionScore: competition,
          growthTrend: growth,
          estimatedMonthlyRevenue: estimatedRevenue,
          riskLevel: competition > 60 ? "alto" : competition > 40 ? "medio" : "baixo",
        };
      })
    );

    return rankings.sort((a, b) => b.posScore - a.posScore);
  }
}

export const scoringEngine = new ScoringEngine();
