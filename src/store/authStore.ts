import { create } from 'zustand';
import { supabase, isSupabaseConfigured } from '../services/supabaseClient';
import { useToastStore } from './toastStore';

export type UserRole = 'dg' | 'manager' | 'commercial';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  manager_id?: string;
  zone: string;
  created_at: string;
}

interface AuthState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  team: UserProfile[];
  isLoading: boolean;
  login: (email: string) => Promise<boolean>;
  logout: () => void;
  createTeammate: (name: string, email: string, role: UserRole, zone: string, managerId?: string) => Promise<UserProfile | null>;
  fetchTeam: () => Promise<void>;
}

// Pre-seeded local profiles for Mock Mode
const MOCK_PROFILES: UserProfile[] = [
  {
    id: 'dg-111-uuid',
    name: 'M. Touré (Le Vieux)',
    email: 'le_vieux@djagocrm.ci',
    role: 'dg',
    zone: 'Toutes',
    created_at: new Date().toISOString()
  },
  {
    id: 'mgr-222-uuid',
    name: 'Koffi Konan',
    email: 'koffi.manager@djagocrm.ci',
    role: 'manager',
    zone: 'Ouest',
    created_at: new Date().toISOString()
  },
  {
    id: 'com-333-uuid',
    name: 'Salif "Le Wara" Diomandé',
    email: 'salif.wara@djagocrm.ci',
    role: 'commercial',
    manager_id: 'mgr-222-uuid',
    zone: 'Ouest',
    created_at: new Date().toISOString()
  },
  {
    id: 'com-444-uuid',
    name: 'Awa Diallo',
    email: 'awa.wara@djagocrm.ci',
    role: 'commercial',
    manager_id: 'mgr-222-uuid',
    zone: 'Ouest',
    created_at: new Date().toISOString()
  }
];

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  team: MOCK_PROFILES,
  isLoading: false,

  login: async (email: string) => {
    set({ isLoading: true });
    const { addToast } = useToastStore.getState();

    try {
      if (isSupabaseConfigured && supabase) {
        // Query Supabase for the profile
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('email', email)
          .single();

        if (error || !data) {
          addToast("Compte introuvable dans Supabase. Redirection vers le mode démo.", "warning");
        } else {
          set({ user: data as UserProfile, isAuthenticated: true, isLoading: false });
          addToast(`Akwaba, ${data.name} ! (${data.role.toUpperCase()})`, "success");
          await get().fetchTeam();
          return true;
        }
      }

      // Local mock login fallback
      const localUser = MOCK_PROFILES.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (localUser) {
        set({ user: localUser, isAuthenticated: true, isLoading: false });
        addToast(`Akwaba, ${localUser.name} ! (Mode Démo - ${localUser.role.toUpperCase()})`, "success");
        await get().fetchTeam();
        return true;
      } else {
        // Create a quick temporary commercial account if not found to make testing seamless
        const newDemoUser: UserProfile = {
          id: `demo-${Math.random().toString(36).substring(2, 9)}`,
          name: email.split('@')[0].toUpperCase(),
          email: email,
          role: 'commercial',
          zone: 'Sud',
          created_at: new Date().toISOString()
        };
        MOCK_PROFILES.push(newDemoUser);
        set({ user: newDemoUser, isAuthenticated: true, isLoading: false });
        addToast(`Nouveau profil de test créé : ${newDemoUser.name}`, "info");
        await get().fetchTeam();
        return true;
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      addToast(errorMsg || "Erreur de connexion", "error");
      set({ isLoading: false });
      return false;
    }
  },

  logout: () => {
    set({ user: null, isAuthenticated: false });
    useToastStore.getState().addToast("Déconnexion réussie. Au revoir !", "info");
  },

  createTeammate: async (name: string, email: string, role: UserRole, zone: string, managerId?: string) => {
    const { addToast } = useToastStore.getState();
    const newTeammate: UserProfile = {
      id: Math.random().toString(36).substring(2, 15) + '-uuid',
      name,
      email,
      role,
      zone,
      manager_id: managerId,
      created_at: new Date().toISOString()
    };

    try {
      if (isSupabaseConfigured && supabase) {
        const { error } = await supabase
          .from('profiles')
          .insert([
            {
              id: newTeammate.id,
              name,
              email,
              role,
              manager_id: managerId || null,
              zone
            }
          ])
          .select();

        if (error) throw error;
        addToast(`Collaborateur ${name} créé avec succès sur Supabase`, "success");
      } else {
        // Mock Mode Local Save
        MOCK_PROFILES.push(newTeammate);
        addToast(`Collaborateur ${name} créé localement (Mode Démo)`, "success");
      }

      set((state) => ({ team: [...state.team, newTeammate] }));
      return newTeammate;
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      addToast(`Échec de création : ${errorMsg}`, "error");
      return null;
    }
  },

  fetchTeam: async () => {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('profiles').select('*');
        if (data && !error) {
          set({ team: data as UserProfile[] });
        }
      } catch (e) {
        console.error("Error loading team profiles", e);
      }
    } else {
      // In mock mode, team is MOCK_PROFILES
      set({ team: [...MOCK_PROFILES] });
    }
  }
}));
