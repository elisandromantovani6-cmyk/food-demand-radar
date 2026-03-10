"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { AlertTriangle, Shield, Users } from "lucide-react";

const competitionData = [
  { name: "Centro", pizzarias: 8, population: 12000, ratio: 0.67, score: 70, level: "alta" },
  { name: "Progresso", pizzarias: 4, population: 6200, ratio: 0.65, score: 40, level: "media" },
  { name: "Jardim Europa", pizzarias: 3, population: 5500, ratio: 0.55, score: 35, level: "baixa" },
  { name: "Parque Universitario", pizzarias: 3, population: 3500, ratio: 0.86, score: 30, level: "baixa" },
  { name: "Triangulo", pizzarias: 2, population: 3800, ratio: 0.53, score: 25, level: "baixa" },
  { name: "Jardim Sao Paulo", pizzarias: 2, population: 5000, ratio: 0.40, score: 28, level: "baixa" },
  { name: "Parque da Serra", pizzarias: 2, population: 4800, ratio: 0.42, score: 25, level: "baixa" },
  { name: "Jardim Cidade Alta", pizzarias: 2, population: 4000, ratio: 0.50, score: 22, level: "baixa" },
  { name: "Sao Jorge", pizzarias: 2, population: 4000, ratio: 0.50, score: 22, level: "baixa" },
  { name: "Parque Tangara", pizzarias: 1, population: 4500, ratio: 0.22, score: 20, level: "baixa" },
  { name: "Jardim Shangri-la", pizzarias: 1, population: 3800, ratio: 0.26, score: 20, level: "baixa" },
  { name: "Jardim Goias", pizzarias: 1, population: 4200, ratio: 0.24, score: 18, level: "baixa" },
  { name: "Jardim Buritis", pizzarias: 1, population: 3000, ratio: 0.33, score: 12, level: "baixa" },
  { name: "Jardim Monte Libano", pizzarias: 1, population: 3200, ratio: 0.31, score: 15, level: "baixa" },
  { name: "Parque Leblon", pizzarias: 1, population: 3500, ratio: 0.29, score: 16, level: "baixa" },
  { name: "Jardim dos Ipes", pizzarias: 1, population: 3200, ratio: 0.31, score: 14, level: "baixa" },
  { name: "Jardim Nazare", pizzarias: 0, population: 2800, ratio: 0, score: 10, level: "baixa" },
  { name: "Jardim Dona Julia", pizzarias: 0, population: 2500, ratio: 0, score: 8, level: "baixa" },
  { name: "Jardim Alto da Boa Vista", pizzarias: 0, population: 2200, ratio: 0, score: 5, level: "baixa" },
  { name: "Jardim Morada do Sol", pizzarias: 0, population: 2800, ratio: 0, score: 10, level: "baixa" },
];

const levelConfig = {
  alta: { className: "bg-red-500/15 text-red-400 border-red-500/20", barColor: "bg-red-500" },
  media: { className: "bg-amber-500/15 text-amber-400 border-amber-500/20", barColor: "bg-amber-500" },
  baixa: { className: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20", barColor: "bg-emerald-500" },
};

export default function CompetitionPage() {
  const highComp = competitionData.filter(d => d.level === "alta").length;
  const lowComp = competitionData.filter(d => d.level === "baixa").length;
  const totalCompetitors = competitionData.reduce((s, d) => s + d.pizzarias, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Mapa de Concorrência</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Análise de saturação competitiva por bairro em Tangará da Serra</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-border/50 group hover:border-border transition-colors">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Alta Concorrência</p>
              <AlertTriangle className="w-4 h-4 text-red-400/50" />
            </div>
            <p className="text-3xl font-bold tabular-nums text-red-400">{highComp}</p>
            <p className="text-xs text-muted-foreground mt-1">bairros saturados</p>
          </CardContent>
        </Card>
        <Card className="border-border/50 group hover:border-border transition-colors">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Baixa Concorrência</p>
              <Shield className="w-4 h-4 text-emerald-400/50" />
            </div>
            <p className="text-3xl font-bold tabular-nums text-emerald-400">{lowComp}</p>
            <p className="text-xs text-muted-foreground mt-1">bairros com oportunidade</p>
          </CardContent>
        </Card>
        <Card className="border-border/50 group hover:border-border transition-colors">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Total de Concorrentes</p>
              <Users className="w-4 h-4 text-muted-foreground/50" />
            </div>
            <p className="text-3xl font-bold tabular-nums">{totalCompetitors}</p>
            <p className="text-xs text-muted-foreground mt-1">pizzarias mapeadas</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/50">
        <CardContent className="p-5">
          <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-4">Densidade Competitiva por Bairro</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Bairro</th>
                  <th className="text-left py-2.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Pizzarias</th>
                  <th className="text-left py-2.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">População</th>
                  <th className="text-left py-2.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Ratio/1000hab</th>
                  <th className="text-left py-2.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Score</th>
                  <th className="text-left py-2.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Nivel</th>
                </tr>
              </thead>
              <tbody>
                {competitionData.sort((a, b) => b.score - a.score).map((d) => {
                  const config = levelConfig[d.level as keyof typeof levelConfig];
                  return (
                    <tr key={d.name} className="border-b border-border/30 last:border-0 hover:bg-accent/30 transition-colors">
                      <td className="py-2.5 font-medium">{d.name}</td>
                      <td className="py-2.5 text-muted-foreground tabular-nums">{d.pizzarias}</td>
                      <td className="py-2.5 text-muted-foreground tabular-nums">{d.population.toLocaleString()}</td>
                      <td className="py-2.5 text-muted-foreground tabular-nums">{d.ratio.toFixed(2)}</td>
                      <td className="py-2.5">
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-muted rounded-full h-1.5">
                            <div
                              className={cn("h-1.5 rounded-full transition-all", config.barColor)}
                              style={{ width: `${d.score}%` }}
                            />
                          </div>
                          <span className="tabular-nums text-muted-foreground text-xs">{d.score}</span>
                        </div>
                      </td>
                      <td className="py-2.5">
                        <Badge className={cn("text-[10px] border", config.className)}>
                          {d.level}
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
