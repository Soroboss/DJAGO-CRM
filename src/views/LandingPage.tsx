import React from 'react';
import { ArrowRight, Wifi, MapPin, MessageSquare, ShieldCheck, TrendingUp, Users, Database, Zap } from 'lucide-react';

interface LandingPageProps {
  onNavigateToLogin: () => void;
  onQuickLogin: (email: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigateToLogin, onQuickLogin }) => {
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
            className="px-6 py-2.5 rounded-xl bg-white/80 border border-slate-200 text-sm font-semibold hover:bg-brand-orange hover:text-white hover:border-brand-orange transition-all duration-300 shadow-md hover:shadow-brand-orange/20"
          >
            Se Connecter
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex-1 max-w-7xl mx-auto px-6 py-16 lg:py-24 grid lg:grid-cols-12 gap-12 items-center relative z-10">
        <div className="lg:col-span-7 flex flex-col gap-6 text-left">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-emerald/10 text-brand-emerald text-sm font-semibold w-fit border border-brand-emerald/20 tracking-wider">
            ⚡ CONNECTÉ À INSFORGE - VERSION 2.0
          </div>
          
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight text-slate-900 leading-[1.1] !my-0 drop-shadow-2xl">
            Le CRM conçu pour la <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-orange to-amber-400">
              croissance Africaine.
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-400 max-w-2xl leading-relaxed mt-2">
            Passez à la vitesse supérieure. Synchronisation intelligente hors-ligne, suivi terrain GPS, et sécurité bancaire propulsée par InsForge. Ne perdez plus aucune donnée.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mt-6">
            <button
              onClick={onNavigateToLogin}
              className="px-8 py-4 rounded-2xl bg-gradient-to-r from-brand-orange to-amber-500 hover:from-amber-500 hover:to-brand-orange text-white font-bold text-lg flex items-center justify-center gap-3 transition-all duration-300 shadow-[0_0_20px_rgba(249,115,22,0.3)] hover:shadow-[0_0_30px_rgba(249,115,22,0.5)] group hover:-translate-y-1"
            >
              Démarrer maintenant
              <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </button>
            <a
              href="#demo-section"
              className="px-8 py-4 rounded-2xl bg-white/80 border border-slate-200 text-slate-700 font-bold text-lg hover:bg-slate-100 transition-all duration-300 text-center flex items-center justify-center hover:-translate-y-1"
            >
              Accès Démo Sécurisé
            </a>
          </div>
        </div>

        {/* Feature Cards Showcase */}
        <div className="lg:col-span-5 grid sm:grid-cols-2 gap-4">
          <div className="p-6 rounded-3xl bg-white border border-slate-200 hover:bg-slate-50 transition-colors text-left backdrop-blur-xl hover:border-brand-orange/30">
            <div className="w-12 h-12 rounded-xl bg-brand-orange/15 flex items-center justify-center text-brand-orange mb-5 border border-brand-orange/20 shadow-[0_0_15px_rgba(249,115,22,0.15)]">
              <Database className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Base de Données InsForge</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Vos données clients sont sauvegardées en ligne instantanément et en toute sécurité.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-slate-200 hover:bg-slate-50 transition-colors text-left backdrop-blur-xl hover:border-brand-emerald/30">
            <div className="w-12 h-12 rounded-xl bg-brand-emerald/15 flex items-center justify-center text-brand-emerald mb-5 border border-brand-emerald/20 shadow-[0_0_15px_rgba(16,185,129,0.15)]">
              <Wifi className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Offline-First Intelligent</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Continuez d'enregistrer des données même sans internet. La synchronisation se fera automatiquement.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-slate-200 hover:bg-slate-50 transition-colors text-left backdrop-blur-xl hover:border-amber-400/30">
            <div className="w-12 h-12 rounded-xl bg-amber-400/15 flex items-center justify-center text-amber-400 mb-5 border border-amber-400/20 shadow-[0_0_15px_rgba(251,191,36,0.15)]">
              <MapPin className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">GPS et Terrain</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Capturez la position exacte de vos commerciaux lors des visites clients pour plus de transparence.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-slate-200 hover:bg-slate-50 transition-colors text-left backdrop-blur-xl hover:border-blue-500/30">
            <div className="w-12 h-12 rounded-xl bg-blue-500/15 flex items-center justify-center text-blue-500 mb-5 border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.15)]">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Sécurité et Rôles</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Chiffrement de pointe et gestion pyramidale des droits (Super Admin, Manager, Commercial).
            </p>
          </div>
        </div>
      </section>

      {/* Demo Roles Section */}
      <section id="demo-section" className="bg-white/50 border-t border-slate-200/50 py-20 px-6 relative z-10 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-100 text-slate-700 text-xs font-bold uppercase tracking-widest mb-6">
            Espace Test
          </div>
          <h2 className="text-4xl font-black text-slate-900 mb-4 drop-shadow-lg">Accès Sécurisé Super Admin</h2>
          <p className="text-lg text-slate-400 mb-12 max-w-2xl mx-auto">
            Testez l'enregistrement de données en conditions réelles avec le compte administrateur principal connecté à InsForge.
          </p>

          <div className="max-w-md mx-auto">
            {/* Super Admin Demo */}
            <div className="p-8 rounded-3xl bg-gradient-to-b from-white to-slate-50 border border-brand-orange/30 shadow-[0_0_40px_rgba(249,115,22,0.1)] flex flex-col items-center text-center relative overflow-hidden group hover:border-brand-orange/60 transition-all duration-500">
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-orange/10 blur-[50px] group-hover:bg-brand-orange/20 transition-all"></div>
              
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-brand-orange to-amber-600 flex items-center justify-center mb-6 shadow-xl shadow-brand-orange/20 border-4 border-white relative z-10">
                <ShieldCheck className="w-10 h-10 text-white" />
              </div>
              
              <h3 className="text-2xl font-black text-slate-900 mb-1 relative z-10">Soro Nagony Adama</h3>
              <p className="text-brand-orange font-bold tracking-widest uppercase mb-4 relative z-10 text-sm">Privilèges Maximums</p>
              
              <p className="text-slate-400 mb-8 relative z-10">
                Connectez-vous pour ajouter des prospects, gérer les commerciaux et visualiser les statistiques en temps réel.
              </p>
              
              <button
                onClick={() => onQuickLogin('soroboss.bossimpact@gmail.com')}
                className="w-full py-4 rounded-xl bg-brand-orange hover:bg-orange-500 text-white font-black text-lg transition-all shadow-[0_0_20px_rgba(249,115,22,0.3)] hover:shadow-[0_0_30px_rgba(249,115,22,0.5)] flex items-center justify-center gap-3 relative z-10 hover:-translate-y-1"
              >
                Tester maintenant <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200/50 py-8 px-6 text-center text-sm text-slate-400 relative z-10 backdrop-blur-md bg-slate-50/50">
        <p>© 2026 DjagoCRM. L'excellence CRM repensée pour l'Afrique.</p>
      </footer>
    </div>
  );
};
