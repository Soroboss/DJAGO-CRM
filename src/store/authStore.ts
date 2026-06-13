import { create } from 'zustand';
import { insforge } from '../lib/insforge';
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
  login: (email: string, password?: string) => Promise<boolean>;
  logout: () => void;
  createTeammate: (name: string, email: string, role: UserRole, zone: string, managerId?: string) => Promise<UserProfile | null>;
  fetchTeam: () => Promise<void>;
  initializeAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  team: [],
  isLoading: true,

  initializeAuth: async () => {
    try {
      const { data, error } = await insforge.auth.getCurrentUser();
      if (data?.user) {
        // Fetch profile
        const { data: profile } = await insforge.database
          .from('team_members')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (profile) {
          set({ user: profile as UserProfile, isAuthenticated: true, isLoading: false });
          await get().fetchTeam();
        } else {
          set({ isAuthenticated: false, isLoading: false });
        }
      } else {
        set({ isAuthenticated: false, isLoading: false });
      }
    } catch (e) {
      console.error(e);
      set({ isAuthenticated: false, isLoading: false });
    }
  },

  login: async (email: string, password?: string) => {
    set({ isLoading: true });
    const { addToast } = useToastStore.getState();
    const pw = password || 'DjagoAdmin2026!'; // fallback for the super admin without password input

    try {
      const { data, error } = await insforge.auth.signInWithPassword({
        email,
        password: pw
      });

      if (error) {
        addToast(error.message, "error");
        set({ isLoading: false });
        return false;
      }

      if (data?.user) {
        const { data: profile, error: profileError } = await insforge.database
          .from('team_members')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (profileError || !profile) {
          addToast("Compte authentifié, mais profil introuvable.", "warning");
          set({ isLoading: false });
          return false;
        }

        set({ user: profile as UserProfile, isAuthenticated: true, isLoading: false });
        addToast(`Akwaba, ${profile.name} ! (${profile.role.toUpperCase()})`, "success");
        await get().fetchTeam();
        return true;
      }
      return false;
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      addToast(errorMsg || "Erreur de connexion", "error");
      set({ isLoading: false });
      return false;
    }
  },

  logout: async () => {
    await insforge.auth.signOut();
    set({ user: null, isAuthenticated: false, team: [] });
    useToastStore.getState().addToast("Déconnexion réussie. Au revoir !", "info");
  },

  createTeammate: async (name: string, email: string, role: UserRole, zone: string, managerId?: string) => {
    const { addToast } = useToastStore.getState();

    try {
      // Create user using insforge admin or backend function?
      // For now, let's insert into team_members, but auth user needs to be created first!
      // In Supabase, usually auth users are created via signup or edge function.
      // Since we don't have an edge function, let's try auth.signUp (this might automatically log the current user out if not configured properly, wait.)
      // It's better to just insert in `team_members` with a generated ID if we mock it, or we need to manage users properly.
      // Let's create an auth user using a secondary client or just signup. 
      // Actually, standard `auth.signUp` logs the new user in. We probably need an admin function.
      // For the scope of this migration, we'll try signup. Wait, signup logs them in.
      addToast(`Création de compte via admin requise pour la production.`, "warning");
      return null;
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      addToast(`Échec de création : ${errorMsg}`, "error");
      return null;
    }
  },

  fetchTeam: async () => {
    try {
      const { data, error } = await insforge.database.from('team_members').select('*');
      if (data && !error) {
        set({ team: data as UserProfile[] });
      }
    } catch (e) {
      console.error("Error loading team profiles", e);
    }
  }
}));
