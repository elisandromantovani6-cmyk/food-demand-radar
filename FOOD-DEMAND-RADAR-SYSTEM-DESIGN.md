# FOOD DEMAND RADAR — System Design Document

**Version:** 1.0
**Date:** 2026-03-09
**Status:** Draft
**Orchestrated by:** Orion (AIOX Master) com squad multidisciplinar

---

## Squad de Especialistas Envolvidos

| Agente | Persona | Papel neste Projeto |
|--------|---------|---------------------|
| @analyst (Alex) | Ciencia de Dados & Comportamento de Consumo | Modelagem de demanda, scores, algoritmos preditivos |
| @architect (Aria) | Engenharia de Dados & Inteligencia Urbana | Arquitetura do sistema, pipelines de dados, infraestrutura |
| @pm (Morgan) | Growth Hacking & Estrategia de Negocios | Modelo SaaS, estrategia de expansao, GTM |
| @ux-design-expert (Uma) | Marketing Digital Hiperlocal | Dashboard, UX do produto, experiencia do restaurante |
| @data-engineer (Dara) | Engenharia de Dados | Schema, pipelines ETL, data warehouse |
| @dev (Dex) | Implementacao | Stack tecnica, APIs, integracao |

---

## 1. VISAO GERAL DO SISTEMA

### O que e o Food Demand Radar?

O Food Demand Radar e uma plataforma SaaS de inteligencia de mercado que transforma dados urbanos em vantagem competitiva para restaurantes. O sistema monitora continuamente sinais de demanda alimentar em uma cidade — buscas online, clima, eventos, densidade populacional, concorrencia — e transforma esses sinais em acoes concretas: campanhas automaticas, alertas de oportunidade e previsoes de vendas.

### Proposta de Valor

```
"Saiba onde, quando e o que a cidade quer comer — antes de qualquer concorrente."
```

### Publico-Alvo

| Segmento | Perfil | Plano |
|----------|--------|-------|
| Pizzaria unica | Dono-operador, 1 loja | Starter |
| Rede pequena | 2-10 unidades, gerente regional | Professional |
| Rede grande | 10+ unidades, diretoria de expansao | Enterprise |
| Dark kitchens | Operacao 100% delivery | Professional |
| Franquias | Franqueador + franqueados | Enterprise |

---

## 2. ARQUITETURA DO SISTEMA

### 2.1 Visao Macro (C4 Level 1 — Context)

```
+---------------------+       +-------------------------+       +-------------------+
|   FONTES DE DADOS   | ----> |   FOOD DEMAND RADAR     | ----> |    RESTAURANTES   |
|                     |       |       (Platform)         |       |                   |
| - Google Trends     |       | +---------------------+ |       | - Dashboard       |
| - APIs de Clima     |       | | Ingestion Layer     | |       | - Alertas Push    |
| - Redes Sociais     |       | +---------------------+ |       | - Campanhas Auto  |
| - APIs de Mapas     |       | | Processing Engine   | |       | - Relatorios      |
| - Dados Demograficos|       | +---------------------+ |       +-------------------+
| - Apps de Delivery  |       | | Intelligence Core   | |
| - Eventos Locais    |       | +---------------------+ |       +-------------------+
| - Dados Censitarios |       | | Campaign Engine     | |       |   AD PLATFORMS    |
+---------------------+       | +---------------------+ |       |                   |
                               | | API / Dashboard     | | ----> | - Google Ads      |
                               | +---------------------+ |       | - Meta Ads        |
                               +-------------------------+       | - WhatsApp API    |
                                                                  +-------------------+
```

### 2.2 Arquitetura Tecnica (C4 Level 2 — Containers)

```
+---------------------------------------------------------------------------+
|                         FOOD DEMAND RADAR PLATFORM                         |
|                                                                           |
|  +------------------+  +------------------+  +------------------------+   |
|  |  WEB DASHBOARD   |  |   MOBILE APP     |  |      API GATEWAY       |   |
|  |  (Next.js 15)    |  |  (React Native)  |  |    (API REST/GraphQL)  |   |
|  +--------+---------+  +--------+---------+  +-----------+------------+   |
|           |                      |                        |               |
|  +--------+----------------------+------------------------+----------+    |
|  |                        BFF / API LAYER                            |    |
|  |                     (Node.js + tRPC/GraphQL)                      |    |
|  +---+----------+----------+-----------+----------+-----------+------+    |
|      |          |          |           |          |           |           |
|  +---+---+ +----+----+ +--+------+ +--+------+ +-+-------+ ++---------+ |
|  |DEMAND | |CAMPAIGN | |SCORING  | |FORECAST | |GEO      | |TREND     | |
|  |ENGINE | |ENGINE   | |ENGINE   | |ENGINE   | |ENGINE   | |ENGINE    | |
|  +---+---+ +----+----+ +---+-----+ +---+-----+ +---+-----+ +---+-----+ |
|      |          |           |           |           |           |        |
|  +---+----------+----------+-----------+----------+-----------+------+   |
|  |                     EVENT BUS (Redis Streams)                     |   |
|  +---+----------+----------+-----------+----------+-----------+------+   |
|      |          |          |           |          |           |          |
|  +---+----------+----------+-----------+----------+-----------+------+   |
|  |                   DATA LAYER (PostgreSQL + TimescaleDB)           |   |
|  +-------------------------------------------------------------------+   |
|                                                                          |
|  +-------------------------------------------------------------------+   |
|  |              INGESTION LAYER (Workers + Schedulers)                |   |
|  |  Google Trends | Weather API | Social | Maps | Events | Census    |   |
|  +-------------------------------------------------------------------+   |
+---------------------------------------------------------------------------+
```

### 2.3 Stack Tecnologica

| Camada | Tecnologia | Justificativa |
|--------|-----------|---------------|
| Frontend | Next.js 15 (App Router) + Tailwind + Shadcn/UI | SSR, performance, componentes modernos |
| Mapas | Mapbox GL JS / Deck.gl | Heatmaps de alta performance, rendering GPU |
| Mobile | React Native (Expo) | Notificacoes push, alertas em tempo real |
| API | Node.js + tRPC | Type-safety end-to-end, DX excelente |
| Backend Services | Node.js + Python (ML) | Node para APIs, Python para modelos preditivos |
| Banco Relacional | PostgreSQL + PostGIS | Queries geoespaciais nativas |
| Time-Series | TimescaleDB (extensao PG) | Dados temporais de demanda, otimizado para series |
| Cache/Pub-Sub | Redis + Redis Streams | Cache quente, event bus entre microservicos |
| ML/AI | Python (scikit-learn, Prophet, XGBoost) | Previsao de demanda, classificacao |
| LLM | Claude API (Anthropic) | Geracao de copy de campanhas, analise de tendencias |
| Data Pipeline | Apache Airflow | Orquestracao de ETL, scheduling confiavel |
| Infra | Supabase (auth, DB, storage) + Vercel (frontend) | Produtividade, managed services |
| Mensageria | WhatsApp Business API + SendGrid | Alertas e campanhas |
| Monitoramento | Grafana + Prometheus | Observabilidade do sistema |

---

## 3. FONTES DE DADOS

### 3.1 Matriz de Fontes

| # | Fonte | Dados Coletados | Frequencia | API/Metodo | Custo |
|---|-------|----------------|------------|------------|-------|
| 1 | Google Trends | Volume de buscas por termos (pizza, hamburger, etc) | 1h | Google Trends API (Pytrends) | Gratuito |
| 2 | Google Maps Platform | Localizacao de concorrentes, avaliacoes, horarios | 6h | Places API + Geocoding API | Pay-per-use |
| 3 | OpenWeatherMap | Temperatura, chuva, umidade, previsao 5 dias | 30min | OneCall API 3.0 | Freemium |
| 4 | IBGE / Censo | Populacao, renda, faixa etaria por setor censitario | Mensal | API IBGE + CSV | Gratuito |
| 5 | Redes Sociais | Mencoes, hashtags, sentimento | 15min | Twitter/X API, Instagram Graph | Pago |
| 6 | iFood/Rappi (scraping etico) | Cardapios, precos, avaliacoes, categorias | 12h | Web scraping (Puppeteer) | Interno |
| 7 | Eventbrite/Sympla | Eventos locais, shows, jogos | 6h | API REST | Freemium |
| 8 | Confederacao Brasileira de Futebol | Calendario de jogos | Diario | Scraping | Gratuito |
| 9 | Prefeituras (dados abertos) | Licencas comerciais, zoneamento | Semanal | Portal dados abertos | Gratuito |
| 10 | Proprio restaurante (POS/ERP) | Historico de pedidos, ticket medio, itens | Real-time | Integracao API | Interno |

### 3.2 Pipeline de Ingestao

```
[Fontes Externas] --> [Collectors (Workers)] --> [Raw Data Lake (S3/MinIO)]
                                                         |
                                                    [Airflow DAGs]
                                                         |
                                              [Transform & Enrich]
                                                         |
                                              [PostgreSQL + TimescaleDB]
                                                         |
                                              [Materialized Views]
                                                         |
                                              [Cache Redis (hot data)]
```

**Collectors implementados como workers independentes:**

```
collector-google-trends/     # Busca tendencias por cidade/bairro
collector-weather/           # Dados climaticos em tempo real
collector-social/            # Mencoes em redes sociais
collector-maps/              # Concorrentes e POIs
collector-events/            # Eventos locais
collector-demographics/      # Dados censitarios
collector-pos-integration/   # Dados do proprio restaurante
```

---

## 4. MOTORES DE INTELIGENCIA (ENGINES)

### 4.1 DEMAND ENGINE — Deteccao de Demanda (Itens 1, 2, 3, 6, 18)

O Demand Engine e o coracao do sistema. Ele detecta, quantifica e geolocaliza a demanda por alimentos em tempo real.

#### 4.1.1 Sinais de Demanda Capturados

| Sinal | Peso | Fonte | Latencia |
|-------|------|-------|----------|
| Buscas "pizza perto de mim" | Alto (0.25) | Google Trends | ~1h |
| Buscas por sabores especificos | Medio (0.15) | Google Trends | ~1h |
| Buscas por promocoes de pizza | Alto (0.20) | Google Trends | ~1h |
| Mencoes em redes sociais | Medio (0.10) | Twitter/Instagram | ~15min |
| Horario do dia (padrao circadiano) | Alto (0.15) | Interno (modelo) | Real-time |
| Condicoes climaticas | Medio (0.10) | Weather API | ~30min |
| Eventos acontecendo | Baixo (0.05) | Events API | ~6h |

#### 4.1.2 Modelo de Deteccao de Demanda

```python
class DemandDetector:
    """
    Detecta demanda agregando multiplos sinais com pesos dinamicos.
    Output: DemandScore por (bairro, categoria_alimento, janela_tempo)
    """

    def calculate_demand_score(self, neighborhood_id, food_category, timestamp):
        signals = {
            'search_volume': self.get_search_signal(neighborhood_id, food_category),
            'social_mentions': self.get_social_signal(neighborhood_id, food_category),
            'time_pattern': self.get_circadian_signal(timestamp, food_category),
            'weather_boost': self.get_weather_signal(neighborhood_id, timestamp),
            'event_boost': self.get_event_signal(neighborhood_id, timestamp),
            'historical_orders': self.get_historical_signal(neighborhood_id, food_category, timestamp),
        }

        # Pesos adaptativos via modelo treinado
        weights = self.model.get_weights(neighborhood_id, food_category)

        raw_score = sum(signals[k] * weights[k] for k in signals)

        # Normalizar para 0-100
        return self.normalize(raw_score, min_val=0, max_val=100)
```

#### 4.1.3 Mapa de Demanda da Cidade (Heatmap)

O mapa de calor e gerado em tempo real usando dados de todos os sinais:

```
Resolucao: Hexagono H3 nivel 8 (~460m de diametro)
Atualizacao: A cada 15 minutos
Camadas:
  - Demanda total (agregada)
  - Demanda por categoria (pizza, hamburger, sushi, acai)
  - Delta de demanda (crescimento vs periodo anterior)
  - Demanda vs oferta (gap de mercado)
```

**Sistema de hexagonos H3:**
Cada hexagono cobre ~460m e contem um DemandScore atualizado. A visualizacao usa Deck.gl H3HexagonLayer para rendering GPU-accelerated.

#### 4.1.4 Descoberta de Bairros de Alta Demanda

Fatores estruturais que indicam potencial permanente:

```
STRUCTURAL_DEMAND_FACTORS = {
    'population_density': {
        'source': 'IBGE censo',
        'weight': 0.25,
        'logic': 'Maior densidade = mais bocas para alimentar'
    },
    'apartment_ratio': {
        'source': 'IBGE domicilios',
        'weight': 0.20,
        'logic': 'Apartamentos = menor cozinha = mais delivery'
    },
    'university_proximity': {
        'source': 'MEC + Google Maps',
        'weight': 0.15,
        'logic': 'Estudantes = alta propensao a delivery noturno'
    },
    'income_bracket': {
        'source': 'IBGE renda',
        'weight': 0.15,
        'logic': 'Renda media-alta = ticket maior, mais pedidos'
    },
    'young_adult_ratio': {
        'source': 'IBGE faixa etaria',
        'weight': 0.15,
        'logic': '18-35 anos = maior consumo de delivery'
    },
    'commercial_density': {
        'source': 'Prefeitura',
        'weight': 0.10,
        'logic': 'Zonas comerciais = demanda no almoco'
    }
}
```

---

### 4.2 SCORING ENGINE — Indicadores de Oportunidade (Itens 5, 8)

#### 4.2.1 PIZZA OPPORTUNITY SCORE (POS)

Indica o potencial de mercado de um bairro para um tipo de alimento.

```
POS = (D * 0.35) + (P * 0.25) + (I * 0.15) - (C * 0.25)

Onde:
  D = Demand Score (0-100)      -> Demanda digital detectada
  P = Population Score (0-100)  -> Potencial demografico
  I = Income Score (0-100)      -> Capacidade de gasto
  C = Competition Score (0-100) -> Saturacao de concorrentes

Resultado:
  0-20:   Oportunidade Baixa (mercado saturado ou sem demanda)
  21-40:  Oportunidade Moderada (vale monitorar)
  41-60:  Boa Oportunidade (considerar acao)
  61-80:  Alta Oportunidade (agir rapidamente)
  81-100: Oportunidade Excepcional (blue ocean detectado)
```

**Exemplo pratico:**

```
Bairro: Jardim Botanico
  D (Demand):      72  (buscas crescentes, mencoes altas)
  P (Population):  85  (alta densidade, muitos apartamentos)
  I (Income):      78  (renda media-alta)
  C (Competition): 30  (apenas 2 pizzarias no raio de 2km)

  POS = (72 * 0.35) + (85 * 0.25) + (78 * 0.15) - (30 * 0.25)
  POS = 25.2 + 21.25 + 11.7 - 7.5
  POS = 50.65 → "Boa Oportunidade"
```

#### 4.2.2 HUNGER SCORE

Indica a probabilidade de pedidos em um bairro num momento especifico.

```
HUNGER_SCORE = f(hora, dia_semana, clima, eventos, historico)

Modelo: Gradient Boosting (XGBoost) treinado com dados historicos

Features:
  - hora_do_dia (0-23)
  - dia_da_semana (0-6)
  - temperatura_atual
  - esta_chovendo (bool)
  - tem_evento_proximo (bool)
  - tipo_evento (futebol, show, feriado)
  - media_pedidos_historica_mesmo_slot
  - tendencia_buscas_ultima_hora
  - mencoes_sociais_ultima_hora

Output: Probabilidade 0-100 de pico de pedidos
```

**Padroes de Fome Detectados:**

```yaml
padroes_circadianos:
  almoco:
    inicio: "11:00"
    pico: "12:30"
    fim: "14:00"
    categorias_fortes: ["marmita", "hamburger", "pizza"]

  lanche_tarde:
    inicio: "15:00"
    pico: "16:00"
    fim: "17:00"
    categorias_fortes: ["acai", "lanche", "doces"]

  jantar:
    inicio: "18:30"
    pico: "20:00"
    fim: "22:00"
    categorias_fortes: ["pizza", "hamburger", "sushi", "japonesa"]

  late_night:
    inicio: "22:00"
    pico: "23:30"
    fim: "01:00"
    categorias_fortes: ["pizza", "hamburger", "pastel"]

padroes_semanais:
  segunda_a_quinta:
    multiplicador: 1.0
    pico_principal: "jantar"

  sexta:
    multiplicador: 1.4
    pico_principal: "jantar + late_night"
    nota: "Maior noite de delivery da semana"

  sabado:
    multiplicador: 1.3
    picos: ["almoco", "jantar"]

  domingo:
    multiplicador: 1.2
    pico_principal: "almoco + jantar"
    nota: "Almoco de domingo forte para pizza"
```

---

### 4.3 COMPETITION ENGINE — Analise de Concorrencia (Item 4)

#### Mapeamento Automatico de Concorrentes

```python
class CompetitionMapper:
    """
    Mapeia todos os concorrentes de um restaurante em uma area.
    Fontes: Google Maps, iFood, Rappi, Instagram.
    """

    def map_competitors(self, lat, lng, radius_km, food_category):
        competitors = []

        # Google Maps Places API
        google_results = self.google_maps.nearby_search(
            lat, lng, radius_km * 1000,
            keyword=food_category,
            type='restaurant'
        )
        for place in google_results:
            competitors.append({
                'source': 'google_maps',
                'name': place.name,
                'rating': place.rating,
                'review_count': place.user_ratings_total,
                'price_level': place.price_level,
                'location': place.geometry.location,
                'is_open': place.opening_hours.open_now,
            })

        # iFood (scraping etico, respeitando robots.txt)
        ifood_results = self.ifood_collector.search(lat, lng, food_category)
        for restaurant in ifood_results:
            competitors.append({
                'source': 'ifood',
                'name': restaurant.name,
                'rating': restaurant.rating,
                'delivery_fee': restaurant.delivery_fee,
                'delivery_time': restaurant.delivery_time,
                'price_range': restaurant.price_range,
            })

        return self.deduplicate_and_merge(competitors)

    def calculate_competition_density(self, neighborhood_id, food_category):
        """Retorna score 0-100 de saturacao competitiva"""
        competitors = self.get_competitors_in_neighborhood(neighborhood_id, food_category)
        population = self.demographics.get_population(neighborhood_id)

        # Razao restaurantes por 1000 habitantes
        ratio = (len(competitors) / population) * 1000

        # Benchmarks por categoria
        benchmarks = {
            'pizza': {'low': 0.5, 'medium': 1.5, 'high': 3.0},
            'hamburger': {'low': 0.8, 'medium': 2.0, 'high': 4.0},
            'sushi': {'low': 0.2, 'medium': 0.8, 'high': 1.5},
        }

        return self.normalize_to_score(ratio, benchmarks[food_category])
```

**Output do Competition Engine:**

| Bairro | Pizzarias | Pop. | Ratio/1000hab | Score | Classificacao |
|--------|-----------|------|---------------|-------|---------------|
| Centro | 12 | 8.000 | 1.50 | 65 | Alta concorrencia |
| Jd. Botanico | 2 | 15.000 | 0.13 | 12 | Baixissima concorrencia |
| Vila Nova | 5 | 20.000 | 0.25 | 22 | Baixa concorrencia |
| Universitario | 8 | 12.000 | 0.67 | 45 | Media concorrencia |

---

### 4.4 FORECAST ENGINE — Previsao de Demanda (Itens 9, 26, 36, 41)

#### Modelo Preditivo Multi-Horizonte

```python
class DemandForecaster:
    """
    Previsao de demanda em 3 horizontes:
    - Short-term: proximas 4 horas (operacional)
    - Medium-term: proximos 7 dias (tatico)
    - Long-term: proximo mes (estrategico)
    """

    def __init__(self):
        # Prophet para tendencias e sazonalidade
        self.prophet_model = Prophet(
            yearly_seasonality=True,
            weekly_seasonality=True,
            daily_seasonality=True,
        )
        # XGBoost para features externas
        self.xgboost_model = XGBRegressor()
        # Ensemble final
        self.ensemble_weights = {'prophet': 0.4, 'xgboost': 0.6}

    def forecast_short_term(self, restaurant_id, horizon_hours=4):
        """
        Previsao operacional: quantos pedidos nas proximas 4 horas?
        Usado para: preparacao de massa, escala de equipe
        """
        features = self.build_features(restaurant_id, horizon_hours)
        # Features incluem:
        # - hora_do_dia, dia_semana
        # - clima_atual e previsao_proximas_horas
        # - eventos_proximos
        # - historico_mesmo_slot_ultimas_8_semanas
        # - tendencia_buscas_ultima_hora
        # - hunger_score_atual_do_bairro

        prophet_pred = self.prophet_model.predict(features.time_df)
        xgb_pred = self.xgboost_model.predict(features.feature_matrix)

        return (
            prophet_pred * self.ensemble_weights['prophet'] +
            xgb_pred * self.ensemble_weights['xgboost']
        )

    def forecast_daily_sales(self, restaurant_id, date):
        """
        Previsao diaria: quantas pizzas serao vendidas amanha?
        Usado para: compra de insumos, planejamento de equipe
        """
        features = {
            'day_of_week': date.weekday(),
            'is_holiday': self.calendar.is_holiday(date),
            'weather_forecast': self.weather.get_forecast(date),
            'events': self.events.get_events(date),
            'historical_same_dow': self.history.avg_sales(restaurant_id, date.weekday()),
            'trend_coefficient': self.trend.get_growth_rate(restaurant_id),
        }
        return self.xgboost_model.predict(features)

    def detect_demand_surge(self, neighborhood_id):
        """
        ALERTA DE PICO: detecta quando demanda esta prestes a explodir
        Gatilhos: chuva subita, gol em jogo, trending topic
        """
        current_demand = self.demand_engine.get_current(neighborhood_id)
        baseline = self.demand_engine.get_baseline(neighborhood_id)
        velocity = self.demand_engine.get_velocity(neighborhood_id)  # taxa de mudanca

        if velocity > SURGE_THRESHOLD and current_demand > baseline * 1.3:
            return SurgeAlert(
                neighborhood_id=neighborhood_id,
                severity='HIGH',
                estimated_peak_minutes=self.estimate_peak_time(velocity),
                recommended_actions=[
                    'Ativar equipe extra',
                    'Lancar campanha relampago',
                    'Aumentar area de delivery',
                ]
            )
```

#### Gatilhos de Demanda (Item 7)

```yaml
demand_triggers:
  weather:
    rain:
      impact: "+25-40% pedidos delivery"
      detection: "weather API precip > 0.5mm"
      latency: "15min apos inicio da chuva"
      action: "Ativar campanha 'Dia de chuva, dia de pizza'"

    cold_front:
      impact: "+15-25% pedidos"
      detection: "temperatura cai > 5C em 6h"
      action: "Campanha comfort food"

    extreme_heat:
      impact: "+30% acai/sorvete, -10% pizza"
      detection: "temperatura > 35C"
      action: "Promover bebidas e sobremesas geladas"

  events:
    football_match:
      impact: "+35-50% pedidos pizza no bairro do estadio + bairros residenciais"
      detection: "API calendario CBF + hora do jogo"
      window: "1h antes do jogo ate 30min apos"
      action: "Combo jogo: pizza + refri"

    local_festival:
      impact: "+20% geral na regiao"
      detection: "Eventbrite/Sympla API"
      action: "Campanha geo-targeted no raio do evento"

    holiday:
      impact: "variavel por feriado"
      detection: "Calendario brasileiro"
      action: "Cardapio tematico"

  digital:
    viral_food_post:
      impact: "spike de 200-500% para o item viralizado"
      detection: "Social listening: mencoes > 3x baseline"
      action: "Destacar item no cardapio + campanha"

    competitor_outage:
      impact: "Redistribuicao de demanda"
      detection: "Reviews negativas spike + status iFood"
      action: "Anuncio geo-targeted na area do concorrente"
```

---

### 4.5 TREND ENGINE — Sabores e Tendencias (Itens 10, 31, 38, 40)

#### Deteccao de Sabores em Tendencia

```python
class FlavorTrendDetector:
    """
    Detecta sabores em alta na cidade usando multiplos sinais.
    """

    def detect_trending_flavors(self, city_id, food_category='pizza'):
        trends = []

        # 1. Google Trends por sabor
        flavors_to_track = self.get_flavor_list(food_category)
        for flavor in flavors_to_track:
            trend_data = google_trends.get_interest(
                keyword=f"pizza {flavor}",
                geo=city_id,
                timeframe='now 7-d'
            )
            if trend_data.velocity > TRENDING_THRESHOLD:
                trends.append({
                    'flavor': flavor,
                    'signal': 'google_trends',
                    'velocity': trend_data.velocity,  # taxa de crescimento
                    'volume': trend_data.volume,
                })

        # 2. Mencoes em redes sociais
        social_trends = self.social_listener.get_food_mentions(
            city_id, food_category, window='7d'
        )
        for mention in social_trends.top_flavors:
            trends.append({
                'flavor': mention.flavor,
                'signal': 'social',
                'sentiment': mention.avg_sentiment,
                'volume': mention.count,
            })

        # 3. Dados de vendas agregados (anonimizados) dos restaurantes na plataforma
        sales_trends = self.sales_analyzer.get_growing_items(
            city_id, food_category, window='30d'
        )

        return self.rank_and_merge(trends, sales_trends)

    def recommend_menu_additions(self, restaurant_id):
        """
        Recomenda sabores para adicionar ao cardapio baseado em:
        - Tendencias da cidade que o restaurante NAO oferece
        - Gap analysis vs concorrentes
        - Sazonalidade historica
        """
        city_trends = self.detect_trending_flavors(restaurant.city_id)
        restaurant_menu = self.get_current_menu(restaurant_id)
        competitor_menus = self.get_competitor_menus(restaurant_id)

        recommendations = []
        for trend in city_trends:
            if trend.flavor not in restaurant_menu:
                competitor_count = sum(
                    1 for c in competitor_menus
                    if trend.flavor in c.items
                )
                recommendations.append({
                    'flavor': trend.flavor,
                    'trend_score': trend.velocity,
                    'competitors_offering': competitor_count,
                    'estimated_demand': self.estimate_item_demand(trend),
                    'priority': 'HIGH' if trend.velocity > 2.0 else 'MEDIUM',
                })

        return sorted(recommendations, key=lambda x: x['trend_score'], reverse=True)
```

**Sabores monitorados (pizza):**

```yaml
flavor_watchlist:
  classicos:
    - calabresa
    - mussarela
    - margherita
    - portuguesa
    - quatro queijos
    - frango com catupiry

  gourmet:
    - burrata com presunto parma
    - trufa negra
    - gorgonzola com mel
    - camarão

  tendencia:
    - pistache
    - cheddar com bacon
    - costela desfiada
    - pulled pork

  doces:
    - chocolate com morango
    - romeu e julieta
    - nutella com banana
```

---

### 4.6 CAMPAIGN ENGINE — Motor de Campanhas (Itens 11-16, 22, 25, 27-30, 35)

#### 4.6.1 Arquitetura do Campaign Engine

```
+-------------------+     +------------------+     +------------------+
|  TRIGGER SYSTEM   | --> |  CAMPAIGN BRAIN  | --> |  DELIVERY SYSTEM |
|                   |     |                  |     |                  |
| - Weather alerts  |     | - Template select|     | - Google Ads API |
| - Demand surges   |     | - Audience build |     | - Meta Ads API   |
| - Time patterns   |     | - Copy generation|     | - WhatsApp API   |
| - Event detection |     | - Budget calc    |     | - Push notif.    |
| - Competitor gaps  |     | - A/B variants   |     | - SMS gateway    |
+-------------------+     +------------------+     +------------------+
                                   |
                           +-------+--------+
                           | CLAUDE API     |
                           | (copy + creative|
                           |  generation)    |
                           +----------------+
```

#### 4.6.2 Tipos de Campanha Automatica

```yaml
campaign_types:

  # --- GEO-TARGETED (Itens 11, 13, 25) ---
  hyperlocal:
    name: "Campanha Hiper-Local"
    trigger: "POS > 60 em bairro especifico"
    audience: "Raio de 1-3km do restaurante"
    platforms: ["google_ads", "meta_ads"]
    targeting:
      - geo_radius: "1.5km"
      - age: "18-45"
      - interests: ["delivery", "pizza", "gastronomia"]
    example_copy: "Promoção especial para o bairro {bairro}: Pizza grande + refri por R$39,90. Só hoje!"
    budget: "R$30-100/dia por micro-zona"

  micro_neighborhood:
    name: "Campanha de Micro-Bairro"
    trigger: "Hunger Score > 70 em hexagono H3 especifico"
    audience: "Raio de 500m-1km"
    platforms: ["meta_ads", "whatsapp"]
    targeting:
      - geo_polygon: "hexagono H3 level 8"
      - custom_audience: "lookalike de clientes existentes no hex"
    example_copy: "Vizinho, sua pizza favorita está a {distance}min de voce!"

  # --- TIME-BASED (Itens 14, 30) ---
  hunger_moment:
    name: "Momento da Fome"
    trigger: "Hunger Score > 75 AND hora dentro de janela de pico"
    timing:
      almoco: "11:00-11:30 (antecipar o pico)"
      jantar: "17:30-18:30 (antecipar o pico)"
      late_night: "21:30-22:00"
    example_copy: "Bateu a fome? Peça agora e receba em {time}min!"

  dynamic_pricing:
    name: "Promoção Dinamica por Horario"
    trigger: "Horario de baixa demanda detectado"
    logic:
      off_peak_discount: "15-25% desconto entre 14h-17h"
      early_bird: "10% desconto pedidos antes das 11h30"
      late_night_combo: "Combo especial apos 22h"
    example:
      "14:00-17:00": "Happy Hour Pizza: 20% off em todas as pizzas!"
      "22:00-00:00": "Late Night: Pizza + Guarana por R$34,90"

  # --- WEATHER-BASED (Itens 16, 23) ---
  weather_triggered:
    name: "Campanha Climatica"
    triggers:
      rain_start:
        condition: "precipitacao > 0.5mm AND forecast_rain_next_2h"
        delay: "5 minutos apos inicio da chuva"
        copy: "Chovendo ai? Fica em casa! Pizza quentinha na sua porta em {time}min"
        boost: "+30% budget"

      cold_snap:
        condition: "temperatura < 15C OR queda > 5C em 6h"
        copy: "Noite fria pede pizza! Bordas recheadas gratis hoje"
        boost: "+20% budget"

      heat_wave:
        condition: "temperatura > 33C"
        copy: "Calor demais pra cozinhar. Pede uma pizza!"
        boost: "+15% budget"

  # --- EVENT-BASED (Item 27) ---
  football_match:
    name: "Campanha Dia de Jogo"
    trigger: "Jogo detectado no calendario (CBF/estaduais)"
    timing:
      pre_game: "2h antes do jogo"
      halftime: "Intervalo do jogo"
      post_game: "Ate 1h apos o jogo"
    targeting:
      geo: "Bairros residenciais (nao no estadio)"
      interests: ["futebol", "esportes"]
    offers:
      combo_jogo: "Pizza GG + 2 refris por R$54,90"
      segundo_sabor: "Segundo sabor com 50% off"
    copy: "Jogo do {team} hoje! Garanta sua pizza para a partida"

  # --- INTENT-BASED (Itens 12, 28, 29) ---
  search_intercept:
    name: "Interceptacao de Busca"
    trigger: "Usuario buscou 'pizzaria', 'pizza delivery', sabores"
    platform: "Google Ads Search"
    strategy:
      keywords:
        exact: ["pizza delivery {cidade}", "pizzaria perto de mim", "melhor pizza {bairro}"]
        phrase: ["pizza {sabor}", "promoção pizza", "pizza aberta agora"]
      ad_extensions:
        location: true
        call: true
        price: true
        promotion: true
      bid_strategy: "Maximize conversions com CPA target"

  remarketing:
    name: "Remarketing de Fome"
    trigger: "Usuario visitou site/app mas nao pediu"
    windows:
      hot: "0-2h apos visita (mesmo sessao de fome)"
      warm: "24h apos (proximo ciclo de fome)"
      cold: "7 dias apos (reconquista)"
    platforms: ["google_display", "meta_retargeting"]
    copy:
      hot: "Ainda com fome? Sua pizza esta esperando! Finalize o pedido"
      warm: "Lembra daquela pizza? Hoje com 10% off pra voce voltar"
      cold: "Faz tempo! Que tal matar a saudade? Cupom VOLTEI de 15%"
```

#### 4.6.3 Geracao de Campanhas por IA (Claude API)

```python
class CampaignCopyGenerator:
    """
    Usa Claude API para gerar copy personalizado para cada campanha.
    """

    def generate_campaign(self, context):
        prompt = f"""
        Voce e um copywriter especialista em delivery de comida.
        Gere uma campanha para:

        Restaurante: {context.restaurant_name}
        Tipo: {context.campaign_type}
        Bairro alvo: {context.neighborhood}
        Horario: {context.time_slot}
        Clima: {context.weather}
        Evento: {context.event or 'Nenhum'}
        Oferta: {context.offer}
        Historico de melhor copy: {context.best_performing_copy}

        Gere:
        1. Titulo (max 30 chars)
        2. Descricao (max 90 chars)
        3. CTA (call to action)
        4. 3 variantes para teste A/B
        """

        response = anthropic.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=500,
            messages=[{"role": "user", "content": prompt}]
        )
        return self.parse_campaign_variants(response)
```

#### 4.6.4 Ofertas Irresistiveis (Item 15)

```yaml
offer_library:
  combos:
    - name: "Combo Familia"
      items: "2 pizzas GG + refrigerante 2L + sobremesa"
      discount: "25% vs itens separados"
      best_for: ["domingo_almoco", "sabado_jantar"]

    - name: "Combo Casal"
      items: "1 pizza grande + 2 refris lata + borda recheada"
      discount: "20%"
      best_for: ["sexta_jantar", "sabado_jantar"]

    - name: "Combo Jogo"
      items: "1 pizza GG + 2 refris 600ml"
      discount: "15%"
      best_for: ["football_match"]

  freebies:
    - trigger: "primeiro_pedido"
      offer: "Refrigerante 2L gratis"
    - trigger: "pedido_acima_60"
      offer: "Borda recheada gratis em todas as pizzas"
    - trigger: "pedido_chuva"
      offer: "Entrega gratis (frete zero)"

  urgency:
    - type: "countdown"
      copy: "So nas proximas 2 horas!"
    - type: "limited_stock"
      copy: "Ultimas 20 unidades com desconto!"
    - type: "flash_sale"
      copy: "Flash: 30% off nos proximos 30 minutos!"

  loyalty:
    - type: "punch_card"
      rule: "A cada 10 pizzas, 1 gratis"
    - type: "birthday"
      rule: "Pizza doce gratis no aniversario"
    - type: "reactivation"
      rule: "Cupom 20% para quem nao pede ha 30 dias"
```

#### 4.6.5 Simulador de Promocoes (Item 39)

```python
class PromotionSimulator:
    """
    Permite testar promocoes antes de lancar.
    Usa dados historicos + modelo preditivo para estimar resultados.
    """

    def simulate(self, promotion, restaurant_id, duration_days=7):
        baseline = self.get_baseline_metrics(restaurant_id, duration_days)

        # Fatores do modelo
        discount_elasticity = self.model.get_price_elasticity(restaurant_id)
        reach_estimate = self.estimate_reach(promotion.targeting, promotion.budget)
        conversion_rate = self.model.get_conversion_rate(
            promotion.type, restaurant_id
        )

        projected = {
            'orders_increase': baseline.avg_daily_orders * discount_elasticity * promotion.discount_pct,
            'revenue_change': self.calc_revenue_impact(baseline, promotion, discount_elasticity),
            'new_customers': reach_estimate * conversion_rate,
            'cost': promotion.budget + (promotion.discount_value * projected_orders),
            'roi': (projected_revenue - total_cost) / total_cost * 100,
            'break_even_days': total_cost / daily_profit_increase,
        }

        return SimulationResult(
            scenario='optimistic' if projected['roi'] > 50 else 'conservative',
            metrics=projected,
            recommendation=self.generate_recommendation(projected),
            confidence=0.75,  # baseado em volume de dados historicos
        )
```

---

### 4.7 GEO ENGINE — Inteligencia Geoespacial (Itens 21, 32, 37, 42)

#### GPS para Abrir Restaurantes / Radar de Expansao

```python
class ExpansionRadar:
    """
    Sistema que indica onde abrir restaurantes lucrativos.
    Combina todos os scores para gerar recomendacao geoespacial.
    """

    def find_best_locations(self, city_id, food_category, top_n=10):
        neighborhoods = self.geo.get_all_neighborhoods(city_id)
        scored = []

        for hood in neighborhoods:
            pos = self.scoring.pizza_opportunity_score(hood.id, food_category)
            demand = self.demand.get_average_demand(hood.id, food_category, window='30d')
            competition = self.competition.get_density(hood.id, food_category)
            growth = self.demand.get_growth_rate(hood.id, food_category, window='90d')
            infrastructure = self.assess_infrastructure(hood.id)

            expansion_score = (
                pos * 0.30 +
                demand * 0.25 +
                (100 - competition) * 0.20 +
                growth * 0.15 +
                infrastructure * 0.10
            )

            scored.append({
                'neighborhood': hood,
                'expansion_score': expansion_score,
                'pos': pos,
                'demand': demand,
                'competition': competition,
                'growth_trend': growth,
                'estimated_monthly_revenue': self.estimate_revenue(hood.id, food_category),
                'estimated_break_even_months': self.estimate_break_even(hood.id, food_category),
                'risk_level': self.assess_risk(hood.id, food_category),
            })

        return sorted(scored, key=lambda x: x['expansion_score'], reverse=True)[:top_n]

    def detect_underserved_neighborhoods(self, city_id, food_category):
        """
        ALERTA: Bairros subatendidos — alta demanda, poucas opcoes
        """
        neighborhoods = self.geo.get_all_neighborhoods(city_id)
        underserved = []

        for hood in neighborhoods:
            demand = self.demand.get_average_demand(hood.id, food_category)
            supply = self.competition.count_restaurants(hood.id, food_category)
            ratio = demand / max(supply, 1)

            if ratio > UNDERSERVED_THRESHOLD:
                underserved.append({
                    'neighborhood': hood,
                    'demand_score': demand,
                    'restaurant_count': supply,
                    'demand_supply_ratio': ratio,
                    'estimated_unmet_demand': self.estimate_unmet(demand, supply),
                    'alert_level': 'CRITICAL' if ratio > 5 else 'HIGH',
                })

        return sorted(underserved, key=lambda x: x['demand_supply_ratio'], reverse=True)
```

#### Mapa de Consumo Urbano (Item 42)

```yaml
urban_consumption_map:
  layers:
    base:
      - neighborhoods (polygons)
      - streets (lines)
      - poi_restaurants (points)

    demand_heatmap:
      - source: "demand_engine real-time"
      - color_scale: "blue(low) -> yellow(medium) -> red(high)"
      - resolution: "H3 level 8"
      - update: "15min"

    competition_overlay:
      - source: "competition_engine"
      - display: "circles sized by restaurant count"
      - color: "green(low) -> red(high) competition"

    opportunity_zones:
      - source: "scoring_engine POS > 60"
      - display: "highlighted polygons with pulsing border"
      - label: "POS score + estimated revenue"

    expansion_pins:
      - source: "geo_engine top 10 locations"
      - display: "numbered pins with details on hover"
      - info: "score, demand, competition, estimated revenue"

    event_markers:
      - source: "event_collector"
      - display: "icons by event type"
      - radius: "impact zone around event"
```

---

## 5. DASHBOARD DE INTELIGENCIA (Item 17)

### 5.1 Estrutura de Telas

```
FOOD DEMAND RADAR — Dashboard

├── Home / Command Center
│   ├── Mapa de Demanda em Tempo Real (heatmap principal)
│   ├── Hunger Score da cidade (gauge)
│   ├── Alertas ativos (surges, clima, eventos)
│   └── KPIs do dia (pedidos, receita, ticket medio)
│
├── Demand Radar
│   ├── Mapa de calor por bairro
│   ├── Timeline de demanda (24h)
│   ├── Comparativo bairro-a-bairro
│   └── Drill-down por hexagono H3
│
├── Competition Map
│   ├── Mapa de concorrentes
│   ├── Gap analysis por bairro
│   ├── Comparativo de precos/avaliacoes
│   └── Bairros subatendidos (alertas)
│
├── Forecast Center
│   ├── Previsao proximas 4h / 7 dias / 30 dias
│   ├── Previsao de vendas diarias
│   ├── Impacto de eventos proximos
│   └── Weather impact forecast
│
├── Trend Observatory
│   ├── Sabores em tendencia (ranking)
│   ├── Tendencias emergentes (velocity chart)
│   ├── Recomendacoes de cardapio
│   └── Benchmark vs concorrentes
│
├── Campaign Hub
│   ├── Campanhas ativas (status, metricas)
│   ├── Campanhas automaticas (log de acoes)
│   ├── Simulador de promocoes
│   ├── Performance por tipo de campanha
│   └── ROI tracker
│
├── Expansion Radar
│   ├── Mapa de oportunidades (POS)
│   ├── Top 10 locais para expansao
│   ├── Bairros subatendidos
│   └── Simulador de nova unidade
│
├── Analytics
│   ├── Historico de pedidos
│   ├── Analise de sazonalidade
│   ├── Customer insights
│   └── Relatorios exportaveis
│
└── Settings
    ├── Configuracao do restaurante
    ├── Integracoes (POS, iFood, etc)
    ├── Alertas e notificacoes
    └── Plano e faturamento
```

### 5.2 Command Center (Tela Principal)

```
+------------------------------------------------------------------------+
|  FOOD DEMAND RADAR            [Sao Paulo - SP]     [Alertas: 3]  [⚙]  |
+------------------------------------------------------------------------+
|                                                                        |
|  +-------------------------------------------+  +--------------------+ |
|  |                                           |  | HUNGER SCORE       | |
|  |         MAPA DE DEMANDA EM TEMPO REAL     |  |                    | |
|  |                                           |  |    ████ 73/100     | |
|  |         [Heatmap Deck.gl/Mapbox]          |  |    ▲ +12 vs ontem | |
|  |                                           |  |                    | |
|  |    🔴 Alta   🟡 Media   🔵 Baixa          |  | Pico previsto:     | |
|  |                                           |  | 20:00 (87/100)     | |
|  +-------------------------------------------+  +--------------------+ |
|                                                                        |
|  +--------------------+  +-----------+  +----------+  +-----------+    |
|  | Pedidos Hoje       |  | Receita   |  | Ticket   |  | Novos     |    |
|  | 📦 247 (+18%)      |  | R$8.420   |  | R$34,10  |  | 23 clients|    |
|  +--------------------+  +-----------+  +----------+  +-----------+    |
|                                                                        |
|  ALERTAS ATIVOS                                                        |
|  +------------------------------------------------------------------+  |
|  | ⚡ SURGE: Hunger Score no Centro subiu para 85 — campanha ativada|  |
|  | 🌧 CLIMA: Chuva prevista 18h — campanha climatica agendada       |  |
|  | ⚽ EVENTO: Jogo Corinthians 21h — combo jogo preparado            |  |
|  +------------------------------------------------------------------+  |
|                                                                        |
|  BAIRROS MAIS QUENTES          SABORES EM TENDENCIA                    |
|  +------------------------+   +----------------------------+           |
|  | 1. Centro      (89/100)|   | 🔥 Calabresa       ▲ +15% |           |
|  | 2. Vila Nova   (76/100)|   | 🔥 4 Queijos       ▲ +12% |           |
|  | 3. Jd Botanico (72/100)|   | 📈 Costela Desfiad ▲ +28% |           |
|  | 4. Universitario(68/100)|   | 📈 Pistache        ▲ +45% |           |
|  +------------------------+   +----------------------------+           |
+------------------------------------------------------------------------+
```

---

## 6. MODELO DE NEGOCIO SaaS

### 6.1 Planos e Pricing

```yaml
plans:
  starter:
    name: "Starter"
    price: "R$ 197/mes"
    target: "Pizzaria/restaurante unico"
    features:
      - Mapa de demanda (atualizacao 1h)
      - Hunger Score do bairro
      - 3 campanhas automaticas/mes
      - Dashboard basico
      - Alertas de clima
      - 1 categoria de alimento
    limits:
      neighborhoods_monitored: 5
      campaigns_per_month: 3
      api_calls: 10000
      users: 2
      data_retention: "90 dias"

  professional:
    name: "Professional"
    price: "R$ 497/mes"
    target: "Rede pequena / dark kitchen"
    features:
      - Tudo do Starter +
      - Mapa de demanda em tempo real (15min)
      - Pizza Opportunity Score completo
      - Campanhas automaticas ilimitadas
      - Analise de concorrencia
      - Previsao de demanda (7 dias)
      - Sabores em tendencia
      - Integracao com Google/Meta Ads
      - Simulador de promocoes
      - Ate 5 categorias de alimento
    limits:
      neighborhoods_monitored: 20
      campaigns_per_month: "ilimitado"
      api_calls: 100000
      users: 10
      locations: 5
      data_retention: "1 ano"

  enterprise:
    name: "Enterprise"
    price: "R$ 1.497/mes (por regiao)"
    target: "Rede grande / franquia"
    features:
      - Tudo do Professional +
      - Radar de expansao completo
      - GPS para novas unidades
      - Previsao de vendas diarias por unidade
      - Alertas de bairros subatendidos
      - Mapa de consumo urbano
      - API completa para integracao
      - Geracao de campanhas por IA (Claude)
      - Relatorios executivos automaticos
      - Multi-cidade
      - Todas as categorias de alimento
      - Account manager dedicado
    limits:
      neighborhoods_monitored: "ilimitado"
      campaigns_per_month: "ilimitado"
      api_calls: "ilimitado"
      users: "ilimitado"
      locations: "ilimitado"
      data_retention: "3 anos"
```

### 6.2 Metricas SaaS Target

```yaml
unit_economics:
  cac: "R$ 400-600"        # Custo de aquisicao de cliente
  ltv: "R$ 4.000-12.000"   # Lifetime value (12-24 meses)
  ltv_cac_ratio: "> 6x"    # Saudavel
  monthly_churn: "< 3%"    # Target
  payback_months: "< 3"    # Meses para recuperar CAC
  gross_margin: "75-85%"   # Margem bruta SaaS

revenue_projections:
  year_1:
    customers: 200
    arr: "R$ 1.2M"
    mrr: "R$ 100K"
    mix: "60% starter, 30% pro, 10% enterprise"

  year_2:
    customers: 800
    arr: "R$ 5.5M"
    mrr: "R$ 460K"
    mix: "45% starter, 40% pro, 15% enterprise"

  year_3:
    customers: 2500
    arr: "R$ 18M"
    mrr: "R$ 1.5M"
    mix: "35% starter, 45% pro, 20% enterprise"
```

### 6.3 Go-To-Market Strategy

```yaml
gtm_phases:

  phase_1_mvp:
    duration: "Meses 1-3"
    focus: "Validacao com pizzarias em 1 cidade"
    target: "50 pizzarias beta (gratis)"
    features: ["Mapa de demanda", "Hunger Score", "Alertas climaticos"]
    channels: ["Abordagem direta", "Grupos WhatsApp de pizzaiolos"]
    kpi: "20+ usuarios ativos diarios, NPS > 40"

  phase_2_product_market_fit:
    duration: "Meses 4-6"
    focus: "Monetizacao e iteracao"
    target: "200 restaurantes pagantes na cidade piloto"
    features: ["+ Campanhas automaticas", "+ Concorrencia", "+ Previsao"]
    channels: ["+ Marketing digital", "+ Parcerias com associacoes"]
    kpi: "MRR R$40K, churn < 5%, NPS > 50"

  phase_3_growth:
    duration: "Meses 7-12"
    focus: "Expansao para 5 cidades + novas categorias"
    target: "800+ restaurantes"
    features: ["+ Expansao radar", "+ Multi-categoria", "+ IA campaigns"]
    channels: ["+ Inside sales", "+ Eventos setor", "+ Programa parceiros"]
    kpi: "MRR R$200K, churn < 3%"

  phase_4_scale:
    duration: "Ano 2-3"
    focus: "Dominacao nacional + internacionalizacao"
    target: "2500+ restaurantes"
    features: ["Plataforma completa", "API marketplace"]
    channels: ["Enterprise sales", "Channel partners", "Self-serve"]
    kpi: "ARR R$18M, unit economics positivos"
```

---

## 7. ESTRATEGIA PARA DOMINAR O MERCADO (Item 19)

### Playbook de Dominacao

```yaml
domination_strategy:

  step_1_intelligence_moat:
    description: "Construir o maior dataset de demanda alimentar do Brasil"
    actions:
      - Coletar dados de todas as fontes continuamente
      - Cada restaurante que entra na plataforma enriquece o modelo
      - Network effect: mais dados = melhor previsao = mais clientes = mais dados
    moat: "Dados proprietarios + modelos treinados"

  step_2_automation_advantage:
    description: "Restaurante que usa FDR opera em modo automatico"
    actions:
      - Campanhas se lancam sozinhas nos momentos certos
      - Alertas proativos eliminam decisoes manuais
      - Previsao de vendas otimiza compras e equipe
    moat: "Switching cost alto — dificil voltar ao manual"

  step_3_category_expansion:
    description: "De pizzarias para TODOS os restaurantes"
    roadmap:
      q1: "Pizza (core)"
      q2: "+ Hamburger, + Sushi"
      q3: "+ Acai, + Marmita, + Japonesa"
      q4: "+ Qualquer categoria (generico)"
    moat: "Plataforma multi-categoria"

  step_4_geographic_expansion:
    description: "De 1 cidade para o Brasil inteiro"
    approach: "City-by-city com equipe local de onboarding"
    priority_cities:
      tier_1: ["Sao Paulo", "Rio de Janeiro", "Belo Horizonte"]
      tier_2: ["Curitiba", "Porto Alegre", "Brasilia", "Salvador"]
      tier_3: ["Capitais restantes"]
      tier_4: ["Cidades 200k+ hab"]
    moat: "Presenca nacional antes de qualquer concorrente"

  step_5_ecosystem:
    description: "Tornar-se a infraestrutura de inteligencia do food service"
    products:
      marketplace_api: "Outros apps consomem nossos dados"
      franchise_tool: "Ferramenta oficial de franqueadores"
      investor_reports: "Relatorios para investidores do setor"
      real_estate: "Dados para imobiliarias (ponto comercial)"
    moat: "Platform lock-in"
```

---

## 8. SCHEMA DO BANCO DE DADOS (Resumo)

### Entidades Principais

```sql
-- Restaurantes e Locais
CREATE TABLE restaurants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    food_category TEXT NOT NULL,
    lat DOUBLE PRECISION NOT NULL,
    lng DOUBLE PRECISION NOT NULL,
    geom GEOMETRY(Point, 4326) GENERATED ALWAYS AS (ST_SetSRID(ST_MakePoint(lng, lat), 4326)) STORED,
    neighborhood_id UUID REFERENCES neighborhoods(id),
    city_id UUID REFERENCES cities(id),
    plan TEXT DEFAULT 'starter',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bairros com geometria
CREATE TABLE neighborhoods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    city_id UUID REFERENCES cities(id),
    geom GEOMETRY(Polygon, 4326),
    population INTEGER,
    avg_income NUMERIC,
    apartment_ratio NUMERIC,
    university_count INTEGER,
    young_adult_ratio NUMERIC
);

-- Scores em tempo real (TimescaleDB hypertable)
CREATE TABLE demand_scores (
    time TIMESTAMPTZ NOT NULL,
    h3_index TEXT NOT NULL,      -- Hexagono H3 level 8
    food_category TEXT NOT NULL,
    demand_score NUMERIC(5,2),
    hunger_score NUMERIC(5,2),
    search_volume NUMERIC,
    social_mentions INTEGER,
    weather_boost NUMERIC(3,2),
    event_boost NUMERIC(3,2)
);
SELECT create_hypertable('demand_scores', 'time');

-- Concorrentes mapeados
CREATE TABLE competitors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    food_category TEXT NOT NULL,
    lat DOUBLE PRECISION NOT NULL,
    lng DOUBLE PRECISION NOT NULL,
    geom GEOMETRY(Point, 4326),
    source TEXT,  -- google_maps, ifood, rappi
    rating NUMERIC(2,1),
    review_count INTEGER,
    price_level INTEGER,
    neighborhood_id UUID REFERENCES neighborhoods(id),
    last_updated TIMESTAMPTZ DEFAULT NOW()
);

-- Campanhas
CREATE TABLE campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID REFERENCES restaurants(id),
    type TEXT NOT NULL,            -- hyperlocal, weather, football, etc
    status TEXT DEFAULT 'draft',   -- draft, scheduled, active, paused, completed
    trigger_type TEXT,
    target_neighborhoods UUID[],
    target_radius_km NUMERIC,
    budget_daily NUMERIC,
    copy_title TEXT,
    copy_body TEXT,
    offer JSONB,
    platform TEXT[],               -- google_ads, meta_ads, whatsapp
    started_at TIMESTAMPTZ,
    ended_at TIMESTAMPTZ,
    metrics JSONB,                 -- impressions, clicks, conversions, cost, roi
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Previsoes
CREATE TABLE forecasts (
    time TIMESTAMPTZ NOT NULL,
    restaurant_id UUID REFERENCES restaurants(id),
    forecast_horizon TEXT,         -- 4h, 1d, 7d, 30d
    predicted_orders INTEGER,
    predicted_revenue NUMERIC,
    confidence NUMERIC(3,2),
    features_used JSONB,
    actual_orders INTEGER,         -- preenchido depois para feedback loop
    actual_revenue NUMERIC
);
SELECT create_hypertable('forecasts', 'time');

-- Tendencias de sabor
CREATE TABLE flavor_trends (
    time TIMESTAMPTZ NOT NULL,
    city_id UUID REFERENCES cities(id),
    food_category TEXT NOT NULL,
    flavor TEXT NOT NULL,
    trend_score NUMERIC(5,2),
    velocity NUMERIC(5,2),         -- taxa de crescimento
    search_volume NUMERIC,
    social_mentions INTEGER,
    sales_growth_pct NUMERIC(5,2)
);
SELECT create_hypertable('flavor_trends', 'time');

-- Alertas
CREATE TABLE alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID REFERENCES restaurants(id),
    type TEXT NOT NULL,             -- surge, weather, underserved, event
    severity TEXT NOT NULL,         -- low, medium, high, critical
    title TEXT NOT NULL,
    description TEXT,
    data JSONB,
    acknowledged BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 9. ROADMAP DE DESENVOLVIMENTO

### Fase 1 — MVP (8-10 semanas)

```yaml
mvp_scope:
  epic_1_data_foundation:
    stories:
      - "Configurar infraestrutura (Supabase + Vercel + Redis)"
      - "Implementar collector Google Trends"
      - "Implementar collector Weather API"
      - "Criar schema base PostgreSQL + PostGIS + TimescaleDB"
      - "Pipeline basico de ingestao (Airflow)"

  epic_2_demand_engine_basic:
    stories:
      - "Calcular Demand Score basico (buscas + horario)"
      - "Calcular Hunger Score simplificado"
      - "API de scores por bairro"

  epic_3_dashboard_v1:
    stories:
      - "Autenticacao e onboarding de restaurante"
      - "Tela Command Center com mapa de calor (Mapbox + Deck.gl)"
      - "Widget Hunger Score em tempo real"
      - "Lista de bairros mais quentes"
      - "Alertas basicos (clima)"

  epic_4_campaigns_basic:
    stories:
      - "Campanha weather-triggered (chuva)"
      - "Campanha time-based (momento da fome)"
      - "Integracao basica WhatsApp Business API"

  tech_debt_allowed:
    - "Dados de concorrencia manuais (sem scraping automatico)"
    - "Previsao baseada em regras simples (sem ML)"
    - "1 cidade apenas"
    - "Apenas categoria pizza"
```

### Fase 2 — Product-Market Fit (semanas 11-20)

```yaml
pmf_scope:
  - Competition Engine (Google Maps + iFood)
  - Pizza Opportunity Score completo
  - Forecast Engine com Prophet/XGBoost
  - Trend Engine (sabores)
  - Campaign Engine com Google/Meta Ads
  - Simulador de promocoes (v1)
  - Mobile app (alertas push)
  - Multi-categoria (+ hamburger, sushi)
```

### Fase 3 — Growth (semanas 21-40)

```yaml
growth_scope:
  - Expansion Radar (GPS para novas unidades)
  - Geracao de campanhas por IA (Claude API)
  - Remarketing automatico
  - Campanhas de micro-bairro
  - Previsao de vendas diarias
  - Alertas de bairros subatendidos
  - Multi-cidade (5 cidades)
  - Integracao POS (historico de pedidos)
  - API publica (plano Enterprise)
```

### Fase 4 — Scale (semanas 41-60)

```yaml
scale_scope:
  - Mapa de consumo urbano completo
  - Radar de tendencias gastronomicas
  - Sistema de recomendacao de cardapio por IA
  - Previsao de demanda por eventos
  - Campanhas totalmente autonomas
  - Cobertura nacional (20+ cidades)
  - Marketplace API
  - Relatorios para investidores
```

---

## 10. DIFERENCIAIS COMPETITIVOS

| # | Diferencial | Descricao | Barreira |
|---|-------------|-----------|----------|
| 1 | Real-time Demand Heatmap | Ninguem mostra demanda alimentar em tempo real por hexagono | Dados + infra + modelos |
| 2 | Hunger Score proprietario | Score unico que combina 7 sinais de demanda | Algoritmo + dados historicos |
| 3 | Campanhas auto-triggered | Campanhas se lancam sozinhas baseado em gatilhos | Engine complexo + integracoes |
| 4 | Previsao de vendas por IA | Preve quantidade de pedidos com >80% acuracia | Modelo ML treinado com dados reais |
| 5 | GPS de Expansao | Indica exatamente onde abrir nova unidade | Combinacao unica de datasets |
| 6 | Network Effect | Cada restaurante que entra melhora os dados para todos | Efeito de rede cumulativo |
| 7 | Geracao de copy por IA | Claude gera campanhas otimizadas para cada contexto | Integra LLM com dados locais |

---

## 11. RISCOS E MITIGACOES

| Risco | Impacto | Probabilidade | Mitigacao |
|-------|---------|---------------|-----------|
| APIs externas mudam/param | Alto | Media | Multiplas fontes por sinal, graceful degradation |
| Scraping bloqueado (iFood) | Medio | Alta | Dados de concorrencia via Google Maps como fallback |
| Baixa adocao inicial | Alto | Media | Freemium tier, onboarding white-glove, ROI calculator |
| Dados insuficientes cidade pequena | Medio | Media | Focar em capitais, threshold minimo de dados |
| LGPD/privacidade | Alto | Baixa | Dados agregados apenas, sem PII, DPO dedicado |
| Concorrente Big Tech | Alto | Baixa | Foco hiperlocal Brasil, velocidade de execucao |

---

## CONCLUSAO

O **Food Demand Radar** nao e apenas um dashboard — e um **sistema nervoso digital** para restaurantes. Ele transforma sinais urbanos fragmentados em decisoes automaticas de marketing, operacao e expansao.

A chave do sucesso esta em:
1. **Dados em camadas** — quanto mais fontes, mais preciso o radar
2. **Automacao inteligente** — o restaurante nao precisa pensar, o sistema age
3. **Network effect** — cada cliente torna o produto melhor para todos
4. **Land and expand** — comeca com pizza, domina todo food service

O mercado de food service no Brasil movimenta R$200+ bilhoes/ano. Capturar 0.01% desse valor em SaaS ja representa R$20M ARR.

---

*Documento orquestrado por Orion (AIOX Master) com contribuicoes de @analyst, @architect, @pm, @ux-design-expert, @data-engineer, @dev*
*Food Demand Radar — System Design v1.0*
