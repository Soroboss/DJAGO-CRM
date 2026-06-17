import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { Upload, Settings, Building2, MapPin } from 'lucide-react';

export const TenantSettingsModule: React.FC = () => {
  const { organization, updateOrganizationSettings } = useAuthStore();
  
  // States
  const [orgName, setOrgName] = useState(organization?.name || '');
  const [legalName, setLegalName] = useState('');
  const [slogan, setSlogan] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [billingEmail, setBillingEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [whatsappPhone, setWhatsappPhone] = useState('');
  const [website, setWebsite] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('Côte d\'Ivoire');
  const [rccm, setRccm] = useState('');
  const [niu, setNiu] = useState('');
  const [bankName, setBankName] = useState('');
  const [bankRib, setBankRib] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (organization?.settings) {
      const s = organization.settings;
      setLegalName(s.legal_name || '');
      setSlogan(s.slogan || '');
      setContactEmail(s.contact_email || '');
      setBillingEmail(s.billing_email || '');
      setContactPhone(s.contact_phone || '');
      setWhatsappPhone(s.whatsapp_phone || '');
      setWebsite(s.website || '');
      setAddress(s.address || '');
      setCity(s.city || '');
      setCountry(s.country || 'Côte d\'Ivoire');
      setRccm(s.rccm || '');
      setNiu(s.niu || '');
      setBankName(s.bank_name || '');
      setBankRib(s.bank_rib || '');
      setLogoUrl(s.logo_url || '');
    }
  }, [organization]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    await updateOrganizationSettings({
      legal_name: legalName,
      slogan,
      contact_email: contactEmail,
      billing_email: billingEmail,
      contact_phone: contactPhone,
      whatsapp_phone: whatsappPhone,
      website,
      address,
      city,
      country,
      rccm,
      niu,
      bank_name: bankName,
      bank_rib: bankRib,
      logo_url: logoUrl
    });
    setIsSaving(false);
  };

  // Calculate completion
  const requiredFields = [orgName, contactPhone, contactEmail, address, rccm, bankRib];
  const completedFields = requiredFields.filter(f => f && f.trim().length > 0).length;
  const totalFields = requiredFields.length;

  return (
    <div className="space-y-8 animate-fade-in text-left max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Paramètres entreprise</h2>
          <p className="text-slate-500 text-sm mt-1">Logo, coordonnées, RCCM et RIB — affichés sur vos documents</p>
        </div>
        <button className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-sm self-start md:self-auto">
          Gérer l'équipe
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-bold text-slate-900">Entreprise</span>
            <Settings className="w-4 h-4 text-slate-400" />
          </div>
          <p className="font-bold text-slate-900 text-lg uppercase leading-tight truncate">{orgName || 'Non défini'}</p>
        </div>
        
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <span className="text-xs font-bold text-slate-900 mb-2">Profil complété</span>
          <div>
            <p className="font-bold text-emerald-600 text-2xl leading-none">{completedFields}/{totalFields}</p>
            <p className="text-xs text-slate-500 mt-1">Champs clés renseignés</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <span className="text-xs font-bold text-slate-900 mb-2">Contact</span>
          <div>
            <p className="font-bold text-slate-900 text-lg leading-tight truncate">{contactPhone || '—'}</p>
            <p className="text-xs text-slate-500 mt-1 truncate">{contactEmail || '—'}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <span className="text-xs font-bold text-slate-900 mb-2">RCCM</span>
          <div>
            <p className="font-bold text-slate-900 text-lg leading-tight truncate">{rccm || '—'}</p>
            <p className="text-xs text-slate-500 mt-1 truncate">{city ? `${city} - ${address?.split(' ')[0]}` : '—'}</p>
          </div>
        </div>
      </div>

      {/* Main Form Box */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-100">
          <h3 className="text-xl font-bold text-slate-900">Informations de l'entreprise</h3>
          <p className="text-sm text-slate-500 mt-1">Ces données apparaissent sur les contrats PDF, reçus et communications clients.</p>
        </div>

        <form onSubmit={handleSave} className="p-8 space-y-10">
          
          {/* Section: Identité visuelle */}
          <div className="space-y-4">
            <h4 className="text-base font-bold text-slate-900">Identité visuelle</h4>
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden shrink-0">
                {logoUrl ? (
                  <img src={logoUrl} alt="Logo" className="w-full h-full object-contain p-2" />
                ) : (
                  <Building2 className="w-8 h-8 text-slate-300" />
                )}
              </div>
              <div className="flex flex-col gap-2">
                <button type="button" className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-sm font-bold text-slate-700 bg-white hover:bg-slate-50 transition-colors w-fit">
                  <Upload className="w-4 h-4" />
                  Changer le logo
                </button>
                <p className="text-xs text-slate-500">PNG, JPEG ou WebP — max 5 Mo</p>
                {/* Temporary input since there is no actual file upload implemented right now */}
                <input 
                  type="url" 
                  placeholder="Ou entrez l'URL de votre logo" 
                  value={logoUrl} 
                  onChange={(e) => setLogoUrl(e.target.value)}
                  className="mt-2 text-xs p-2 border border-slate-200 rounded-md focus:outline-none focus:border-brand-orange w-full max-w-xs"
                />
              </div>
            </div>
          </div>

          <div className="space-y-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-bold text-slate-900">Nom commercial *</label>
              <input
                type="text"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 text-sm text-slate-900"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-bold text-slate-900">Raison sociale (sur contrats)</label>
              <input
                type="text"
                value={legalName}
                onChange={(e) => setLegalName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 text-sm text-slate-900"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-bold text-slate-900">Slogan / activité</label>
              <input
                type="text"
                value={slogan}
                onChange={(e) => setSlogan(e.target.value)}
                placeholder="Lotisseur & promoteur immobilier"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 text-sm text-slate-900"
              />
            </div>
          </div>

          {/* Section: Coordonnées */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h4 className="text-base font-bold text-slate-900">Coordonnées</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-bold text-slate-900">E-mail contact</label>
                <input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 text-sm text-slate-900"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-bold text-slate-900">E-mail facturation</label>
                <input
                  type="email"
                  value={billingEmail}
                  onChange={(e) => setBillingEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 text-sm text-slate-900"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-bold text-slate-900">Téléphone</label>
                <input
                  type="tel"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 text-sm text-slate-900"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-bold text-slate-900">WhatsApp</label>
                <input
                  type="tel"
                  value={whatsappPhone}
                  onChange={(e) => setWhatsappPhone(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 text-sm text-slate-900"
                />
              </div>
              <div className="flex flex-col gap-1.5 md:col-span-2">
                <label className="text-sm font-bold text-slate-900">Site web</label>
                <input
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 text-sm text-slate-900"
                />
              </div>
            </div>
          </div>

          {/* Section: Siège & localisation */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h4 className="text-base font-bold text-slate-900">Siège & localisation</h4>
            
            <div className="space-y-5">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-bold text-slate-900">Adresse</label>
                <textarea
                  rows={3}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 text-sm text-slate-900 resize-none"
                ></textarea>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-bold text-slate-900">Ville</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 text-sm text-slate-900"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-bold text-slate-900">Pays</label>
                  <input
                    type="text"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 text-sm text-slate-900"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section: Informations légales & bancaires */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h4 className="text-base font-bold text-slate-900">Informations légales & bancaires</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-bold text-slate-900">RCCM</label>
                <input
                  type="text"
                  value={rccm}
                  onChange={(e) => setRccm(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 text-sm text-slate-900"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-bold text-slate-900">NIU / Identifiant fiscal</label>
                <input
                  type="text"
                  value={niu}
                  onChange={(e) => setNiu(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 text-sm text-slate-900"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-bold text-slate-900">Banque</label>
                <input
                  type="text"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 text-sm text-slate-900"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-bold text-slate-900">RIB / N° de compte</label>
                <input
                  type="text"
                  value={bankRib}
                  onChange={(e) => setBankRib(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 text-sm text-slate-900"
                />
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100">
            <button
              type="submit"
              disabled={isSaving}
              className="bg-emerald-700 text-white px-6 py-3 rounded-lg font-bold hover:bg-emerald-800 transition-colors disabled:opacity-50 text-sm"
            >
              {isSaving ? 'Enregistrement...' : 'Enregistrer les paramètres'}
            </button>
          </div>
          
        </form>
      </div>
    </div>
  );
};
