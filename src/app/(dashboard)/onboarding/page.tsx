"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth";
import { Radar, Store, Pizza, MapPin, Check } from "lucide-react";
import { cn } from "@/lib/utils";

const FOOD_CATEGORIES = [
  { id: "pizza", label: "Pizzaria", icon: Pizza },
  { id: "hamburger", label: "Hamburgueria", icon: Store },
  { id: "japanese", label: "Japonesa", icon: Store },
  { id: "brazilian", label: "Brasileira", icon: Store },
  { id: "bakery", label: "Padaria/Confeitaria", icon: Store },
  { id: "other", label: "Outro", icon: Store },
];

const CITIES = [
  "Tangará da Serra - MT",
  "Cuiaba - MT",
  "Rondonopolis - MT",
  "Sinop - MT",
];

export default function OnboardingPage() {
  const { completeOnboarding } = useAuth();
  const [step, setStep] = useState(1);
  const [restaurantName, setRestaurantName] = useState("");
  const [foodCategory, setFoodCategory] = useState("pizza");
  const [city, setCity] = useState("Tangará da Serra - MT");

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2.5 mb-2">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-[var(--shadow-glow)]">
              <Radar className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold tracking-tight">Food Demand Radar</span>
          </div>
          <p className="text-sm text-muted-foreground">Configure em 3 passos</p>
        </div>

        {/* Progress */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2, 3].map(s => (
            <div key={s} className="flex items-center gap-2">
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300",
                s < step ? "bg-emerald-500 text-white" :
                s === step ? "bg-primary text-primary-foreground shadow-[var(--shadow-glow)]" :
                "bg-secondary text-muted-foreground"
              )}>
                {s < step ? <Check className="w-4 h-4" /> : s}
              </div>
              {s < 3 && <div className={cn("w-12 h-0.5 transition-colors", s < step ? "bg-emerald-500" : "bg-border")} />}
            </div>
          ))}
        </div>

        <Card className="border-border/50 bg-card/80 backdrop-blur-xl shadow-[var(--shadow-lg)]">
          <CardContent className="p-6">
            {step === 1 && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold">Como se chama seu restaurante?</h2>
                <div className="space-y-2">
                  <Label htmlFor="restaurant">Nome do Restaurante</Label>
                  <Input id="restaurant" placeholder="Ex: Pizzaria do Joao" value={restaurantName} onChange={(e) => setRestaurantName(e.target.value)} className="bg-secondary border-border" />
                </div>
                <button onClick={() => setStep(2)} disabled={!restaurantName.trim()} className="w-full py-2.5 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-all active:scale-[0.98] disabled:opacity-50">
                  Próximo
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold">Qual o tipo de cozinha?</h2>
                <div className="grid grid-cols-2 gap-2">
                  {FOOD_CATEGORIES.map(cat => {
                    const Icon = cat.icon;
                    return (
                      <button key={cat.id} onClick={() => setFoodCategory(cat.id)} className={cn(
                        "flex items-center gap-2 p-3 rounded-lg border transition-all text-left text-sm",
                        foodCategory === cat.id ? "border-primary bg-primary/10 text-primary" : "border-border hover:border-border/80"
                      )}>
                        <Icon className="w-4 h-4 shrink-0" />
                        <span className="font-medium">{cat.label}</span>
                      </button>
                    );
                  })}
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setStep(1)} className="flex-1 py-2.5 bg-secondary rounded-lg font-medium hover:bg-accent transition-all active:scale-[0.98]">Voltar</button>
                  <button onClick={() => setStep(3)} className="flex-1 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-all active:scale-[0.98]">Próximo</button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold">Em qual cidade?</h2>
                <div className="space-y-2">
                  {CITIES.map(c => (
                    <button key={c} onClick={() => setCity(c)} className={cn(
                      "w-full flex items-center gap-3 p-3 rounded-lg border transition-all text-left",
                      city === c ? "border-primary bg-primary/10 text-primary" : "border-border hover:border-border/80"
                    )}>
                      <MapPin className="w-4 h-4 shrink-0" />
                      <span className="text-sm font-medium">{c}</span>
                    </button>
                  ))}
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setStep(2)} className="flex-1 py-2.5 bg-secondary rounded-lg font-medium hover:bg-accent transition-all active:scale-[0.98]">Voltar</button>
                  <button onClick={() => completeOnboarding({ restaurantName, foodCategory, city })} className="flex-1 py-2.5 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-all active:scale-[0.98]">Começar</button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
