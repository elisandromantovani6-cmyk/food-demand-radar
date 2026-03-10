"use client";

import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";

function getHeatColor(score: number): string {
  if (score >= 80) return "#ef4444";
  if (score >= 65) return "#f59e0b";
  if (score >= 50) return "#6366f1";
  return "#818cf8";
}

function getHeatOpacity(score: number): number {
  if (score >= 80) return 0.5;
  if (score >= 65) return 0.4;
  return 0.3;
}

function getRadius(score: number): number {
  return 200 + score * 2.5;
}

export function DemandHeatmap() {
  const [mounted, setMounted] = useState(false);
  const [MapComponents, setMapComponents] = useState<{
    MapContainer: React.ComponentType<Record<string, unknown>>;
    TileLayer: React.ComponentType<Record<string, unknown>>;
    Circle: React.ComponentType<Record<string, unknown>>;
    Tooltip: React.ComponentType<Record<string, unknown>>;
  } | null>(null);

  const { data } = trpc.demand.getHeatmapData.useQuery(
    { city: "Tangara da Serra", foodCategory: "pizza" },
    { refetchInterval: 60000 }
  );

  const neighborhoods = data ?? [];

  useEffect(() => {
    setMounted(true);
    import("react-leaflet").then((mod) => {
      setMapComponents({
        MapContainer: mod.MapContainer as unknown as React.ComponentType<Record<string, unknown>>,
        TileLayer: mod.TileLayer as unknown as React.ComponentType<Record<string, unknown>>,
        Circle: mod.Circle as unknown as React.ComponentType<Record<string, unknown>>,
        Tooltip: mod.Tooltip as unknown as React.ComponentType<Record<string, unknown>>,
      });
    });
  }, []);

  if (!mounted || !MapComponents) {
    return (
      <div className="w-full h-full min-h-[350px] rounded-xl bg-card border border-border/50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <p className="text-xs text-muted-foreground">Carregando mapa...</p>
        </div>
      </div>
    );
  }

  const { MapContainer, TileLayer, Circle, Tooltip } = MapComponents;

  return (
    <div className="relative w-full h-full min-h-[350px] rounded-xl overflow-hidden border border-border/50">
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        crossOrigin=""
      />
      <MapContainer
        center={[-14.6229, -57.4933]}
        zoom={14}
        scrollWheelZoom={true}
        style={{ height: "100%", width: "100%", minHeight: "350px" }}
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png"
        />
        {neighborhoods.map((hood) => (
          <Circle
            key={hood.neighborhoodId}
            center={[hood.lat, hood.lng]}
            radius={getRadius(hood.demandScore)}
            pathOptions={{
              color: getHeatColor(hood.demandScore),
              fillColor: getHeatColor(hood.demandScore),
              fillOpacity: getHeatOpacity(hood.demandScore),
              weight: 0.5,
              opacity: 0.5,
            }}
          >
            <Tooltip direction="top" offset={[0, -10]} opacity={0.95}>
              <div style={{ textAlign: "center", fontFamily: "var(--font-sans)", fontSize: "12px" }}>
                <strong>{hood.name}</strong>
                <br />
                Demanda: {hood.demandScore}/100
              </div>
            </Tooltip>
          </Circle>
        ))}
      </MapContainer>

      {/* Overlay title - glass morphism */}
      <div className="absolute top-3 left-12 z-[1000] bg-card/80 backdrop-blur-xl border border-border rounded-lg px-3 py-2 pointer-events-none shadow-lg">
        <p className="text-xs font-semibold">Mapa de Demanda</p>
        <p className="text-[10px] text-muted-foreground">Tempo real — Tangara da Serra</p>
      </div>

      {/* Legend - pill style */}
      <div className="absolute bottom-3 left-12 z-[1000] flex items-center gap-1 bg-card/80 backdrop-blur-xl border border-border rounded-full px-3 py-1.5 pointer-events-none shadow-md">
        <div className="w-2 h-2 rounded-full bg-red-500" />
        <span className="text-[10px] text-muted-foreground mr-2">Alta</span>
        <div className="w-2 h-2 rounded-full bg-amber-500" />
        <span className="text-[10px] text-muted-foreground mr-2">Media</span>
        <div className="w-2 h-2 rounded-full bg-indigo-500" />
        <span className="text-[10px] text-muted-foreground">Baixa</span>
      </div>
    </div>
  );
}
