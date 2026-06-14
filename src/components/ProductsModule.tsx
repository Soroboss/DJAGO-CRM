import React, { useState, useEffect } from 'react';
import { insforge } from '../lib/insforge';
import { useAuthStore } from '../store/authStore';
import { useToastStore } from '../store/toastStore';
import { Package, Plus, Edit, Trash2, Tag, Archive } from 'lucide-react';

export const ProductsModule: React.FC = () => {
  const { user } = useAuthStore();
  const { addToast } = useToastStore();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    stock_quantity: 0,
    sku: '',
    category: ''
  });

  useEffect(() => {
    fetchProducts();
  }, [user]);

  const fetchProducts = async () => {
    if (!user?.organization_id) return;
    setLoading(true);
    try {
      const { data, error } = await insforge.database
        .from('products')
        .select('*')
        .eq('organization_id', user.organization_id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (err: any) {
      console.error(err);
      addToast("Erreur lors du chargement des produits", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.organization_id) return;
    
    try {
      if (editingId) {
        const { error } = await insforge.database
          .from('products')
          .update(formData)
          .eq('id', editingId)
          .eq('organization_id', user.organization_id);
        if (error) throw error;
        addToast("Produit mis à jour avec succès", "success");
      } else {
        const { error } = await insforge.database
          .from('products')
          .insert({
            organization_id: user.organization_id,
            ...formData
          });
        if (error) throw error;
        addToast("Produit ajouté avec succès", "success");
      }
      setShowModal(false);
      fetchProducts();
    } catch (err: any) {
      console.error(err);
      addToast("Erreur lors de l'enregistrement", "error");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Voulez-vous vraiment supprimer ce produit ?")) return;
    try {
      const { error } = await insforge.database
        .from('products')
        .delete()
        .eq('id', id);
      if (error) throw error;
      addToast("Produit supprimé", "success");
      fetchProducts();
    } catch (err: any) {
      console.error(err);
      addToast("Erreur lors de la suppression", "error");
    }
  };

  const openModal = (prod: any = null) => {
    if (prod) {
      setEditingId(prod.id);
      setFormData({
        name: prod.name,
        description: prod.description || '',
        price: prod.price,
        stock_quantity: prod.stock_quantity,
        sku: prod.sku || '',
        category: prod.category || ''
      });
    } else {
      setEditingId(null);
      setFormData({
        name: '',
        description: '',
        price: 0,
        stock_quantity: 0,
        sku: '',
        category: ''
      });
    }
    setShowModal(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Package className="w-6 h-6 text-orange-500" />
            Catalogue & Stocks
          </h2>
          <p className="text-slate-500 text-sm">Gérez vos produits, services et niveaux de stock.</p>
        </div>
        <button
          onClick={() => openModal()}
          className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors cursor-pointer shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Ajouter un Produit
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase font-semibold text-left">
              <tr>
                <th className="p-4">Produit</th>
                <th className="p-4">SKU / Réf</th>
                <th className="p-4">Catégorie</th>
                <th className="p-4 text-right">Prix</th>
                <th className="p-4 text-right">Stock</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">Chargement...</td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500 flex flex-col items-center gap-2">
                    <Archive className="w-8 h-8 text-slate-300" />
                    Aucun produit dans le catalogue.
                  </td>
                </tr>
              ) : (
                products.map(prod => (
                  <tr key={prod.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4">
                      <p className="font-bold text-slate-900">{prod.name}</p>
                      <p className="text-xs text-slate-500 truncate max-w-xs">{prod.description}</p>
                    </td>
                    <td className="p-4 text-sm font-mono text-slate-600">{prod.sku || '-'}</td>
                    <td className="p-4">
                      <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded-md text-xs font-medium flex items-center gap-1 w-fit">
                        <Tag className="w-3 h-3" />
                        {prod.category || 'Non catégorisé'}
                      </span>
                    </td>
                    <td className="p-4 text-right font-bold text-slate-900">
                      {prod.price.toLocaleString()} FCFA
                    </td>
                    <td className="p-4 text-right">
                      <span className={`px-2 py-1 rounded-md text-xs font-bold ${prod.stock_quantity > 10 ? 'bg-emerald-100 text-emerald-700' : prod.stock_quantity > 0 ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'}`}>
                        {prod.stock_quantity}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button onClick={() => openModal(prod)} className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(prod.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-fade-in">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-lg text-slate-900">
                {editingId ? 'Modifier le Produit' : 'Nouveau Produit'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 text-xl font-bold cursor-pointer">
                ×
              </button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Nom du Produit/Service *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Prix (FCFA) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.price}
                    onChange={e => setFormData({ ...formData, price: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Quantité (Stock)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.stock_quantity}
                    onChange={e => setFormData({ ...formData, stock_quantity: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 transition-all"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">SKU / Réf</label>
                  <input
                    type="text"
                    value={formData.sku}
                    onChange={e => setFormData({ ...formData, sku: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Catégorie</label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 transition-all min-h-[80px]"
                />
              </div>
              
              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-3 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 rounded-xl font-bold text-white bg-emerald-500 hover:bg-emerald-600 transition-colors shadow-md cursor-pointer"
                >
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
