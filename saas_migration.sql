-- Create Organizations table
CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    industry_category TEXT NOT NULL,
    active_modules JSONB NOT NULL DEFAULT '{"sales": true, "support": true, "delivery": true, "field_tracking": true}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on organizations
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

-- Add organization_id to all tables FIRST
ALTER TABLE team_members ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE interactions ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE forms ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE segments ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE meetings ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE inbox_messages ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE whatsapp_templates ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;

-- Now define policies
CREATE POLICY "Allow authenticated users to read their own organization" 
ON organizations FOR SELECT TO authenticated 
USING ( id IN (SELECT organization_id FROM team_members WHERE id = auth.uid()) );

CREATE POLICY "Allow authenticated users to insert organizations" 
ON organizations FOR INSERT TO authenticated 
WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update their organization" 
ON organizations FOR UPDATE TO authenticated 
USING ( id IN (SELECT organization_id FROM team_members WHERE id = auth.uid()) );

-- If there are existing records, let's create a default organization and assign it to them
DO $$
DECLARE
    default_org_id UUID;
BEGIN
    IF EXISTS (SELECT 1 FROM team_members WHERE organization_id IS NULL LIMIT 1) THEN
        INSERT INTO organizations (name, industry_category) VALUES ('Default Company', 'Services B2B') RETURNING id INTO default_org_id;
        
        UPDATE team_members SET organization_id = default_org_id WHERE organization_id IS NULL;
        UPDATE clients SET organization_id = default_org_id WHERE organization_id IS NULL;
        UPDATE interactions SET organization_id = default_org_id WHERE organization_id IS NULL;
        UPDATE contacts SET organization_id = default_org_id WHERE organization_id IS NULL;
        UPDATE forms SET organization_id = default_org_id WHERE organization_id IS NULL;
        UPDATE segments SET organization_id = default_org_id WHERE organization_id IS NULL;
        UPDATE transactions SET organization_id = default_org_id WHERE organization_id IS NULL;
        UPDATE orders SET organization_id = default_org_id WHERE organization_id IS NULL;
        UPDATE tickets SET organization_id = default_org_id WHERE organization_id IS NULL;
        UPDATE meetings SET organization_id = default_org_id WHERE organization_id IS NULL;
        UPDATE inbox_messages SET organization_id = default_org_id WHERE organization_id IS NULL;
        UPDATE whatsapp_templates SET organization_id = default_org_id WHERE organization_id IS NULL;
    END IF;
END $$;

-- Drop all old broad policies
DO $$
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN SELECT policyname, tablename FROM pg_policies WHERE schemaname = 'public' LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', pol.policyname, pol.tablename);
    END LOOP;
END $$;

-- Recreate policies with Multi-Tenant logic (organization_id)
CREATE OR REPLACE FUNCTION public.get_user_org_id()
RETURNS UUID
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT organization_id FROM team_members WHERE id = auth.uid();
$$;

-- team_members
CREATE POLICY "team_members_select" ON team_members FOR SELECT TO authenticated USING (organization_id = public.get_user_org_id() OR id = auth.uid());
CREATE POLICY "team_members_insert" ON team_members FOR INSERT TO authenticated WITH CHECK (true); -- allowed to insert during signup
CREATE POLICY "team_members_update" ON team_members FOR UPDATE TO authenticated USING (organization_id = public.get_user_org_id() OR id = auth.uid());
CREATE POLICY "team_members_delete" ON team_members FOR DELETE TO authenticated USING (organization_id = public.get_user_org_id());

-- Create a macro to apply standard org-based policies to other tables
DO $$
DECLARE
    t TEXT;
    tables TEXT[] := ARRAY['clients', 'interactions', 'contacts', 'forms', 'segments', 'transactions', 'orders', 'tickets', 'meetings', 'inbox_messages', 'whatsapp_templates'];
BEGIN
    FOREACH t IN ARRAY tables LOOP
        EXECUTE format('CREATE POLICY "%s_select" ON %I FOR SELECT TO authenticated USING (organization_id = public.get_user_org_id())', t, t);
        EXECUTE format('CREATE POLICY "%s_insert" ON %I FOR INSERT TO authenticated WITH CHECK (organization_id = public.get_user_org_id())', t, t);
        EXECUTE format('CREATE POLICY "%s_update" ON %I FOR UPDATE TO authenticated USING (organization_id = public.get_user_org_id())', t, t);
        EXECUTE format('CREATE POLICY "%s_delete" ON %I FOR DELETE TO authenticated USING (organization_id = public.get_user_org_id())', t, t);
    END LOOP;
END $$;
