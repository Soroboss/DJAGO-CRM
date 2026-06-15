-- Create global_tickets table
CREATE TABLE IF NOT EXISTS global_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    subject TEXT NOT NULL,
    status ticket_status NOT NULL DEFAULT 'new',
    priority ticket_priority NOT NULL DEFAULT 'low',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create global_ticket_messages table
CREATE TABLE IF NOT EXISTS global_ticket_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID NOT NULL REFERENCES global_tickets(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    is_superadmin BOOLEAN NOT NULL DEFAULT false,
    message TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create system_settings table (only 1 row expected, id='global')
CREATE TABLE IF NOT EXISTS system_settings (
    id TEXT PRIMARY KEY DEFAULT 'global',
    cinetpay_api_key TEXT,
    cinetpay_site_id TEXT,
    default_trial_days INTEGER DEFAULT 14,
    maintenance_mode BOOLEAN DEFAULT false,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default row if not exists
INSERT INTO system_settings (id) VALUES ('global') ON CONFLICT DO NOTHING;

-- RLS for global_tickets
ALTER TABLE global_tickets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Superadmin can manage all global_tickets" ON global_tickets FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM team_members WHERE team_members.id = auth.uid() AND team_members.role = 'superadmin')
);
CREATE POLICY "Tenants can manage their global_tickets" ON global_tickets FOR ALL TO authenticated USING (
    organization_id = public.get_user_org_id()
);

-- RLS for global_ticket_messages
ALTER TABLE global_ticket_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Superadmin can manage all global_ticket_messages" ON global_ticket_messages FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM team_members WHERE team_members.id = auth.uid() AND team_members.role = 'superadmin')
);
CREATE POLICY "Tenants can manage their global_ticket_messages" ON global_ticket_messages FOR ALL TO authenticated USING (
    ticket_id IN (SELECT id FROM global_tickets WHERE organization_id = public.get_user_org_id())
);

-- RLS for system_settings
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Superadmin can manage system_settings" ON system_settings FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM team_members WHERE team_members.id = auth.uid() AND team_members.role = 'superadmin')
);
CREATE POLICY "Everyone can read system_settings" ON system_settings FOR SELECT TO authenticated USING (true);
CREATE POLICY "Anon can read system_settings" ON system_settings FOR SELECT TO anon USING (true);
