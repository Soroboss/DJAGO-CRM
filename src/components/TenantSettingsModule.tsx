import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { Building, Phone, Mail, Save, Image as ImageIcon } from 'lucide-react';

export const TenantSettingsModule: React.FC = () => {
  const { organization, updateOrganizationSettings } = useAuthStore();
  const [orgName, setOrgName] = useState(organization?.name || '');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (organization?.settings) {
      setContactEmail(organization.settings.contact_email || '');
      setContactPhone(organization.settings.contact_phone || '');
      setLogoUrl(organization.settings.logo_url || '');
    }
  }, [organization]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    await updateOrganizationSettings({
      contact_email: contactEmail,
      contact_phone: contactPhone,
      logo_url: logoUrl
    });
    setIsSaving(false);
  };

  return (
    <div className="space-y-8 animate-fade-in text-left relative z-10 max-w-2xl mx-auto">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">Paramètres de l'Entreprise</h2>
        <p className="text-slate-500 font-medium">Configurez les informations de contact qui apparaîtront dans vos modèles de messages commerciaux (WhatsApp, Email).</p>
      </div>

      <form onSubmit={handleSave} className="rounded-[2rem] glass-card glass-panel-hover p-8 md:p-10 shadow-sm border border-white/40 transition-all flex flex-col gap-6">
        <div className="space-y-6">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
              <Building className="w-4 h-4 text-orange-500" />
              Nom de l'Entreprise
            </label>
            <input
              type="text"
              value={orgName}
              disabled
              className="px-4 py-3.5 rounded-xl bg-slate-100/50 backdrop-blur-sm border border-slate-200/50 text-slate-400 cursor-not-allowed shadow-inner font-medium"
              title="Le nom de l'entreprise est défini lors de l'inscription."
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-orange-500" />
              URL du Logo (Optionnel)
            </label>
            <input
              type="url"
              placeholder="https://mon-site.com/logo.png"
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
              className="px-4 py-3.5 rounded-xl bg-white/60 backdrop-blur-sm border border-white/40 focus:outline-none focus:border-brand-orange focus:ring-2 focus:ring-orange-500/20 text-sm text-slate-800 shadow-sm transition-all"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                <Mail className="w-4 h-4 text-orange-500" />
                Email de Contact
              </label>
              <input
                type="email"
                placeholder="contact@mon-entreprise.com"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                className="px-4 py-3.5 rounded-xl bg-white/60 backdrop-blur-sm border border-white/40 focus:outline-none focus:border-brand-orange focus:ring-2 focus:ring-orange-500/20 text-sm text-slate-800 shadow-sm transition-all"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                <Phone className="w-4 h-4 text-orange-500" />
                Téléphone de Contact
              </label>
              <input
                type="tel"
                placeholder="+225 0102030405"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                className="px-4 py-3.5 rounded-xl bg-white/60 backdrop-blur-sm border border-white/40 focus:outline-none focus:border-brand-orange focus:ring-2 focus:ring-orange-500/20 text-sm text-slate-800 shadow-sm transition-all"
              />
            </div>
          </div>

          <div className="pt-6 mt-4 border-t border-slate-200/50 flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 bg-gradient-to-r from-slate-900 to-slate-800 text-white px-6 py-3.5 rounded-xl font-bold hover:to-slate-900 shadow-lg hover:shadow-xl transition-all disabled:opacity-50 cursor-pointer"
            >
              <Save className="w-5 h-5" />
              {isSaving ? 'Enregistrement...' : 'Enregistrer les Paramètres'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
