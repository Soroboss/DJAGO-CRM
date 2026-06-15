import React, { useState, useEffect } from 'react';
import { insforge } from '../lib/insforge';
import { useAuthStore } from '../store/authStore';
import { useToastStore } from '../store/toastStore';
import { ShieldCheck, CheckCircle2, CreditCard } from 'lucide-react';

export const SubscriptionModule: React.FC = () => {
  const { user, organization } = useAuthStore();
  const { addToast } = useToastStore();
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-slate-900 mb-4">Votre Abonnement DJAGO CRM</h2>
        <p className="text-slate-500 text-lg">
          Gérez votre forfait et accédez à plus de fonctionnalités.
        </p>
      </div>

      {/* Current Plan Status */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
            <ShieldCheck className="w-8 h-8 text-emerald-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Forfait Actuel</p>
            <h3 className="text-2xl font-bold text-slate-900">{currentPlan?.name || 'Inconnu'}</h3>
            <p className="text-slate-500 text-sm mt-1">
              Statut : <span className="font-bold text-emerald-600 uppercase">{organization?.subscription_status || 'Trial'}</span>
            </p>
          </div>
        </div>
        <div className="text-right hidden md:block">
          <p className="text-sm text-slate-500">Membres autorisés : <span className="font-bold text-slate-900">{currentPlan?.features?.max_users || 'N/A'}</span></p>
          <p className="text-sm text-slate-500">Clients autorisés : <span className="font-bold text-slate-900">{currentPlan?.features?.max_clients || 'N/A'}</span></p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-slate-500 font-medium animate-pulse">Chargement des offres...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan) => {
            const isCurrent = plan.id === currentPlan?.id;
            
            return (
              <div 
                key={plan.id} 
                className={`relative bg-white rounded-3xl p-8 border-2 transition-all duration-300 flex flex-col ${
                  isCurrent 
                    ? 'border-emerald-500 shadow-lg scale-105 z-10' 
                    : 'border-slate-100 shadow-sm hover:border-orange-300'
                }`}
              >
                {isCurrent && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-emerald-500 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                    Plan Actuel
                  </div>
                )}
                
                <h3 className="text-2xl font-bold text-slate-900 mb-2 text-center">{plan.name}</h3>
                <p className="text-slate-500 text-sm text-center mb-6 h-10">{plan.description}</p>
                
                <div className="text-center mb-8">
                  <span className="text-4xl font-extrabold text-slate-900">{plan.price_fcfa.toLocaleString()}</span>
                  <span className="text-slate-500 font-medium"> FCFA / mois</span>
                </div>
                
                <ul className="space-y-4 mb-8 flex-1">
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                    <span className="text-slate-700 font-medium">
                      {plan.features?.max_users >= 9999 ? 'Utilisateurs illimités' : `Jusqu'à ${plan.features?.max_users} utilisateurs`}
                    </span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                    <span className="text-slate-700 font-medium">
                      {plan.features?.max_clients >= 99999 ? 'Clients illimités' : `Jusqu'à ${plan.features?.max_clients} clients`}
                    </span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                    <span className="text-slate-700 font-medium">Support Client</span>
                  </li>
                  {plan.price_fcfa > 0 && (
                    <li className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                      <span className="text-slate-700 font-medium">Accès API complet</span>
                    </li>
                  )}
                </ul>
                
                <button 
                  className={`w-full py-4 rounded-xl font-bold transition-colors cursor-pointer flex items-center justify-center gap-2 ${
                    isCurrent 
                      ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                      : 'bg-orange-500 hover:bg-orange-600 text-white shadow-md'
                  }`}
                  disabled={isCurrent}
                  onClick={() => !isCurrent && alert('Intégration de paiement à venir (Stripe/CinetPay). Veuillez contacter l\'administrateur.')}
                >
                  <CreditCard className="w-5 h-5" />
                  {isCurrent ? 'Plan Actuel' : 'Mettre à niveau'}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
