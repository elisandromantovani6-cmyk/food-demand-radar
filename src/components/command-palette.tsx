"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard, Map, Target, TrendingUp, Flame,
  Megaphone, Navigation, BarChart3, Settings, UtensilsCrossed,
  Search, ArrowRight, Keyboard,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface CommandItem {
  id: string;
  label: string;
  description?: string;
  icon: React.ComponentType<{ className?: string }>;
  href?: string;
  action?: () => void;
  category: string;
  keywords: string[];
}

const COMMANDS: CommandItem[] = [
  // Navegação
  { id: "home", label: "Command Center", description: "Dashboard principal", icon: LayoutDashboard, href: "/", category: "Navegação", keywords: ["home", "dashboard", "inicio", "principal"] },
  { id: "demand", label: "Demand Radar", description: "Mapa de demanda da cidade", icon: Map, href: "/demand", category: "Navegação", keywords: ["demanda", "mapa", "radar", "bairros"] },
  { id: "competition", label: "Concorrência", description: "Análise de concorrentes", icon: Target, href: "/competition", category: "Navegação", keywords: ["concorrencia", "competidores", "rivais"] },
  { id: "forecast", label: "Previsão", description: "Previsão de demanda", icon: TrendingUp, href: "/forecast", category: "Navegação", keywords: ["previsao", "forecast", "projeção"] },
  { id: "trends", label: "Tendências", description: "Sabores em tendência", icon: Flame, href: "/trends", category: "Navegação", keywords: ["tendencias", "sabores", "trending", "populares"] },
  { id: "menu", label: "Cardápio", description: "Gerenciar itens e combos", icon: UtensilsCrossed, href: "/menu", category: "Navegação", keywords: ["cardapio", "menu", "pizza", "itens", "combos", "precos"] },
  { id: "campaigns", label: "Campanhas", description: "Campanhas de marketing", icon: Megaphone, href: "/campaigns", category: "Navegação", keywords: ["campanhas", "marketing", "promocao", "anuncios"] },
  { id: "expansion", label: "Expansão", description: "Radar de expansão", icon: Navigation, href: "/expansion", category: "Navegação", keywords: ["expansao", "abrir", "nova loja", "bairro"] },
  { id: "analytics", label: "Analytics", description: "Métricas e relatórios", icon: BarChart3, href: "/analytics", category: "Navegação", keywords: ["analytics", "metricas", "relatorios", "dados"] },
  { id: "settings", label: "Configurações", description: "Preferências do sistema", icon: Settings, href: "/settings", category: "Navegação", keywords: ["configuracoes", "settings", "preferencias", "perfil"] },
];

function normalizeText(text: string): string {
  return text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const filtered = query.trim()
    ? COMMANDS.filter(cmd => {
        const q = normalizeText(query);
        return (
          normalizeText(cmd.label).includes(q) ||
          normalizeText(cmd.description ?? "").includes(q) ||
          cmd.keywords.some(k => normalizeText(k).includes(q))
        );
      })
    : COMMANDS;

  const executeCommand = useCallback((cmd: CommandItem) => {
    setOpen(false);
    setQuery("");
    if (cmd.href) router.push(cmd.href);
    else if (cmd.action) cmd.action();
  }, [router]);

  // Ctrl+K / Cmd+K toggle
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setOpen(prev => !prev);
        setQuery("");
        setSelectedIndex(0);
      }
      if (e.key === "Escape" && open) {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open]);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  // Reset selection when query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === "Enter" && filtered[selectedIndex]) {
      e.preventDefault();
      executeCommand(filtered[selectedIndex]);
    }
  };

  // Scroll selected into view
  useEffect(() => {
    if (listRef.current) {
      const selected = listRef.current.children[selectedIndex] as HTMLElement;
      selected?.scrollIntoView({ block: "nearest" });
    }
  }, [selectedIndex]);

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150"
        onClick={() => setOpen(false)}
      />

      {/* Palette */}
      <div className="fixed inset-x-0 top-[15%] z-50 mx-auto w-full max-w-lg px-4 animate-in slide-in-from-top-2 fade-in duration-200">
        <div className="overflow-hidden rounded-xl border border-border bg-card shadow-2xl shadow-black/40">
          {/* Search input */}
          <div className="flex items-center gap-3 px-4 border-b border-border">
            <Search className="w-4 h-4 text-muted-foreground shrink-0" />
            <input
              ref={inputRef}
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Buscar páginas, ações..."
              className="flex-1 py-3.5 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
            <kbd className="text-[10px] font-mono bg-muted px-1.5 py-0.5 rounded text-muted-foreground/70 shrink-0">ESC</kbd>
          </div>

          {/* Results */}
          <div ref={listRef} className="max-h-[340px] overflow-y-auto py-2">
            {filtered.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <p className="text-sm text-muted-foreground">Nenhum resultado para &ldquo;{query}&rdquo;</p>
              </div>
            ) : (
              filtered.map((cmd, idx) => (
                <button
                  key={cmd.id}
                  onClick={() => executeCommand(cmd)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={cn(
                    "flex items-center gap-3 w-full px-4 py-2.5 text-left text-sm transition-colors",
                    idx === selectedIndex
                      ? "bg-primary/10 text-foreground"
                      : "text-muted-foreground hover:bg-accent/50"
                  )}
                >
                  <cmd.icon className={cn("w-4 h-4 shrink-0", idx === selectedIndex && "text-primary")} />
                  <div className="flex-1 min-w-0">
                    <span className="font-medium text-foreground">{cmd.label}</span>
                    {cmd.description && (
                      <span className="ml-2 text-xs text-muted-foreground">{cmd.description}</span>
                    )}
                  </div>
                  {idx === selectedIndex && <ArrowRight className="w-3.5 h-3.5 text-primary shrink-0" />}
                </button>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-4 py-2 border-t border-border bg-muted/30">
            <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
              <span className="flex items-center gap-1"><Keyboard className="w-3 h-3" /> Navegar</span>
              <span>↵ Selecionar</span>
              <span>ESC Fechar</span>
            </div>
            <span className="text-[10px] text-muted-foreground">{filtered.length} resultados</span>
          </div>
        </div>
      </div>
    </>
  );
}
