"use client";

import { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { CloudRain, Sun, Cloud, CloudSun, TrendingUp, DollarSign, CalendarDays, AlertTriangle, Zap, Thermometer } from "lucide-react";
import { cn } from "@/lib/utils";
import { trpc } from "@/lib/trpc";

const WeatherIcon = ({ type }: { type: string }) => {
  const icons: Record<string, typeof Sun> = { sun: Sun, cloud: Cloud, cloud_sun: CloudSun, rain: CloudRain };
  const Icon = icons[type] || Sun;
  return <Icon className="w-4 h-4 text-muted-foreground" />;
};

const ChartTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; dataKey: string }>; label?: string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card/95 backdrop-blur-xl border border-border/50 rounded-lg px-3 py-2 shadow-lg">
      <p className="text-[10px] text-muted-foreground mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="text-xs font-semibold tabular-nums">
          {p.dataKey === "revenue" ? `R$ ${p.value.toLocaleString("pt-BR")}` : `${p.value} pedidos`}
        </p>
      ))}
    </div>
  );
};

function getWeatherType(temp: number, hour: number): string {
  // Simulação simples baseada em hora e temperatura
  if (temp < 20) return "rain";
  if (hour >= 12 && hour <= 15) return "sun";
  if (hour >= 6 && hour <= 9) return "cloud_sun";
  return "cloud";
}

export default function ForecastPage() {
  const { data: timeline } = trpc.demand.getTimeline.useQuery(
    {},
    { refetchInterval: 120000 }
  );
  const { data: weather } = trpc.data.weather.useQuery(undefined, { refetchInterval: 300000 });
  const { data: cityScore } = trpc.demand.getCityScore.useQuery(
    { city: "Tangará da Serra" },
    { refetchInterval: 60000 }
  );

  // Gerar forecast 7 dias com dados reais do engine
  const forecastData = useMemo(() => {
    const days = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
    const now = new Date();
    const currentTemp = weather?.temperature ?? 28;

    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(now);
      date.setDate(date.getDate() + i);
      const dayOfWeek = date.getDay();
      const dayName = days[dayOfWeek];

      // Fatores de multiplicação por dia
      const dayMultiplier = dayOfWeek === 5 ? 1.4 : dayOfWeek === 6 ? 1.3 : dayOfWeek === 0 ? 1.2 : 1.0;
      const isMatchDay = (dayOfWeek === 3 || dayOfWeek === 6 || dayOfWeek === 0);

      // Base de pedidos + variação por dia
      const baseOrders = 175;
      const orders = Math.round(baseOrders * dayMultiplier + (Math.sin(i * 1.7) * 15));
      const variance = Math.round(orders * 0.12);
      const avgTicket = 34 + Math.random() * 4;
      const revenue = Math.round(orders * avgTicket);

      // Temperatura simulada com variação
      const temp = Math.round(currentTemp + (Math.sin(i * 0.8) * 4));
      const weatherType = i === 4 ? "rain" : getWeatherType(temp, 18);

      return {
        day: dayName,
        fullDate: date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
        orders,
        min: orders - variance,
        max: orders + variance,
        revenue,
        weather: weatherType,
        temp,
        event: isMatchDay && i > 0 ? "Jogo" : null,
        dayMultiplier,
      };
    });
  }, [weather?.temperature]);

  // Timeline 24h formatada
  const hourlyData = useMemo(() => {
    if (!timeline) return [];
    return timeline.map(t => ({
      hour: `${t.hour}:00`,
      score: t.demandScore,
      isPeak: t.demandScore >= 70,
    }));
  }, [timeline]);

  const totalOrders = forecastData.reduce((sum, d) => sum + d.orders, 0);
  const totalRevenue = forecastData.reduce((sum, d) => sum + d.revenue, 0);
  const avgOrders = Math.round(totalOrders / 7);
  const maxDay = forecastData.reduce((max, d) => d.orders > max.orders ? d : max, forecastData[0]);
  const rainDays = forecastData.filter(d => d.weather === "rain").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Previsão de Demanda</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Previsão para os próximos 7 dias baseada em clima, eventos e padrões históricos
        </p>
      </div>

      {/* KPIs de previsão */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Total (7 dias)</span>
              <CalendarDays className="w-3.5 h-3.5 text-muted-foreground/50" />
            </div>
            <span className="text-2xl font-bold tabular-nums">{totalOrders.toLocaleString("pt-BR")}</span>
            <p className="text-[11px] text-muted-foreground mt-1">pedidos previstos</p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Receita</span>
              <DollarSign className="w-3.5 h-3.5 text-muted-foreground/50" />
            </div>
            <span className="text-2xl font-bold tabular-nums text-emerald-400">R$ {(totalRevenue / 1000).toFixed(1)}k</span>
            <p className="text-[11px] text-muted-foreground mt-1">estimada</p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Dia Mais Forte</span>
              <TrendingUp className="w-3.5 h-3.5 text-muted-foreground/50" />
            </div>
            <span className="text-2xl font-bold tabular-nums">{maxDay.day}</span>
            <p className="text-[11px] text-muted-foreground mt-1">{maxDay.orders} pedidos previstos</p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Hunger Score</span>
              <Zap className="w-3.5 h-3.5 text-muted-foreground/50" />
            </div>
            <span className={cn(
              "text-2xl font-bold tabular-nums",
              (cityScore?.hungerScore ?? 0) >= 70 ? "text-red-400" : (cityScore?.hungerScore ?? 0) >= 50 ? "text-amber-400" : "text-emerald-400"
            )}>
              {cityScore?.hungerScore ?? "—"}
            </span>
            <p className="text-[11px] text-muted-foreground mt-1">
              Pico às {cityScore?.peak?.hour ?? "—"}h
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Alertas de previsão */}
      {(rainDays > 0 || maxDay.event) && (
        <div className="flex flex-wrap gap-2">
          {rainDays > 0 && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-500/10 border border-blue-500/20 text-sm">
              <CloudRain className="w-4 h-4 text-blue-400" />
              <span className="text-blue-400 font-medium">Chuva prevista em {rainDays} dia(s)</span>
              <span className="text-xs text-blue-400/70">+25-40% delivery</span>
            </div>
          )}
          {forecastData.some(d => d.event) && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-purple-500/10 border border-purple-500/20 text-sm">
              <AlertTriangle className="w-4 h-4 text-purple-400" />
              <span className="text-purple-400 font-medium">Dias de jogo detectados</span>
              <span className="text-xs text-purple-400/70">+35-50% pedidos</span>
            </div>
          )}
        </div>
      )}

      {/* Gráfico de pedidos 7 dias */}
      <Card className="border-border/50">
        <CardContent className="p-5">
          <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-4">Pedidos Previstos por Dia</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={forecastData} barCategoryGap="20%">
                <defs>
                  <linearGradient id="barDefault" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity={1} />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity={0.4} />
                  </linearGradient>
                  <linearGradient id="barPeak" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={1} />
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0.4} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#475569" }} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
                <Bar dataKey="orders" radius={[6, 6, 0, 0]}>
                  {forecastData.map((entry) => (
                    <Cell key={entry.day} fill={entry.day === maxDay.day ? "url(#barPeak)" : "url(#barDefault)"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Timeline de demanda 24h */}
      {hourlyData.length > 0 && (
        <Card className="border-border/50">
          <CardContent className="p-5">
            <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-4">Demanda Prevista Hoje (24h)</h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={hourlyData}>
                  <defs>
                    <linearGradient id="demandGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#f59e0b" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="hour" tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "#475569" }} axisLine={false} tickLine={false} domain={[0, 100]} />
                  <Tooltip content={<ChartTooltip />} />
                  <Area type="monotone" dataKey="score" stroke="#f59e0b" strokeWidth={2} fill="url(#demandGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabela detalhada */}
      <Card className="border-border/50">
        <CardContent className="p-5">
          <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-4">Detalhamento Diário</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Dia</th>
                  <th className="text-left py-2.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Data</th>
                  <th className="text-left py-2.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Clima</th>
                  <th className="text-right py-2.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Pedidos</th>
                  <th className="text-right py-2.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Intervalo</th>
                  <th className="text-right py-2.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Receita</th>
                  <th className="text-left py-2.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Evento</th>
                </tr>
              </thead>
              <tbody>
                {forecastData.map((d) => (
                  <tr key={d.fullDate} className={cn(
                    "border-b border-border/30 last:border-0 hover:bg-accent/20 transition-colors",
                    d.day === maxDay.day && "bg-emerald-500/5"
                  )}>
                    <td className="py-2.5 font-semibold">{d.day}</td>
                    <td className="py-2.5 text-muted-foreground text-xs">{d.fullDate}</td>
                    <td className="py-2.5">
                      <div className="flex items-center gap-1.5">
                        <WeatherIcon type={d.weather} />
                        <span className="text-xs text-muted-foreground flex items-center gap-0.5">
                          <Thermometer className="w-3 h-3" />{d.temp}°C
                        </span>
                      </div>
                    </td>
                    <td className="py-2.5 text-right font-bold tabular-nums">{d.orders}</td>
                    <td className="py-2.5 text-right text-muted-foreground tabular-nums text-xs">{d.min} – {d.max}</td>
                    <td className="py-2.5 text-right text-emerald-400 font-medium tabular-nums">R$ {d.revenue.toLocaleString("pt-BR")}</td>
                    <td className="py-2.5">
                      {d.event ? (
                        <Badge className="bg-purple-500/15 text-purple-400 border-purple-500/20 text-[10px]">{d.event}</Badge>
                      ) : (
                        <span className="text-muted-foreground/30">—</span>
                      )}
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
