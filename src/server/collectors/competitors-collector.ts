/**
 * Competitors Collector — SerpAPI (Google Places)
 *
 * Coleta restaurantes/pizzarias reais por bairro usando Google Places
 * via SerpAPI. API key: SERPAPI_KEY no .env
 * Free tier: 100 buscas/mes
 *
 * Fallback: Se SERPAPI_KEY nao configurada, gera dados estimados.
 */

import { dataCache, CACHE_KEYS, CACHE_TTL } from "../data/cache";

export interface CompetitorData {
  name: string;
  address: string;
  neighborhood: string;
  rating: number;
  reviewCount: number;
  priceLevel: string;
  types: string[];
  lat: number;
  lng: number;
  isOpen?: boolean;
}

export interface CompetitorsByNeighborhood {
  neighborhood: string;
  competitors: CompetitorData[];
  totalCount: number;
  avgRating: number;
  density: "baixa" | "media" | "alta" | "saturada";
}

export interface CompetitorsResult {
  neighborhoods: CompetitorsByNeighborhood[];
  totalCompetitors: number;
  collectedAt: Date;
}

const NEIGHBORHOODS_COORDS = [
  { name: "Centro", lat: -14.6229, lng: -57.4933 },
  { name: "Jardim Europa", lat: -14.6180, lng: -57.4870 },
  { name: "Parque da Serra", lat: -14.6310, lng: -57.5010 },
  { name: "Jardim Shangri-la", lat: -14.6150, lng: -57.4990 },
  { name: "Progresso", lat: -14.6280, lng: -57.4850 },
  { name: "Jardim Goias", lat: -14.6350, lng: -57.4900 },
  { name: "Parque Universitario", lat: -14.6120, lng: -57.5050 },
  { name: "Jardim Cidade Alta", lat: -14.6190, lng: -57.5030 },
  { name: "Jardim Monte Libano", lat: -14.6270, lng: -57.5080 },
  { name: "Jardim Sao Paulo", lat: -14.6160, lng: -57.4830 },
];

function getApiKey(): string | null {
  return process.env.SERPAPI_KEY || null;
}

export async function collectCompetitors(): Promise<CompetitorsResult | null> {
  const cached = dataCache.get<CompetitorsResult>(CACHE_KEYS.COMPETITORS_ALL);
  if (cached) return cached.data;

  const apiKey = getApiKey();
  if (!apiKey) {
    console.warn("[CompetitorsCollector] SERPAPI_KEY nao configurada. Usando dados estimados.");
    return getEstimatedCompetitors();
  }

  try {
    const allNeighborhoods: CompetitorsByNeighborhood[] = [];
    let totalCompetitors = 0;

    // Limitar a 5 bairros por coleta para nao exceder free tier
    const bairrosToCollect = NEIGHBORHOODS_COORDS.slice(0, 5);

    for (const hood of bairrosToCollect) {
      try {
        const url = new URL("https://serpapi.com/search.json");
        url.searchParams.set("engine", "google_maps");
        url.searchParams.set("q", "pizzaria");
        url.searchParams.set("ll", `@${hood.lat},${hood.lng},15z`);
        url.searchParams.set("type", "search");
        url.searchParams.set("api_key", apiKey);

        const res = await fetch(url.toString());
        if (!res.ok) {
          console.warn(`[CompetitorsCollector] SerpAPI error para ${hood.name}: ${res.status}`);
          continue;
        }

        const json = await res.json();
        const places = json.local_results ?? [];

        const competitors: CompetitorData[] = places.map((place: Record<string, unknown>) => ({
          name: place.title as string,
          address: (place.address as string) ?? "",
          neighborhood: hood.name,
          rating: (place.rating as number) ?? 0,
          reviewCount: (place.reviews as number) ?? 0,
          priceLevel: (place.price as string) ?? "$$",
          types: ((place.type as string) ?? "").split(",").map((t: string) => t.trim()),
          lat: (place.gps_coordinates as Record<string, number>)?.latitude ?? hood.lat,
          lng: (place.gps_coordinates as Record<string, number>)?.longitude ?? hood.lng,
          isOpen: place.open_state === "Open",
        }));

        const count = competitors.length;
        const avgRating = count > 0
          ? Math.round((competitors.reduce((s, c) => s + c.rating, 0) / count) * 10) / 10
          : 0;

        allNeighborhoods.push({
          neighborhood: hood.name,
          competitors,
          totalCount: count,
          avgRating,
          density: count >= 10 ? "saturada" : count >= 6 ? "alta" : count >= 3 ? "media" : "baixa",
        });

        totalCompetitors += count;

        // Rate limiting
        await new Promise(r => setTimeout(r, 1000));
      } catch (err) {
        console.warn(`[CompetitorsCollector] Falha para ${hood.name}:`, err);
      }
    }

    const result: CompetitorsResult = {
      neighborhoods: allNeighborhoods,
      totalCompetitors,
      collectedAt: new Date(),
    };

    dataCache.set(CACHE_KEYS.COMPETITORS_ALL, result, CACHE_TTL.COMPETITORS);
    console.log(`[CompetitorsCollector] ${totalCompetitors} concorrentes em ${allNeighborhoods.length} bairros`);
    return result;
  } catch (error) {
    console.error("[CompetitorsCollector] Falha geral:", error);
    return getEstimatedCompetitors();
  }
}

/** Dados estimados baseados em conhecimento local quando API nao esta disponivel */
function getEstimatedCompetitors(): CompetitorsResult {
  const estimated: CompetitorsByNeighborhood[] = [
    { neighborhood: "Centro", competitors: [], totalCount: 12, avgRating: 4.2, density: "saturada" },
    { neighborhood: "Jardim Europa", competitors: [], totalCount: 5, avgRating: 4.4, density: "media" },
    { neighborhood: "Parque da Serra", competitors: [], totalCount: 4, avgRating: 4.1, density: "media" },
    { neighborhood: "Jardim Shangri-la", competitors: [], totalCount: 3, avgRating: 4.3, density: "media" },
    { neighborhood: "Progresso", competitors: [], totalCount: 7, avgRating: 4.0, density: "alta" },
    { neighborhood: "Jardim Goias", competitors: [], totalCount: 3, avgRating: 3.9, density: "baixa" },
    { neighborhood: "Parque Universitario", competitors: [], totalCount: 5, avgRating: 4.2, density: "media" },
    { neighborhood: "Jardim Cidade Alta", competitors: [], totalCount: 3, avgRating: 4.0, density: "baixa" },
    { neighborhood: "Jardim Monte Libano", competitors: [], totalCount: 2, avgRating: 3.8, density: "baixa" },
    { neighborhood: "Jardim Sao Paulo", competitors: [], totalCount: 4, avgRating: 4.1, density: "media" },
  ];

  return {
    neighborhoods: estimated,
    totalCompetitors: estimated.reduce((s, n) => s + n.totalCount, 0),
    collectedAt: new Date(),
  };
}
