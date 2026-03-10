"use client";

import { Card, CardContent } from "@/components/ui/card";
import { ArrowUp, ArrowDown } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";

export function HungerScoreGauge() {
  const { data, isLoading } = trpc.demand.getCityScore.useQuery(
    { city: "Tangara da Serra" },
    { refetchInterval: 30000 }
  );

  const score = data?.hungerScore ?? 0;
  const peakHour = data?.peak?.hour ?? "--:--";
  const peakScore = data?.peak?.score ?? 0;
  const changeVsYesterday = 12;

  const radius = 58;
  const circumference = Math.PI * radius; // semi-circle
  const progress = (score / 100) * circumference;
  const offset = circumference - progress;

  const getColor = (s: number) => {
    if (s >= 70) return { stroke: "oklch(0.65 0.22 25)", text: "text-red-400", label: "Critico" };
    if (s >= 40) return { stroke: "oklch(0.80 0.18 85)", text: "text-amber-400", label: "Moderado" };
    return { stroke: "oklch(0.70 0.15 240)", text: "text-blue-400", label: "Tranquilo" };
  };

  const color = getColor(score);

  if (isLoading) {
    return (
      <Card className="border-border/50 h-full">
        <CardContent className="p-5 flex flex-col items-center justify-center h-full">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-4">Hunger Score</p>
          <div className="w-40 h-24 rounded-xl animate-shimmer" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("border-border/50 h-full", score >= 70 && "animate-pulse-glow")}>
      <CardContent className="p-5 flex flex-col items-center justify-center h-full">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-4">Hunger Score</p>

        {/* Semi-circular gauge */}
        <div className="relative w-44 h-24 mb-2">
          <svg className="w-full h-full" viewBox="0 0 140 80">
            {/* Background arc */}
            <path
              d="M 10 70 A 58 58 0 0 1 130 70"
              fill="none"
              stroke="oklch(1 0 0 / 6%)"
              strokeWidth="8"
              strokeLinecap="round"
            />
            {/* Active arc */}
            <path
              d="M 10 70 A 58 58 0 0 1 130 70"
              fill="none"
              stroke={color.stroke}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-end pb-1">
            <span className={cn("text-4xl font-bold tabular-nums tracking-tight", color.text)}>{score}</span>
          </div>
        </div>

        <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full",
          score >= 70 ? "bg-red-500/10 text-red-400" :
          score >= 40 ? "bg-amber-500/10 text-amber-400" :
          "bg-blue-500/10 text-blue-400"
        )}>
          {color.label}
        </span>

        <div className="mt-4 text-center space-y-1.5 w-full">
          <div className={cn(
            "flex items-center justify-center gap-1 text-xs font-medium",
            changeVsYesterday >= 0 ? "text-emerald-400" : "text-red-400"
          )}>
            {changeVsYesterday >= 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
            <span>{changeVsYesterday >= 0 ? "+" : ""}{changeVsYesterday} vs ontem</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Pico: <span className="font-medium text-foreground">{peakHour}</span> <span className="text-muted-foreground/60">({peakScore})</span>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
