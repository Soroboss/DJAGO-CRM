import React from 'react';
import { useCrmStore } from '../store/crmStore';
import { Wifi, WifiOff, CloudLightning } from 'lucide-react';

export const NetworkBadge: React.FC = () => {
  const isOnline = useCrmStore((state) => state.isOnline);
  const isSyncing = useCrmStore((state) => state.isSyncing);

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wider transition-all duration-300 ${
        isOnline
          ? 'bg-brand-emerald/10 text-brand-emerald border border-brand-emerald/20'
          : 'bg-red-500/10 text-red-500 border border-red-500/20'
      }`}
    >
      {isOnline ? (
        <>
          <Wifi className="w-3.5 h-3.5" />
          <span>EN LIGNE</span>
          {isSyncing && (
            <CloudLightning className="w-3 h-3 animate-bounce text-brand-orange" />
          )}
        </>
      ) : (
        <>
          <WifiOff className="w-3.5 h-3.5 animate-pulse" />
          <span>HORS-LIGNE</span>
        </>
      )}
    </div>
  );
};
