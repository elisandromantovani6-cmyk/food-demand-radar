"use client";

import { Card, CardContent } from "@/components/ui/card";
import { DemandHeatmap } from "@/components/map/demand-heatmap";
import { DemandTimeline } from "@/components/widgets/demand-timeline";
import { HotNeighborhoods } from "@/components/widgets/hot-neighborhoods";
import { HungerScoreGauge } from "@/components/widgets/hunger-score-gauge";

export default function DemandRadarPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Demand Radar</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Mapa de demanda em tempo real de Tangará da Serra</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 min-h-[500px]">
          <DemandHeatmap />
        </div>
        <div className="space-y-6">
          <HungerScoreGauge />
          <HotNeighborhoods />
        </div>
      </div>

      <DemandTimeline />
    </div>
  );
}
