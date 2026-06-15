import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_INSFORGE_URL || 'https://5dme2uf5.eu-central.database.insforge.app';
const supabaseKey = process.env.VITE_INSFORGE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'; // Wait, I need the actual anon key.

