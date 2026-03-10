"use client";

import { Card, CardContent } from "@/components/ui/card";
import { CloudRain, Sun, Cloud, CloudSnow, Thermometer, Droplets, Wind } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";

const weatherIcons: Record<string, typeof Sun> = {
  "01d": Sun, "01n": Sun,
  "02d": Cloud, "02n": Cloud,
  "03d": Cloud, "03n": Cloud,
  "04d": Cloud, "04n": Cloud,
  "09d": CloudRain, "09n": CloudRain,
  "10d": CloudRain, "10n": CloudRain,
  "11d": CloudRain, "11n": CloudRain,
  "13d": CloudSnow, "13n": CloudSnow,
  "50d": Cloud, "50n": Cloud,
};

export function WeatherWidget() {
  const { data, isLoading } = trpc.data.weather.useQuery(undefined, {
    refetchInterval: 300000,
  });

  if (isLoading) {
    return (
      <Card className="border-border/50">
        <CardContent className="p-4">
          <div className="h-16 rounded-lg animate-shimmer" />
        </CardContent>
      </Card>
    );
  }

  if (!data) return null;

  const Icon = weatherIcons[data.icon] ?? Cloud;
  const isReal = data.source === "openweather";

  return (
    <Card className={cn("border-border/50 overflow-hidden", data.isRaining && "ring-1 ring-blue-500/20")}>
      <CardContent className="p-4 relative">
        {data.isRaining && (
          <div className="absolute -top-4 -right-4 w-24 h-24 rounded-full blur-2xl bg-blue-500/10" />
        )}
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Clima</h3>
          <span className={cn(
            "text-[9px] font-medium px-1.5 py-0.5 rounded-full",
            isReal ? "bg-emerald-500/10 text-emerald-400" : "bg-muted text-muted-foreground"
          )}>
            {isReal ? "Ao vivo" : "Estimado"}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-accent/50 flex items-center justify-center">
            <Icon className="w-4.5 h-4.5 text-blue-400" />
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-bold tabular-nums">{data.temperature}°</span>
              <span className="text-xs text-muted-foreground capitalize">{data.description}</span>
            </div>
            <div className="flex items-center gap-2.5 text-[10px] text-muted-foreground mt-0.5">
              <span className="flex items-center gap-0.5"><Thermometer className="w-2.5 h-2.5" />{data.feelsLike}°</span>
              <span className="flex items-center gap-0.5"><Droplets className="w-2.5 h-2.5" />{data.humidity}%</span>
              <span className="flex items-center gap-0.5"><Wind className="w-2.5 h-2.5" />{data.windSpeed}m/s</span>
            </div>
          </div>
        </div>
        {data.isRaining && (
          <div className="mt-2 p-2 rounded-md bg-blue-500/8 border border-blue-500/10">
            <p className="text-[11px] text-blue-400 font-medium">
              Chovendo — demanda de delivery +25-40%
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
