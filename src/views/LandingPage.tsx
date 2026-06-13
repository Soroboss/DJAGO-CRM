import React from 'react';
import { ArrowRight, Wifi, MapPin, MessageSquare, ShieldCheck, TrendingUp, Users } from 'lucide-react';

interface LandingPageProps {
  onNavigateToLogin: () => void;
  onQuickLogin: (email: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigateToLogin, onQuickLogin }) => {
  return (
    <div className="min-h-screen bg-[#05070c] text-slate-100 flex flex-col relative overflow-hidden">
      {/* Background Gradients / Glow blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-brand-orange/15 blur-[130px] pointer-events-none animate-pulse-slow" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[700px] h-[700px] rounded-full bg-brand-emerald/10 blur-[160px] pointer-events-none animate-pulse-slow" />
      <div className="absolute top-[40%] left-[50%] -translate-x-1/2 w-[400px] h-[400px] rounded-full bg-[#ff7a00]/5 blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="border-b border-slate-800/50 py-5 px-6 relative z-10 backdrop-blur-md bg-[#05070c]/40">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#ff7a00] to-[#00e676] flex items-center justify-center font-extrabold text-white text-xl shadow-lg shadow-[#ff7a00]/25 transition-transform hover:scale-105 duration-300">
              DJ
            </div>
            <span className="text-xl font-bold tracking-tight text-white">
              Djago<span className="text-brand-emerald font-extrabold">CRM</span>
            </span>
          </div>
          <button
            onClick={onNavigateToLogin}
            className="px-5 py-2.5 rounded-xl bg-[#090d16]/80 border border-slate-800 text-sm font-semibold hover:bg-brand-orange hover:text-white hover:border-brand-orange transition-all duration-300 shadow-md glass-panel-hover"
          >
            Se Connecter
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex-1 max-w-7xl mx-auto px-6 py-16 lg:py-24 grid lg:grid-cols-12 gap-12 items-center relative z-10">
        <div className="lg:col-span-7 flex flex-col gap-6 text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-orange/10 text-brand-orange text-xs font-semibold w-fit border border-brand-orange/20 tracking-wider">
            ⚡ CONÇU POUR LE MARCHÉ AFRICAIN
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.1] !my-0">
            Le CRM tout-terrain <br />
            <span className="text-glow-gradient">
              100% Offline-First
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-400 max-w-xl leading-relaxed">
            Ne laissez plus les pannes de réseau 3G/4G bloquer vos ventes. Suivez vos commerciaux sur le terrain, relancez vos clients sur WhatsApp, et pilotez votre équipe en temps réel.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <button
              onClick={onNavigateToLogin}
              className="px-6 py-3.5 rounded-xl bg-brand-orange hover:bg-brand-orange/95 text-white font-bold flex items-center justify-center gap-2 transition-all duration-300 shadow-lg shadow-brand-orange/30 group hover:scale-[1.02]"
            >
              Lancer l'application
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <a
              href="#demo-section"
              className="px-6 py-3.5 rounded-xl bg-[#090d16]/80 border border-slate-800 text-slate-350 font-semibold hover:bg-slate-800/80 transition-all duration-300 text-center"
            >
              Tester une Démo
            </a>
          </div>
        </div>

        {/* Feature Cards Showcase */}
        <div className="lg:col-span-5 grid sm:grid-cols-2 gap-4">
          <div className="p-6 rounded-2xl glass-panel glass-panel-hover text-left">
            <div className="w-10 h-10 rounded-lg bg-brand-orange/15 flex items-center justify-center text-brand-orange mb-4 border border-brand-orange/20">
              <Wifi className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Offline-First</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Travaillez n'importe où sans connexion. Vos données se synchronisent dès le retour du réseau.
            </p>
          </div>

          <div className="p-6 rounded-2xl glass-panel glass-panel-hover text-left">
            <div className="w-10 h-10 rounded-lg bg-brand-emerald/15 flex items-center justify-center text-brand-emerald mb-4 border border-brand-emerald/20">
              <MessageSquare className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Omnicanal</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Relance WhatsApp pré-remplie, appels directs et emails professionnels intégrés en 1 clic.
            </p>
          </div>

          <div className="p-6 rounded-2xl glass-panel glass-panel-hover text-left">
            <div className="w-10 h-10 rounded-lg bg-amber-400/15 flex items-center justify-center text-amber-400 mb-4 border border-amber-400/20">
              <MapPin className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Check-in Terrain</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Enregistrez la géolocalisation GPS réelle des visites clients pour auditer les passages terrain.
            </p>
          </div>

          <div className="p-6 rounded-2xl glass-panel glass-panel-hover text-left">
            <div className="w-10 h-10 rounded-lg bg-blue-500/15 flex items-center justify-center text-blue-500 mb-4 border border-blue-500/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Contrôle Pyramidal</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              DG, Manager et Commerciaux disposent de droits hiérarchiques sécurisés et de KPIs dédiés.
            </p>
          </div>
        </div>
      </section>

      {/* Demo Roles Section */}
      <section id="demo-section" className="bg-[#090d16]/30 border-t border-slate-800/50 py-16 px-6 relative z-10">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl font-extrabold text-white mb-3">Accès Rapide aux Rôles Démo</h2>
          <p className="text-slate-450 mb-10 max-w-xl mx-auto">
            Sélectionnez l'un des profils ci-dessous pour tester immédiatement les interfaces connectées.
          </p>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {/* DG Demo */}
            <div className="p-6 rounded-2xl glass-panel glass-panel-hover flex flex-col justify-between items-center text-center">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-brand-orange/15 text-brand-orange flex items-center justify-center mb-4 border border-brand-orange/25">
                  <TrendingUp className="w-6 h-6 animate-pulse-slow" />
                </div>
                <h3 className="text-xl font-bold text-white mb-1">DG ("Le Vieux")</h3>
                <p className="text-xs text-brand-orange font-bold tracking-widest uppercase mb-3">Supervision Globale</p>
                <p className="text-sm text-slate-400 mb-6">
                  KPIs généraux, Chiffre d'Affaires estimé (1.200.000 FCFA/vente), audit et historique complet de relances.
                </p>
              </div>
              <button
                onClick={() => onQuickLogin('le_vieux@djagocrm.ci')}
                className="w-full py-3 rounded-xl bg-brand-orange hover:bg-brand-orange/90 text-white font-bold text-sm transition-all shadow-md shadow-brand-orange/20"
              >
                Se connecter comme DG
              </button>
            </div>

            {/* Manager Demo */}
            <div className="p-6 rounded-2xl glass-panel glass-panel-hover flex flex-col justify-between items-center text-center">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-brand-emerald/15 text-brand-emerald flex items-center justify-center mb-4 border border-brand-emerald/25">
                  <Users className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white mb-1">Manager</h3>
                <p className="text-xs text-brand-emerald font-bold tracking-widest uppercase mb-3">Supervision de Zone</p>
                <p className="text-sm text-slate-400 mb-6">
                  Suivi des commerciaux, calcul de la commission (1.5%), réattribution en 1 clic et création de Waras.
                </p>
              </div>
              <button
                onClick={() => onQuickLogin('koffi.manager@djagocrm.ci')}
                className="w-full py-3 rounded-xl bg-brand-emerald hover:bg-brand-emerald/90 text-white font-bold text-sm transition-all shadow-md shadow-brand-emerald/20"
              >
                Se connecter comme Manager
              </button>
            </div>

            {/* Commercial Demo */}
            <div className="p-6 rounded-2xl glass-panel glass-panel-hover flex flex-col justify-between items-center text-center">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-slate-800/80 text-slate-350 flex items-center justify-center mb-4 border border-slate-700/50">
                  <MapPin className="w-6 h-6 animate-bounce" />
                </div>
                <h3 className="text-xl font-bold text-white mb-1">Commercial ("Le Wara")</h3>
                <p className="text-xs text-slate-400 font-bold tracking-widest uppercase mb-3">Mobile-First Terrain</p>
                <p className="text-sm text-slate-400 mb-6">
                  Vue épurée smartphone. Ajout rapide, hub d'action (WhatsApp, appel direct, check-in GPS physique).
                </p>
              </div>
              <button
                onClick={() => onQuickLogin('salif.wara@djagocrm.ci')}
                className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-750 text-white font-bold text-sm transition-all"
              >
                Se connecter comme Commercial
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800/50 py-8 px-6 text-center text-xs text-slate-500 relative z-10 backdrop-blur-md bg-[#05070c]/50">
        <p>© 2026 DjagoCRM. Conçu avec fierté pour l'Afrique. Produit sous licence commerciale élite.</p>
      </footer>
    </div>
  );
};
