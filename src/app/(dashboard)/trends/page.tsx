"use client";

import { Card, CardContent } from "@/components/ui/card";
import { ArrowUp, ArrowDown, Minus, Sparkles } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { cn } from "@/lib/utils";
import { trpc } from "@/lib/trpc";

const statusConfig = {
  trending: { label: "Em alta", color: "bg-emerald-500/10 text-emerald-400" },
  stable: { label: "Estavel", color: "bg-muted text-muted-foreground" },
  declining: { label: "Em queda", color: "bg-red-500/10 text-red-400" },
  emerging: { label: "Emergente", color: "bg-purple-500/10 text-purple-400" },
};

function ChartTooltip({ active, payload }: { active?: boolean; payload?: Array<{ value: number; payload: { name: string } }> }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 shadow-lg backdrop-blur-xl">
      <p className="text-[11px] text-muted-foreground mb-0.5">{payload[0].payload.name}</p>
      <p className="text-sm font-semibold">{payload[0].value.toLocaleString()} buscas</p>
    </div>
  );
}

export default function TrendsPage() {
  const { data, isLoading } = trpc.trends.getFlavors.useQuery(
    { city: "Tangara da Serra", foodCategory: "pizza" },
    { refetchInterval: 300000 }
  );

  const flavors = (data ?? []).map(f => ({
    flavor: f.flavor,
    score: f.trendScore,
    velocity: f.velocity,
    volume: f.searchVolume,
    status: f.status,
  }));

  const chartData = flavors.slice(0, 8).map(f => ({
    name: f.flavor.length > 14 ? f.flavor.slice(0, 14) + "..." : f.flavor,
    volume: f.volume,
  }));

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Sabores em Tendencia</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Monitoramento de sabores mais buscados</p>
        </div>
        <div className="h-96 rounded-xl animate-shimmer" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Sabores em Tendencia</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Monitoramento de sabores mais buscados em Tangara da Serra</p>
      </div>

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 lg:col-span-8">
          <Card className="border-border/50">
            <CardContent className="p-5">
              <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-4">Volume de Buscas</h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} layout="vertical">
                    <defs>
                      <linearGradient id="barGradient" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="oklch(0.70 0.20 275)" stopOpacity={0.8} />
                        <stop offset="100%" stopColor="oklch(0.75 0.18 195)" stopOpacity={0.9} />
                      </linearGradient>
                    </defs>
                    <XAxis type="number" tick={{ fontSize: 10, fill: "oklch(0.55 0.01 265)" }} axisLine={false} tickLine={false} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: "oklch(0.7 0.01 265)" }} axisLine={false} tickLine={false} width={110} />
                    <Tooltip content={<ChartTooltip />} />
                    <Bar dataKey="volume" fill="url(#barGradient)" radius={[0, 4, 4, 0]} animationDuration={800} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="col-span-12 lg:col-span-4">
          <Card className="border-border/50">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Emergentes</h3>
              </div>
              <div className="space-y-2">
                {flavors.filter(f => f.status === "emerging").map(f => (
                  <div key={f.flavor} className="flex items-center justify-between p-2.5 rounded-lg bg-purple-500/8 border border-purple-500/10 hover:bg-purple-500/12 transition-colors">
                    <span className="text-sm font-medium">{f.flavor}</span>
                    <div className="flex items-center gap-1 text-purple-400">
                      <ArrowUp className="w-3 h-3" />
                      <span className="text-sm font-semibold tabular-nums">+{f.velocity}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card className="border-border/50">
        <CardContent className="p-5">
          <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-4">Ranking Completo</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">#</th>
                  <th className="text-left py-2.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Sabor</th>
                  <th className="text-left py-2.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Score</th>
                  <th className="text-left py-2.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Velocidade</th>
                  <th className="text-left py-2.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Buscas</th>
                  <th className="text-left py-2.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {flavors.map((f, i) => {
                  const config = statusConfig[f.status as keyof typeof statusConfig] ?? statusConfig.stable;
                  return (
                    <tr key={f.flavor} className="border-b border-border/50 last:border-0 hover:bg-accent/20 transition-colors">
                      <td className="py-3 text-muted-foreground tabular-nums">{i + 1}</td>
                      <td className="py-3 font-medium">{f.flavor}</td>
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-muted rounded-full h-1.5">
                            <div className="h-1.5 rounded-full bg-primary transition-all duration-500" style={{ width: `${f.score}%` }} />
                          </div>
                          <span className="text-muted-foreground tabular-nums text-xs">{f.score}</span>
                        </div>
                      </td>
                      <td className="py-3">
                        <div className={cn("flex items-center gap-1 text-xs", f.velocity > 0 ? "text-emerald-400" : f.velocity < 0 ? "text-red-400" : "text-muted-foreground")}>
                          {f.velocity > 0 ? <ArrowUp className="w-3 h-3" /> : f.velocity < 0 ? <ArrowDown className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
                          {f.velocity > 0 ? "+" : ""}{f.velocity}%
                        </div>
                      </td>
                      <td className="py-3 text-muted-foreground tabular-nums">{f.volume.toLocaleString()}</td>
                      <td className="py-3">
                        <span className={cn("text-[10px] font-medium px-2 py-0.5 rounded-full", config.color)}>{config.label}</span>
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
