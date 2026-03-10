"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import {
  Megaphone, TrendingUp, UtensilsCrossed, Target, Navigation, BarChart3,
} from "lucide-react";
import { cn } from "@/lib/utils";

const actions = [
  { href: "/campaigns", label: "Nova Campanha", icon: Megaphone, color: "text-purple-400 bg-purple-500/10" },
  { href: "/menu", label: "Cardapio", icon: UtensilsCrossed, color: "text-amber-400 bg-amber-500/10" },
  { href: "/forecast", label: "Previsao", icon: TrendingUp, color: "text-blue-400 bg-blue-500/10" },
  { href: "/competition", label: "Concorrentes", icon: Target, color: "text-red-400 bg-red-500/10" },
  { href: "/expansion", label: "Expansao", icon: Navigation, color: "text-emerald-400 bg-emerald-500/10" },
  { href: "/reports", label: "Relatorios", icon: BarChart3, color: "text-indigo-400 bg-indigo-500/10" },
];

export function QuickActions() {
  return (
    <Card className="border-border/50">
      <CardContent className="p-4">
        <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">Acoes Rapidas</h3>
        <div className="grid grid-cols-3 gap-2">
          {actions.map(action => {
            const Icon = action.icon;
            return (
              <Link
                key={action.href}
                href={action.href}
                className="flex flex-col items-center gap-1.5 p-3 rounded-lg hover:bg-accent/30 transition-colors group"
              >
                <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110", action.color)}>
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-[11px] font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                  {action.label}
                </span>
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
