import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { useToastStore } from '../store/toastStore';
import { insforge } from '../lib/insforge';
import { 
  LogOut, LayoutDashboard, Settings, Activity, ShieldCheck, Database, 
  Users, Building, Play, Pause, CreditCard, LifeBuoy 
} from 'lucide-react';
import { NetworkBadge } from '../components/NetworkBadge';
import { createUserSilently } from '../lib/adminAuth';

type TabType = 'dashboard' | 'tenants' | 'users' | 'billing' | 'support' | 'settings';

export const SuperAdminDashboard: React.FC = () => {
  const { logout, user } = useAuthStore();
  const { addToast } = useToastStore();
  
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [saasPlans, setSaasPlans] = useState<any[]>([]);
  const [systemSettings, setSystemSettings] = useState<any>(null);
  
  const [loading, setLoading] = useState(true);

  // Ticket Modal State
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [ticketMessages, setTicketMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');

  // Modal Create User State
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    zone: ''
  });

  useEffect(() => {
    fetchGlobalData();
  }, []);

  const fetchGlobalData = async () => {
    setLoading(true);
    try {
      const [orgsRes, usersRes, ticketsRes, plansRes, settingsRes] = await Promise.all([
        insforge.database.from('organizations').select('*, saas_plans(name)').order('created_at', { ascending: false }),
        insforge.database.from('team_members').select('*, organizations(name)').order('created_at', { ascending: false }),
        insforge.database.from('global_tickets').select('*, organizations(name)').order('created_at', { ascending: false }),
        insforge.database.from('saas_plans').select('*').order('price_fcfa', { ascending: true }),
        insforge.database.from('system_settings').select('*').eq('id', 'global').single()
      ]);
      
      if (orgsRes.error) throw orgsRes.error;
      if (usersRes.error) throw usersRes.error;
      // We don't strictly throw on global_tickets if it's empty, but let's handle it
      if (ticketsRes.error && ticketsRes.error.code !== 'PGRST116') console.error(ticketsRes.error);
      if (plansRes.error) throw plansRes.error;
      if (settingsRes.error && settingsRes.error.code !== 'PGRST116') console.error(settingsRes.error);
      
      if (orgsRes.data) setOrganizations(orgsRes.data);
      if (usersRes.data) setTeamMembers(usersRes.data);
      if (ticketsRes.data) setTickets(ticketsRes.data);
      if (plansRes.data) setSaasPlans(plansRes.data);
      if (settingsRes.data) setSystemSettings(settingsRes.data);
      
    } catch (err: any) {
      console.error(err);
      addToast("Erreur lors du chargement des données globales", "error");
    } finally {
      setLoading(false);
    }
  };

  const toggleTenantStatus = async (orgId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'suspended' ? 'active' : 'suspended';
    try {
      const { error } = await insforge.database
        .from('organizations')
        .update({ status: newStatus })
        .eq('id', orgId);
        
      if (error) throw error;
      
      addToast(`L'espace a été ${newStatus === 'active' ? 'réactivé' : 'suspendu'}.`, "success");
      setOrganizations(orgs => orgs.map(o => o.id === orgId ? { ...o, status: newStatus } : o));
    } catch (err) {
      console.error(err);
      addToast("Erreur lors de la mise à jour du statut.", "error");
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.name || !newUser.email || !newUser.password || !user?.organization_id) {
      addToast("Veuillez remplir tous les champs obligatoires (L'organisation Super Admin doit être définie)", "error");
      return;
    }
    
    setIsCreatingUser(true);
    try {
      await createUserSilently(
        newUser.email,
        newUser.password,
        newUser.name,
        'superadmin',
        user.organization_id,
        newUser.zone
      );
      
      addToast("Utilisateur créé avec succès !", "success");
      setIsUserModalOpen(false);
      setNewUser({ name: '', email: '', password: '', zone: '' });
      // Rafraîchir la liste
      fetchGlobalData();
    } catch (err: any) {
      console.error(err);
      addToast(err.message || "Erreur lors de la création de l'utilisateur", "error");
    } finally {
      setIsCreatingUser(false);
    }
  };

  const handleUpdatePlan = async (planId: string, updates: any) => {
    try {
      const { error } = await insforge.database
        .from('saas_plans')
        .update(updates)
        .eq('id', planId);
      if (error) throw error;
      addToast("Palier mis à jour avec succès", "success");
      fetchGlobalData();
    } catch (err) {
      console.error(err);
      addToast("Erreur lors de la mise à jour du palier", "error");
    }
  };

  const handleUpdateTenantPlan = async (orgId: string, newPlanId: string) => {
    try {
      const { error } = await insforge.database
        .from('organizations')
        .update({ plan_id: newPlanId, subscription_status: 'active' })
        .eq('id', orgId);
      if (error) throw error;
      addToast("Abonnement du tenant mis à jour", "success");
      fetchGlobalData();
    } catch (err) {
      console.error(err);
      addToast("Erreur lors de la mise à jour de l'abonnement", "error");
    }
  };

  const loadTicketMessages = async (ticket: any) => {
    setSelectedTicket(ticket);
    try {
      const { data, error } = await insforge.database
        .from('global_ticket_messages')
        .select('*')
        .eq('ticket_id', ticket.id)
        .order('created_at', { ascending: true });
        
      if (error) throw error;
      setTicketMessages(data || []);
    } catch (err) {
      console.error(err);
      addToast("Erreur lors du chargement des messages", "error");
    }
  };

  const handleSendTicketMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedTicket || !user) return;
    
    try {
      const { error } = await insforge.database
        .from('global_ticket_messages')
        .insert([{
          ticket_id: selectedTicket.id,
          sender_id: user.id,
          is_superadmin: true,
          message: newMessage.trim()
        }]);
        
      if (error) throw error;
      setNewMessage('');
      loadTicketMessages(selectedTicket);
      
      // Update ticket status to open if it was new
      if (selectedTicket.status === 'new') {
        await insforge.database
          .from('global_tickets')
          .update({ status: 'open' })
          .eq('id', selectedTicket.id);
        fetchGlobalData();
      }
    } catch (err) {
      console.error(err);
      addToast("Erreur lors de l'envoi du message", "error");
    }
  };

  const handleCloseTicket = async () => {
    if (!selectedTicket) return;
    try {
      const { error } = await insforge.database
        .from('global_tickets')
        .update({ status: 'resolved' })
        .eq('id', selectedTicket.id);
      if (error) throw error;
      addToast("Ticket clôturé", "success");
      setSelectedTicket(null);
      fetchGlobalData();
    } catch (err) {
      console.error(err);
      addToast("Erreur lors de la clôture du ticket", "error");
    }
  };

  const handleUpdateSettings = async (updates: any) => {
    try {
      const { error } = await insforge.database
        .from('system_settings')
        .update(updates)
        .eq('id', 'global');
      if (error) throw error;
      addToast("Paramètres mis à jour", "success");
      setSystemSettings({ ...systemSettings, ...updates });
    } catch (err) {
      console.error(err);
      addToast("Erreur lors de la mise à jour des paramètres", "error");
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-slate-50 text-slate-900 overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white border-r border-slate-200 flex flex-col z-20 shadow-sm relative">
        <div className="p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-xl shadow-md">
              D
            </div>
            <div>
              <h1 className="font-bold text-xl text-slate-900 tracking-tight">DJAGO</h1>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Super Admin</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 mt-4 space-y-1 overflow-y-auto">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all cursor-pointer ${
              activeTab === 'dashboard'
                ? 'bg-orange-500 text-white shadow-md'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Activity className="w-5 h-5" />
            <span className="font-medium text-sm">Tableau de Bord</span>
          </button>
          
          <button
            onClick={() => setActiveTab('tenants')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all cursor-pointer ${
              activeTab === 'tenants'
                ? 'bg-orange-500 text-white shadow-md'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Building className="w-5 h-5" />
            <span className="font-medium text-sm">Gestion des Tenants</span>
          </button>
          
          <button
            onClick={() => setActiveTab('users')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all cursor-pointer ${
              activeTab === 'users'
                ? 'bg-orange-500 text-white shadow-md'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Users className="w-5 h-5" />
            <span className="font-medium text-sm">Utilisateurs</span>
          </button>
          
          <button
            onClick={() => setActiveTab('billing')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all cursor-pointer ${
              activeTab === 'billing'
                ? 'bg-orange-500 text-white shadow-md'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <CreditCard className="w-5 h-5" />
            <span className="font-medium text-sm">Abonnements</span>
          </button>
          
          <button
            onClick={() => setActiveTab('support')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all cursor-pointer ${
              activeTab === 'support'
                ? 'bg-orange-500 text-white shadow-md'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <LifeBuoy className="w-5 h-5" />
            <span className="font-medium text-sm">Support Global</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all cursor-pointer mt-4 border-t border-slate-100 pt-4 ${
              activeTab === 'settings'
                ? 'bg-orange-500 text-white shadow-md'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Settings className="w-5 h-5" />
            <span className="font-medium text-sm">Paramètres</span>
          </button>
        </nav>

        <div className="p-4 border-t border-slate-200">
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-slate-50 border border-slate-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200 text-sm font-bold text-slate-700 transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            Déconnexion
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col m-4 md:ml-2 bg-white/40 backdrop-blur-3xl rounded-[2rem] border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative z-10 overflow-hidden">
        <header className="h-20 border-b border-white/60 bg-white/40 backdrop-blur-md flex items-center justify-between px-8 sticky top-0 z-10 rounded-t-[2rem]">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              {activeTab === 'dashboard' && 'Tableau de Bord Global'}
              {activeTab === 'tenants' && 'Gestion des Tenants'}
              {activeTab === 'users' && 'Utilisateurs de la Plateforme'}
              {activeTab === 'billing' && 'Abonnements & Facturation'}
              {activeTab === 'support' && 'Support Global'}
              {activeTab === 'settings' && 'Paramètres du Système'}
            </h2>
            <p className="text-sm text-slate-500">Bienvenue, {user?.name || 'Super Administrateur'}</p>
          </div>
          <div className="flex items-center gap-4">
            <NetworkBadge />
            <div className="flex items-center gap-3 bg-white border border-slate-200 px-4 py-2 rounded-full shadow-sm">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span className="text-sm font-medium text-slate-700">Accès Root</span>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8">
          {/* TAB: DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div className="space-y-8 animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
                      <Building className="w-6 h-6" />
                    </div>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-slate-900">{organizations.length}</p>
                    <p className="text-sm text-slate-500 font-medium">Tenants Actifs</p>
                  </div>
                </div>
                
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                      <Users className="w-6 h-6" />
                    </div>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-slate-900">{teamMembers.length}</p>
                    <p className="text-sm text-slate-500 font-medium">Utilisateurs Globaux</p>
                  </div>
                </div>
                
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <CreditCard className="w-6 h-6" />
                    </div>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-slate-900">0 FCFA</p>
                    <p className="text-sm text-slate-500 font-medium">Revenu Mensuel Estimé</p>
                  </div>
                </div>
                
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                      <LifeBuoy className="w-6 h-6" />
                    </div>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-slate-900">
                      {tickets.filter(t => t.status === 'open' || t.status === 'new').length}
                    </p>
                    <p className="text-sm text-slate-500 font-medium">Tickets Ouverts (Global)</p>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                  <h3 className="font-bold text-slate-900 mb-4">Derniers Tenants Inscrits</h3>
                  <div className="space-y-4">
                    {organizations.slice(0, 5).map(org => (
                      <div key={org.id} className="flex justify-between items-center pb-4 border-b border-slate-50 last:border-0 last:pb-0">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600">
                            {org.name.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">{org.name}</p>
                            <p className="text-xs text-slate-500">{new Date(org.created_at).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${org.status === 'suspended' ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
                          {org.status === 'suspended' ? 'Suspendu' : 'Actif'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                  <h3 className="font-bold text-slate-900 mb-4">Derniers Tickets de Support</h3>
                  <div className="space-y-4">
                    {tickets.slice(0, 5).map(ticket => (
                      <div key={ticket.id} className="flex flex-col gap-2 pb-4 border-b border-slate-50 last:border-0 last:pb-0">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-semibold text-slate-900">{ticket.subject}</p>
                            <p className="text-xs text-slate-500">Tenant: {ticket.organizations?.name || 'Inconnu'}</p>
                          </div>
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${
                            ticket.priority === 'high' ? 'bg-red-100 text-red-700' : 
                            ticket.priority === 'medium' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
                          }`}>
                            {ticket.priority?.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    ))}
                    {tickets.length === 0 && (
                      <p className="text-sm text-slate-500 text-center py-4">Aucun ticket pour le moment.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: TENANTS */}
          {activeTab === 'tenants' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-slate-900">Toutes les Organisations</h3>
                <button className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors shadow-sm cursor-pointer">
                  + Ajouter un Tenant
                </button>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-left text-xs uppercase tracking-wider text-slate-500 font-semibold">
                        <th className="p-4">Nom de l'Organisation</th>
                        <th className="p-4">Industrie</th>
                        <th className="p-4">Abonnement</th>
                        <th className="p-4">Statut</th>
                        <th className="p-4">Utilisateurs</th>
                        <th className="p-4">Créé le</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {loading ? (
                        <tr><td colSpan={6} className="p-8 text-center text-slate-500">Chargement...</td></tr>
                      ) : organizations.length === 0 ? (
                        <tr><td colSpan={6} className="p-8 text-center text-slate-500">Aucune organisation trouvée.</td></tr>
                      ) : (
                        organizations.map(org => (
                          <tr key={org.id} className="hover:bg-slate-50 transition-colors">
                            <td className="p-4 font-medium text-slate-900">{org.name}</td>
                            <td className="p-4 text-sm text-slate-600">
                              <span className="bg-slate-100 text-slate-700 px-2 py-1 rounded text-xs">
                                {org.industry_category || 'N/A'}
                              </span>
                            </td>
                            <td className="p-4 text-sm">
                              <div className="flex flex-col gap-1">
                                <span className="font-semibold text-slate-900">{org.saas_plans?.name || 'Aucun plan'}</span>
                                <select
                                  className="text-xs border border-slate-200 rounded p-1 w-full max-w-[120px]"
                                  value={org.plan_id || ''}
                                  onChange={(e) => handleUpdateTenantPlan(org.id, e.target.value)}
                                >
                                  <option value="" disabled>Changer plan...</option>
                                  {saasPlans.map(p => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                  ))}
                                </select>
                              </div>
                            </td>
                            <td className="p-4">
                              <span className={`px-2 py-1 rounded text-xs font-semibold ${org.status === 'suspended' ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
                                {org.status === 'suspended' ? 'Suspendu' : 'Actif'}
                              </span>
                            </td>
                            <td className="p-4 text-sm text-slate-900 font-bold">
                              {teamMembers.filter(t => t.organization_id === org.id).length}
                            </td>
                            <td className="p-4 text-sm text-slate-500">
                              {new Date(org.created_at).toLocaleDateString()}
                            </td>
                            <td className="p-4 text-right">
                              <button 
                                onClick={() => toggleTenantStatus(org.id, org.status || 'active')} 
                                className={`text-sm font-medium transition-colors cursor-pointer px-3 py-1 border rounded-lg ${
                                  org.status === 'suspended' 
                                    ? 'border-emerald-200 text-emerald-600 hover:bg-emerald-50' 
                                    : 'border-orange-200 text-orange-600 hover:bg-orange-50'
                                }`}
                              >
                                {org.status === 'suspended' ? 'Réactiver' : 'Suspendre'}
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB: USERS */}
          {activeTab === 'users' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-slate-900">Tous les Utilisateurs</h3>
                <button 
                  onClick={() => setIsUserModalOpen(true)}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors shadow-sm cursor-pointer"
                >
                  + Ajouter un Utilisateur
                </button>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-left text-xs uppercase tracking-wider text-slate-500 font-semibold">
                        <th className="p-4">Utilisateur</th>
                        <th className="p-4">Rôle</th>
                        <th className="p-4">Organisation (Tenant)</th>
                        <th className="p-4">Zone</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {loading ? (
                        <tr><td colSpan={5} className="p-8 text-center text-slate-500">Chargement...</td></tr>
                      ) : teamMembers.filter(m => m.role === 'superadmin').length === 0 ? (
                        <tr><td colSpan={5} className="p-8 text-center text-slate-500">Aucun super admin trouvé.</td></tr>
                      ) : (
                        teamMembers.filter(m => m.role === 'superadmin').map(member => (
                          <tr key={member.id} className="hover:bg-slate-50 transition-colors">
                            <td className="p-4">
                              <div className="flex flex-col">
                                <span className="font-medium text-slate-900">{member.name}</span>
                                <span className="text-xs text-slate-500">{member.email}</span>
                              </div>
                            </td>
                            <td className="p-4">
                              <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                member.role === 'superadmin' ? 'bg-purple-100 text-purple-700' :
                                member.role === 'dg' ? 'bg-blue-100 text-blue-700' :
                                'bg-slate-100 text-slate-700'
                              }`}>
                                {member.role.toUpperCase()}
                              </span>
                            </td>
                            <td className="p-4 text-sm font-medium text-slate-700">
                              {member.organizations?.name || 'N/A'}
                            </td>
                            <td className="p-4 text-sm text-slate-500">
                              {member.zone || 'N/A'}
                            </td>
                            <td className="p-4 text-right">
                              <button className="text-slate-400 hover:text-blue-600 transition-colors text-sm font-medium">
                                Voir détails
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB: BILLING */}
          {activeTab === 'billing' && (
            <div className="space-y-6 animate-fade-in flex flex-col items-center justify-center py-20">
              <div className="w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center mb-6">
                <CreditCard className="w-12 h-12 text-orange-500" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 text-center">Module de Facturation SaaS</h3>
              <p className="text-slate-500 text-center max-w-lg mb-8">
                Gérez ici les abonnements de vos tenants. Connectez Stripe ou Razorpay pour automatiser 
                la facturation mensuelle de la plateforme DJAGO CRM.
              </p>
              <button className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-slate-800 transition-colors shadow-md">
                Configurer Stripe
              </button>
            </div>
          )}

          {/* TAB: SUPPORT */}
          {activeTab === 'support' && (
            <div className="space-y-6 animate-fade-in">
              <h3 className="text-lg font-bold text-slate-900">Tickets de Support (Global)</h3>
              
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-left text-xs uppercase tracking-wider text-slate-500 font-semibold">
                        <th className="p-4">Sujet</th>
                        <th className="p-4">Tenant</th>
                        <th className="p-4">Priorité</th>
                        <th className="p-4">Statut</th>
                        <th className="p-4">Créé le</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {loading ? (
                        <tr><td colSpan={6} className="p-8 text-center text-slate-500">Chargement...</td></tr>
                      ) : tickets.length === 0 ? (
                        <tr><td colSpan={6} className="p-8 text-center text-slate-500">Aucun ticket ouvert.</td></tr>
                      ) : (
                        tickets.map(ticket => (
                          <tr key={ticket.id} className="hover:bg-slate-50 transition-colors">
                            <td className="p-4 font-medium text-slate-900">{ticket.subject}</td>
                            <td className="p-4 text-sm font-medium text-slate-700">
                              {ticket.organizations?.name || 'N/A'}
                            </td>
                            <td className="p-4">
                              <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                ticket.priority === 'high' ? 'bg-red-100 text-red-700' : 
                                ticket.priority === 'medium' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
                              }`}>
                                {ticket.priority?.toUpperCase() || 'LOW'}
                              </span>
                            </td>
                            <td className="p-4">
                              <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                ticket.status === 'resolved' ? 'bg-emerald-100 text-emerald-700' : 
                                'bg-yellow-100 text-yellow-700'
                              }`}>
                                {ticket.status?.toUpperCase() || 'NEW'}
                              </span>
                            </td>
                            <td className="p-4 text-sm text-slate-500">
                              {new Date(ticket.created_at).toLocaleDateString()}
                            </td>
                            <td className="p-4 text-right">
                              <button 
                                onClick={() => loadTicketMessages(ticket)}
                                className="text-blue-600 hover:text-blue-800 transition-colors text-sm font-medium"
                              >
                                Répondre
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB: SETTINGS */}
          {activeTab === 'settings' && (
            <div className="space-y-6 animate-fade-in p-6">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
                  <Settings className="w-8 h-8 text-slate-400" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-900">Paramètres Globaux & Paliers</h3>
                  <p className="text-slate-500">Gérez les offres d'abonnement et leurs caractéristiques.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Saas Plans configuration */}
                <div className="space-y-6">
                  <h4 className="text-xl font-bold text-slate-900 border-b border-slate-200 pb-2">Paliers d'Abonnement</h4>
                  {saasPlans.map(plan => (
                    <div key={plan.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="text-lg font-bold text-slate-900">{plan.name}</h4>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${plan.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                          {plan.is_active ? 'Actif' : 'Inactif'}
                        </span>
                      </div>
                      
                      <div className="space-y-4 flex-1">
                        <div>
                          <label className="block text-xs font-medium text-slate-500 uppercase mb-1">Prix (FCFA)</label>
                          <input 
                            type="number" 
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none font-bold"
                            defaultValue={plan.price_fcfa}
                            onBlur={(e) => {
                              if (e.target.value !== plan.price_fcfa.toString()) {
                                handleUpdatePlan(plan.id, { price_fcfa: parseInt(e.target.value) });
                              }
                            }}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-500 uppercase mb-1">Prix (USD)</label>
                          <input 
                            type="number" 
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none font-bold"
                            defaultValue={plan.price_usd}
                            onBlur={(e) => {
                              if (e.target.value !== plan.price_usd.toString()) {
                                handleUpdatePlan(plan.id, { price_usd: parseFloat(e.target.value) });
                              }
                            }}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-medium text-slate-500 uppercase mb-1">Limite Utilisateurs</label>
                            <input 
                              type="number" 
                              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                              defaultValue={plan.features?.max_users || 0}
                              onBlur={(e) => {
                                const newFeatures = { ...plan.features, max_users: parseInt(e.target.value) };
                                handleUpdatePlan(plan.id, { features: newFeatures });
                              }}
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-slate-500 uppercase mb-1">Limite Clients</label>
                            <input 
                              type="number" 
                              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                              defaultValue={plan.features?.max_clients || 0}
                              onBlur={(e) => {
                                const newFeatures = { ...plan.features, max_clients: parseInt(e.target.value) };
                                handleUpdatePlan(plan.id, { features: newFeatures });
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Global Settings Configuration */}
                <div className="space-y-6">
                  <h4 className="text-xl font-bold text-slate-900 border-b border-slate-200 pb-2">Configuration Système</h4>
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
                    <div>
                      <h5 className="font-bold text-slate-900 mb-2">Période d'essai</h5>
                      <label className="block text-xs font-medium text-slate-500 uppercase mb-1">Nombre de jours par défaut</label>
                      <input 
                        type="number" 
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none font-bold"
                        defaultValue={systemSettings?.default_trial_days || 14}
                        onBlur={(e) => handleUpdateSettings({ default_trial_days: parseInt(e.target.value) })}
                      />
                    </div>
                    
                    <div className="pt-4 border-t border-slate-100">
                      <h5 className="font-bold text-slate-900 mb-2">Passerelle de Paiement (Mobile Money)</h5>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-xs font-medium text-slate-500 uppercase mb-1">API Key (ex: CinetPay)</label>
                          <input 
                            type="password" 
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                            placeholder="Entrez l'API Key"
                            defaultValue={systemSettings?.cinetpay_api_key || ''}
                            onBlur={(e) => handleUpdateSettings({ cinetpay_api_key: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-500 uppercase mb-1">Site ID</label>
                          <input 
                            type="text" 
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                            placeholder="Entrez le Site ID"
                            defaultValue={systemSettings?.cinetpay_site_id || ''}
                            onBlur={(e) => handleUpdateSettings({ cinetpay_site_id: e.target.value })}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                      <div>
                        <h5 className="font-bold text-slate-900">Mode Maintenance</h5>
                        <p className="text-sm text-slate-500">Suspendre l'accès pour tous les locataires</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer" 
                          checked={systemSettings?.maintenance_mode || false}
                          onChange={(e) => handleUpdateSettings({ maintenance_mode: e.target.checked })}
                        />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500"></div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* MODAL CRÉER UTILISATEUR */}
      {isUserModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-fade-in">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-lg text-slate-900">Créer un nouvel utilisateur</h3>
              <button 
                onClick={() => setIsUserModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleCreateUser} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nom complet *</label>
                <input 
                  type="text" required
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">E-mail *</label>
                <input 
                  type="email" required
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Mot de passe temporaire *</label>
                <input 
                  type="text" required
                  placeholder="Ex: TempPass123!"
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})}
                />
                <p className="text-xs text-slate-500 mt-1">L'utilisateur devra utiliser ce mot de passe pour sa première connexion.</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Rôle</label>
                  <input 
                    type="text" 
                    readOnly
                    className="w-full px-4 py-2 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed"
                    value="Super Admin"
                  />
                  <p className="text-xs text-slate-500 mt-1">L'utilisateur fera partie de votre équipe d'administration SaaS.</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Zone (Optionnel)</label>
                  <input 
                    type="text" placeholder="Ex: Globale"
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    value={newUser.zone} onChange={e => setNewUser({...newUser, zone: e.target.value})}
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex gap-3">
                <button 
                  type="button" onClick={() => setIsUserModalOpen(false)}
                  className="flex-1 px-4 py-2 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 font-medium cursor-pointer"
                >
                  Annuler
                </button>
                <button 
                  type="submit" disabled={isCreatingUser}
                  className="flex-1 px-4 py-2 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 font-medium cursor-pointer disabled:opacity-50"
                >
                  {isCreatingUser ? 'Création...' : 'Créer l\'utilisateur'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TICKET MODAL */}
      {selectedTicket && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl h-[80vh] flex flex-col shadow-2xl animate-fade-in">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div>
                <h3 className="font-bold text-lg text-slate-900">{selectedTicket.subject}</h3>
                <p className="text-xs text-slate-500">
                  Tenant: {selectedTicket.organizations?.name} | Statut: {selectedTicket.status}
                </p>
              </div>
              <div className="flex items-center gap-3">
                {selectedTicket.status !== 'resolved' && (
                  <button 
                    onClick={handleCloseTicket}
                    className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-lg hover:bg-emerald-200 transition-colors"
                  >
                    Marquer Résolu
                  </button>
                )}
                <button 
                  onClick={() => setSelectedTicket(null)}
                  className="text-slate-400 hover:text-slate-600 p-1"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50">
              {ticketMessages.map((msg) => (
                <div key={msg.id} className={`flex flex-col ${msg.is_superadmin ? 'items-end' : 'items-start'}`}>
                  <div className={`max-w-[80%] rounded-2xl p-4 ${msg.is_superadmin ? 'bg-orange-500 text-white rounded-tr-none' : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none'}`}>
                    <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1">{new Date(msg.created_at).toLocaleString()}</span>
                </div>
              ))}
            </div>

            {selectedTicket.status !== 'resolved' && (
              <form onSubmit={handleSendTicketMessage} className="p-4 border-t border-slate-100 bg-white flex gap-2">
                <input 
                  type="text" 
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Écrivez votre réponse..."
                  className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                <button 
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="bg-orange-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-orange-600 disabled:opacity-50 transition-colors"
                >
                  Envoyer
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
