import React from 'react';
import { useCrmStore } from '../store/crmStore';
import { useAuthStore } from '../store/authStore';
import { Activity, MapPin } from 'lucide-react';

interface ActivityFeedModuleProps {
  scope: 'global' | 'zone' | 'user';
  zoneId?: string;
  userId?: string;
}

export const ActivityFeedModule: React.FC<ActivityFeedModuleProps> = ({ scope, zoneId, userId }) => {
  const { interactions, clients } = useCrmStore();
  const { team } = useAuthStore();

  let filteredInteractions = interactions;

  if (scope === 'zone' && zoneId) {
    const teamInZone = team.filter(t => t.zone === zoneId).map(t => t.id);
    filteredInteractions = interactions.filter(int => int.performed_by && teamInZone.includes(int.performed_by));
  } else if (scope === 'user' && userId) {
    filteredInteractions = interactions.filter(int => int.performed_by === userId);
  }

  return (
    <div className="flex flex-col gap-6 text-left animate-fade-in relative z-10 w-full max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-2">
        <div>
          <h3 className="text-xl font-black text-slate-900">
            {scope === 'global' ? "Flux d'Activité Global" : scope === 'zone' ? "Activité de Zone en Direct" : "Mon Historique Terrain"}
          </h3>
          <p className="text-xs text-slate-500 mt-1">Suivi en temps réel des dernières interactions et check-ins GPS.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 text-orange-600 text-xs font-black border border-orange-500/20 shadow-sm backdrop-blur-sm">
          <Activity className="w-4 h-4 animate-pulse" />
          <span>LIVE FEED</span>
        </div>
      </div>

      <div className="flex flex-col gap-6 pl-6 border-l border-white/40">
        {filteredInteractions.length === 0 ? (
          <p className="text-xs text-slate-400 italic py-6">Aucune activité récente.</p>
        ) : (
          filteredInteractions.slice(0, 20).map((int) => {
            const client = clients.find(c => c.id === int.client_id);
            const comm = team.find(t => t.id === int.performed_by);
            
            let badgeStyle = 'bg-slate-50 text-slate-500 border border-slate-200/50';
            if (int.type === 'appel') badgeStyle = 'bg-blue-500/10 text-blue-600 border border-blue-500/20';
            if (int.type === 'whatsapp') badgeStyle = 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20';
            if (int.type === 'terrain') badgeStyle = 'bg-orange-500/10 text-orange-600 border border-orange-500/20';
            if (int.type === 'statut') badgeStyle = 'bg-amber-500/10 text-amber-600 border border-amber-500/20';

            return (
              <div key={int.id} className="relative flex flex-col gap-2 pb-4 text-left">
                {/* Timeline dot */}
                <div className="absolute left-[-31px] top-1.5 w-3.5 h-3.5 rounded-full bg-orange-500 ring-4 ring-slate-50/80 shadow-md" />
                
                <div className="flex items-center gap-2 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                  <span className="bg-white/50 px-2 py-0.5 rounded shadow-sm">{new Date(int.created_at).toLocaleString()}</span>
                  <span>•</span>
                  <span className="text-slate-700">{comm?.name || 'Système'} ({comm?.zone || 'Zone Globale'})</span>
                </div>

                <div className="p-4 rounded-[1.5rem] bg-white/60 backdrop-blur-md border border-white/80 shadow-sm hover:shadow-md transition-all flex items-start gap-4">
                  <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase shrink-0 shadow-sm ${badgeStyle}`}>
                    {int.type}
                  </span>
                  <div className="flex-1 text-sm">
                    <p className="text-slate-800 font-medium leading-relaxed">
                      {int.details} {client && <span className="text-slate-500 ml-1">concernant <strong className="text-slate-900">{client.name}</strong> ({client.company || 'Sans entreprise'})</span>}
                    </p>
                    {int.gps_coordinates && (
                      <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-orange-50 border border-orange-100 text-[10px] text-orange-600 font-bold">
                        <MapPin className="w-3 h-3" /> Géolocalisation GPS vérifiée : {int.gps_coordinates}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
