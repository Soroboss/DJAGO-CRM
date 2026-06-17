import React, { useState } from 'react';
import { useCrmStore } from '../store/crmStore';
import { useToastStore } from '../store/toastStore';
import { Plus, Copy } from 'lucide-react';

export const FormGeneratorModule: React.FC = () => {
  const { forms, addForm } = useCrmStore();
  const { addToast } = useToastStore();
  const [formTitle, setFormTitle] = useState('');
  const [selectedFields, setSelectedFields] = useState<string[]>(['name', 'phone']);

  const handleCreateForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle || selectedFields.length === 0) return;
    
    await addForm(formTitle, selectedFields);
    setFormTitle('');
    setSelectedFields(['name', 'phone']);
    addToast("Nouveau formulaire public généré !", "success");
  };

  const toggleField = (field: string) => {
    setSelectedFields(prev => 
      prev.includes(field) ? prev.filter(f => f !== field) : [...prev, field]
    );
  };

  return (
    <div className="grid lg:grid-cols-3 gap-6 text-left animate-fade-in relative z-10">
      {/* Creator form */}
      <div className="p-6 rounded-[2rem] glass-card glass-panel-hover flex flex-col gap-5">
        <div>
          <h3 className="text-base font-bold text-slate-900">Nouveau Formulaire Public</h3>
          <p className="text-[11px] text-slate-500 mt-1">Configurez un formulaire public pour capturer des prospects.</p>
        </div>

        <form onSubmit={handleCreateForm} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase">Titre du Formulaire</label>
            <input 
              type="text" required placeholder="Ex: Contact Salon Agricole 2026" value={formTitle} onChange={e => setFormTitle(e.target.value)}
              className="p-3 bg-white/40 border border-slate-200/50 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 shadow-sm backdrop-blur-sm"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase">Champs à Activer</label>
            <div className="flex flex-col gap-2 bg-white/30 backdrop-blur-sm p-4 rounded-[1.5rem] border border-white/40 text-xs text-slate-700">
              <label className="flex items-center gap-2.5 cursor-pointer hover:text-slate-900 transition-colors">
                <input type="checkbox" checked={selectedFields.includes('name')} onChange={() => toggleField('name')} className="rounded accent-orange-500 w-4 h-4" />
                <span className="font-medium">Nom complet (Requis)</span>
              </label>
              <label className="flex items-center gap-2.5 cursor-pointer hover:text-slate-900 transition-colors">
                <input type="checkbox" checked={selectedFields.includes('phone')} onChange={() => toggleField('phone')} className="rounded accent-orange-500 w-4 h-4" />
                <span className="font-medium">Téléphone (Requis)</span>
              </label>
              <label className="flex items-center gap-2.5 cursor-pointer hover:text-slate-900 transition-colors">
                <input type="checkbox" checked={selectedFields.includes('company')} onChange={() => toggleField('company')} className="rounded accent-orange-500 w-4 h-4" />
                <span className="font-medium">Nom de l'Entreprise</span>
              </label>
              <label className="flex items-center gap-2.5 cursor-pointer hover:text-slate-900 transition-colors">
                <input type="checkbox" checked={selectedFields.includes('email')} onChange={() => toggleField('email')} className="rounded accent-orange-500 w-4 h-4" />
                <span className="font-medium">Adresse e-mail</span>
              </label>
            </div>
          </div>

          <button type="submit" className="py-3 rounded-xl bg-gradient-to-r from-orange-500 to-orange-400 hover:to-orange-500 text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer mt-2">
            <Plus className="w-4 h-4" />
            <span>Générer le Formulaire</span>
          </button>
        </form>
      </div>

      {/* Live Form Mockup Preview */}
      <div className="p-6 rounded-[2rem] glass-card glass-panel-hover flex flex-col gap-4 relative overflow-hidden">
        {/* Subtle glow for the mockup container */}
        <div className="absolute top-[-20%] right-[-20%] w-[60%] h-[60%] bg-orange-400/10 blur-[80px] rounded-full pointer-events-none"></div>

        <div className="relative z-10">
          <h3 className="text-base font-bold text-slate-900">Aperçu Live du Formulaire</h3>
          <p className="text-[11px] text-slate-500 mt-1">Rendu dynamique public visible par les clients.</p>
        </div>

        <div className="flex-1 bg-white/60 backdrop-blur-md p-6 rounded-[1.5rem] border border-white/60 shadow-lg flex flex-col justify-between min-h-[350px] relative z-10">
          <div className="flex flex-col gap-4">
            <div className="border-b border-slate-200/50 pb-4 mb-2">
              <h4 className="text-sm font-black text-slate-900">{formTitle || "Aperçu de votre formulaire"}</h4>
              <p className="text-[10px] text-slate-500 mt-1">Veuillez remplir les informations suivantes</p>
            </div>

            <div className="flex flex-col gap-3 text-left">
              {selectedFields.includes('name') && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Nom complet *</label>
                  <input type="text" disabled placeholder="M. Konan Jean" className="p-2.5 bg-white/50 border border-slate-200/50 rounded-xl text-xs text-slate-700 shadow-sm" />
                </div>
              )}
              {selectedFields.includes('phone') && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Téléphone *</label>
                  <input type="tel" disabled placeholder="+225 0707..." className="p-2.5 bg-white/50 border border-slate-200/50 rounded-xl text-xs text-slate-700 shadow-sm" />
                </div>
              )}
              {selectedFields.includes('company') && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Entreprise</label>
                  <input type="text" disabled placeholder="Cacao Trading Inc." className="p-2.5 bg-white/50 border border-slate-200/50 rounded-xl text-xs text-slate-700 shadow-sm" />
                </div>
              )}
              {selectedFields.includes('email') && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Adresse e-mail</label>
                  <input type="email" disabled placeholder="jean@cacao.ci" className="p-2.5 bg-white/50 border border-slate-200/50 rounded-xl text-xs text-slate-700 shadow-sm" />
                </div>
              )}
            </div>
          </div>

          <button disabled className="w-full mt-6 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-orange-400 text-white text-xs font-bold shadow-md transition-all opacity-70">
            Envoyer ma demande
          </button>
        </div>
      </div>

      {/* Existing forms list */}
      <div className="p-6 rounded-[2rem] glass-card glass-panel-hover flex flex-col gap-4">
        <h3 className="text-base font-bold text-slate-900">Formulaires actifs</h3>
        <div className="flex flex-col gap-4 overflow-y-auto max-h-[400px] scrollbar-none pr-1">
          {forms.length === 0 ? (
            <p className="text-xs text-slate-400 italic py-6 text-center">Aucun formulaire configuré.</p>
          ) : (
            forms.map((f, idx) => {
              const simulatedSubmissions = 12 + (idx * 14);
              const simulatedConversion = 15 + (idx * 3.4);
              const linkUrl = `https://forms.djagocrm.ci/f/${f.id}`;
              const embedHtml = `<iframe src="${linkUrl}" width="100%" height="450" frameborder="0"></iframe>`;

              return (
                <div key={f.id} className="p-4 rounded-[1.5rem] bg-white/40 backdrop-blur-md border border-white/50 shadow-sm flex flex-col gap-4 hover:shadow-md transition-all">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-sm font-extrabold text-slate-800">{f.title}</h4>
                      <p className="text-[10px] text-slate-500 mt-1 font-medium">Champs : {f.fields.join(', ')}</p>
                    </div>
                    <span className="text-[9px] bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full font-black uppercase shadow-sm">
                      Actif
                    </span>
                  </div>

                  {/* Performance metrics */}
                  <div className="grid grid-cols-2 gap-3 text-[10px] bg-white/30 backdrop-blur-sm p-3 rounded-xl border border-white/40 shadow-inner">
                    <div>
                      <span className="text-slate-500 font-bold block mb-0.5 tracking-wider">SOUMISSIONS</span>
                      <span className="font-black text-slate-800 text-xs">{simulatedSubmissions} leads</span>
                    </div>
                    <div>
                      <span className="text-slate-500 font-bold block mb-0.5 tracking-wider">CONVERSION</span>
                      <span className="font-black text-emerald-600 text-xs">{simulatedConversion.toFixed(1)}%</span>
                    </div>
                  </div>

                  {/* Public Link Copy */}
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Lien public d'acquisition</span>
                    <div className="flex gap-1.5">
                      <input 
                        type="text" readOnly value={linkUrl}
                        className="p-2 bg-white/50 backdrop-blur-sm border border-slate-200/50 rounded-lg text-[10px] text-emerald-600 font-bold cursor-text w-full focus:outline-none"
                      />
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(linkUrl);
                          addToast("Lien copié dans le presse-papiers !", "success");
                        }}
                        className="p-2 rounded-lg bg-white/60 border border-slate-200/50 text-slate-500 hover:text-emerald-600 hover:bg-white shadow-sm transition-all cursor-pointer"
                        title="Copier le lien"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Embed iframe Copy */}
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Intégration iframe Web</span>
                    <div className="flex gap-1.5">
                      <input 
                        type="text" readOnly value={embedHtml}
                        className="p-2 bg-white/50 backdrop-blur-sm border border-slate-200/50 rounded-lg text-[10px] text-slate-500 cursor-text w-full focus:outline-none font-mono truncate"
                      />
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(embedHtml);
                          addToast("Code iframe copié !", "success");
                        }}
                        className="p-2 rounded-lg bg-white/60 border border-slate-200/50 text-slate-500 hover:text-orange-600 hover:bg-white shadow-sm transition-all cursor-pointer"
                        title="Copier le code d'intégration"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
