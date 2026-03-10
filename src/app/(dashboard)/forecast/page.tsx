"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { CloudRain, Sun, Cloud, CloudSun, TrendingUp, DollarSign, CalendarDays } from "lucide-react";

const forecastData = [
  { day: "Seg", orders: 180, min: 160, max: 200, revenue: 6120, weather: "sun", event: null },
  { day: "Ter", orders: 175, min: 155, max: 195, revenue: 5950, weather: "cloud", event: null },
  { day: "Qua", orders: 195, min: 170, max: 220, revenue: 6630, weather: "cloud_sun", event: "Jogo" },
  { day: "Qui", orders: 185, min: 165, max: 205, revenue: 6290, weather: "sun", event: null },
  { day: "Sex", orders: 260, min: 230, max: 290, revenue: 8840, weather: "rain", event: null },
  { day: "Sab", orders: 245, min: 220, max: 270, revenue: 8330, weather: "cloud_sun", event: null },
  { day: "Dom", orders: 230, min: 205, max: 255, revenue: 7820, weather: "sun", event: null },
];

const WeatherIcon = ({ type }: { type: string }) => {
  const icons: Record<string, typeof Sun> = { sun: Sun, cloud: Cloud, cloud_sun: CloudSun, rain: CloudRain };
  const Icon = icons[type] || Sun;
  return <Icon className="w-4 h-4 text-muted-foreground" />;
};

const ChartTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card/90 backdrop-blur-xl border border-border/50 rounded-lg px-3 py-2 shadow-[var(--shadow-lg)]">
      <p className="text-[11px] text-muted-foreground mb-1">{label}</p>
      <p className="text-sm font-semibold tabular-nums">{payload[0].value} pedidos</p>
    </div>
  );
};

export default function ForecastPage() {
  const totalOrders = forecastData.reduce((sum, d) => sum + d.orders, 0);
  const totalRevenue = forecastData.reduce((sum, d) => sum + d.revenue, 0);
  const avgOrders = Math.round(totalOrders / 7);
  const maxDay = forecastData.reduce((max, d) => d.orders > max.orders ? d : max, forecastData[0]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Previsão de Demanda</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Previsão de pedidos para os próximos 7 dias</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-border/50 group hover:border-border transition-colors">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Total Previsto (7 dias)</p>
              <CalendarDays className="w-4 h-4 text-muted-foreground/50" />
            </div>
            <p className="text-3xl font-bold tabular-nums">{totalOrders}</p>
            <p className="text-xs text-muted-foreground mt-1">pedidos</p>
          </CardContent>
        </Card>
        <Card className="border-border/50 group hover:border-border transition-colors">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Receita Prevista</p>
              <DollarSign className="w-4 h-4 text-muted-foreground/50" />
            </div>
            <p className="text-3xl font-bold tabular-nums text-emerald-400">R$ {totalRevenue.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-1">nos próximos 7 dias</p>
          </CardContent>
        </Card>
        <Card className="border-border/50 group hover:border-border transition-colors">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Média Diária</p>
              <TrendingUp className="w-4 h-4 text-muted-foreground/50" />
            </div>
            <p className="text-3xl font-bold tabular-nums">{avgOrders}</p>
            <p className="text-xs text-muted-foreground mt-1">pedidos/dia</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/50">
        <CardContent className="p-5">
          <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-4">Pedidos Previstos por Dia</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={forecastData} barCategoryGap="20%">
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.65 0.2 260)" stopOpacity={1} />
                    <stop offset="100%" stopColor="oklch(0.65 0.2 260)" stopOpacity={0.4} />
                  </linearGradient>
                  <linearGradient id="barGradientPeak" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.7 0.18 170)" stopOpacity={1} />
                    <stop offset="100%" stopColor="oklch(0.7 0.18 170)" stopOpacity={0.4} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" tick={{ fontSize: 12, fill: "oklch(0.55 0 0)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "oklch(0.45 0 0)" }} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: "oklch(1 0 0 / 0.03)" }} />
                <Bar dataKey="orders" radius={[6, 6, 0, 0]}>
                  {forecastData.map((entry) => (
                    <Cell key={entry.day} fill={entry.day === maxDay.day ? "url(#barGradientPeak)" : "url(#barGradient)"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/50">
        <CardContent className="p-5">
          <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-4">Detalhamento Diário</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Dia</th>
                  <th className="text-left py-2.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Clima</th>
                  <th className="text-left py-2.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Pedidos</th>
                  <th className="text-left py-2.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Intervalo</th>
                  <th className="text-left py-2.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Receita</th>
                  <th className="text-left py-2.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Evento</th>
                </tr>
              </thead>
              <tbody>
                {forecastData.map((d) => (
                  <tr key={d.day} className="border-b border-border/30 last:border-0 hover:bg-accent/30 transition-colors">
                    <td className="py-2.5 font-medium">{d.day}</td>
                    <td className="py-2.5"><WeatherIcon type={d.weather} /></td>
                    <td className="py-2.5 font-semibold tabular-nums">{d.orders}</td>
                    <td className="py-2.5 text-muted-foreground tabular-nums">{d.min} - {d.max}</td>
                    <td className="py-2.5 text-emerald-400 font-medium tabular-nums">R$ {d.revenue.toLocaleString()}</td>
                    <td className="py-2.5">
                      {d.event ? <Badge className="bg-purple-500/15 text-purple-400 border-purple-500/20 text-[10px]">{d.event}</Badge> : <span className="text-muted-foreground/30">-</span>}
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
