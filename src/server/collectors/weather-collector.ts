/**
 * Weather Collector — OpenWeather API
 *
 * Coleta dados reais de clima para Tangara da Serra.
 * API key: OPENWEATHER_API_KEY no .env
 * Free tier: 1000 calls/dia
 *
 * Endpoints usados:
 * - /weather (clima atual)
 * - /forecast (previsao 5 dias / 3h)
 */

import { dataCache, CACHE_KEYS, CACHE_TTL } from "../data/cache";

const TANGARA_LAT = -14.6229;
const TANGARA_LNG = -57.4933;
const BASE_URL = "https://api.openweathermap.org/data/2.5";

export interface WeatherData {
  temperature: number;        // Celsius
  feelsLike: number;
  humidity: number;           // %
  description: string;
  icon: string;
  isRaining: boolean;
  windSpeed: number;          // m/s
  clouds: number;             // %
  pressure: number;           // hPa
  rainVolume1h?: number;      // mm
  collectedAt: Date;
}

export interface ForecastEntry {
  dt: number;
  hour: string;
  date: string;
  temperature: number;
  feelsLike: number;
  humidity: number;
  description: string;
  icon: string;
  isRaining: boolean;
  rainProbability: number;
  rainVolume3h?: number;
  windSpeed: number;
}

export interface WeatherForecast {
  entries: ForecastEntry[];
  collectedAt: Date;
}

function getApiKey(): string | null {
  return process.env.OPENWEATHER_API_KEY || null;
}

export async function collectCurrentWeather(): Promise<WeatherData | null> {
  const apiKey = getApiKey();
  if (!apiKey) {
    console.warn("[WeatherCollector] OPENWEATHER_API_KEY nao configurada. Usando dados mock.");
    return null;
  }

  // Check cache
  const cached = dataCache.get<WeatherData>(CACHE_KEYS.WEATHER);
  if (cached) return cached.data;

  try {
    const url = `${BASE_URL}/weather?lat=${TANGARA_LAT}&lon=${TANGARA_LNG}&appid=${apiKey}&units=metric&lang=pt_br`;
    const res = await fetch(url, { next: { revalidate: 1800 } });

    if (!res.ok) {
      console.error(`[WeatherCollector] API error: ${res.status} ${res.statusText}`);
      return null;
    }

    const json = await res.json();

    const data: WeatherData = {
      temperature: Math.round(json.main.temp),
      feelsLike: Math.round(json.main.feels_like),
      humidity: json.main.humidity,
      description: json.weather[0]?.description ?? "",
      icon: json.weather[0]?.icon ?? "01d",
      isRaining: ["Rain", "Drizzle", "Thunderstorm"].includes(json.weather[0]?.main),
      windSpeed: json.wind?.speed ?? 0,
      clouds: json.clouds?.all ?? 0,
      pressure: json.main.pressure,
      rainVolume1h: json.rain?.["1h"],
      collectedAt: new Date(),
    };

    dataCache.set(CACHE_KEYS.WEATHER, data, CACHE_TTL.WEATHER);
    console.log(`[WeatherCollector] Clima coletado: ${data.temperature}°C, ${data.description}`);
    return data;
  } catch (error) {
    console.error("[WeatherCollector] Falha na coleta:", error);
    return null;
  }
}

export async function collectWeatherForecast(): Promise<WeatherForecast | null> {
  const apiKey = getApiKey();
  if (!apiKey) return null;

  const cached = dataCache.get<WeatherForecast>(CACHE_KEYS.WEATHER_FORECAST);
  if (cached) return cached.data;

  try {
    const url = `${BASE_URL}/forecast?lat=${TANGARA_LAT}&lon=${TANGARA_LNG}&appid=${apiKey}&units=metric&lang=pt_br`;
    const res = await fetch(url, { next: { revalidate: 3600 } });

    if (!res.ok) return null;

    const json = await res.json();

    const entries: ForecastEntry[] = json.list.map((item: Record<string, unknown>) => {
      const main = item.main as Record<string, number>;
      const weather = (item.weather as Record<string, string>[])[0];
      const wind = item.wind as Record<string, number>;
      const rain = item.rain as Record<string, number> | undefined;
      const dt = item.dt as number;
      const dtTxt = item.dt_txt as string;

      return {
        dt,
        hour: dtTxt.split(" ")[1].substring(0, 5),
        date: dtTxt.split(" ")[0],
        temperature: Math.round(main.temp),
        feelsLike: Math.round(main.feels_like),
        humidity: main.humidity,
        description: weather?.description ?? "",
        icon: weather?.icon ?? "01d",
        isRaining: ["Rain", "Drizzle", "Thunderstorm"].includes(weather?.main),
        rainProbability: Math.round(((item.pop as number) ?? 0) * 100),
        rainVolume3h: rain?.["3h"],
        windSpeed: wind?.speed ?? 0,
      };
    });

    const forecast: WeatherForecast = { entries, collectedAt: new Date() };
    dataCache.set(CACHE_KEYS.WEATHER_FORECAST, forecast, CACHE_TTL.WEATHER_FORECAST);
    console.log(`[WeatherCollector] Previsao coletada: ${entries.length} entradas`);
    return forecast;
  } catch (error) {
    console.error("[WeatherCollector] Falha na previsao:", error);
    return null;
  }
}

/** Gera dados mock quando a API nao esta disponivel */
export function getMockWeather(): WeatherData {
  const hour = new Date().getHours();
  const isAfternoon = hour >= 14 && hour <= 18;
  return {
    temperature: isAfternoon ? 34 : 26,
    feelsLike: isAfternoon ? 36 : 27,
    humidity: isAfternoon ? 45 : 65,
    description: isAfternoon ? "parcialmente nublado" : "ceu limpo",
    icon: isAfternoon ? "03d" : "01n",
    isRaining: false,
    windSpeed: 3.5,
    clouds: isAfternoon ? 40 : 10,
    pressure: 1013,
    collectedAt: new Date(),
  };
}
