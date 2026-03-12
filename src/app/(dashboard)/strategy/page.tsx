"use client";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { trpc } from "@/lib/trpc";
import {
  Target,
  TrendingUp,
  MapPin,
  Zap,
  Shield,
  Crown,
  ChevronRight,
  AlertTriangle,
} from "lucide-react";

const priorityColors = {
  alta: "border-red-500/30 bg-red-500/5",
  media: "border-amber-500/30 bg-amber-500/5",
  baixa: "border-emerald-500/30 bg-emerald-500/5",
};

const priorityBadge = {
  alta: "bg-red-500/10 text-red-400",
  media: "bg-amber-500/10 text-amber-400",
  baixa: "bg-emerald-500/10 text-emerald-400",
};

export default function StrategyPage() {
  const { data: ranking } = trpc.expansion.getRanking.useQuery(
    { city: "Tangara da Serra" },
    { refetchInterval: 300000 }
  );
  const { data: trends } = trpc.trends.getFlavors.useQuery(
    { city: "Tangara da Serra" },
    { refetchInterval: 300000 }
  );
  const { data: cityScore } = trpc.demand.getCityScore.useQuery(
    { city: "Tangara da Serra" },
    { refetchInterval: 60000 }
  );
  const { data: recommendations } = trpc.trends.getMenuRecommendations.useQuery(
    {},
    { refetchInterval: 300000 }
  );

  const topBairros = (ranking ?? []).slice(0, 5);
  const trendingFlavors = (trends ?? []).filter(t => t.status === "trending" || t.status === "emerging").slice(0, 5);
  const lowCompetition = (ranking ?? []).filter(r => r.competitionScore < 30 && r.demandScore > 50).slice(0, 3);
  const hungerScore = cityScore?.hungerScore ?? 0;
  const peakHour = cityScore?.peak?.hour ?? "20:00";

  // Gerar ações estratégicas baseadas nos dados
  const strategies = generateStrategies(topBairros, trendingFlavors, lowCompetition, hungerScore, peakHour);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Playbook Estrategico</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Plano de acao consolidado para dominar o mercado de Tangara da Serra
        </p>
      </div>

      {/* Score geral da cidade */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <ScoreCard
          label="Hunger Score Cidade"
          value={hungerScore}
          suffix="/100"
          icon={Zap}
          color={hungerScore > 70 ? "text-red-400" : hungerScore > 50 ? "text-amber-400" : "text-emerald-400"}
        />
        <ScoreCard
          label="Horario de Pico"
          value={peakHour}
          icon={Target}
          color="text-primary"
        />
        <ScoreCard
          label="Bairros Oportunidade"
          value={lowCompetition.length}
          suffix=" subatendidos"
          icon={MapPin}
          color="text-emerald-400"
        />
        <ScoreCard
          label="Sabores em Alta"
          value={trendingFlavors.length}
          suffix=" tendencias"
          icon={TrendingUp}
          color="text-chart-2"
        />
      </div>

      {/* Ações estratégicas */}
      <div>
        <h2 className="text-base font-semibold mb-3 flex items-center gap-2">
          <Crown className="w-4 h-4 text-amber-400" />
          Acoes Prioritarias
        </h2>
        <div className="space-y-3">
          {strategies.map((s, i) => (
            <Card
              key={i}
              className={cn(
                "border transition-colors hover:border-primary/30",
                priorityColors[s.priority]
              )}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    <s.icon className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-semibold">{s.title}</h3>
                      <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-medium", priorityBadge[s.priority])}>
                        {s.priority}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{s.description}</p>
                    {s.metrics && (
                      <div className="flex gap-4 mt-2">
                        {s.metrics.map((m, j) => (
                          <span key={j} className="text-xs text-muted-foreground/80">
                            <span className="font-medium text-foreground">{m.value}</span> {m.label}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground/50 shrink-0 mt-1" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Grid: Top Bairros + Sabores */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top 5 Bairros */}
        <Card>
          <CardContent className="p-4">
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary" />
              Top 5 Bairros por Oportunidade
            </h3>
            <div className="space-y-2">
              {topBairros.map((b, i) => (
                <div key={b.neighborhoodId} className="flex items-center gap-3 p-2 rounded-lg bg-accent/30">
                  <span className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
                    i === 0 ? "bg-amber-500/20 text-amber-400" :
                    i === 1 ? "bg-zinc-400/20 text-zinc-300" :
                    i === 2 ? "bg-orange-800/20 text-orange-400" :
                    "bg-muted text-muted-foreground"
                  )}>
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{b.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Demanda {b.demandScore} | Concorrencia {b.competitionScore} | R${b.estimatedMonthlyRevenue.toLocaleString()}/mes
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-primary">{b.posScore}</p>
                    <p className="text-[10px] text-muted-foreground">score</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Sabores em Tendência */}
        <Card>
          <CardContent className="p-4">
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-chart-2" />
              Sabores em Tendencia
            </h3>
            <div className="space-y-2">
              {trendingFlavors.length > 0 ? trendingFlavors.map((f, i) => (
                <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-accent/30">
                  <div className="flex-1">
                    <p className="text-sm font-medium">{f.flavor}</p>
                    <p className="text-xs text-muted-foreground">
                      Score {f.trendScore} | {f.velocity > 0 ? "+" : ""}{f.velocity}% velocidade
                    </p>
                  </div>
                  <span className={cn(
                    "text-[10px] px-2 py-0.5 rounded-full font-medium",
                    f.status === "emerging" ? "bg-purple-500/10 text-purple-400" : "bg-emerald-500/10 text-emerald-400"
                  )}>
                    {f.status}
                  </span>
                </div>
              )) : (
                <p className="text-sm text-muted-foreground">Nenhum sabor em tendencia no momento</p>
              )}
            </div>

            {/* Recomendações de cardápio */}
            {(recommendations ?? []).length > 0 && (
              <>
                <h4 className="text-xs font-semibold mt-4 mb-2 text-muted-foreground uppercase tracking-wider">
                  Recomendacoes para o Cardapio
                </h4>
                {(recommendations ?? []).slice(0, 3).map((r, i) => (
                  <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-primary/5 border border-primary/10 mb-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs font-medium">{r.flavor}</p>
                      <p className="text-[11px] text-muted-foreground">{r.reason}</p>
                    </div>
                  </div>
                ))}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Bairros subatendidos */}
      {lowCompetition.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-400" />
              Oportunidades: Bairros Subatendidos
            </h3>
            <p className="text-xs text-muted-foreground mb-3">
              Alta demanda + baixa concorrencia = oportunidade de dominar
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {lowCompetition.map((b) => (
                <div key={b.neighborhoodId} className="p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
                  <p className="text-sm font-semibold">{b.name}</p>
                  <div className="mt-2 space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Demanda</span>
                      <span className="font-medium">{b.demandScore}/100</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Concorrencia</span>
                      <span className="font-medium text-emerald-400">{b.competitionScore}/100</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Receita est.</span>
                      <span className="font-medium">R${b.estimatedMonthlyRevenue.toLocaleString()}/mes</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function ScoreCard({ label, value, suffix, icon: Icon, color }: {
  label: string;
  value: string | number;
  suffix?: string;
  icon: React.ElementType;
  color: string;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <Icon className={cn("w-4 h-4", color)} />
          <span className="text-xs text-muted-foreground">{label}</span>
        </div>
        <p className="text-2xl font-bold">
          <span className={color}>{value}</span>
          {suffix && <span className="text-sm font-normal text-muted-foreground">{suffix}</span>}
        </p>
      </CardContent>
    </Card>
  );
}

interface Strategy {
  title: string;
  description: string;
  priority: "alta" | "media" | "baixa";
  icon: React.ElementType;
  metrics?: { label: string; value: string }[];
}

function generateStrategies(
  topBairros: { name: string; posScore: number; demandScore: number; competitionScore: number; estimatedMonthlyRevenue: number }[],
  trendingFlavors: { flavor: string; velocity: number; status: string }[],
  lowCompetition: { name: string; demandScore: number; competitionScore: number }[],
  hungerScore: number,
  peakHour: string,
): Strategy[] {
  const strategies: Strategy[] = [];

  // 1. Campanha no horário de pico
  if (hungerScore > 50) {
    strategies.push({
      title: `Ativar campanha no pico (${peakHour})`,
      description: `O Hunger Score da cidade esta em ${hungerScore}/100. Programe campanhas no WhatsApp e Instagram 30min antes do pico para capturar a demanda.`,
      priority: hungerScore > 70 ? "alta" : "media",
      icon: Zap,
      metrics: [
        { label: "hunger score", value: `${hungerScore}` },
        { label: "horario pico", value: peakHour },
      ],
    });
  }

  // 2. Foco nos bairros subatendidos
  if (lowCompetition.length > 0) {
    const names = lowCompetition.map(b => b.name).join(", ");
    strategies.push({
      title: "Dominar bairros subatendidos",
      description: `${lowCompetition.length} bairro(s) com alta demanda e baixa concorrencia: ${names}. Priorize entrega rapida e campanhas geo-targetadas nesses bairros.`,
      priority: "alta",
      icon: MapPin,
      metrics: lowCompetition.map(b => ({ label: b.name, value: `${b.demandScore}/100` })),
    });
  }

  // 3. Adicionar sabores em tendência
  if (trendingFlavors.length > 0) {
    const emerging = trendingFlavors.filter(f => f.status === "emerging");
    if (emerging.length > 0) {
      strategies.push({
        title: `Adicionar ${emerging[0].flavor} ao cardapio`,
        description: `${emerging[0].flavor} esta com crescimento de ${emerging[0].velocity}% nas buscas. Poucos concorrentes oferecem — seja o primeiro!`,
        priority: "alta",
        icon: TrendingUp,
        metrics: [
          { label: "crescimento", value: `+${emerging[0].velocity}%` },
          { label: "status", value: "emergente" },
        ],
      });
    }
  }

  // 4. Expandir para o melhor bairro
  if (topBairros.length > 0 && topBairros[0].posScore > 60) {
    strategies.push({
      title: `Priorizar ${topBairros[0].name}`,
      description: `Bairro com maior score de oportunidade (${topBairros[0].posScore}/100). Receita estimada de R$${topBairros[0].estimatedMonthlyRevenue.toLocaleString()}/mes. Considere entrega prioritaria para esta regiao.`,
      priority: "media",
      icon: Crown,
      metrics: [
        { label: "POS score", value: `${topBairros[0].posScore}` },
        { label: "receita est.", value: `R$${topBairros[0].estimatedMonthlyRevenue.toLocaleString()}` },
      ],
    });
  }

  // 5. Campanha de fim de semana
  const dayOfWeek = new Date().getDay();
  if (dayOfWeek >= 4) { // quinta a domingo
    strategies.push({
      title: "Ativar combo de fim de semana",
      description: "Fins de semana representam +25-40% nos pedidos. Lance combo familia ou promocao de segunda pizza com desconto ate domingo.",
      priority: "media",
      icon: Shield,
    });
  }

  // 6. Monitorar sabores em declínio
  const declining = (trendingFlavors ?? []).filter(f => f.status === "declining");
  if (declining.length > 0) {
    strategies.push({
      title: "Revisar sabores em declinio",
      description: `Sabores com queda: considere reformular ou substituir por opcoes em alta para manter o cardapio competitivo.`,
      priority: "baixa",
      icon: AlertTriangle,
    });
  }

  return strategies.sort((a, b) => {
    const order = { alta: 0, media: 1, baixa: 2 };
    return order[a.priority] - order[b.priority];
  });
}
