import React from 'react';
import { useToastStore } from '../store/toastStore';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToastStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2.5 w-full max-w-sm px-4">
      {toasts.map((toast) => {
        let bgColor = 'bg-white/80 border border-white/50 text-slate-900 shadow-[0_8px_30px_rgb(0,0,0,0.08)]';
        let icon = <Info className="w-5 h-5 text-sky-500 drop-shadow-sm" />;
        let iconBg = 'bg-sky-50 text-sky-500';

        if (toast.type === 'success') {
          bgColor = 'bg-white/80 border border-emerald-500/20 text-slate-900 shadow-[0_8px_30px_rgba(16,185,129,0.12)]';
          icon = <CheckCircle2 className="w-5 h-5 text-emerald-600 drop-shadow-sm" />;
          iconBg = 'bg-emerald-50';
        } else if (toast.type === 'error') {
          bgColor = 'bg-white/80 border border-red-500/20 text-slate-900 shadow-[0_8px_30px_rgba(239,68,68,0.12)]';
          icon = <XCircle className="w-5 h-5 text-red-600 drop-shadow-sm" />;
          iconBg = 'bg-red-50';
        } else if (toast.type === 'warning') {
          bgColor = 'bg-white/80 border border-orange-500/20 text-slate-900 shadow-[0_8px_30px_rgba(249,115,22,0.12)]';
          icon = <AlertTriangle className="w-5 h-5 text-orange-600 drop-shadow-sm" />;
          iconBg = 'bg-orange-50';
        }

        return (
          <div
            key={toast.id}
            className={`flex items-center justify-between gap-3 p-3.5 pr-4 rounded-2xl backdrop-blur-xl animate-toast-slide-in transition-all duration-300 transform hover:scale-[1.02] ${bgColor}`}
          >
            <div className="flex items-center gap-3.5">
              <div className={`p-2 rounded-xl ${iconBg} shadow-inner`}>
                {icon}
              </div>
              <p className="text-sm font-bold tracking-tight text-slate-800">
                {toast.message}
              </p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100/50 transition-all ml-4"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
