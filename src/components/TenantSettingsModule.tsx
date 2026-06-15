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
    <div className="space-y-6 animate-fade-in text-left">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Paramètres de l'Entreprise</h2>
        <p className="text-slate-500">Configurez les informations de contact qui apparaîtront dans vos modèles de messages commerciaux (WhatsApp, Email).</p>
      </div>

      <form onSubmit={handleSave} className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200 max-w-2xl">
        <div className="space-y-6">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <Building className="w-4 h-4 text-brand-orange" />
              Nom de l'Entreprise
            </label>
            <input
              type="text"
              value={orgName}
              disabled
              className="px-4 py-3 rounded-xl bg-slate-100 border border-slate-200 text-slate-500 cursor-not-allowed"
              title="Le nom de l'entreprise est défini lors de l'inscription."
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-brand-orange" />
              URL du Logo (Optionnel)
            </label>
            <input
              type="url"
              placeholder="https://mon-site.com/logo.png"
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
              className="px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-brand-orange text-slate-800"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <Mail className="w-4 h-4 text-brand-orange" />
                Email de Contact
              </label>
              <input
                type="email"
                placeholder="contact@mon-entreprise.com"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                className="px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-brand-orange text-slate-800"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <Phone className="w-4 h-4 text-brand-orange" />
                Téléphone de Contact
              </label>
              <input
                type="tel"
                placeholder="+225 0102030405"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                className="px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-brand-orange text-slate-800"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-slate-800 transition-colors disabled:opacity-50"
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
