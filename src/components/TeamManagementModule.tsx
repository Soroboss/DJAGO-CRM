import React, { useState } from 'react';
import { useAuthStore, type UserRole, type UserProfile } from '../store/authStore';
import { useToastStore } from '../store/toastStore';
import { Edit2, Trash2, Plus, X, Users } from 'lucide-react';

export const TeamManagementModule: React.FC = () => {
  const { team, createTeammate, updateTeammate, deleteTeammate } = useAuthStore();
  const { addToast } = useToastStore();
  
  const [newCollabName, setNewCollabName] = useState('');
  const [newCollabEmail, setNewCollabEmail] = useState('');
  const [newCollabRole, setNewCollabRole] = useState<UserRole>('commercial');
  const [newCollabZone, setNewCollabZone] = useState('Ouest');
  const [newCollabManager, setNewCollabManager] = useState('');
  
  const [editingTeammate, setEditingTeammate] = useState<UserProfile | null>(null);

  const handleCreateCollab = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCollabName || !newCollabEmail) return;
    
    await createTeammate(
      newCollabName,
      newCollabEmail,
      newCollabRole,
      newCollabZone,
      newCollabManager || undefined
    );

    setNewCollabName('');
    setNewCollabEmail('');
    setNewCollabRole('commercial');
    setNewCollabManager('');
    addToast("Collaborateur ajouté avec succès", "success");
  };

  const getCommercialName = (id?: string) => {
    if (!id) return 'Non assigné';
    const found = team.find(t => t.id === id);
    return found ? found.name : 'Inconnu';
  };

  const handleEditTeammate = (t: UserProfile) => {
    setEditingTeammate(t);
  };

  const submitEditTeammate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTeammate) return;
    
    const success = await updateTeammate(editingTeammate.id, {
      role: editingTeammate.role,
      zone: editingTeammate.zone,
      manager_id: editingTeammate.manager_id
    });

    if (success) {
      addToast("Collaborateur mis à jour", "success");
      setEditingTeammate(null);
    }
  };

  const handleDeleteTeammate = async (id: string, name: string) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer ${name} ?`)) {
      await deleteTeammate(id);
      addToast("Collaborateur supprimé", "success");
    }
  };

  return (
    <div className="grid lg:grid-cols-12 gap-8 text-left animate-fade-in relative z-10">
      <div className="lg:col-span-5 p-6 rounded-[2rem] glass-card glass-panel-hover flex flex-col gap-6">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Users className="w-5 h-5 text-orange-500" />
          Nouveau Collaborateur
        </h3>
        <form onSubmit={handleCreateCollab} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Nom Complet</label>
            <input
              type="text"
              required
              placeholder="Ex: Kouamé Koffi"
              value={newCollabName}
              onChange={(e) => setNewCollabName(e.target.value)}
              className="px-4 py-3 rounded-xl bg-white/50 backdrop-blur-sm border border-white/40 focus:outline-none focus:border-brand-orange focus:ring-2 focus:ring-orange-500/20 text-sm text-slate-800 shadow-sm"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Adresse e-mail</label>
            <input
              type="email"
              required
              placeholder="Ex: kouame@djagocrm.ci"
              value={newCollabEmail}
              onChange={(e) => setNewCollabEmail(e.target.value)}
              className="px-4 py-3 rounded-xl bg-white/50 backdrop-blur-sm border border-white/40 focus:outline-none focus:border-brand-orange focus:ring-2 focus:ring-orange-500/20 text-sm text-slate-800 shadow-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Type de collaborateur</label>
              <select
                value={newCollabRole}
                onChange={(e) => setNewCollabRole(e.target.value as UserRole)}
                className="px-4 py-3 rounded-xl bg-white/50 backdrop-blur-sm border border-white/40 focus:outline-none focus:border-brand-orange focus:ring-2 focus:ring-orange-500/20 text-sm text-slate-700 shadow-sm"
              >
                <option value="commercial">Commercial</option>
                <option value="manager">Manager</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Zone d'action</label>
              <select
                value={newCollabZone}
                onChange={(e) => setNewCollabZone(e.target.value)}
                className="px-4 py-3 rounded-xl bg-white/50 backdrop-blur-sm border border-white/40 focus:outline-none focus:border-brand-orange focus:ring-2 focus:ring-orange-500/20 text-sm text-slate-700 shadow-sm"
              >
                <option value="Ouest">Ouest</option>
                <option value="Sud">Sud</option>
                <option value="Centre">Centre</option>
                <option value="Nord">Nord</option>
              </select>
            </div>
          </div>

          {newCollabRole === 'commercial' && (
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Manager Responsable</label>
              <select
                value={newCollabManager}
                onChange={(e) => setNewCollabManager(e.target.value)}
                className="px-4 py-3 rounded-xl bg-white/50 backdrop-blur-sm border border-white/40 focus:outline-none focus:border-brand-orange focus:ring-2 focus:ring-orange-500/20 text-sm text-slate-700 shadow-sm"
              >
                <option value="">Aucun Manager (Rattachement DG)</option>
                {team.filter(t => t.role === 'manager').map(m => (
                  <option key={m.id} value={m.id}>{m.name} ({m.zone})</option>
                ))}
              </select>
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Mot de Passe Provisoire</label>
            <input
              type="text"
              disabled
              value="123456 (Généré)"
              className="px-4 py-3 rounded-xl bg-slate-100/50 backdrop-blur-sm border border-slate-200/50 text-slate-400 text-sm cursor-not-allowed shadow-inner"
            />
          </div>

          <button
            type="submit"
            className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-orange-400 hover:to-orange-500 text-white font-bold text-sm shadow-md hover:shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Enregistrer Collaborateur</span>
          </button>
        </form>
      </div>

      <div className="lg:col-span-7 p-6 rounded-[2rem] glass-card glass-panel-hover flex flex-col gap-4">
        <h3 className="text-lg font-bold text-slate-900">Équipe Commerciale</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200/50 text-slate-500 text-xs tracking-wider">
                <th className="py-3 px-4 text-left uppercase font-bold">Collaborateur</th>
                <th className="py-3 px-4 text-left uppercase font-bold">Type</th>
                <th className="py-3 px-4 text-left uppercase font-bold">Zone</th>
                <th className="py-3 px-4 text-left uppercase font-bold">Responsable</th>
                <th className="py-3 px-4 text-right uppercase font-bold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {team.map((t) => (
                <tr key={t.id} className="border-b border-slate-200/30 hover:bg-white/40 transition-colors">
                  <td className="py-4 px-4 font-bold text-slate-900">
                    <div>
                      {t.name}
                      <p className="text-[10px] text-slate-500 font-medium">{t.email}</p>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase shadow-sm ${
                      t.role === 'dg' ? 'bg-orange-500/15 text-orange-600 border border-orange-500/20' :
                      t.role === 'manager' ? 'bg-emerald-500/15 text-emerald-600 border border-emerald-500/20' : 'bg-white/60 text-slate-500 border border-slate-200/50'
                    }`}>
                      {t.role}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-slate-600 font-medium">{t.zone}</td>
                  <td className="py-4 px-4 text-slate-500 text-xs font-semibold">{getCommercialName(t.manager_id)}</td>
                  <td className="py-4 px-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => handleEditTeammate(t)} className="p-2 rounded-lg bg-white/60 border border-slate-200/50 hover:border-blue-500/30 hover:bg-blue-50 text-slate-500 hover:text-blue-500 transition-all shadow-sm">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDeleteTeammate(t.id, t.name)} className="p-2 rounded-lg bg-white/60 border border-slate-200/50 hover:border-red-500/30 hover:bg-red-50 text-slate-500 hover:text-red-500 transition-all shadow-sm">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Teammate Modal */}
      {editingTeammate && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-fade-in">
          <div className="bg-white/80 backdrop-blur-xl border border-white/50 rounded-[2rem] w-full max-w-md shadow-2xl overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-slate-200/50">
              <h3 className="font-bold tracking-tight text-slate-900 text-lg">Modifier le collaborateur</h3>
              <button onClick={() => setEditingTeammate(null)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100/50 rounded-xl transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={submitEditTeammate} className="p-6 flex flex-col gap-4">
              <p className="text-sm font-semibold text-slate-900 mb-2">{editingTeammate.name} <span className="text-slate-500">({editingTeammate.email})</span></p>
              
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Nouveau Type</label>
                <select
                  value={editingTeammate.role}
                  onChange={(e) => setEditingTeammate({ ...editingTeammate, role: e.target.value as any })}
                  className="w-full px-4 py-3 rounded-xl bg-white/60 backdrop-blur-sm border border-white/40 text-slate-900 focus:outline-none focus:border-brand-orange focus:ring-2 focus:ring-orange-500/20 transition-all text-sm shadow-sm"
                >
                  <option value="commercial">Commercial</option>
                  <option value="manager">Manager</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Nouvelle Zone</label>
                <input
                  type="text"
                  value={editingTeammate.zone || ''}
                  onChange={(e) => setEditingTeammate({ ...editingTeammate, zone: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-white/60 backdrop-blur-sm border border-white/40 text-slate-900 focus:outline-none focus:border-brand-orange focus:ring-2 focus:ring-orange-500/20 transition-all text-sm shadow-sm"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Nouveau Manager (Optionnel)</label>
                <select
                  value={editingTeammate.manager_id || ''}
                  onChange={(e) => setEditingTeammate({ ...editingTeammate, manager_id: e.target.value || undefined })}
                  className="w-full px-4 py-3 rounded-xl bg-white/60 backdrop-blur-sm border border-white/40 text-slate-900 focus:outline-none focus:border-brand-orange focus:ring-2 focus:ring-orange-500/20 transition-all text-sm shadow-sm"
                >
                  <option value="">-- Aucun --</option>
                  {team.filter(t => t.role === 'manager' && t.id !== editingTeammate.id).map(m => (
                    <option key={m.id} value={m.id}>{m.name} ({m.zone})</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setEditingTeammate(null)} className="px-5 py-2.5 rounded-xl font-bold text-sm text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors shadow-sm bg-white">
                  Annuler
                </button>
                <button type="submit" className="px-5 py-2.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-orange-500 to-orange-400 hover:to-orange-500 transition-colors shadow-md hover:shadow-lg">
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
