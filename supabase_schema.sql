-- SQL SCHEMA INITIALIZATION FOR DJAGOCRM
-- Copiez et collez ce script dans l'éditeur SQL de votre console Supabase.

-- 1. Table des profils d'utilisateurs (DG, Manager, Commercial)
CREATE TYPE user_role AS ENUM ('dg', 'manager', 'commercial');

CREATE TABLE profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role user_role NOT NULL DEFAULT 'commercial',
    manager_id UUID REFERENCES profiles(id), -- Null si DG
    zone TEXT NOT NULL, -- Ex: 'Ouest', 'Sud', 'Centre', 'Nord'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. Table des clients / prospects
CREATE TYPE client_status AS ENUM ('Prospect', 'Négociation', 'Vendu', 'En cours de livraison', 'Livré & Adopté');

CREATE TABLE clients (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    company TEXT,
    phone TEXT NOT NULL,
    email TEXT,
    status client_status NOT NULL DEFAULT 'Prospect',
    assigned_to UUID REFERENCES profiles(id) ON DELETE SET NULL,
    last_contact TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. Table de l'historique des interactions (Omnicanal)
CREATE TYPE interaction_type AS ENUM ('appel', 'whatsapp', 'email', 'terrain', 'creation', 'transfert', 'statut');

CREATE TABLE interactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    performed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    type interaction_type NOT NULL,
    details TEXT,
    gps_coordinates TEXT, -- "latitude, longitude" si type = 'terrain'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Activez Row Level Security (RLS) sur les tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE interactions ENABLE ROW LEVEL SECURITY;

-- 4. Exemples de Politiques de Sécurité RLS de base :

-- Profils : visibles par tous les connectés, modifiables par le DG
CREATE POLICY "Lecture des profils pour tous les authentifiés"
    ON profiles FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Insertion des profils par le DG ou Manager"
    ON profiles FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND (role = 'dg' OR role = 'manager')
        )
    );

-- Clients : Visibilité hiérarchique
-- DG voit tout
-- Manager voit les clients assignés aux commerciaux de son équipe
-- Commercial voit ses propres clients
CREATE POLICY "Lecture hiérarchique des clients"
    ON clients FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'dg'
        ) 
        OR assigned_to = auth.uid()
        OR assigned_to IN (
            SELECT id FROM profiles 
            WHERE manager_id = auth.uid()
        )
    );

CREATE POLICY "Ajout de clients par tous les authentifiés"
    ON clients FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Mise à jour des clients par les assignés ou responsables"
    ON clients FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND (role = 'dg' OR role = 'manager')
        )
        OR assigned_to = auth.uid()
    );

-- Interactions : Politiques d'accès similaires
CREATE POLICY "Lecture des interactions"
    ON interactions FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Ajout d'interactions"
    ON interactions FOR INSERT
    TO authenticated
    WITH CHECK (performed_by = auth.uid());
