import React, { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { ArrowLeft, Mail, Lock, LogIn, Sparkles, ShieldCheck, Zap, BarChart3, Database } from 'lucide-react';

interface LoginProps {
  onBack: () => void;
}

export const Login: React.FC<LoginProps> = ({ onBack }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const login = useAuthStore((state) => state.login);
  const isLoading = useAuthStore((state) => state.isLoading);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    await login(email, password || undefined);
  };

  const handleQuickFill = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('DjagoAdmin2026!');
  };

  return (
    <div className="min-h-screen bg-[#05070c] text-slate-100 flex relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-0 right-0 w-full h-full pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[800px] h-[800px] rounded-full bg-brand-orange/10 blur-[150px] animate-pulse-slow" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-brand-emerald/5 blur-[120px] animate-pulse-slow" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[100vw] h-[100vh] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-[#05070c]/80 to-[#05070c] pointer-events-none" />
      </div>

      {/* Left side: Premium Branding & Value Props */}
      <div className="hidden lg:flex w-[55%] flex-col justify-center px-20 relative z-10 border-r border-slate-800/50 bg-[#070b14]/50 backdrop-blur-3xl">
        <div className="absolute top-8 left-12 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-orange to-amber-600 flex items-center justify-center shadow-lg shadow-brand-orange/20">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="text-2xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
            Djago<span className="text-brand-orange">CRM</span>
          </span>
        </div>

        <div className="max-w-xl">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-emerald/10 text-brand-emerald text-sm font-semibold mb-6 border border-brand-emerald/20 animate-fade-in">
            <Sparkles className="w-4 h-4" /> Nouvelle Version 2.0 (InsForge)
          </div>
          
          <h1 className="text-5xl font-black text-white leading-[1.1] mb-6 animate-fade-in-up">
            Le CRM conçu pour la croissance en <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-orange to-amber-400">Afrique</span>.
          </h1>
          
          <p className="text-lg text-slate-400 mb-12 leading-relaxed animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            Synchronisation offline/online intelligente, suivi GPS sur le terrain, 
            et intelligence artificielle intégrée. Tout ce dont vos équipes ont besoin pour performer.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] transition-colors">
              <ShieldCheck className="w-8 h-8 text-brand-emerald mb-3" />
              <h3 className="font-bold text-white mb-1">Sécurité Bancaire</h3>
              <p className="text-sm text-slate-400">Authentification forte et chiffrement de bout en bout via InsForge.</p>
            </div>
            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] transition-colors">
              <Database className="w-8 h-8 text-brand-orange mb-3" />
              <h3 className="font-bold text-white mb-1">Mode Hors-ligne</h3>
              <p className="text-sm text-slate-400">Continuez à travailler sans internet, vos données se synchronisent plus tard.</p>
            </div>
            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] transition-colors">
              <BarChart3 className="w-8 h-8 text-blue-400 mb-3" />
              <h3 className="font-bold text-white mb-1">Analytics Avancés</h3>
              <p className="text-sm text-slate-400">Des tableaux de bord dynamiques pour piloter votre activité en temps réel.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right side: Login Form */}
      <div className="w-full lg:w-[45%] flex flex-col justify-center items-center px-6 lg:px-16 relative z-10">
        {/* Mobile Header (Hidden on Desktop) */}
        <div className="lg:hidden absolute top-8 left-6 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-orange to-amber-600 flex items-center justify-center shadow-lg shadow-brand-orange/20">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="text-xl font-extrabold tracking-tight">DjagoCRM</span>
        </div>

        {/* Back button */}
        <button
          onClick={onBack}
          className="absolute top-8 right-8 flex items-center gap-2 text-slate-400 hover:text-slate-200 transition-colors text-sm font-semibold group cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Retour</span>
        </button>

        <div className="w-full max-w-[420px]">
          <div className="mb-10 text-center lg:text-left">
            <h2 className="text-3xl font-extrabold text-white mb-2">Accès Sécurisé</h2>
            <p className="text-slate-400 text-sm">Connectez-vous pour accéder à votre espace de travail.</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-5 mb-8">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider ml-1">Adresse e-mail</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-brand-orange transition-colors" />
                <input
                  type="email"
                  placeholder="nom@entreprise.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-[#0a0f1c]/80 border border-slate-700/50 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20 focus:bg-[#0a0f1c] transition-all"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center ml-1">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Mot de passe</label>
                <span className="text-xs text-brand-orange hover:text-amber-400 transition-colors cursor-pointer">Mot de passe oublié ?</span>
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-brand-orange transition-colors" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-[#0a0f1c]/80 border border-slate-700/50 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20 focus:bg-[#0a0f1c] transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-4 py-4 rounded-2xl bg-gradient-to-r from-brand-orange to-amber-500 hover:from-amber-500 hover:to-brand-orange text-white font-bold text-lg transition-all duration-300 shadow-[0_0_20px_rgba(249,115,22,0.3)] hover:shadow-[0_0_30px_rgba(249,115,22,0.5)] flex items-center justify-center gap-3 disabled:opacity-50 hover:-translate-y-0.5 active:translate-y-0"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Vérification...
                </span>
              ) : (
                <>
                  Se Connecter <LogIn className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo selector */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-800"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-4 bg-[#05070c] text-slate-500 uppercase font-bold tracking-widest">
                Accès Super Admin
              </span>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3">
            <button
              onClick={() => handleQuickFill('soroboss.bossimpact@gmail.com')}
              className="w-full group flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-slate-900 to-[#0a0f1c] border border-slate-800 hover:border-brand-orange/40 text-left transition-all cursor-pointer shadow-sm hover:shadow-brand-orange/10"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-brand-orange/10 flex items-center justify-center border border-brand-orange/20 group-hover:scale-110 transition-transform">
                  <ShieldCheck className="w-5 h-5 text-brand-orange" />
                </div>
                <div>
                  <div className="font-bold text-slate-200">Soro Nagony Adama</div>
                  <div className="text-sm text-slate-400">soroboss.bossimpact@gmail.com</div>
                </div>
              </div>
              <div className="px-3 py-1 rounded-full bg-brand-orange/10 border border-brand-orange/20">
                <span className="text-[10px] text-brand-orange font-bold uppercase tracking-wider">Super Admin</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

