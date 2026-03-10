"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Zap } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Configurações</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Gerencie seu restaurante e integrações</p>
      </div>

      <Card className="border-border/50">
        <CardContent className="p-5">
          <h3 className="font-semibold mb-4">Restaurante</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Nome</Label>
                <Input id="name" defaultValue="Pizza Express" className="mt-1 bg-secondary border-border" />
              </div>
              <div>
                <Label htmlFor="category">Categoria</Label>
                <Input id="category" defaultValue="Pizzaria" className="mt-1 bg-secondary border-border" />
              </div>
            </div>
            <div>
              <Label htmlFor="address">Endereço</Label>
              <Input id="address" defaultValue="Av. Brasil, 1200 - Centro, Tangara da Serra - MT" className="mt-1 bg-secondary border-border" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="radius">Raio de Delivery (km)</Label>
                <Input id="radius" type="number" defaultValue="5" className="mt-1 bg-secondary border-border" />
              </div>
              <div>
                <Label htmlFor="city">Cidade</Label>
                <Input id="city" defaultValue="Tangara da Serra" className="mt-1 bg-secondary border-border" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/50">
        <CardContent className="p-5">
          <h3 className="font-semibold mb-4">Integrações</h3>
          <div className="space-y-3">
            {[
              { name: "Google Ads", status: "pendente" },
              { name: "Meta Ads", status: "pendente" },
              { name: "WhatsApp Business", status: "pendente" },
              { name: "iFood (dados)", status: "pendente" },
            ].map((integration) => (
              <div key={integration.name} className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
                <span className="text-sm">{integration.name}</span>
                <Badge variant="secondary" className="text-xs">{integration.status}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/50">
        <CardContent className="p-5">
          <h3 className="font-semibold mb-4">Notificações</h3>
          <div className="space-y-4">
            {[
              { label: "Alertas de clima", description: "Receber quando chuva ou frio detectado", defaultChecked: true },
              { label: "Alertas de surge", description: "Receber quando Hunger Score ultrapassar 80", defaultChecked: true },
              { label: "Alertas de eventos", description: "Receber quando eventos detectados na regiao", defaultChecked: true },
              { label: "Sugestoes de campanha", description: "Receber sugestoes automaticas de campanhas", defaultChecked: false },
            ].map((notif) => (
              <div key={notif.label} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{notif.label}</p>
                  <p className="text-xs text-muted-foreground">{notif.description}</p>
                </div>
                <Switch defaultChecked={notif.defaultChecked} />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/50 overflow-hidden">
        <CardContent className="p-5">
          <h3 className="font-semibold mb-4">Plano Atual</h3>
          <div className="flex items-center justify-between p-4 bg-primary/10 border border-primary/20 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-primary/20 flex items-center justify-center">
                <Zap className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-primary">Starter</p>
                <p className="text-sm text-primary/70">R$ 197/mes</p>
              </div>
            </div>
            <button className="px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:opacity-90 transition-all active:scale-[0.98]">
              Upgrade
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
