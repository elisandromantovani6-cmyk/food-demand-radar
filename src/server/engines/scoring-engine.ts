import { demandEngine } from "./demand-engine";

const NEIGHBORHOOD_DATA: Record<string, { population: number; income: number; competition: number }> = {
  n1: { population: 85, income: 60, competition: 70 },   // Centro
  n2: { population: 55, income: 72, competition: 35 },   // Jd Europa
  n3: { population: 48, income: 55, competition: 25 },   // Parque da Serra
  n4: { population: 38, income: 65, competition: 20 },   // Jd Shangri-la
  n5: { population: 62, income: 50, competition: 40 },   // Progresso
  n6: { population: 42, income: 45, competition: 18 },   // Jd Goias
  n7: { population: 35, income: 68, competition: 30 },   // Parque Universitario
  n8: { population: 40, income: 52, competition: 22 },   // Jd Cidade Alta
  n9: { population: 32, income: 48, competition: 15 },   // Jd Monte Libano
  n10: { population: 50, income: 58, competition: 28 },  // Jd Sao Paulo
  n11: { population: 45, income: 50, competition: 20 },  // Parque Tangara
  n12: { population: 30, income: 55, competition: 12 },  // Jd Buritis
  n13: { population: 38, income: 52, competition: 25 },  // Triangulo
  n14: { population: 28, income: 45, competition: 10 },  // Jd Nazare
  n15: { population: 35, income: 48, competition: 16 },  // Parque Leblon
  n16: { population: 25, income: 42, competition: 8 },   // Jd Dona Julia
  n17: { population: 40, income: 50, competition: 22 },  // Sao Jorge
  n18: { population: 22, income: 60, competition: 5 },   // Jd Alto da Boa Vista
  n19: { population: 28, income: 46, competition: 10 },  // Jd Morada do Sol
  n20: { population: 32, income: 52, competition: 14 },  // Jd dos Ipes
};

export class ScoringEngine {
  pizzaOpportunityScore(neighborhoodId: string, foodCategory: string = "pizza"): number {
    const demand = demandEngine.calculateDemandScore(neighborhoodId, foodCategory);
    const data = NEIGHBORHOOD_DATA[neighborhoodId];
    if (!data) return 50;

    const score =
      demand * 0.35 +
      data.population * 0.25 +
      data.income * 0.15 -
      data.competition * 0.25;

    return Math.max(0, Math.min(100, Math.round(score)));
  }

  getCompetitionDensity(neighborhoodId: string): number {
    return NEIGHBORHOOD_DATA[neighborhoodId]?.competition ?? 50;
  }

  getExpansionRanking(city: string = "Sao Paulo") {
    return Object.entries(NEIGHBORHOOD_DATA).map(([id, data]) => {
      const pos = this.pizzaOpportunityScore(id);
      const demand = demandEngine.calculateDemandScore(id);
      const growth = Math.round(Math.random() * 30 + 5);
      const estimatedRevenue = Math.round(15000 + pos * 350 + Math.random() * 5000);

      return {
        neighborhoodId: id,
        name: demandEngine.getHeatmapData().find(n => n.neighborhoodId === id)?.name ?? id,
        posScore: pos,
        demandScore: demand,
        competitionScore: data.competition,
        growthTrend: growth,
        estimatedMonthlyRevenue: estimatedRevenue,
        riskLevel: data.competition > 60 ? "alto" : data.competition > 40 ? "medio" : "baixo",
      };
    }).sort((a, b) => b.posScore - a.posScore);
  }
}

export const scoringEngine = new ScoringEngine();
