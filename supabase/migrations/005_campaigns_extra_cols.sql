-- =============================================
-- CAMPANHAS: colunas extras para persistência
-- =============================================

ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS estimated_budget TEXT;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS activated_at TIMESTAMPTZ;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS paused_at TIMESTAMPTZ;

-- =============================================
-- ALERTAS: alert_key para acknowledge persistente
-- =============================================

ALTER TABLE alerts ADD COLUMN IF NOT EXISTS alert_key TEXT;
ALTER TABLE alerts ADD COLUMN IF NOT EXISTS acknowledged_at TIMESTAMPTZ;
ALTER TABLE alerts ALTER COLUMN tenant_id DROP NOT NULL;

-- Unique para upsert por alert_key
CREATE UNIQUE INDEX IF NOT EXISTS alerts_alert_key_unique ON alerts(alert_key) WHERE alert_key IS NOT NULL;
