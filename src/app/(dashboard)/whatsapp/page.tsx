"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  MessageSquare, Bot, Users, Phone, Send, Settings, BarChart3,
  Power, PowerOff, Clock, Smile, ArrowRightLeft, X, Check,
  TrendingUp, DollarSign, Zap, Star, UserCheck, ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { trpc } from "@/lib/trpc";

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "agora";
  if (mins < 60) return `${mins}min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
}

export default function WhatsAppPage() {
  const [selectedConv, setSelectedConv] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState("");
  const [statusFilter, setStatusFilter] = useState<"todas" | "ativa" | "aguardando" | "finalizada">("todas");

  const utils = trpc.useUtils();
  const { data: config } = trpc.whatsapp.getConfig.useQuery();
  const { data: stats } = trpc.whatsapp.getStats.useQuery(undefined, { refetchInterval: 10000 });
  const { data: conversations } = trpc.whatsapp.getConversations.useQuery(
    { status: statusFilter },
    { refetchInterval: 5000 }
  );
  const { data: activeConv } = trpc.whatsapp.getConversation.useQuery(
    { id: selectedConv ?? "" },
    { enabled: !!selectedConv, refetchInterval: 3000 }
  );

  const updateConfig = trpc.whatsapp.updateConfig.useMutation({
    onSuccess: () => utils.whatsapp.getConfig.invalidate(),
  });
  const transferToHuman = trpc.whatsapp.transferToHuman.useMutation({
    onSuccess: () => {
      utils.whatsapp.getConversation.invalidate();
      utils.whatsapp.getConversations.invalidate();
    },
  });
  const sendMessage = trpc.whatsapp.sendMessage.useMutation({
    onSuccess: () => {
      utils.whatsapp.getConversation.invalidate();
      setMessageInput("");
    },
  });
  const closeConversation = trpc.whatsapp.closeConversation.useMutation({
    onSuccess: () => {
      utils.whatsapp.getConversation.invalidate();
      utils.whatsapp.getConversations.invalidate();
    },
  });

  const handleSend = () => {
    if (!messageInput.trim() || !selectedConv) return;
    sendMessage.mutate({ conversationId: selectedConv, text: messageInput });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-green-500" />
            WhatsApp Bot
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Atendimento automatizado com IA para pedidos via WhatsApp
          </p>
        </div>
        <button
          onClick={() => updateConfig.mutate({ enabled: !config?.enabled })}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all",
            config?.enabled
              ? "bg-green-500/10 text-green-400 border border-green-500/30 hover:bg-green-500/20"
              : "bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20"
          )}
        >
          {config?.enabled ? <Power className="w-4 h-4" /> : <PowerOff className="w-4 h-4" />}
          {config?.enabled ? "Bot Ativo" : "Bot Inativo"}
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: "Conversas Hoje", value: stats?.totalConversations ?? 0, icon: MessageSquare, color: "text-blue-400" },
          { label: "Ativas Agora", value: stats?.activeNow ?? 0, icon: Zap, color: "text-green-400" },
          { label: "Pedidos Feitos", value: stats?.ordersPlaced ?? 0, icon: Check, color: "text-emerald-400" },
          { label: "Faturamento", value: `R$ ${(stats?.totalRevenue ?? 0).toFixed(2)}`, icon: DollarSign, color: "text-amber-400" },
          { label: "Taxa Conversao", value: `${stats?.conversionRate ?? 0}%`, icon: TrendingUp, color: "text-purple-400" },
        ].map(stat => (
          <Card key={stat.label} className="border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <stat.icon className={cn("w-4 h-4", stat.color)} />
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{stat.label}</span>
              </div>
              <p className="text-xl font-bold tabular-nums">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="conversas" className="space-y-4">
        <TabsList className="bg-secondary/50 border border-border/50">
          <TabsTrigger value="conversas" className="gap-1.5 text-xs">
            <MessageSquare className="w-3.5 h-3.5" /> Conversas
          </TabsTrigger>
          <TabsTrigger value="desempenho" className="gap-1.5 text-xs">
            <BarChart3 className="w-3.5 h-3.5" /> Desempenho
          </TabsTrigger>
          <TabsTrigger value="configuracoes" className="gap-1.5 text-xs">
            <Settings className="w-3.5 h-3.5" /> Configuracoes
          </TabsTrigger>
        </TabsList>

        {/* Conversas Tab */}
        <TabsContent value="conversas">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4" style={{ height: "calc(100vh - 380px)", minHeight: 500 }}>
            {/* Lista de conversas */}
            <Card className="border-border/50 lg:col-span-1 flex flex-col">
              <div className="p-3 border-b border-border/30">
                <div className="flex gap-1.5">
                  {(["todas", "ativa", "aguardando", "finalizada"] as const).map(s => (
                    <button
                      key={s}
                      onClick={() => setStatusFilter(s)}
                      className={cn(
                        "px-2.5 py-1 rounded-md text-[11px] font-medium transition-all",
                        statusFilter === s
                          ? "bg-primary/10 text-primary border border-primary/30"
                          : "text-muted-foreground hover:bg-accent/50"
                      )}
                    >
                      {s === "todas" ? "Todas" : s === "ativa" ? "Ativas" : s === "aguardando" ? "Aguardando" : "Finalizadas"}
                    </button>
                  ))}
                </div>
              </div>
              <CardContent className="p-0 flex-1 overflow-y-auto">
                {conversations?.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                    <MessageSquare className="w-8 h-8 mb-2 opacity-30" />
                    <p className="text-sm">Nenhuma conversa</p>
                  </div>
                )}
                {conversations?.map(conv => (
                  <button
                    key={conv.id}
                    onClick={() => setSelectedConv(conv.id)}
                    className={cn(
                      "w-full text-left p-3 border-b border-border/20 hover:bg-accent/30 transition-colors",
                      selectedConv === conv.id && "bg-primary/5 border-l-2 border-l-primary"
                    )}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">{conv.customerName}</span>
                      <span className="text-[10px] text-muted-foreground">{timeAgo(conv.lastMessageAt)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-[11px] text-muted-foreground truncate max-w-[180px]">
                        {conv.messages[conv.messages.length - 1]?.text}
                      </p>
                      <div className="flex items-center gap-1.5">
                        {conv.assignedTo === "ia" ? (
                          <Bot className="w-3 h-3 text-blue-400" />
                        ) : (
                          <UserCheck className="w-3 h-3 text-amber-400" />
                        )}
                        <span className={cn(
                          "w-2 h-2 rounded-full",
                          conv.status === "ativa" ? "bg-green-400" :
                          conv.status === "aguardando" ? "bg-amber-400" :
                          conv.status === "finalizada" ? "bg-muted-foreground" : "bg-red-400"
                        )} />
                      </div>
                    </div>
                    {conv.order && (
                      <p className="text-[10px] text-emerald-400 mt-1 font-medium">
                        Pedido: R$ {conv.order.total.toFixed(2)} - {conv.order.status}
                      </p>
                    )}
                  </button>
                ))}
              </CardContent>
            </Card>

            {/* Chat */}
            <Card className="border-border/50 lg:col-span-2 flex flex-col">
              {activeConv ? (
                <>
                  {/* Header do chat */}
                  <div className="p-3 border-b border-border/30 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-green-500/10 flex items-center justify-center">
                        <Phone className="w-4 h-4 text-green-400" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{activeConv.customerName}</p>
                        <p className="text-[10px] text-muted-foreground">{activeConv.customerPhone}</p>
                      </div>
                      <span className={cn(
                        "px-2 py-0.5 rounded-full text-[10px] font-medium",
                        activeConv.assignedTo === "ia"
                          ? "bg-blue-500/10 text-blue-400"
                          : "bg-amber-500/10 text-amber-400"
                      )}>
                        {activeConv.assignedTo === "ia" ? "IA" : "Humano"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {activeConv.assignedTo === "ia" && activeConv.status !== "finalizada" && (
                        <button
                          onClick={() => transferToHuman.mutate({ conversationId: activeConv.id })}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 transition-all"
                        >
                          <ArrowRightLeft className="w-3 h-3" /> Assumir
                        </button>
                      )}
                      {activeConv.status !== "finalizada" && (
                        <button
                          onClick={() => closeConversation.mutate({ conversationId: activeConv.id, satisfaction: 5 })}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-all"
                        >
                          <X className="w-3 h-3" /> Encerrar
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Mensagens */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {activeConv.messages.map(msg => (
                      <div
                        key={msg.id}
                        className={cn(
                          "flex",
                          msg.from === "cliente" ? "justify-start" : "justify-end"
                        )}
                      >
                        <div className={cn(
                          "max-w-[75%] rounded-2xl px-3.5 py-2.5 text-sm",
                          msg.from === "cliente"
                            ? "bg-secondary rounded-tl-sm"
                            : msg.from === "ia"
                            ? "bg-green-500/10 text-green-50 rounded-tr-sm border border-green-500/20"
                            : "bg-blue-500/10 text-blue-50 rounded-tr-sm border border-blue-500/20"
                        )}>
                          <div className="flex items-center gap-1.5 mb-1">
                            {msg.from === "ia" && <Bot className="w-3 h-3 text-green-400" />}
                            {msg.from === "atendente" && <UserCheck className="w-3 h-3 text-blue-400" />}
                            <span className="text-[10px] text-muted-foreground">
                              {msg.from === "cliente" ? activeConv.customerName.split(" ")[0] : msg.from === "ia" ? "Bot IA" : "Atendente"}
                              {" "}&middot;{" "}{new Date(msg.timestamp).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                            </span>
                          </div>
                          <p className="whitespace-pre-wrap">{msg.text}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Resumo do pedido */}
                  {activeConv.order && (
                    <div className="px-4 py-2 border-t border-border/30 bg-emerald-500/5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-[11px] font-semibold text-emerald-400">Pedido</span>
                          <span className="text-[10px] text-muted-foreground">
                            {activeConv.order.items.length} {activeConv.order.items.length === 1 ? "item" : "itens"}
                          </span>
                        </div>
                        <span className="text-sm font-bold text-emerald-400 tabular-nums">
                          R$ {activeConv.order.total.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-1.5">
                        {activeConv.order.items.map((item, i) => (
                          <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-secondary text-muted-foreground">
                            {item.quantity}x {item.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Input de mensagem (quando atendente humano) */}
                  {activeConv.assignedTo === "humano" && activeConv.status !== "finalizada" && (
                    <div className="p-3 border-t border-border/30">
                      <div className="flex items-center gap-2">
                        <Input
                          value={messageInput}
                          onChange={e => setMessageInput(e.target.value)}
                          onKeyDown={e => { if (e.key === "Enter") handleSend(); }}
                          placeholder="Digite sua mensagem..."
                          className="bg-secondary border-border"
                        />
                        <button
                          onClick={handleSend}
                          disabled={!messageInput.trim() || sendMessage.isPending}
                          className="p-2.5 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors disabled:opacity-50"
                        >
                          <Send className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
                  <Bot className="w-12 h-12 mb-3 opacity-20" />
                  <p className="text-sm font-medium">Selecione uma conversa</p>
                  <p className="text-[11px] mt-1">Clique em uma conversa ao lado para visualizar</p>
                </div>
              )}
            </Card>
          </div>
        </TabsContent>

        {/* Desempenho Tab */}
        <TabsContent value="desempenho">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card className="border-border/50">
              <CardContent className="p-5">
                <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                  <Bot className="w-4 h-4 text-blue-400" /> Atendimento IA
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Atendidas pela IA</span>
                    <span className="text-sm font-bold">{stats?.iaHandled ?? 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Transferidas p/ humano</span>
                    <span className="text-sm font-bold">{stats?.humanHandled ?? 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Tempo medio de resposta</span>
                    <span className="text-sm font-bold text-green-400">{stats?.avgResponseTime ?? "—"}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Taxa de resolucao IA</span>
                    <span className="text-sm font-bold text-emerald-400">
                      {stats && stats.totalConversations > 0
                        ? `${Math.round((stats.iaHandled / stats.totalConversations) * 100)}%`
                        : "—"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardContent className="p-5">
                <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-amber-400" /> Vendas via Bot
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Pedidos hoje</span>
                    <span className="text-sm font-bold">{stats?.ordersPlaced ?? 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Faturamento</span>
                    <span className="text-sm font-bold text-amber-400">R$ {(stats?.totalRevenue ?? 0).toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Ticket medio</span>
                    <span className="text-sm font-bold">
                      {stats && stats.ordersPlaced > 0
                        ? `R$ ${(stats.totalRevenue / stats.ordersPlaced).toFixed(2)}`
                        : "—"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Taxa de conversao</span>
                    <span className="text-sm font-bold text-purple-400">{stats?.conversionRate ?? 0}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardContent className="p-5">
                <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-400" /> Satisfacao
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Nota media</span>
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-bold">{stats?.avgSatisfaction ?? "—"}</span>
                      <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Conversas finalizadas</span>
                    <span className="text-sm font-bold">{stats?.finalized ?? 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Conversas ativas</span>
                    <span className="text-sm font-bold text-green-400">{stats?.activeNow ?? 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Configuracoes Tab */}
        <TabsContent value="configuracoes">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="border-border/50">
              <CardContent className="p-5 space-y-4">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  <Phone className="w-4 h-4 text-green-400" /> Conexao WhatsApp
                </h3>
                <div>
                  <Label className="text-xs">Numero do WhatsApp</Label>
                  <Input
                    value={config?.phoneNumber ?? ""}
                    onChange={e => updateConfig.mutate({ phoneNumber: e.target.value })}
                    placeholder="+55 11 99999-9999"
                    className="mt-1 bg-secondary border-border"
                  />
                  <p className="text-[10px] text-muted-foreground mt-1">
                    Numero conectado a API do WhatsApp Business
                  </p>
                </div>
                <div>
                  <Label className="text-xs">Nome do Negocio</Label>
                  <Input
                    value={config?.businessName ?? ""}
                    onChange={e => updateConfig.mutate({ businessName: e.target.value })}
                    placeholder="Nome da pizzaria"
                    className="mt-1 bg-secondary border-border"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">Abre as</Label>
                    <Input
                      type="time"
                      value={config?.operatingHours.start ?? "18:00"}
                      onChange={e => updateConfig.mutate({ operatingHours: { start: e.target.value, end: config?.operatingHours.end ?? "23:00" } })}
                      className="mt-1 bg-secondary border-border"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Fecha as</Label>
                    <Input
                      type="time"
                      value={config?.operatingHours.end ?? "23:00"}
                      onChange={e => updateConfig.mutate({ operatingHours: { start: config?.operatingHours.start ?? "18:00", end: e.target.value } })}
                      className="mt-1 bg-secondary border-border"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardContent className="p-5 space-y-4">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  <Bot className="w-4 h-4 text-blue-400" /> Comportamento da IA
                </h3>
                <div>
                  <Label className="text-xs">Tom de Voz</Label>
                  <div className="flex gap-2 mt-1.5">
                    {(["formal", "informal", "amigavel"] as const).map(t => (
                      <button
                        key={t}
                        onClick={() => updateConfig.mutate({ tone: t })}
                        className={cn(
                          "px-3 py-1.5 rounded-lg text-xs font-medium border transition-all",
                          config?.tone === t
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border text-muted-foreground hover:border-border/80"
                        )}
                      >
                        {t === "formal" ? "Formal" : t === "informal" ? "Informal" : "Amigavel"}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <Label className="text-xs">Tempo maximo de espera (minutos)</Label>
                  <Input
                    type="number"
                    min={1}
                    max={10}
                    value={config?.maxWaitMinutes ?? 3}
                    onChange={e => updateConfig.mutate({ maxWaitMinutes: parseInt(e.target.value) || 3 })}
                    className="mt-1 bg-secondary border-border w-24"
                  />
                  <p className="text-[10px] text-muted-foreground mt-1">
                    Tempo antes de perguntar se o cliente ainda esta la
                  </p>
                </div>
                <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium">Resposta Automatica</p>
                    <p className="text-[10px] text-muted-foreground">IA responde automaticamente novas mensagens</p>
                  </div>
                  <button
                    onClick={() => updateConfig.mutate({ autoReply: !config?.autoReply })}
                    className={cn(
                      "w-11 h-6 rounded-full transition-colors relative",
                      config?.autoReply ? "bg-green-500" : "bg-secondary border border-border"
                    )}
                  >
                    <div className={cn(
                      "w-4.5 h-4.5 rounded-full bg-white absolute top-0.5 transition-all",
                      config?.autoReply ? "left-[22px]" : "left-0.5"
                    )} style={{ width: 20, height: 20 }} />
                  </button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50 lg:col-span-2">
              <CardContent className="p-5 space-y-4">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  <Smile className="w-4 h-4 text-amber-400" /> Mensagens Personalizadas
                </h3>
                <div>
                  <Label className="text-xs">Mensagem de Boas-vindas</Label>
                  <textarea
                    value={config?.greetingMessage ?? ""}
                    onChange={e => updateConfig.mutate({ greetingMessage: e.target.value })}
                    rows={3}
                    className="mt-1 w-full bg-secondary border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                    placeholder="Mensagem enviada quando o cliente inicia a conversa"
                  />
                </div>
                <div>
                  <Label className="text-xs">Mensagem Fora do Horario</Label>
                  <textarea
                    value={config?.offlineMessage ?? ""}
                    onChange={e => updateConfig.mutate({ offlineMessage: e.target.value })}
                    rows={3}
                    className="mt-1 w-full bg-secondary border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                    placeholder="Use {start} e {end} para horarios. Ex: Funcionamos das {start} as {end}"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
