"use client";

import { Card, CardContent } from "@/components/ui/card";
import { BarChart3, Sparkles } from "lucide-react";

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Analytics</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Análise histórica e insights detalhados</p>
      </div>

      <Card className="border-border/50">
        <CardContent className="p-16 text-center">
          <div className="relative w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <BarChart3 className="w-7 h-7 text-primary" />
            <Sparkles className="absolute -top-1 -right-1 w-4 h-4 text-amber-400" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Em breve</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
            O módulo de analytics detalhado está em desenvolvimento. Aqui você terá acesso a
            histórico de pedidos, análise de sazonalidade, insights de clientes e relatórios exportáveis.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
