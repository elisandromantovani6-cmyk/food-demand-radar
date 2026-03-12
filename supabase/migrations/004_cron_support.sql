-- =============================================
-- SUPORTE A CRON JOBS: ajustar tabelas para upsert
-- =============================================

-- demand_scores: adicionar colunas e unique constraint
ALTER TABLE demand_scores ADD COLUMN IF NOT EXISTS demand_level TEXT DEFAULT 'low';
ALTER TABLE demand_scores ADD COLUMN IF NOT EXISTS hour_multiplier NUMERIC(4,2) DEFAULT 1.0;
ALTER TABLE demand_scores ADD COLUMN IF NOT EXISTS day_multiplier NUMERIC(4,2) DEFAULT 1.0;
ALTER TABLE demand_scores ADD COLUMN IF NOT EXISTS weather_data JSONB DEFAULT '{}';
ALTER TABLE demand_scores ADD COLUMN IF NOT EXISTS scored_at TIMESTAMPTZ DEFAULT NOW();

-- Unique constraint para upsert por tenant + neighborhood
ALTER TABLE demand_scores ADD CONSTRAINT demand_scores_tenant_neighborhood_unique
  UNIQUE (tenant_id, neighborhood_id);

-- flavor_trends: adicionar colunas para cron
ALTER TABLE flavor_trends ADD COLUMN IF NOT EXISTS keyword TEXT;
ALTER TABLE flavor_trends ADD COLUMN IF NOT EXISTS peak_interest NUMERIC DEFAULT 0;
ALTER TABLE flavor_trends ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'stable';
ALTER TABLE flavor_trends ADD COLUMN IF NOT EXISTS collected_at TIMESTAMPTZ DEFAULT NOW();

-- Unique constraint para upsert por tenant + keyword
ALTER TABLE flavor_trends ADD CONSTRAINT flavor_trends_tenant_keyword_unique
  UNIQUE (tenant_id, keyword);
