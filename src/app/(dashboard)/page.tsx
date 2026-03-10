"use client";

import { KPICards } from "@/components/widgets/kpi-cards";
import { HungerScoreGauge } from "@/components/widgets/hunger-score-gauge";
import { HotNeighborhoods } from "@/components/widgets/hot-neighborhoods";
import { DemandTimeline } from "@/components/widgets/demand-timeline";
import { AlertsPanel } from "@/components/widgets/alerts-panel";
import { DemandHeatmap } from "@/components/map/demand-heatmap";
import { WeatherWidget } from "@/components/widgets/weather-widget";
import { QuickActions } from "@/components/widgets/quick-actions";
import { ActiveCampaigns } from "@/components/widgets/active-campaigns";
import { useAuth } from "@/lib/auth";

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Bom dia";
  if (hour < 18) return "Boa tarde";
  return "Boa noite";
}

export default function CommandCenterPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-5">
      {/* Hero greeting */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">
            {getGreeting()}, {user?.name?.split(" ")[0] ?? "Chef"}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Aqui esta o resumo do seu dia
          </p>
        </div>
      </div>

      {/* KPIs + Weather */}
      <div className="grid grid-cols-12 gap-3">
        <div className="col-span-12 lg:col-span-9">
          <KPICards />
        </div>
        <div className="col-span-12 lg:col-span-3">
          <WeatherWidget />
        </div>
      </div>

      {/* Map + Hunger Score */}
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 lg:col-span-8 h-[420px]">
          <DemandHeatmap />
        </div>
        <div className="col-span-12 lg:col-span-4 h-[420px]">
          <HungerScoreGauge />
        </div>
      </div>

      {/* Timeline + Hot + Alerts */}
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 lg:col-span-5">
          <DemandTimeline />
        </div>
        <div className="col-span-12 lg:col-span-3">
          <HotNeighborhoods />
        </div>
        <div className="col-span-12 lg:col-span-4">
          <AlertsPanel />
        </div>
      </div>

      {/* Quick Actions + Active Campaigns */}
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 lg:col-span-5">
          <QuickActions />
        </div>
        <div className="col-span-12 lg:col-span-7">
          <ActiveCampaigns />
        </div>
      </div>
    </div>
  );
}
