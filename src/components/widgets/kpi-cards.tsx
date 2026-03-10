"use client";

import { Card, CardContent } from "@/components/ui/card";
import { ShoppingBag, DollarSign, Receipt, UserPlus, ArrowUp, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { trpc } from "@/lib/trpc";

export function KPICards() {
  const { data } = trpc.kpis.getToday.useQuery(undefined, {
    refetchInterval: 30000,
  });

  const kpis = [
    {
      label: "Pedidos Hoje",
      value: data ? data.ordersToday.toLocaleString("pt-BR") : "—",
      prefix: "",
      change: data?.changeOrders ?? 0,
      icon: ShoppingBag,
      sparkColor: "from-indigo-500/20",
    },
    {
      label: "Receita",
      value: data ? data.revenue.toLocaleString("pt-BR") : "—",
      prefix: "R$ ",
      change: data?.changeRevenue ?? 0,
      icon: DollarSign,
      sparkColor: "from-emerald-500/20",
    },
    {
      label: "Ticket Médio",
      value: data ? data.avgTicket.toLocaleString("pt-BR", { minimumFractionDigits: 2 }) : "—",
      prefix: "R$ ",
      change: data?.changeTicket ?? 0,
      icon: Receipt,
      sparkColor: "from-amber-500/20",
    },
    {
      label: "Novos Clientes",
      value: data ? String(data.newCustomers) : "—",
      prefix: "",
      change: data?.changeCustomers ?? 0,
      icon: UserPlus,
      sparkColor: "from-pink-500/20",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {kpis.map((kpi) => {
        const isPositive = kpi.change >= 0;
        return (
          <Card key={kpi.label} className="group relative overflow-hidden border-border/50 hover:border-border transition-all duration-300">
            <CardContent className="p-4 relative">
              {/* Gradient glow */}
              <div className={cn(
                "absolute -top-6 -right-6 w-20 h-20 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br",
                kpi.sparkColor, "to-transparent"
              )} />

              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                  {kpi.label}
                </span>
                <kpi.icon className="w-3.5 h-3.5 text-muted-foreground/50" />
              </div>

              <div className="text-2xl font-bold tracking-tight tabular-nums">
                {kpi.prefix}{kpi.value}
              </div>

              <div className={cn(
                "flex items-center gap-1 mt-2 text-xs font-medium",
                isPositive ? "text-emerald-400" : "text-red-400"
              )}>
                {isPositive ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                <span>{Math.abs(kpi.change)}%</span>
                <span className="text-muted-foreground font-normal ml-0.5">vs ontem</span>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
