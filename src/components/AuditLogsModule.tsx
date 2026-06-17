import React, { useState } from 'react';
import { useCrmStore } from '../store/crmStore';
import { useAuthStore } from '../store/authStore';
import { Search, MapPin, ShieldCheck } from 'lucide-react';

export const AuditLogsModule: React.FC = () => {
  const { interactions, clients } = useCrmStore();
  const { team } = useAuthStore();
  const [selectedCommercialId, setSelectedCommercialId] = useState<string>('');

  const filteredInteractions = selectedCommercialId
    ? interactions.filter(i => i.performed_by === selectedCommercialId)
    : interactions;

  return (
    <div className="flex flex-col gap-6 text-left animate-fade-in relative z-10">
      <div className="p-6 rounded-[2rem] glass-card glass-panel-hover flex flex-col sm:flex-row items-center justify-between gap-4">
        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-orange-500" />
          Filtre d'Audit
        </h3>
        <div className="flex items-center gap-2 w-full sm:w-72 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 pointer-events-none" />
          <select
            value={selectedCommercialId}
            onChange={(e) => setSelectedCommercialId(e.target.value)}
            className="pl-10 pr-4 py-3 w-full rounded-xl bg-white/60 backdrop-blur-sm border border-white/40 focus:outline-none focus:border-brand-orange focus:ring-2 focus:ring-orange-500/20 text-sm text-slate-700 shadow-sm appearance-none"
          >
            <option value="">Tous les commerciaux</option>
            {team.filter(t => t.role === 'commercial').map(c => (
              <option key={c.id} value={c.id}>{c.name} ({c.zone})</option>
            ))}
          </select>
        </div>
      </div>

      <div className="p-6 rounded-[2rem] glass-card glass-panel-hover">
        <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
          Chronologie des Actions Relances
        </h3>
        
        {filteredInteractions.length === 0 ? (
          <p className="text-sm text-slate-500 py-6 text-center italic">Aucune interaction enregistrée pour cette sélection.</p>
        ) : (
          <div className="flex flex-col gap-6 border-l-2 border-orange-500/20 pl-6 ml-4">
            {filteredInteractions.map((int) => {
              const client = clients.find(c => c.id === int.client_id);
              const agent = team.find(t => t.id === int.performed_by);

              let iconBadge = 'bg-slate-100/80 text-slate-500 border border-slate-200/50';
              if (int.type === 'appel') iconBadge = 'bg-blue-500/15 text-blue-600 border border-blue-500/20';
              if (int.type === 'whatsapp') iconBadge = 'bg-emerald-500/15 text-emerald-600 border border-emerald-500/20';
              if (int.type === 'terrain') iconBadge = 'bg-amber-500/15 text-amber-600 border border-amber-500/20';
              if (int.type === 'creation') iconBadge = 'bg-purple-500/15 text-purple-600 border border-purple-500/20';
              if (int.type === 'transfert') iconBadge = 'bg-pink-500/15 text-pink-600 border border-pink-500/20';
              if (int.type === 'statut') iconBadge = 'bg-orange-500/15 text-orange-600 border border-orange-500/20';

              return (
                <div key={int.id} className="relative flex flex-col gap-2 text-left group">
                  <div className="absolute left-[calc(-1.5rem-1px)] top-1.5 w-3 h-3 rounded-full bg-gradient-to-tr from-orange-500 to-orange-400 ring-4 ring-white/50 shadow-md group-hover:scale-125 transition-transform" />
                  
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[11px] text-slate-500 font-bold bg-white/60 px-2 py-0.5 rounded-md shadow-sm border border-slate-100/50">
                      {new Date(int.created_at).toLocaleString()}
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="text-xs font-black text-slate-700">{agent?.name}</span>
                    <span className="text-slate-300">•</span>
                    <span className="text-xs text-slate-500 font-medium">
                      Client : <span className="font-bold text-slate-900 bg-slate-100/50 px-1.5 py-0.5 rounded-md">{client?.name || 'Inconnu'}</span>
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-white/60 backdrop-blur-sm border border-white/40 shadow-sm hover:shadow-md transition-shadow flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider shrink-0 shadow-sm ${iconBadge}`}>
                      {int.type}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-700 font-medium">{int.details}</p>
                      {int.gps_coordinates && (
                        <div className="flex items-center gap-1.5 text-xs text-amber-600 font-bold mt-2 bg-amber-500/10 inline-flex px-2 py-1 rounded-lg border border-amber-500/20">
                          <MapPin className="w-3.5 h-3.5" />
                          <span>GPS : {int.gps_coordinates}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
