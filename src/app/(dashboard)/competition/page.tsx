"use client";

import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import {
  AlertTriangle, Shield, Users, Star, MapPin, TrendingUp, Eye, EyeOff,
} from "lucide-react";
import { cn } from "@/lib/utils";

const competitionData = [
  { name: "Centro", pizzarias: 8, population: 12000, ratio: 0.67, score: 70, level: "alta" as const, avgRating: 4.2, topCompetitor: "Pizzaria Bella" },
  { name: "Progresso", pizzarias: 4, population: 6200, ratio: 0.65, score: 40, level: "media" as const, avgRating: 3.9, topCompetitor: "Pizza Hut" },
  { name: "Jardim Europa", pizzarias: 3, population: 5500, ratio: 0.55, score: 35, level: "baixa" as const, avgRating: 4.0, topCompetitor: "Domino's" },
  { name: "Parque Universitario", pizzarias: 3, population: 3500, ratio: 0.86, score: 30, level: "baixa" as const, avgRating: 3.7, topCompetitor: "Pizza Express" },
  { name: "Triangulo", pizzarias: 2, population: 3800, ratio: 0.53, score: 25, level: "baixa" as const, avgRating: 3.8, topCompetitor: "Pizzaria do Ze" },
  { name: "Jardim Sao Paulo", pizzarias: 2, population: 5000, ratio: 0.40, score: 28, level: "baixa" as const, avgRating: 4.1, topCompetitor: "Massa Fina" },
  { name: "Parque da Serra", pizzarias: 2, population: 4800, ratio: 0.42, score: 25, level: "baixa" as const, avgRating: 3.5, topCompetitor: "Pizza Nostra" },
  { name: "Jardim Cidade Alta", pizzarias: 2, population: 4000, ratio: 0.50, score: 22, level: "baixa" as const, avgRating: 3.6, topCompetitor: "Forno Quente" },
  { name: "Sao Jorge", pizzarias: 2, population: 4000, ratio: 0.50, score: 22, level: "baixa" as const, avgRating: 3.4, topCompetitor: "Pizza Top" },
  { name: "Parque Tangara", pizzarias: 1, population: 4500, ratio: 0.22, score: 20, level: "baixa" as const, avgRating: 4.3, topCompetitor: "Sabor da Serra" },
  { name: "Jardim Shangri-la", pizzarias: 1, population: 3800, ratio: 0.26, score: 20, level: "baixa" as const, avgRating: 3.9, topCompetitor: "Pizza Boa" },
  { name: "Jardim Goias", pizzarias: 1, population: 4200, ratio: 0.24, score: 18, level: "baixa" as const, avgRating: 3.7, topCompetitor: "Fornalha" },
  { name: "Jardim Buritis", pizzarias: 1, population: 3000, ratio: 0.33, score: 12, level: "baixa" as const, avgRating: 3.2, topCompetitor: "Pizza Pronta" },
  { name: "Jardim Monte Libano", pizzarias: 1, population: 3200, ratio: 0.31, score: 15, level: "baixa" as const, avgRating: 3.5, topCompetitor: "Massa Mix" },
  { name: "Parque Leblon", pizzarias: 1, population: 3500, ratio: 0.29, score: 16, level: "baixa" as const, avgRating: 3.8, topCompetitor: "Al Forno" },
  { name: "Jardim dos Ipes", pizzarias: 1, population: 3200, ratio: 0.31, score: 14, level: "baixa" as const, avgRating: 3.3, topCompetitor: "Cantina" },
  { name: "Jardim Nazare", pizzarias: 0, population: 2800, ratio: 0, score: 10, level: "baixa" as const, avgRating: 0, topCompetitor: "-" },
  { name: "Jardim Dona Julia", pizzarias: 0, population: 2500, ratio: 0, score: 8, level: "baixa" as const, avgRating: 0, topCompetitor: "-" },
  { name: "Jardim Alto da Boa Vista", pizzarias: 0, population: 2200, ratio: 0, score: 5, level: "baixa" as const, avgRating: 0, topCompetitor: "-" },
  { name: "Jardim Morada do Sol", pizzarias: 0, population: 2800, ratio: 0, score: 10, level: "baixa" as const, avgRating: 0, topCompetitor: "-" },
];

const levelConfig = {
  alta: { className: "bg-red-500/15 text-red-400 border-red-500/20", barColor: "#ef4444", label: "Alta" },
  media: { className: "bg-amber-500/15 text-amber-400 border-amber-500/20", barColor: "#f59e0b", label: "Media" },
  baixa: { className: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20", barColor: "#10b981", label: "Baixa" },
};

const ChartTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card/95 backdrop-blur-xl border border-border/50 rounded-lg px-3 py-2 shadow-lg">
      <p className="text-xs font-semibold mb-0.5">{label}</p>
      <p className="text-[11px] text-muted-foreground">{payload[0].value} pizzarias</p>
    </div>
  );
};

export default function CompetitionPage() {
  const [showEmpty, setShowEmpty] = useState(false);

  const sorted = useMemo(() =>
    [...competitionData].sort((a, b) => b.score - a.score),
    []
  );

  const displayed = showEmpty ? sorted : sorted.filter(d => d.pizzarias > 0);

  const highComp = competitionData.filter(d => d.level === "alta").length;
  const lowComp = competitionData.filter(d => d.level === "baixa").length;
  const totalCompetitors = competitionData.reduce((s, d) => s + d.pizzarias, 0);
  const emptyNeighborhoods = competitionData.filter(d => d.pizzarias === 0);

  // Chart data — top 10 by number of pizzarias
  const chartData = [...competitionData]
    .sort((a, b) => b.pizzarias - a.pizzarias)
    .slice(0, 10)
    .map(d => ({
      name: d.name.length > 15 ? d.name.slice(0, 13) + "..." : d.name,
      pizzarias: d.pizzarias,
      level: d.level,
    }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Mapa de Concorrencia</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Analise de saturacao competitiva por bairro em Tangara da Serra</p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Concorrentes</span>
              <Users className="w-3.5 h-3.5 text-muted-foreground/50" />
            </div>
            <span className="text-2xl font-bold tabular-nums">{totalCompetitors}</span>
            <p className="text-[11px] text-muted-foreground mt-1">pizzarias mapeadas</p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Alta Competicao</span>
              <AlertTriangle className="w-3.5 h-3.5 text-red-400/50" />
            </div>
            <span className="text-2xl font-bold tabular-nums text-red-400">{highComp}</span>
            <p className="text-[11px] text-muted-foreground mt-1">bairros saturados</p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Oportunidades</span>
              <Shield className="w-3.5 h-3.5 text-emerald-400/50" />
            </div>
            <span className="text-2xl font-bold tabular-nums text-emerald-400">{emptyNeighborhoods.length}</span>
            <p className="text-[11px] text-muted-foreground mt-1">bairros sem pizzaria</p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Rating Medio</span>
              <Star className="w-3.5 h-3.5 text-amber-400/50" />
            </div>
            <span className="text-2xl font-bold tabular-nums text-amber-400">
              {(competitionData.filter(d => d.avgRating > 0).reduce((s, d) => s + d.avgRating, 0) / competitionData.filter(d => d.avgRating > 0).length).toFixed(1)}
            </span>
            <p className="text-[11px] text-muted-foreground mt-1">dos concorrentes</p>
          </CardContent>
        </Card>
      </div>

      {/* Opportunity alert */}
      {emptyNeighborhoods.length > 0 && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
          <TrendingUp className="w-5 h-5 text-emerald-400 shrink-0" />
          <div>
            <p className="text-sm font-medium text-emerald-400">
              {emptyNeighborhoods.length} bairros sem nenhuma pizzaria!
            </p>
            <p className="text-xs text-emerald-400/70 mt-0.5">
              {emptyNeighborhoods.map(n => n.name).join(", ")} — populacao total: {emptyNeighborhoods.reduce((s, n) => s + n.population, 0).toLocaleString()} hab.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Chart */}
        <Card className="border-border/50">
          <CardContent className="p-5">
            <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-4">Top 10 Bairros por Concorrencia</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} layout="vertical" barCategoryGap="20%">
                  <XAxis type="number" tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} width={100} />
                  <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
                  <Bar dataKey="pizzarias" radius={[0, 6, 6, 0]}>
                    {chartData.map((entry) => (
                      <Cell key={entry.name} fill={levelConfig[entry.level].barColor} fillOpacity={0.7} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Gaps / opportunities */}
        <Card className="border-border/50">
          <CardContent className="p-5">
            <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-4">Bairros Subatendidos</h3>
            <div className="space-y-2.5">
              {[...competitionData]
                .filter(d => d.pizzarias <= 1)
                .sort((a, b) => b.population - a.population)
                .slice(0, 8)
                .map(d => (
                  <div key={d.name} className="flex items-center gap-3 py-2 px-3 rounded-lg bg-accent/20 hover:bg-accent/30 transition-colors">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{d.name}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {d.population.toLocaleString()} hab. | {d.pizzarias === 0 ? "Nenhuma" : "1"} pizzaria
                      </p>
                    </div>
                    <Badge className={cn("text-[9px] border shrink-0", d.pizzarias === 0 ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/20" : "bg-blue-500/15 text-blue-400 border-blue-500/20")}>
                      {d.pizzarias === 0 ? "Vazio" : "Pouco"}
                    </Badge>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Full table */}
      <Card className="border-border/50">
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Densidade Competitiva por Bairro</h3>
            <button
              onClick={() => setShowEmpty(!showEmpty)}
              className="flex items-center gap-1.5 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
            >
              {showEmpty ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              {showEmpty ? "Ocultar vazios" : "Mostrar vazios"}
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Bairro</th>
                  <th className="text-right py-2.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Pizzarias</th>
                  <th className="text-right py-2.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Populacao</th>
                  <th className="text-right py-2.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Ratio/1000</th>
                  <th className="text-left py-2.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Score</th>
                  <th className="text-center py-2.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Rating</th>
                  <th className="text-left py-2.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Nivel</th>
                </tr>
              </thead>
              <tbody>
                {displayed.map((d) => {
                  const config = levelConfig[d.level];
                  return (
                    <tr key={d.name} className="border-b border-border/30 last:border-0 hover:bg-accent/20 transition-colors">
                      <td className="py-2.5 font-medium">{d.name}</td>
                      <td className="py-2.5 text-right text-muted-foreground tabular-nums">{d.pizzarias}</td>
                      <td className="py-2.5 text-right text-muted-foreground tabular-nums">{d.population.toLocaleString()}</td>
                      <td className="py-2.5 text-right text-muted-foreground tabular-nums">{d.ratio.toFixed(2)}</td>
                      <td className="py-2.5">
                        <div className="flex items-center gap-2">
                          <div className="w-14 bg-muted rounded-full h-1.5">
                            <div
                              className="h-1.5 rounded-full transition-all"
                              style={{ width: `${d.score}%`, backgroundColor: config.barColor }}
                            />
                          </div>
                          <span className="tabular-nums text-muted-foreground text-xs">{d.score}</span>
                        </div>
                      </td>
                      <td className="py-2.5 text-center">
                        {d.avgRating > 0 ? (
                          <span className="flex items-center justify-center gap-1 text-xs text-amber-400">
                            <Star className="w-3 h-3 fill-amber-400" />
                            {d.avgRating.toFixed(1)}
                          </span>
                        ) : (
                          <span className="text-muted-foreground/30 text-xs">-</span>
                        )}
                      </td>
                      <td className="py-2.5">
                        <Badge className={cn("text-[10px] border", config.className)}>
                          {config.label}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
