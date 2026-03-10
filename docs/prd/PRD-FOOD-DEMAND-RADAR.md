# Food Demand Radar — Product Requirements Document v1.0

**Data:** 2026-03-09
**Status:** Approved
**Autor:** @pm (Morgan)

---

## 1. Visao do Produto

O Food Demand Radar e uma plataforma SaaS de inteligencia de mercado que transforma dados urbanos em vantagem competitiva para restaurantes. O sistema monitora sinais de demanda alimentar — buscas online, clima, eventos, demografia, concorrencia — e transforma em acoes concretas: campanhas automaticas, alertas de oportunidade e previsoes de vendas.

**Proposta de valor:** Saiba onde, quando e o que a cidade quer comer — antes de qualquer concorrente.

---

## 2. Problema

Restaurantes operam no escuro:
- Nao sabem quais bairros tem maior demanda para seu tipo de comida
- Lancam campanhas de marketing sem dados de timing ou segmentacao
- Decisoes de expansao sao baseadas em intuicao, nao em dados
- Nao conseguem antecipar picos de demanda (clima, eventos, horarios)
- Perdem oportunidades por nao reagir a fatores externos em tempo real

---

## 3. Personas

### P1 — Dono de Pizzaria Unica
- **Perfil:** Empreendedor, opera 1 loja, faz tudo (cozinha, marketing, gestao)
- **Dor:** Quer mais pedidos mas nao sabe como/quando anunciar
- **Necessidade:** Dashboard simples com alertas e campanhas automaticas
- **Plano:** Starter (R$197/mes)

### P2 — Gerente de Rede Pequena (2-10 unidades)
- **Perfil:** Gerente regional, precisa otimizar cada unidade
- **Dor:** Nao consegue comparar performance entre bairros
- **Necessidade:** Dados por bairro, previsao de demanda, campanhas segmentadas
- **Plano:** Professional (R$497/mes)

### P3 — Diretor de Expansao
- **Perfil:** Executivo de rede grande/franquia, decide onde abrir novas unidades
- **Dor:** Abrir no lugar errado custa R$200k+ em prejuizo
- **Necessidade:** Radar de expansao com POS Score, analise de concorrencia
- **Plano:** Enterprise (R$1.497/mes)

---

## 4. Funcionalidades (MoSCoW)

### MUST HAVE (MVP)

| ID | Feature | Descricao | AC |
|----|---------|-----------|-----|
| FR-001 | Mapa de demanda em tempo real | Heatmap por bairro mostrando nivel de demanda | Heatmap renderiza com dados de 12+ bairros, atualiza a cada 15min |
| FR-002 | Hunger Score | Score 0-100 de probabilidade de pedidos por bairro/horario | Score calculado com base em hora, dia, clima, historico |
| FR-003 | Dashboard Command Center | Painel principal com KPIs, mapa, alertas, timeline | Tela funcional com todos os widgets integrados |
| FR-004 | Alertas climaticos | Alerta automatico quando chuva/frio detectado | Alerta criado automaticamente, exibido no dashboard |
| FR-005 | Cadastro e onboarding | Login, registro, configuracao do restaurante | Fluxo completo de registro ate dashboard |
| FR-006 | Campanhas time-based | Campanhas sugeridas nos horarios de pico | Sugestoes geradas para almoco, jantar, late night |

### SHOULD HAVE (v1.1)

| ID | Feature | Descricao |
|----|---------|-----------|
| FR-007 | Pizza Opportunity Score | Score de oportunidade por bairro (demanda + populacao - concorrencia) |
| FR-008 | Mapeamento de concorrentes | Concorrentes via Google Maps com density score |
| FR-009 | Previsao de demanda 7 dias | Forecast com Prophet/XGBoost |
| FR-010 | Sabores em tendencia | Ranking de sabores por volume de busca e velocity |
| FR-011 | Integracao Google/Meta Ads | Ativar campanhas diretamente nas plataformas |
| FR-012 | Multi-categoria | Suporte a hamburger, sushi, acai alem de pizza |

### COULD HAVE (v2)

| ID | Feature | Descricao |
|----|---------|-----------|
| FR-013 | Radar de expansao | GPS para novas unidades com ranking de bairros |
| FR-014 | Campanhas por IA | Claude API gera copy e segmentacao automaticamente |
| FR-015 | Simulador de promocoes | Testar ROI antes de lancar |
| FR-016 | Previsao de vendas diarias | Quantas pizzas serao vendidas amanha |
| FR-017 | Alertas bairros subatendidos | Detectar gaps demanda vs oferta |
| FR-018 | Remarketing de fome | Re-engajar quem visitou mas nao pediu |

### WONT HAVE (agora)

| ID | Feature | Motivo |
|----|---------|--------|
| FR-019 | Marketplace API | Prematura, requer base de clientes |
| FR-020 | Integracao POS/ERP | Complexa, muitos sistemas diferentes |

---

## 5. Requisitos Nao-Funcionais

| ID | Requisito | Metrica | Estrategia |
|----|-----------|---------|------------|
| NFR-001 | Latencia do heatmap | < 2 segundos | Cache Redis, CDN, SSR |
| NFR-002 | Atualizacao de scores | A cada 15 minutos | Cron jobs + cache invalidation |
| NFR-003 | Uptime | 99.5% | Managed services (Supabase, Vercel) |
| NFR-004 | LGPD compliance | Dados agregados, sem PII | Anonimizacao, consent, DPO |
| NFR-005 | Escalabilidade | 10.000 restaurantes simultaneos | Horizontal scaling, connection pooling |
| NFR-006 | Responsividade | Mobile-first dashboard | Tailwind responsive, componentes adaptivos |

---

## 6. Restricoes

| ID | Restricao | Justificativa |
|----|-----------|---------------|
| CON-001 | MVP focado em Sao Paulo | Validar PMF em 1 cidade antes de expandir |
| CON-002 | Categoria inicial: pizza | Vertical mais popular de delivery |
| CON-003 | Managed services (Supabase, Vercel) | Reduzir overhead de infra no MVP |
| CON-004 | Timeline: 8-10 semanas | Time-to-market competitivo |

---

## 7. Metricas de Sucesso

| Horizonte | Metrica | Target |
|-----------|---------|--------|
| 30 dias | Restaurantes beta cadastrados | 50 |
| 30 dias | DAU (usuarios ativos diarios) | 20+ |
| 90 dias | NPS | > 40 |
| 90 dias | Campanhas automaticas ativadas | 1+/restaurante/semana |
| 6 meses | Restaurantes pagantes | 200 |
| 6 meses | MRR | R$ 40.000 |

---

## 8. Modelo de Negocio

| Plano | Preco | Target |
|-------|-------|--------|
| Starter | R$ 197/mes | Restaurante unico |
| Professional | R$ 497/mes | Rede 2-10 unidades |
| Enterprise | R$ 1.497/mes por regiao | Rede 10+ / franquias |

---

## 9. Stack Tecnologica

| Camada | Tecnologia |
|--------|-----------|
| Frontend | Next.js 15, Tailwind CSS, Shadcn/UI |
| Mapas | Mapbox GL JS, Deck.gl, H3 |
| API | tRPC, Node.js |
| Banco | PostgreSQL + PostGIS + TimescaleDB (Supabase) |
| ML | Python (Prophet, XGBoost) |
| LLM | Claude API (campanhas) |
| Auth | Supabase Auth |
| Deploy | Vercel (frontend), Supabase (backend) |
| Cache | Redis |

---

## 10. Riscos

| Risco | Impacto | Prob. | Mitigacao |
|-------|---------|-------|-----------|
| APIs externas mudam/param | Alto | Media | Multiplas fontes por sinal, graceful degradation |
| Scraping bloqueado (iFood) | Medio | Alta | Google Maps como fallback para dados de concorrencia |
| Baixa adocao inicial | Alto | Media | Freemium, onboarding white-glove, ROI calculator |
| Dados insuficientes cidade pequena | Medio | Media | Focar em capitais, threshold minimo |
| LGPD / privacidade | Alto | Baixa | Dados agregados, sem PII, DPO |
| Concorrente Big Tech | Alto | Baixa | Foco hiperlocal Brasil, velocidade |
