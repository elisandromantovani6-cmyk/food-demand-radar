import { router, publicProcedure } from "../trpc";
import { dataCache } from "../data/cache";
import { collectCurrentWeather, getMockWeather } from "../collectors/weather-collector";
import { collectCompetitors } from "../collectors/competitors-collector";

export const dataRouter = router({
  /** Status do cache e fontes de dados */
  status: publicProcedure.query(() => {
    return dataCache.stats();
  }),

  /** Clima atual — real (OpenWeather) ou mock */
  weather: publicProcedure.query(async () => {
    const real = await collectCurrentWeather();
    if (real) {
      return { ...real, source: "openweather" as const };
    }
    return { ...getMockWeather(), source: "mock" as const };
  }),

  /** Dados de concorrencia por bairro */
  competitors: publicProcedure.query(async () => {
    const data = await collectCompetitors();
    if (!data) return { neighborhoods: [], totalCompetitors: 0, source: "error" as const };
    return {
      ...data,
      source: data.neighborhoods[0]?.competitors.length > 0 ? "serpapi" as const : "estimated" as const,
    };
  }),
});
