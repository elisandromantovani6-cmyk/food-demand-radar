export interface CampaignSuggestion {
  id: string;
  type: string;
  triggerType: string;
  title: string;
  copyTitle: string;
  copyBody: string;
  targetDescription: string;
  offer: { description: string; discount?: string };
  platforms: string[];
  estimatedBudget: string;
  estimatedReach: number;
  priority: "alta" | "média" | "baixa";
}

const CAMPAIGN_TEMPLATES = {
  weather_rain: {
    type: "weather",
    triggerType: "rain",
    title: "Campanha Dia de Chuva",
    copyTitle: "Chovendo aí? Fica em casa!",
    copyBody: "Pizza quentinha na sua porta em até 40min. Entrega GRÁTIS hoje!",
    offer: { description: "Entrega grátis durante a chuva", discount: "frete_zero" },
    platforms: ["whatsapp", "instagram", "google_ads"],
    estimatedBudget: "R$ 50-80/dia",
    priority: "alta" as const,
  },
  weather_cold: {
    type: "weather",
    triggerType: "cold",
    title: "Campanha Noite Fria",
    copyTitle: "Noite fria pede pizza!",
    copyBody: "Bordas recheadas GRÁTIS em todas as pizzas hoje. Esquenta a noite com a gente!",
    offer: { description: "Borda recheada grátis", discount: "borda_gratis" },
    platforms: ["whatsapp", "instagram"],
    estimatedBudget: "R$ 30-60/dia",
    priority: "média" as const,
  },
  time_dinner: {
    type: "time_based",
    triggerType: "dinner_peak",
    title: "Campanha Hora do Jantar",
    copyTitle: "Bateu a fome das 20h?",
    copyBody: "Peça agora e receba antes do pico! Pizza grande a partir de R$34,90",
    offer: { description: "Preço especial horário de pico", discount: "10_off" },
    platforms: ["whatsapp", "google_ads"],
    estimatedBudget: "R$ 40-70/dia",
    priority: "alta" as const,
  },
  time_lunch: {
    type: "time_based",
    triggerType: "lunch_peak",
    title: "Campanha Almoço Express",
    copyTitle: "Almoço rápido e delicioso!",
    copyBody: "Pizza individual + refri por apenas R$24,90. Entrega em 30min!",
    offer: { description: "Combo almoço individual", discount: "combo_almoco" },
    platforms: ["google_ads", "instagram"],
    estimatedBudget: "R$ 30-50/dia",
    priority: "média" as const,
  },
  time_late_night: {
    type: "time_based",
    triggerType: "late_night",
    title: "Campanha Late Night",
    copyTitle: "Fome de madrugada?",
    copyBody: "Combo Late Night: Pizza + Guaraná por R$34,90. Até meia-noite!",
    offer: { description: "Combo late night com desconto", discount: "combo_noite" },
    platforms: ["instagram", "whatsapp"],
    estimatedBudget: "R$ 25-40/dia",
    priority: "média" as const,
  },
  event_football: {
    type: "event",
    triggerType: "football",
    title: "Campanha Dia de Jogo",
    copyTitle: "Dia de jogo é dia de pizza!",
    copyBody: "Combo Jogo: Pizza GG + 2 Refris por apenas R$54,90. Garanta antes da partida!",
    offer: { description: "Combo especial dia de jogo", discount: "combo_jogo" },
    platforms: ["whatsapp", "instagram", "google_ads"],
    estimatedBudget: "R$ 60-100/dia",
    priority: "alta" as const,
  },
  hyperlocal_surge: {
    type: "hyperlocal",
    triggerType: "demand_surge",
    title: "Campanha Hiper-Local",
    copyTitle: "Promoção exclusiva para seu bairro!",
    copyBody: "Só para você que mora por aqui: segunda pizza com 50% de desconto!",
    offer: { description: "Segunda pizza pela metade", discount: "50_segunda" },
    platforms: ["meta_ads", "google_ads"],
    estimatedBudget: "R$ 40-80/dia",
    priority: "média" as const,
  },
  weekend_family: {
    type: "time_based",
    triggerType: "weekend",
    title: "Campanha Fim de Semana em Família",
    copyTitle: "Fim de semana pede pizza em família!",
    copyBody: "Combo Família: 2 pizzas GG + refri 2L + sobremesa por R$89,90!",
    offer: { description: "Combo família com desconto", discount: "combo_familia" },
    platforms: ["whatsapp", "instagram"],
    estimatedBudget: "R$ 35-60/dia",
    priority: "média" as const,
  },
};

export class CampaignEngine {
  generateSuggestions(): CampaignSuggestion[] {
    const now = new Date();
    const hour = now.getHours();
    const day = now.getDay();
    const suggestions: CampaignSuggestion[] = [];
    let id = 1;

    // Weather campaigns (simula chuva)
    if (hour >= 15 && hour <= 22) {
      suggestions.push(this.toSuggestion(CAMPAIGN_TEMPLATES.weather_rain, `sug-${id++}`));
    }

    // Time-based campaigns
    if (hour >= 10 && hour <= 13) {
      suggestions.push(this.toSuggestion(CAMPAIGN_TEMPLATES.time_lunch, `sug-${id++}`));
    }
    if (hour >= 17 && hour <= 21) {
      suggestions.push(this.toSuggestion(CAMPAIGN_TEMPLATES.time_dinner, `sug-${id++}`));
    }
    if (hour >= 21 || hour <= 1) {
      suggestions.push(this.toSuggestion(CAMPAIGN_TEMPLATES.time_late_night, `sug-${id++}`));
    }

    // Event campaigns
    if (day === 3 || day === 6 || day === 0) {
      suggestions.push(this.toSuggestion(CAMPAIGN_TEMPLATES.event_football, `sug-${id++}`));
    }

    // Weekend
    if (day === 0 || day === 6) {
      suggestions.push(this.toSuggestion(CAMPAIGN_TEMPLATES.weekend_family, `sug-${id++}`));
    }

    // Always suggest hyperlocal
    suggestions.push(this.toSuggestion(CAMPAIGN_TEMPLATES.hyperlocal_surge, `sug-${id++}`));

    return suggestions.sort((a, b) => {
      const priorityOrder = { alta: 0, "média": 1, baixa: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }

  private toSuggestion(template: (typeof CAMPAIGN_TEMPLATES)[keyof typeof CAMPAIGN_TEMPLATES], id: string): CampaignSuggestion {
    return {
      id,
      ...template,
      targetDescription: "Raio de 3km do restaurante",
      estimatedReach: Math.round(Math.random() * 5000 + 2000),
    };
  }
}

export const campaignEngine = new CampaignEngine();
