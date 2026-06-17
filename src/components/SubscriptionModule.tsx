import React, { useState, useEffect } from 'react';
import { insforge } from '../lib/insforge';
import { useAuthStore } from '../store/authStore';
import { useToastStore } from '../store/toastStore';
import { ShieldCheck, CheckCircle2, CreditCard } from 'lucide-react';
import { PaymentModal } from './PaymentModal';

export const SubscriptionModule: React.FC = () => {
  const { user, organization } = useAuthStore();
  const { addToast } = useToastStore();
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const { data, error } = await insforge.database
        .from('saas_plans')
        .select('*')
        .eq('is_active', true)
        .order('price_fcfa', { ascending: true });
        
      if (error) throw error;
      setPlans(data || []);
    } catch (err) {
      console.error(err);
      addToast("Erreur lors du chargement des offres", "error");
    } finally {
      setLoading(false);
    }
  };

  const currentPlan = plans.find(p => p.id === organization?.plan_id) || plans[0];

  const handlePaymentSuccess = async () => {
    if (!selectedPlan || !organization) return;
    try {
      const { error } = await insforge.database
        .from('organizations')
        .update({ 
          plan_id: selectedPlan.id, 
          subscription_status: 'active' 
        })
        .eq('id', organization.id);
        
      if (error) throw error;
      addToast(`Abonnement mis à niveau vers ${selectedPlan.name}`, "success");
      // Mettre à jour l'état local via un rechargement partiel ou store
      window.location.reload(); 
    } catch (err) {
      console.error(err);
      addToast("Erreur lors de la mise à jour de l'abonnement", "error");
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fade-in relative z-10">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">Votre Abonnement DJAGO CRM</h2>
        <p className="text-slate-500 font-medium text-lg">
          Gérez votre forfait et accédez à plus de fonctionnalités.
        </p>
      </div>

      {/* Current Plan Status */}
      <div className="rounded-[2rem] glass-card glass-panel-hover p-8 border border-white/40 shadow-sm flex items-center justify-between mb-8 transition-all">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-emerald-500 to-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 transform -rotate-3">
            <ShieldCheck className="w-10 h-10 text-white" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Forfait Actuel</p>
            <h3 className="text-3xl font-black text-slate-900">{currentPlan?.name || 'Inconnu'}</h3>
            <p className="text-slate-500 text-sm mt-2 font-medium">
              Statut : <span className="font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-md uppercase tracking-wide border border-emerald-500/20">{organization?.subscription_status || 'Trial'}</span>
            </p>
          </div>
        </div>
        <div className="text-right hidden md:block">
          <p className="text-sm text-slate-500 font-medium mb-1">Membres autorisés : <span className="font-bold text-slate-900 bg-white/60 px-2 py-0.5 rounded shadow-sm">{currentPlan?.features?.max_users || 'N/A'}</span></p>
          <p className="text-sm text-slate-500 font-medium">Clients autorisés : <span className="font-bold text-slate-900 bg-white/60 px-2 py-0.5 rounded shadow-sm">{currentPlan?.features?.max_clients || 'N/A'}</span></p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-slate-500 font-bold animate-pulse">Chargement des offres premium...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan) => {
            const isCurrent = plan.id === currentPlan?.id;
            
            return (
              <div 
                key={plan.id} 
                className={`relative rounded-[2rem] p-8 border-2 transition-all duration-300 flex flex-col backdrop-blur-md bg-white/60 ${
                  isCurrent 
                    ? 'border-emerald-500 shadow-xl shadow-emerald-500/10 scale-105 z-10' 
                    : 'border-white/40 shadow-sm hover:shadow-xl hover:border-orange-500/50 hover:-translate-y-2'
                }`}
              >
                {isCurrent && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-emerald-500 to-emerald-400 text-white px-5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-md">
                    Plan Actuel
                  </div>
                )}
                
                <h3 className="text-2xl font-black text-slate-900 mb-2 text-center">{plan.name}</h3>
                <p className="text-slate-500 font-medium text-sm text-center mb-6 h-10">{plan.description}</p>
                
                <div className="text-center mb-8 p-6 bg-slate-100/50 rounded-2xl border border-white/50 shadow-inner">
                  <span className="text-4xl font-black text-slate-900 tracking-tight">{plan.price_fcfa.toLocaleString()}</span>
                  <span className="text-slate-500 font-bold text-sm block mt-1">FCFA / mois</span>
                </div>
                
                <ul className="space-y-4 mb-8 flex-1">
                  <li className="flex items-center gap-3">
                    <div className="p-1 rounded-full bg-emerald-500/10 shrink-0">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    </div>
                    <span className="text-slate-700 font-bold text-sm">
                      {plan.features?.max_users >= 9999 ? 'Utilisateurs illimités' : `Jusqu'à ${plan.features?.max_users} utilisateurs`}
                    </span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="p-1 rounded-full bg-emerald-500/10 shrink-0">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    </div>
                    <span className="text-slate-700 font-bold text-sm">
                      {plan.features?.max_clients >= 99999 ? 'Clients illimités' : `Jusqu'à ${plan.features?.max_clients} clients`}
                    </span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="p-1 rounded-full bg-emerald-500/10 shrink-0">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    </div>
                    <span className="text-slate-700 font-bold text-sm">Support Client VIP</span>
                  </li>
                  {plan.price_fcfa > 0 && (
                    <li className="flex items-center gap-3">
                      <div className="p-1 rounded-full bg-emerald-500/10 shrink-0">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      </div>
                      <span className="text-slate-700 font-bold text-sm">Accès API complet</span>
                    </li>
                  )}
                </ul>
                
                <button 
                  className={`w-full py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
                    isCurrent 
                      ? 'bg-slate-200/50 text-slate-400 cursor-not-allowed border border-slate-200' 
                      : 'bg-gradient-to-r from-orange-500 to-orange-400 hover:to-orange-500 text-white shadow-md hover:shadow-xl cursor-pointer'
                  }`}
                  disabled={isCurrent}
                  onClick={() => !isCurrent && setSelectedPlan(plan)}
                >
                  <CreditCard className="w-5 h-5" />
                  {isCurrent ? 'Plan Actuel' : 'Mettre à niveau'}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {selectedPlan && (
        <PaymentModal 
          isOpen={true}
          plan={selectedPlan}
          onClose={() => setSelectedPlan(null)}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
};
