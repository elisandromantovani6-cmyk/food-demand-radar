"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CloudRain, Clock, Trophy, MapPin, Play, Pause, Zap, Users, Plus, X, Send, Sparkles, FlaskConical, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { trpc } from "@/lib/trpc";

const typeIcons: Record<string, { icon: typeof CloudRain; color: string; border: string }> = {
  weather: { icon: CloudRain, color: "text-blue-400", border: "border-l-blue-500" },
  time_based: { icon: Clock, color: "text-amber-400", border: "border-l-amber-500" },
  event: { icon: Trophy, color: "text-emerald-400", border: "border-l-emerald-500" },
  hyperlocal: { icon: Zap, color: "text-purple-400", border: "border-l-purple-500" },
  weekend: { icon: Users, color: "text-pink-400", border: "border-l-pink-500" },
  custom: { icon: Send, color: "text-cyan-400", border: "border-l-cyan-500" },
};

interface CustomCampaign {
  id: string;
  title: string;
  copyTitle: string;
  copyBody: string;
  offer: string;
  budget: string;
  target: string;
  platform: string;
  status: "rascunho" | "ativa" | "pausada";
  createdAt: Date;
}

const PLATFORMS = [
  { id: "whatsapp", label: "WhatsApp" },
  { id: "instagram", label: "Instagram" },
  { id: "google_ads", label: "Google Ads" },
  { id: "meta_ads", label: "Meta Ads" },
];

export default function CampaignsPage() {
  const [activatedIds, setActivatedIds] = useState<Set<string>>(new Set());
  const [showCreate, setShowCreate] = useState(false);
  const [customCampaigns, setCustomCampaigns] = useState<CustomCampaign[]>([]);
  const [form, setForm] = useState({
    title: "",
    copyTitle: "",
    copyBody: "",
    offer: "",
    budget: "",
    target: "Raio de 3km do restaurante",
    platform: "whatsapp",
  });

  const { data, isLoading } = trpc.campaigns.getSuggested.useQuery(
    {},
    { refetchInterval: 120000 }
  );

  const campaigns = data ?? [];

  const toggleCampaign = (id: string) => {
    setActivatedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleCreateCampaign = () => {
    if (!form.title.trim() || !form.copyTitle.trim()) return;
    const newCampaign: CustomCampaign = {
      id: `custom-${Date.now()}`,
      ...form,
      status: "rascunho",
      createdAt: new Date(),
    };
    setCustomCampaigns((prev) => [newCampaign, ...prev]);
    setForm({ title: "", copyTitle: "", copyBody: "", offer: "", budget: "", target: "Raio de 3km do restaurante", platform: "whatsapp" });
    setShowCreate(false);
  };

  const activateCustom = (id: string) => {
    setCustomCampaigns((prev) =>
      prev.map((c) => c.id === id ? { ...c, status: c.status === "ativa" ? "pausada" : "ativa" } : c)
    );
  };

  const deleteCustom = (id: string) => {
    setCustomCampaigns((prev) => prev.filter((c) => c.id !== id));
  };

  const allActiveCount = activatedIds.size + customCampaigns.filter(c => c.status === "ativa").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Campanhas</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Gerencie campanhas automáticas e manuais</p>
        </div>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all active:scale-[0.98]",
            showCreate
              ? "bg-secondary text-foreground hover:bg-accent"
              : "bg-primary text-primary-foreground hover:opacity-90"
          )}
        >
          {showCreate ? <><X className="w-4 h-4" /> Cancelar</> : <><Plus className="w-4 h-4" /> Nova Campanha</>}
        </button>
      </div>

      {/* Formulário de criação */}
      {showCreate && (
        <Card className="border-border/50 border-l-2 border-l-cyan-500 animate-fade-up">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                <Send className="w-4 h-4 text-cyan-400" />
              </div>
              <h3 className="font-semibold text-sm">Criar Campanha Manual</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div>
                  <Label className="text-xs">Nome da Campanha</Label>
                  <Input
                    placeholder="Ex: Promoção de Terça"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="mt-1 bg-secondary border-border"
                  />
                </div>
                <div>
                  <Label className="text-xs">Título do Anúncio</Label>
                  <Input
                    placeholder="Ex: Terça da Pizza!"
                    value={form.copyTitle}
                    onChange={(e) => setForm({ ...form, copyTitle: e.target.value })}
                    className="mt-1 bg-secondary border-border"
                  />
                </div>
                <div>
                  <Label className="text-xs">Texto do Anúncio</Label>
                  <textarea
                    placeholder="Descreva a oferta em detalhes..."
                    value={form.copyBody}
                    onChange={(e) => setForm({ ...form, copyBody: e.target.value })}
                    rows={3}
                    className="w-full mt-1 px-3 py-2 rounded-lg bg-secondary border border-border text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <Label className="text-xs">Oferta / Desconto</Label>
                  <Input
                    placeholder="Ex: 2 pizzas por R$49,90"
                    value={form.offer}
                    onChange={(e) => setForm({ ...form, offer: e.target.value })}
                    className="mt-1 bg-secondary border-border"
                  />
                </div>
                <div>
                  <Label className="text-xs">Budget Diário</Label>
                  <Input
                    placeholder="Ex: R$ 50-80/dia"
                    value={form.budget}
                    onChange={(e) => setForm({ ...form, budget: e.target.value })}
                    className="mt-1 bg-secondary border-border"
                  />
                </div>
                <div>
                  <Label className="text-xs">Plataforma</Label>
                  <div className="flex flex-wrap gap-2 mt-1.5">
                    {PLATFORMS.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => setForm({ ...form, platform: p.id })}
                        className={cn(
                          "px-3 py-1.5 rounded-lg text-xs font-medium border transition-all",
                          form.platform === p.id
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border hover:border-border/80 text-muted-foreground"
                        )}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <Label className="text-xs">Área de Alcance</Label>
                  <Input
                    placeholder="Ex: Raio de 5km do restaurante"
                    value={form.target}
                    onChange={(e) => setForm({ ...form, target: e.target.value })}
                    className="mt-1 bg-secondary border-border"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-border/30">
              <button
                onClick={() => setShowCreate(false)}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-secondary hover:bg-accent transition-all active:scale-[0.98]"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateCampaign}
                disabled={!form.title.trim() || !form.copyTitle.trim()}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-primary text-primary-foreground hover:opacity-90 transition-all active:scale-[0.98] disabled:opacity-50"
              >
                Criar Campanha
              </button>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="suggested">
        <TabsList className="bg-secondary border border-border">
          <TabsTrigger value="suggested">
            <Sparkles className="w-3 h-3 mr-1.5" />
            Sugeridas ({campaigns.length})
          </TabsTrigger>
          <TabsTrigger value="custom">Minhas ({customCampaigns.length})</TabsTrigger>
          <TabsTrigger value="active">Ativas ({allActiveCount})</TabsTrigger>
          <TabsTrigger value="simulator">
            <FlaskConical className="w-3 h-3 mr-1.5" />
            Simulador
          </TabsTrigger>
          <TabsTrigger value="history">Histórico</TabsTrigger>
        </TabsList>

        {/* Sugeridas pela IA */}
        <TabsContent value="suggested" className="mt-4">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-72 rounded-xl animate-shimmer" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {campaigns.map((campaign) => {
                const isActive = activatedIds.has(campaign.id);
                const iconSet = typeIcons[campaign.type] ?? typeIcons.weather;
                const Icon = iconSet.icon;
                return (
                  <Card key={campaign.id} className={cn(
                    "border-border/50 border-l-2 transition-all duration-300",
                    iconSet.border,
                    isActive && "ring-1 ring-primary/30"
                  )}>
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div className="w-9 h-9 rounded-lg bg-accent/50 flex items-center justify-center">
                          <Icon className={cn("w-4 h-4", iconSet.color)} />
                        </div>
                        <span className={cn(
                          "text-[10px] font-semibold px-2 py-0.5 rounded-full",
                          campaign.priority === "alta" ? "bg-red-500/10 text-red-400" :
                          campaign.priority === "média" ? "bg-amber-500/10 text-amber-400" :
                          "bg-muted text-muted-foreground"
                        )}>
                          {campaign.priority}
                        </span>
                      </div>

                      <h3 className="font-semibold text-sm mb-2">{campaign.title}</h3>

                      <div className="bg-accent/30 rounded-lg p-3 mb-3 border border-border/30">
                        <p className="text-sm font-medium">&ldquo;{campaign.copyTitle}&rdquo;</p>
                        <p className="text-[11px] text-muted-foreground mt-1">{campaign.copyBody}</p>
                      </div>

                      <div className="space-y-1.5 text-[11px] text-muted-foreground mb-4">
                        <div className="flex justify-between">
                          <span>Oferta</span>
                          <span className="font-medium text-foreground">{campaign.offer.description}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Alcance</span>
                          <span className="font-medium text-foreground">{campaign.estimatedReach.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Budget</span>
                          <span className="font-medium text-foreground">{campaign.estimatedBudget}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Target</span>
                          <div className="flex items-center gap-1">
                            <MapPin className="w-2.5 h-2.5" />
                            <span className="font-medium text-foreground">{campaign.targetDescription}</span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => toggleCampaign(campaign.id)}
                        className={cn(
                          "w-full flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all active:scale-[0.98]",
                          isActive
                            ? "bg-secondary text-foreground hover:bg-accent"
                            : "bg-primary text-primary-foreground hover:opacity-90"
                        )}
                      >
                        {isActive ? <><Pause className="w-3.5 h-3.5" /> Pausar</> : <><Play className="w-3.5 h-3.5" /> Ativar</>}
                      </button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* Minhas campanhas (manuais) */}
        <TabsContent value="custom" className="mt-4">
          {customCampaigns.length === 0 ? (
            <Card className="border-border/50">
              <CardContent className="p-12 text-center">
                <div className="w-12 h-12 rounded-xl bg-accent/50 flex items-center justify-center mx-auto mb-3">
                  <Plus className="w-5 h-5 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium mb-1">Nenhuma campanha criada</p>
                <p className="text-xs text-muted-foreground mb-4">Clique em &ldquo;Nova Campanha&rdquo; para criar sua primeira.</p>
                <button
                  onClick={() => setShowCreate(true)}
                  className="px-4 py-2 rounded-lg text-sm font-medium bg-primary text-primary-foreground hover:opacity-90 transition-all active:scale-[0.98]"
                >
                  <Plus className="w-3.5 h-3.5 inline mr-1.5" />
                  Criar Campanha
                </button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {customCampaigns.map((c) => (
                <Card key={c.id} className={cn(
                  "border-border/50 border-l-2 border-l-cyan-500 transition-all duration-300",
                  c.status === "ativa" && "ring-1 ring-emerald-500/30"
                )}>
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-9 h-9 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                        <Send className="w-4 h-4 text-cyan-400" />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          "text-[10px] font-semibold px-2 py-0.5 rounded-full",
                          c.status === "ativa" ? "bg-emerald-500/10 text-emerald-400" :
                          c.status === "pausada" ? "bg-amber-500/10 text-amber-400" :
                          "bg-muted text-muted-foreground"
                        )}>
                          {c.status}
                        </span>
                        <button
                          onClick={() => deleteCustom(c.id)}
                          className="p-1 rounded hover:bg-accent/50 text-muted-foreground hover:text-red-400 transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <h3 className="font-semibold text-sm mb-2">{c.title}</h3>

                    <div className="bg-accent/30 rounded-lg p-3 mb-3 border border-border/30">
                      <p className="text-sm font-medium">&ldquo;{c.copyTitle}&rdquo;</p>
                      {c.copyBody && <p className="text-[11px] text-muted-foreground mt-1">{c.copyBody}</p>}
                    </div>

                    <div className="space-y-1.5 text-[11px] text-muted-foreground mb-4">
                      {c.offer && (
                        <div className="flex justify-between">
                          <span>Oferta</span>
                          <span className="font-medium text-foreground">{c.offer}</span>
                        </div>
                      )}
                      {c.budget && (
                        <div className="flex justify-between">
                          <span>Budget</span>
                          <span className="font-medium text-foreground">{c.budget}</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <span>Plataforma</span>
                        <span className="font-medium text-foreground capitalize">{c.platform.replace("_", " ")}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Target</span>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-2.5 h-2.5" />
                          <span className="font-medium text-foreground">{c.target}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => activateCustom(c.id)}
                      className={cn(
                        "w-full flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all active:scale-[0.98]",
                        c.status === "ativa"
                          ? "bg-secondary text-foreground hover:bg-accent"
                          : "bg-primary text-primary-foreground hover:opacity-90"
                      )}
                    >
                      {c.status === "ativa" ? <><Pause className="w-3.5 h-3.5" /> Pausar</> : <><Play className="w-3.5 h-3.5" /> Ativar</>}
                    </button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Ativas */}
        <TabsContent value="active" className="mt-4">
          {allActiveCount === 0 ? (
            <Card className="border-border/50">
              <CardContent className="p-12 text-center text-muted-foreground">
                Nenhuma campanha ativa. Ative uma campanha sugerida ou crie a sua.
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {campaigns.filter(c => activatedIds.has(c.id)).map((campaign) => {
                const iconSet = typeIcons[campaign.type] ?? typeIcons.weather;
                const Icon = iconSet.icon;
                return (
                  <Card key={campaign.id} className="border-border/50 ring-1 ring-emerald-500/30">
                    <CardContent className="p-5">
                      <div className="flex items-center gap-2 mb-3">
                        <Icon className={cn("w-4 h-4", iconSet.color)} />
                        <span className="font-semibold text-sm">{campaign.title}</span>
                        <span className="ml-auto text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full">ativa</span>
                      </div>
                      <p className="text-sm text-muted-foreground">&ldquo;{campaign.copyTitle}&rdquo;</p>
                      <button
                        onClick={() => toggleCampaign(campaign.id)}
                        className="w-full mt-3 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium bg-secondary hover:bg-accent transition-all active:scale-[0.98]"
                      >
                        <Pause className="w-3.5 h-3.5" /> Pausar
                      </button>
                    </CardContent>
                  </Card>
                );
              })}
              {customCampaigns.filter(c => c.status === "ativa").map((c) => (
                <Card key={c.id} className="border-border/50 ring-1 ring-emerald-500/30">
                  <CardContent className="p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <Send className="w-4 h-4 text-cyan-400" />
                      <span className="font-semibold text-sm">{c.title}</span>
                      <span className="ml-auto text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full">ativa</span>
                    </div>
                    <p className="text-sm text-muted-foreground">&ldquo;{c.copyTitle}&rdquo;</p>
                    <button
                      onClick={() => activateCustom(c.id)}
                      className="w-full mt-3 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium bg-secondary hover:bg-accent transition-all active:scale-[0.98]"
                    >
                      <Pause className="w-3.5 h-3.5" /> Pausar
                    </button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Simulador de Promoções */}
        <TabsContent value="simulator" className="mt-4">
          <PromotionSimulator />
        </TabsContent>

        {/* Histórico */}
        <TabsContent value="history" className="mt-4">
          <Card className="border-border/50">
            <CardContent className="p-12 text-center text-muted-foreground">
              Histórico de campanhas aparecerá aqui após as primeiras execuções.
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

/** Simulador de Promoções — testa promoções antes de lançar */
function PromotionSimulator() {
  const [sim, setSim] = useState({
    type: "desconto",
    value: "15",
    budget: "200",
    duration: "3",
    platform: "instagram",
    targetArea: "Centro",
  });
  const [result, setResult] = useState<{
    reachEstimate: number;
    clicksEstimate: number;
    ordersEstimate: number;
    revenueEstimate: number;
    costPerOrder: number;
    roi: number;
    breakEven: number;
  } | null>(null);

  const simulate = () => {
    const budget = parseFloat(sim.budget) || 200;
    const duration = parseInt(sim.duration) || 3;
    const discountPct = parseFloat(sim.value) || 15;

    // Estimativas baseadas em benchmarks de marketing gastronômico
    const platformMultiplier = sim.platform === "google_ads" ? 1.3 : sim.platform === "meta_ads" ? 1.1 : sim.platform === "instagram" ? 0.9 : 0.7;
    const dailyBudget = budget / duration;

    // CPM médio delivery: R$15-35 dependendo da plataforma
    const cpm = (18 + Math.random() * 12) / platformMultiplier;
    const reachEstimate = Math.round((budget / cpm) * 1000);

    // CTR médio food: 2-5%
    const ctr = (0.025 + Math.random() * 0.02) * platformMultiplier;
    const clicksEstimate = Math.round(reachEstimate * ctr);

    // Conversão média food delivery: 3-8%
    const conversionRate = (0.04 + Math.random() * 0.03) * (1 + discountPct / 100);
    const ordersEstimate = Math.round(clicksEstimate * conversionRate);

    // Ticket médio baseado no desconto
    const avgTicket = 45 * (1 - discountPct / 200); // Desconto reduz ticket
    const revenueEstimate = Math.round(ordersEstimate * avgTicket * 100) / 100;

    // Custo real (budget + desconto dado)
    const discountCost = ordersEstimate * avgTicket * (discountPct / 100);
    const totalCost = budget + discountCost;
    const costPerOrder = ordersEstimate > 0 ? Math.round((totalCost / ordersEstimate) * 100) / 100 : 0;

    // ROI
    const profit = revenueEstimate * 0.6 - totalCost; // 60% margem bruta média
    const roi = totalCost > 0 ? Math.round((profit / totalCost) * 100) : 0;

    // Break-even: pedidos necessários para pagar o investimento
    const marginPerOrder = avgTicket * 0.6 - (avgTicket * discountPct / 100);
    const breakEven = marginPerOrder > 0 ? Math.ceil(budget / marginPerOrder) : 999;

    setResult({
      reachEstimate,
      clicksEstimate,
      ordersEstimate: Math.max(ordersEstimate, 1),
      revenueEstimate,
      costPerOrder,
      roi,
      breakEven,
    });
  };

  return (
    <div className="space-y-4">
      <Card className="border-border/50 border-l-2 border-l-violet-500">
        <CardContent className="p-5">
          <h3 className="text-sm font-semibold flex items-center gap-2 mb-4">
            <FlaskConical className="w-4 h-4 text-violet-400" />
            Simulador de Promoções
          </h3>
          <p className="text-xs text-muted-foreground mb-4">
            Teste diferentes cenários de promoção e veja estimativas de resultado antes de lançar.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-3">
              <div>
                <Label className="text-xs">Tipo de Promoção</Label>
                <select
                  value={sim.type}
                  onChange={e => setSim({ ...sim, type: e.target.value })}
                  className="w-full mt-1 bg-secondary border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="desconto">Desconto percentual</option>
                  <option value="frete_gratis">Entrega grátis</option>
                  <option value="combo">Combo especial</option>
                  <option value="segunda_pizza">2ª pizza com desconto</option>
                </select>
              </div>
              <div>
                <Label className="text-xs">Valor do Desconto (%)</Label>
                <Input
                  type="number"
                  value={sim.value}
                  onChange={e => setSim({ ...sim, value: e.target.value })}
                  className="mt-1 bg-secondary border-border"
                  placeholder="15"
                />
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <Label className="text-xs">Orçamento Total (R$)</Label>
                <Input
                  type="number"
                  value={sim.budget}
                  onChange={e => setSim({ ...sim, budget: e.target.value })}
                  className="mt-1 bg-secondary border-border"
                  placeholder="200"
                />
              </div>
              <div>
                <Label className="text-xs">Duração (dias)</Label>
                <Input
                  type="number"
                  value={sim.duration}
                  onChange={e => setSim({ ...sim, duration: e.target.value })}
                  className="mt-1 bg-secondary border-border"
                  placeholder="3"
                />
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <Label className="text-xs">Plataforma</Label>
                <select
                  value={sim.platform}
                  onChange={e => setSim({ ...sim, platform: e.target.value })}
                  className="w-full mt-1 bg-secondary border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  {PLATFORMS.map(p => (
                    <option key={p.id} value={p.id}>{p.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label className="text-xs">Área Alvo</Label>
                <Input
                  value={sim.targetArea}
                  onChange={e => setSim({ ...sim, targetArea: e.target.value })}
                  className="mt-1 bg-secondary border-border"
                  placeholder="Centro, Vila Alta..."
                />
              </div>
            </div>
          </div>

          <button
            onClick={simulate}
            className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium bg-violet-600 text-white hover:bg-violet-700 transition-all active:scale-[0.98]"
          >
            <FlaskConical className="w-4 h-4" /> Simular Resultado
          </button>
        </CardContent>
      </Card>

      {/* Resultado da simulação */}
      {result && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 animate-fade-up">
          <Card className="border-border/50">
            <CardContent className="p-4 text-center">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Alcance Estimado</p>
              <p className="text-xl font-bold tabular-nums">{result.reachEstimate.toLocaleString("pt-BR")}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">pessoas</p>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="p-4 text-center">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Cliques</p>
              <p className="text-xl font-bold tabular-nums text-blue-400">{result.clicksEstimate.toLocaleString("pt-BR")}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">visitas</p>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="p-4 text-center">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Pedidos</p>
              <p className="text-xl font-bold tabular-nums text-emerald-400">{result.ordersEstimate}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">estimados</p>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="p-4 text-center">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Receita</p>
              <p className="text-xl font-bold tabular-nums text-emerald-400">R$ {result.revenueEstimate.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">estimada</p>
            </CardContent>
          </Card>

          {/* Métricas avançadas */}
          <Card className="border-border/50 col-span-2">
            <CardContent className="p-4">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">Análise Financeira</p>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Custo por Pedido</span>
                  <span className="font-semibold tabular-nums">R$ {result.costPerOrder.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Break-even</span>
                  <span className="font-semibold tabular-nums">{result.breakEven} pedidos</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">ROI Estimado</span>
                  <span className={cn(
                    "font-bold tabular-nums",
                    result.roi >= 0 ? "text-emerald-400" : "text-red-400"
                  )}>
                    {result.roi > 0 ? "+" : ""}{result.roi}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className={cn(
            "border-border/50 col-span-2 border-l-2",
            result.roi >= 50 ? "border-l-emerald-500" : result.roi >= 0 ? "border-l-amber-500" : "border-l-red-500"
          )}>
            <CardContent className="p-4">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Recomendação</p>
              {result.roi >= 50 ? (
                <div className="flex items-start gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-emerald-400">Excelente oportunidade!</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      ROI de {result.roi}% indica alta probabilidade de retorno. Recomendamos lançar esta promoção.
                    </p>
                  </div>
                </div>
              ) : result.roi >= 0 ? (
                <div className="flex items-start gap-2">
                  <FlaskConical className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-amber-400">Viável com ajustes</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      ROI de {result.roi}% é positivo mas pode melhorar. Tente reduzir o desconto ou aumentar o orçamento para maior alcance.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-2">
                  <X className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-red-400">Risco de prejuízo</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      ROI negativo de {result.roi}%. Reduza o desconto, escolha uma plataforma mais eficiente ou aumente o ticket médio.
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
