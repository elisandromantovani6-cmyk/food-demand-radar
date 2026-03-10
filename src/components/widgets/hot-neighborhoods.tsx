"use client";

import { Card, CardContent } from "@/components/ui/card";
import { ArrowUp, ArrowDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import { trpc } from "@/lib/trpc";

const TrendIcon = ({ trend }: { trend: "up" | "down" | "stable" }) => {
  if (trend === "up") return <ArrowUp className="w-3 h-3 text-emerald-400" />;
  if (trend === "down") return <ArrowDown className="w-3 h-3 text-red-400" />;
  return <Minus className="w-3 h-3 text-muted-foreground" />;
};

export function HotNeighborhoods() {
  const { data, isLoading } = trpc.demand.getHotNeighborhoods.useQuery(
    { city: "Tangara da Serra", limit: 5 },
    { refetchInterval: 60000 }
  );

  return (
    <Card className="border-border/50">
      <CardContent className="p-5">
        <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-4">Bairros Mais Quentes</h3>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-10 rounded-lg animate-shimmer" />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {(data ?? []).map((hood, idx) => {
              const rank = idx + 1;
              const trend = hood.demandScore > 70 ? "up" : hood.demandScore > 55 ? "stable" : "down";
              return (
                <div key={hood.neighborhoodId} className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent/30 transition-colors group">
                  <span className={cn(
                    "w-6 h-6 rounded-md flex items-center justify-center text-[11px] font-bold",
                    rank === 1 ? "bg-red-500/15 text-red-400" :
                    rank === 2 ? "bg-orange-500/15 text-orange-400" :
                    rank === 3 ? "bg-amber-500/15 text-amber-400" :
                    "bg-muted text-muted-foreground"
                  )}>
                    {rank}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium truncate">{hood.name}</span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-semibold tabular-nums">{hood.demandScore}</span>
                        <TrendIcon trend={trend as "up" | "down" | "stable"} />
                      </div>
                    </div>
                    <div className="w-full bg-muted rounded-full h-1">
                      <div
                        className={cn(
                          "h-1 rounded-full transition-all duration-700",
                          hood.demandScore >= 80 ? "bg-red-500" :
                          hood.demandScore >= 60 ? "bg-amber-500" :
                          "bg-blue-500"
                        )}
                        style={{ width: `${hood.demandScore}%` }}
                      />
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
