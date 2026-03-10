"use client";

import { usePathname } from "next/navigation";
import { Bell, ChevronRight, Search } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useNotifications } from "@/components/notifications-panel";

const PAGE_TITLES: Record<string, string> = {
  "/": "Command Center",
  "/demand": "Demand Radar",
  "/competition": "Mapa de Concorrência",
  "/forecast": "Previsão de Demanda",
  "/trends": "Sabores em Tendência",
  "/menu": "Cardápio",
  "/campaigns": "Campanhas",
  "/expansion": "Radar de Expansão",
  "/analytics": "Analytics",
  "/settings": "Configurações",
};

export function Header() {
  const pathname = usePathname();
  const title = PAGE_TITLES[pathname] || "Food Demand Radar";
  const { toggle: toggleNotifications, unreadCount } = useNotifications();

  const { data: weather } = trpc.data.weather.useQuery(undefined, {
    refetchInterval: 300000,
  });

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-12 px-4 bg-background/80 backdrop-blur-xl border-b border-border">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1.5 text-sm">
        <span className="text-muted-foreground">Food Demand</span>
        <ChevronRight className="w-3 h-3 text-muted-foreground/40" />
        <span className="font-medium text-foreground">{title}</span>
      </nav>

      {/* Right section */}
      <div className="flex items-center gap-2">
        {/* Search trigger — opens CommandPalette via Ctrl+K */}
        <button
          onClick={() => window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", ctrlKey: true }))}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary border border-border text-sm text-muted-foreground hover:bg-accent transition-colors"
        >
          <Search className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Buscar...</span>
          <kbd className="hidden sm:inline ml-2 text-[10px] font-mono bg-muted px-1.5 py-0.5 rounded text-muted-foreground/70">Ctrl K</kbd>
        </button>

        {/* Weather compact */}
        {weather && (
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-secondary/50 text-xs text-muted-foreground">
            <span>{weather.temperature}°C</span>
            <span className="text-muted-foreground/40">|</span>
            <span className="capitalize truncate max-w-[80px]">{weather.description}</span>
          </div>
        )}

        {/* Notifications */}
        <button
          onClick={toggleNotifications}
          className="relative p-2 rounded-lg hover:bg-accent transition-colors"
        >
          <Bell className="w-4 h-4 text-muted-foreground" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-primary text-[9px] font-bold text-primary-foreground flex items-center justify-center">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}
