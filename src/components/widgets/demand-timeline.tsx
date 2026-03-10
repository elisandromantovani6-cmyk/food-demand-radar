"use client";

import { Card, CardContent } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { trpc } from "@/lib/trpc";

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; color: string }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 shadow-lg backdrop-blur-xl">
      <p className="text-[11px] text-muted-foreground mb-0.5">{label}:00</p>
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full" style={{ background: payload[0].color }} />
        <span className="text-sm font-semibold">{payload[0].value}/100</span>
      </div>
    </div>
  );
}

export function DemandTimeline() {
  const { data, isLoading } = trpc.demand.getTimeline.useQuery(
    {},
    { refetchInterval: 60000 }
  );

  const currentHour = new Date().getHours().toString().padStart(2, "0");

  const chartData = (data ?? []).map(d => ({
    hour: d.label.replace(":00", ""),
    score: d.demandScore,
  }));

  return (
    <Card className="border-border/50">
      <CardContent className="p-5">
        <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-4">Demanda 24h</h3>
        {isLoading ? (
          <div className="h-48 rounded-lg animate-shimmer" />
        ) : (
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="demandGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.70 0.20 275)" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="oklch(0.70 0.20 275)" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="hour"
                  tick={{ fontSize: 10, fill: "oklch(0.55 0.01 265)" }}
                  axisLine={false}
                  tickLine={false}
                  interval={2}
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fontSize: 10, fill: "oklch(0.55 0.01 265)" }}
                  axisLine={false}
                  tickLine={false}
                  width={28}
                />
                <Tooltip content={<CustomTooltip />} />
                <ReferenceLine
                  x={currentHour}
                  stroke="oklch(0.70 0.20 275)"
                  strokeDasharray="4 4"
                  strokeWidth={1}
                  strokeOpacity={0.5}
                />
                <Area
                  type="monotone"
                  dataKey="score"
                  stroke="oklch(0.70 0.20 275)"
                  strokeWidth={2}
                  fill="url(#demandGradient)"
                  dot={false}
                  activeDot={{ r: 4, fill: "oklch(0.70 0.20 275)", strokeWidth: 2, stroke: "var(--background)" }}
                  animationDuration={1000}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
