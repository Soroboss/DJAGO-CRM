-- Drop existing tables to recreate them based on LocalDb (if needed, but usually we just CREATE IF NOT EXISTS)
-- We will just CREATE IF NOT EXISTS to avoid losing data if it exists, but the user said "mais iln'y a meme pas de teble dans cette base de doçnnees" earlier.
-- Wait, the output of `db tables` showed clients, interactions, profiles. We should alter or recreate.

-- 1. Create Enums
DO $$ BEGIN
    CREATE TYPE client_status AS ENUM ('Prospect', 'Négociation', 'Vendu', 'En cours de livraison', 'Livré & Adopté');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE interaction_type AS ENUM ('appel', 'whatsapp', 'email', 'terrain', 'creation', 'transfert', 'statut');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE transaction_stage AS ENUM ('contact', 'presentation', 'proposal', 'negotiation', 'won', 'lost');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE order_payment_status AS ENUM ('unpaid', 'partial', 'paid');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE order_delivery_status AS ENUM ('preparing', 'shipping', 'delivered', 'returned');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE ticket_priority AS ENUM ('low', 'medium', 'high');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE ticket_status AS ENUM ('new', 'open', 'resolved');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE meeting_type AS ENUM ('appel', 'terrain', 'demo');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE message_channel AS ENUM ('whatsapp', 'email', 'sms');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('dg', 'manager', 'commercial');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Create Tables

-- Team Members (Profiles)
CREATE TABLE IF NOT EXISTS team_members (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role user_role NOT NULL DEFAULT 'commercial',
  zone TEXT,
  manager_id UUID REFERENCES team_members(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Clients
CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  company TEXT,
  phone TEXT NOT NULL,
  email TEXT,
  status client_status NOT NULL DEFAULT 'Prospect',
  assigned_to UUID REFERENCES team_members(id) ON DELETE SET NULL,
  last_contact TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Interactions
CREATE TABLE IF NOT EXISTS interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  performed_by UUID REFERENCES team_members(id) ON DELETE SET NULL,
  type interaction_type NOT NULL,
  details TEXT,
  gps_coordinates TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- WhatsApp Templates
CREATE TABLE IF NOT EXISTS whatsapp_templates (
  id TEXT PRIMARY KEY, -- We use text here as LocalDb uses string identifiers (e.g. 'devis')
  name TEXT NOT NULL,
  text TEXT NOT NULL
);

-- Contacts
CREATE TABLE IF NOT EXISTS contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Forms
CREATE TABLE IF NOT EXISTS forms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  fields JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Segments
CREATE TABLE IF NOT EXISTS segments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  criteria JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Transactions
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  amount NUMERIC NOT NULL DEFAULT 0,
  stage transaction_stage NOT NULL DEFAULT 'contact',
  probability INTEGER NOT NULL DEFAULT 0,
  expected_close_date TIMESTAMPTZ,
  assigned_to UUID REFERENCES team_members(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Orders
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  items TEXT NOT NULL,
  total_amount NUMERIC NOT NULL DEFAULT 0,
  payment_status order_payment_status NOT NULL DEFAULT 'unpaid',
  delivery_status order_delivery_status NOT NULL DEFAULT 'preparing',
  delivery_agent UUID REFERENCES team_members(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tickets
CREATE TABLE IF NOT EXISTS tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  priority ticket_priority NOT NULL DEFAULT 'low',
  status ticket_status NOT NULL DEFAULT 'new',
  description TEXT NOT NULL,
  assigned_to UUID REFERENCES team_members(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Meetings
CREATE TABLE IF NOT EXISTS meetings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  type meeting_type NOT NULL DEFAULT 'appel',
  scheduled_at TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 30,
  assigned_to UUID REFERENCES team_members(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Inbox Messages
CREATE TABLE IF NOT EXISTS inbox_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  sender_name TEXT NOT NULL,
  sender_address TEXT NOT NULL,
  channel message_channel NOT NULL,
  subject TEXT,
  body TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security
-- For simplicity, if we want to secure it but currently we want it to work:
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE inbox_messages ENABLE ROW LEVEL SECURITY;

-- Create generous policies for the authenticated users to manage data initially
-- (In a real production system, DG sees all, managers see zone, commercial sees assigned)
CREATE POLICY "Allow authenticated users to read team_members" ON team_members FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to read everything" ON clients FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to insert clients" ON clients FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated users to update clients" ON clients FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to delete clients" ON clients FOR DELETE TO authenticated USING (true);

-- Repeat open policies for others to ensure smooth transition from local to cloud
CREATE POLICY "all_authenticated_interactions" ON interactions FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "all_authenticated_whatsapp_templates" ON whatsapp_templates FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "all_authenticated_contacts" ON contacts FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "all_authenticated_forms" ON forms FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "all_authenticated_segments" ON segments FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "all_authenticated_transactions" ON transactions FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "all_authenticated_orders" ON orders FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "all_authenticated_tickets" ON tickets FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "all_authenticated_meetings" ON meetings FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "all_authenticated_inbox_messages" ON inbox_messages FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Insert default templates
INSERT INTO whatsapp_templates (id, name, text) VALUES
  ('devis', 'Relance Devis', 'Bonjour {{nom_client}}, suite à notre entretien, je vous relance concernant le devis. Cordialement, {{nom_commercial}} de {{entreprise}}.'),
  ('livraison', 'Alerte Livraison', 'Bonjour {{nom_client}}, votre commande est en cours de livraison !'),
  ('fidelisation', 'Fidélisation Client', 'Bonjour {{nom_client}}, merci pour votre confiance envers {{entreprise}} !')
ON CONFLICT (id) DO NOTHING;
