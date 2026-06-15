import { create } from 'zustand';
import { insforge } from '../lib/insforge';
import { useToastStore } from './toastStore';
import { type IndustryConfig, getIndustryConfig } from '../config/industries';

export type UserRole = 'superadmin' | 'dg' | 'manager' | 'commercial';

export interface Organization {
  id: string;
  name: string;
  industry_category: string;
  active_modules: any;
  settings: any;
  plan_id?: string;
  subscription_status?: string;
  created_at: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  manager_id?: string;
  zone: string;
  organization_id: string;
  created_at: string;
}

interface AuthState {
  user: UserProfile | null;
  organization: Organization | null;
  industryConfig: IndustryConfig | null;
  isAuthenticated: boolean;
  team: UserProfile[];
  isLoading: boolean;
  login: (email: string, password?: string) => Promise<boolean>;
  signup: (email: string, password: string, name: string, orgName: string, industryCategory: string) => Promise<{requiresEmailVerification: boolean, success: boolean}>;
  verifyOtp: (email: string, code: string) => Promise<boolean>;
  logout: () => Promise<void>;
  createTeammate: (name: string, email: string, role: UserRole, zone: string, managerId?: string) => Promise<UserProfile | null>;
  updateTeammate: (id: string, updates: Partial<UserProfile>) => Promise<boolean>;
  deleteTeammate: (id: string) => Promise<boolean>;
  fetchTeam: () => Promise<void>;
  initializeAuth: () => Promise<void>;
  updateOrganizationSettings: (settings: any) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  organization: null,
  industryConfig: null,
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
          // Fetch organization
          const { data: org } = await insforge.database
            .from('organizations')
            .select('*')
            .eq('id', profile.organization_id)
            .single();

          set({ 
            user: profile as UserProfile, 
            organization: org as Organization,
            industryConfig: getIndustryConfig(org?.industry_category),
            isAuthenticated: true, 
            isLoading: false 
          });
          await get().fetchTeam();
        } else {
          // Profil manquant. Vérifions si on vient de valider un e-mail avec des données en attente.
          const pendingDataStr = localStorage.getItem('pending_signup');
          if (pendingDataStr) {
            try {
              const pendingData = JSON.parse(pendingDataStr);
              if (pendingData.email.toLowerCase() === data.user.email?.toLowerCase()) {
                const { addToast } = useToastStore.getState();
                
                // Générer l'ID côté client pour éviter l'erreur RLS au moment du SELECT
                const newOrgId = crypto.randomUUID ? crypto.randomUUID() : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                  const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
                  return v.toString(16);
                });

                // Créer l'organisation sans faire de select() car RLS empêche la lecture avant la création du team_member
                const { error: orgError } = await insforge.database
                  .from('organizations')
                  .insert({ id: newOrgId, name: pendingData.orgName, industry_category: pendingData.industryCategory });

                if (!orgError) {
                  // Créer le profil Utilisateur
                  const { error: profileError } = await insforge.database
                    .from('team_members')
                    .insert({
                      id: data.user.id,
                      name: pendingData.name,
                      email: data.user.email, // utiliser l'email formaté par Supabase
                      role: data.user.email.toLowerCase() === 'soroboss.bossimpact@gmail.com' ? 'superadmin' : 'dg',
                      zone: 'Global',
                      organization_id: newOrgId
                    });

                  if (!profileError) {
                    localStorage.removeItem('pending_signup');
                    addToast("Compte vérifié et créé avec succès ! Bienvenue.", "success");
                    // Relancer l'initialisation pour charger les nouvelles données
                    await get().initializeAuth();
                    return; // Sortie prématurée pour éviter de set false
                  } else {
                    console.error("Erreur création profil:", profileError);
                    addToast("Erreur profil: " + (profileError?.message || JSON.stringify(profileError)), "error");
                  }
                } else {
                  console.error("Erreur création organisation:", orgError);
                  addToast("Erreur organisation: " + (orgError?.message || JSON.stringify(orgError)), "error");
                }
              } else {
                console.error("Email mismatch in pending_signup:", pendingData.email, "vs", data.user.email);
              }
            } catch (err) {
              console.error("Erreur lors de la finalisation post-email", err);
            }
          }
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
    const pw = password || 'DjagoAdmin2026!'; // fallback for the super admin

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
          const pendingDataStr = localStorage.getItem('pending_signup');
          if (pendingDataStr) {
            // Le profil n'est pas encore créé mais on a des données en attente,
            // on délègue à initializeAuth qui va s'en charger.
            await get().initializeAuth();
            return true;
          }
          addToast("Compte authentifié, mais profil introuvable.", "warning");
          set({ isLoading: false });
          return false;
        }

        const { data: org } = await insforge.database
          .from('organizations')
          .select('*')
          .eq('id', profile.organization_id)
          .single();

        set({ 
          user: profile as UserProfile, 
          organization: org as Organization,
          industryConfig: getIndustryConfig(org?.industry_category),
          isAuthenticated: true, 
          isLoading: false 
        });
        addToast(`Bienvenue, ${profile.name} !`, "success");
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

  signup: async (email: string, password: string, name: string, orgName: string, industryCategory: string) => {
    console.log("[authStore] Starting signup for", email);
    set({ isLoading: true });
    const { addToast } = useToastStore.getState();

    try {
      console.log("[authStore] Calling insforge.auth.signUp...");
      const { data, error } = await Promise.race([
        insforge.auth.signUp({ email, password }),
        new Promise<any>((_, reject) => setTimeout(() => reject(new Error("Timeout réseau après 15 secondes")), 15000))
      ]);
      console.log("[authStore] signUp returned. error:", error, "data:", !!data);

      if (error) {
        addToast(error.message, "error");
        set({ isLoading: false });
        return { requiresEmailVerification: false, success: false };
      }

      // Si data.user est présent OU si data est présent sans erreur (cas de protection d'énumération où l'utilisateur existe déjà)
      if (data) {
        const token = (data as any).session?.access_token || (data as any).accessToken;
        console.log("[authStore] token presence:", !!token, "user presence:", !!data.user);
        
        if (!token) {
          // Stocker localement en attendant la validation
          console.log("[authStore] No token, saving pending_signup and setting requiresEmailVerification");
          localStorage.setItem('pending_signup', JSON.stringify({ name, email, orgName, industryCategory }));
          addToast("Un code de vérification vous a été envoyé par e-mail.", "info");
          set({ isLoading: false });
          return { requiresEmailVerification: true, success: true };
        }

        // Si l'e-mail n'est pas requis et qu'on a un token (connexion immédiate)
        if (data.user) {
          const { data: org, error: orgError } = await insforge.database
            .from('organizations')
            .insert({ name: orgName, industry_category: industryCategory })
            .select()
            .single();

          if (orgError || !org) {
            addToast("Erreur lors de la création de l'espace de travail", "error");
            set({ isLoading: false });
            return { requiresEmailVerification: false, success: false };
          }

          const { error: profileError } = await insforge.database
            .from('team_members')
            .insert({
              id: data.user.id,
              name,
              email,
              role: email.toLowerCase() === 'soroboss.bossimpact@gmail.com' ? 'superadmin' : 'dg',
              zone: 'Global',
              organization_id: org.id
            });

          if (profileError) {
            addToast("Erreur lors de la création du profil", "error");
            set({ isLoading: false });
            return { requiresEmailVerification: false, success: false };
          }

          addToast("Compte créé avec succès ! Bienvenue.", "success");
          await get().initializeAuth();
          return { requiresEmailVerification: false, success: true };
        }
      }
      
      set({ isLoading: false });
      return { requiresEmailVerification: false, success: false };
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      addToast(errorMsg || "Erreur lors de l'inscription", "error");
      set({ isLoading: false });
      return { requiresEmailVerification: false, success: false };
    }
  },

  verifyOtp: async (email: string, code: string) => {
    set({ isLoading: true });
    const { addToast } = useToastStore.getState();
    try {
      const { data, error } = await insforge.auth.verifyEmail({
        email,
        otp: code
      });
      
      if (error || !data) {
        addToast(error?.message || "Code invalide ou expiré", "error");
        set({ isLoading: false });
        return false;
      }
      
      // On ne connecte pas automatiquement l'utilisateur, on arrête le chargement.
      // Le workflow exige que l'utilisateur clique sur le bouton pour se connecter.
      set({ isLoading: false });
      return true;
    } catch (err: unknown) {
      addToast(String(err), "error");
      set({ isLoading: false });
      return false;
    }
  },

  logout: async () => {
    await insforge.auth.signOut();
    set({ user: null, organization: null, industryConfig: null, isAuthenticated: false, team: [] });
    useToastStore.getState().addToast("Déconnexion réussie. Au revoir !", "info");
  },

  createTeammate: async (name: string, email: string, role: UserRole, zone: string, managerId?: string): Promise<UserProfile | null> => {
    const { addToast } = useToastStore.getState();
    const org = get().organization;
    
    if (!org) {
      addToast("Organisation introuvable", "error");
      return null;
    }

    try {
      // 1. Create a secondary client with InsForge SDK
      const { createClient } = await import('@insforge/sdk');
      const insforgeUrl = import.meta.env.VITE_INSFORGE_URL || '';
      const insforgeAnonKey = import.meta.env.VITE_INSFORGE_ANON_KEY || '';
      
      const tempClient = createClient({
        baseUrl: insforgeUrl,
        anonKey: insforgeAnonKey
      });

      // 2. Sign up the user
      const { data, error: signUpError } = await tempClient.auth.signUp({
        email,
        password: 'Password123!',
        name
      });

      let userId = data?.user?.id;

      if (signUpError) {
        if (signUpError.message.toLowerCase().includes('already') || signUpError.message.toLowerCase().includes('existe déjà')) {
          // The user exists in auth.users (likely because they were deleted from team_members before but not from auth.users)
          // Let's recover their ID so we can recreate their profile in team_members
          const { data: rpcData, error: rpcError } = await insforge.database.rpc('get_user_id_by_email', { user_email: email });
          if (!rpcError && rpcData) {
            userId = rpcData;
          } else {
            throw new Error("Cet e-mail est déjà utilisé par un compte existant et impossible de le récupérer.");
          }
        } else {
          throw signUpError;
        }
      }
      
      if (!userId) {
        // We use insforge.database.rpc to call the RPC because tempClient doesn't have it at top level
        const { data: rpcData, error: rpcError } = await insforge.database.rpc('get_user_id_by_email', { user_email: email });
        if (rpcError) {
          console.error("RPC Error:", rpcError);
          throw new Error("Impossible de récupérer l'identifiant du nouvel utilisateur.");
        }
        userId = rpcData;
      }

      if (userId) {
        // 4. Create the team_member profile using the main client
        const newUserProfile = {
          id: userId,
          name,
          email,
          role,
          zone,
          manager_id: managerId || null,
          organization_id: org.id
        };

        const { error: insertError } = await insforge.database
          .from('team_members')
          .insert(newUserProfile);

        if (insertError) {
          throw insertError;
        }

        addToast(`Collaborateur ${name} créé avec succès ! Il peut se connecter avec le mot de passe : Password123!`, "success");
        await get().fetchTeam();
        return newUserProfile as UserProfile;
      } else {
        throw new Error("L'utilisateur a été créé mais son ID est introuvable.");
      }
    } catch (err: any) {
      addToast(`Erreur : ${err.message}`, "error");
      return null;
    }
  },

  updateTeammate: async (id: string, updates: Partial<UserProfile>) => {
    const { addToast } = useToastStore.getState();
    try {
      const { error } = await insforge.database
        .from('team_members')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      
      addToast("Collaborateur mis à jour avec succès", "success");
      await get().fetchTeam();
      return true;
    } catch (err: any) {
      addToast(`Erreur : ${err.message}`, "error");
      return false;
    }
  },

  deleteTeammate: async (id: string) => {
    const { addToast } = useToastStore.getState();
    try {
      const { error } = await insforge.database.rpc('delete_user_by_id', { user_to_delete: id });

      if (error) throw error;
      
      addToast("Collaborateur supprimé définitivement", "success");
      await get().fetchTeam();
      return true;
    } catch (err: any) {
      addToast(`Erreur : ${err.message}`, "error");
      return false;
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
  },

  updateOrganizationSettings: async (settingsUpdate: any) => {
    const org = get().organization;
    if (!org) return;

    const newSettings = { ...org.settings, ...settingsUpdate };

    try {
      const { error } = await insforge.database
        .from('organizations')
        .update({ settings: newSettings })
        .eq('id', org.id);

      if (error) throw error;
      
      set({ organization: { ...org, settings: newSettings } });
      useToastStore.getState().addToast("Paramètres mis à jour avec succès", "success");
    } catch (e) {
      console.error("Error updating organization settings", e);
      useToastStore.getState().addToast("Erreur lors de la mise à jour des paramètres", "error");
    }
  }
}));
