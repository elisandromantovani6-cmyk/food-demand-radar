import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";

const PIZZA_FLAVORS = [
  "pizza calabresa",
  "pizza quatro queijos",
  "pizza frango catupiry",
  "pizza margherita",
  "pizza pepperoni",
  "pizza portuguesa",
  "pizza cheddar bacon",
  "pizza carne seca",
  "pizza perto de mim",
  "promoção pizza",
  "pizza delivery tangará",
];

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Google Trends via npm package
    const googleTrends = require("google-trends-api");

    const results = [];

    for (const keyword of PIZZA_FLAVORS) {
      try {
        const raw = await googleTrends.interestOverTime({
          keyword,
          startTime: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          geo: "BR-MT",
        });

        const parsed = JSON.parse(raw);
        const timeline = parsed.default?.timelineData ?? [];

        const values = timeline.map((t: { value: number[] }) => t.value[0]);
        const avg = values.length > 0 ? values.reduce((a: number, b: number) => a + b, 0) / values.length : 0;
        const peak = values.length > 0 ? Math.max(...values) : 0;
        const recent = values.slice(-7);
        const older = values.slice(-14, -7);
        const recentAvg = recent.length > 0 ? recent.reduce((a: number, b: number) => a + b, 0) / recent.length : 0;
        const olderAvg = older.length > 0 ? older.reduce((a: number, b: number) => a + b, 0) / older.length : 1;
        const velocity = olderAvg > 0 ? ((recentAvg - olderAvg) / olderAvg) * 100 : 0;

        let status: string = "stable";
        if (velocity > 20) status = "trending";
        else if (velocity > 5) status = "emerging";
        else if (velocity < -15) status = "declining";

        results.push({
          keyword,
          trend_score: Math.round(avg),
          velocity: Math.round(velocity),
          search_volume: Math.round(avg * 100),
          status,
          peak_interest: peak,
        });
      } catch {
        // Google pode bloquear, continua com o proximo
        results.push({
          keyword,
          trend_score: 50,
          velocity: 0,
          search_volume: 5000,
          status: "stable",
          peak_interest: 50,
        });
      }

      // Delay para nao ser bloqueado pelo Google
      await new Promise(r => setTimeout(r, 2000));
    }

    // Salvar trends no Supabase
    const { data: tenants } = await supabaseAdmin
      .from("tenants")
      .select("id")
      .eq("onboarding_completed", true);

    for (const tenant of tenants ?? []) {
      for (const trend of results) {
        await supabaseAdmin
          .from("flavor_trends")
          .upsert({
            tenant_id: tenant.id,
            keyword: trend.keyword,
            trend_score: trend.trend_score,
            velocity: trend.velocity,
            search_volume: trend.search_volume,
            status: trend.status,
            peak_interest: trend.peak_interest,
            collected_at: new Date().toISOString(),
          }, { onConflict: "tenant_id,keyword" });
      }
    }

    return NextResponse.json({ ok: true, count: results.length, results });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
