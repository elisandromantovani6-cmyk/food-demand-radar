import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import Anthropic from "@anthropic-ai/sdk";

const WHATSAPP_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN!;
const WHATSAPP_PHONE_ID = process.env.WHATSAPP_PHONE_NUMBER_ID!;
const WHATSAPP_VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN ?? "food-demand-radar-verify";
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY!;

const META_API = `https://graph.facebook.com/v21.0/${WHATSAPP_PHONE_ID}/messages`;

// Verificacao do webhook (GET) — Meta envia pra validar
export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;
  const mode = params.get("hub.mode");
  const token = params.get("hub.verify_token");
  const challenge = params.get("hub.challenge");

  if (mode === "subscribe" && token === WHATSAPP_VERIFY_TOKEN) {
    return new NextResponse(challenge, { status: 200 });
  }

  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

// Receber mensagens (POST) — Meta envia quando cliente manda msg
export async function POST(req: NextRequest) {
  const body = await req.json();

  const entry = body.entry?.[0];
  const changes = entry?.changes?.[0];
  const value = changes?.value;

  if (!value?.messages?.[0]) {
    return NextResponse.json({ status: "no message" });
  }

  const message = value.messages[0];
  const contact = value.contacts?.[0];
  const customerPhone = message.from;
  const customerName = contact?.profile?.name ?? "Cliente";
  const text = message.text?.body;

  if (!text || message.type !== "text") {
    return NextResponse.json({ status: "ignored" });
  }

  // Buscar tenant vinculado a este numero de WhatsApp
  const { data: tenant } = await supabaseAdmin
    .from("tenants")
    .select("id, name, settings")
    .not("settings->whatsapp_phone_id", "is", null)
    .limit(1)
    .single();

  const tenantId = tenant?.id;

  // Buscar ou criar conversa no banco
  let { data: conversation } = await supabaseAdmin
    .from("whatsapp_conversations")
    .select("*")
    .eq("customer_phone", customerPhone)
    .eq("status", "ativa")
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (!conversation) {
    const { data: newConv } = await supabaseAdmin
      .from("whatsapp_conversations")
      .insert({
        tenant_id: tenantId,
        customer_name: customerName,
        customer_phone: customerPhone,
        status: "ativa",
        assigned_to: "ia",
        messages: [],
      })
      .select()
      .single();
    conversation = newConv;
  }

  if (!conversation) {
    return NextResponse.json({ error: "Failed to create conversation" }, { status: 500 });
  }

  // Adicionar mensagem do cliente
  const messages = (conversation.messages as Array<{ role: string; content: string }>) ?? [];
  messages.push({ role: "user", content: text });

  // Buscar system prompt com cardapio
  const systemPrompt = await buildSystemPrompt(tenantId, tenant?.name ?? "Pizzaria");

  // Gerar resposta com Claude
  const anthropic = new Anthropic({ apiKey: ANTHROPIC_API_KEY });
  const response = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 1024,
    system: systemPrompt,
    messages: messages.map(m => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    })),
  });

  const botReply = response.content[0].type === "text" ? response.content[0].text : "";

  // Salvar resposta do bot
  messages.push({ role: "assistant", content: botReply });

  await supabaseAdmin
    .from("whatsapp_conversations")
    .update({
      messages,
      customer_name: customerName,
      updated_at: new Date().toISOString(),
    })
    .eq("id", conversation.id);

  // Enviar resposta via WhatsApp
  await sendWhatsAppMessage(customerPhone, botReply);

  return NextResponse.json({ status: "ok" });
}

async function sendWhatsAppMessage(to: string, text: string) {
  await fetch(META_API, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${WHATSAPP_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to,
      type: "text",
      text: { body: text },
    }),
  });
}

async function buildSystemPrompt(tenantId: string | undefined, businessName: string): Promise<string> {
  let combosText = "Nenhum combo ativo no momento. NAO sugira combos ao cliente.";

  if (tenantId) {
    const { data: combos } = await supabaseAdmin
      .from("menu_combos")
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("active", true);

    if (combos && combos.length > 0) {
      const allItemIds = combos.flatMap(c => (c.items as string[]) ?? []);
      const { data: items } = await supabaseAdmin
        .from("menu_items")
        .select("id, name")
        .in("id", allItemIds.length > 0 ? allItemIds : ["__none__"]);

      const itemMap = new Map((items ?? []).map(i => [i.id, i.name]));

      combosText = combos.map(combo => {
        const itemNames = ((combo.items as string[]) ?? [])
          .map(id => itemMap.get(id))
          .filter(Boolean)
          .join(" + ");
        const comboPrice = Number(combo.combo_price);
        const originalPrice = Number(combo.original_price);
        const discount = Math.round((1 - comboPrice / originalPrice) * 100);
        const economy = (originalPrice - comboPrice).toFixed(2);
        return `${combo.name} - R$${comboPrice.toFixed(2)} (economia de R$${economy}, ${discount}% off)\n   ${itemNames}\n   ${combo.description ?? ""}`;
      }).join("\n\n");
    }
  }

  // Importar o prompt base
  const { BOT_SYSTEM_PROMPT } = await import("@/server/routers/whatsapp");

  return BOT_SYSTEM_PROMPT
    .replace(/{businessName}/g, businessName)
    .replace(/{maxWaitMinutes}/g, "3")
    .replace(/{operatingHoursStart}/g, "18:00")
    .replace(/{operatingHoursEnd}/g, "22:50")
    .replace(/{combosAtivos}/g, combosText);
}
