import React, { useState } from 'react';
import { CreditCard, Phone, CheckCircle2, Loader2, ShieldCheck, X } from 'lucide-react';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  plan: any;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, onSuccess, plan }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [network, setNetwork] = useState('wave'); // wave, orange, mtn, moov
  const [status, setStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');

  if (!isOpen) return null;

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber) return;
    
    setStatus('processing');
    
    // Simuler un paiement API (ex: appel CinetPay / Wave API)
    setTimeout(() => {
      setStatus('success');
      setTimeout(() => {
        onSuccess();
        onClose();
        setStatus('idle');
      }, 2000);
    }, 3000);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-fade-in relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 bg-slate-100 rounded-full p-2"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-8">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
            <CreditCard className="w-8 h-8" />
          </div>
          
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Paiement Mobile Money</h2>
          <p className="text-slate-500 mb-6">
            Souscription au plan <strong className="text-slate-900">{plan?.name}</strong> pour <strong className="text-slate-900">{plan?.price_fcfa} FCFA</strong> / mois.
          </p>

          {status === 'success' ? (
            <div className="py-8 flex flex-col items-center justify-center animate-fade-in">
              <CheckCircle2 className="w-16 h-16 text-emerald-500 mb-4" />
              <h3 className="text-xl font-bold text-slate-900 mb-2">Paiement Réussi !</h3>
              <p className="text-slate-500 text-center">Votre abonnement a été activé avec succès.</p>
            </div>
          ) : status === 'processing' ? (
            <div className="py-8 flex flex-col items-center justify-center animate-fade-in">
              <Loader2 className="w-16 h-16 text-orange-500 animate-spin mb-4" />
              <h3 className="text-xl font-bold text-slate-900 mb-2">Veuillez valider...</h3>
              <p className="text-slate-500 text-center">Veuillez composer le code secret sur votre téléphone pour valider la transaction de {plan?.price_fcfa} FCFA.</p>
            </div>
          ) : (
            <form onSubmit={handlePayment} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Choisissez votre réseau</label>
                <div className="grid grid-cols-2 gap-3">
                  <button type="button" onClick={() => setNetwork('wave')} className={`p-3 rounded-xl border-2 flex items-center justify-center font-bold transition-all ${network === 'wave' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-500'}`}>
                    Wave
                  </button>
                  <button type="button" onClick={() => setNetwork('orange')} className={`p-3 rounded-xl border-2 flex items-center justify-center font-bold transition-all ${network === 'orange' ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-slate-200 text-slate-500'}`}>
                    Orange Money
                  </button>
                  <button type="button" onClick={() => setNetwork('mtn')} className={`p-3 rounded-xl border-2 flex items-center justify-center font-bold transition-all ${network === 'mtn' ? 'border-yellow-500 bg-yellow-50 text-yellow-700' : 'border-slate-200 text-slate-500'}`}>
                    MTN MoMo
                  </button>
                  <button type="button" onClick={() => setNetwork('moov')} className={`p-3 rounded-xl border-2 flex items-center justify-center font-bold transition-all ${network === 'moov' ? 'border-blue-600 bg-blue-50 text-blue-800' : 'border-slate-200 text-slate-500'}`}>
                    Moov Money
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Numéro de téléphone</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="tel"
                    required
                    className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 font-medium text-slate-900"
                    placeholder="Ex: 0102030405"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 p-3 rounded-lg border border-slate-100">
                <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Paiement sécurisé de bout en bout. Vos informations ne sont pas stockées.</span>
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center py-4 px-4 border border-transparent rounded-xl shadow-md text-base font-bold text-white bg-slate-900 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 transition-all"
              >
                Payer {plan?.price_fcfa} FCFA
              </button>

              <div className="mt-4 text-center">
                <p className="text-xs text-slate-500 font-medium">
                  Un problème avec le paiement ? Contactez-nous :
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 mt-2">
                  <a href="https://wa.me/2250100576526" target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 transition-colors">
                    <Phone className="w-4 h-4" /> +225 0100576526
                  </a>
                  <a href="mailto:soroboss.bossimpact@gmail.com" className="text-sm font-bold text-orange-600 hover:text-orange-700 transition-colors">
                    soroboss.bossimpact@gmail.com
                  </a>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
