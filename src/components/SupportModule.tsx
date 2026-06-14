import React, { useState, useEffect } from 'react';
import { insforge } from '../lib/insforge';
import { useAuthStore } from '../store/authStore';
import { useToastStore } from '../store/toastStore';
import { LifeBuoy, Plus, Edit, Trash2, CheckCircle, Clock, AlertCircle } from 'lucide-react';

export const SupportModule: React.FC = () => {
  const { user } = useAuthStore();
  const { addToast } = useToastStore();
  const [tickets, setTickets] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    id: null as string | null,
    client_id: '',
    assigned_to: '',
    subject: '',
    description: '',
    status: 'open', // open, in_progress, resolved, closed
    priority: 'medium' // low, medium, high, urgent
  });

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    if (!user?.organization_id) return;
    setLoading(true);
    try {
      const [ticketsRes, cliRes, teamRes] = await Promise.all([
        insforge.database.from('tickets').select('*, clients(name), team_members(name)').eq('organization_id', user.organization_id).order('created_at', { ascending: false }),
        insforge.database.from('clients').select('id, name').eq('organization_id', user.organization_id),
        insforge.database.from('team_members').select('id, name').eq('organization_id', user.organization_id)
      ]);
      if (ticketsRes.data) setTickets(ticketsRes.data);
      if (cliRes.data) setClients(cliRes.data);
      if (teamRes.data) setTeamMembers(teamRes.data);
    } catch (err) {
      console.error(err);
      addToast("Erreur lors du chargement", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.organization_id) return;
    try {
      const payload = {
        organization_id: user.organization_id,
        client_id: formData.client_id || null,
        assigned_to: formData.assigned_to || null,
        subject: formData.subject,
        description: formData.description,
        status: formData.status,
        priority: formData.priority
      };
      
      if (formData.id) {
        await insforge.database.from('tickets').update(payload).eq('id', formData.id);
        addToast("Ticket mis à jour", "success");
      } else {
        await insforge.database.from('tickets').insert(payload);
        addToast("Ticket créé", "success");
      }
      setShowModal(false);
      fetchData();
    } catch (err) {
      console.error(err);
      addToast("Erreur", "error");
    }
  };

  const handleDelete = async (id: string) => {
    if(!confirm("Supprimer ce ticket ?")) return;
    try {
      await insforge.database.from('tickets').delete().eq('id', id);
      addToast("Ticket supprimé", "success");
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const openModal = (item: any = null) => {
    if (item) {
      setFormData({
        id: item.id,
        client_id: item.client_id || '',
        assigned_to: item.assigned_to || '',
        subject: item.subject || '',
        description: item.description || '',
        status: item.status || 'open',
        priority: item.priority || 'medium'
      });
    } else {
      setFormData({
        id: null,
        client_id: '',
        assigned_to: '',
        subject: '',
        description: '',
        status: 'open',
        priority: 'medium'
      });
    }
    setShowModal(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <LifeBuoy className="w-6 h-6 text-blue-500" />
            Support Client
          </h2>
          <p className="text-slate-500 text-sm">Gérez les demandes et incidents de vos clients.</p>
        </div>
        <button onClick={() => openModal()} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors shadow-sm cursor-pointer">
          <Plus className="w-4 h-4" /> Nouveau Ticket
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase font-semibold">
            <tr>
              <th className="p-4">Sujet</th>
              <th className="p-4">Client</th>
              <th className="p-4">Assigné à</th>
              <th className="p-4">Priorité</th>
              <th className="p-4">Statut</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan={6} className="p-8 text-center text-slate-500">Chargement...</td></tr>
            ) : tickets.length === 0 ? (
              <tr><td colSpan={6} className="p-8 text-center text-slate-500">Aucun ticket.</td></tr>
            ) : (
              tickets.map(t => (
                <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4">
                    <p className="font-bold text-slate-900">{t.subject}</p>
                    <p className="text-xs text-slate-500 truncate max-w-xs">{t.description}</p>
                  </td>
                  <td className="p-4 text-sm text-slate-700">{t.clients?.name || '-'}</td>
                  <td className="p-4 text-sm text-slate-700">{t.team_members?.name || 'Non assigné'}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase
                      ${t.priority === 'urgent' ? 'bg-red-100 text-red-700' :
                        t.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                        'bg-slate-100 text-slate-700'}`}>
                      {t.priority}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase
                      ${t.status === 'resolved' || t.status === 'closed' ? 'bg-emerald-100 text-emerald-700' :
                        t.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                        'bg-slate-100 text-slate-700'}`}>
                      {t.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <button onClick={() => openModal(t)} className="text-blue-600 hover:bg-blue-50 p-2 rounded cursor-pointer"><Edit className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(t.id)} className="text-red-500 hover:bg-red-50 p-2 rounded cursor-pointer"><Trash2 className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-fade-in">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-lg text-slate-900">{formData.id ? 'Modifier' : 'Nouveau'} Ticket</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 text-xl font-bold cursor-pointer">×</button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Sujet *</label>
                <input required type="text" value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Client</label>
                  <select value={formData.client_id} onChange={e => setFormData({...formData, client_id: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500">
                    <option value="">Sélectionner...</option>
                    {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Assigné à</label>
                  <select value={formData.assigned_to} onChange={e => setFormData({...formData, assigned_to: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500">
                    <option value="">Sélectionner...</option>
                    {teamMembers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Statut</label>
                  <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500">
                    <option value="open">Ouvert</option>
                    <option value="in_progress">En cours</option>
                    <option value="resolved">Résolu</option>
                    <option value="closed">Fermé</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Priorité</label>
                  <select value={formData.priority} onChange={e => setFormData({...formData, priority: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500">
                    <option value="low">Basse</option>
                    <option value="medium">Moyenne</option>
                    <option value="high">Haute</option>
                    <option value="urgent">Urgente</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Description</label>
                <textarea rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500"></textarea>
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-3 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 cursor-pointer">Annuler</button>
                <button type="submit" className="flex-1 px-4 py-3 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md cursor-pointer">Enregistrer</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
