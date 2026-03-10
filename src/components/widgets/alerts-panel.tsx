"use client";

import { Card, CardContent } from "@/components/ui/card";
import { CloudRain, Zap, Trophy, X, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { trpc } from "@/lib/trpc";

const alertConfig = {
  weather: { icon: CloudRain, color: "text-blue-400", bg: "bg-blue-500/10", dot: "bg-blue-400" },
  surge: { icon: Zap, color: "text-amber-400", bg: "bg-amber-500/10", dot: "bg-amber-400" },
  event: { icon: Trophy, color: "text-emerald-400", bg: "bg-emerald-500/10", dot: "bg-emerald-400" },
  underserved: { icon: AlertTriangle, color: "text-purple-400", bg: "bg-purple-500/10", dot: "bg-purple-400" },
};

const severityStyles = {
  critical: "border-l-red-500",
  high: "border-l-orange-500",
  medium: "border-l-amber-500",
  low: "border-l-muted-foreground/30",
};

export function AlertsPanel() {
  const { data, isLoading } = trpc.alerts.getActive.useQuery(
    {},
    { refetchInterval: 60000 }
  );
  const acknowledgeMutation = trpc.alerts.acknowledge.useMutation();

  const alerts = data ?? [];

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - new Date(date).getTime();
    const diffMin = Math.round(diffMs / 60000);
    if (diffMin < 1) return "agora";
    if (diffMin < 60) return `${diffMin}min`;
    return `${Math.round(diffMin / 60)}h`;
  };

  return (
    <Card className="border-border/50">
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Alertas</h3>
          <span className="text-[11px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">{alerts.length}</span>
        </div>
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 rounded-lg animate-shimmer" />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {alerts.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-6">Nenhum alerta ativo</p>
            )}
            {alerts.map((alert) => {
              const config = alertConfig[alert.type as keyof typeof alertConfig] ?? alertConfig.surge;
              const Icon = config.icon;
              return (
                <div
                  key={alert.id}
                  className={cn(
                    "flex gap-3 p-3 rounded-lg bg-card border border-border/50 border-l-2 transition-all hover:bg-accent/20",
                    severityStyles[alert.severity as keyof typeof severityStyles]
                  )}
                >
                  <div className={cn("w-7 h-7 rounded-md flex items-center justify-center shrink-0", config.bg)}>
                    <Icon className={cn("w-3.5 h-3.5", config.color)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium leading-tight">{alert.title}</p>
                      <button
                        onClick={() => acknowledgeMutation.mutate({ alertId: alert.id })}
                        className="p-0.5 rounded hover:bg-muted transition-colors shrink-0 opacity-0 group-hover:opacity-100"
                      >
                        <X className="w-3 h-3 text-muted-foreground" />
                      </button>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">{alert.description}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className={cn("w-1.5 h-1.5 rounded-full", config.dot)} />
                      <span className="text-[10px] text-muted-foreground">{alert.severity}</span>
                      <span className="text-[10px] text-muted-foreground/50">·</span>
                      <span className="text-[10px] text-muted-foreground">{formatTimeAgo(alert.createdAt)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
