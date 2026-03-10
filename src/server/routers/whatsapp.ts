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

// In-memory store
const config: WhatsAppConfig = {
  enabled: false,
  phoneNumber: "",
  businessName: "Pizzaria",
  greetingMessage: "Ola! Bem-vindo a nossa pizzaria! Como posso ajudar voce hoje?",
  offlineMessage: "No momento estamos fechados. Nosso horario de funcionamento e das {start} as {end}. Aguardamos voce!",
  operatingHours: { start: "18:00", end: "23:00" },
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
