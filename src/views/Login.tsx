import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { ArrowLeft, Mail, Lock, LogIn, Sparkles, ShieldCheck, Zap, BarChart3, Database, Building2, User, UserPlus, CheckCircle } from 'lucide-react';
import { INDUSTRIES } from '../config/industries';

interface LoginProps {
  isAdmin?: boolean;
  onBack: () => void;
}

export const Login: React.FC<LoginProps> = ({ onBack, isAdmin = false }) => {
  const [isSignup, setIsSignup] = useState(false);

  useEffect(() => {
    if (window.location.search.includes('mode=signup')) {
      setIsSignup(true);
    }
  }, []);
    
  // Login fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Signup fields
  const [name, setName] = useState('');
  const [orgName, setOrgName] = useState('');
  const [industryCategory, setIndustryCategory] = useState(Object.keys(INDUSTRIES)[0]);

  const login = useAuthStore((state) => state.login);
  const signup = useAuthStore((state) => state.signup);
  const verifyOtp = useAuthStore((state) => state.verifyOtp);
  const isLoading = useAuthStore((state) => state.isLoading);

  const [showCheckEmail, setShowCheckEmail] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [otpCode, setOtpCode] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSignup) {
      if (!email || !password || !name || !orgName) return;
      const result = await signup(email, password, name, orgName, industryCategory);
      if (result.requiresEmailVerification) {
        setShowCheckEmail(true);
      }
    } else {
      if (!email) return;
      await login(email, password || undefined);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !otpCode) return;
    const success = await verifyOtp(email, otpCode);
    if (success) {
      setShowSuccessPopup(true);
    }
  };

  

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-0 right-0 w-full h-full pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[800px] h-[800px] rounded-full bg-brand-orange/10 blur-[150px] animate-pulse-slow" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-brand-emerald/5 blur-[120px] animate-pulse-slow" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[100vw] h-[100vh] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-slate-50/80 to-slate-100 pointer-events-none" />
      </div>

      {/* Left side: Premium Branding & Value Props */}
      <div className="hidden lg:flex w-[55%] flex-col justify-center px-20 relative z-10 border-r border-slate-200/50 bg-white/50 backdrop-blur-3xl">
        <div className="absolute top-8 left-12 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-orange to-amber-600 flex items-center justify-center shadow-lg shadow-brand-orange/20">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="text-2xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600">
            Djago<span className="text-brand-orange">CRM</span>
          </span>
        </div>

        <div className="max-w-xl">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-emerald/10 text-brand-emerald text-sm font-semibold mb-6 border border-brand-emerald/20 animate-fade-in">
            <Sparkles className="w-4 h-4" /> SaaS Edition - Multi-Locataire
          </div>
          
          <h1 className="text-5xl font-black text-slate-900 leading-[1.1] mb-6 animate-fade-in-up">
            Le CRM conçu pour la croissance en <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-orange to-amber-400">Afrique</span>.
          </h1>
          
          <p className="text-lg text-slate-500 mb-12 leading-relaxed animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            Créez votre espace de travail personnalisé. Que vous soyez dans l'immobilier, les services B2B ou le e-commerce, Djago s'adapte à votre métier.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <div className="p-5 rounded-2xl bg-white border border-slate-200 hover:bg-slate-50 transition-colors shadow-sm">
              <Building2 className="w-8 h-8 text-brand-emerald mb-3" />
              <h3 className="font-bold text-slate-900 mb-1">Espaces Isolés</h3>
              <p className="text-sm text-slate-500">Vos données sont cloisonnées et sécurisées dans votre propre environnement.</p>
            </div>
            <div className="p-5 rounded-2xl bg-white border border-slate-200 hover:bg-slate-50 transition-colors shadow-sm">
              <Zap className="w-8 h-8 text-brand-orange mb-3" />
              <h3 className="font-bold text-slate-900 mb-1">Sur-Mesure</h3>
              <p className="text-sm text-slate-500">Le vocabulaire et les modules s'adapte automatiquement à votre industrie.</p>
            </div>
            <div className="p-5 rounded-2xl bg-white border border-slate-200 hover:bg-slate-50 transition-colors shadow-sm">
              <Database className="w-8 h-8 text-blue-400 mb-3" />
              <h3 className="font-bold text-slate-900 mb-1">Mode Hors-ligne</h3>
              <p className="text-sm text-slate-500">Continuez à travailler sans internet sur le terrain.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right side: Login / Signup Form */}
      <div className="w-full lg:w-[45%] flex flex-col justify-center items-center px-6 lg:px-16 relative z-10 overflow-y-auto py-12">
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
          className="absolute top-8 right-8 flex items-center gap-2 text-slate-400 hover:text-slate-800 transition-colors text-sm font-semibold group cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Retour</span>
        </button>

        <div className="w-full max-w-[420px] mt-12 lg:mt-0">
          <div className="mb-8 text-center lg:text-left">
            <h2 className="text-3xl font-extrabold text-slate-900 mb-2">
              {showSuccessPopup ? "Inscription validée !" : showCheckEmail ? "Vérifiez vos e-mails" : isSignup ? "Créer un espace" : isAdmin ? "Administration SaaS" : "Accès Sécurisé"}
            </h2>
            <p className="text-slate-500 text-sm">
              {showSuccessPopup 
                ? "Votre compte a été confirmé avec succès. Vous pouvez maintenant vous connecter."
                : showCheckEmail 
                  ? "Entrez le code de vérification reçu."
                  : isSignup ? "Configurez le CRM pour votre entreprise en 2 minutes." : "Connectez-vous pour accéder à votre espace de travail."}
            </p>
          </div>

          {/* Toggle Login/Signup */}
          {!isAdmin && !showCheckEmail && !showSuccessPopup && (
          <div className="flex bg-slate-200/50 p-1 rounded-xl mb-8">
            <button 
              onClick={() => setIsSignup(false)}
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${!isSignup ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Connexion
            </button>
            <button 
              onClick={() => setIsSignup(true)}
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${isSignup ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Inscription
            </button>
          </div>
        )}

          {/* Form */}
          {showSuccessPopup ? (
            <div className="flex flex-col items-center justify-center p-8 bg-brand-emerald/10 rounded-2xl border border-brand-emerald/20 text-center animate-fade-in w-full">
              <CheckCircle className="w-16 h-16 text-brand-emerald mb-4" />
              <h3 className="text-xl font-bold text-slate-900 mb-2">Inscription validée !</h3>
              <p className="text-slate-600 mb-6">
                Votre compte a été confirmé avec succès. Vous pouvez maintenant vous connecter.
              </p>
              <button
                onClick={() => {
                  setShowSuccessPopup(false);
                  setShowCheckEmail(false);
                  setIsSignup(false);
                  setOtpCode('');
                }}
                className="w-full py-3.5 rounded-xl bg-brand-emerald hover:bg-emerald-600 text-white font-bold transition-all shadow-md flex items-center justify-center"
              >
                Se connecter
              </button>
            </div>
          ) : !showCheckEmail ? (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4 mb-8">
              {isSignup && (
                <>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider ml-1">Nom Complet</label>
                    <div className="relative group">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-brand-orange transition-colors" />
                      <input
                        type="text"
                        placeholder="Jean Dupont"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className="w-full pl-12 pr-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20 transition-all shadow-sm"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider ml-1">Nom de l'entreprise</label>
                    <div className="relative group">
                      <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-brand-orange transition-colors" />
                      <input
                        type="text"
                        placeholder="Mon Entreprise SA"
                        value={orgName}
                        onChange={(e) => setOrgName(e.target.value)}
                        required
                        className="w-full pl-12 pr-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20 transition-all shadow-sm"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider ml-1">Secteur d'activité</label>
                    <select
                      value={industryCategory}
                      onChange={(e) => setIndustryCategory(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-900 focus:outline-none focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20 transition-all shadow-sm cursor-pointer"
                    >
                      {Object.values(INDUSTRIES).map((ind) => (
                        <option key={ind.id} value={ind.id}>{ind.label}</option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              <div className="flex flex-col gap-1.5 mt-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider ml-1">Adresse e-mail</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-brand-orange transition-colors" />
                  <input
                    type="email"
                    placeholder="nom@entreprise.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-12 pr-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20 transition-all shadow-sm"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center ml-1">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Mot de passe</label>
                  {!isSignup && <span className="text-xs text-brand-orange hover:text-amber-500 transition-colors cursor-pointer">Mot de passe oublié ?</span>}
                </div>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-brand-orange transition-colors" />
                  <input
                    type="password"
                    placeholder={isSignup ? "Créez un mot de passe (min 6 car.)" : "••••••••"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full pl-12 pr-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20 transition-all shadow-sm"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-4 py-3.5 rounded-xl bg-gradient-to-r from-brand-orange to-amber-500 hover:from-amber-500 hover:to-brand-orange text-white font-bold text-lg transition-all duration-300 shadow-md shadow-brand-orange/20 hover:shadow-brand-orange/40 flex items-center justify-center gap-3 disabled:opacity-50 hover:-translate-y-0.5 active:translate-y-0"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Traitement...
                  </span>
                ) : (
                  <>
                    {isSignup ? "Créer mon Espace" : "Se Connecter"} {isSignup ? <UserPlus className="w-5 h-5" /> : <LogIn className="w-5 h-5" />}
                  </>
                )}
              </button>
            </form>
          ) : (
            <div className="flex flex-col items-center justify-center p-8 bg-brand-emerald/10 rounded-2xl border border-brand-emerald/20 text-center animate-fade-in w-full">
              <Mail className="w-16 h-16 text-brand-emerald mb-4" />
              <h3 className="text-xl font-bold text-slate-900 mb-2">Vérifiez vos e-mails !</h3>
              <p className="text-slate-600 mb-6">
                Entrez le code à 6 chiffres envoyé à <strong className="text-slate-900">{email}</strong> pour valider votre compte.
                (Ou cliquez sur le lien s'il y en a un).
              </p>
              
              <form onSubmit={handleOtpSubmit} className="w-full flex flex-col gap-4 mb-6">
                <input
                  type="text"
                  placeholder="Code à 6 chiffres"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  maxLength={6}
                  required
                  className="w-full text-center tracking-[0.5em] font-bold text-2xl py-3 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder-slate-300 focus:outline-none focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20 transition-all shadow-sm"
                />
                <button
                  type="submit"
                  disabled={isLoading || otpCode.length !== 6}
                  className="w-full py-3.5 rounded-xl bg-brand-emerald hover:bg-emerald-600 text-white font-bold transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isLoading ? "Vérification..." : "Valider le code"}
                </button>
              </form>
              
              <button
                onClick={() => setShowCheckEmail(false)}
                className="text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors"
              >
                Je n'ai rien reçu, recommencer
              </button>
            </div>
          )}

          
        </div>
      </div>
    </div>
  );
};
