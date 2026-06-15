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

  // 2. Get user ID, handling requireEmailVerification=true where authData.user might be null or empty
  let userId = authData?.user?.id;
  
  if (!userId) {
    const { data: rpcData, error: rpcError } = await silentAuthClient.rpc('get_user_id_by_email', { user_email: email });
    if (rpcError) {
      console.error("RPC Error:", rpcError);
      throw new Error("Impossible de récupérer l'identifiant du nouvel utilisateur.");
    }
    userId = rpcData;
  }

  if (!userId) {
    throw new Error("L'utilisateur n'a pas pu être créé (aucune donnée retournée).");
  }

  // 3. Utiliser le client principal pour insérer le profil
  const { error: profileError } = await insforge.database
    .from('team_members')
    .insert({
      id: userId,
      name,
      email,
      role,
      zone: zone || 'Global',
      organization_id: organizationId
    });

  if (profileError) {
    throw new Error("Compte créé mais erreur lors de l'attribution du profil: " + profileError.message);
  }

  return { id: userId, email };
};
