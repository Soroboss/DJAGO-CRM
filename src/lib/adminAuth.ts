import { createClient } from '@supabase/supabase-js';
import { insforge } from './insforge';

const VITE_INSFORGE_URL = import.meta.env.VITE_INSFORGE_URL;
const VITE_INSFORGE_ANON_KEY = import.meta.env.VITE_INSFORGE_ANON_KEY;

// Un client temporaire sans persistance de session pour ne pas déconnecter l'admin
export const silentAuthClient = createClient(VITE_INSFORGE_URL, VITE_INSFORGE_ANON_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false
  }
});

export const createUserSilently = async (email: string, password: string, name: string, role: string, organizationId: string, zone?: string) => {
  // 1. Créer l'utilisateur via le client temporaire
  const { data: authData, error: authError } = await silentAuthClient.auth.signUp({
    email,
    password
  });

  if (authError) {
    throw new Error(authError.message);
  }

  if (!authData?.user) {
    throw new Error("L'utilisateur n'a pas pu être créé (aucune donnée retournée).");
  }

  // 2. Utiliser le client principal (qui a les droits de Super Admin) pour insérer le profil
  const { error: profileError } = await insforge.database
    .from('team_members')
    .insert({
      id: authData.user.id,
      name,
      email,
      role,
      zone: zone || 'Global',
      organization_id: organizationId
    });

  if (profileError) {
    throw new Error("Compte créé mais erreur lors de l'attribution du profil: " + profileError.message);
  }

  return authData.user;
};
