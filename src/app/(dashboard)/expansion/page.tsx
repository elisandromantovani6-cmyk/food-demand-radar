"use client";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { trpc } from "@/lib/trpc";
import { Trophy } from "lucide-react";

const rankGradients = [
  "from-amber-500/10 to-orange-500/5 border-amber-500/20",   // #1 gold
  "from-zinc-400/10 to-zinc-300/5 border-zinc-400/20",        // #2 silver
  "from-orange-800/10 to-orange-700/5 border-orange-800/20",  // #3 bronze
];

const riskStyles = {
  baixo: "bg-emerald-500/10 text-emerald-400",
  medio: "bg-amber-500/10 text-amber-400",
  alto: "bg-red-500/10 text-red-400",
};

export default function ExpansionPage() {
  const { data, isLoading } = trpc.expansion.getRanking.useQuery(
    { city: "Tangara da Serra", foodCategory: "pizza" },
    { refetchInterval: 300000 }
  );

  const ranking = data ?? [];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Radar de Expansao</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Melhores bairros para novas unidades</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-52 rounded-xl animate-shimmer" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Radar de Expansao</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Melhores bairros para abrir novas unidades em Tangará da Serra</p>
      </div>

      {/* Hero cards - top 3 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {ranking.slice(0, 3).map((item, idx) => (
          <Card key={item.neighborhoodId} className={cn(
            "border overflow-hidden bg-gradient-to-br transition-all duration-300 hover:scale-[1.01]",
            rankGradients[idx]
          )}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Trophy className={cn("w-5 h-5",
                    idx === 0 ? "text-amber-400" : idx === 1 ? "text-zinc-400" : "text-orange-700"
                  )} />
                  <span className="text-2xl font-bold tabular-nums">#{idx + 1}</span>
                </div>
                <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full",
                  riskStyles[item.riskLevel as keyof typeof riskStyles]
                )}>
                  Risco {item.riskLevel}
                </span>
              </div>
              <h3 className="text-base font-semibold mb-1">{item.name}</h3>
              <p className="text-xl font-bold text-emerald-400 tabular-nums mb-3">
                R$ {item.estimatedMonthlyRevenue.toLocaleString()}<span className="text-xs font-normal text-muted-foreground">/mes</span>
              </p>
              <div className="space-y-1.5 text-[11px] text-muted-foreground">
                <div className="flex justify-between">
                  <span>POS Score</span>
                  <span className="font-semibold text-foreground tabular-nums">{item.posScore}/100</span>
                </div>
                <div className="flex justify-between">
                  <span>Demanda</span>
                  <span className="font-semibold text-foreground tabular-nums">{item.demandScore}/100</span>
                </div>
                <div className="flex justify-between">
                  <span>Concorrência</span>
                  <span className="font-semibold text-foreground tabular-nums">{item.competitionScore}/100</span>
                </div>
                <div className="flex justify-between">
                  <span>Crescimento</span>
                  <span className="font-semibold text-emerald-400 tabular-nums">+{item.growthTrend}%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Full ranking table */}
      <Card className="border-border/50">
        <CardContent className="p-5">
          <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-4">Ranking Completo</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">#</th>
                  <th className="text-left py-2.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Bairro</th>
                  <th className="text-left py-2.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">POS</th>
                  <th className="text-left py-2.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Demanda</th>
                  <th className="text-left py-2.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Concorr.</th>
                  <th className="text-left py-2.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Cresc.</th>
                  <th className="text-left py-2.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Receita Est.</th>
                  <th className="text-left py-2.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Risco</th>
                </tr>
              </thead>
              <tbody>
                {ranking.map((item, idx) => (
                  <tr key={item.neighborhoodId} className="border-b border-border/50 last:border-0 hover:bg-accent/20 transition-colors">
                    <td className="py-3 font-bold text-muted-foreground tabular-nums">{idx + 1}</td>
                    <td className="py-3 font-medium">{item.name}</td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-12 bg-muted rounded-full h-1.5">
                          <div className="h-1.5 rounded-full bg-primary" style={{ width: `${item.posScore}%` }} />
                        </div>
                        <span className="text-xs tabular-nums">{item.posScore}</span>
                      </div>
                    </td>
                    <td className="py-3 text-muted-foreground tabular-nums">{item.demandScore}</td>
                    <td className="py-3 text-muted-foreground tabular-nums">{item.competitionScore}</td>
                    <td className="py-3 text-emerald-400 font-medium tabular-nums">+{item.growthTrend}%</td>
                    <td className="py-3 font-medium tabular-nums">R$ {item.estimatedMonthlyRevenue.toLocaleString()}</td>
                    <td className="py-3">
                      <span className={cn("text-[10px] font-medium px-2 py-0.5 rounded-full",
                        riskStyles[item.riskLevel as keyof typeof riskStyles]
                      )}>
                        {item.riskLevel}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
