"use client";

import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import {
  FileText, Download, Calendar, TrendingUp, TrendingDown, DollarSign, ShoppingBag,
  Users, Target, ArrowUpRight, ArrowDownRight, Minus, Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { trpc } from "@/lib/trpc";

type Period = "week" | "month" | "quarter";

const ChartTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; dataKey: string }>; label?: string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card/95 backdrop-blur-xl border border-border/50 rounded-lg px-3 py-2 shadow-lg">
      <p className="text-[10px] text-muted-foreground mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="text-xs font-semibold tabular-nums">
          {p.dataKey === "revenue" ? `R$ ${p.value.toLocaleString("pt-BR")}` : `${p.value}`}
        </p>
      ))}
    </div>
  );
};

function generateReportData(period: Period) {
  const now = new Date();
  const days = period === "week" ? 7 : period === "month" ? 30 : 90;
  const dayLabels = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"];

  const dailyData = Array.from({ length: days }, (_, i) => {
    const date = new Date(now);
    date.setDate(date.getDate() - (days - 1 - i));
    const dow = date.getDay();
    const isWeekend = dow === 5 || dow === 6;
    const baseOrders = isWeekend ? 210 : 160;
    const orders = Math.round(baseOrders + Math.sin(i * 0.7) * 25 + Math.random() * 20);
    const avgTicket = 34 + Math.random() * 6;
    const revenue = Math.round(orders * avgTicket);

    return {
      date: date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
      dayName: dayLabels[dow],
      orders,
      revenue,
      avgTicket: Math.round(avgTicket * 100) / 100,
      newCustomers: Math.round(orders * (0.15 + Math.random() * 0.1)),
    };
  });

  const totalOrders = dailyData.reduce((s, d) => s + d.orders, 0);
  const totalRevenue = dailyData.reduce((s, d) => s + d.revenue, 0);
  const avgTicket = totalRevenue / totalOrders;
  const totalNewCustomers = dailyData.reduce((s, d) => s + d.newCustomers, 0);
  const avgDailyOrders = Math.round(totalOrders / days);
  const bestDay = dailyData.reduce((best, d) => d.revenue > best.revenue ? d : best, dailyData[0]);
  const worstDay = dailyData.reduce((worst, d) => d.revenue < worst.revenue ? d : worst, dailyData[0]);

  // Aggregate by day of week
  const byDow: Record<string, { orders: number; count: number }> = {};
  dailyData.forEach(d => {
    if (!byDow[d.dayName]) byDow[d.dayName] = { orders: 0, count: 0 };
    byDow[d.dayName].orders += d.orders;
    byDow[d.dayName].count += 1;
  });
  const dowData = dayLabels.map(day => ({
    day,
    avgOrders: byDow[day] ? Math.round(byDow[day].orders / byDow[day].count) : 0,
  }));

  // Growth vs previous period
  const prevOrders = Math.round(totalOrders * (0.88 + Math.random() * 0.2));
  const prevRevenue = Math.round(totalRevenue * (0.9 + Math.random() * 0.15));
  const orderGrowth = ((totalOrders - prevOrders) / prevOrders) * 100;
  const revenueGrowth = ((totalRevenue - prevRevenue) / prevRevenue) * 100;

  // Top neighborhoods
  const neighborhoods = [
    { name: "Centro", orders: Math.round(totalOrders * 0.22), pct: 22 },
    { name: "Jardim Europa", orders: Math.round(totalOrders * 0.16), pct: 16 },
    { name: "Vila Alta", orders: Math.round(totalOrders * 0.13), pct: 13 },
    { name: "Cohab", orders: Math.round(totalOrders * 0.11), pct: 11 },
    { name: "Jardim Paraiso", orders: Math.round(totalOrders * 0.09), pct: 9 },
  ];

  // Top products
  const products = [
    { name: "Calabresa", qty: Math.round(totalOrders * 0.18), trend: "up" as const },
    { name: "4 Queijos", qty: Math.round(totalOrders * 0.14), trend: "up" as const },
    { name: "Margherita", qty: Math.round(totalOrders * 0.12), trend: "stable" as const },
    { name: "Frango c/ Catupiry", qty: Math.round(totalOrders * 0.11), trend: "down" as const },
    { name: "Portuguesa", qty: Math.round(totalOrders * 0.09), trend: "up" as const },
  ];

  return {
    dailyData,
    totalOrders,
    totalRevenue,
    avgTicket: Math.round(avgTicket * 100) / 100,
    totalNewCustomers,
    avgDailyOrders,
    bestDay,
    worstDay,
    dowData,
    orderGrowth: Math.round(orderGrowth * 10) / 10,
    revenueGrowth: Math.round(revenueGrowth * 10) / 10,
    neighborhoods,
    products,
    days,
  };
}

const TrendArrow = ({ value }: { value: number }) => {
  if (value > 0) return <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />;
  if (value < 0) return <ArrowDownRight className="w-3.5 h-3.5 text-red-400" />;
  return <Minus className="w-3.5 h-3.5 text-muted-foreground" />;
};

export default function ReportsPage() {
  const [period, setPeriod] = useState<Period>("week");

  const report = useMemo(() => generateReportData(period), [period]);

  const periodLabel = period === "week" ? "7 dias" : period === "month" ? "30 dias" : "90 dias";

  // Chart data — show last 14 points max for readability
  const chartData = period === "quarter"
    ? report.dailyData.filter((_, i) => i % 3 === 0)
    : report.dailyData;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Relatorios</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Analise de performance dos ultimos {periodLabel}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Period selector */}
          <div className="flex items-center bg-secondary rounded-lg p-0.5">
            {(["week", "month", "quarter"] as const).map(p => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={cn(
                  "px-3 py-1.5 rounded-md text-xs font-medium transition-all",
                  period === p
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {p === "week" ? "Semana" : p === "month" ? "Mes" : "Trimestre"}
              </button>
            ))}
          </div>
          <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:opacity-90 transition-all active:scale-[0.98]">
            <Download className="w-3.5 h-3.5" />
            Exportar PDF
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Pedidos</span>
              <ShoppingBag className="w-3.5 h-3.5 text-muted-foreground/50" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold tabular-nums">{report.totalOrders.toLocaleString("pt-BR")}</span>
              <span className={cn(
                "flex items-center gap-0.5 text-xs font-medium",
                report.orderGrowth >= 0 ? "text-emerald-400" : "text-red-400"
              )}>
                <TrendArrow value={report.orderGrowth} />
                {Math.abs(report.orderGrowth)}%
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">Media {report.avgDailyOrders}/dia</p>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Receita</span>
              <DollarSign className="w-3.5 h-3.5 text-muted-foreground/50" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold tabular-nums text-emerald-400">
                R$ {(report.totalRevenue / 1000).toFixed(1)}k
              </span>
              <span className={cn(
                "flex items-center gap-0.5 text-xs font-medium",
                report.revenueGrowth >= 0 ? "text-emerald-400" : "text-red-400"
              )}>
                <TrendArrow value={report.revenueGrowth} />
                {Math.abs(report.revenueGrowth)}%
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">vs periodo anterior</p>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Ticket Medio</span>
              <Target className="w-3.5 h-3.5 text-muted-foreground/50" />
            </div>
            <span className="text-2xl font-bold tabular-nums">R$ {report.avgTicket.toFixed(2)}</span>
            <p className="text-[11px] text-muted-foreground mt-1">por pedido</p>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Novos Clientes</span>
              <Users className="w-3.5 h-3.5 text-muted-foreground/50" />
            </div>
            <span className="text-2xl font-bold tabular-nums">{report.totalNewCustomers.toLocaleString("pt-BR")}</span>
            <p className="text-[11px] text-muted-foreground mt-1">{Math.round(report.totalNewCustomers / report.days)}/dia</p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue chart */}
      <Card className="border-border/50">
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Receita Diaria</h3>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="text-[10px] text-muted-foreground">Receita (R$)</span>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "#475569" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip content={<ChartTooltip />} />
                <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} fill="url(#revenueGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Day of week performance */}
        <Card className="border-border/50">
          <CardContent className="p-5">
            <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-4">Media por Dia da Semana</h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={report.dowData} barCategoryGap="25%">
                  <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "#475569" }} axisLine={false} tickLine={false} />
                  <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
                  <Bar dataKey="avgOrders" radius={[6, 6, 0, 0]}>
                    {report.dowData.map((entry) => (
                      <Cell
                        key={entry.day}
                        fill={entry.day === "Sex" || entry.day === "Sab" ? "#10b981" : "#6366f1"}
                        fillOpacity={entry.day === "Sex" || entry.day === "Sab" ? 0.8 : 0.5}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Best/Worst days */}
        <Card className="border-border/50">
          <CardContent className="p-5">
            <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-4">Destaques do Periodo</h3>
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  <span className="text-sm font-semibold text-emerald-400">Melhor dia</span>
                </div>
                <p className="text-lg font-bold tabular-nums">{report.bestDay.date} ({report.bestDay.dayName})</p>
                <div className="flex items-center gap-4 mt-1">
                  <span className="text-xs text-muted-foreground">{report.bestDay.orders} pedidos</span>
                  <span className="text-xs text-emerald-400 font-medium">R$ {report.bestDay.revenue.toLocaleString("pt-BR")}</span>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingDown className="w-4 h-4 text-red-400" />
                  <span className="text-sm font-semibold text-red-400">Dia mais fraco</span>
                </div>
                <p className="text-lg font-bold tabular-nums">{report.worstDay.date} ({report.worstDay.dayName})</p>
                <div className="flex items-center gap-4 mt-1">
                  <span className="text-xs text-muted-foreground">{report.worstDay.orders} pedidos</span>
                  <span className="text-xs text-red-400 font-medium">R$ {report.worstDay.revenue.toLocaleString("pt-BR")}</span>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-accent/30 border border-border/50">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-semibold">Periodo</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {report.dailyData[0].date} a {report.dailyData[report.dailyData.length - 1].date} ({report.days} dias)
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top neighborhoods */}
        <Card className="border-border/50">
          <CardContent className="p-5">
            <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-4">Top Bairros</h3>
            <div className="space-y-3">
              {report.neighborhoods.map((n, i) => (
                <div key={n.name} className="flex items-center gap-3">
                  <span className="text-xs font-bold text-muted-foreground w-4 text-right">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium truncate">{n.name}</span>
                      <span className="text-xs text-muted-foreground tabular-nums">{n.orders} pedidos ({n.pct}%)</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary transition-all"
                        style={{ width: `${(n.pct / report.neighborhoods[0].pct) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top products */}
        <Card className="border-border/50">
          <CardContent className="p-5">
            <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-4">Top Produtos</h3>
            <div className="space-y-2">
              {report.products.map((p, i) => (
                <div key={p.name} className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-accent/20 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-muted-foreground w-4 text-right">{i + 1}</span>
                    <span className="text-sm font-medium">{p.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground tabular-nums">{p.qty} un.</span>
                    <Badge className={cn(
                      "text-[10px] border",
                      p.trend === "up" ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/20" :
                      p.trend === "down" ? "bg-red-500/15 text-red-400 border-red-500/20" :
                      "bg-accent/50 text-muted-foreground border-border/50"
                    )}>
                      {p.trend === "up" ? "Alta" : p.trend === "down" ? "Queda" : "Estavel"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
