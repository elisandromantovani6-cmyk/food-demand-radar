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
  if (score >= 80) return 0.35;
  if (score >= 65) return 0.28;
  return 0.2;
}

function getRadius(score: number): number {
  return 150 + score * 2;
}

function getScoreLabel(score: number): string {
  if (score >= 80) return "Crítica";
  if (score >= 65) return "Alta";
  if (score >= 50) return "Moderada";
  return "Baixa";
}

function getScoreColor(score: number): string {
  if (score >= 80) return "#ef4444";
  if (score >= 65) return "#f59e0b";
  if (score >= 50) return "#6366f1";
  return "#818cf8";
}

export function DemandHeatmap() {
  const [mounted, setMounted] = useState(false);
  const [MapComponents, setMapComponents] = useState<{
    MapContainer: React.ComponentType<Record<string, unknown>>;
    TileLayer: React.ComponentType<Record<string, unknown>>;
    Circle: React.ComponentType<Record<string, unknown>>;
    Popup: React.ComponentType<Record<string, unknown>>;
    Tooltip: React.ComponentType<Record<string, unknown>>;
  } | null>(null);

  const { data } = trpc.demand.getHeatmapData.useQuery(
    { city: "Tangará da Serra", foodCategory: "pizza" },
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
        Popup: mod.Popup as unknown as React.ComponentType<Record<string, unknown>>,
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

  const { MapContainer, TileLayer, Circle, Popup, Tooltip } = MapComponents;

  return (
    <div className="relative w-full h-full min-h-[350px] rounded-xl overflow-hidden border border-border/50">
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        crossOrigin=""
      />
      <style dangerouslySetInnerHTML={{ __html: `
        .leaflet-tooltip {
          background: rgba(15, 20, 35, 0.95) !important;
          backdrop-filter: blur(12px) !important;
          border: 1px solid rgba(255, 255, 255, 0.12) !important;
          border-radius: 8px !important;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.5) !important;
          color: #e2e8f0 !important;
          padding: 6px 10px !important;
          font-size: 12px !important;
          font-weight: 600 !important;
          font-family: system-ui, -apple-system, sans-serif !important;
        }
        .leaflet-tooltip-top:before {
          border-top-color: rgba(15, 20, 35, 0.95) !important;
        }
        .leaflet-tooltip-bottom:before {
          border-bottom-color: rgba(15, 20, 35, 0.95) !important;
        }
        .leaflet-tooltip-left:before {
          border-left-color: rgba(15, 20, 35, 0.95) !important;
        }
        .leaflet-tooltip-right:before {
          border-right-color: rgba(15, 20, 35, 0.95) !important;
        }
        .leaflet-popup-content-wrapper {
          background: rgba(15, 20, 35, 0.95) !important;
          backdrop-filter: blur(20px) !important;
          border: 1px solid rgba(255, 255, 255, 0.1) !important;
          border-radius: 12px !important;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5) !important;
          color: #f1f5f9 !important;
          padding: 0 !important;
        }
        .leaflet-popup-content {
          margin: 0 !important;
          min-width: 220px !important;
          color: #f1f5f9 !important;
        }
        .leaflet-popup-tip {
          background: rgba(15, 20, 35, 0.95) !important;
          border: none !important;
          box-shadow: none !important;
        }
        .leaflet-popup-close-button {
          color: #94a3b8 !important;
          top: 8px !important;
          right: 8px !important;
          font-size: 18px !important;
          width: 20px !important;
          height: 20px !important;
          line-height: 20px !important;
        }
        .leaflet-popup-close-button:hover {
          color: #f1f5f9 !important;
        }
      ` }} />
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
              weight: 1,
              opacity: 0.6,
            }}
            eventHandlers={{}}
          >
            <Tooltip direction="top" offset={[0, -8]} opacity={1} permanent={false}>
              <div style={{ fontFamily: "system-ui", fontSize: "11px", color: "#e2e8f0", textAlign: "center", padding: "2px 4px" }}>
                <strong>{hood.name}</strong>
              </div>
            </Tooltip>
            <Popup>
              <div style={{ fontFamily: "system-ui, -apple-system, sans-serif", padding: "16px", minWidth: "220px" }}>
                <div style={{ marginBottom: "12px" }}>
                  <div style={{ fontSize: "15px", fontWeight: "700", color: "#f1f5f9", marginBottom: "3px" }}>
                    {hood.name}
                  </div>
                  <div style={{ fontSize: "11px", color: "#94a3b8" }}>
                    Tangará da Serra — MT
                  </div>
                </div>

                <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
                  <div style={{
                    flex: 1,
                    background: "rgba(255, 255, 255, 0.06)",
                    borderRadius: "8px",
                    padding: "10px 8px",
                    textAlign: "center",
                    border: "1px solid rgba(255, 255, 255, 0.06)",
                  }}>
                    <div style={{ fontSize: "22px", fontWeight: "800", color: getScoreColor(hood.demandScore), lineHeight: "1" }}>
                      {hood.demandScore}
                    </div>
                    <div style={{ fontSize: "9px", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em", marginTop: "4px" }}>
                      Demanda
                    </div>
                  </div>
                  <div style={{
                    flex: 1,
                    background: "rgba(255, 255, 255, 0.06)",
                    borderRadius: "8px",
                    padding: "10px 8px",
                    textAlign: "center",
                    border: "1px solid rgba(255, 255, 255, 0.06)",
                  }}>
                    <div style={{ fontSize: "22px", fontWeight: "800", color: getScoreColor(hood.hungerScore), lineHeight: "1" }}>
                      {hood.hungerScore}
                    </div>
                    <div style={{ fontSize: "9px", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em", marginTop: "4px" }}>
                      Fome
                    </div>
                  </div>
                </div>

                <div style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "8px 12px",
                  background: "rgba(255, 255, 255, 0.04)",
                  borderRadius: "8px",
                  fontSize: "11px",
                  border: "1px solid rgba(255, 255, 255, 0.04)",
                }}>
                  <span style={{ color: "#94a3b8" }}>Classificação</span>
                  <span style={{
                    color: "#0f1423",
                    fontWeight: "700",
                    padding: "3px 10px",
                    borderRadius: "9999px",
                    fontSize: "10px",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    background: getScoreColor(hood.demandScore),
                  }}>
                    {getScoreLabel(hood.demandScore)}
                  </span>
                </div>
              </div>
            </Popup>
          </Circle>
        ))}
      </MapContainer>

      {/* Overlay title - glass morphism */}
      <div className="absolute top-3 left-12 z-[1000] bg-card/80 backdrop-blur-xl border border-border rounded-lg px-3 py-2 pointer-events-none shadow-lg">
        <p className="text-xs font-semibold">Mapa de Demanda</p>
        <p className="text-[10px] text-muted-foreground">Clique nos bairros para detalhes</p>
      </div>

      {/* Legend - pill style */}
      <div className="absolute bottom-3 left-12 z-[1000] flex items-center gap-1 bg-card/80 backdrop-blur-xl border border-border rounded-full px-3 py-1.5 pointer-events-none shadow-md">
        <div className="w-2 h-2 rounded-full bg-red-500" />
        <span className="text-[10px] text-muted-foreground mr-2">Crítica</span>
        <div className="w-2 h-2 rounded-full bg-amber-500" />
        <span className="text-[10px] text-muted-foreground mr-2">Alta</span>
        <div className="w-2 h-2 rounded-full bg-indigo-400" />
        <span className="text-[10px] text-muted-foreground">Moderada</span>
      </div>
    </div>
  );
}
