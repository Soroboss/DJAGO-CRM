import React, { useState, useEffect } from 'react';
import { insforge } from '../lib/insforge';
import { useAuthStore } from '../store/authStore';
import { useToastStore } from '../store/toastStore';
import { Truck, Plus, Edit, Trash2, MapPin, PackageCheck } from 'lucide-react';

export const LogisticsModule: React.FC = () => {
  const { user } = useAuthStore();
  const { addToast } = useToastStore();
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    id: null as string | null,
    invoice_id: '',
    delivery_person_id: '',
    status: 'pending', // pending, in_transit, delivered, failed
    delivery_address: '',
    tracking_notes: '',
    estimated_delivery_date: ''
  });

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    if (!user?.organization_id) return;
    setLoading(true);
    try {
      const [delRes, invRes, teamRes] = await Promise.all([
        insforge.database.from('deliveries').select('*, invoices(invoice_number), team_members(name)').eq('organization_id', user.organization_id).order('created_at', { ascending: false }),
        insforge.database.from('invoices').select('id, invoice_number').eq('organization_id', user.organization_id),
        insforge.database.from('team_members').select('id, name').eq('organization_id', user.organization_id)
      ]);
      if (delRes.data) setDeliveries(delRes.data);
      if (invRes.data) setInvoices(invRes.data);
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
        invoice_id: formData.invoice_id || null,
        delivery_person_id: formData.delivery_person_id || null,
        status: formData.status,
        delivery_address: formData.delivery_address,
        tracking_notes: formData.tracking_notes,
        estimated_delivery_date: formData.estimated_delivery_date || null
      };
      
      if (formData.id) {
        if (formData.status === 'delivered') {
          (payload as any).delivered_at = new Date().toISOString();
        }
        await insforge.database.from('deliveries').update(payload).eq('id', formData.id);
        addToast("Livraison mise à jour", "success");
      } else {
        await insforge.database.from('deliveries').insert(payload);
        addToast("Livraison planifiée", "success");
      }
      setShowModal(false);
      fetchData();
    } catch (err) {
      console.error(err);
      addToast("Erreur", "error");
    }
  };

  const handleDelete = async (id: string) => {
    if(!confirm("Annuler cette livraison ?")) return;
    try {
      await insforge.database.from('deliveries').delete().eq('id', id);
      addToast("Livraison annulée", "success");
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const openModal = (item: any = null) => {
    if (item) {
      setFormData({
        id: item.id,
        invoice_id: item.invoice_id || '',
        delivery_person_id: item.delivery_person_id || '',
        status: item.status || 'pending',
        delivery_address: item.delivery_address || '',
        tracking_notes: item.tracking_notes || '',
        estimated_delivery_date: item.estimated_delivery_date || ''
      });
    } else {
      setFormData({
        id: null,
        invoice_id: '',
        delivery_person_id: '',
        status: 'pending',
        delivery_address: '',
        tracking_notes: '',
        estimated_delivery_date: ''
      });
    }
    setShowModal(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Truck className="w-6 h-6 text-purple-500" />
            Logistique & Livraisons
          </h2>
          <p className="text-slate-500 text-sm">Gérez les expéditions de vos produits.</p>
        </div>
        <button onClick={() => openModal()} className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors shadow-sm cursor-pointer">
          <Plus className="w-4 h-4" /> Planifier Livraison
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase font-semibold">
            <tr>
              <th className="p-4">Facture Liée</th>
              <th className="p-4">Livreur</th>
              <th className="p-4">Adresse</th>
              <th className="p-4">Date Prévue</th>
              <th className="p-4">Statut</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan={6} className="p-8 text-center text-slate-500">Chargement...</td></tr>
            ) : deliveries.length === 0 ? (
              <tr><td colSpan={6} className="p-8 text-center text-slate-500">Aucune livraison en cours.</td></tr>
            ) : (
              deliveries.map(d => (
                <tr key={d.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 font-bold text-slate-900">
                    <div className="flex items-center gap-2">
                      <PackageCheck className="w-4 h-4 text-slate-400" />
                      {d.invoices?.invoice_number || '-'}
                    </div>
                  </td>
                  <td className="p-4 text-sm text-slate-700">{d.team_members?.name || 'Non assigné'}</td>
                  <td className="p-4 text-sm text-slate-600 max-w-xs truncate flex items-center gap-1">
                    {d.delivery_address && <MapPin className="w-3 h-3 text-slate-400 flex-shrink-0" />}
                    {d.delivery_address || '-'}
                  </td>
                  <td className="p-4 text-sm text-slate-500">
                    {d.estimated_delivery_date ? new Date(d.estimated_delivery_date).toLocaleDateString() : '-'}
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase
                      ${d.status === 'delivered' ? 'bg-emerald-100 text-emerald-700' :
                        d.status === 'failed' ? 'bg-red-100 text-red-700' :
                        d.status === 'in_transit' ? 'bg-blue-100 text-blue-700' :
                        'bg-orange-100 text-orange-700'}`}>
                      {d.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <button onClick={() => openModal(d)} className="text-purple-600 hover:bg-purple-50 p-2 rounded cursor-pointer"><Edit className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(d.id)} className="text-red-500 hover:bg-red-50 p-2 rounded cursor-pointer"><Trash2 className="w-4 h-4" /></button>
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
              <h3 className="font-bold text-lg text-slate-900">{formData.id ? 'Modifier' : 'Planifier'} Livraison</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 text-xl font-bold cursor-pointer">×</button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Liée à la Facture</label>
                  <select value={formData.invoice_id} onChange={e => setFormData({...formData, invoice_id: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-500">
                    <option value="">Sélectionner...</option>
                    {invoices.map(i => <option key={i.id} value={i.id}>{i.invoice_number}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Livreur Assigné</label>
                  <select value={formData.delivery_person_id} onChange={e => setFormData({...formData, delivery_person_id: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-500">
                    <option value="">Sélectionner...</option>
                    {teamMembers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Statut</label>
                  <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-500">
                    <option value="pending">En attente</option>
                    <option value="in_transit">En transit</option>
                    <option value="delivered">Livré</option>
                    <option value="failed">Échoué</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Date Prévue</label>
                  <input type="date" value={formData.estimated_delivery_date} onChange={e => setFormData({...formData, estimated_delivery_date: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-500" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Adresse de livraison</label>
                <textarea rows={2} value={formData.delivery_address} onChange={e => setFormData({...formData, delivery_address: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-500"></textarea>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Notes de suivi</label>
                <textarea rows={2} value={formData.tracking_notes} onChange={e => setFormData({...formData, tracking_notes: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-500"></textarea>
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-3 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 cursor-pointer">Annuler</button>
                <button type="submit" className="flex-1 px-4 py-3 rounded-xl font-bold text-white bg-purple-600 hover:bg-purple-700 shadow-md cursor-pointer">Enregistrer</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
