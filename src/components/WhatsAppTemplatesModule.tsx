import React, { useState } from 'react';
import { useCrmStore } from '../store/crmStore';
import { useToastStore } from '../store/toastStore';
import { MessageSquare, Plus, Trash2 } from 'lucide-react';

export const WhatsAppTemplatesModule: React.FC = () => {
  const { whatsappTemplates, addWhatsAppTemplate, deleteWhatsAppTemplate } = useCrmStore();
  const { addToast } = useToastStore();

  const [newTemplateName, setNewTemplateName] = useState('');
  const [newTemplateText, setNewTemplateText] = useState('');

  const handleAddTemplate = async () => {
    if (!newTemplateName.trim() || !newTemplateText.trim()) return;
    await addWhatsAppTemplate({ name: newTemplateName, text: newTemplateText });
    setNewTemplateName('');
    setNewTemplateText('');
    addToast("Modèle WhatsApp ajouté !", "success");
  };

  const handleDeleteTemplate = async (id: string, name: string) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer le modèle "${name}" ?`)) {
      await deleteWhatsAppTemplate(id);
      addToast("Modèle supprimé", "info");
    }
  };

  return (
    <div className="p-6 rounded-[2rem] glass-card glass-panel-hover text-left max-w-3xl mx-auto flex flex-col gap-8 animate-fade-in relative z-10">
      <div className="flex flex-col gap-2">
        <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
          <MessageSquare className="w-6 h-6 text-emerald-500" />
          Modèles WhatsApp
        </h3>
        <p className="text-sm text-slate-500 font-medium">
          Gérez les modèles utilisés par l'équipe commerciale. Variables autorisées :{' '}
          <span className="font-mono text-emerald-600 bg-emerald-500/10 px-1.5 py-0.5 rounded text-xs">{'{{nom_client}}'}</span>,{' '}
          <span className="font-mono text-emerald-600 bg-emerald-500/10 px-1.5 py-0.5 rounded text-xs">{'{{entreprise}}'}</span>,{' '}
          <span className="font-mono text-emerald-600 bg-emerald-500/10 px-1.5 py-0.5 rounded text-xs">{'{{nom_commercial}}'}</span>,{' '}
          <span className="font-mono text-emerald-600 bg-emerald-500/10 px-1.5 py-0.5 rounded text-xs">{'{{service_article}}'}</span>
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {whatsappTemplates.length === 0 ? (
          <p className="text-sm text-slate-400 italic bg-white/40 p-4 rounded-xl border border-white/50 text-center">
            Aucun modèle configuré.
          </p>
        ) : (
          whatsappTemplates.map(t => (
            <div key={t.id} className="p-5 rounded-2xl bg-white/60 backdrop-blur-sm border border-white/40 shadow-sm hover:shadow-md transition-shadow flex flex-col gap-3 group">
              <div className="flex justify-between items-center">
                <span className="text-base font-bold text-slate-800">{t.name}</span>
                <button 
                  onClick={() => handleDeleteTemplate(t.id, t.name)} 
                  className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                  title="Supprimer ce modèle"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="text-sm text-slate-600 font-mono bg-slate-100/50 p-4 rounded-xl border border-slate-200/50 leading-relaxed whitespace-pre-wrap">
                {t.text}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="flex flex-col gap-5 mt-4 pt-6 border-t border-slate-200/50">
        <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Plus className="w-4 h-4 text-emerald-500" />
          Ajouter un nouveau modèle
        </h4>
        <div className="flex flex-col gap-2">
          <input
            placeholder="Nom du modèle (ex: Relance Impayé)"
            value={newTemplateName}
            onChange={(e) => setNewTemplateName(e.target.value)}
            className="w-full p-4 rounded-xl bg-white/60 backdrop-blur-sm border border-white/40 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 text-sm text-slate-800 shadow-sm placeholder:text-slate-400 font-medium"
          />
        </div>
        <div className="flex flex-col gap-2">
          <textarea
            rows={4}
            placeholder="Bonjour {{nom_client}}, nous vous contactons concernant..."
            value={newTemplateText}
            onChange={(e) => setNewTemplateText(e.target.value)}
            className="w-full p-4 rounded-xl bg-white/60 backdrop-blur-sm border border-white/40 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 text-sm text-slate-800 shadow-sm placeholder:text-slate-400 font-medium resize-y"
          />
        </div>

        <button
          onClick={handleAddTemplate}
          className="w-full py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-400 hover:to-emerald-500 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2 mt-2"
        >
          <MessageSquare className="w-4 h-4" />
          Enregistrer le modèle
        </button>
      </div>
    </div>
  );
};
