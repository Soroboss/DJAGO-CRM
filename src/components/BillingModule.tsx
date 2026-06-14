import React, { useState, useEffect } from 'react';
import { insforge } from '../lib/insforge';
import { useAuthStore } from '../store/authStore';
import { useToastStore } from '../store/toastStore';
import { FileText, Plus, Edit, Trash2, CheckCircle, XCircle, FileInput, Calendar, DollarSign, Download } from 'lucide-react';

export const BillingModule: React.FC = () => {
  const { user } = useAuthStore();
  const { addToast } = useToastStore();
  
  const [activeTab, setActiveTab] = useState<'quotes' | 'invoices'>('quotes');
  const [quotes, setQuotes] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    id: null as string | null,
    client_id: '',
    items: [] as any[], // {product_id, quantity, price, name}
    total_amount: 0,
    valid_until: '',
    due_date: ''
  });

  useEffect(() => {
    fetchData();
  }, [user, activeTab]);

  const fetchData = async () => {
    if (!user?.organizationId) return;
    setLoading(true);
    try {
      // Fetch Clients & Products for the forms
      const [cliRes, prodRes] = await Promise.all([
        insforge.database.from('clients').select('id, name, company').eq('organization_id', user.organizationId),
        insforge.database.from('products').select('id, name, price, stock_quantity').eq('organization_id', user.organizationId)
      ]);
      if (cliRes.data) setClients(cliRes.data);
      if (prodRes.data) setProducts(prodRes.data);

      if (activeTab === 'quotes') {
        const { data, error } = await insforge.database
          .from('quotes')
          .select('*, clients(name, company)')
          .eq('organization_id', user.organizationId)
          .order('created_at', { ascending: false });
        if (error) throw error;
        setQuotes(data || []);
      } else {
        const { data, error } = await insforge.database
          .from('invoices')
          .select('*, clients(name, company)')
          .eq('organization_id', user.organizationId)
          .order('created_at', { ascending: false });
        if (error) throw error;
        setInvoices(data || []);
      }
    } catch (err) {
      console.error(err);
      addToast("Erreur lors du chargement des données", "error");
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = (items: any[]) => {
    return items.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0);
  };

  const handleAddItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { product_id: '', quantity: 1, price: 0, name: '' }]
    }));
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const newItems = [...formData.items];
    newItems[index][field] = value;
    
    // Auto-fill price and name when product selected
    if (field === 'product_id') {
      const prod = products.find(p => p.id === value);
      if (prod) {
        newItems[index].price = prod.price;
        newItems[index].name = prod.name;
      }
    }
    
    setFormData({ ...formData, items: newItems, total_amount: calculateTotal(newItems) });
  };

  const handleRemoveItem = (index: number) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: newItems, total_amount: calculateTotal(newItems) });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.organizationId) return;
    
    try {
      if (activeTab === 'quotes') {
        const payload = {
          organization_id: user.organizationId,
          client_id: formData.client_id,
          quote_number: 'DEV-' + Date.now().toString().slice(-6),
          items: formData.items,
          total_amount: formData.total_amount,
          valid_until: formData.valid_until || null
        };
        
        if (formData.id) {
            await insforge.database.from('quotes').update(payload).eq('id', formData.id);
        } else {
            await insforge.database.from('quotes').insert(payload);
        }
        addToast("Devis enregistré", "success");
      } else {
        const payload = {
          organization_id: user.organizationId,
          client_id: formData.client_id,
          invoice_number: 'FAC-' + Date.now().toString().slice(-6),
          items: formData.items,
          total_amount: formData.total_amount,
          due_date: formData.due_date || null
        };
        
        if (formData.id) {
            await insforge.database.from('invoices').update(payload).eq('id', formData.id);
        } else {
            await insforge.database.from('invoices').insert(payload);
        }
        addToast("Facture enregistrée", "success");
      }
      setShowModal(false);
      fetchData();
    } catch (err) {
      console.error(err);
      addToast("Erreur lors de l'enregistrement", "error");
    }
  };

  const updateStatus = async (id: string, table: string, status: string) => {
    try {
      await insforge.database.from(table).update({ status }).eq('id', id);
      addToast("Statut mis à jour", "success");
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
        items: item.items || [],
        total_amount: item.total_amount || 0,
        valid_until: item.valid_until || '',
        due_date: item.due_date || ''
      });
    } else {
      setFormData({
        id: null,
        client_id: '',
        items: [],
        total_amount: 0,
        valid_until: '',
        due_date: ''
      });
    }
    setShowModal(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-6 h-6 text-orange-500" />
            Facturation & Devis
          </h2>
          <p className="text-slate-500 text-sm">Créez et gérez vos devis et factures.</p>
        </div>
        <button
          onClick={() => openModal()}
          className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors cursor-pointer shadow-sm"
        >
          <Plus className="w-4 h-4" />
          {activeTab === 'quotes' ? 'Créer un Devis' : 'Créer une Facture'}
        </button>
      </div>

      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('quotes')}
          className={`px-6 py-3 font-medium text-sm transition-colors cursor-pointer ${
            activeTab === 'quotes' ? 'text-orange-600 border-b-2 border-orange-600' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          Devis
        </button>
        <button
          onClick={() => setActiveTab('invoices')}
          className={`px-6 py-3 font-medium text-sm transition-colors cursor-pointer ${
            activeTab === 'invoices' ? 'text-orange-600 border-b-2 border-orange-600' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          Factures
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase font-semibold">
            <tr>
              <th className="p-4">Numéro</th>
              <th className="p-4">Client</th>
              <th className="p-4">Statut</th>
              <th className="p-4">Date limite</th>
              <th className="p-4 text-right">Montant Total</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan={6} className="p-8 text-center text-slate-500">Chargement...</td></tr>
            ) : (activeTab === 'quotes' ? quotes : invoices).length === 0 ? (
              <tr><td colSpan={6} className="p-8 text-center text-slate-500">Aucune donnée trouvée.</td></tr>
            ) : (
              (activeTab === 'quotes' ? quotes : invoices).map(item => (
                <tr key={item.id} className="hover:bg-slate-50">
                  <td className="p-4 font-bold text-slate-900">{item.quote_number || item.invoice_number}</td>
                  <td className="p-4 text-sm text-slate-600">
                    {item.clients?.name || 'Client Inconnu'}
                    {item.clients?.company && <span className="block text-xs text-slate-400">{item.clients.company}</span>}
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase
                      ${item.status === 'paid' || item.status === 'accepted' ? 'bg-emerald-100 text-emerald-700' :
                        item.status === 'rejected' || item.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                        'bg-orange-100 text-orange-700'}`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-slate-500">
                    {item.valid_until || item.due_date ? new Date(item.valid_until || item.due_date).toLocaleDateString() : '-'}
                  </td>
                  <td className="p-4 text-right font-bold text-slate-900">{item.total_amount.toLocaleString()} FCFA</td>
                  <td className="p-4 text-right space-x-2">
                    {activeTab === 'quotes' && item.status === 'draft' && (
                      <button onClick={() => updateStatus(item.id, 'quotes', 'accepted')} className="text-emerald-600 hover:bg-emerald-50 p-1 rounded cursor-pointer" title="Accepter"><CheckCircle className="w-4 h-4" /></button>
                    )}
                    {activeTab === 'invoices' && item.status === 'unpaid' && (
                      <button onClick={() => updateStatus(item.id, 'invoices', 'paid')} className="text-emerald-600 hover:bg-emerald-50 p-1 rounded cursor-pointer" title="Marquer comme payé"><DollarSign className="w-4 h-4" /></button>
                    )}
                    <button onClick={() => openModal(item)} className="text-blue-600 hover:bg-blue-50 p-1 rounded cursor-pointer"><Edit className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden animate-fade-in max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-lg text-slate-900">
                {formData.id ? 'Modifier' : 'Nouveau'} {activeTab === 'quotes' ? 'Devis' : 'Facture'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 text-xl font-bold cursor-pointer">×</button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 overflow-y-auto flex-1 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Client *</label>
                  <select required value={formData.client_id} onChange={e => setFormData({...formData, client_id: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500">
                    <option value="">Sélectionner un client...</option>
                    {clients.map(c => <option key={c.id} value={c.id}>{c.name} {c.company ? `(${c.company})` : ''}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">{activeTab === 'quotes' ? 'Valide jusqu\'au' : 'Date d\'échéance'}</label>
                  <input type="date" value={activeTab === 'quotes' ? formData.valid_until : formData.due_date} onChange={e => setFormData(activeTab === 'quotes' ? {...formData, valid_until: e.target.value} : {...formData, due_date: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500" />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase">Articles *</label>
                  <button type="button" onClick={handleAddItem} className="text-xs text-orange-600 font-bold hover:underline cursor-pointer">+ Ajouter une ligne</button>
                </div>
                
                <div className="space-y-2">
                  {formData.items.map((item, index) => (
                    <div key={index} className="flex gap-2 items-center">
                      <select required value={item.product_id} onChange={e => handleItemChange(index, 'product_id', e.target.value)} className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500">
                        <option value="">Produit/Service...</option>
                        {products.map(p => <option key={p.id} value={p.id}>{p.name} ({p.price} FCFA)</option>)}
                      </select>
                      <input type="number" required min="1" placeholder="Qté" value={item.quantity} onChange={e => handleItemChange(index, 'quantity', Number(e.target.value))} className="w-20 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500" />
                      <input type="number" required min="0" placeholder="Prix" value={item.price} onChange={e => handleItemChange(index, 'price', Number(e.target.value))} className="w-28 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500" />
                      <button type="button" onClick={() => handleRemoveItem(index)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg cursor-pointer"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  ))}
                  {formData.items.length === 0 && <p className="text-sm text-slate-500 italic">Aucun article ajouté.</p>}
                </div>
              </div>

              <div className="border-t border-slate-200 pt-4 flex justify-between items-center">
                <span className="font-bold text-slate-700">Total :</span>
                <span className="text-xl font-bold text-orange-600">{formData.total_amount.toLocaleString()} FCFA</span>
              </div>
            </form>
            
            <div className="p-4 border-t border-slate-100 flex gap-3 bg-slate-50">
              <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-3 rounded-xl font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-100 cursor-pointer">Annuler</button>
              <button onClick={handleSave} disabled={formData.items.length === 0} className="flex-1 px-4 py-3 rounded-xl font-bold text-white bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 shadow-md cursor-pointer">Enregistrer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
