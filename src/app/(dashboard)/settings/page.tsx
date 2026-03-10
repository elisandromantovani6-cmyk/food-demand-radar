"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Zap, Store, Clock, Truck, Bell, Shield, Palette, Save,
  MapPin, Phone, Mail, Globe, ChevronRight, CheckCircle2,
  AlertCircle, ExternalLink, CreditCard, Users, Crown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth";

const TABS = [
  { id: "restaurant", label: "Restaurante", icon: Store },
  { id: "hours", label: "Horarios", icon: Clock },
  { id: "delivery", label: "Delivery", icon: Truck },
  { id: "notifications", label: "Notificacoes", icon: Bell },
  { id: "integrations", label: "Integracoes", icon: Globe },
  { id: "plan", label: "Plano", icon: Crown },
] as const;

type TabId = (typeof TABS)[number]["id"];

const DAYS = [
  { id: "seg", label: "Segunda" },
  { id: "ter", label: "Terca" },
  { id: "qua", label: "Quarta" },
  { id: "qui", label: "Quinta" },
  { id: "sex", label: "Sexta" },
  { id: "sab", label: "Sabado" },
  { id: "dom", label: "Domingo" },
];

const DEFAULT_HOURS: Record<string, { open: string; close: string; enabled: boolean }> = {
  seg: { open: "18:00", close: "23:00", enabled: true },
  ter: { open: "18:00", close: "23:00", enabled: true },
  qua: { open: "18:00", close: "23:00", enabled: true },
  qui: { open: "18:00", close: "23:00", enabled: true },
  sex: { open: "18:00", close: "00:00", enabled: true },
  sab: { open: "18:00", close: "00:00", enabled: true },
  dom: { open: "18:00", close: "23:00", enabled: true },
};

const INTEGRATIONS = [
  { id: "google_ads", name: "Google Ads", description: "Campanhas de busca e display", status: "available" as const, category: "ads" },
  { id: "meta_ads", name: "Meta Ads", description: "Instagram e Facebook Ads", status: "available" as const, category: "ads" },
  { id: "whatsapp", name: "WhatsApp Business", description: "Mensagens e campanhas diretas", status: "coming_soon" as const, category: "messaging" },
  { id: "ifood", name: "iFood", description: "Dados de pedidos e analytics", status: "coming_soon" as const, category: "delivery" },
  { id: "rappi", name: "Rappi", description: "Integracao com marketplace", status: "coming_soon" as const, category: "delivery" },
  { id: "google_analytics", name: "Google Analytics", description: "Tracking de site e conversoes", status: "available" as const, category: "analytics" },
];

const PLANS = [
  {
    id: "starter",
    name: "Starter",
    price: 197,
    features: ["1 restaurante", "Dashboard basico", "Alertas de clima", "5 campanhas/mes", "Suporte email"],
    limits: { campaigns: 5, neighborhoods: 5, users: 1 },
  },
  {
    id: "pro",
    name: "Pro",
    price: 397,
    popular: true,
    features: ["3 restaurantes", "Dashboard completo", "Todos os alertas", "Campanhas ilimitadas", "Analise concorrencia", "Simulador de promocoes", "Suporte prioritario"],
    limits: { campaigns: -1, neighborhoods: 20, users: 5 },
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: 997,
    features: ["Restaurantes ilimitados", "API dedicada", "White-label", "ML preditivo avancado", "Integracao iFood/Rappi", "Gerente de conta", "SLA 99.9%"],
    limits: { campaigns: -1, neighborhoods: -1, users: -1 },
  },
];

export default function SettingsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabId>("restaurant");
  const [saved, setSaved] = useState(false);
  const [hours, setHours] = useState(DEFAULT_HOURS);

  const [restaurant, setRestaurant] = useState({
    name: "Pizza Express",
    category: "Pizzaria",
    address: "Av. Brasil, 1200 - Centro, Tangara da Serra - MT",
    phone: "(65) 99999-1234",
    email: "contato@pizzaexpress.com.br",
    city: "Tangara da Serra",
    state: "MT",
  });

  const [delivery, setDelivery] = useState({
    radius: 5,
    minOrder: 25,
    fee: 5,
    freeAbove: 60,
    estimateMin: 30,
    estimateMax: 50,
  });

  const [notifications, setNotifications] = useState({
    weatherAlerts: true,
    surgeAlerts: true,
    eventAlerts: true,
    campaignSuggestions: false,
    dailyReport: true,
    weeklyReport: true,
    competitorAlerts: false,
    lowStockAlerts: true,
  });

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const updateHour = (dayId: string, field: "open" | "close" | "enabled", value: string | boolean) => {
    setHours(prev => ({
      ...prev,
      [dayId]: { ...prev[dayId], [field]: value },
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Configuracoes</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Gerencie seu restaurante, integracao e preferencias</p>
        </div>
        <button
          onClick={handleSave}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all active:scale-[0.98]",
            saved
              ? "bg-emerald-600 text-white"
              : "bg-primary text-primary-foreground hover:opacity-90"
          )}
        >
          {saved ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          {saved ? "Salvo!" : "Salvar"}
        </button>
      </div>

      <div className="flex gap-6">
        {/* Sidebar de tabs */}
        <div className="w-56 shrink-0">
          <nav className="space-y-1">
            {TABS.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all text-left",
                    activeTab === tab.id
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                  )}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {tab.label}
                  <ChevronRight className={cn(
                    "w-3.5 h-3.5 ml-auto transition-transform",
                    activeTab === tab.id && "text-primary"
                  )} />
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 space-y-4">
          {/* Restaurant Tab */}
          {activeTab === "restaurant" && (
            <>
              <Card className="border-border/50">
                <CardContent className="p-5">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <Store className="w-4 h-4 text-primary" />
                    Dados do Restaurante
                  </h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Nome</Label>
                        <Input
                          id="name"
                          value={restaurant.name}
                          onChange={(e) => setRestaurant(r => ({ ...r, name: e.target.value }))}
                          className="mt-1 bg-secondary border-border"
                        />
                      </div>
                      <div>
                        <Label htmlFor="category">Categoria</Label>
                        <Input
                          id="category"
                          value={restaurant.category}
                          onChange={(e) => setRestaurant(r => ({ ...r, category: e.target.value }))}
                          className="mt-1 bg-secondary border-border"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="address">
                        <MapPin className="w-3 h-3 inline mr-1" />
                        Endereco
                      </Label>
                      <Input
                        id="address"
                        value={restaurant.address}
                        onChange={(e) => setRestaurant(r => ({ ...r, address: e.target.value }))}
                        className="mt-1 bg-secondary border-border"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="phone">
                          <Phone className="w-3 h-3 inline mr-1" />
                          Telefone
                        </Label>
                        <Input
                          id="phone"
                          value={restaurant.phone}
                          onChange={(e) => setRestaurant(r => ({ ...r, phone: e.target.value }))}
                          className="mt-1 bg-secondary border-border"
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">
                          <Mail className="w-3 h-3 inline mr-1" />
                          Email
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          value={restaurant.email}
                          onChange={(e) => setRestaurant(r => ({ ...r, email: e.target.value }))}
                          className="mt-1 bg-secondary border-border"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="city">Cidade</Label>
                        <Input
                          id="city"
                          value={restaurant.city}
                          onChange={(e) => setRestaurant(r => ({ ...r, city: e.target.value }))}
                          className="mt-1 bg-secondary border-border"
                        />
                      </div>
                      <div>
                        <Label htmlFor="state">Estado</Label>
                        <Input
                          id="state"
                          value={restaurant.state}
                          onChange={(e) => setRestaurant(r => ({ ...r, state: e.target.value }))}
                          className="mt-1 bg-secondary border-border"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/50">
                <CardContent className="p-5">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-primary" />
                    Conta
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between py-2">
                      <div>
                        <p className="text-sm font-medium">{user?.name ?? "Usuario"}</p>
                        <p className="text-xs text-muted-foreground">{user?.email ?? ""}</p>
                      </div>
                      <Badge variant="secondary" className="text-xs">Admin</Badge>
                    </div>
                    <div className="flex items-center justify-between py-2 border-t border-border/30">
                      <div>
                        <p className="text-sm font-medium">Alterar senha</p>
                        <p className="text-xs text-muted-foreground">Ultima alteracao: nunca</p>
                      </div>
                      <button className="text-xs text-primary hover:underline">Alterar</button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {/* Hours Tab */}
          {activeTab === "hours" && (
            <Card className="border-border/50">
              <CardContent className="p-5">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary" />
                  Horarios de Funcionamento
                </h3>
                <div className="space-y-2">
                  {DAYS.map(day => (
                    <div
                      key={day.id}
                      className={cn(
                        "flex items-center gap-4 py-3 px-3 rounded-lg transition-colors",
                        hours[day.id].enabled ? "bg-accent/20" : "opacity-50"
                      )}
                    >
                      <Switch
                        checked={hours[day.id].enabled}
                        onCheckedChange={(checked: boolean) => updateHour(day.id, "enabled", checked)}
                      />
                      <span className="w-24 text-sm font-medium">{day.label}</span>
                      <div className="flex items-center gap-2">
                        <Input
                          type="time"
                          value={hours[day.id].open}
                          onChange={(e) => updateHour(day.id, "open", e.target.value)}
                          disabled={!hours[day.id].enabled}
                          className="w-28 bg-secondary border-border text-center"
                        />
                        <span className="text-muted-foreground text-xs">ate</span>
                        <Input
                          type="time"
                          value={hours[day.id].close}
                          onChange={(e) => updateHour(day.id, "close", e.target.value)}
                          disabled={!hours[day.id].enabled}
                          className="w-28 bg-secondary border-border text-center"
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                  <p className="text-xs text-blue-400">
                    <AlertCircle className="w-3.5 h-3.5 inline mr-1" />
                    Os horarios sao usados pelo engine de demanda para calcular previsoes mais precisas.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Delivery Tab */}
          {activeTab === "delivery" && (
            <Card className="border-border/50">
              <CardContent className="p-5">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Truck className="w-4 h-4 text-primary" />
                  Configuracoes de Delivery
                </h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="radius">Raio de entrega (km)</Label>
                      <Input
                        id="radius"
                        type="number"
                        value={delivery.radius}
                        onChange={(e) => setDelivery(d => ({ ...d, radius: Number(e.target.value) }))}
                        className="mt-1 bg-secondary border-border"
                      />
                    </div>
                    <div>
                      <Label htmlFor="minOrder">Pedido minimo (R$)</Label>
                      <Input
                        id="minOrder"
                        type="number"
                        value={delivery.minOrder}
                        onChange={(e) => setDelivery(d => ({ ...d, minOrder: Number(e.target.value) }))}
                        className="mt-1 bg-secondary border-border"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="fee">Taxa de entrega (R$)</Label>
                      <Input
                        id="fee"
                        type="number"
                        value={delivery.fee}
                        onChange={(e) => setDelivery(d => ({ ...d, fee: Number(e.target.value) }))}
                        className="mt-1 bg-secondary border-border"
                      />
                    </div>
                    <div>
                      <Label htmlFor="freeAbove">Gratis acima de (R$)</Label>
                      <Input
                        id="freeAbove"
                        type="number"
                        value={delivery.freeAbove}
                        onChange={(e) => setDelivery(d => ({ ...d, freeAbove: Number(e.target.value) }))}
                        className="mt-1 bg-secondary border-border"
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="mb-2 block">Tempo estimado de entrega</Label>
                    <div className="flex items-center gap-3">
                      <Input
                        type="number"
                        value={delivery.estimateMin}
                        onChange={(e) => setDelivery(d => ({ ...d, estimateMin: Number(e.target.value) }))}
                        className="w-24 bg-secondary border-border text-center"
                      />
                      <span className="text-muted-foreground text-sm">a</span>
                      <Input
                        type="number"
                        value={delivery.estimateMax}
                        onChange={(e) => setDelivery(d => ({ ...d, estimateMax: Number(e.target.value) }))}
                        className="w-24 bg-secondary border-border text-center"
                      />
                      <span className="text-muted-foreground text-sm">minutos</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-border/30">
                  <h4 className="text-sm font-medium mb-3">Zonas de entrega</h4>
                  <div className="space-y-2">
                    {[
                      { zone: "Centro", km: "0-2km", fee: "Gratis" },
                      { zone: "Jardim Europa / Vila Alta", km: "2-4km", fee: "R$ 3,00" },
                      { zone: "Demais bairros", km: "4-5km", fee: "R$ 5,00" },
                    ].map(z => (
                      <div key={z.zone} className="flex items-center justify-between py-2 px-3 rounded-lg bg-accent/20 text-sm">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                          <span className="font-medium">{z.zone}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-muted-foreground text-xs">{z.km}</span>
                          <Badge variant="secondary" className="text-xs">{z.fee}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Notifications Tab */}
          {activeTab === "notifications" && (
            <Card className="border-border/50">
              <CardContent className="p-5">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Bell className="w-4 h-4 text-primary" />
                  Preferencias de Notificacao
                </h3>
                <div className="space-y-1">
                  {[
                    { key: "weatherAlerts" as const, label: "Alertas de clima", desc: "Chuva, frio e condicoes extremas" },
                    { key: "surgeAlerts" as const, label: "Alertas de pico", desc: "Quando Hunger Score ultrapassar 80" },
                    { key: "eventAlerts" as const, label: "Alertas de eventos", desc: "Jogos de futebol e eventos locais" },
                    { key: "campaignSuggestions" as const, label: "Sugestoes de campanha", desc: "Campanhas automaticas geradas pela IA" },
                    { key: "dailyReport" as const, label: "Relatorio diario", desc: "Resumo do dia as 23h" },
                    { key: "weeklyReport" as const, label: "Relatorio semanal", desc: "Performance da semana todo domingo" },
                    { key: "competitorAlerts" as const, label: "Alertas de concorrencia", desc: "Novos concorrentes ou mudancas" },
                    { key: "lowStockAlerts" as const, label: "Alertas de estoque", desc: "Quando ingredientes estiverem baixos" },
                  ].map(notif => (
                    <div key={notif.key} className="flex items-center justify-between py-3 px-3 rounded-lg hover:bg-accent/20 transition-colors">
                      <div>
                        <p className="text-sm font-medium">{notif.label}</p>
                        <p className="text-xs text-muted-foreground">{notif.desc}</p>
                      </div>
                      <Switch
                        checked={notifications[notif.key]}
                        onCheckedChange={(checked: boolean) =>
                          setNotifications(n => ({ ...n, [notif.key]: checked }))
                        }
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Integrations Tab */}
          {activeTab === "integrations" && (
            <div className="space-y-4">
              {(["ads", "delivery", "messaging", "analytics"] as const).map(category => {
                const categoryItems = INTEGRATIONS.filter(i => i.category === category);
                if (categoryItems.length === 0) return null;
                const categoryLabels = { ads: "Publicidade", delivery: "Delivery", messaging: "Mensagens", analytics: "Analytics" };
                return (
                  <Card key={category} className="border-border/50">
                    <CardContent className="p-5">
                      <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                        {categoryLabels[category]}
                      </h3>
                      <div className="space-y-2">
                        {categoryItems.map(integration => (
                          <div
                            key={integration.id}
                            className="flex items-center justify-between py-3 px-3 rounded-lg border border-border/30 hover:border-border/60 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-lg bg-accent/50 flex items-center justify-center">
                                <Globe className="w-4 h-4 text-muted-foreground" />
                              </div>
                              <div>
                                <p className="text-sm font-medium">{integration.name}</p>
                                <p className="text-xs text-muted-foreground">{integration.description}</p>
                              </div>
                            </div>
                            {integration.status === "available" ? (
                              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition-colors">
                                Conectar <ExternalLink className="w-3 h-3" />
                              </button>
                            ) : (
                              <Badge variant="secondary" className="text-[10px]">Em breve</Badge>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Plan Tab */}
          {activeTab === "plan" && (
            <div className="space-y-4">
              <Card className="border-border/50">
                <CardContent className="p-5">
                  <h3 className="font-semibold mb-1 flex items-center gap-2">
                    <Crown className="w-4 h-4 text-primary" />
                    Plano Atual
                  </h3>
                  <p className="text-xs text-muted-foreground mb-4">Gerencie sua assinatura e limites</p>

                  <div className="grid grid-cols-3 gap-4">
                    {PLANS.map(plan => (
                      <div
                        key={plan.id}
                        className={cn(
                          "relative rounded-xl border p-5 transition-all",
                          plan.id === "starter"
                            ? "border-primary/50 bg-primary/5 ring-1 ring-primary/20"
                            : "border-border/50 hover:border-border",
                          plan.popular && "border-emerald-500/50"
                        )}
                      >
                        {plan.popular && (
                          <Badge className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-emerald-600 text-white text-[10px] border-0">
                            Popular
                          </Badge>
                        )}
                        <h4 className="font-semibold text-lg">{plan.name}</h4>
                        <div className="mt-1 mb-4">
                          <span className="text-2xl font-bold tabular-nums">R$ {plan.price}</span>
                          <span className="text-sm text-muted-foreground">/mes</span>
                        </div>
                        <ul className="space-y-2 mb-5">
                          {plan.features.map(f => (
                            <li key={f} className="flex items-start gap-2 text-xs text-muted-foreground">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                              {f}
                            </li>
                          ))}
                        </ul>
                        <button
                          className={cn(
                            "w-full py-2 rounded-lg text-sm font-medium transition-all active:scale-[0.98]",
                            plan.id === "starter"
                              ? "bg-secondary text-foreground cursor-default"
                              : plan.popular
                                ? "bg-emerald-600 text-white hover:bg-emerald-700"
                                : "bg-primary text-primary-foreground hover:opacity-90"
                          )}
                          disabled={plan.id === "starter"}
                        >
                          {plan.id === "starter" ? "Plano atual" : "Upgrade"}
                        </button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/50">
                <CardContent className="p-5">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-primary" />
                    Uso Atual
                  </h3>
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { label: "Campanhas este mes", value: "3/5", pct: 60 },
                      { label: "Bairros monitorados", value: "5/5", pct: 100 },
                      { label: "Usuarios", value: "1/1", pct: 100 },
                    ].map(usage => (
                      <div key={usage.label} className="p-3 rounded-lg bg-accent/20">
                        <p className="text-xs text-muted-foreground mb-1">{usage.label}</p>
                        <p className="text-lg font-bold tabular-nums">{usage.value}</p>
                        <div className="mt-2 h-1.5 rounded-full bg-secondary overflow-hidden">
                          <div
                            className={cn(
                              "h-full rounded-full transition-all",
                              usage.pct >= 100 ? "bg-amber-500" : "bg-primary"
                            )}
                            style={{ width: `${Math.min(usage.pct, 100)}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
