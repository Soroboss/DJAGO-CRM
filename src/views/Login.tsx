import React, { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { ArrowLeft, Mail, Lock, LogIn, Sparkles } from 'lucide-react';

interface LoginProps {
  onBack: () => void;
}

export const Login: React.FC<LoginProps> = ({ onBack }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('••••••••'); // Decorative for visual completeness
  const login = useAuthStore((state) => state.login);
  const isLoading = useAuthStore((state) => state.isLoading);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    await login(email);
  };

  const handleQuickFill = (demoEmail: string) => {
    setEmail(demoEmail);
  };

  return (
    <div className="min-h-screen bg-[#05070c] text-slate-100 flex flex-col justify-center items-center px-4 relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-brand-orange/10 blur-[130px] pointer-events-none animate-pulse-slow" />
      <div className="absolute top-[10%] left-[10%] w-[300px] h-[300px] rounded-full bg-brand-emerald/5 blur-[100px] pointer-events-none" />

      {/* Back button */}
      <button
        onClick={onBack}
        className="absolute top-6 left-6 flex items-center gap-2 text-slate-400 hover:text-slate-200 transition-colors text-sm font-semibold group cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        <span>Retour</span>
      </button>

      <div className="w-full max-w-md p-8 rounded-3xl glass-panel shadow-2xl relative z-10 flex flex-col gap-6">
        {/* Title */}
        <div className="text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-orange/10 text-brand-orange text-xs font-semibold mb-3 border border-brand-orange/20">
            <Sparkles className="w-3.5 h-3.5" /> DjagoCRM V1
          </div>
          <h2 className="text-3xl font-extrabold text-white leading-tight">Bienvenue</h2>
          <p className="text-slate-450 text-sm mt-1">Saisissez vos identifiants de connexion</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5 text-left">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Adresse e-mail</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="email"
                placeholder="nom@entreprise.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-3.5 rounded-xl bg-[#05070c]/60 border border-slate-800 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-brand-orange focus:ring-1 focus:ring-brand-orange transition-all text-sm"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5 text-left">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Mot de passe</label>
              <span className="text-xs text-brand-orange hover:underline cursor-pointer">Mot de passe oublié ?</span>
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-3.5 rounded-xl bg-[#05070c]/60 border border-slate-800 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-brand-orange focus:ring-1 focus:ring-brand-orange transition-all text-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-3.5 rounded-xl bg-brand-orange hover:bg-brand-orange/95 text-white font-bold transition-all duration-300 shadow-lg shadow-brand-orange/20 flex items-center justify-center gap-2 hover:scale-[1.01] disabled:opacity-50 cursor-pointer"
          >
            {isLoading ? "Vérification..." : "Se connecter"}
            {!isLoading && <LogIn className="w-4 h-4" />}
          </button>
        </form>

        {/* Quick Demo selector */}
        <div className="border-t border-slate-800/50 pt-6">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider text-left mb-3">
            Comptes de test (Un clic pour pré-remplir)
          </p>
          <div className="flex flex-col gap-2">
            <button
              onClick={() => handleQuickFill('le_vieux@djagocrm.ci')}
              className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-[#05070c]/50 hover:bg-[#090d16]/80 border border-slate-800 hover:border-brand-orange/40 text-left text-xs transition-all cursor-pointer glass-panel-hover"
            >
              <div>
                <span className="font-semibold text-slate-200">DG :</span> le_vieux@djagocrm.ci
              </div>
              <span className="text-[10px] bg-brand-orange/15 text-brand-orange px-2 py-0.5 rounded font-bold uppercase">DG</span>
            </button>

            <button
              onClick={() => handleQuickFill('koffi.manager@djagocrm.ci')}
              className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-[#05070c]/50 hover:bg-[#090d16]/80 border border-slate-800 hover:border-brand-emerald/40 text-left text-xs transition-all cursor-pointer glass-panel-hover"
            >
              <div>
                <span className="font-semibold text-slate-200">Manager :</span> koffi.manager@djagocrm.ci
              </div>
              <span className="text-[10px] bg-brand-emerald/15 text-brand-emerald px-2 py-0.5 rounded font-bold uppercase">MGR</span>
            </button>

            <button
              onClick={() => handleQuickFill('salif.wara@djagocrm.ci')}
              className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-[#05070c]/50 hover:bg-[#090d16]/80 border border-slate-800 hover:border-slate-700 text-left text-xs transition-all cursor-pointer glass-panel-hover"
            >
              <div>
                <span className="font-semibold text-slate-200">Commercial :</span> salif.wara@djagocrm.ci
              </div>
              <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-bold uppercase">WARA</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
