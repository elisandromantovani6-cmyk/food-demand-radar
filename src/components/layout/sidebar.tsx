"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth";
import {
  LayoutDashboard,
  Map,
  Target,
  TrendingUp,
  Flame,
  Megaphone,
  Navigation,
  BarChart3,
  Settings,
  PanelLeftClose,
  PanelLeft,
  Radar,
  LogOut,
} from "lucide-react";

const navGroups = [
  {
    label: "Overview",
    items: [
      { href: "/", label: "Command Center", icon: LayoutDashboard },
      { href: "/demand", label: "Demand Radar", icon: Map },
    ],
  },
  {
    label: "Intelligence",
    items: [
      { href: "/competition", label: "Concorrência", icon: Target },
      { href: "/forecast", label: "Previsão", icon: TrendingUp },
      { href: "/trends", label: "Tendências", icon: Flame },
    ],
  },
  {
    label: "Actions",
    items: [
      { href: "/campaigns", label: "Campanhas", icon: Megaphone },
      { href: "/expansion", label: "Expansão", icon: Navigation },
    ],
  },
  {
    label: "Insights",
    items: [
      { href: "/analytics", label: "Analytics", icon: BarChart3 },
    ],
  },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <aside
      className={cn(
        "flex flex-col h-screen border-r border-[var(--sidebar-border)] transition-[width] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
        "bg-[var(--sidebar)]",
        collapsed ? "w-[60px]" : "w-[240px]"
      )}
    >
      {/* Logo / Workspace */}
      <div className="flex items-center gap-3 px-3 py-4 border-b border-[var(--sidebar-border)]">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary shrink-0">
          <Radar className="w-4.5 h-4.5 text-primary-foreground" />
        </div>
        <div className={cn(
          "overflow-hidden transition-[max-width,opacity] duration-300",
          collapsed ? "max-w-0 opacity-0" : "max-w-[180px] opacity-100"
        )}>
          <h1 className="text-sm font-semibold tracking-tight whitespace-nowrap">Food Demand</h1>
          <p className="text-[10px] text-muted-foreground uppercase tracking-[0.1em] whitespace-nowrap">Radar</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-4">
        {navGroups.map((group) => (
          <div key={group.label}>
            {!collapsed && (
              <p className="px-3 pb-1.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground/60">
                {group.label}
              </p>
            )}
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "relative flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200",
                      isActive
                        ? "bg-[var(--color-glow)] text-primary font-medium shadow-[var(--shadow-glow)]"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                    )}
                    title={collapsed ? item.label : undefined}
                  >
                    {isActive && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-4 rounded-full bg-primary" />
                    )}
                    <item.icon className={cn("w-[18px] h-[18px] shrink-0", isActive && "text-primary")} />
                    <span className={cn(
                      "whitespace-nowrap overflow-hidden transition-[max-width,opacity] duration-300",
                      collapsed ? "max-w-0 opacity-0" : "max-w-[180px] opacity-100"
                    )}>
                      {item.label}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom section */}
      <div className="border-t border-[var(--sidebar-border)]">
        {/* Settings */}
        <Link
          href="/settings"
          className={cn(
            "flex items-center gap-3 px-3 py-2 mx-2 mt-2 rounded-lg text-sm transition-colors",
            pathname === "/settings"
              ? "bg-[var(--color-glow)] text-primary"
              : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
          )}
        >
          <Settings className="w-[18px] h-[18px] shrink-0" />
          <span className={cn(
            "whitespace-nowrap overflow-hidden transition-[max-width,opacity] duration-300",
            collapsed ? "max-w-0 opacity-0" : "max-w-[180px] opacity-100"
          )}>
            Configurações
          </span>
        </Link>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center gap-3 px-3 py-2 mx-2 mb-1 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors w-[calc(100%-16px)]"
        >
          {collapsed ? <PanelLeft className="w-[18px] h-[18px] shrink-0" /> : <PanelLeftClose className="w-[18px] h-[18px] shrink-0" />}
          <span className={cn(
            "whitespace-nowrap overflow-hidden transition-[max-width,opacity] duration-300",
            collapsed ? "max-w-0 opacity-0" : "max-w-[180px] opacity-100"
          )}>
            Recolher
          </span>
        </button>

        {/* User profile */}
        <div className="border-t border-[var(--sidebar-border)] p-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-chart-2 flex items-center justify-center text-primary-foreground text-xs font-bold shrink-0 ring-2 ring-primary/20">
              {user?.name?.charAt(0).toUpperCase() ?? "U"}
            </div>
            <div className={cn(
              "flex-1 min-w-0 overflow-hidden transition-[max-width,opacity] duration-300",
              collapsed ? "max-w-0 opacity-0" : "max-w-[180px] opacity-100"
            )}>
              <p className="text-sm font-medium truncate">{user?.name ?? "Usuário"}</p>
              <p className="text-[11px] text-muted-foreground truncate">{user?.email ?? ""}</p>
            </div>
            {!collapsed && (
              <button
                onClick={logout}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors shrink-0"
                title="Sair"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}
