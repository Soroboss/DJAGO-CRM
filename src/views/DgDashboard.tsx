import React, { useState, useEffect } from 'react';
import { useCrmStore } from '../store/crmStore';
import { useAuthStore, type UserRole } from '../store/authStore';
import { useToastStore } from '../store/toastStore';
import { NetworkBadge } from '../components/NetworkBadge';
import { 
  DollarSign, Users, Briefcase, Award, Plus, Search, 
  MapPin, Eye, Calendar, LogOut, ShieldAlert, CheckCircle2, X,
  Activity, LayoutDashboard, ChevronRight, ChevronLeft, BarChart3,
  ShoppingCart, FileText, ClipboardList, CheckSquare, Settings, Copy, ExternalLink
} from 'lucide-react';
import { type LocalClient } from '../db/localDb';

export const DgDashboard: React.FC = () => {
  const { user, logout, team, createTeammate, organization, industryConfig } = useAuthStore();
  const vocab = industryConfig?.vocabulary || { client: "Client", clients: "Clients", transaction: "Transaction", transactions: "Transactions", agent: "Agent", agents: "Agents" };
  const modules = organization?.active_modules || industryConfig?.defaultModules || { sales: true, support: true, delivery: true, field_tracking: true, inventory: false };
  const { addToast } = useToastStore();
  const { 
    clients, interactions, whatsappTemplates, addWhatsAppTemplate, updateWhatsAppTemplate, deleteWhatsAppTemplate, updateClientStatus,
    forms, addForm, transactions, orders, updateOrderStatus, contacts, tickets
  } = useCrmStore();

  const [activeTab, setActiveTab] = useState<'kpis' | 'kanban' | 'feed' | 'admin' | 'audit' | 'templates' | 'forms' | 'transactions' | 'orders'>('kpis');
  const [timeFilter, setTimeFilter] = useState<'today' | 'week' | 'month' | 'all'>('all');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // V2 WhatsApp templates editor state
  const [newTemplateName, setNewTemplateName] = useState('');
  const [newTemplateText, setNewTemplateText] = useState('');

  // Form builder state
  const [formTitle, setFormTitle] = useState('');
  const [selectedFields, setSelectedFields] = useState<string[]>(['name', 'phone']);

  // Selected client for audit modal
  const [selectedClientForModal, setSelectedClientForModal] = useState<LocalClient | null>(null);

  const handleAddTemplate = async () => {
    if (!newTemplateName.trim() || !newTemplateText.trim()) return;
    await addWhatsAppTemplate({ name: newTemplateName, text: newTemplateText });
    setNewTemplateName('');
    setNewTemplateText('');
  };

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Admin form state
  const [newCollabName, setNewCollabName] = useState('');
  const [newCollabEmail, setNewCollabEmail] = useState('');
  const [newCollabRole, setNewCollabRole] = useState<UserRole>('commercial');
  const [newCollabZone, setNewCollabZone] = useState('Ouest');
  const [newCollabManager, setNewCollabManager] = useState('');
  const [newCollabPass, setNewCollabPass] = useState('djago225');

  // Audit state
  const [selectedCommercialId, setSelectedCommercialId] = useState<string>('');

  // Time filtering logic
  const isWithinTimeFilter = (dateString?: string) => {
    if (timeFilter === 'all' || !dateString) return true;
    const date = new Date(dateString);
    const now = new Date();
    if (timeFilter === 'today') {
      return date.toDateString() === now.toDateString();
    }
    if (timeFilter === 'week') {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(now.getDate() - 7);
      return date >= oneWeekAgo;
    }
    if (timeFilter === 'month') {
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    }
    return true;
  };

  const filteredOrders = orders.filter(o => isWithinTimeFilter((o as any).created_at));
  const filteredTransactions = transactions.filter(t => isWithinTimeFilter((t as any).created_at));
  const filteredClients = clients.filter(c => isWithinTimeFilter((c as any).created_at));

  // Financial calculations
  const totalRevenue = filteredOrders.filter(o => o.payment_status === 'paid').reduce((acc, o) => acc + o.total_amount, 0);
  const pipelineValue = filteredTransactions.filter(t => t.stage !== 'lost' && t.stage !== 'won').reduce((acc, t) => acc + t.amount, 0);

  const deliveredClients = filteredClients.filter(c => c.status === 'Livré & Adopté');
  const totalSoldOrDelivered = filteredClients.filter(c => ['Vendu', 'En cours de livraison', 'Livré & Adopté'].includes(c.status));
  const retentionRate = totalSoldOrDelivered.length > 0 
    ? Math.round((deliveredClients.length / totalSoldOrDelivered.length) * 100) 
    : 100;

  const handleCreateCollab = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCollabName || !newCollabEmail) return;
    
    await createTeammate(
      newCollabName,
      newCollabEmail,
      newCollabRole,
      newCollabZone,
      newCollabManager || undefined
    );

    setNewCollabName('');
    setNewCollabEmail('');
    setNewCollabRole('commercial');
    setNewCollabManager('');
  };

  const getCommercialName = (id?: string) => {
    if (!id) return 'Non assigné';
    const found = team.find(t => t.id === id);
    return found ? found.name : 'Inconnu';
  };

  const handleCreateForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle) return;
    await addForm(formTitle, selectedFields);
    setFormTitle('');
    setSelectedFields(['name', 'phone']);
  };

  const toggleField = (field: string) => {
    if (selectedFields.includes(field)) {
      setSelectedFields(selectedFields.filter(f => f !== field));
    } else {
      setSelectedFields([...selectedFields, field]);
    }
  };

  const filteredInteractions = selectedCommercialId
    ? interactions.filter(i => i.performed_by === selectedCommercialId)
    : interactions;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col md:flex-row">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200/60 p-6 h-screen sticky top-0 justify-between shrink-0">
        <div className="flex flex-col gap-8">
          {/* Logo & Info */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-orange to-brand-emerald flex items-center justify-center font-extrabold text-white text-xl shadow-lg shadow-brand-orange/20">
              DJ
            </div>
            <div className="text-left">
              <h2 className="text-lg font-black text-slate-900 leading-tight">DjagoCRM</h2>
              <span className="text-[10px] bg-brand-orange/15 text-brand-orange px-2 py-0.5 rounded font-bold uppercase tracking-wider">DG</span>
            </div>
          </div>

          {/* User profile card */}
          <div className="p-3.5 rounded-xl bg-slate-50/50 border border-slate-200/85 text-left">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Connecté en tant que</p>
            <p className="text-sm font-bold text-slate-800 mt-1 truncate">{user?.name}</p>
            <p className="text-xs text-slate-400 truncate">{user?.email}</p>
          </div>

          {/* Vertical Menu Modules */}
          <nav className="flex flex-col gap-1.5 overflow-y-auto max-h-[50vh] scrollbar-none">
            <button
              onClick={() => setActiveTab('kpis')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                activeTab === 'kpis'
                  ? 'bg-brand-orange text-slate-900 shadow-md'
                  : 'text-slate-400 hover:text-slate-800 hover:bg-slate-50/30'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Vue d'Ensemble</span>
            </button>

            {modules.sales && (<button
              onClick={() => setActiveTab('transactions')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                activeTab === 'transactions'
                  ? 'bg-brand-orange text-slate-900 shadow-md'
                  : 'text-slate-400 hover:text-slate-800 hover:bg-slate-50/30'
              }`}
            >
              <ClipboardList className="w-4 h-4" />
              <span>{vocab.transactions}</span>
            </button>)}

            {modules.delivery && (<button
              onClick={() => setActiveTab('orders')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                activeTab === 'orders'
                  ? 'bg-brand-orange text-slate-900 shadow-md'
                  : 'text-slate-400 hover:text-slate-800 hover:bg-slate-50/30'
              }`}
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Logistique Commandes</span>
            </button>)}

            <button
              onClick={() => setActiveTab('forms')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                activeTab === 'forms'
                  ? 'bg-brand-orange text-slate-900 shadow-md'
                  : 'text-slate-400 hover:text-slate-800 hover:bg-slate-50/30'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Générateur Formulaire</span>
            </button>

            {modules.sales && (<button
              onClick={() => setActiveTab('kanban')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                activeTab === 'kanban'
                  ? 'bg-brand-orange text-slate-900 shadow-md'
                  : 'text-slate-400 hover:text-slate-800 hover:bg-slate-50/30'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Pipeline Kanban</span>
            </button>)}

            <button
              onClick={() => setActiveTab('feed')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                activeTab === 'feed'
                  ? 'bg-brand-orange text-slate-900 shadow-md'
                  : 'text-slate-400 hover:text-slate-800 hover:bg-slate-50/30'
              }`}
            >
              <Activity className="w-4 h-4" />
              <span>Fil d'Activité</span>
            </button>

            <button
              onClick={() => setActiveTab('admin')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                activeTab === 'admin'
                  ? 'bg-brand-orange text-slate-900 shadow-md'
                  : 'text-slate-400 hover:text-slate-800 hover:bg-slate-50/30'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Collaborateurs</span>
            </button>

            <button
              onClick={() => setActiveTab('audit')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                activeTab === 'audit'
                  ? 'bg-brand-orange text-slate-900 shadow-md'
                  : 'text-slate-400 hover:text-slate-800 hover:bg-slate-50/30'
              }`}
            >
              <Search className="w-4 h-4" />
              <span>Audit à 360°</span>
            </button>

            <button
              onClick={() => setActiveTab('templates')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                activeTab === 'templates'
                  ? 'bg-brand-orange text-slate-900 shadow-md'
                  : 'text-slate-400 hover:text-slate-800 hover:bg-slate-50/30'
              }`}
            >
              <Briefcase className="w-4 h-4" />
              <span>WhatsApp Modèles</span>
            </button>
          </nav>
        </div>

        {/* Footer & Actions */}
        <div className="flex flex-col gap-4">
          <div className="flex justify-center">
            <NetworkBadge />
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-slate-50 border border-slate-200 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20 text-sm font-bold text-slate-700 transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Se Déconnecter</span>
          </button>
        </div>
      </aside>

      {/* Top Header for Mobile */}
      <header className="md:hidden bg-white border-b border-slate-200/60 px-4 py-3 sticky top-0 z-35 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-orange to-brand-emerald flex items-center justify-center font-black text-white text-md">
            DJ
          </div>
          <span className="text-md font-bold text-slate-900">DjagoCRM DG</span>
        </div>
        <div className="flex items-center gap-2">
          <NetworkBadge />
          <button
            onClick={logout}
            className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-400 hover:text-red-400"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Mobile Horizontal Navigation Tabs */}
      <div className="md:hidden flex overflow-x-auto bg-white/40 border-b border-slate-200/40 p-2 gap-1.5 scrollbar-none shrink-0">
        {(['kpis', 'transactions', 'orders', 'forms', 'kanban', 'feed', 'admin', 'audit', 'templates'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-none px-4 py-2 rounded-lg text-xs font-bold transition-all uppercase ${
              activeTab === tab ? 'bg-brand-orange text-slate-900' : 'text-slate-400 bg-slate-950/30'
            }`}
          >
            {tab === 'kpis' ? 'KPIs' : tab === 'transactions' ? 'Deals' : tab === 'orders' ? 'Commandes' : tab === 'forms' ? 'Forms' : tab}
          </button>
        ))}
      </div>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto px-6 py-8 md:py-10 max-w-7xl mx-auto w-full">
        {/* Module Header Title */}
        <div className="mb-8 border-b border-slate-200/50 pb-5 text-left animate-fade-in">
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 leading-tight !my-0">
            {activeTab === 'kpis' && "Vue d'Ensemble & KPIs"}
            {activeTab === 'transactions' && "{vocab.transactions} & Pipeline< National"}
            {activeTab === 'orders' && "Commandes & Factures Nationales"}
            {activeTab === 'forms' && "Générateur de Formulaires de Capture"}
            {activeTab === 'kanban' && "Pipeline Kanban"}
            {activeTab === 'feed' && "Fil d'Activité Terrain"}
            {activeTab === 'admin' && "Recrutement & Collaborateurs"}
            {activeTab === 'audit' && "Audit & Suivi à 360°"}
            {activeTab === 'templates' && "Modèles WhatsApp de Relance"}
          </h1>
          <p className="text-xs md:text-sm text-slate-400 mt-1">
            {activeTab === 'kpis' && "Supervision générale de l'activité commerciale et du chiffre d'affaires cumulé."}
            {activeTab === 'transactions' && "Outils d'analyses financières et opportunités d'affaires dans tout le pays."}
            {activeTab === 'orders' && "Supervision des bons de commande nationaux et de la logistique de livraison."}
            {activeTab === 'forms' && "Créez des formulaires publics pour générer automatiquement des prospects dans le CRM."}
            {activeTab === 'kanban' && "Gestion et progression visuelle des prospects à travers les différentes étapes de vente."}
            {activeTab === 'feed' && "Suivi en temps réel des dernières interactions, check-ins GPS et rapports de visite."}
            {activeTab === 'admin' && "Recrutez de nouveaux managers et commerciaux et gérez la répartition géographique."}
            {activeTab === 'audit' && "Inspectez en détail les relances téléphoniques, WhatsApp et terrain effectuées par commercial."}
            {activeTab === 'templates' && "Éditez et configurez les modèles d'accroche WhatsApp globaux pour vos équipes."}
          </p>
        </div>

        {/* Vue d'ensemble */}
        {activeTab === 'kpis' && (
          <div className="flex flex-col gap-8 animate-fade-in text-left">
            {/* Time Filters UI */}
            <div className="flex gap-2 p-1.5 bg-slate-50 border border-slate-200 rounded-xl w-fit">
              {(['today', 'week', 'month', 'all'] as const).map((tf) => (
                <button
                  key={tf}
                  onClick={() => setTimeFilter(tf)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all uppercase ${
                    timeFilter === tf 
                      ? 'bg-brand-orange text-slate-900 shadow-md' 
                      : 'text-slate-400 hover:text-slate-800 hover:bg-slate-100'
                  }`}
                >
                  {tf === 'today' ? "Aujourd'hui" : tf === 'week' ? 'Cette semaine' : tf === 'month' ? 'Ce mois' : 'Global'}
                </button>
              ))}
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="p-6 rounded-2xl bg-slate-950/45 border border-slate-200 flex items-center justify-between shadow-xl">
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Chiffre d'Affaires</span>
                  <h3 className="text-2xl font-black text-slate-900 mt-1.5">
                    {totalRevenue.toLocaleString()} <span className="text-sm font-bold text-brand-orange">FCFA</span>
                  </h3>
                  <p className="text-[10px] text-brand-emerald font-semibold mt-1">Sur contrats conclus & livrés</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-brand-orange/15 text-brand-orange flex items-center justify-center border border-brand-orange/10">
                  <DollarSign className="w-6 h-6" />
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-slate-950/45 border border-slate-200 flex items-center justify-between shadow-xl">
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Pipeline Négociation</span>
                  <h3 className="text-2xl font-black text-slate-900 mt-1.5">
                    {pipelineValue.toLocaleString()} <span className="text-sm font-bold text-slate-400">FCFA</span>
                  </h3>
                  <p className="text-[10px] text-slate-400 mt-1">Potentiel de signature proche</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center border border-slate-200">
                  <Briefcase className="w-6 h-6" />
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-slate-950/45 border border-slate-200 flex items-center justify-between shadow-xl">
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{vocab.agents} Recrutés</span>
                  <h3 className="text-2xl font-black text-slate-900 mt-1.5">
                    {team.filter(t => t.role === 'commercial').length} <span className="text-sm font-bold text-slate-400">Agents</span>
                  </h3>
                  <p className="text-[10px] text-slate-400 mt-1">Répartis sur 4 zones géographiques</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-blue-500/15 text-blue-400 flex items-center justify-center border border-blue-500/10">
                  <Users className="w-6 h-6" />
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-slate-950/45 border border-slate-200 flex items-center justify-between shadow-xl">
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Rétention {vocab.client}</span>
                  <h3 className="text-2xl font-black text-brand-emerald mt-1.5 font-mono">
                    {retentionRate}%
                  </h3>
                  <p className="text-[10px] text-slate-400 mt-1">Taux d'adoption après livraison</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-brand-emerald/15 text-brand-emerald flex items-center justify-center border border-brand-emerald/10">
                  <Award className="w-6 h-6" />
                </div>
              </div>
            </div>

            {/* Executive Profitability, Speed & Intelligence Control Panel */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Box 1: Profitability & Unit Economics */}
              <div className="p-6 rounded-2xl bg-white border border-slate-200 flex flex-col gap-4 shadow-xl">
                <div className="flex justify-between items-center border-b border-slate-850 pb-3">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <DollarSign className="w-4 h-4 text-brand-orange" />
                    <span>Rentabilité & Unit Economics</span>
                  </h4>
                  <span className="text-[9px] bg-brand-orange/15 text-brand-orange px-2.5 py-0.5 rounded-full font-black border border-brand-orange/15">Santé : Excellente</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-950/45 p-3.5 rounded-xl border border-slate-850">
                    <span className="text-[9px] text-slate-400 font-bold block uppercase">CAC Moyen (Acquisition)</span>
                    <span className="text-xs font-black text-slate-800 block mt-1">120 000 FCFA</span>
                  </div>
                  <div className="bg-slate-950/45 p-3.5 rounded-xl border border-slate-850">
                    <span className="text-[9px] text-slate-400 font-bold block uppercase">LTV Client (Valeur à vie)</span>
                    <span className="text-xs font-black text-slate-800 block mt-1">1 850 000 FCFA</span>
                  </div>
                  <div className="bg-slate-950/45 p-3.5 rounded-xl border border-slate-850">
                    <span className="text-[9px] text-slate-400 font-bold block uppercase">Efficacité LTV/CAC</span>
                    <span className="text-xs font-black text-brand-emerald block mt-1">15.4x <span className="text-[8px] text-slate-400 font-normal">(Objectif &gt; 3x)</span></span>
                  </div>
                  <div className="bg-slate-950/45 p-3.5 rounded-xl border border-slate-850">
                    <span className="text-[9px] text-slate-400 font-bold block uppercase">Marge brute nette</span>
                    <span className="text-xs font-black text-brand-emerald block mt-1 font-mono">82% <span className="text-[8px] text-slate-400 font-normal">SaaS</span></span>
                  </div>
                </div>
              </div>

              {/* Box 2: Speed of Execution & Business Intelligence */}
              <div className="p-6 rounded-2xl bg-white border border-slate-200 flex flex-col gap-4 shadow-xl">
                <div className="flex justify-between items-center border-b border-slate-850 pb-3">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Activity className="w-4 h-4 text-brand-emerald" />
                    <span>Vélocité Opérationnelle & Intelligence</span>
                  </h4>
                  <span className="text-[9px] bg-brand-emerald/15 text-brand-emerald px-2.5 py-0.5 rounded-full font-black border border-brand-emerald/15">SLA Respecté</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-950/45 p-3.5 rounded-xl border border-slate-850">
                    <span className="text-[9px] text-slate-400 font-bold block uppercase">Cycle de vente moyen</span>
                    <span className="text-xs font-black text-slate-800 block mt-1">12.4 jours</span>
                  </div>
                  <div className="bg-slate-950/45 p-3.5 rounded-xl border border-slate-850">
                    <span className="text-[9px] text-slate-400 font-bold block uppercase">Délai Résolution SAV</span>
                    <span className="text-xs font-black text-slate-800 block mt-1">18 minutes</span>
                  </div>
                  <div className="bg-slate-950/45 p-3.5 rounded-xl border border-slate-850">
                    <span className="text-[9px] text-slate-400 font-bold block uppercase">Taux d'automatisation IA</span>
                    <span className="text-xs font-black text-brand-orange block mt-1">86.2%</span>
                  </div>
                  <div className="bg-slate-950/45 p-3.5 rounded-xl border border-slate-850">
                    <span className="text-[9px] text-slate-400 font-bold block uppercase">Check-ins GPS Terrain</span>
                    <span className="text-xs font-black text-brand-emerald block mt-1">98.4% validité</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab: Transactions */}
        {activeTab === 'transactions' && (() => {
          const totalDeals = transactions.length;
          const wonDeals = transactions.filter(t => t.stage === 'won');
          const wonDealsValue = wonDeals.reduce((acc, t) => acc + t.amount, 0);
          const activeDeals = transactions.filter(t => t.stage !== 'lost' && t.stage !== 'won');
          const activePipeline = activeDeals.reduce((acc, t) => acc + t.amount, 0);
          const weightedPipeline = activeDeals.reduce((acc, t) => acc + (t.amount * t.probability) / 100, 0);
          const winRate = totalDeals > 0 ? Math.round((wonDeals.length / totalDeals) * 100) : 0;

          return (
            <div className="flex flex-col gap-6 text-left animate-fade-in">
              {/* Deals KPIs */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="p-5 rounded-2xl bg-slate-950/45 border border-slate-200 flex flex-col gap-1.5 shadow-md">
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Volume total & Win-Rate</span>
                  <h4 className="text-xl font-black text-slate-900">{totalDeals} opportunités</h4>
                  <div className="text-[10px] text-brand-emerald font-semibold flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-emerald" />
                    <span>Taux de réussite : {winRate}%</span>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-slate-950/45 border border-slate-200 flex flex-col gap-1.5 shadow-md">
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Pipeline Brut Actif</span>
                  <h4 className="text-xl font-black text-brand-orange">{activePipeline.toLocaleString()} FCFA</h4>
                  <div className="text-[10px] text-slate-400">Somme des transactions en cours</div>
                </div>

                <div className="p-5 rounded-2xl bg-slate-950/45 border border-slate-200 flex flex-col gap-1.5 shadow-md">
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Pipeline Pondéré IA</span>
                  <h4 className="text-xl font-black text-blue-400">{weightedPipeline.toLocaleString()} FCFA</h4>
                  <div className="text-[10px] text-blue-450 font-semibold">Probabilité x Montant</div>
                </div>

                <div className="p-5 rounded-2xl bg-slate-950/45 border border-slate-200 flex flex-col gap-1.5 shadow-md">
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Chiffre Gagné (Won)</span>
                  <h4 className="text-xl font-black text-brand-emerald">{wonDealsValue.toLocaleString()} FCFA</h4>
                  <div className="text-[10px] text-brand-emerald/75">Signatures fermes clôturées</div>
                </div>
              </div>

              {/* Transactions Table */}
              <div className="p-6 rounded-2xl bg-slate-950/45 border border-slate-200 shadow-xl">
                <h3 className="text-base font-bold text-slate-900 mb-4">Suivi Financier National des Deals</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-400 text-xs">
                        <th className="py-2.5 px-4 text-left">Titre opportunité</th>
                        <th className="py-2.5 px-4 text-left">Montant</th>
                        <th className="py-2.5 px-4 text-left">Étape</th>
                        <th className="py-2.5 px-4 text-left">Probabilité IA</th>
                        <th className="py-2.5 px-4 text-left">Échéance</th>
                        <th className="py-2.5 px-4 text-left">Assignataire</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map((trans) => {
                        let stageBadge = 'bg-slate-100 text-slate-600';
                        if (trans.stage === 'won') stageBadge = 'bg-brand-emerald/10 text-brand-emerald border border-brand-emerald/20';
                        if (trans.stage === 'lost') stageBadge = 'bg-red-500/10 text-red-400 border border-red-500/20';
                        if (trans.stage === 'negotiation') stageBadge = 'bg-brand-orange/10 text-brand-orange border border-brand-orange/20';
                        if (trans.stage === 'proposal') stageBadge = 'bg-purple-500/10 text-purple-400 border border-purple-500/20';
                        
                        return (
                          <tr key={trans.id} className="border-b border-slate-850 hover:bg-slate-50/30">
                            <td className="py-3 px-4 font-bold text-slate-900">{trans.title}</td>
                            <td className="py-3 px-4 font-semibold text-brand-orange">{trans.amount.toLocaleString()} FCFA</td>
                            <td className="py-3 px-4">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${stageBadge}`}>
                                {trans.stage}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                <div className="w-16 h-1.5 rounded-full bg-slate-50 overflow-hidden">
                                  <div 
                                    className="h-full bg-gradient-to-r from-brand-orange to-brand-emerald rounded-full"
                                    style={{ width: `${trans.probability}%` }}
                                  />
                                </div>
                                <span className="text-[10px] text-slate-400 font-bold font-mono">{trans.probability}%</span>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-slate-400">{trans.expected_close_date}</td>
                            <td className="py-3 px-4 font-bold">{getCommercialName(trans.assigned_to)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          );
        })()}

        {/* Tab: Orders */}
        {activeTab === 'orders' && (() => {
          const totalOrders = orders.length;
          const paidOrders = orders.filter(o => o.payment_status === 'paid');
          const unpaidOrders = orders.filter(o => o.payment_status === 'unpaid');
          const paidAmount = paidOrders.reduce((acc, o) => acc + o.total_amount, 0);
          const activeDeliveries = orders.filter(o => o.delivery_status !== 'delivered' && o.delivery_status !== 'returned').length;

          return (
            <div className="flex flex-col gap-6 text-left animate-fade-in">
              {/* Logistics KPIs */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="p-5 rounded-2xl bg-slate-950/45 border border-slate-200 flex flex-col gap-1.5 shadow-md">
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Total Bons Commandes</span>
                  <h4 className="text-xl font-black text-slate-900">{totalOrders} Commandes</h4>
                  <div className="text-[10px] text-slate-400 font-semibold">{activeDeliveries} livraisons en cours</div>
                </div>

                <div className="p-5 rounded-2xl bg-slate-950/45 border border-slate-200 flex flex-col gap-1.5 shadow-md">
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">CA Encaissé (Payé)</span>
                  <h4 className="text-xl font-black text-brand-emerald">{paidAmount.toLocaleString()} FCFA</h4>
                  <div className="text-[10px] text-brand-emerald font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{paidOrders.length} payées</span>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-slate-950/45 border border-slate-200 flex flex-col gap-1.5 shadow-md">
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Vélocité Logistique</span>
                  <h4 className="text-xl font-black text-blue-400">94.2% respecté</h4>
                  <div className="text-[10px] text-slate-400">SLA moyen : 45 min</div>
                </div>

                <div className="p-5 rounded-2xl bg-slate-950/45 border border-slate-200 flex flex-col gap-1.5 shadow-md">
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Retards ou Anomalies</span>
                  <h4 className="text-xl font-black text-red-400">{unpaidOrders.length} Attentes</h4>
                  <div className="text-[10px] text-red-450 font-semibold">Bons en attente de solde</div>
                </div>
              </div>

              {/* Orders Table */}
              <div className="p-6 rounded-2xl bg-slate-950/45 border border-slate-200 shadow-xl">
                <h3 className="text-base font-bold text-slate-900 mb-4">Logistique de Commandes & Factures Nationales</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-400 text-xs">
                        <th className="py-2.5 px-4 text-left">Client & Destinataire</th>
                        <th className="py-2.5 px-4 text-left">Description articles</th>
                        <th className="py-2.5 px-4 text-left">Total Facturé</th>
                        <th className="py-2.5 px-4 text-left">Statut Paiement</th>
                        <th className="py-2.5 px-4 text-left">Livraison Logistique</th>
                        <th className="py-2.5 px-4 text-left">Livreur Assigné</th>
                        <th className="py-2.5 px-4 text-left">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((order) => {
                        const client = clients.find(c => c.id === order.client_id);
                        
                        let payBadge = 'bg-slate-100 text-slate-600';
                        if (order.payment_status === 'paid') payBadge = 'bg-brand-emerald/10 text-brand-emerald border border-brand-emerald/20';
                        if (order.payment_status === 'partial') payBadge = 'bg-brand-orange/10 text-brand-orange border border-brand-orange/20';
                        if (order.payment_status === 'unpaid') payBadge = 'bg-red-500/10 text-red-400 border border-red-500/20';

                        let delBadge = 'bg-slate-100 text-slate-600';
                        if (order.delivery_status === 'delivered') delBadge = 'bg-brand-emerald/10 text-brand-emerald border border-brand-emerald/20';
                        if (order.delivery_status === 'shipping') delBadge = 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
                        if (order.delivery_status === 'preparing') delBadge = 'bg-amber-400/10 text-amber-400 border border-amber-400/20';
                        if (order.delivery_status === 'returned') delBadge = 'bg-red-500/10 text-red-400 border border-red-500/20';

                        return (
                          <tr key={order.id} className="border-b border-slate-850 hover:bg-slate-50/30">
                            <td className="py-3 px-4">
                              <span className="font-bold text-slate-900 block">{client?.name || '—'}</span>
                              <span className="text-[10px] text-slate-400 block">{client?.company || 'Individuel'}</span>
                            </td>
                            <td className="py-3 px-4 font-semibold text-slate-700">{order.items}</td>
                            <td className="py-3 px-4 font-mono font-bold text-brand-orange">{order.total_amount.toLocaleString()} FCFA</td>
                            <td className="py-3 px-4">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${payBadge}`}>
                                {order.payment_status}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${delBadge}`}>
                                {order.delivery_status}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-xs font-semibold text-slate-400">{order.delivery_agent || '—'}</td>
                            <td className="py-3 px-4 text-xs text-slate-400">{new Date(order.created_at).toLocaleDateString()}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          );
        })()}

        {/* Tab: Form Generator */}
        {activeTab === 'forms' && (
          <div className="grid lg:grid-cols-3 gap-6 text-left animate-fade-in">
            {/* Creator form */}
            <div className="p-6 rounded-2xl bg-slate-955 border border-slate-200 shadow-xl flex flex-col gap-5">
              <div>
                <h3 className="text-base font-bold text-slate-900">Nouveau Formulaire Public</h3>
                <p className="text-[11px] text-slate-400 mt-1">Configurez un formulaire public pour capturer des prospects.</p>
              </div>

              <form onSubmit={handleCreateForm} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Titre du Formulaire</label>
                  <input 
                    type="text" required placeholder="Ex: Contact Salon Agricole 2026" value={formTitle} onChange={e => setFormTitle(e.target.value)}
                    className="p-2.5 bg-slate-950 border border-slate-850 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-brand-orange"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Champs à Activer</label>
                  <div className="flex flex-col gap-2 bg-slate-950/50 p-3 rounded-xl border border-slate-900 text-xs text-slate-700">
                    <label className="flex items-center gap-2.5 cursor-pointer hover:text-slate-900 transition-colors">
                      <input type="checkbox" checked={selectedFields.includes('name')} onChange={() => toggleField('name')} className="rounded accent-brand-orange" />
                      <span>Nom complet (Requis)</span>
                    </label>
                    <label className="flex items-center gap-2.5 cursor-pointer hover:text-slate-900 transition-colors">
                      <input type="checkbox" checked={selectedFields.includes('phone')} onChange={() => toggleField('phone')} className="rounded accent-brand-orange" />
                      <span>Téléphone (Requis)</span>
                    </label>
                    <label className="flex items-center gap-2.5 cursor-pointer hover:text-slate-900 transition-colors">
                      <input type="checkbox" checked={selectedFields.includes('company')} onChange={() => toggleField('company')} className="rounded accent-brand-orange" />
                      <span>Nom de l'Entreprise</span>
                    </label>
                    <label className="flex items-center gap-2.5 cursor-pointer hover:text-slate-900 transition-colors">
                      <input type="checkbox" checked={selectedFields.includes('email')} onChange={() => toggleField('email')} className="rounded accent-brand-orange" />
                      <span>Adresse e-mail</span>
                    </label>
                  </div>
                </div>

                <button type="submit" className="py-3 rounded-xl bg-brand-orange hover:bg-brand-orange/90 text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer">
                  <Plus className="w-3.5 h-3.5" />
                  <span>Générer le Formulaire</span>
                </button>
              </form>
            </div>

            {/* Live Form Mockup Preview */}
            <div className="p-6 rounded-2xl bg-slate-955 border border-slate-200 shadow-xl flex flex-col gap-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Aperçu Live du Formulaire</h3>
                <p className="text-[11px] text-slate-400 mt-1">Rendu dynamique public visible par les clients.</p>
              </div>

              <div className="flex-1 bg-gradient-to-br from-brand-orange/5 to-slate-950 p-5 rounded-xl border border-slate-850/80 flex flex-col justify-between min-h-[300px]">
                <div className="flex flex-col gap-3">
                  <div className="border-b border-slate-850 pb-2">
                    <h4 className="text-xs font-black text-slate-900">{formTitle || "Aperçu de votre formulaire"}</h4>
                    <p className="text-[9px] text-slate-400 mt-0.5">Veuillez remplir les informations suivantes</p>
                  </div>

                  <div className="flex flex-col gap-2.5 text-left">
                    {selectedFields.includes('name') && (
                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] font-bold text-slate-400 uppercase">Nom complet *</label>
                        <input type="text" disabled placeholder="M. Konan Jean" className="p-2 bg-slate-50/60 border border-slate-200 rounded-lg text-[10px] text-slate-400" />
                      </div>
                    )}
                    {selectedFields.includes('phone') && (
                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] font-bold text-slate-400 uppercase">Téléphone *</label>
                        <input type="tel" disabled placeholder="+225 0707..." className="p-2 bg-slate-50/60 border border-slate-200 rounded-lg text-[10px] text-slate-400" />
                      </div>
                    )}
                    {selectedFields.includes('company') && (
                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] font-bold text-slate-400 uppercase">Entreprise</label>
                        <input type="text" disabled placeholder="Cacao Trading Inc." className="p-2 bg-slate-50/60 border border-slate-200 rounded-lg text-[10px] text-slate-400" />
                      </div>
                    )}
                    {selectedFields.includes('email') && (
                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] font-bold text-slate-400 uppercase">Adresse e-mail</label>
                        <input type="email" disabled placeholder="jean@cacao.ci" className="p-2 bg-slate-50/60 border border-slate-200 rounded-lg text-[10px] text-slate-400" />
                      </div>
                    )}
                  </div>
                </div>

                <button disabled className="w-full mt-4 py-2.5 rounded-lg bg-brand-orange text-white text-[10px] font-black uppercase tracking-wider opacity-60">
                  Envoyer ma demande
                </button>
              </div>
            </div>

            {/* Existing forms list */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xl flex flex-col gap-4">
              <h3 className="text-base font-bold text-slate-900">Formulaires actifs</h3>
              <div className="flex flex-col gap-3 overflow-y-auto max-h-[400px] scrollbar-none">
                {forms.length === 0 ? (
                  <p className="text-xs text-slate-400 italic py-6 text-center">Aucun formulaire configuré.</p>
                ) : (
                  forms.map((f, idx) => {
                    const simulatedSubmissions = 12 + (idx * 14);
                    const simulatedConversion = 15 + (idx * 3.4);
                    const linkUrl = `https://forms.djagocrm.ci/f/${f.id}`;
                    const embedHtml = `<iframe src="${linkUrl}" width="100%" height="450" frameborder="0"></iframe>`;

                    return (
                      <div key={f.id} className="p-4 rounded-xl bg-slate-950 border border-slate-850 flex flex-col gap-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="text-xs font-extrabold text-slate-800">{f.title}</h4>
                            <p className="text-[9px] text-slate-550 mt-0.5">Champs : {f.fields.join(', ')}</p>
                          </div>
                          <span className="text-[9px] bg-brand-orange/10 text-brand-orange px-2 py-0.5 rounded font-black uppercase">
                            Actif
                          </span>
                        </div>

                        {/* Performance metrics */}
                        <div className="grid grid-cols-2 gap-2 text-[9px] bg-slate-50/50 p-2 rounded-lg border border-slate-900">
                          <div>
                            <span className="text-slate-400 font-bold block">SOUMISSIONS</span>
                            <span className="font-extrabold text-slate-700">{simulatedSubmissions} leads</span>
                          </div>
                          <div>
                            <span className="text-slate-400 font-bold block">CONVERSION</span>
                            <span className="font-extrabold text-brand-emerald">{simulatedConversion.toFixed(1)}%</span>
                          </div>
                        </div>

                        {/* Public Link Copy */}
                        <div className="flex flex-col gap-1">
                          <span className="text-[8px] font-bold text-slate-400 uppercase">Lien public d'acquisition</span>
                          <div className="flex gap-1">
                            <input 
                              type="text" readOnly value={linkUrl}
                              className="p-1.5 bg-slate-950 border border-slate-900 rounded text-[9px] text-brand-emerald cursor-text w-full focus:outline-none font-mono"
                            />
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(linkUrl);
                                addToast("Lien copié dans le presse-papiers !", "success");
                              }}
                              className="p-1.5 rounded bg-slate-50 border border-slate-200 text-slate-400 hover:text-slate-900 transition-colors cursor-pointer"
                              title="Copier le lien"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        {/* Embed iframe Copy */}
                        <div className="flex flex-col gap-1">
                          <span className="text-[8px] font-bold text-slate-400 uppercase">Intégration iframe Web</span>
                          <div className="flex gap-1">
                            <input 
                              type="text" readOnly value={embedHtml}
                              className="p-1.5 bg-slate-950 border border-slate-900 rounded text-[9px] text-slate-400 cursor-text w-full focus:outline-none font-mono truncate"
                            />
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(embedHtml);
                                addToast("Code iframe copié !", "success");
                              }}
                              className="p-1.5 rounded bg-slate-50 border border-slate-200 text-slate-400 hover:text-slate-900 transition-colors cursor-pointer"
                              title="Copier le code d'intégration"
                            >
                              <Copy className="w-3 h-3" />
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
        )}

        {/* Tab: Kanban */}
        {activeTab === 'kanban' && (
          <div className="flex flex-col gap-6 text-left animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 overflow-x-auto pb-4">
              {(['Prospect', 'Négociation', 'Vendu', 'En cours de livraison', 'Livré & Adopté'] as const).map((status) => {
                const laneClients = clients.filter(c => c.status === status);
                let titleColor = 'text-blue-400';
                let borderColor = 'border-blue-500/20';
                let badgeBg = 'bg-blue-500/10';

                if (status === 'Négociation') {
                  titleColor = 'text-amber-400';
                  borderColor = 'border-amber-500/20';
                  badgeBg = 'bg-amber-400/10';
                } else if (status === 'Vendu') {
                  titleColor = 'text-brand-orange';
                  borderColor = 'border-brand-orange/20';
                  badgeBg = 'bg-brand-orange/10';
                } else if (status === 'En cours de livraison') {
                  titleColor = 'text-teal-400';
                  borderColor = 'border-teal-500/20';
                  badgeBg = 'bg-teal-500/10';
                } else if (status === 'Livré & Adopté') {
                  titleColor = 'text-brand-emerald';
                  borderColor = 'border-brand-emerald/20';
                  badgeBg = 'bg-brand-emerald/10';
                }

                return (
                  <div key={status} className="flex flex-col gap-3 min-w-[200px] bg-white/40 p-3 rounded-2xl border border-slate-200/80 min-h-[500px]">
                    <div className={`p-2.5 rounded-xl border ${borderColor} ${badgeBg} flex items-center justify-between`}>
                      <span className={`text-xs font-black uppercase tracking-wider ${titleColor}`}>
                        {status}
                      </span>
                      <span className="text-[10px] bg-slate-50 px-2 py-0.5 rounded font-black text-slate-700">
                        {laneClients.length}
                      </span>
                    </div>

                    <div className="flex flex-col gap-2.5 overflow-y-auto max-h-[600px] scrollbar-none">
                      {laneClients.length === 0 ? (
                        <p className="text-[10px] text-slate-655 text-center py-8">Aucun prospect</p>
                      ) : (
                        laneClients.map(c => {
                          const comm = team.find(t => t.id === c.assigned_to);
                          return (
                            <div key={c.id} className="p-3.5 rounded-xl bg-slate-950 border border-slate-900 flex flex-col gap-2.5 shadow-sm hover:border-slate-200 transition-all text-left">
                              <div>
                                <h4 className="text-xs font-bold text-slate-800 truncate">{c.name}</h4>
                                <p className="text-[10px] text-slate-400 truncate mt-0.5">{c.company || 'Individuel'}</p>
                              </div>
                              
                              <div className="flex justify-between items-center border-t border-slate-900/60 pt-2 text-[9px] text-slate-455 font-semibold">
                                <span>Wara: {comm?.name || '—'}</span>
                                <span>Zone: {comm?.zone || '—'}</span>
                              </div>

                              <div className="flex justify-between gap-1 mt-1 border-t border-slate-900 pt-2">
                                <button
                                  disabled={status === 'Prospect'}
                                  onClick={async () => {
                                    const statuses: LocalClient['status'][] = ['Prospect', 'Négociation', 'Vendu', 'En cours de livraison', 'Livré & Adopté'];
                                    const currentIndex = statuses.indexOf(status);
                                    if (currentIndex > 0) {
                                      await updateClientStatus(c.id, statuses[currentIndex - 1], user?.id || 'dg-uuid');
                                    }
                                  }}
                                  className="flex-1 py-1 rounded bg-white hover:bg-slate-100 text-slate-400 hover:text-slate-800 text-[10px] font-bold disabled:opacity-30 cursor-pointer flex justify-center items-center"
                                >
                                  <ChevronLeft className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  disabled={status === 'Livré & Adopté'}
                                  onClick={async () => {
                                    const statuses: LocalClient['status'][] = ['Prospect', 'Négociation', 'Vendu', 'En cours de livraison', 'Livré & Adopté'];
                                    const currentIndex = statuses.indexOf(status);
                                    if (currentIndex < statuses.length - 1) {
                                      await updateClientStatus(c.id, statuses[currentIndex + 1], user?.id || 'dg-uuid');
                                    }
                                  }}
                                  className="flex-1 py-1 rounded bg-white hover:bg-slate-100 text-slate-400 hover:text-slate-800 text-[10px] font-bold disabled:opacity-30 cursor-pointer flex justify-center items-center"
                                >
                                  <ChevronRight className="w-3.5 h-3.5" />
                                </button>
                              </div>
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
        )}

        {/* Tab: Feed */}
        {activeTab === 'feed' && (
          <div className="flex flex-col gap-6 text-left animate-fade-in">
            <div className="flex justify-end mb-2">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-orange/10 text-brand-orange text-xs font-bold border border-brand-orange/20">
                <Activity className="w-3.5 h-3.5 animate-pulse" />
                <span>LIVE FEED</span>
              </div>
            </div>

            <div className="flex flex-col gap-4 pl-4 border-l border-slate-200">
              {interactions.slice(0, 15).map((int) => {
                const client = clients.find(c => c.id === int.client_id);
                const comm = team.find(t => t.id === int.performed_by);
                
                let badgeStyle = 'bg-slate-50 text-slate-400';
                if (int.type === 'appel') badgeStyle = 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
                if (int.type === 'whatsapp') badgeStyle = 'bg-brand-emerald/10 text-brand-emerald border border-brand-emerald/20';
                if (int.type === 'terrain') badgeStyle = 'bg-brand-orange/10 text-brand-orange border border-brand-orange/20';
                if (int.type === 'statut') badgeStyle = 'bg-amber-400/10 text-amber-400 border border-amber-400/20';

                return (
                  <div key={int.id} className="relative flex flex-col gap-1.5 pb-2 text-left">
                    <div className="absolute left-[-21px] top-1.5 w-2.5 h-2.5 rounded-full bg-[#ff7a00] ring-4 ring-[#05070c]" />
                    
                    <div className="flex items-center gap-2 text-xs text-slate-400 font-semibold">
                      <span>{new Date(int.created_at).toLocaleString()}</span>
                      <span>•</span>
                      <span className="text-slate-600">{comm?.name || 'Système'} ({comm?.zone || 'Zone Globale'})</span>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-900 flex items-start gap-4 shadow-md glass-panel">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase shrink-0 ${badgeStyle}`}>
                        {int.type}
                      </span>
                      <div className="flex-1 text-xs">
                        <p className="text-slate-700 font-medium leading-relaxed">
                          {int.details} {client && <span>concernant <strong>{client.name}</strong> ({client.company || 'Sans entreprise'})</span>}
                        </p>
                        {int.gps_coordinates && (
                          <p className="text-[10px] text-brand-orange font-bold mt-1.5 flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5" /> Géolocalisation GPS vérifiée : {int.gps_coordinates}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab: Admin */}
        {activeTab === 'admin' && (
          <div className="grid lg:grid-cols-12 gap-8 text-left animate-fade-in">
            <div className="lg:col-span-5 p-6 rounded-2xl bg-slate-950/45 border border-slate-200 shadow-xl flex flex-col gap-6">
              <form onSubmit={handleCreateCollab} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase">Nom Complet</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Kouamé Koffi"
                    value={newCollabName}
                    onChange={(e) => setNewCollabName(e.target.value)}
                    className="px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-200 focus:outline-none focus:border-brand-orange text-sm text-slate-800"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase">Adresse e-mail</label>
                  <input
                    type="email"
                    required
                    placeholder="Ex: kouame@djagocrm.ci"
                    value={newCollabEmail}
                    onChange={(e) => setNewCollabEmail(e.target.value)}
                    className="px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-200 focus:outline-none focus:border-brand-orange text-sm text-slate-800"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-400 uppercase">Rôle</label>
                    <select
                      value={newCollabRole}
                      onChange={(e) => setNewCollabRole(e.target.value as UserRole)}
                      className="px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-200 focus:outline-none focus:border-brand-orange text-sm text-slate-700"
                    >
                      <option value="commercial">Commercial</option>
                      <option value="manager">Manager</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-400 uppercase">Zone d'action</label>
                    <select
                      value={newCollabZone}
                      onChange={(e) => setNewCollabZone(e.target.value)}
                      className="px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-850 focus:outline-none focus:border-brand-orange text-sm text-slate-700"
                    >
                      <option value="Ouest">Ouest</option>
                      <option value="Sud">Sud</option>
                      <option value="Centre">Centre</option>
                      <option value="Nord">Nord</option>
                    </select>
                  </div>
                </div>

                {newCollabRole === 'commercial' && (
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-400 uppercase">Manager Responsable</label>
                    <select
                      value={newCollabManager}
                      onChange={(e) => setNewCollabManager(e.target.value)}
                      className="px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-200 focus:outline-none focus:border-brand-orange text-sm text-slate-700"
                    >
                      <option value="">Aucun Manager (Rattachement DG)</option>
                      {team.filter(t => t.role === 'manager').map(m => (
                        <option key={m.id} value={m.id}>{m.name} ({m.zone})</option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase">Mot de Passe Provisoire</label>
                  <input
                    type="text"
                    disabled
                    value={newCollabPass}
                    className="px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-400 text-sm cursor-not-allowed"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full mt-2 py-3 rounded-xl bg-brand-orange hover:bg-brand-orange/95 text-white font-bold text-sm shadow-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Enregistrer Collaborateur</span>
                </button>
              </form>
            </div>

            <div className="lg:col-span-7 p-6 rounded-2xl bg-slate-950/45 border border-slate-200 shadow-xl flex flex-col gap-4">
              <h3 className="text-lg font-bold text-slate-900">Équipe Commerciale</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400 text-xs">
                      <th className="py-2.5 px-4 text-left">Collaborateur</th>
                      <th className="py-2.5 px-4 text-left">Rôle</th>
                      <th className="py-2.5 px-4 text-left">Zone</th>
                      <th className="py-2.5 px-4 text-left">Responsable</th>
                    </tr>
                  </thead>
                  <tbody>
                    {team.map((t) => (
                      <tr key={t.id} className="border-b border-slate-850 hover:bg-slate-50/30">
                        <td className="py-3 px-4 font-semibold text-slate-900">
                          <div>
                            {t.name}
                            <p className="text-[10px] text-slate-400 font-normal">{t.email}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            t.role === 'dg' ? 'bg-brand-orange/15 text-brand-orange' :
                            t.role === 'manager' ? 'bg-brand-emerald/15 text-brand-emerald' : 'bg-slate-100 text-slate-400'
                          }`}>
                            {t.role}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-600">{t.zone}</td>
                        <td className="py-3 px-4 text-slate-400 text-xs">{getCommercialName(t.manager_id)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab: Audit */}
        {activeTab === 'audit' && (
          <div className="flex flex-col gap-6 text-left animate-fade-in">
            <div className="p-6 rounded-2xl bg-slate-950/45 border border-slate-200 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 w-full sm:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute ml-3 pointer-events-none" />
                <select
                  value={selectedCommercialId}
                  onChange={(e) => setSelectedCommercialId(e.target.value)}
                  className="pl-9 pr-4 py-2.5 w-full rounded-xl bg-slate-955 border border-slate-200 focus:outline-none focus:border-brand-orange text-sm text-slate-600"
                >
                  <option value="">Tous les commerciaux</option>
                  {team.filter(t => t.role === 'commercial').map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.zone})</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-slate-950/45 border border-slate-200 shadow-xl">
              <h3 className="text-lg font-bold text-slate-900 mb-6">Chronologie des Actions Relances</h3>
              
              {filteredInteractions.length === 0 ? (
                <p className="text-sm text-slate-400 py-6 text-center">Aucune interaction enregistrée pour cette sélection.</p>
              ) : (
                <div className="flex flex-col gap-6 border-l border-slate-200 pl-6 ml-4">
                  {filteredInteractions.map((int) => {
                    const client = clients.find(c => c.id === int.client_id);
                    const agent = team.find(t => t.id === int.performed_by);

                    let iconBadge = 'bg-slate-850 text-slate-305';
                    if (int.type === 'appel') iconBadge = 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
                    if (int.type === 'whatsapp') iconBadge = 'bg-brand-emerald/10 text-brand-emerald border border-brand-emerald/20';
                    if (int.type === 'terrain') iconBadge = 'bg-amber-400/10 text-amber-455 border border-amber-455/20';
                    if (int.type === 'creation') iconBadge = 'bg-purple-500/10 text-purple-400 border border-purple-500/20';
                    if (int.type === 'transfert') iconBadge = 'bg-pink-500/10 text-pink-400 border border-pink-500/20';
                    if (int.type === 'statut') iconBadge = 'bg-brand-orange/10 text-brand-orange border border-brand-orange/20';

                    return (
                      <div key={int.id} className="relative flex flex-col gap-1.5 text-left">
                        <div className="absolute left-[-31px] top-1.5 w-2.5 h-2.5 rounded-full bg-brand-orange ring-4 ring-slate-900" />
                        
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs text-slate-400 font-medium font-semibold">
                            {new Date(int.created_at).toLocaleString()}
                          </span>
                          <span className="text-slate-600">•</span>
                          <span className="text-xs font-bold text-slate-600">{agent?.name}</span>
                          <span className="text-slate-650">•</span>
                          <span className="text-xs text-slate-400 font-medium">Client : <span className="font-semibold text-slate-800">{client?.name || 'Inconnu'}</span></span>
                        </div>

                        <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-850 flex items-start gap-4">
                          <span className={`px-2 py-1 rounded text-[10px] font-extrabold uppercase shrink-0 ${iconBadge}`}>
                            {int.type}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-slate-250 leading-relaxed font-medium">{int.details}</p>
                            {int.gps_coordinates && (
                              <div className="flex items-center gap-1.5 text-xs text-amber-400 font-bold mt-2">
                                <MapPin className="w-3.5 h-3.5" />
                                <span>Coordonnées GPS : {int.gps_coordinates}</span>
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
        )}

        {/* Tab: Templates */}
        {activeTab === 'templates' && (
          <div className="p-6 rounded-2xl bg-slate-950/45 border border-slate-200 text-left max-w-2xl mx-auto shadow-xl flex flex-col gap-6 animate-fade-in">
            <h3 className="text-lg font-bold text-slate-900">Modèles WhatsApp</h3>
            <p className="text-xs text-slate-400">Gérez les modèles utilisés par l'équipe commerciale. Variables: {'{{nom_client}}'}, {'{{entreprise}}'}, {'{{nom_commercial}}'}</p>

            <div className="flex flex-col gap-4">
              {whatsappTemplates.map(t => (
                <div key={t.id} className="p-4 rounded-xl bg-slate-950 border border-slate-850 flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-slate-900">{t.name}</span>
                    <button onClick={() => deleteWhatsAppTemplate(t.id)} className="text-red-500 hover:text-red-400 text-xs font-bold uppercase">
                      Supprimer
                    </button>
                  </div>
                  <div className="text-xs text-slate-400 font-mono bg-slate-50 p-2 rounded">
                    {t.text}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-4 mt-4 pt-4 border-t border-slate-200">
              <h4 className="text-sm font-bold text-slate-900">Ajouter un nouveau modèle</h4>
              <div className="flex flex-col gap-1.5">
                <input
                  placeholder="Nom du modèle (ex: Relance Impayé)"
                  value={newTemplateName}
                  onChange={(e) => setNewTemplateName(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-850 focus:outline-none focus:border-brand-orange text-xs text-slate-800"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <textarea
                  rows={3}
                  placeholder="Bonjour {{nom_client}}, ..."
                  value={newTemplateText}
                  onChange={(e) => setNewTemplateText(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-850 focus:outline-none focus:border-brand-orange text-xs text-slate-800"
                />
              </div>

              <button
                onClick={handleAddTemplate}
                className="w-full py-3 rounded-xl bg-brand-orange hover:bg-brand-orange/95 text-white font-bold text-sm shadow-lg transition-all cursor-pointer"
              >
                Ajouter le modèle
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Client Detail Modal */}
      {selectedClientForModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-slate-50 border border-slate-200 rounded-2xl p-6 shadow-2xl flex flex-col gap-5 text-left max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-start border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-xl font-bold text-slate-900">{selectedClientForModal.name}</h3>
                <p className="text-xs text-slate-400">{selectedClientForModal.company || 'Sans entreprise'}</p>
              </div>
              <button 
                onClick={() => setSelectedClientForModal(null)}
                className="p-1.5 rounded-lg bg-slate-950 border border-slate-850 hover:bg-slate-100 text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid sm:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs text-slate-400 font-semibold uppercase">Téléphone</p>
                <p className="text-slate-250 mt-0.5 font-medium">{selectedClientForModal.phone}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 font-semibold uppercase">E-mail</p>
                <p className="text-slate-250 mt-0.5 font-medium">{selectedClientForModal.email || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 font-semibold uppercase">Statut Actuel</p>
                <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold bg-brand-orange/15 text-brand-orange border border-brand-orange/20 mt-1">
                  {selectedClientForModal.status}
                </span>
              </div>
              <div>
                <p className="text-xs text-slate-400 font-semibold uppercase">Assigné à</p>
                <p className="text-slate-250 mt-0.5 font-semibold">
                  {getCommercialName(selectedClientForModal.assigned_to)}
                </p>
              </div>
            </div>

            {/* List secondary contacts, deals, orders for DG view */}
            <div className="border-t border-slate-200 pt-4 flex flex-col gap-4">
              <h4 className="font-bold text-slate-900 text-sm uppercase">Fiche Contacts & Transactions associées</h4>
              <div className="grid sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <p className="font-bold text-brand-orange mb-1">Contacts secondaires</p>
                  {contacts.filter(c => c.client_id === selectedClientForModal.id).length === 0 ? (
                    <p className="text-slate-400 italic">Aucun contact enregistré.</p>
                  ) : (
                    contacts.filter(c => c.client_id === selectedClientForModal.id).map(c => (
                      <div key={c.id} className="p-2 rounded bg-slate-950 border border-slate-850 mb-1">
                        <p className="font-bold text-slate-800">{c.name} ({c.role})</p>
                        <p className="text-slate-400">{c.phone}</p>
                      </div>
                    ))
                  )}
                </div>

                <div>
                  <p className="font-bold text-brand-orange mb-1">Transactions (Deals)</p>
                  {transactions.filter(t => t.client_id === selectedClientForModal.id).length === 0 ? (
                    <p className="text-slate-400 italic">Aucune transaction enregistrée.</p>
                  ) : (
                    transactions.filter(t => t.client_id === selectedClientForModal.id).map(t => (
                      <div key={t.id} className="p-2 rounded bg-slate-950 border border-slate-850 mb-1 flex justify-between items-center">
                        <div>
                          <p className="font-bold text-slate-800">{t.title}</p>
                          <p className="text-[10px] text-brand-orange">{t.amount.toLocaleString()} FCFA</p>
                        </div>
                        <span className="text-[10px] font-black uppercase">{t.stage}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Support Tickets for DG audit */}
            <div className="border-t border-slate-200 pt-4">
              <h4 className="font-bold text-slate-900 text-sm uppercase mb-2">Tickets SAV de ce {vocab.client}</h4>
              {tickets.filter(t => t.client_id === selectedClientForModal.id).length === 0 ? (
                <p className="text-xs text-slate-550 italic">Aucun ticket de support ouvert.</p>
              ) : (
                tickets.filter(t => t.client_id === selectedClientForModal.id).map(t => (
                  <div key={t.id} className="p-3 rounded-xl bg-slate-955 border border-slate-850 mb-2 flex justify-between items-center text-xs">
                    <div>
                      <p className="font-bold text-slate-800">{t.subject}</p>
                      <p className="text-[10px] text-slate-400">{t.description}</p>
                    </div>
                    <div className="flex gap-2">
                      <span className="px-2 py-0.5 rounded text-[9px] bg-red-500/10 text-red-400 border border-red-500/20 uppercase font-black">{t.priority}</span>
                      <span className="px-2 py-0.5 rounded text-[9px] bg-slate-950 text-slate-400 border border-slate-200 font-bold">{t.status}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
