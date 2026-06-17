import React from 'react';
import { useCrmStore } from '../store/crmStore';
import { useAuthStore } from '../store/authStore';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { type LocalClient } from '../db/localDb';

interface KanbanModuleProps {
  filteredClients?: LocalClient[];
  readOnly?: boolean;
}

export const KanbanModule: React.FC<KanbanModuleProps> = ({ filteredClients, readOnly = false }) => {
  const { clients, updateClientStatus } = useCrmStore();
  const { team, user } = useAuthStore();
  
  const displayClients = filteredClients || clients;
  const statuses: LocalClient['status'][] = ['Prospect', 'Négociation', 'Vendu', 'En cours de livraison', 'Livré & Adopté'];

  return (
    <div className="flex flex-col gap-6 text-left animate-fade-in relative z-10 w-full">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 overflow-x-auto pb-4 w-full">
        {statuses.map((status) => {
          const laneClients = displayClients.filter(c => c.status === status);
          
          // Enhanced glassmorphism colors per status
          let titleColor = 'text-blue-500';
          let borderColor = 'border-blue-400/30';
          let badgeBg = 'bg-blue-500/10';

          if (status === 'Négociation') {
            titleColor = 'text-amber-500';
            borderColor = 'border-amber-400/30';
            badgeBg = 'bg-amber-500/10';
          } else if (status === 'Vendu') {
            titleColor = 'text-orange-500';
            borderColor = 'border-orange-400/30';
            badgeBg = 'bg-orange-500/10';
          } else if (status === 'En cours de livraison') {
            titleColor = 'text-teal-500';
            borderColor = 'border-teal-400/30';
            badgeBg = 'bg-teal-500/10';
          } else if (status === 'Livré & Adopté') {
            titleColor = 'text-emerald-500';
            borderColor = 'border-emerald-400/30';
            badgeBg = 'bg-emerald-500/10';
          }

          return (
            <div key={status} className="flex flex-col gap-4 min-w-[240px] glass-card p-4 rounded-[2rem] min-h-[500px]">
              <div className={`p-3 rounded-xl border ${borderColor} ${badgeBg} backdrop-blur-sm flex items-center justify-between shadow-sm`}>
                <span className={`text-xs font-black uppercase tracking-wider ${titleColor}`}>
                  {status}
                </span>
                <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-black ${titleColor} bg-white/50 backdrop-blur-md shadow-sm`}>
                  {laneClients.length}
                </span>
              </div>

              <div className="flex flex-col gap-3 overflow-y-auto max-h-[600px] scrollbar-none pr-1">
                {laneClients.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-24 border border-dashed border-white/40 rounded-[1.5rem] bg-white/20">
                    <p className="text-[10px] font-medium text-slate-500">Aucun prospect</p>
                  </div>
                ) : (
                  laneClients.map(c => {
                    const comm = team.find(t => t.id === c.assigned_to);
                    return (
                      <div key={c.id} className="p-4 rounded-[1.5rem] bg-white/60 backdrop-blur-md border border-white/80 flex flex-col gap-3 shadow-sm hover:shadow-md hover:bg-white/80 transition-all cursor-default">
                        <div>
                          <h4 className="text-sm font-bold text-slate-800 truncate">{c.name}</h4>
                          <p className="text-xs text-slate-500 truncate mt-0.5">{c.company || 'Individuel'}</p>
                        </div>
                        
                        <div className="flex justify-between items-center border-t border-slate-200/50 pt-2 text-[10px] text-slate-500 font-semibold">
                          <span>👤 {comm?.name || '—'}</span>
                          <span>📍 {comm?.zone || '—'}</span>
                        </div>

                        {!readOnly && (
                          <div className="flex justify-between gap-2 mt-1 border-t border-slate-200/50 pt-3">
                            <button
                              disabled={status === 'Prospect'}
                              onClick={async () => {
                                const currentIndex = statuses.indexOf(status);
                                if (currentIndex > 0) {
                                  await updateClientStatus(c.id, statuses[currentIndex - 1], user?.id || 'system');
                                }
                              }}
                              className="flex-1 py-1.5 rounded-lg bg-white/50 hover:bg-white text-slate-400 hover:text-slate-800 text-[10px] font-bold disabled:opacity-30 cursor-pointer flex justify-center items-center shadow-sm transition-colors border border-white/50"
                            >
                              <ChevronLeft className="w-4 h-4" />
                            </button>
                            <button
                              disabled={status === 'Livré & Adopté'}
                              onClick={async () => {
                                const currentIndex = statuses.indexOf(status);
                                if (currentIndex < statuses.length - 1) {
                                  await updateClientStatus(c.id, statuses[currentIndex + 1], user?.id || 'system');
                                }
                              }}
                              className="flex-1 py-1.5 rounded-lg bg-white/50 hover:bg-white text-slate-400 hover:text-slate-800 text-[10px] font-bold disabled:opacity-30 cursor-pointer flex justify-center items-center shadow-sm transition-colors border border-white/50"
                            >
                              <ChevronRight className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
