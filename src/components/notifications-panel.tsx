"use client";

import { useState, useEffect, useCallback, createContext, useContext } from "react";
import { X, Bell, CloudRain, TrendingUp, Flame, AlertTriangle, Check, Megaphone } from "lucide-react";
import { cn } from "@/lib/utils";
import { trpc } from "@/lib/trpc";

// Context para compartilhar estado entre Header e Panel
interface NotificationsContextType {
  open: boolean;
  toggle: () => void;
  unreadCount: number;
}

const NotificationsContext = createContext<NotificationsContextType>({
  open: false,
  toggle: () => {},
  unreadCount: 0,
});

export function useNotifications() {
  return useContext(NotificationsContext);
}

const SEVERITY_CONFIG = {
  critical: { color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20", icon: AlertTriangle },
  high: { color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20", icon: TrendingUp },
  medium: { color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20", icon: CloudRain },
  low: { color: "text-muted-foreground", bg: "bg-accent/30", border: "border-border/50", icon: Bell },
} as const;

const TYPE_ICON = {
  weather: CloudRain,
  surge: Flame,
  event: Megaphone,
  trend: TrendingUp,
} as const;

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());

  const { data: alerts } = trpc.alerts.getActive.useQuery({}, {
    refetchInterval: 60000,
  });

  const acknowledge = trpc.alerts.acknowledge.useMutation();

  const notifications = alerts ?? [];
  const unreadCount = notifications.filter(a => !readIds.has(a.id)).length;

  const toggle = useCallback(() => setOpen(prev => !prev), []);

  const markRead = (id: string) => {
    setReadIds(prev => new Set(prev).add(id));
    acknowledge.mutate({ alertId: id });
  };

  const markAllRead = () => {
    notifications.forEach(n => {
      if (!readIds.has(n.id)) {
        setReadIds(prev => new Set(prev).add(n.id));
        acknowledge.mutate({ alertId: n.id });
      }
    });
  };

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) setOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open]);

  const timeAgo = (dateStr: string | Date) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "agora";
    if (mins < 60) return `${mins}min`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h`;
    return `${Math.floor(hours / 24)}d`;
  };

  return (
    <NotificationsContext.Provider value={{ open, toggle, unreadCount }}>
      {children}
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px]"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Panel */}
      <div className={cn(
        "fixed top-0 right-0 z-50 h-full w-full max-w-sm bg-card border-l border-border shadow-2xl shadow-black/30 transition-transform duration-300 ease-out",
        open ? "translate-x-0" : "translate-x-full"
      )}>
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-semibold">Notificações</h2>
            {unreadCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                {unreadCount}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="px-2 py-1 rounded text-[11px] text-muted-foreground hover:bg-accent/50 transition-colors"
              >
                Marcar todas lidas
              </button>
            )}
            <button
              onClick={() => setOpen(false)}
              className="p-1.5 rounded-lg hover:bg-accent/50 text-muted-foreground transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Notifications list */}
        <div className="overflow-y-auto h-[calc(100%-52px)]">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-6">
              <div className="w-12 h-12 rounded-xl bg-accent/50 flex items-center justify-center mb-3">
                <Bell className="w-5 h-5 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium mb-1">Tudo tranquilo</p>
              <p className="text-xs text-muted-foreground">Nenhuma notificação no momento</p>
            </div>
          ) : (
            <div className="divide-y divide-border/30">
              {notifications.map(notif => {
                const severity = SEVERITY_CONFIG[notif.severity as keyof typeof SEVERITY_CONFIG] ?? SEVERITY_CONFIG.low;
                const TypeIcon = TYPE_ICON[notif.type as keyof typeof TYPE_ICON] ?? Bell;
                const isRead = readIds.has(notif.id);

                return (
                  <div
                    key={notif.id}
                    className={cn(
                      "px-4 py-3 transition-colors relative",
                      isRead ? "opacity-60" : "hover:bg-accent/20"
                    )}
                  >
                    {/* Unread indicator */}
                    {!isRead && (
                      <span className="absolute left-1.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-primary" />
                    )}

                    <div className="flex gap-3">
                      <div className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                        severity.bg,
                      )}>
                        <TypeIcon className={cn("w-4 h-4", severity.color)} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-medium leading-snug">{notif.title}</p>
                          <span className="text-[10px] text-muted-foreground shrink-0 mt-0.5">
                            {timeAgo(notif.createdAt)}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                          {notif.description}
                        </p>

                        {/* Severity badge */}
                        <div className="flex items-center gap-2 mt-2">
                          <span className={cn(
                            "text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider",
                            severity.bg, severity.color, "border", severity.border
                          )}>
                            {notif.severity}
                          </span>
                          {!isRead && (
                            <button
                              onClick={() => markRead(notif.id)}
                              className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors"
                            >
                              <Check className="w-3 h-3" /> Marcar lida
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </NotificationsContext.Provider>
  );
}
