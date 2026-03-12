import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import Anthropic from "@anthropic-ai/sdk";

export async function POST(req: NextRequest) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: { user } } = await supabaseAdmin.auth.getUser(token);
  if (!user) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("tenant_id")
    .eq("id", user.id)
    .single();

  if (!profile?.tenant_id) return NextResponse.json({ error: "No tenant" }, { status: 400 });

  const { data: tenant } = await supabaseAdmin
    .from("tenants")
    .select("name, city, food_category")
    .eq("id", profile.tenant_id)
    .single();

  const body = await req.json();
  const { triggerType, neighborhood, weather, context } = body;

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

  const response = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 512,
    system: `Voce e um copywriter especialista em marketing para restaurantes delivery. Gere campanhas curtas, persuasivas, com emojis e urgencia. Responda APENAS em JSON valido com os campos: title, copyTitle, copyBody, offer, platforms (array), estimatedBudget, priority (alta/media/baixa).`,
    messages: [{
      role: "user",
      content: `Gere uma campanha para:
- Restaurante: ${tenant?.name ?? "Pizzaria"}
- Cidade: ${tenant?.city ?? "Tangara da Serra"}
- Categoria: ${tenant?.food_category ?? "pizza"}
- Gatilho: ${triggerType}
${neighborhood ? `- Bairro alvo: ${neighborhood}` : ""}
${weather ? `- Clima atual: ${weather}` : ""}
${context ? `- Contexto extra: ${context}` : ""}

Retorne APENAS o JSON, sem markdown.`,
    }],
  });

  const text = response.content[0].type === "text" ? response.content[0].text : "{}";

  try {
    const campaign = JSON.parse(text);
    return NextResponse.json(campaign);
  } catch {
    return NextResponse.json({ error: "Failed to parse AI response", raw: text }, { status: 500 });
  }
}
