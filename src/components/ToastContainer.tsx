import React from 'react';
import { useToastStore } from '../store/toastStore';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToastStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2.5 w-full max-w-sm px-4">
      {toasts.map((toast) => {
        let bgColor = 'bg-slate-900/95 text-white';
        let icon = <Info className="w-5 h-5 text-sky-400" />;

        if (toast.type === 'success') {
          bgColor = 'bg-slate-900/95 border-l-4 border-brand-emerald text-white';
          icon = <CheckCircle2 className="w-5 h-5 text-brand-emerald" />;
        } else if (toast.type === 'error') {
          bgColor = 'bg-slate-900/95 border-l-4 border-red-500 text-white';
          icon = <XCircle className="w-5 h-5 text-red-500" />;
        } else if (toast.type === 'warning') {
          bgColor = 'bg-slate-900/95 border-l-4 border-brand-orange text-white';
          icon = <AlertTriangle className="w-5 h-5 text-brand-orange" />;
        }

        return (
          <div
            key={toast.id}
            className={`flex items-center justify-between gap-3 p-4 rounded-xl shadow-xl glass backdrop-blur-md animate-toast-slide-in transition-all duration-300 ${bgColor}`}
          >
            <div className="flex items-center gap-3">
              {icon}
              <p className="text-sm font-medium tracking-wide leading-relaxed">
                {toast.message}
              </p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
