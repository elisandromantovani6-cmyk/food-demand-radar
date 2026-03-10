"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Cell, PieChart, Pie,
} from "recharts";
import {
  BarChart3, TrendingUp, DollarSign, Users, ShoppingBag,
  Clock, MapPin, Flame, ArrowUp, ArrowDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { trpc } from "@/lib/trpc";

// Gerar dados de vendas dos últimos 30 dias (simulação baseada em padrões reais)
function generateLast30Days() {
  const data = [];
  const now = new Date();
  for (let i = 29; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dayOfWeek = date.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 5 || dayOfWeek === 6;
    const base = isWeekend ? 220 : 165;
    const noise = Math.round((Math.sin(i * 2.5) * 25) + (Math.random() * 20 - 10));
    const orders = base + noise;
    const avgTicket = 34 + Math.random() * 8;
    data.push({
      date: date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
      dayLabel: date.toLocaleDateString("pt-BR", { weekday: "short" }),
      orders,
      revenue: Math.round(orders * avgTicket),
      avgTicket: Math.round(avgTicket * 100) / 100,
      isWeekend,
    });
  }
  return data;
}

function generateHourlyData() {
  const hours = [];
  for (let h = 10; h <= 23; h++) {
    const isLunch = h >= 11 && h <= 13;
    const isDinner = h >= 18 && h <= 21;
    const isLateNight = h >= 22;
    const base = isLunch ? 18 : isDinner ? 25 : isLateNight ? 12 : 6;
    const noise = Math.round(Math.random() * 5);
    hours.push({
      hour: `${h}:00`,
      orders: base + noise,
      isPeak: isDinner,
    });
  }
  return hours;
}

function generateCategoryData() {
  return [
    { name: "Pizzas", value: 62, fill: "#6366f1" },
    { name: "Bebidas", value: 18, fill: "#f59e0b" },
    { name: "Sobremesas", value: 10, fill: "#ec4899" },
    { name: "Entradas", value: 6, fill: "#10b981" },
    { name: "Extras", value: 4, fill: "#8b5cf6" },
  ];
}

function generateTopItems() {
  return [
    { name: "Pizza Calabresa", orders: 342, revenue: 14652, trend: 8 },
    { name: "Pizza Margherita", orders: 298, revenue: 11890, trend: 12 },
    { name: "Pizza Frango c/ Catupiry", orders: 267, revenue: 11987, trend: -3 },
    { name: "Pizza Portuguesa", orders: 215, revenue: 9653, trend: 5 },
    { name: "Combo Família", orders: 189, revenue: 14175, trend: 22 },
    { name: "Pizza Quatro Queijos", orders: 176, revenue: 8254, trend: -1 },
    { name: "Refrigerante 2L", orders: 412, revenue: 5315, trend: 2 },
    { name: "Petit Gâteau", orders: 134, revenue: 2533, trend: 15 },
  ];
}

function generateNeighborhoodData() {
  return [
    { name: "Centro", orders: 520, pct: 22 },
    { name: "Vila Alta", orders: 380, pct: 16 },
    { name: "Jardim Europa", orders: 310, pct: 13 },
    { name: "Residencial 2000", orders: 280, pct: 12 },
    { name: "Vila Nova", orders: 245, pct: 10 },
    { name: "Outros", orders: 645, pct: 27 },
  ];
}

const ChartTooltipRevenue = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; dataKey: string }>; label?: string }) => {
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

export default function AnalyticsPage() {
  const { data: kpis } = trpc.kpis.getToday.useQuery(undefined, { refetchInterval: 60000 });
  const { data: menuData } = trpc.menu.getItems.useQuery({}, { refetchInterval: false });

  const last30 = generateLast30Days();
  const hourly = generateHourlyData();
  const categories = generateCategoryData();
  const topItems = generateTopItems();
  const neighborhoods = generateNeighborhoodData();

  const totalOrders30d = last30.reduce((s, d) => s + d.orders, 0);
  const totalRevenue30d = last30.reduce((s, d) => s + d.revenue, 0);
  const avgDaily = Math.round(totalOrders30d / 30);
  const avgTicket30d = Math.round((totalRevenue30d / totalOrders30d) * 100) / 100;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Analytics</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Análise de performance dos últimos 30 dias</p>
      </div>

      {/* KPIs 30 dias */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Pedidos (30d)</span>
              <ShoppingBag className="w-3.5 h-3.5 text-muted-foreground/50" />
            </div>
            <span className="text-2xl font-bold tabular-nums">{totalOrders30d.toLocaleString("pt-BR")}</span>
            <div className="flex items-center gap-1 mt-1">
              <ArrowUp className="w-3 h-3 text-emerald-400" />
              <span className="text-[11px] text-emerald-400 font-medium">+12% vs mês anterior</span>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Receita (30d)</span>
              <DollarSign className="w-3.5 h-3.5 text-muted-foreground/50" />
            </div>
            <span className="text-2xl font-bold tabular-nums text-emerald-400">R$ {(totalRevenue30d / 1000).toFixed(1)}k</span>
            <div className="flex items-center gap-1 mt-1">
              <ArrowUp className="w-3 h-3 text-emerald-400" />
              <span className="text-[11px] text-emerald-400 font-medium">+8% vs mês anterior</span>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Ticket Médio</span>
              <TrendingUp className="w-3.5 h-3.5 text-muted-foreground/50" />
            </div>
            <span className="text-2xl font-bold tabular-nums">R$ {avgTicket30d.toFixed(2)}</span>
            <div className="flex items-center gap-1 mt-1">
              <ArrowDown className="w-3 h-3 text-amber-400" />
              <span className="text-[11px] text-amber-400 font-medium">-2% vs mês anterior</span>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Média Diária</span>
              <Clock className="w-3.5 h-3.5 text-muted-foreground/50" />
            </div>
            <span className="text-2xl font-bold tabular-nums">{avgDaily}</span>
            <p className="text-[11px] text-muted-foreground mt-1">pedidos/dia</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="bg-secondary border border-border">
          <TabsTrigger value="overview">
            <BarChart3 className="w-3 h-3 mr-1.5" />
            Visão Geral
          </TabsTrigger>
          <TabsTrigger value="products">
            <Flame className="w-3 h-3 mr-1.5" />
            Produtos
          </TabsTrigger>
          <TabsTrigger value="geography">
            <MapPin className="w-3 h-3 mr-1.5" />
            Geografia
          </TabsTrigger>
        </TabsList>

        {/* Visão Geral */}
        <TabsContent value="overview" className="mt-4 space-y-4">
          {/* Gráfico receita 30 dias */}
          <Card className="border-border/50">
            <CardContent className="p-5">
              <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-4">Receita Diária (30 dias)</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={last30}>
                    <defs>
                      <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#6366f1" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} interval={4} />
                    <YAxis tick={{ fontSize: 10, fill: "#475569" }} axisLine={false} tickLine={false} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                    <Tooltip content={<ChartTooltipRevenue />} />
                    <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2} fill="url(#revenueGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Pedidos por hora */}
          <Card className="border-border/50">
            <CardContent className="p-5">
              <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-4">Pedidos por Horário (média)</h3>
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={hourly} barCategoryGap="15%">
                    <XAxis dataKey="hour" tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: "#475569" }} axisLine={false} tickLine={false} />
                    <Tooltip content={<ChartTooltipRevenue />} />
                    <Bar dataKey="orders" radius={[4, 4, 0, 0]}>
                      {hourly.map((entry, i) => (
                        <Cell key={i} fill={entry.isPeak ? "#10b981" : "#6366f1"} fillOpacity={entry.isPeak ? 0.9 : 0.6} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="flex items-center gap-4 mt-2">
                <span className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" /> Horário de pico
                </span>
                <span className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                  <span className="w-2 h-2 rounded-full bg-indigo-500" /> Normal
                </span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Produtos */}
        <TabsContent value="products" className="mt-4 space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Pie chart categorias */}
            <Card className="border-border/50">
              <CardContent className="p-5">
                <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-4">Vendas por Categoria</h3>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={categories} dataKey="value" cx="50%" cy="50%" outerRadius={70} innerRadius={40} strokeWidth={0}>
                        {categories.map((entry, i) => (
                          <Cell key={i} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `${value}%`} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {categories.map(c => (
                    <span key={c.name} className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                      <span className="w-2 h-2 rounded-full" style={{ background: c.fill }} />
                      {c.name} ({c.value}%)
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Top produtos */}
            <Card className="border-border/50 lg:col-span-2">
              <CardContent className="p-5">
                <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-4">Top Produtos (30 dias)</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">#</th>
                        <th className="text-left py-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Produto</th>
                        <th className="text-right py-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Pedidos</th>
                        <th className="text-right py-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Receita</th>
                        <th className="text-right py-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Tendência</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topItems.map((item, i) => (
                        <tr key={i} className="border-b border-border/30 last:border-0 hover:bg-accent/20 transition-colors">
                          <td className="py-2.5 text-muted-foreground font-mono text-xs">{i + 1}</td>
                          <td className="py-2.5 font-medium">{item.name}</td>
                          <td className="py-2.5 text-right tabular-nums">{item.orders}</td>
                          <td className="py-2.5 text-right tabular-nums text-emerald-400 font-medium">R$ {item.revenue.toLocaleString("pt-BR")}</td>
                          <td className="py-2.5 text-right">
                            <span className={cn(
                              "inline-flex items-center gap-0.5 text-xs font-semibold",
                              item.trend > 0 ? "text-emerald-400" : item.trend < 0 ? "text-red-400" : "text-muted-foreground"
                            )}>
                              {item.trend > 0 ? <ArrowUp className="w-3 h-3" /> : item.trend < 0 ? <ArrowDown className="w-3 h-3" /> : null}
                              {item.trend > 0 ? "+" : ""}{item.trend}%
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

          {/* Itens no cardápio */}
          {menuData?.stats && (
            <div className="grid grid-cols-3 gap-3">
              <Card className="border-border/50">
                <CardContent className="p-4 text-center">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Itens no Cardápio</p>
                  <p className="text-2xl font-bold tabular-nums">{menuData.stats.total}</p>
                </CardContent>
              </Card>
              <Card className="border-border/50">
                <CardContent className="p-4 text-center">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Preço Médio</p>
                  <p className="text-2xl font-bold tabular-nums text-emerald-400">R$ {menuData.stats.avgPrice.toFixed(2)}</p>
                </CardContent>
              </Card>
              <Card className="border-border/50">
                <CardContent className="p-4 text-center">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Margem Média</p>
                  <p className="text-2xl font-bold tabular-nums">{menuData.stats.avgMargin}%</p>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* Geografia */}
        <TabsContent value="geography" className="mt-4 space-y-4">
          <Card className="border-border/50">
            <CardContent className="p-5">
              <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-4">Pedidos por Bairro (30 dias)</h3>
              <div className="space-y-3">
                {neighborhoods.map((n, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-xs font-mono text-muted-foreground w-5 text-right">{i + 1}</span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">{n.name}</span>
                        <span className="text-xs tabular-nums text-muted-foreground">{n.orders} pedidos ({n.pct}%)</span>
                      </div>
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-primary transition-all"
                          style={{ width: `${(n.pct / neighborhoods[0].pct) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 gap-3">
            <Card className="border-border/50 border-l-2 border-l-emerald-500">
              <CardContent className="p-4">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Bairro com Maior Crescimento</p>
                <p className="text-lg font-bold">Jardim Europa</p>
                <div className="flex items-center gap-1 mt-1">
                  <ArrowUp className="w-3 h-3 text-emerald-400" />
                  <span className="text-sm text-emerald-400 font-semibold">+34% vs mês anterior</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Região com novos condomínios impulsionando demanda</p>
              </CardContent>
            </Card>
            <Card className="border-border/50 border-l-2 border-l-amber-500">
              <CardContent className="p-4">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Oportunidade Detectada</p>
                <p className="text-lg font-bold">Residencial 2000</p>
                <div className="flex items-center gap-1 mt-1">
                  <Users className="w-3 h-3 text-amber-400" />
                  <span className="text-sm text-amber-400 font-semibold">Alta demanda, baixa concorrência</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Considere aumentar investimento em campanhas nesta área</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
