"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CloudRain, Clock, Trophy, MapPin, Play, Pause, Zap, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { trpc } from "@/lib/trpc";

const typeIcons: Record<string, { icon: typeof CloudRain; color: string; border: string }> = {
  weather: { icon: CloudRain, color: "text-blue-400", border: "border-l-blue-500" },
  time: { icon: Clock, color: "text-amber-400", border: "border-l-amber-500" },
  event: { icon: Trophy, color: "text-emerald-400", border: "border-l-emerald-500" },
  hyperlocal: { icon: Zap, color: "text-purple-400", border: "border-l-purple-500" },
  weekend: { icon: Users, color: "text-pink-400", border: "border-l-pink-500" },
};

export default function CampaignsPage() {
  const [activatedIds, setActivatedIds] = useState<Set<string>>(new Set());
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Campanhas</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Campanhas sugeridas pela IA baseadas nos dados de demanda</p>
      </div>

      <Tabs defaultValue="suggested">
        <TabsList className="bg-secondary border border-border">
          <TabsTrigger value="suggested">Sugeridas ({campaigns.length})</TabsTrigger>
          <TabsTrigger value="active">Ativas ({activatedIds.size})</TabsTrigger>
          <TabsTrigger value="history">Historico</TabsTrigger>
        </TabsList>

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
                          campaign.priority === "media" ? "bg-amber-500/10 text-amber-400" :
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

        <TabsContent value="active" className="mt-4">
          {activatedIds.size === 0 ? (
            <Card className="border-border/50">
              <CardContent className="p-12 text-center text-muted-foreground">
                Nenhuma campanha ativa. Ative uma campanha sugerida para comecar.
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
                        <span className="ml-auto text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full">Ativa</span>
                      </div>
                      <p className="text-sm text-muted-foreground">&ldquo;{campaign.copyTitle}&rdquo;</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="history" className="mt-4">
          <Card className="border-border/50">
            <CardContent className="p-12 text-center text-muted-foreground">
              Historico de campanhas aparecera aqui apos as primeiras execucoes.
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
