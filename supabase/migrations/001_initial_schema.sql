-- =============================================
-- FOOD DEMAND RADAR — Schema Inicial + Multi-tenant RLS
-- =============================================

-- 1. Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- TABELAS
-- =============================================

-- Tenants (cada cliente/restaurante é um tenant)
CREATE TABLE tenants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  food_category TEXT NOT NULL DEFAULT 'pizza',
  city TEXT NOT NULL DEFAULT 'Tangará da Serra',
  state TEXT NOT NULL DEFAULT 'MT',
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  address TEXT,
  phone TEXT,
  delivery_radius_km NUMERIC DEFAULT 5,
  delivery_fee NUMERIC DEFAULT 12.90,
  plan TEXT NOT NULL DEFAULT 'starter',
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  onboarding_completed BOOLEAN DEFAULT FALSE,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Profiles (vincula auth.users ao tenant)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'owner',
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Neighborhoods (bairros por tenant)
CREATE TABLE neighborhoods (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  population INTEGER,
  avg_income NUMERIC,
  apartment_ratio NUMERIC,
  university_count INTEGER DEFAULT 0,
  young_adult_ratio NUMERIC,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Menu Items (cardápio)
CREATE TABLE menu_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  subcategory TEXT,
  price NUMERIC NOT NULL,
  image TEXT,
  available BOOLEAN DEFAULT TRUE,
  allow_half BOOLEAN DEFAULT FALSE,
  size_prices JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Menu Combos
CREATE TABLE menu_combos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  original_price NUMERIC NOT NULL,
  combo_price NUMERIC NOT NULL,
  items JSONB NOT NULL DEFAULT '[]',
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Campaigns (campanhas de marketing)
CREATE TABLE campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  trigger_type TEXT,
  target_neighborhood_ids TEXT[],
  target_radius_km NUMERIC,
  budget_daily NUMERIC,
  copy_title TEXT,
  copy_body TEXT,
  offer JSONB,
  platforms TEXT[],
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  cost NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Competitors (concorrentes)
CREATE TABLE competitors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  food_category TEXT NOT NULL,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  source TEXT NOT NULL DEFAULT 'google_maps',
  rating NUMERIC(2,1),
  review_count INTEGER DEFAULT 0,
  price_level INTEGER,
  delivery_fee NUMERIC,
  neighborhood_id UUID REFERENCES neighborhoods(id),
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Alerts
CREATE TABLE alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'medium',
  title TEXT NOT NULL,
  description TEXT,
  data JSONB,
  acknowledged BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Demand Scores
CREATE TABLE demand_scores (
  id SERIAL PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
  time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  h3_index TEXT NOT NULL,
  food_category TEXT NOT NULL DEFAULT 'pizza',
  neighborhood_id UUID REFERENCES neighborhoods(id),
  demand_score NUMERIC(5,2),
  hunger_score NUMERIC(5,2),
  search_volume NUMERIC,
  social_mentions INTEGER DEFAULT 0,
  weather_boost NUMERIC(3,2) DEFAULT 0,
  event_boost NUMERIC(3,2) DEFAULT 0
);

-- Flavor Trends
CREATE TABLE flavor_trends (
  id SERIAL PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
  time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  food_category TEXT NOT NULL,
  flavor TEXT NOT NULL,
  trend_score NUMERIC(5,2),
  velocity NUMERIC(5,2),
  search_volume NUMERIC,
  social_mentions INTEGER DEFAULT 0,
  sales_growth_pct NUMERIC(5,2)
);

-- Forecasts
CREATE TABLE forecasts (
  id SERIAL PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
  time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  forecast_horizon TEXT NOT NULL,
  predicted_orders INTEGER,
  predicted_revenue NUMERIC,
  confidence NUMERIC(3,2),
  features_used JSONB,
  actual_orders INTEGER,
  actual_revenue NUMERIC
);

-- WhatsApp Conversations
CREATE TABLE whatsapp_conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
  customer_name TEXT,
  customer_phone TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  messages JSONB DEFAULT '[]',
  order_summary JSONB,
  started_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  ended_at TIMESTAMPTZ
);

-- Orders (pedidos)
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
  source TEXT NOT NULL DEFAULT 'whatsapp',
  customer_name TEXT NOT NULL,
  customer_phone TEXT,
  customer_address TEXT,
  delivery_type TEXT NOT NULL DEFAULT 'delivery',
  items JSONB NOT NULL DEFAULT '[]',
  subtotal NUMERIC NOT NULL,
  delivery_fee NUMERIC DEFAULT 0,
  total NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  notes TEXT,
  conversation_id UUID REFERENCES whatsapp_conversations(id),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- =============================================
-- INDEXES
-- =============================================

CREATE INDEX idx_profiles_tenant ON profiles(tenant_id);
CREATE INDEX idx_neighborhoods_tenant ON neighborhoods(tenant_id);
CREATE INDEX idx_menu_items_tenant ON menu_items(tenant_id);
CREATE INDEX idx_menu_items_category ON menu_items(tenant_id, category);
CREATE INDEX idx_menu_combos_tenant ON menu_combos(tenant_id);
CREATE INDEX idx_campaigns_tenant ON campaigns(tenant_id);
CREATE INDEX idx_competitors_tenant ON competitors(tenant_id);
CREATE INDEX idx_alerts_tenant ON alerts(tenant_id);
CREATE INDEX idx_demand_scores_tenant ON demand_scores(tenant_id);
CREATE INDEX idx_demand_scores_time ON demand_scores(time);
CREATE INDEX idx_demand_scores_h3 ON demand_scores(h3_index);
CREATE INDEX idx_flavor_trends_tenant ON flavor_trends(tenant_id);
CREATE INDEX idx_forecasts_tenant ON forecasts(tenant_id);
CREATE INDEX idx_whatsapp_tenant ON whatsapp_conversations(tenant_id);
CREATE INDEX idx_orders_tenant ON orders(tenant_id);
CREATE INDEX idx_orders_status ON orders(tenant_id, status);

-- =============================================
-- ROW LEVEL SECURITY (Multi-tenant)
-- =============================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE neighborhoods ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_combos ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE competitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE demand_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE flavor_trends ENABLE ROW LEVEL SECURITY;
ALTER TABLE forecasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Função helper: pegar tenant_id do usuário logado
CREATE OR REPLACE FUNCTION get_user_tenant_id()
RETURNS UUID AS $$
  SELECT tenant_id FROM profiles WHERE id = auth.uid()
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- POLICIES: Tenants
CREATE POLICY "Users can view own tenant"
  ON tenants FOR SELECT
  USING (id = get_user_tenant_id());

CREATE POLICY "Users can update own tenant"
  ON tenants FOR UPDATE
  USING (id = get_user_tenant_id());

-- POLICIES: Profiles
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (id = auth.uid());

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (id = auth.uid());

-- Macro para policies multi-tenant (SELECT, INSERT, UPDATE, DELETE)
-- Aplicar para cada tabela com tenant_id

-- Neighborhoods
CREATE POLICY "Tenant isolation" ON neighborhoods FOR SELECT USING (tenant_id = get_user_tenant_id());
CREATE POLICY "Tenant insert" ON neighborhoods FOR INSERT WITH CHECK (tenant_id = get_user_tenant_id());
CREATE POLICY "Tenant update" ON neighborhoods FOR UPDATE USING (tenant_id = get_user_tenant_id());
CREATE POLICY "Tenant delete" ON neighborhoods FOR DELETE USING (tenant_id = get_user_tenant_id());

-- Menu Items
CREATE POLICY "Tenant isolation" ON menu_items FOR SELECT USING (tenant_id = get_user_tenant_id());
CREATE POLICY "Tenant insert" ON menu_items FOR INSERT WITH CHECK (tenant_id = get_user_tenant_id());
CREATE POLICY "Tenant update" ON menu_items FOR UPDATE USING (tenant_id = get_user_tenant_id());
CREATE POLICY "Tenant delete" ON menu_items FOR DELETE USING (tenant_id = get_user_tenant_id());

-- Menu Combos
CREATE POLICY "Tenant isolation" ON menu_combos FOR SELECT USING (tenant_id = get_user_tenant_id());
CREATE POLICY "Tenant insert" ON menu_combos FOR INSERT WITH CHECK (tenant_id = get_user_tenant_id());
CREATE POLICY "Tenant update" ON menu_combos FOR UPDATE USING (tenant_id = get_user_tenant_id());
CREATE POLICY "Tenant delete" ON menu_combos FOR DELETE USING (tenant_id = get_user_tenant_id());

-- Campaigns
CREATE POLICY "Tenant isolation" ON campaigns FOR SELECT USING (tenant_id = get_user_tenant_id());
CREATE POLICY "Tenant insert" ON campaigns FOR INSERT WITH CHECK (tenant_id = get_user_tenant_id());
CREATE POLICY "Tenant update" ON campaigns FOR UPDATE USING (tenant_id = get_user_tenant_id());
CREATE POLICY "Tenant delete" ON campaigns FOR DELETE USING (tenant_id = get_user_tenant_id());

-- Competitors
CREATE POLICY "Tenant isolation" ON competitors FOR SELECT USING (tenant_id = get_user_tenant_id());
CREATE POLICY "Tenant insert" ON competitors FOR INSERT WITH CHECK (tenant_id = get_user_tenant_id());
CREATE POLICY "Tenant update" ON competitors FOR UPDATE USING (tenant_id = get_user_tenant_id());
CREATE POLICY "Tenant delete" ON competitors FOR DELETE USING (tenant_id = get_user_tenant_id());

-- Alerts
CREATE POLICY "Tenant isolation" ON alerts FOR SELECT USING (tenant_id = get_user_tenant_id());
CREATE POLICY "Tenant insert" ON alerts FOR INSERT WITH CHECK (tenant_id = get_user_tenant_id());
CREATE POLICY "Tenant update" ON alerts FOR UPDATE USING (tenant_id = get_user_tenant_id());
CREATE POLICY "Tenant delete" ON alerts FOR DELETE USING (tenant_id = get_user_tenant_id());

-- Demand Scores
CREATE POLICY "Tenant isolation" ON demand_scores FOR SELECT USING (tenant_id = get_user_tenant_id());
CREATE POLICY "Tenant insert" ON demand_scores FOR INSERT WITH CHECK (tenant_id = get_user_tenant_id());
CREATE POLICY "Tenant update" ON demand_scores FOR UPDATE USING (tenant_id = get_user_tenant_id());
CREATE POLICY "Tenant delete" ON demand_scores FOR DELETE USING (tenant_id = get_user_tenant_id());

-- Flavor Trends
CREATE POLICY "Tenant isolation" ON flavor_trends FOR SELECT USING (tenant_id = get_user_tenant_id());
CREATE POLICY "Tenant insert" ON flavor_trends FOR INSERT WITH CHECK (tenant_id = get_user_tenant_id());
CREATE POLICY "Tenant update" ON flavor_trends FOR UPDATE USING (tenant_id = get_user_tenant_id());
CREATE POLICY "Tenant delete" ON flavor_trends FOR DELETE USING (tenant_id = get_user_tenant_id());

-- Forecasts
CREATE POLICY "Tenant isolation" ON forecasts FOR SELECT USING (tenant_id = get_user_tenant_id());
CREATE POLICY "Tenant insert" ON forecasts FOR INSERT WITH CHECK (tenant_id = get_user_tenant_id());
CREATE POLICY "Tenant update" ON forecasts FOR UPDATE USING (tenant_id = get_user_tenant_id());
CREATE POLICY "Tenant delete" ON forecasts FOR DELETE USING (tenant_id = get_user_tenant_id());

-- WhatsApp Conversations
CREATE POLICY "Tenant isolation" ON whatsapp_conversations FOR SELECT USING (tenant_id = get_user_tenant_id());
CREATE POLICY "Tenant insert" ON whatsapp_conversations FOR INSERT WITH CHECK (tenant_id = get_user_tenant_id());
CREATE POLICY "Tenant update" ON whatsapp_conversations FOR UPDATE USING (tenant_id = get_user_tenant_id());
CREATE POLICY "Tenant delete" ON whatsapp_conversations FOR DELETE USING (tenant_id = get_user_tenant_id());

-- Orders
CREATE POLICY "Tenant isolation" ON orders FOR SELECT USING (tenant_id = get_user_tenant_id());
CREATE POLICY "Tenant insert" ON orders FOR INSERT WITH CHECK (tenant_id = get_user_tenant_id());
CREATE POLICY "Tenant update" ON orders FOR UPDATE USING (tenant_id = get_user_tenant_id());
CREATE POLICY "Tenant delete" ON orders FOR DELETE USING (tenant_id = get_user_tenant_id());

-- =============================================
-- SERVICE ROLE POLICIES (para operações do servidor)
-- =============================================

-- O service_role key ignora RLS por padrão no Supabase
-- Isso permite que o backend (tRPC) acesse dados de qualquer tenant quando necessário

-- =============================================
-- TRIGGER: updated_at automático
-- =============================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at BEFORE UPDATE ON tenants FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON menu_items FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON menu_combos FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =============================================
-- FUNCTION: Criar profile automaticamente no signup
-- =============================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
