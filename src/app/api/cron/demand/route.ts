import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const now = new Date();
    const hour = now.getHours();
    const day = now.getDay();

    // Multiplicadores de demanda por hora
    const hourMultiplier = getHourMultiplier(hour);
    const dayMultiplier = getDayMultiplier(day);

    const { data: tenants } = await supabaseAdmin
      .from("tenants")
      .select("id")
      .eq("onboarding_completed", true);

    let updated = 0;

    for (const tenant of tenants ?? []) {
      const { data: neighborhoods } = await supabaseAdmin
        .from("neighborhoods")
        .select("id, population, avg_income")
        .eq("tenant_id", tenant.id);

      for (const n of neighborhoods ?? []) {
        const pop = n.population ?? 3000;
        const income = n.avg_income ?? 2500;

        // Base score from population and income
        const popScore = Math.min(pop / 8000, 1) * 40;
        const incomeScore = Math.min(income / 5000, 1) * 20;

        // Weather boost (busca do ultimo cron)
        const { data: existing } = await supabaseAdmin
          .from("demand_scores")
          .select("weather_boost")
          .eq("tenant_id", tenant.id)
          .eq("neighborhood_id", n.id)
          .single();

        const weatherBoost = existing?.weather_boost ?? 1.0;

        // Hunger score = base * time * day * weather + random noise
        const baseScore = popScore + incomeScore;
        const noise = (Math.random() - 0.5) * 10;
        const hungerScore = Math.min(100, Math.max(0,
          Math.round(baseScore * hourMultiplier * dayMultiplier * weatherBoost + noise)
        ));

        const demandLevel = hungerScore >= 80 ? "critical" :
          hungerScore >= 60 ? "high" :
          hungerScore >= 40 ? "moderate" : "low";

        await supabaseAdmin
          .from("demand_scores")
          .upsert({
            tenant_id: tenant.id,
            neighborhood_id: n.id,
            hunger_score: hungerScore,
            demand_level: demandLevel,
            hour_multiplier: hourMultiplier,
            day_multiplier: dayMultiplier,
            weather_boost: weatherBoost,
            scored_at: new Date().toISOString(),
          }, { onConflict: "tenant_id,neighborhood_id" });

        updated++;
      }
    }

    return NextResponse.json({ ok: true, updated, hour, day });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

function getHourMultiplier(hour: number): number {
  if (hour >= 11 && hour <= 13) return 1.6;  // almoco
  if (hour >= 18 && hour <= 20) return 1.8;  // jantar peak
  if (hour >= 20 && hour <= 22) return 1.5;  // jantar
  if (hour >= 22 || hour <= 1) return 1.2;   // late night
  return 0.6;  // madrugada/manha
}

function getDayMultiplier(day: number): number {
  if (day === 5) return 1.4;  // sexta
  if (day === 6) return 1.3;  // sabado
  if (day === 0) return 1.2;  // domingo
  return 1.0;
}
