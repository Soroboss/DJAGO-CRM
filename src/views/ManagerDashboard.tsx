import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { useCrmStore } from '../store/crmStore';
import { NetworkBadge } from '../components/NetworkBadge';
import { 
  Users, DollarSign, RefreshCw, Plus, LogOut, 
  MapPin, ShieldAlert, Award, UserCheck, CheckCircle2, Eye, X, MessageSquare,
  BarChart3, Activity, ChevronRight, ChevronLeft, ShoppingCart, PieChart, Filter, Truck
} from 'lucide-react';
import { type LocalClient } from '../db/localDb';

export const ManagerDashboard: React.FC = () => {
  const { user, logout, team, createTeammate } = useAuthStore();
  const { 
    clients, reassignClient, interactions, whatsappTemplates, updateWhatsAppTemplates, updateClientStatus,
    orders, transactions, segments, addSegment, updateOrderStatus
  } = useCrmStore();
  const [selectedClientForModal, setSelectedClientForModal] = useState<LocalClient | null>(null);

  const [activeTab, setActiveTab] = useState<'team' | 'kanban' | 'feed' | 'reassign' | 'recruit' | 'templates' | 'orders' | 'reporting' | 'segments'>('team');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // V2 WhatsApp templates editor state
  const [tempDevisTemplate, setTempDevisTemplate] = useState(whatsappTemplates.devis);
  const [tempLivraisonTemplate, setTempLivraisonTemplate] = useState(whatsappTemplates.livraison);
  const [tempFidelisationTemplate, setTempFidelisationTemplate] = useState(whatsappTemplates.fidelisation);

  // Order status update state
  const [selectedOrderForEdit, setSelectedOrderForEdit] = useState<unknown>(null);
  const [editPaymentStatus, setEditPaymentStatus] = useState<'unpaid' | 'partial' | 'paid'>('unpaid');
  const [editDeliveryStatus, setEditDeliveryStatus] = useState<'preparing' | 'shipping' | 'delivered' | 'returned'>('preparing');
  const [editDeliveryAgent, setEditDeliveryAgent] = useState('');

  // Segment creation state
  const [segmentName, setSegmentName] = useState('');
  const [segmentStatus, setSegmentStatus] = useState('');
  const [segmentDays, setSegmentDays] = useState('');

  const handleSaveTemplates = async () => {
    await updateWhatsAppTemplates({
      devis: tempDevisTemplate,
      livraison: tempLivraisonTemplate,
      fidelisation: tempFidelisationTemplate
    });
  };

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Reassignment form state
  const [selectedClientIds, setSelectedClientIds] = useState<string[]>([]);
  const [selectedCommercialId, setSelectedCommercialId] = useState('');

  // Recruit form state
  const [newWaraName, setNewWaraName] = useState('');
  const [newWaraEmail, setNewWaraEmail] = useState('');

  // Find commercials under this manager
  const teamMembers = team.filter(t => t.manager_id === user?.id && t.role === 'commercial');
  const teamIds = teamMembers.map(t => t.id);

  // Find clients assigned to this team
  const teamClients = clients.filter(c => c.assigned_to && teamIds.includes(c.assigned_to));

  // Supervision calculations
  const teamClientIds = teamClients.map(c => c.id);
  const teamOrders = orders.filter(o => teamClientIds.includes(o.client_id));
  const teamPaidOrders = teamOrders.filter(o => o.payment_status === 'paid');
  const teamTotalRevenue = teamOrders.reduce((acc, o) => acc + o.total_amount, 0);
  const teamPaidRevenue = teamPaidOrders.reduce((acc, o) => acc + o.total_amount, 0);
  const supervisionCommission = teamPaidRevenue * 0.015; // 1.5% commission on actual collections
  const teamPendingRevenue = teamTotalRevenue - teamPaidRevenue;


  const getCommercialName = (id?: string) => {
    if (!id) return 'Non assigné';
    const found = team.find(t => t.id === id);
    return found ? found.name : 'Inconnu';
  };

  const handleRecruitWara = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWaraName || !newWaraEmail || !user) return;

    await createTeammate(
      newWaraName,
      newWaraEmail,
      'commercial',
      user.zone,
      user.id
    );

    setNewWaraName('');
    setNewWaraEmail('');
  };

  const handleReassign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedClientIds.length === 0 || !selectedCommercialId || !user) return;

    for (const cid of selectedClientIds) {
      await reassignClient(cid, selectedCommercialId, user.id);
    }
    
    setSelectedClientIds([]);
    setSelectedCommercialId('');
  };

  const handleUpdateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrderForEdit) return;
    await updateOrderStatus(selectedOrderForEdit.id, editPaymentStatus, editDeliveryStatus);
    setSelectedOrderForEdit(null);
  };

  const handleCreateSegment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!segmentName) return;
    await addSegment(segmentName, {
      status: segmentStatus || undefined,
      zone: user?.zone
    });
    setSegmentName('');
    setSegmentStatus('');
  };

  return (
    <div className="min-h-screen bg-[#05070c] text-slate-100 flex flex-col md:flex-row">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-[#090d16] border-r border-slate-800/60 p-6 h-screen sticky top-0 justify-between shrink-0">
        <div className="flex flex-col gap-8">
          {/* Logo & Info */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-orange to-brand-emerald flex items-center justify-center font-extrabold text-white text-xl shadow-lg shadow-brand-orange/20">
              DJ
            </div>
            <div className="text-left">
              <h2 className="text-lg font-black text-white leading-tight">DjagoCRM</h2>
              <span className="text-[10px] bg-brand-emerald/15 text-brand-emerald px-2 py-0.5 rounded font-bold uppercase tracking-wider">Manager</span>
            </div>
          </div>

          {/* User profile card */}
          <div className="p-3.5 rounded-xl bg-[#05070c]/50 border border-slate-800/85 text-left">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Zone d'action : {user?.zone}</p>
            <p className="text-sm font-bold text-slate-200 mt-1 truncate">{user?.name}</p>
            <p className="text-xs text-slate-450 truncate">{user?.email}</p>
          </div>

          {/* Vertical Menu Modules */}
          <nav className="flex flex-col gap-1.5 overflow-y-auto max-h-[50vh] scrollbar-none">
            <button
              onClick={() => setActiveTab('team')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                activeTab === 'team'
                  ? 'bg-brand-emerald text-white shadow-md'
                  : 'text-slate-450 hover:text-slate-200 hover:bg-[#05070c]/30'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Mon Équipe</span>
            </button>

            <button
              onClick={() => setActiveTab('reporting')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                activeTab === 'reporting'
                  ? 'bg-brand-emerald text-white shadow-md'
                  : 'text-slate-450 hover:text-slate-200 hover:bg-[#05070c]/30'
              }`}
            >
              <PieChart className="w-4 h-4" />
              <span>Rapports & KPIs</span>
            </button>

            <button
              onClick={() => setActiveTab('orders')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                activeTab === 'orders'
                  ? 'bg-brand-emerald text-white shadow-md'
                  : 'text-slate-450 hover:text-slate-200 hover:bg-[#05070c]/30'
              }`}
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Commandes & Livraisons</span>
            </button>

            <button
              onClick={() => setActiveTab('segments')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                activeTab === 'segments'
                  ? 'bg-brand-emerald text-white shadow-md'
                  : 'text-slate-450 hover:text-slate-200 hover:bg-[#05070c]/30'
              }`}
            >
              <Filter className="w-4 h-4" />
              <span>Segments Clients</span>
            </button>

            <button
              onClick={() => setActiveTab('kanban')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                activeTab === 'kanban'
                  ? 'bg-brand-emerald text-white shadow-md'
                  : 'text-slate-450 hover:text-slate-200 hover:bg-[#05070c]/30'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Pipeline Kanban</span>
            </button>

            <button
              onClick={() => setActiveTab('feed')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                activeTab === 'feed'
                  ? 'bg-brand-emerald text-white shadow-md'
                  : 'text-slate-450 hover:text-slate-200 hover:bg-[#05070c]/30'
              }`}
            >
              <Activity className="w-4 h-4" />
              <span>Fil d'Activité</span>
            </button>

            <button
              onClick={() => setActiveTab('reassign')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                activeTab === 'reassign'
                  ? 'bg-brand-emerald text-white shadow-md'
                  : 'text-slate-450 hover:text-slate-200 hover:bg-[#05070c]/30'
              }`}
            >
              <RefreshCw className="w-4 h-4" />
              <span>Réassignations</span>
            </button>

            <button
              onClick={() => setActiveTab('recruit')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                activeTab === 'recruit'
                  ? 'bg-brand-emerald text-white shadow-md'
                  : 'text-slate-450 hover:text-slate-200 hover:bg-[#05070c]/30'
              }`}
            >
              <Plus className="w-4 h-4" />
              <span>Recruter un Wara</span>
            </button>

            <button
              onClick={() => setActiveTab('templates')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                activeTab === 'templates'
                  ? 'bg-brand-emerald text-white shadow-md'
                  : 'text-slate-450 hover:text-slate-200 hover:bg-[#05070c]/30'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>Modèles WhatsApp</span>
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
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-slate-900 border border-slate-800 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20 text-sm font-bold text-slate-300 transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Se Déconnecter</span>
          </button>
        </div>
      </aside>

      {/* Top Header for Mobile */}
      <header className="md:hidden bg-[#090d16] border-b border-slate-800/60 px-4 py-3 sticky top-0 z-35 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-orange to-brand-emerald flex items-center justify-center font-black text-white text-md">
            DJ
          </div>
          <span className="text-md font-bold text-white">DjagoCRM MGR</span>
        </div>
        <div className="flex items-center gap-2">
          <NetworkBadge />
          <button
            onClick={logout}
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-red-400"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Mobile Horizontal Navigation Tabs */}
      <div className="md:hidden flex overflow-x-auto bg-[#090d16]/40 border-b border-slate-800/40 p-2 gap-1.5 scrollbar-none shrink-0">
        {(['team', 'reporting', 'orders', 'segments', 'kanban', 'feed', 'reassign', 'recruit', 'templates'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-none px-4 py-2 rounded-lg text-xs font-bold transition-all uppercase ${
              activeTab === tab ? 'bg-brand-emerald text-white' : 'text-slate-400 bg-slate-950/30'
            }`}
          >
            {tab === 'team' ? 'Équipe' : tab === 'reporting' ? 'Rapports' : tab === 'orders' ? 'Commandes' : tab === 'segments' ? 'Segments' : tab}
          </button>
        ))}
      </div>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto px-6 py-8 md:py-10 max-w-7xl mx-auto w-full">
        {/* Module Header Title */}
        <div className="mb-8 border-b border-slate-800/50 pb-5 text-left animate-fade-in">
          <h1 className="text-2xl md:text-3xl font-black text-white leading-tight !my-0">
            {activeTab === 'team' && "Mon Équipe & Supervision"}
            {activeTab === 'reporting' && "Rapports d'Activité de Zone"}
            {activeTab === 'orders' && "Suivi des Commandes de la Zone"}
            {activeTab === 'segments' && "Segmentation Marketing de Zone"}
            {activeTab === 'kanban' && "Pipeline Kanban de Zone"}
            {activeTab === 'feed' && "Activité de Zone en Direct"}
            {activeTab === 'reassign' && "Réassignations de Portefeuille"}
            {activeTab === 'recruit' && "Recruter un Wara"}
            {activeTab === 'templates' && "Modèles WhatsApp de Zone"}
          </h1>
          <p className="text-xs md:text-sm text-slate-400 mt-1">
            {activeTab === 'team' && "Suivi des ventes de vos commerciaux, commissions accumulées et quota de zone."}
            {activeTab === 'reporting' && "Analyses statistiques du pipeline de vente de votre équipe et taux d'atteinte de quota."}
            {activeTab === 'orders' && "Bons de commande de zone, validation des paiements et répartition des agents de livraison."}
            {activeTab === 'segments' && "Créez et gérez des groupes de prospects qualifiés pour l'équipe commerciale."}
            {activeTab === 'kanban' && "Visualisez et déplacez vos prospects dans le pipeline de vente régional."}
            {activeTab === 'feed' && "Flux d'activité en temps réel pour vos commerciaux terrain de la zone."}
            {activeTab === 'reassign' && "Réaffectez rapidement un client d'un commercial à un autre en cas de besoin."}
            {activeTab === 'recruit' && "Ajoutez de nouveaux commerciaux ('Waras') directement sous votre responsabilité."}
            {activeTab === 'templates' && "Consultez et ajustez les modèles de relance WhatsApp pour votre équipe."}
          </p>
        </div>

        {activeTab === 'team' && (
          <div className="flex flex-col gap-8 text-left animate-fade-in">
            {/* Supervision KPIs */}
            <div className="grid sm:grid-cols-3 gap-6">
              <div className="p-6 rounded-2xl bg-slate-950/45 border border-slate-800 flex items-center justify-between shadow-xl">
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Contrats de l'Équipe</span>
                  <h3 className="text-2xl font-black text-white mt-1.5">
                    {teamTotalRevenue.toLocaleString()} <span className="text-sm font-bold text-brand-emerald">FCFA</span>
                  </h3>
                  <p className="text-[10px] text-brand-emerald font-semibold mt-1">
                    {teamOrders.length} commande(s) ({teamPaidOrders.length} payée(s))
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-brand-emerald/10 text-brand-emerald flex items-center justify-center border border-brand-emerald/20">
                  <DollarSign className="w-6 h-6" />
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-slate-950/45 border border-slate-800 flex items-center justify-between shadow-xl">
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Ma Commission (1.5%)</span>
                  <h3 className="text-2xl font-black text-brand-orange mt-1.5 font-mono">
                    {supervisionCommission.toLocaleString()} <span className="text-sm font-bold text-brand-orange">FCFA</span>
                  </h3>
                  <p className="text-[10px] text-slate-400 mt-1">Calculée automatiquement en supervision</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-brand-orange/10 text-brand-orange flex items-center justify-center border border-brand-orange/20">
                  <Award className="w-6 h-6" />
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-slate-950/45 border border-slate-800 flex items-center justify-between shadow-xl">
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Commerciaux Actifs</span>
                  <h3 className="text-2xl font-black text-white mt-1.5">
                    {teamMembers.length} <span className="text-sm font-bold text-slate-400">Waras</span>
                  </h3>
                  <p className="text-[10px] text-slate-400 mt-1">Affectés sur la zone {user?.zone}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20">
                  <Users className="w-6 h-6" />
                </div>
              </div>
            </div>

            {/* Objective Quota progress */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-brand-emerald/10 to-[#090d16] border border-brand-emerald/25 text-left flex flex-col gap-3 shadow-xl">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-extrabold text-sm text-white">Objectif Quota de Supervision - Zone {user?.zone}</h4>
                  <p className="text-[10px] text-slate-400">Objectif mensuel de l'équipe fixé à 10 000 000 FCFA</p>
                </div>
                <div className="text-right">
                  <span className="text-md font-black text-brand-emerald">
                    {Math.min(Math.round((teamTotalRevenue / 10000000) * 100), 100)}%
                  </span>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Atteint</p>
                </div>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-brand-emerald to-teal-400 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min((teamTotalRevenue / 10000000) * 100, 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-slate-450 font-semibold">
                <span>Ventes actuelles : {teamTotalRevenue.toLocaleString()} FCFA</span>
                <span>Reste : {Math.max(0, 10000000 - teamTotalRevenue).toLocaleString()} FCFA</span>
              </div>
            </div>

            {/* Speed & Intelligence Cards */}
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="p-6 rounded-2xl bg-[#090d16] border border-slate-800 flex flex-col gap-3">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">⚡ Vitesse Opérationnelle Locale</h4>
                  <span className="text-[10px] bg-brand-emerald/15 text-brand-emerald px-2 py-0.5 rounded font-black">94.2% SLA</span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-slate-950/45 p-3 rounded-xl border border-slate-850">
                    <span className="text-[10px] text-slate-500 font-bold block uppercase">Livraison Moyenne</span>
                    <span className="text-xs font-black text-slate-200 block mt-1">38 minutes</span>
                  </div>
                  <div className="bg-slate-950/45 p-3 rounded-xl border border-slate-850">
                    <span className="text-[10px] text-slate-500 font-bold block uppercase">Closing de Deals</span>
                    <span className="text-xs font-black text-slate-200 block mt-1">9.5 jours</span>
                  </div>
                </div>
              </div>
              <div className="p-6 rounded-2xl bg-[#090d16] border border-slate-800 flex flex-col gap-3">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">🧠 Performance & Intelligence</h4>
                  <span className="text-[10px] bg-brand-orange/15 text-brand-orange px-2 py-0.5 rounded font-black">Score : A+</span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-slate-950/45 p-3 rounded-xl border border-slate-850">
                    <span className="text-[10px] text-slate-500 font-bold block uppercase">Conversion Segments</span>
                    <span className="text-xs font-black text-brand-orange block mt-1">74.2%</span>
                  </div>
                  <div className="bg-slate-950/45 p-3 rounded-xl border border-slate-850">
                    <span className="text-[10px] text-slate-500 font-bold block uppercase">Taux d'automatisation</span>
                    <span className="text-xs font-black text-brand-emerald block mt-1">82.5%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Team Clients table */}
            <div className="p-6 rounded-2xl bg-slate-950/45 border border-slate-800 shadow-xl">
              <h3 className="text-lg font-bold text-white mb-4">Portefeuille Clients de la Zone</h3>
              {teamClients.length === 0 ? (
                <p className="text-sm text-slate-450 py-6 text-center">Aucun client enregistré dans votre zone.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 text-xs">
                        <th className="py-3 px-4 font-bold uppercase text-left">Client</th>
                        <th className="py-3 px-4 font-bold uppercase text-left">Entreprise</th>
                        <th className="py-3 px-4 font-bold uppercase text-left">Téléphone</th>
                        <th className="py-3 px-4 font-bold uppercase text-left">Assigné à</th>
                        <th className="py-3 px-4 font-bold uppercase text-left">Statut</th>
                        <th className="py-3 px-4 font-bold uppercase text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {teamClients.map((client) => {
                        let statusBadge = 'bg-slate-800 text-slate-300';
                        if (client.status === 'Prospect') statusBadge = 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
                        if (client.status === 'Négociation') statusBadge = 'bg-amber-400/10 text-amber-400 border border-amber-400/20';
                        if (client.status === 'Vendu') statusBadge = 'bg-brand-orange/10 text-brand-orange border border-brand-orange/20';
                        if (client.status === 'En cours de livraison') statusBadge = 'bg-teal-500/10 text-teal-400 border border-teal-500/20';
                        if (client.status === 'Livré & Adopté') statusBadge = 'bg-brand-emerald/10 text-brand-emerald border border-brand-emerald/20';

                        return (
                          <tr key={client.id} className="border-b border-slate-850 hover:bg-slate-900/30">
                            <td className="py-3 px-4 font-semibold text-white">{client.name}</td>
                            <td className="py-3 px-4 text-slate-300">{client.company || '—'}</td>
                            <td className="py-3 px-4 text-slate-400 text-xs">{client.phone}</td>
                            <td className="py-3 px-4 text-slate-200 font-semibold">{getCommercialName(client.assigned_to)}</td>
                            <td className="py-3 px-4">
                              <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${statusBadge}`}>
                                {client.status}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <button
                                onClick={() => setSelectedClientForModal(client)}
                                className="p-1.5 rounded-lg bg-slate-800 border border-slate-700/60 hover:bg-brand-emerald/20 hover:text-brand-emerald text-slate-300 transition-all"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab: Reporting */}
        {activeTab === 'reporting' && (
          <div className="flex flex-col gap-6 text-left animate-fade-in">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="p-5 rounded-2xl bg-slate-950/45 border border-slate-800">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Deals Régionaux</span>
                <span className="text-2xl font-black text-white block mt-1">
                  {transactions.filter(t => teamIds.includes(t.assigned_to)).length}
                </span>
              </div>
              <div className="p-5 rounded-2xl bg-slate-950/45 border border-slate-800">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Valeur Pipeline</span>
                <span className="text-2xl font-black text-brand-orange block mt-1">
                  {transactions.filter(t => teamIds.includes(t.assigned_to) && t.stage !== 'lost' && t.stage !== 'won').reduce((acc, t) => acc + t.amount, 0).toLocaleString()} FCFA
                </span>
              </div>
              <div className="p-5 rounded-2xl bg-slate-950/45 border border-slate-800">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">CA Encaissé (Reel)</span>
                <span className="text-2xl font-black text-brand-emerald block mt-1">
                  {teamPaidRevenue.toLocaleString()} FCFA
                </span>
              </div>
              <div className="p-5 rounded-2xl bg-slate-950/45 border border-slate-800">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Marge Estimée (78%)</span>
                <span className="text-2xl font-black text-blue-400 block mt-1 font-mono">
                  {Math.round(teamPaidRevenue * 0.78).toLocaleString()} FCFA
                </span>
              </div>
            </div>

            {/* Graphic simulation block */}
            <div className="p-6 rounded-2xl bg-[#090d16] border border-slate-800/80">
              <h3 className="text-sm font-bold text-white mb-4">Répartition des Transactions par étape</h3>
              <div className="flex flex-col gap-3">
                {(['contact', 'presentation', 'proposal', 'negotiation', 'won'] as const).map(stage => {
                  const stageDeals = transactions.filter(t => t.stage === stage && teamIds.includes(t.assigned_to));
                  const percentage = transactions.length > 0 ? (stageDeals.length / transactions.length) * 100 : 0;
                  return (
                    <div key={stage} className="flex flex-col gap-1">
                      <div className="flex justify-between text-xs text-slate-450 font-bold">
                        <span className="uppercase">{stage}</span>
                        <span>{stageDeals.length} Deal(s)</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-brand-orange to-brand-emerald rounded-full"
                          style={{ width: `${percentage || 10}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Team Performance Bar Chart */}
            <div className="p-6 rounded-2xl bg-[#090d16] border border-slate-800/80">
              <h3 className="text-sm font-bold text-white mb-6">Graphique de Performance de l'Équipe (CA par Commercial)</h3>
              <div className="flex items-end gap-4 h-48 border-b border-slate-800 pb-2">
                {teamMembers.map(member => {
                  const memberRevenue = transactions.filter(t => t.assigned_to === member.id && t.stage === 'won').reduce((sum, t) => sum + t.amount, 0);
                  const maxRevenue = Math.max(...teamMembers.map(m => transactions.filter(t => t.assigned_to === m.id && t.stage === 'won').reduce((sum, t) => sum + t.amount, 0))) || 1;
                  const height = Math.max((memberRevenue / maxRevenue) * 100, 5); // 5% min height
                  
                  return (
                    <div key={member.id} className="flex flex-col items-center flex-1 gap-2 group">
                      <div className="w-full flex justify-center h-full relative items-end group">
                        {/* Tooltip on hover */}
                        <div className="absolute -top-8 bg-slate-900 border border-slate-700 px-2 py-1 rounded text-[10px] font-bold text-brand-emerald opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 shadow-lg">
                          {memberRevenue.toLocaleString()} FCFA
                        </div>
                        {/* Bar */}
                        <div 
                          className="w-full max-w-[40px] bg-gradient-to-t from-brand-emerald/40 to-brand-emerald rounded-t-lg transition-all duration-1000 group-hover:brightness-125"
                          style={{ height: `${height}%` }}
                        />
                      </div>
                      <span className="text-[9px] font-bold text-slate-400 uppercase truncate w-full text-center">{member.name.split(' ')[0]}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Tab: Orders */}
        {activeTab === 'orders' && (
          <div className="flex flex-col gap-6 text-left animate-fade-in">
            <div className="p-6 rounded-2xl bg-slate-950/45 border border-slate-800 shadow-xl">
              <h3 className="text-base font-bold text-white mb-4">Suivi Logistique de Livraison</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 text-xs">
                      <th className="py-2.5 px-4 text-left">Commande</th>
                      <th className="py-2.5 px-4 text-left">Client</th>
                      <th className="py-2.5 px-4 text-left">Montant</th>
                      <th className="py-2.5 px-4 text-left">Paiement</th>
                      <th className="py-2.5 px-4 text-left">Livraison</th>
                      <th className="py-2.5 px-4 text-left">Livreur</th>
                      <th className="py-2.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => {
                      const client = clients.find(c => c.id === order.client_id);
                      return (
                        <tr key={order.id} className="border-b border-slate-850 hover:bg-slate-900/30">
                          <td className="py-3 px-4 font-bold text-white">{order.items}</td>
                          <td className="py-3 px-4 text-slate-350">{client?.name || '—'}</td>
                          <td className="py-3 px-4 font-mono text-brand-orange">{order.total_amount.toLocaleString()} FCFA</td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                              order.payment_status === 'paid' ? 'bg-brand-emerald/10 text-brand-emerald' : 'bg-red-500/10 text-red-400'
                            }`}>{order.payment_status}</span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-xs font-semibold text-slate-300">{order.delivery_status}</span>
                          </td>
                          <td className="py-3 px-4 text-xs text-slate-400 font-bold">{order.delivery_agent || '—'}</td>
                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => {
                                setSelectedOrderForEdit(order);
                                setEditPaymentStatus(order.payment_status);
                                setEditDeliveryStatus(order.delivery_status);
                                setEditDeliveryAgent(order.delivery_agent || '');
                              }}
                              className="p-1 rounded bg-[#090d16] border border-slate-800 text-slate-350 hover:text-brand-emerald"
                            >
                              <Truck className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab: Segments */}
        {activeTab === 'segments' && (
          <div className="grid lg:grid-cols-3 gap-8 text-left animate-fade-in">
            {/* Create segment form */}
            <div className="p-6 rounded-2xl bg-slate-950/45 border border-slate-800 shadow-xl flex flex-col gap-6">
              <div>
                <h3 className="text-base font-bold text-white">Nouveau Segment de Zone</h3>
                <p className="text-xs text-slate-450">Définissez des filtres pour cibler des prospects régionaux.</p>
              </div>

              <form onSubmit={handleCreateSegment} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase">Nom du segment</label>
                  <input 
                    type="text" required placeholder="Ex: Prospects Chauds Sud" value={segmentName} onChange={e => setSegmentName(e.target.value)}
                    className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase">Filtre par Statut client</label>
                  <select 
                    value={segmentStatus} onChange={e => setSegmentStatus(e.target.value)}
                    className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300"
                  >
                    <option value="">Tous les statuts</option>
                    <option value="Prospect">Prospect</option>
                    <option value="Négociation">Négociation</option>
                    <option value="Vendu">Vendu</option>
                    <option value="En cours de livraison">En livraison</option>
                    <option value="Livré & Adopté">Adopté</option>
                  </select>
                </div>

                <button type="submit" className="py-2.5 rounded-xl bg-brand-emerald text-white text-xs font-bold mt-2">
                  + Configurer le Segment
                </button>
              </form>
            </div>

            {/* List segments */}
            <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-950/45 border border-slate-800 shadow-xl flex flex-col gap-4">
              <h3 className="text-base font-bold text-white">Mes segments configurés</h3>
              <div className="flex flex-col gap-3">
                {segments.map((seg) => {
                  const filtered = teamClients.filter(c => !seg.criteria.status || c.status === seg.criteria.status);
                  return (
                    <div key={seg.id} className="p-3.5 rounded-xl bg-slate-950 border border-slate-850 flex items-center justify-between">
                      <div>
                        <h4 className="text-xs font-extrabold text-white">{seg.name}</h4>
                        <p className="text-[10px] text-slate-450 mt-1">
                          Critères : {seg.criteria.status ? `Statut = ${seg.criteria.status}` : 'Tous les prospects'}
                        </p>
                      </div>
                      <span className="px-2.5 py-1 rounded bg-brand-emerald/10 text-brand-emerald text-xs font-black">
                        {filtered.length} client(s)
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Tab: Kanban */}
        {activeTab === 'kanban' && (
          <div className="flex flex-col gap-6 text-left animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 overflow-x-auto pb-4">
              {(['Prospect', 'Négociation', 'Vendu', 'En cours de livraison', 'Livré & Adopté'] as const).map((status) => {
                const laneClients = teamClients.filter(c => c.status === status);
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
                  <div key={status} className="flex flex-col gap-3 min-w-[200px] bg-[#090d16]/40 p-3 rounded-2xl border border-slate-800/80 min-h-[500px]">
                    <div className={`p-2.5 rounded-xl border ${borderColor} ${badgeBg} flex items-center justify-between`}>
                      <span className={`text-xs font-black uppercase tracking-wider ${titleColor}`}>
                        {status}
                      </span>
                      <span className="text-[10px] bg-slate-900 px-2 py-0.5 rounded font-black text-slate-300">
                        {laneClients.length}
                      </span>
                    </div>

                    <div className="flex flex-col gap-2.5 overflow-y-auto max-h-[600px] scrollbar-none">
                      {laneClients.length === 0 ? (
                        <p className="text-[10px] text-slate-655 text-center py-8">Aucun prospect</p>
                      ) : (
                        laneClients.map(c => {
                          const comm = teamMembers.find(t => t.id === c.assigned_to);
                          return (
                            <div key={c.id} className="p-3.5 rounded-xl bg-slate-950 border border-slate-900 flex flex-col gap-2.5 shadow-sm hover:border-slate-800 transition-all text-left">
                              <div>
                                <h4 className="text-xs font-bold text-slate-200 truncate">{c.name}</h4>
                                <p className="text-[10px] text-slate-500 truncate mt-0.5">{c.company || 'Individuel'}</p>
                              </div>
                              
                              <div className="flex justify-between items-center border-t border-slate-900/60 pt-2 text-[9px] text-slate-455 font-semibold">
                                <span>Wara: {comm?.name || '—'}</span>
                              </div>

                              <div className="flex justify-between gap-1 mt-1 border-t border-slate-900 pt-2">
                                <button
                                  disabled={status === 'Prospect'}
                                  onClick={async () => {
                                    const statuses: LocalClient['status'][] = ['Prospect', 'Négociation', 'Vendu', 'En cours de livraison', 'Livré & Adopté'];
                                    const currentIndex = statuses.indexOf(status);
                                    if (currentIndex > 0) {
                                      await updateClientStatus(c.id, statuses[currentIndex - 1], user?.id || 'mgr-uuid');
                                    }
                                  }}
                                  className="flex-1 py-1 rounded bg-[#090d16] hover:bg-slate-800 text-slate-400 hover:text-slate-200 text-[10px] font-bold disabled:opacity-30 cursor-pointer flex justify-center items-center"
                                >
                                  <ChevronLeft className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  disabled={status === 'Livré & Adopté'}
                                  onClick={async () => {
                                    const statuses: LocalClient['status'][] = ['Prospect', 'Négociation', 'Vendu', 'En cours de livraison', 'Livré & Adopté'];
                                    const currentIndex = statuses.indexOf(status);
                                    if (currentIndex < statuses.length - 1) {
                                      await updateClientStatus(c.id, statuses[currentIndex + 1], user?.id || 'mgr-uuid');
                                    }
                                  }}
                                  className="flex-1 py-1 rounded bg-[#090d16] hover:bg-slate-800 text-slate-400 hover:text-slate-200 text-[10px] font-bold disabled:opacity-30 cursor-pointer flex justify-center items-center"
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
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-emerald/10 text-brand-emerald text-xs font-bold border border-brand-emerald/20">
                <Activity className="w-3.5 h-3.5 animate-pulse" />
                <span>ZONE FEED</span>
              </div>
            </div>

            <div className="flex flex-col gap-4 pl-4 border-l border-slate-800">
              {interactions
                .filter(int => {
                  const comm = teamMembers.find(t => t.id === int.performed_by);
                  return comm?.manager_id === user?.id;
                })
                .slice(0, 15)
                .map((int) => {
                  const client = teamClients.find(c => c.id === int.client_id);
                  const comm = teamMembers.find(t => t.id === int.performed_by);
                  
                  let badgeStyle = 'bg-slate-900 text-slate-400';
                  if (int.type === 'appel') badgeStyle = 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
                  if (int.type === 'whatsapp') badgeStyle = 'bg-brand-emerald/10 text-brand-emerald border border-brand-emerald/20';
                  if (int.type === 'terrain') badgeStyle = 'bg-brand-orange/10 text-brand-orange border border-brand-orange/20';
                  if (int.type === 'statut') badgeStyle = 'bg-amber-400/10 text-amber-400 border border-amber-400/20';

                  return (
                    <div key={int.id} className="relative flex flex-col gap-1.5 pb-2 text-left">
                      <div className="absolute left-[-21px] top-1.5 w-2 h-2 rounded-full bg-brand-emerald ring-4 ring-[#05070c]" />
                      
                      <div className="flex items-center gap-2 text-xs text-slate-500 font-semibold">
                        <span>{new Date(int.created_at).toLocaleString()}</span>
                        <span>•</span>
                        <span className="text-slate-350">{comm?.name || 'Wara'}</span>
                      </div>

                      <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-900 flex items-start gap-4 shadow-md glass-panel">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase shrink-0 ${badgeStyle}`}>
                          {int.type}
                        </span>
                        <div className="flex-1 text-xs">
                          <p className="text-slate-300 font-medium leading-relaxed">
                            {int.details} {client && <span>concernant <strong>{client.name}</strong> ({client.company || 'Sans entreprise'})</span>}
                          </p>
                          {int.gps_coordinates && (
                            <p className="text-[10px] text-brand-orange font-bold mt-1.5 flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5" /> GPS vérifié : {int.gps_coordinates}
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

        {/* Tab: Reassign */}
        {activeTab === 'reassign' && (
          <div className="p-6 rounded-2xl bg-slate-950/45 border border-slate-800 text-left max-w-xl mx-auto shadow-xl animate-fade-in flex flex-col gap-6">
            <h3 className="text-base font-bold text-white">Attribution en masse (Bulk Assign)</h3>
            <form onSubmit={handleReassign} className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-400 uppercase">1. Sélectionner les clients ({selectedClientIds.length} sélectionnés)</label>
                <div className="max-h-60 overflow-y-auto bg-[#090d16] border border-slate-800 rounded-xl p-2 flex flex-col gap-1">
                  {teamClients.map((c) => (
                    <label key={c.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-900 cursor-pointer border border-transparent hover:border-slate-800 transition-all">
                      <input 
                        type="checkbox" 
                        className="accent-brand-emerald w-4 h-4 cursor-pointer"
                        checked={selectedClientIds.includes(c.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedClientIds([...selectedClientIds, c.id]);
                          } else {
                            setSelectedClientIds(selectedClientIds.filter(id => id !== c.id));
                          }
                        }}
                      />
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-200">{c.name}</span>
                        <span className="text-[10px] text-slate-500">Actuel: {getCommercialName(c.assigned_to)}</span>
                      </div>
                    </label>
                  ))}
                  {teamClients.length === 0 && (
                    <p className="text-xs text-slate-500 p-4 text-center">Aucun client dans la zone.</p>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase">2. Choisir le nouveau commercial</label>
                <select
                  required
                  value={selectedCommercialId}
                  onChange={(e) => setSelectedCommercialId(e.target.value)}
                  className="px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:outline-none focus:border-brand-emerald text-sm text-slate-300"
                >
                  <option value="">-- Choisir un Wara --</option>
                  {teamMembers.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.zone})
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                disabled={selectedClientIds.length === 0 || !selectedCommercialId}
                className="w-full mt-2 py-3.5 rounded-xl bg-brand-emerald hover:bg-brand-emerald/95 text-white font-bold text-sm shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 disabled:grayscale"
              >
                <RefreshCw className="w-4 h-4 animate-spin-slow" />
                <span>Transférer {selectedClientIds.length} client(s)</span>
              </button>
            </form>
          </div>
        )}

        {/* Tab: Recruit */}
        {activeTab === 'recruit' && (
          <div className="grid lg:grid-cols-2 gap-8 text-left animate-fade-in">
            <div className="p-6 rounded-2xl bg-slate-950/45 border border-slate-800 shadow-xl flex flex-col gap-6">
              <form onSubmit={handleRecruitWara} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase">Nom Complet</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Amadou Diallo"
                    value={newWaraName}
                    onChange={(e) => setNewWaraName(e.target.value)}
                    className="px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:outline-none focus:border-brand-emerald text-sm text-slate-200"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase">Adresse e-mail</label>
                  <input
                    type="email"
                    required
                    placeholder="Ex: amadou@djagocrm.ci"
                    value={newWaraEmail}
                    onChange={(e) => setNewWaraEmail(e.target.value)}
                    className="px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:outline-none focus:border-brand-emerald text-sm text-slate-200"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-400 uppercase">Zone Affectée</label>
                    <input
                      type="text"
                      disabled
                      value={user?.zone || '—'}
                      className="px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-550 text-sm cursor-not-allowed"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-400 uppercase">Rôle</label>
                    <input
                      type="text"
                      disabled
                      value="Commercial"
                      className="px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-550 text-sm cursor-not-allowed"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full mt-2 py-3 rounded-xl bg-brand-emerald hover:bg-brand-emerald/95 text-white font-bold text-sm shadow-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Enregistrer le Wara</span>
                </button>
              </form>
            </div>

            <div className="p-6 rounded-2xl bg-slate-950/45 border border-slate-800 shadow-xl flex flex-col gap-4">
              <h3 className="text-lg font-bold text-white">Mon Équipe terrain</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 text-xs">
                      <th className="py-2.5 px-4 text-left">Commercial</th>
                      <th className="py-2.5 px-4 text-left">Adresse e-mail</th>
                      <th className="py-2.5 px-4 text-left">Zone</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teamMembers.map((m) => (
                      <tr key={m.id} className="border-b border-slate-850 hover:bg-slate-900/30">
                        <td className="py-3 px-4 font-semibold text-white">{m.name}</td>
                        <td className="py-3 px-4 text-slate-350 text-xs">{m.email}</td>
                        <td className="py-3 px-4 text-slate-400 font-semibold">{m.zone}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab: Templates */}
        {activeTab === 'templates' && (
          <div className="p-6 rounded-2xl bg-slate-950/45 border border-slate-800 text-left max-w-2xl mx-auto shadow-xl flex flex-col gap-6 animate-fade-in">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase">Relance Devis (modèle 'devis')</label>
                <textarea
                  rows={3}
                  value={tempDevisTemplate}
                  onChange={(e) => setTempDevisTemplate(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-850 focus:outline-none focus:border-brand-emerald text-xs text-slate-200"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase">Alerte Livraison (modèle 'livraison')</label>
                <textarea
                  rows={3}
                  value={tempLivraisonTemplate}
                  onChange={(e) => setTempLivraisonTemplate(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-850 focus:outline-none focus:border-brand-emerald text-xs text-slate-200"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase">Fidélisation Client (modèle 'fidelisation')</label>
                <textarea
                  rows={3}
                  value={tempFidelisationTemplate}
                  onChange={(e) => setTempFidelisationTemplate(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-850 focus:outline-none focus:border-brand-emerald text-xs text-slate-200"
                />
              </div>

              <button
                onClick={handleSaveTemplates}
                className="w-full py-3 rounded-xl bg-brand-emerald hover:bg-brand-emerald/95 text-white font-bold text-sm shadow-lg transition-all cursor-pointer"
              >
                Sauvegarder les Modèles
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Edit Order Modal */}
      {selectedOrderForEdit && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl flex flex-col gap-4 text-left">
            <div className="flex justify-between items-start border-b border-slate-800 pb-2">
              <h4 className="font-extrabold text-white text-base">Éditer Commande & Livreur</h4>
              <button 
                onClick={() => setSelectedOrderForEdit(null)}
                className="p-1 rounded bg-slate-950 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateOrder} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-450 uppercase">Statut Paiement</label>
                <select 
                  value={editPaymentStatus} onChange={e => setEditPaymentStatus(e.target.value as never)}
                  className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300"
                >
                  <option value="unpaid">Non payé</option>
                  <option value="partial">Partiel</option>
                  <option value="paid">Payé</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-455 uppercase">Statut Livraison</label>
                <select 
                  value={editDeliveryStatus} onChange={e => setEditDeliveryStatus(e.target.value as never)}
                  className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300"
                >
                  <option value="preparing">En préparation</option>
                  <option value="shipping">En chemin</option>
                  <option value="delivered">Livré</option>
                  <option value="returned">Retourné</option>
                </select>
              </div>

              <button type="submit" className="w-full py-2.5 rounded-xl bg-brand-emerald text-white text-xs font-bold cursor-pointer">
                Valider les Modifications
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Client Detail Modal */}
      {selectedClientForModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl flex flex-col gap-5 text-left max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-start border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-xl font-bold text-white">{selectedClientForModal.name}</h3>
                <p className="text-xs text-slate-400">{selectedClientForModal.company || 'Sans entreprise'}</p>
              </div>
              <button 
                onClick={() => setSelectedClientForModal(null)}
                className="p-1.5 rounded-lg bg-slate-950 border border-slate-850 hover:bg-slate-800 text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid sm:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs text-slate-500 font-semibold uppercase">Téléphone</p>
                <p className="text-slate-250 mt-0.5 font-medium">{selectedClientForModal.phone}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 font-semibold uppercase">E-mail</p>
                <p className="text-slate-250 mt-0.5 font-medium">{selectedClientForModal.email || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 font-semibold uppercase">Statut Actuel</p>
                <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold bg-brand-emerald/15 text-brand-emerald border border-brand-emerald/20 mt-1">
                  {selectedClientForModal.status}
                </span>
              </div>
              <div>
                <p className="text-xs text-slate-500 font-semibold uppercase">Assigné à</p>
                <p className="text-slate-250 mt-0.5 font-semibold">
                  {getCommercialName(selectedClientForModal.assigned_to)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
