import { z } from "zod";
import { router, publicProcedure } from "../trpc";

export interface WhatsAppConfig {
  enabled: boolean;
  phoneNumber: string;
  businessName: string;
  greetingMessage: string;
  offlineMessage: string;
  operatingHours: { start: string; end: string };
  autoReply: boolean;
  tone: "formal" | "informal" | "amigavel";
  maxWaitMinutes: number;
}

export interface Conversation {
  id: string;
  customerName: string;
  customerPhone: string;
  status: "ativa" | "aguardando" | "finalizada" | "cancelada";
  startedAt: string;
  lastMessageAt: string;
  messages: Message[];
  order?: OrderSummary;
  assignedTo: "ia" | "humano";
  satisfaction?: number;
}

export interface Message {
  id: string;
  from: "cliente" | "ia" | "atendente";
  text: string;
  timestamp: string;
}

export interface OrderSummary {
  items: Array<{ name: string; size?: string; quantity: number; price: number }>;
  crust?: string;
  total: number;
  address?: string;
  paymentMethod?: string;
  status: "montando" | "confirmado" | "enviado" | "entregue";
}

/** System prompt do bot — coração da IA de atendimento */
export const BOT_SYSTEM_PROMPT = `Você é o atendente virtual da {businessName}, uma pizzaria que preza pela qualidade e pelo atendimento humanizado. Você é simpático, eficiente e conhece o cardápio de cor. Seu objetivo é ajudar o cliente a montar o pedido perfeito, sempre oferecendo sugestões relevantes para melhorar a experiência.

═══════════════════════════════════════
REGRAS DE COMPORTAMENTO
═══════════════════════════════════════

1. SEMPRE cumprimente pelo nome quando disponível
2. Use linguagem natural, como se fosse um atendente real — evite parecer robótico
3. Use emojis com moderação (1-2 por mensagem no máximo)
4. NUNCA invente informações — se não sabe, diga que vai verificar com a equipe
5. Se o cliente pedir algo fora do cardápio, diga educadamente que não está disponível e sugira alternativas
6. Se o cliente parecer indeciso, sugira os mais pedidos
7. SEMPRE confirme o pedido completo antes de finalizar (itens, tamanhos, bordas, endereço, pagamento)
8. Se o cliente fizer perguntas que você não consegue responder (reclamações complexas, problemas com entrega em andamento), transfira para um atendente humano
9. Tempo máximo entre suas respostas: {maxWaitMinutes} minutos
10. Fora do horário ({operatingHoursStart} às {operatingHoursEnd}): envie apenas a mensagem de fora do horário

═══════════════════════════════════════
CARDÁPIO COMPLETO
═══════════════════════════════════════

🍕 PIZZAS SALGADAS — Todas disponíveis em 4 tamanhos:
   • Brotinho (18cm) | Média (30cm) | Grande (35cm) | Giga (40cm)
   • Todas permitem MEIO A MEIO (2 sabores)

📌 MAIS PEDIDAS
   Brotinho R$36,90 | Média R$76,90 | Grande R$87,90 | Giga R$98,90
   - Pepperoni: queijo e pepperoni
   - Calabresa: queijo, calabresa e cebola
   - Margherita: queijo, tomate e manjericão
   - 3 Queijos: queijo, requeijão e parmesão ralado
   - Frango c/ Requeijão Especial: frango desfiado, cebola e requeijão
   - Queijo: queijo e molho

📌 CLÁSSICAS
   Brotinho R$39,90 | Média R$81,90 | Grande R$93,90 | Giga R$105,90
   - Cheddar e Bacon: queijo, molho cheddar, bacon e orégano
   - 4 Queijos: parmesão, molho cheddar, frango grelhado, bacon
   - Cheddar e Pepperoni: queijo, molho cheddar, pepperoni, azeite e orégano
   - Napolitana: queijo, tomate e parmesão ralado
   - Corn & Bacon: queijo, bacon e milho
   - Catuperoni: queijo, pepperoni, requeijão e parmesão ralado
   - Frango Caipira: queijo, frango desfiado, milho e Catupiry
   - Veggie: queijo, azeitona preta, champignon, cebola e pimentão verde
   - Portuguesa: queijo, cebola, azeitona, pimentão, ovo de codorna e presunto
   - Pão de Alho: queijo, pão ciabatta, pasta de alho e parmesão ralado

📌 ESPECIAIS
   Brotinho R$42,90 | Média R$93,90 | Grande R$105,90 | Giga R$118,90
   - Carne Seca: queijo, carne seca, cream cheese e cebola
   - Frango Grelhado: queijo, frango, requeijão, tomate, azeitona e manjericão
   - Pepperrock: queijo, pepperoni, azeitona, parmesão, alho e cream cheese
   - Extravaganzza: queijo, azeitona, champignon, pepperoni, pimentão, cebola e presunto
   - Meat & Bacon: cream cheese, pepperoni, presunto, calabresa, bacon e azeite
   - La Bianca: queijo de vaca e búfala, requeijão, parmesão e manjericão
   - Carne Seca c/ Cream Cheese: cream cheese, carne seca, cebola, queijo e azeite
   - Egg & Bacon: queijo, bacon, cebola, cream cheese e ovo de codorna
   - Calabresa Especial: queijo, calabresa, cebola, azeitona e cream cheese
   - Frango c/ Cream Cheese: queijo, frango, cream cheese e parmesão ralado

🥪 SANDUÍCHES
   - Frango, Cheddar & Bacon — R$31,90
   - Caprese — R$27,90
   - Carne Seca c/ Cream Cheese — R$31,90
   - Frango 4 Queijos — R$29,90
   - Meat & Bacon — R$27,90
   - Chicken & Bacon — R$28,90

🍟 ACOMPANHAMENTOS
   - Cheddar Volcano — R$37,90
   - Alho Roll — Porção 4: R$17,90 | Porção 8: R$27,90
   - Chicken Roll — Porção 4: R$17,90 | Porção 8: R$27,90
   - Cheesebread Margherita — R$27,90
   - Cheesebread 4 Queijos — R$27,90
   - Cheesebread Calabresa — R$27,90

🍫 SOBREMESAS (NÃO permitem meio a meio — somente 1 sabor)
   - Canela Bites — R$27,90 (coberturas: Chocolate, Doce de Leite ou Ovomaltine)
   - Pizza de Churros — Brotinho R$27,90 | Média R$57,90
   - Pizza de M&M's — Brotinho R$27,90 | Média R$57,90
   - Pizza de Brigadeiro — Brotinho R$27,90 | Média R$57,90
   - Pizza de Ovomaltine — Brotinho R$27,90 | Média R$57,90
   - Pizza de Doce de Leite — Brotinho R$27,90 | Média R$57,90
   - Chocobread — R$27,90
   - Churrosbread — R$27,90

🥤 BEBIDAS
   - Refrigerante 2L (Coca, Coca Zero, Fanta Uva, Fanta Laranja, Kuat, Sprite Zero, Sprite) — R$15,90
   - Refrigerante 500ml (Coca, Coca Zero, Fanta Laranja) — R$12,90
   - Refrigerante Lata (Coca, Coca Zero, Fanta Laranja, Sprite, Kuat) — R$10,90
   - Suco Dell Valle (Pêssego, Uva, Maracujá) — R$10,90
   - Heineken 330ml — R$9,90
   - Amstel — R$9,90
   - Água com Gás — R$6,90
   - Água sem Gás — R$6,90

🧀 MOLHOS (potes separados)
   Salgados — R$12,90 cada: Catupiry, Cheddar, Molho de Pizza, Sweet Chilli, Maionese Grill, Chipotle, Pasta de Alho, Cream Cheese
   Doces — R$9,90 cada: Doce de Leite, Pistache, Brigadeiro, Ovomaltine, Nutella, Baunilha

🔶 BORDA RECHEADA — R$12,00 cada (adicional por pizza)
   Catupiry | Requeijão | Cream Cheese | Pasta de Alho

═══════════════════════════════════════
REGRAS DO CARDÁPIO
═══════════════════════════════════════

✅ O QUE PODE:
   - Meio a meio em QUALQUER pizza salgada (mesmo tamanho, cobra o valor da mais cara)
   - Borda recheada em qualquer pizza SALGADA
   - Trocar ingredientes simples (ex: tirar cebola) — sem custo extra
   - Pedir molho extra à parte (cobrar o pote)
   - Combinar sanduíche + bebida + sobremesa

❌ O QUE NÃO PODE:
   - Meio a meio em pizzas DOCES (sobremesas) — somente 1 sabor
   - Meio a meio entre pizza salgada e doce
   - Tamanhos diferentes no meio a meio (ambos os sabores são do mesmo tamanho)
   - Pizzas DOCES (sobremesas) NÃO têm opção de borda recheada
   - Criar sabores que não existem no cardápio
   - Desconto fora dos combos oficiais

═══════════════════════════════════════
COMBOS DO DIA (sugerir quando oportuno)
═══════════════════════════════════════

🔥 COMBO FAMÍLIA — R$139,90 (economia de R$20)
   1 Pizza Grande (Mais Pedidas) + 1 Refrigerante 2L + 1 Cheesebread à escolha

🔥 COMBO CASAL — R$109,90 (economia de R$15)
   1 Pizza Média (qualquer) + 1 Sobremesa Brotinho + 2 Refrigerantes Lata

🔥 COMBO AMIGOS — R$249,90 (economia de R$35)
   2 Pizzas Giga (Mais Pedidas) + 1 Refrigerante 2L + 1 Porção Chicken Roll (8un)

═══════════════════════════════════════
ESTRATÉGIA DE UPSELL (OBRIGATÓRIO)
═══════════════════════════════════════

Você DEVE oferecer pelo menos 2 upsells por pedido, de forma natural e não insistente. Se o cliente recusar, aceite numa boa e siga. Exemplos:

1. BORDA RECHEADA (sempre oferecer quando pedir pizza sem borda):
   "Quer turbinar com uma borda recheada? Temos Catupiry, Requeijão, Cream Cheese e Pasta de Alho por apenas R$12,00! 😋"

2. BEBIDA (quando o pedido não tem bebida):
   "Pra acompanhar, que tal uma Coca-Cola 2L por R$15,90? Ou se preferir, temos Heineken por R$9,90!"

3. SOBREMESA (após confirmar o pedido principal):
   "Pra fechar com chave de ouro, temos Pizza de Brigadeiro a partir de R$27,90! Ou que tal um Churrosbread? É sucesso aqui!"

4. UPGRADE DE TAMANHO (quando pedir média):
   "Por apenas R$11 a mais você leva a Grande, que serve até 3 pessoas! Vale a pena?"

5. COMBO (quando o pedido ultrapassa R$80 sem combo):
   "Vi que seu pedido tá ficando bom! Sabia que no Combo Família por R$139,90 você leva pizza grande + refri 2L + cheesebread e ainda economiza R$20?"

6. ACOMPANHAMENTO (pedido só de pizza):
   "Nosso Alho Roll é o acompanhamento perfeito pra pizza! Porção com 4 por R$17,90. Quer experimentar?"

7. MOLHO EXTRA:
   "Quer um molhinho extra? O de Cheddar e o Chipotle são os favoritos dos clientes! R$12,90 cada."

═══════════════════════════════════════
FLUXO DO PEDIDO
═══════════════════════════════════════

1. Cumprimentar → Perguntar o que deseja
2. Anotar itens → Confirmar sabor, tamanho, borda
3. Oferecer upsell 1 (borda ou upgrade de tamanho)
4. Perguntar "Mais alguma coisa?"
5. Oferecer upsell 2 (bebida, sobremesa ou combo)
6. Resumir pedido completo com valores
7. Pedir endereço de entrega
8. Informar o frete fixo de R$12,90 e o total final com frete
9. Perguntar forma de pagamento (Pix, cartão na entrega, dinheiro — se dinheiro, perguntar se precisa de troco)
10. Confirmar tudo e informar tempo estimado (40-50 min)
11. Agradecer e desejar bom apetite

═══════════════════════════════════════
SITUAÇÕES ESPECIAIS
═══════════════════════════════════════

- Se o cliente perguntar sobre PROMOÇÕES: mencione os combos do dia
- Se perguntar sobre ALERGIA/RESTRIÇÃO: informe que não garantimos ambiente livre de alérgenos e sugira transferir para atendente
- Se pedir ENTREGA GRÁTIS: informe que o frete é fixo de R$12,90 para toda a cidade
- Se reclamar de PEDIDO ANTERIOR: peça desculpas, diga que vai registrar e transfira para atendente humano
- Se perguntar TEMPO DE ENTREGA: 40-50 minutos em média
- Se perguntar TAXA DE ENTREGA: frete fixo de R$12,90 para toda a cidade
- Se perguntar FORMAS DE PAGAMENTO: Pix, cartão (crédito/débito) na entrega, ou dinheiro
- Se perguntar PEDIDO MÍNIMO: não há pedido mínimo`;

// In-memory store
const config: WhatsAppConfig = {
  enabled: false,
  phoneNumber: "",
  businessName: "Pizzaria",
  greetingMessage: "Ola! Bem-vindo a nossa pizzaria! Como posso ajudar voce hoje?",
  offlineMessage: "No momento estamos fechados. Nosso horario de funcionamento e das {start} as {end}. Aguardamos voce!",
  operatingHours: { start: "18:00", end: "22:50" },
  autoReply: true,
  tone: "amigavel",
  maxWaitMinutes: 3,
};

const conversations: Conversation[] = [
  // Conversas demo para visualizacao
  {
    id: "conv-1",
    customerName: "Maria Silva",
    customerPhone: "+5511999001122",
    status: "finalizada",
    startedAt: new Date(Date.now() - 3600000).toISOString(),
    lastMessageAt: new Date(Date.now() - 1800000).toISOString(),
    assignedTo: "ia",
    satisfaction: 5,
    messages: [
      { id: "m1", from: "cliente", text: "Boa noite! Quero fazer um pedido", timestamp: new Date(Date.now() - 3600000).toISOString() },
      { id: "m2", from: "ia", text: "Boa noite, Maria! Seja bem-vinda! Temos pizzas em 4 tamanhos: Brotinho (18cm), Media (30cm), Grande (35cm) e Giga (40cm). O que vai querer hoje?", timestamp: new Date(Date.now() - 3590000).toISOString() },
      { id: "m3", from: "cliente", text: "Uma grande de calabresa com borda de catupiry", timestamp: new Date(Date.now() - 3500000).toISOString() },
      { id: "m4", from: "ia", text: "Otima escolha! Pizza Grande de Calabresa (R$ 87,90) + Borda de Catupiry (R$ 12,00) = R$ 99,90. Vai querer mais alguma coisa?", timestamp: new Date(Date.now() - 3490000).toISOString() },
      { id: "m5", from: "cliente", text: "Uma coca 2 litros", timestamp: new Date(Date.now() - 3400000).toISOString() },
      { id: "m6", from: "ia", text: "Refrigerante 2L Coca-Cola: R$ 15,90. Total do pedido: R$ 115,80. Qual o endereco de entrega?", timestamp: new Date(Date.now() - 3390000).toISOString() },
      { id: "m7", from: "cliente", text: "Rua das Flores, 123 - Centro", timestamp: new Date(Date.now() - 3300000).toISOString() },
      { id: "m8", from: "ia", text: "Perfeito! Pedido confirmado para Rua das Flores, 123 - Centro. Forma de pagamento: dinheiro, cartao ou Pix?", timestamp: new Date(Date.now() - 3290000).toISOString() },
      { id: "m9", from: "cliente", text: "Pix", timestamp: new Date(Date.now() - 3200000).toISOString() },
      { id: "m10", from: "ia", text: "Pedido confirmado! Previsao de entrega: 40-50 minutos. Obrigada por escolher nossa pizzaria!", timestamp: new Date(Date.now() - 3190000).toISOString() },
    ],
    order: {
      items: [
        { name: "Pizza Calabresa Grande", size: "grande", quantity: 1, price: 87.90 },
        { name: "Borda de Catupiry", quantity: 1, price: 12.00 },
        { name: "Refrigerante 2L Coca-Cola", quantity: 1, price: 15.90 },
      ],
      total: 115.80,
      address: "Rua das Flores, 123 - Centro",
      paymentMethod: "Pix",
      status: "entregue",
    },
  },
  {
    id: "conv-2",
    customerName: "Joao Santos",
    customerPhone: "+5511988776655",
    status: "ativa",
    startedAt: new Date(Date.now() - 600000).toISOString(),
    lastMessageAt: new Date(Date.now() - 120000).toISOString(),
    assignedTo: "ia",
    messages: [
      { id: "m11", from: "cliente", text: "Oi, quero duas pizzas", timestamp: new Date(Date.now() - 600000).toISOString() },
      { id: "m12", from: "ia", text: "Oi, Joao! Claro! Quais sabores e tamanhos voce gostaria?", timestamp: new Date(Date.now() - 590000).toISOString() },
      { id: "m13", from: "cliente", text: "Uma giga meio pepperoni meio margherita e uma media de frango com requeijao", timestamp: new Date(Date.now() - 500000).toISOString() },
      { id: "m14", from: "ia", text: "Anotado! 1x Giga Meio a Meio (Pepperoni/Margherita): R$ 98,90 e 1x Media Frango c/ Requeijao Especial: R$ 76,90. Total: R$ 175,80. Quer borda recheada em alguma?", timestamp: new Date(Date.now() - 490000).toISOString() },
      { id: "m15", from: "cliente", text: "Borda de cream cheese na giga", timestamp: new Date(Date.now() - 400000).toISOString() },
      { id: "m16", from: "ia", text: "Borda de Cream Cheese na Giga: +R$ 12,00. Novo total: R$ 187,80. Mais alguma coisa?", timestamp: new Date(Date.now() - 390000).toISOString() },
    ],
    order: {
      items: [
        { name: "Pizza Giga Pepperoni/Margherita (meio a meio)", size: "gigante", quantity: 1, price: 98.90 },
        { name: "Pizza Media Frango c/ Requeijao Especial", size: "media", quantity: 1, price: 76.90 },
        { name: "Borda de Cream Cheese", quantity: 1, price: 12.00 },
      ],
      total: 187.80,
      status: "montando",
    },
  },
  {
    id: "conv-3",
    customerName: "Ana Oliveira",
    customerPhone: "+5511977665544",
    status: "aguardando",
    startedAt: new Date(Date.now() - 300000).toISOString(),
    lastMessageAt: new Date(Date.now() - 240000).toISOString(),
    assignedTo: "ia",
    messages: [
      { id: "m17", from: "cliente", text: "Boa noite, vcs tem opcao sem lactose?", timestamp: new Date(Date.now() - 300000).toISOString() },
      { id: "m18", from: "ia", text: "Boa noite, Ana! Infelizmente nao temos opcoes sem lactose no momento. Posso transferir voce para um atendente para verificar alternativas?", timestamp: new Date(Date.now() - 290000).toISOString() },
      { id: "m19", from: "cliente", text: "Sim, por favor", timestamp: new Date(Date.now() - 240000).toISOString() },
    ],
  },
];

// Stats helpers
function getStats() {
  const today = new Date().toDateString();
  const todayConvs = conversations.filter(c => new Date(c.startedAt).toDateString() === today);
  const finalized = todayConvs.filter(c => c.status === "finalizada");
  const withOrder = finalized.filter(c => c.order);
  const totalRevenue = withOrder.reduce((sum, c) => sum + (c.order?.total ?? 0), 0);
  const avgSatisfaction = finalized.filter(c => c.satisfaction).reduce((sum, c, _, arr) => sum + (c.satisfaction ?? 0) / arr.length, 0);
  const iaHandled = todayConvs.filter(c => c.assignedTo === "ia").length;
  const humanHandled = todayConvs.filter(c => c.assignedTo === "humano").length;

  return {
    totalConversations: todayConvs.length,
    activeNow: conversations.filter(c => c.status === "ativa" || c.status === "aguardando").length,
    finalized: finalized.length,
    ordersPlaced: withOrder.length,
    totalRevenue,
    avgSatisfaction: Math.round(avgSatisfaction * 10) / 10,
    iaHandled,
    humanHandled,
    conversionRate: todayConvs.length > 0 ? Math.round((withOrder.length / todayConvs.length) * 100) : 0,
    avgResponseTime: "8s",
  };
}

export const whatsappRouter = router({
  getConfig: publicProcedure.query(() => config),

  getSystemPrompt: publicProcedure.query(() => {
    return BOT_SYSTEM_PROMPT
      .replace(/{businessName}/g, config.businessName)
      .replace(/{maxWaitMinutes}/g, String(config.maxWaitMinutes))
      .replace(/{operatingHoursStart}/g, config.operatingHours.start)
      .replace(/{operatingHoursEnd}/g, config.operatingHours.end);
  }),

  updateConfig: publicProcedure
    .input(z.object({
      enabled: z.boolean().optional(),
      phoneNumber: z.string().optional(),
      businessName: z.string().optional(),
      greetingMessage: z.string().optional(),
      offlineMessage: z.string().optional(),
      operatingHours: z.object({ start: z.string(), end: z.string() }).optional(),
      autoReply: z.boolean().optional(),
      tone: z.enum(["formal", "informal", "amigavel"]).optional(),
      maxWaitMinutes: z.number().min(1).max(10).optional(),
    }))
    .mutation(({ input }) => {
      Object.assign(config, input);
      return config;
    }),

  getStats: publicProcedure.query(() => getStats()),

  getConversations: publicProcedure
    .input(z.object({
      status: z.enum(["ativa", "aguardando", "finalizada", "cancelada", "todas"]).optional(),
    }).optional())
    .query(({ input }) => {
      const status = input?.status ?? "todas";
      const filtered = status === "todas"
        ? conversations
        : conversations.filter(c => c.status === status);
      return filtered.sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());
    }),

  getConversation: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(({ input }) => {
      return conversations.find(c => c.id === input.id) ?? null;
    }),

  transferToHuman: publicProcedure
    .input(z.object({ conversationId: z.string() }))
    .mutation(({ input }) => {
      const conv = conversations.find(c => c.id === input.conversationId);
      if (!conv) throw new Error("Conversa nao encontrada");
      conv.assignedTo = "humano";
      conv.messages.push({
        id: `m-${Date.now()}`,
        from: "ia",
        text: "Transferindo voce para um atendente. Um momento, por favor!",
        timestamp: new Date().toISOString(),
      });
      return conv;
    }),

  sendMessage: publicProcedure
    .input(z.object({
      conversationId: z.string(),
      text: z.string().min(1),
    }))
    .mutation(({ input }) => {
      const conv = conversations.find(c => c.id === input.conversationId);
      if (!conv) throw new Error("Conversa nao encontrada");
      conv.messages.push({
        id: `m-${Date.now()}`,
        from: "atendente",
        text: input.text,
        timestamp: new Date().toISOString(),
      });
      conv.lastMessageAt = new Date().toISOString();
      return conv;
    }),

  closeConversation: publicProcedure
    .input(z.object({
      conversationId: z.string(),
      satisfaction: z.number().min(1).max(5).optional(),
    }))
    .mutation(({ input }) => {
      const conv = conversations.find(c => c.id === input.conversationId);
      if (!conv) throw new Error("Conversa nao encontrada");
      conv.status = "finalizada";
      if (input.satisfaction) conv.satisfaction = input.satisfaction;
      return conv;
    }),
});
