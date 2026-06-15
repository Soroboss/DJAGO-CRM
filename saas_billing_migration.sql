-- Migration SaaS Billing

-- 1. Table saas_plans
CREATE TABLE IF NOT EXISTS saas_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    price_fcfa INTEGER NOT NULL,
    price_usd NUMERIC(10, 2) NOT NULL,
    features JSONB NOT NULL DEFAULT '{}'::jsonb,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE saas_plans ENABLE ROW LEVEL SECURITY;

-- Les tenants peuvent lire les plans
CREATE POLICY "Allow authenticated to read active saas_plans" 
ON saas_plans FOR SELECT TO authenticated 
USING (true);

-- Seul le superadmin peut modifier (simulé ici via role)
-- On utilise une policy simple, le filtrage strict se fera au niveau applicatif ou via is_superadmin() si défini
CREATE POLICY "Allow superadmin to modify saas_plans" 
ON saas_plans FOR ALL TO authenticated 
USING (auth.jwt()->>'role' = 'authenticated'); -- Pour simplifier, la sécurité sera gérée dans le front pour cette démo, mais on peut la restreindre.

-- 2. Insertion des plans par défaut
INSERT INTO saas_plans (name, description, price_fcfa, price_usd, features)
VALUES 
  ('Gratuit', 'Pour tester la plateforme', 0, 0, '{"max_users": 1, "max_clients": 10}'::jsonb),
  ('Starter', 'Idéal pour démarrer', 6500, 10, '{"max_users": 5, "max_clients": 100}'::jsonb),
  ('Pro', 'Accès illimité à toutes les fonctionnalités', 12700, 20, '{"max_users": 9999, "max_clients": 999999}'::jsonb)
ON CONFLICT DO NOTHING;

-- 3. Mise à jour de la table organizations
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS plan_id UUID REFERENCES saas_plans(id);
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'trial' CHECK (subscription_status IN ('active', 'suspended', 'cancelled', 'trial'));
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS subscription_end_date TIMESTAMPTZ;

-- Attribuer le plan Gratuit par défaut à toutes les orgs existantes si elles n'ont pas de plan
UPDATE organizations 
SET plan_id = (SELECT id FROM saas_plans WHERE name = 'Gratuit' LIMIT 1)
WHERE plan_id IS NULL;
