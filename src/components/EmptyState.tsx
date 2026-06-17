import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center animate-fade-in glass-card rounded-[2rem] border border-white/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
      <div className="w-20 h-20 bg-gradient-to-br from-slate-50 to-slate-100 rounded-full flex items-center justify-center mb-6 shadow-inner border border-slate-200/50 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent"></div>
        <Icon className="w-10 h-10 text-slate-400 drop-shadow-sm relative z-10" />
      </div>
      <h3 className="text-xl font-black text-slate-900 tracking-tight mb-2">{title}</h3>
      <p className="text-sm text-slate-500 max-w-sm mb-8 font-medium leading-relaxed">{description}</p>
      
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="px-6 py-3 bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-xl font-bold shadow-lg shadow-slate-900/20 hover:shadow-slate-900/40 hover:-translate-y-0.5 transition-all duration-300"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};
