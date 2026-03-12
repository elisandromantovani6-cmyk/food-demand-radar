import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";

const TANGARA_LAT = -14.6229;
const TANGARA_LNG = -57.4933;
const BASE_URL = "https://api.openweathermap.org/data/2.5";

export async function GET(req: NextRequest) {
  // Verificar que é chamada do Vercel Cron
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const apiKey = process.env.OPENWEATHER_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "No API key" }, { status: 503 });
  }

  try {
    // Clima atual
    const res = await fetch(
      `${BASE_URL}/weather?lat=${TANGARA_LAT}&lon=${TANGARA_LNG}&appid=${apiKey}&units=metric&lang=pt_br`
    );
    const data = await res.json();

    const weather = {
      temperature: Math.round(data.main.temp),
      feels_like: Math.round(data.main.feels_like),
      humidity: data.main.humidity,
      description: data.weather[0].description,
      icon: data.weather[0].icon,
      is_raining: data.weather[0].main === "Rain" || data.weather[0].main === "Drizzle",
      wind_speed: data.wind.speed,
      clouds: data.clouds.all,
      rain_volume_1h: data.rain?.["1h"] ?? 0,
      collected_at: new Date().toISOString(),
    };

    // Salvar no Supabase (tabela settings do tenant ou cache global)
    // Por enquanto, salvar como JSON no settings de todos os tenants ativos
    const { data: tenants } = await supabaseAdmin
      .from("tenants")
      .select("id")
      .eq("city", "Tangará da Serra");

    for (const tenant of tenants ?? []) {
      // Upsert no demand_scores com weather boost
      const boost = weather.is_raining ? 1.25 : weather.temperature < 20 ? 1.15 : 1.0;

      const { data: neighborhoods } = await supabaseAdmin
        .from("neighborhoods")
        .select("id")
        .eq("tenant_id", tenant.id);

      for (const n of neighborhoods ?? []) {
        await supabaseAdmin
          .from("demand_scores")
          .upsert({
            tenant_id: tenant.id,
            neighborhood_id: n.id,
            weather_boost: boost,
            weather_data: weather,
            scored_at: new Date().toISOString(),
          }, { onConflict: "tenant_id,neighborhood_id" });
      }
    }

    return NextResponse.json({ ok: true, weather });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
