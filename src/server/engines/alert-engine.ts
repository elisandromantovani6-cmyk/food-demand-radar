import { demandEngine } from "./demand-engine";
import { collectCurrentWeather, getMockWeather, type WeatherData } from "../collectors/weather-collector";

export interface Alert {
  id: string;
  type: "weather" | "surge" | "event" | "underserved";
  severity: "low" | "medium" | "high" | "critical";
  title: string;
  description: string;
  data: Record<string, unknown>;
  createdAt: Date;
}

export class AlertEngine {
  private async getWeather(): Promise<WeatherData> {
    const real = await collectCurrentWeather();
    return real ?? getMockWeather();
  }

  async checkWeatherAlerts(): Promise<Alert[]> {
    const weather = await this.getWeather();
    const alerts: Alert[] = [];

    if (weather.isRaining) {
      alerts.push({
        id: `weather-rain-${Date.now()}`,
        type: "weather",
        severity: "high",
        title: "Chuva detectada em Tangara da Serra",
        description: `${weather.description}. Temperatura: ${weather.temperature}°C. Pedidos de delivery aumentam 25-40% durante chuva. Campanha climatica recomendada!`,
        data: { temperature: weather.temperature, humidity: weather.humidity, description: weather.description, isReal: true },
        createdAt: new Date(),
      });
    }

    if (weather.temperature < 20) {
      alerts.push({
        id: `weather-cold-${Date.now()}`,
        type: "weather",
        severity: "medium",
        title: "Temperatura baixa detectada",
        description: `Temperatura atual: ${weather.temperature}°C (sensacao ${weather.feelsLike}°C). Dias frios aumentam pedidos de delivery em ~15%. Campanha de inverno sugerida.`,
        data: { temperature: weather.temperature, feelsLike: weather.feelsLike, isReal: true },
        createdAt: new Date(),
      });
    }

    if (weather.temperature > 35) {
      alerts.push({
        id: `weather-hot-${Date.now()}`,
        type: "weather",
        severity: "low",
        title: "Calor intenso em Tangara da Serra",
        description: `Temperatura: ${weather.temperature}°C. Calor extremo pode reduzir fluxo de pessoas mas aumentar delivery. Considere ofertas com bebidas.`,
        data: { temperature: weather.temperature, isReal: true },
        createdAt: new Date(),
      });
    }

    return alerts;
  }

  checkSurgeAlerts(city: string = "Tangara da Serra"): Alert[] {
    const hotSpots = demandEngine.getHotNeighborhoods(city, 3);
    const alerts: Alert[] = [];

    for (const spot of hotSpots) {
      if (spot.hungerScore > 75) {
        alerts.push({
          id: `surge-${spot.neighborhoodId}-${Date.now()}`,
          type: "surge",
          severity: spot.hungerScore > 85 ? "critical" : "high",
          title: `Hunger Score alto em ${spot.name}`,
          description: `O Hunger Score em ${spot.name} atingiu ${spot.hungerScore}/100. Alta probabilidade de pico de pedidos. Considere ativar campanha hiper-local.`,
          data: { neighborhoodId: spot.neighborhoodId, hungerScore: spot.hungerScore, demandScore: spot.demandScore },
          createdAt: new Date(),
        });
      }
    }

    return alerts;
  }

  checkEventAlerts(): Alert[] {
    const now = new Date();
    const day = now.getDay();
    const hour = now.getHours();
    const alerts: Alert[] = [];

    if ((day === 3 || day === 6 || day === 0) && hour >= 14) {
      alerts.push({
        id: `event-football-${now.toISOString()}`,
        type: "event",
        severity: "low",
        title: "Jogo de futebol detectado hoje",
        description: "Partida do campeonato detectada. Historicamente, pedidos de pizza aumentam 35-50% durante jogos. Combo jogo sugerido.",
        data: { eventType: "football", estimatedImpact: "+40%", window: "1h antes ate 30min apos" },
        createdAt: now,
      });
    }

    if (day === 0 || day === 6) {
      alerts.push({
        id: `event-weekend-${now.toISOString()}`,
        type: "event",
        severity: "low",
        title: "Fim de semana - demanda elevada",
        description: "Fins de semana apresentam aumento medio de 25% nos pedidos. Considere ofertas especiais.",
        data: { eventType: "weekend", estimatedImpact: "+25%" },
        createdAt: now,
      });
    }

    return alerts;
  }

  async runAlertCheck(city: string = "Tangara da Serra"): Promise<Alert[]> {
    const weatherAlerts = await this.checkWeatherAlerts();
    return [
      ...weatherAlerts,
      ...this.checkSurgeAlerts(city),
      ...this.checkEventAlerts(),
    ].sort((a, b) => {
      const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      return severityOrder[a.severity] - severityOrder[b.severity];
    });
  }
}

export const alertEngine = new AlertEngine();
