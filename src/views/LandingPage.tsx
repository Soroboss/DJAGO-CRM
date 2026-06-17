import React, { useState, useEffect } from 'react';
import { ArrowRight, Wifi, MapPin, MessageSquare, ShieldCheck, TrendingUp, Users, Database, Zap, CheckCircle2 } from 'lucide-react';
import { insforge } from '../lib/insforge';

interface LandingPageProps {
  onNavigateToLogin: () => void;
  onNavigateToSignup: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigateToLogin, onNavigateToSignup }) => {
  const [plans, setPlans] = useState<any[]>([]);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const { data } = await insforge.database
          .from('saas_plans')
          .select('*')
          .eq('is_active', true)
          .order('price_fcfa', { ascending: true });
        if (data) setPlans(data);
      } catch (e) {
        console.error(e);
      }
    };
    fetchPlans();
  }, []);

  const scrollToPricing = () => {
    document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col relative overflow-hidden">
      {/* Background Gradients / Glow blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[800px] h-[800px] rounded-full bg-brand-orange/15 blur-[150px] pointer-events-none animate-pulse-slow" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[900px] h-[900px] rounded-full bg-brand-emerald/10 blur-[180px] pointer-events-none animate-pulse-slow" style={{ animationDelay: '2s' }} />
      <div className="absolute top-[40%] left-[50%] -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-[#ff7a00]/5 blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="border-b border-slate-200/50 py-5 px-6 relative z-10 backdrop-blur-md bg-slate-50/60">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-orange to-amber-500 flex items-center justify-center font-extrabold text-white text-xl shadow-lg shadow-brand-orange/20 transition-transform hover:scale-105 duration-300">
              <Zap className="w-5 h-5" />
            </div>
            <span className="text-xl font-extrabold tracking-tight text-slate-900">
              Djago<span className="text-brand-orange">CRM</span>
            </span>
          </div>
          <button
            onClick={onNavigateToLogin}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-brand-orange to-amber-500 hover:from-amber-500 hover:to-brand-orange text-white text-sm font-bold transition-all shadow-[0_0_15px_rgba(249,115,22,0.3)] hover:shadow-[0_0_25px_rgba(249,115,22,0.5)]"
          >
            Se Connecter
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex-1 max-w-7xl mx-auto px-6 py-16 lg:py-24 relative z-10 text-center flex flex-col items-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-emerald/10 text-brand-emerald text-sm font-semibold w-fit border border-brand-emerald/20 tracking-wider mb-6 shadow-sm">
          ⚡ CONNECTÉ À INFRASTRUCTURE SÉCURISÉE - VERSION 2.0
        </div>
        
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight text-slate-900 leading-[1.1] !my-0 drop-shadow-2xl max-w-4xl mx-auto">
          Le CRM conçu pour la <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-orange to-amber-400">
            croissance Africaine.
          </span>
        </h1>

        <p className="text-lg sm:text-xl text-slate-500 max-w-2xl leading-relaxed mt-6 mx-auto">
          Passez à la vitesse supérieure. Synchronisation intelligente hors-ligne, suivi terrain GPS, et sécurité bancaire propulsée par Système. Ne perdez plus aucune donnée.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mt-8 justify-center">
          <button
            onClick={scrollToPricing}
            className="px-8 py-4 rounded-2xl bg-gradient-to-r from-brand-orange to-amber-500 hover:from-amber-500 hover:to-brand-orange text-white font-bold text-lg flex items-center justify-center gap-3 transition-all duration-300 shadow-[0_0_20px_rgba(249,115,22,0.3)] hover:shadow-[0_0_30px_rgba(249,115,22,0.5)] group hover:-translate-y-1"
          >
            Démarrer maintenant
            <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Hero Image */}
        <div className="mt-16 w-full relative">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-50 z-10 pointer-events-none h-full" style={{ bottom: 0, top: '50%' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-brand-orange/20 blur-[120px] rounded-full pointer-events-none" />
          <img 
            src="/images/hero_crm_mockup_1781714807120.png" 
            alt="Dashboard DjagoCRM" 
            className="relative z-0 w-full max-w-5xl mx-auto rounded-[2rem] shadow-2xl border-4 border-white/50 object-cover transform hover:scale-[1.01] transition-transform duration-500"
          />
        </div>
      </section>

      {/* Feature Cards Showcase */}
      <section className="max-w-7xl mx-auto px-6 py-10 relative z-20 lg:-mt-32">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-6 rounded-3xl bg-white/80 border border-slate-200 hover:bg-white transition-colors text-left backdrop-blur-xl hover:border-brand-orange/30 shadow-lg">
            <div className="w-12 h-12 rounded-xl bg-brand-orange/15 flex items-center justify-center text-brand-orange mb-5 border border-brand-orange/20 shadow-[0_0_15px_rgba(249,115,22,0.15)]">
              <Database className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Base de Données Système</h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              Vos données clients sont sauvegardées en ligne instantanément et en toute sécurité.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white/80 border border-slate-200 hover:bg-white transition-colors text-left backdrop-blur-xl hover:border-brand-emerald/30 shadow-lg">
            <div className="w-12 h-12 rounded-xl bg-brand-emerald/15 flex items-center justify-center text-brand-emerald mb-5 border border-brand-emerald/20 shadow-[0_0_15px_rgba(16,185,129,0.15)]">
              <Wifi className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Offline-First Intelligent</h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              Continuez d'enregistrer des données même sans internet. La synchronisation se fera automatiquement.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white/80 border border-slate-200 hover:bg-white transition-colors text-left backdrop-blur-xl hover:border-amber-400/30 shadow-lg">
            <div className="w-12 h-12 rounded-xl bg-amber-400/15 flex items-center justify-center text-amber-400 mb-5 border border-amber-400/20 shadow-[0_0_15px_rgba(251,191,36,0.15)]">
              <MapPin className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">GPS et Terrain</h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              Capturez la position exacte de vos commerciaux lors des visites clients pour plus de transparence.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white/80 border border-slate-200 hover:bg-white transition-colors text-left backdrop-blur-xl hover:border-blue-500/30 shadow-lg">
            <div className="w-12 h-12 rounded-xl bg-blue-500/15 flex items-center justify-center text-blue-500 mb-5 border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.15)]">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Sécurité et Rôles</h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              Chiffrement de pointe et gestion pyramidale des droits (Super Admin, Manager, Commercial).
            </p>
          </div>
        </div>
      </section>

      {/* Expanded Features Section */}
      <section className="bg-white py-24 relative z-10 border-t border-slate-200 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-24">
            <h2 className="text-4xl font-black text-slate-900 mb-4">Pourquoi choisir DjagoCRM ?</h2>
            <p className="text-xl text-slate-500 max-w-2xl mx-auto">Une suite d'outils puissants conçus pour maximiser vos ventes, suivre vos équipes terrain et sécuriser vos données.</p>
          </div>

          {/* Feature 1: Mobile Sync */}
          <div className="grid lg:grid-cols-2 gap-16 items-center mb-24">
            <div className="order-2 lg:order-1">
              <img 
                src="/images/feature_mobile_sync_1781714818789.png" 
                alt="Mobile Sync App" 
                className="w-full rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-slate-100"
              />
            </div>
            <div className="order-1 lg:order-2">
              <div className="w-14 h-14 rounded-2xl bg-brand-emerald/10 flex items-center justify-center mb-6">
                <Users className="w-7 h-7 text-brand-emerald" />
              </div>
              <h3 className="text-3xl font-black text-slate-900 mb-4">Gestion d'équipe terrain & Mode Hors-ligne</h3>
              <p className="text-lg text-slate-500 leading-relaxed mb-6">
                Suivez les performances de vos commerciaux en temps réel. Le système de géolocalisation intégré assure la transparence totale des visites clients. Même sans connexion internet, continuez à enregistrer vos ventes ; notre application synchronisera tout automatiquement dès le retour réseau.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-slate-700"><CheckCircle2 className="w-5 h-5 text-brand-emerald" /> Synchronisation automatique</li>
                <li className="flex items-center gap-3 text-slate-700"><CheckCircle2 className="w-5 h-5 text-brand-emerald" /> Suivi GPS des visites</li>
                <li className="flex items-center gap-3 text-slate-700"><CheckCircle2 className="w-5 h-5 text-brand-emerald" /> Productivité ininterrompue</li>
              </ul>
            </div>
          </div>

          {/* Feature 2: Analytics */}
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-6">
                <TrendingUp className="w-7 h-7 text-blue-500" />
              </div>
              <h3 className="text-3xl font-black text-slate-900 mb-4">Tableaux de bord & Intelligence Visuelle</h3>
              <p className="text-lg text-slate-500 leading-relaxed mb-6">
                Visualisez votre chiffre d'affaires et la progression de vos objectifs à travers des graphiques clairs et prédictifs. Identifiez instantanément les opportunités de croissance et optimisez votre stratégie de vente.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-slate-700"><CheckCircle2 className="w-5 h-5 text-blue-500" /> Métriques de performance en temps réel</li>
                <li className="flex items-center gap-3 text-slate-700"><CheckCircle2 className="w-5 h-5 text-blue-500" /> Analyse des conversions</li>
                <li className="flex items-center gap-3 text-slate-700"><CheckCircle2 className="w-5 h-5 text-blue-500" /> Tableaux de bord personnalisables</li>
              </ul>
            </div>
            <div>
              <img 
                src="/images/feature_analytics_dashboard_1781714830207.png" 
                alt="Analytics Dashboard" 
                className="w-full rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-slate-100"
              />
            </div>
          </div>

        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="bg-slate-50 py-24 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-slate-900 mb-4">Un tarif simple et transparent</h2>
            <p className="text-xl text-slate-500 max-w-2xl mx-auto">Choisissez l'offre qui correspond à la taille de votre entreprise.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan) => (
              <div 
                key={plan.id} 
                className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm hover:border-brand-orange/50 hover:shadow-xl transition-all flex flex-col"
              >
                <h3 className="text-2xl font-bold text-slate-900 mb-2">{plan.name}</h3>
                <p className="text-slate-500 text-sm mb-6 h-10">{plan.description}</p>
                
                <div className="mb-8">
                  <span className="text-4xl font-black text-slate-900">{plan.price_fcfa.toLocaleString()}</span>
                  <span className="text-slate-500 font-medium"> FCFA / mois</span>
                </div>
                
                <ul className="space-y-4 mb-8 flex-1">
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-brand-emerald shrink-0" />
                    <span className="text-slate-700 font-medium">
                      {plan.features?.max_users >= 9999 ? 'Utilisateurs illimités' : `Jusqu'à ${plan.features?.max_users} utilisateurs`}
                    </span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-brand-emerald shrink-0" />
                    <span className="text-slate-700 font-medium">
                      {plan.features?.max_clients >= 99999 ? 'Clients illimités' : `Jusqu'à ${plan.features?.max_clients} clients`}
                    </span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-brand-emerald shrink-0" />
                    <span className="text-slate-700 font-medium">Support Client</span>
                  </li>
                </ul>
                
                <button 
                  onClick={onNavigateToSignup}
                  className="w-full py-4 rounded-xl font-bold transition-colors bg-gradient-to-r from-slate-900 to-slate-800 hover:from-brand-orange hover:to-amber-500 text-white shadow-md flex items-center justify-center gap-2 group"
                >
                  S'inscrire maintenant
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            ))}
            {plans.length === 0 && (
              <div className="col-span-3 text-center py-10 text-slate-500">
                Chargement des offres...
              </div>
            )}
          </div>
        </div>
      </section>
      
      {/* Final CTA */}
      <section className="bg-slate-900 py-24 relative z-10 overflow-hidden">
        <div className="absolute inset-0 bg-brand-orange/10 blur-[100px] rounded-full w-[800px] h-[800px] -top-1/2 left-1/2 -translate-x-1/2" />
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <h2 className="text-5xl font-black text-white mb-6">Prêt à transformer votre entreprise ?</h2>
          <p className="text-xl text-slate-400 mb-10">Rejoignez les entreprises qui ont choisi l'excellence pour leur gestion commerciale.</p>
          <button
              onClick={scrollToPricing}
              className="px-10 py-5 rounded-2xl bg-gradient-to-r from-brand-orange to-amber-500 hover:from-amber-500 hover:to-brand-orange text-white font-bold text-xl flex items-center justify-center gap-3 mx-auto transition-all duration-300 shadow-[0_0_30px_rgba(249,115,22,0.4)] hover:shadow-[0_0_40px_rgba(249,115,22,0.6)] hover:-translate-y-1"
            >
              Créer votre espace maintenant
              <ArrowRight className="w-6 h-6" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200/50 py-8 px-6 text-center text-sm text-slate-400 relative z-10 backdrop-blur-md bg-slate-50/50">
        <p>© 2026 DjagoCRM. L'excellence CRM repensée pour l'Afrique.</p>
      </footer>
    </div>
  );
};
