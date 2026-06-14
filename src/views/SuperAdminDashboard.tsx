import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { useToastStore } from '../store/toastStore';
import { insforge } from '../lib/insforge';
import { LogOut, LayoutDashboard, Settings, Activity, ShieldCheck, Database, Users, Building, Play, Pause } from 'lucide-react';
import { NetworkBadge } from '../components/NetworkBadge';

export const SuperAdminDashboard: React.FC = () => {
  const { logout, user } = useAuthStore();
  const { addToast } = useToastStore();
  const [activeTab, setActiveTab] = useState<'tenants' | 'health' | 'settings'>('tenants');
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const fetchOrganizations = async () => {
    setLoading(true);
    try {
      const { data, error } = await insforge.database
        .from('organizations')
        .select('*');
      
      if (error) throw error;
      if (data) setOrganizations(data);
    } catch (err: any) {
      console.error(err);
      addToast("Erreur lors du chargement des tenants", "error");
    } finally {
      setLoading(false);
    }
  };

  const toggleTenantStatus = async (orgId: string, currentStatus: string) => {
    // We assume 'active' or 'suspended' exists. If not, we use a basic alert for now.
    addToast(`Changement de statut pour le tenant ${orgId} en cours...`, "info");
    // Pseudo-code for changing status if there was a status column
    // await insforge.database.from('organizations').update({ status: newStatus }).eq('id', orgId);
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

        <nav className="flex-1 px-4 mt-6 space-y-2 overflow-y-auto">
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
            onClick={() => setActiveTab('health')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all cursor-pointer ${
              activeTab === 'health'
                ? 'bg-orange-500 text-white shadow-md'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Activity className="w-5 h-5" />
            <span className="font-medium text-sm">Santé du Système</span>
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all cursor-pointer ${
              activeTab === 'settings'
                ? 'bg-orange-500 text-white shadow-md'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Settings className="w-5 h-5" />
            <span className="font-medium text-sm">Paramètres Globaux</span>
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
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative bg-slate-50">
        <header className="h-20 border-b border-slate-200 bg-white/80 backdrop-blur-md flex items-center justify-between px-8 sticky top-0 z-10">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              {activeTab === 'tenants' && 'Gestion des Tenants'}
              {activeTab === 'health' && 'Santé du Système'}
              {activeTab === 'settings' && 'Paramètres'}
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
          {activeTab === 'tenants' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-slate-900">Organisations Inscrites</h3>
                <button className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors shadow-sm cursor-pointer">
                  + Ajouter un Tenant
                </button>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-left text-xs uppercase tracking-wider text-slate-500 font-semibold">
                        <th className="p-4">ID</th>
                        <th className="p-4">Nom de l'Organisation</th>
                        <th className="p-4">Industrie</th>
                        <th className="p-4">Créé le</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {loading ? (
                        <tr>
                          <td colSpan={5} className="p-8 text-center text-slate-500">Chargement...</td>
                        </tr>
                      ) : organizations.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="p-8 text-center text-slate-500">Aucune organisation trouvée.</td>
                        </tr>
                      ) : (
                        organizations.map(org => (
                          <tr key={org.id} className="hover:bg-slate-50 transition-colors">
                            <td className="p-4 text-xs font-mono text-slate-500">{org.id.split('-')[0]}...</td>
                            <td className="p-4 font-medium text-slate-900">{org.name}</td>
                            <td className="p-4 text-sm text-slate-600">
                              <span className="bg-slate-100 text-slate-700 px-2 py-1 rounded text-xs">
                                {org.industry_category || 'N/A'}
                              </span>
                            </td>
                            <td className="p-4 text-sm text-slate-500">
                              {new Date(org.created_at).toLocaleDateString()}
                            </td>
                            <td className="p-4 text-right">
                              <button onClick={() => toggleTenantStatus(org.id, 'active')} className="text-sm text-orange-600 hover:text-orange-700 font-medium cursor-pointer">
                                Gérer
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

          {activeTab === 'health' && (
            <div className="space-y-6 animate-fade-in">
              <h3 className="text-lg font-bold text-slate-900">État des Services</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <Database className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 font-medium">Base de Données</p>
                    <p className="text-lg font-bold text-slate-900">Opérationnelle</p>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <Activity className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 font-medium">API Insforge</p>
                    <p className="text-lg font-bold text-slate-900">Opérationnelle</p>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 font-medium">Sessions Actives</p>
                    <p className="text-lg font-bold text-slate-900">24 Tenants</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
