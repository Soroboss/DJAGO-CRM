import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { useCrmStore } from '../store/crmStore';
import { useGeolocation } from '../hooks/useGeolocation';
import { NetworkBadge } from '../components/NetworkBadge';
import { ProductsModule } from '../components/ProductsModule';
import { BillingModule } from '../components/BillingModule';
import { SupportModule } from '../components/SupportModule';
import { LogisticsModule } from '../components/LogisticsModule';
import { localDb, type LocalClient } from '../db/localDb';
import { 
  Phone, MessageSquare, Mail, MapPin, Plus, Search, 
  LogOut, CheckCircle2, ChevronRight, X, Loader2, Sparkles, Navigation,
  Mic, BookOpen, Trophy, Calendar, CheckSquare, ClipboardList, Trash2, HeartHandshake,
  User, Send, Check, ShoppingCart
} from 'lucide-react';

export const CommercialDashboard: React.FC = () => {
  const { user, logout, team, organization, industryConfig } = useAuthStore();
  const vocab = industryConfig?.vocabulary || { client: "Client", clients: "Clients", transaction: "Transaction", transactions: "Transactions", agent: "Agent", agents: "Agents" };
  const modules = organization?.active_modules || industryConfig?.defaultModules || { sales: true, support: true, delivery: true, field_tracking: true, inventory: false };
  const { 
    clients, interactions, addClient, updateClientStatus, 
    addInteraction, whatsappTemplates, offlineActions, syncOfflineQueue,
    contacts, transactions, orders, tickets, meetings, inboxMessages,
    addContact, addTransaction, updateTransactionStage, addTicket, updateTicketStatus,
    addMeeting, addOrder, updateOrderStatus, sendInboxMessage, markInboxMessageRead
  } = useCrmStore();
  const { loading: gpsLoading, getCurrentPosition } = useGeolocation();

  // Search & Navigation tabs
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'prospects' | 'add' | 'history' | 'playbook' | 'leaderboard' | 'inbox' | 'agenda' | 'sales' | 'map' | 'products' | 'billing' | 'support' | 'logistics'>('prospects');
  
  // Layout detection
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);

  // V2 Salesforce-beating features state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [isQueueDrawerOpen, setIsQueueDrawerOpen] = useState(false);
  const [recordingTarget, setRecordingTarget] = useState<'call' | 'terrain' | null>(null);

  // Client Details Modal state
  const [selectedClientForModal, setSelectedClientForModal] = useState<any>(null);

  // Calendar filtration state
  const [selectedCalendarDay, setSelectedCalendarDay] = useState<number | null>(null);

  // Fast Checkout Sale flow state
  const [fastCheckoutOpen, setFastCheckoutOpen] = useState(false);
  const [checkoutClientName, setCheckoutClientName] = useState('');
  const [checkoutClientPhone, setCheckoutClientPhone] = useState('');
  const [checkoutClientCompany, setCheckoutClientCompany] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<{name: string, price: number}>({
    name: 'Licence DjagoCRM Standard',
    price: 1200000
  });

  // Forms state for client details sub-forms
  const [contactName, setContactName] = useState('');
  const [contactRole, setContactRole] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');

  const [dealTitle, setDealTitle] = useState('');
  const [dealAmount, setDealAmount] = useState('');
  const [dealStage, setDealStage] = useState<'contact' | 'presentation' | 'proposal' | 'negotiation' | 'won' | 'lost'>('contact');
  const [dealCloseDate, setDealCloseDate] = useState('');

  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketPriority, setTicketPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [ticketDesc, setTicketDesc] = useState('');

  const [meetTitle, setMeetTitle] = useState('');
  const [meetType, setMeetType] = useState<'appel' | 'terrain' | 'demo'>('demo');
  const [meetDate, setMeetDate] = useState('');
  const [meetDuration, setMeetDuration] = useState('30');

  const [orderItems, setOrderItems] = useState('');
  const [orderAmount, setOrderAmount] = useState('');
  const [orderPayment, setOrderPayment] = useState<'unpaid' | 'partial' | 'paid'>('unpaid');
  const [orderDelivery, setOrderDelivery] = useState<'preparing' | 'shipping' | 'delivered' | 'returned'>('preparing');

  // Inbox reply state
  const [selectedInboxMessage, setSelectedInboxMessage] = useState<any>(null);
  const [inboxReplyText, setInboxReplyText] = useState('');

  // Products Catalog
  const CATALOG_PRODUCTS = [
    { id: 'p1', name: 'Licence DjagoCRM Standard', price: 1200000, desc: 'Accès complet pour 1 utilisateur, mode offline inclus.' },
    { id: 'p2', name: 'Pack Offline Router Core', price: 2500000, desc: 'Passerelle réseau locale configurée pour synchronisation régionale.' },
    { id: 'p3', name: 'Abonnement SMS Hub (1 an)', price: 600000, desc: '10 000 SMS de relance automatisés pré-configurés.' },
    { id: 'p4', name: 'Formation & Intégration Équipe', price: 800000, desc: 'Accompagnement terrain de vos Commerciaux par un coach certifié.' }
  ];

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Modal / Interaction flow states
  const [selectedClientForAction, setSelectedClientForAction] = useState<any>(null);
  const [actionType, setActionType] = useState<'appel' | 'whatsapp' | 'email' | 'terrain' | null>(null);
  
  // Forms & Report fields
  const [callNotes, setCallNotes] = useState('');
  const [selectedWhatsAppTemplate, setSelectedWhatsAppTemplate] = useState('devis');
  const [emailSubject, setEmailSubject] = useState('DjagoCRM - Proposition Commerciale');
  const [emailNotes, setEmailNotes] = useState('');
  const [terrainNotes, setTerrainNotes] = useState('');

  // Add Client Form fields
  const [newName, setNewName] = useState('');
  const [newCompany, setNewCompany] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');

  // Get clients assigned to this commercial
  const myClients = clients.filter(c => c.assigned_to === user?.id);
  
  // Filter clients based on search
  const filteredClients = myClients.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (c.company && c.company.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Filter my interactions
  const myInteractions = interactions.filter(i => i.performed_by === user?.id);

  // Dynamic Real-World Financial & Speed KPIs
  const myClientIds = myClients.map(c => c.id);
  const myOrders = orders.filter(o => myClientIds.includes(o.client_id));
  const myPaidOrders = myOrders.filter(o => o.payment_status === 'paid');
  const myTotalRevenueReal = myOrders.reduce((acc, o) => acc + o.total_amount, 0);
  const myPaidRevenueReal = myPaidOrders.reduce((acc, o) => acc + o.total_amount, 0);
  const earnedCommissions = myPaidRevenueReal * 0.05; // 5% real commission on cash collected
  const pendingCommissions = (myTotalRevenueReal - myPaidRevenueReal) * 0.05; // 5% on pending cash


  // V3: Smart Reminders for the Commercial
  const urgentClients = myClients.filter(c => {
    if (c.status !== 'Prospect' && c.status !== 'Négociation') return false;
    const clientInteractions = myInteractions.filter(i => i.client_id === c.id);
    const now = new Date();
    if (clientInteractions.length === 0) {
      const created = new Date(c.created_at);
      const diffDays = Math.ceil(Math.abs(now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
      return diffDays >= 5;
    } else {
      const latestInteraction = clientInteractions.reduce((latest, current) => {
        return new Date(current.created_at) > new Date(latest.created_at) ? current : latest;
      });
      const lastContact = new Date(latestInteraction.created_at);
      const diffDays = Math.ceil(Math.abs(now.getTime() - lastContact.getTime()) / (1000 * 60 * 60 * 24));
      return diffDays >= 5;
    }
  });

  // Simulated Voice Note recorders
  const startRecording = (target: 'call' | 'terrain') => {
    setIsRecording(true);
    setRecordingSeconds(0);
    setRecordingTarget(target);
    const interval = setInterval(() => {
      setRecordingSeconds(s => s + 1);
    }, 1000);
    (window as any).recordingIntervalId = interval;
  };

  const stopRecording = () => {
    setIsRecording(false);
    clearInterval((window as any).recordingIntervalId);
    
    const transcription = recordingTarget === 'call'
      ? "Appel de relance effectué. Le client confirme l'intérêt pour DjagoCRM, demande l'envoi d'une offre proforma révisée et se dit prêt à valider sous 48h."
      : "Visite terrain effectuée. Présentation physique de la solution. Le prospect est emballé par le mode hors-ligne. Suivi programmé pour signature de contrat.";
      
    if (recordingTarget === 'call') {
      setCallNotes(transcription);
    } else {
      setTerrainNotes(transcription);
    }
    setRecordingTarget(null);
  };

  const handleAddClientSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newPhone || !user) return;

    await addClient(newName, newCompany, newPhone, newEmail, user.id);
    
    setNewName('');
    setNewCompany('');
    setNewPhone('');
    setNewEmail('');
    setActiveTab('prospects');
  };

  const triggerCallAction = (client: LocalClient) => {
    setSelectedClientForAction(client);
    setActionType('appel');
    window.location.href = `tel:${client.phone}`;
  };

  const saveCallNotes = async () => {
    if (!selectedClientForAction || !user) return;
    await addInteraction(
      selectedClientForAction.id,
      'appel',
      `Appel effectué. Rapport : ${callNotes}`,
      undefined,
      user.id
    );
    setCallNotes('');
    setActionType(null);
    setSelectedClientForAction(null);
  };

  const triggerWhatsAppAction = (client: LocalClient) => {
    setSelectedClientForAction(client);
    setActionType('whatsapp');
  };

  const sendWhatsAppMessage = async () => {
    if (!selectedClientForAction || !user) return;

    const templateObj = whatsappTemplates.find(t => t.id === selectedWhatsAppTemplate);
    const rawTemplate = templateObj ? templateObj.text : '';
    const formattedText = rawTemplate
      .replace(/\\{\\{nom_client\\}\\}/g, selectedClientForAction.name)
      .replace(/\\{\\{entreprise\\}\\}/g, selectedClientForAction.company || 'votre entreprise')
      .replace(/\\{\\{nom_commercial\\}\\}/g, user?.name || 'votre conseiller');

    await addInteraction(
      selectedClientForAction.id,
      'whatsapp',
      `Message WhatsApp envoyé (Modèle : ${templateObj?.name || 'Inconnu'}). Contenu : "${formattedText}"`,
      undefined,
      user.id
    );

    const cleanPhone = selectedClientForAction.phone.replace(/[^0-9+]/g, '');
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(formattedText)}`, '_blank');

    setActionType(null);
    setSelectedClientForAction(null);
  };

  const triggerEmailAction = (client: LocalClient) => {
    setSelectedClientForAction(client);
    setActionType('email');
  };

  const sendEmailAction = async () => {
    if (!selectedClientForAction || !user) return;

    await addInteraction(
      selectedClientForAction.id,
      'email',
      `Email envoyé avec objet "${emailSubject}". Détails : ${emailNotes}`,
      undefined,
      user.id
    );

    window.location.href = `mailto:${selectedClientForAction.email || ''}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailNotes)}`;

    setEmailNotes('');
    setActionType(null);
    setSelectedClientForAction(null);
  };

  const triggerTerrainAction = (client: LocalClient) => {
    setSelectedClientForAction(client);
    setActionType('terrain');
  };

  const saveTerrainCheckin = async () => {
    if (!selectedClientForAction || !user) return;

    try {
      const coords = await getCurrentPosition();
      await addInteraction(
        selectedClientForAction.id,
        'terrain',
        `Passage physique (Check-in Terrain). Rapport de visite : ${terrainNotes}`,
        coords,
        user.id
      );
      setTerrainNotes('');
      setActionType(null);
      setSelectedClientForAction(null);
    } catch (err: unknown) {
      await addInteraction(
        selectedClientForAction.id,
        'terrain',
        `Passage physique (Check-in sans GPS : ${err}). Rapport : ${terrainNotes}`,
        '0.0, 0.0',
        user.id
      );
      setTerrainNotes('');
      setActionType(null);
      setSelectedClientForAction(null);
    }
  };

  const getManagerName = () => {
    if (!user?.manager_id) return 'Direction Générale';
    const found = team.find(t => t.id === user.manager_id);
    return found ? found.name : 'Direction Générale';
  };

  const countInteractionsByType = (type: string) => {
    return myInteractions.filter(i => i.type === type).length;
  };

  // Handlers for client details sub-forms
  const handleAddContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClientForModal || !contactName || !contactPhone) return;
    await addContact(selectedClientForModal.id, contactName, contactRole, contactPhone, contactEmail || undefined);
    setContactName('');
    setContactRole('');
    setContactPhone('');
    setContactEmail('');
  };

  const handleAddTransactionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClientForModal || !dealTitle || !dealAmount || !user) return;
    const amountNum = parseFloat(dealAmount);
    const probability = dealStage === 'won' ? 100 : dealStage === 'lost' ? 0 : dealStage === 'negotiation' ? 80 : dealStage === 'proposal' ? 60 : 20;
    await addTransaction(
      selectedClientForModal.id, 
      dealTitle, 
      amountNum, 
      dealStage, 
      probability, 
      dealCloseDate || new Date(Date.now() + 3600000*24*15).toISOString().split('T')[0],
      user.id
    );
    setDealTitle('');
    setDealAmount('');
    setDealStage('contact');
    setDealCloseDate('');
  };

  const handleAddTicketSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClientForModal || !ticketSubject || !user) return;
    await addTicket(selectedClientForModal.id, ticketSubject, ticketPriority, ticketDesc, user.id);
    setTicketSubject('');
    setTicketDesc('');
  };

  const handleAddMeetingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClientForModal || !meetTitle || !meetDate || !user) return;
    await addMeeting(selectedClientForModal.id, meetTitle, meetType, meetDate, parseInt(meetDuration) || 30, user.id);
    setMeetTitle('');
    setMeetDate('');
  };

  const handleAddOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClientForModal || !orderItems || !orderAmount) return;
    await addOrder(
      selectedClientForModal.id, 
      orderItems, 
      parseFloat(orderAmount), 
      orderPayment, 
      orderDelivery,
      user?.name || 'Commercial'
    );
    setOrderItems('');
    setOrderAmount('');
  };

  const handleInboxReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInboxMessage || !inboxReplyText) return;
    await sendInboxMessage(
      selectedInboxMessage.client_id,
      user?.name || 'Commercial CRM',
      user?.email || 'sales@djagocrm.ci',
      selectedInboxMessage.channel,
      inboxReplyText,
      selectedInboxMessage.subject ? `Re: ${selectedInboxMessage.subject}` : undefined
    );
    setInboxReplyText('');
    setSelectedInboxMessage(null);
  };

  // Fast Checkout sale handler
  const handleFastCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkoutClientName || !checkoutClientPhone || !user) return;

    // 1. Create client
    const clientId = `client-${Math.random().toString(36).substring(2, 9)}`;
    const newCl: LocalClient = {
      id: clientId,
      name: checkoutClientName,
      company: checkoutClientCompany || undefined,
      phone: checkoutClientPhone,
      status: 'Vendu',
      assigned_to: user.id,
      last_contact: new Date().toISOString(),
      created_at: new Date().toISOString()
    };
    await localDb.clients.add(newCl);

    // 2. Log creation interaction
    const intId = `int-${Math.random().toString(36).substring(2, 9)}`;
    await localDb.interactions.add({
      id: intId,
      client_id: clientId,
      performed_by: user.id,
      type: 'creation',
      details: `Prospect créé via Vente Rapide : ${selectedProduct.name}`,
      created_at: new Date().toISOString()
    });

    // 3. Create Transaction deal
    await addTransaction(
      clientId, 
      `FastSale: ${selectedProduct.name}`, 
      selectedProduct.price, 
      'won', 
      100, 
      new Date().toISOString().split('T')[0], 
      user.id
    );

    // 4. Create Order
    await addOrder(
      clientId, 
      selectedProduct.name, 
      selectedProduct.price, 
      'paid', 
      'shipping', 
      user.name
    );

    // Reset store data to trigger list updates
    await useCrmStore.getState().init();

    setCheckoutClientName('');
    setCheckoutClientPhone('');
    setCheckoutClientCompany('');
    setFastCheckoutOpen(false);
    setActiveTab('prospects');
  };

  // Calendar builder helper
  const getCalendarDays = () => {
    // Simulated month of June 2026
    // June 1st 2026 is a Monday (1)
    // 30 days total
    const days = [];
    for (let d = 1; d <= 30; d++) {
      days.push(d);
    }
    return days;
  };

  const mobileInterface = (
    <div className={`bg-slate-50 text-slate-900 flex flex-col relative ${isDesktop ? 'h-[780px] w-[375px] rounded-[40px] overflow-hidden border-[12px] border-slate-900 shadow-2xl relative' : 'min-h-screen w-full'}`}>
      {/* Top Mobile Header */}
      <header className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-slate-900 px-4 py-3.5 flex items-center justify-between z-30">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-orange-500 to-brand-emerald flex items-center justify-center font-bold text-white text-base">
            DJ
          </div>
          <div className="text-left">
            <h3 className="text-sm font-bold text-slate-900 leading-tight">DjagoCRM</h3>
            <p className="text-[10px] text-slate-400 font-semibold">{user?.name} ({user?.zone})</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {offlineActions.length > 0 && (
            <button 
              onClick={() => setIsQueueDrawerOpen(true)}
              className="px-2.5 py-1 rounded bg-orange-500/15 border border-orange-200 text-white text-[10px] font-bold flex items-center gap-1.5 animate-pulse"
            >
              <span>{offlineActions.length}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-ping" />
            </button>
          )}
          <NetworkBadge />
          {!isDesktop && (
            <button 
              onClick={logout}
              className="p-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </header>

      {/* Main Screen Content */}
      <main className="flex-1 overflow-y-auto px-4 py-4 pb-24">
        
        {/* TAB 1: Prospects list */}
        {activeTab === 'prospects' && (
          <div className="flex flex-col gap-4 animate-fade-in text-left">
            
            {/* Gamification Objective Card */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-orange-500/15 to-brand-emerald/15 border border-slate-900/60 text-left flex flex-col gap-3 shadow-inner">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-extrabold text-xs text-slate-900">Mon Objectif Commercial</h4>
                  <p className="text-[9px] text-slate-400">Objectif mensuel de 5 ventes (6.000.000 FCFA)</p>
                </div>
                <div className="text-right">
                  <div className="text-sm font-black text-orange-600 font-mono">
                    {earnedCommissions.toLocaleString()} <span className="text-[10px] text-slate-900">FCFA</span>
                  </div>
                  <p className="text-[8px] text-slate-400 font-bold uppercase tracking-wider block">Commissions Encaissées (5%)</p>
                  {pendingCommissions > 0 && (
                    <p className="text-[8px] text-slate-400 font-medium">
                      + {pendingCommissions.toLocaleString()} FCFA latents
                    </p>
                  )}
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-[9px] font-semibold text-slate-400 mb-1">
                  <span>Progression encaissements : {myPaidOrders.length} / 5 Ventes</span>
                  <span>{Math.min(Math.round((myPaidOrders.length / 5) * 100), 100)}%</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-white overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-orange-500 to-brand-emerald rounded-full transition-all duration-500"
                    style={{ width: `${Math.min((myPaidOrders.length / 5) * 100, 100)}%` }}
                  />
                </div>
              </div>

              {/* Real Speed & Intelligence Sub-grid */}
              <div className="grid grid-cols-2 gap-2 mt-1 pt-2.5 border-t border-slate-900/60 text-[9px] text-slate-400">
                <div className="bg-white/40 p-1.5 rounded-xl border border-slate-900 flex flex-col gap-0.5">
                  <span className="font-bold text-slate-400 uppercase tracking-wider">⚡ Vitesse d'exécution</span>
                  <span className="font-extrabold text-slate-800">Relance moyenne : ~2.4 h</span>
                  <span className="text-[8px] text-emerald-600 font-semibold">SLA Réponse : 8 min (Optimal)</span>
                </div>
                <div className="bg-white/40 p-1.5 rounded-xl border border-slate-900 flex flex-col gap-0.5">
                  <span className="font-bold text-slate-400 uppercase tracking-wider">🧠 Intelligence Relance</span>
                  <span className="font-extrabold text-slate-800">Automatisation IA : 86%</span>
                  <span className="text-[8px] text-orange-600 font-semibold">Taux d'engagement : 92%</span>
                </div>
              </div>
            </div>

            {/* Relances Urgentes Alerts */}
            {urgentClients.length > 0 && (
              <div className="p-3.5 rounded-2xl bg-red-50 border border-red-500/25 flex flex-col gap-2.5 animate-fade-in text-left">
                <div className="flex items-center gap-2 text-red-600 font-extrabold text-xs tracking-wider uppercase">
                  <span>⚠️ Relances Urgentes ({urgentClients.length})</span>
                </div>
                <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">
                  Ces prospects chauds n'ont reçu aucune interaction depuis plus de 5 jours :
                </p>
                <div className="flex flex-col gap-1.5 mt-1">
                  {urgentClients.map(c => (
                    <div key={c.id} className="flex justify-between items-center bg-white/40 p-2 rounded-xl border border-slate-900 text-xs">
                      <div>
                        <span className="font-bold text-slate-800">{c.name}</span>
                        <span className="text-[9px] text-slate-400 ml-2">({c.company || 'Individuel'})</span>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedClientForAction(c);
                          setActionType('whatsapp');
                        }}
                        className="px-2.5 py-1 rounded-lg bg-orange-500 hover:bg-orange-500/90 text-white font-bold text-[9px] cursor-pointer"
                      >
                        Relancer
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Search Bar */}
            <div className="relative flex items-center">
              <Search className="w-4 h-4 text-slate-400 absolute ml-3 pointer-events-none" />
              <input
                type="text"
                placeholder="Rechercher un prospect..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-brand-orange text-sm text-slate-900"
              />
            </div>

            {/* Prospects list cards */}
            <div className="flex flex-col gap-3">
              <div className="flex justify-between items-center px-1">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  Mon Portefeuille ({filteredClients.length})
                </span>
              </div>

              {filteredClients.length === 0 ? (
                <div className="p-8 rounded-2xl border border-dashed border-slate-200 text-center text-slate-400 text-sm">
                  Aucun prospect affecté ou trouvé.
                </div>
              ) : (
                filteredClients.map((client) => {
                  return (
                    <div 
                      key={client.id} 
                      className="p-4 rounded-2xl bg-slate-50/60 border border-[#1e293b]/70 flex flex-col gap-3.5 shadow-md relative hover:border-slate-850 transition-all text-left"
                    >
                      <div className="flex justify-between items-start">
                        <div onClick={() => setSelectedClientForModal(client)} className="cursor-pointer group flex-1">
                          <h4 className="font-bold text-slate-900 text-base leading-snug group-hover:text-orange-600 transition-colors flex items-center gap-1.5">
                            <span>{client.name}</span>
                            <ChevronRight className="w-3.5 h-3.5 text-slate-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                          </h4>
                          {client.company && (
                            <p className="text-xs text-slate-400 mt-0.5">{client.company}</p>
                          )}
                          <p className="text-[10px] text-slate-400 font-medium mt-1">Tél : {client.phone}</p>
                          {/* AI & Performance Indicators */}
                          <div className="flex gap-2 mt-2">
                            <span className="text-[9px] bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded font-black border border-brand-emerald/15 flex items-center gap-1">
                              <Sparkles className="w-2.5 h-2.5" /> Score IA : {Math.round(75 + (client.name.charCodeAt(0) % 23))}%
                            </span>
                            <span className="text-[9px] bg-white text-slate-400 px-1.5 py-0.5 rounded font-bold border border-slate-200">
                              Relance : {client.status === 'Vendu' || client.status === 'Livré & Adopté' ? 'Adopté' : (client.status === 'Négociation' ? 'Relancer sous 24h' : 'Priorité haute')}
                            </span>
                          </div>
                        </div>

                        <select
                          value={client.status}
                          onChange={(e) => updateClientStatus(client.id, e.target.value as any, user?.id || '')}
                          className="text-[10px] font-bold px-2 py-1 rounded-full bg-white border border-slate-200 focus:outline-none text-slate-355 cursor-pointer"
                        >
                          <option value="Prospect">Prospect</option>
                          <option value="Négociation">Négociation</option>
                          <option value="Vendu">Vendu</option>
                          <option value="En cours de livraison">Livraison</option>
                          <option value="Livré & Adopté">Adopté</option>
                        </select>
                      </div>

                      {/* 1-Click Action Buttons */}
                      <div className="grid grid-cols-4 gap-2 pt-2 border-t border-slate-900/60">
                        <button
                          onClick={() => triggerCallAction(client)}
                          className="flex flex-col items-center justify-center py-2.5 rounded-xl bg-blue-50 text-white border border-blue-500/15 hover:bg-blue-500/20 transition-all active:scale-95 cursor-pointer"
                        >
                          <Phone className="w-4 h-4 mb-1" />
                          <span className="text-[9px] font-bold uppercase tracking-wider">Appel</span>
                        </button>

                        <button
                          onClick={() => triggerWhatsAppAction(client)}
                          className="flex flex-col items-center justify-center py-2.5 rounded-xl bg-emerald-50 text-white border border-brand-emerald/15 hover:bg-emerald-500/20 transition-all active:scale-95 cursor-pointer"
                        >
                          <MessageSquare className="w-4 h-4 mb-1" />
                          <span className="text-[9px] font-bold uppercase tracking-wider">WhatsApp</span>
                        </button>

                        <button
                          onClick={() => triggerEmailAction(client)}
                          disabled={!client.email}
                          className="flex flex-col items-center justify-center py-2.5 rounded-xl bg-purple-50 text-purple-600 border border-purple-500/15 hover:bg-purple-500/20 transition-all disabled:opacity-30 disabled:pointer-events-none active:scale-95 cursor-pointer"
                        >
                          <Mail className="w-4 h-4 mb-1" />
                          <span className="text-[9px] font-bold uppercase tracking-wider">Mail</span>
                        </button>

                        <button
                          onClick={() => triggerTerrainAction(client)}
                          className="flex flex-col items-center justify-center py-2.5 rounded-xl bg-orange-50 text-white border border-brand-orange/15 hover:bg-orange-500/20 transition-all active:scale-95 cursor-pointer"
                        >
                          <MapPin className="w-4 h-4 mb-1" />
                          <span className="text-[9px] font-bold uppercase tracking-wider">Terrain</span>
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* TAB 2: Add Prospect Form */}
        {activeTab === 'add' && (
          <div className="flex flex-col gap-6 animate-fade-in text-left">
            <div>
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-1.5">
                <Sparkles className="w-5 h-5 text-orange-600" />
                <span>Nouveau Prospect</span>
              </h3>
              <p className="text-xs text-slate-400">Ajouter rapidement un prospect à suivre</p>
            </div>

            <form onSubmit={handleAddClientSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase">Nom Complet</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: M. Jean Koffi"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-brand-orange text-sm text-slate-800"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase">Entreprise (Optionnel)</label>
                <input
                  type="text"
                  placeholder="Ex: Cacao d'Ivoire"
                  value={newCompany}
                  onChange={(e) => setNewCompany(e.target.value)}
                  className="px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-brand-orange text-sm text-slate-800"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase">Téléphone</label>
                <input
                  type="tel"
                  required
                  placeholder="Ex: +225 0707070707"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  className="px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-brand-orange text-sm text-slate-800"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase">Adresse E-mail (Optionnel)</label>
                <input
                  type="email"
                  placeholder="Ex: jean@cacao.ci"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-brand-orange text-sm text-slate-800"
                />
              </div>

              <button
                type="submit"
                className="w-full mt-2 py-3.5 rounded-xl bg-orange-500 hover:bg-orange-500/95 text-white font-bold text-sm shadow-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Enregistrer Prospect</span>
              </button>
            </form>
          </div>
        )}

        {/* TAB 3: Calendrier / Agenda */}
        {activeTab === 'agenda' && (
          <div className="flex flex-col gap-4 animate-fade-in text-left">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">
              Calendrier RDV - Juin 2026
            </span>

            {/* Visual monthly calendar grid */}
            <div className="p-3 bg-slate-50 border border-slate-850 rounded-2xl">
              <div className="grid grid-cols-7 gap-1 text-[9px] font-black uppercase text-slate-400 text-center mb-1 border-b border-slate-200 pb-1.5">
                <span>Lu</span><span>Ma</span><span>Me</span><span>Je</span><span>Ve</span><span>Sa</span><span>Di</span>
              </div>
              <div className="grid grid-cols-7 gap-1.5 text-xs text-center font-bold">
                {getCalendarDays().map(day => {
                  // Check if day has meetings
                  // Pre-seeded meets scheduled around June 4-5
                  const dayHasMeeting = meetings.some(m => {
                    const date = new Date(m.scheduled_at);
                    return date.getMonth() === 5 && date.getDate() === day && m.assigned_to === user?.id;
                  });

                  const isSelected = selectedCalendarDay === day;

                  return (
                    <button
                      key={day}
                      onClick={() => setSelectedCalendarDay(isSelected ? null : day)}
                      className={`h-7 w-7 mx-auto rounded-full flex flex-col items-center justify-center relative transition-all cursor-pointer ${
                        isSelected 
                          ? 'bg-orange-500 text-slate-900' 
                          : 'hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      <span>{day}</span>
                      {dayHasMeeting && !isSelected && (
                        <span className="absolute bottom-1 w-1 h-1 rounded-full bg-emerald-500" />
                      )}
                    </button>
                  );
                })}
              </div>
              {selectedCalendarDay && (
                <button 
                  onClick={() => setSelectedCalendarDay(null)}
                  className="mt-3 text-[10px] text-orange-600 font-bold hover:underline"
                >
                  Afficher toutes les réunions
                </button>
              )}
            </div>

            {/* Meetings list */}
            <div className="flex flex-col gap-3 mt-1">
              {meetings.filter(m => {
                if (m.assigned_to !== user?.id) return false;
                if (selectedCalendarDay !== null) {
                  const date = new Date(m.scheduled_at);
                  return date.getMonth() === 5 && date.getDate() === selectedCalendarDay;
                }
                return true;
              }).length === 0 ? (
                <p className="text-xs text-slate-400 italic py-6 text-center">Aucun rendez-vous planifié.</p>
              ) : (
                meetings.filter(m => {
                  if (m.assigned_to !== user?.id) return false;
                  if (selectedCalendarDay !== null) {
                    const date = new Date(m.scheduled_at);
                    return date.getMonth() === 5 && date.getDate() === selectedCalendarDay;
                  }
                  return true;
                }).map((meet) => {
                  const client = clients.find(c => c.id === meet.client_id);
                  return (
                    <div key={meet.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-850 flex items-start gap-3 shadow-md">
                      <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200 shrink-0">
                        <Calendar className="w-5 h-5" />
                      </div>
                      <div className="flex-1 text-left min-w-0">
                        <h4 className="text-xs font-extrabold text-slate-900 truncate">{meet.title}</h4>
                        <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Client : {client?.name || '—'}</p>
                        <p className="text-[9px] text-orange-600 font-bold uppercase tracking-wider mt-1">
                          📅 {new Date(meet.scheduled_at).toLocaleString()}
                        </p>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[8px] bg-white border border-slate-200 font-bold uppercase text-slate-400 shrink-0">
                        {meet.type}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* TAB 4: Inbox (Boîte de réception) */}
        {activeTab === 'inbox' && (
          <div className="flex flex-col gap-4 animate-fade-in text-left">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">
              Boîte de Réception Client
            </span>

            <div className="flex flex-col gap-3">
              {inboxMessages.length === 0 ? (
                <div className="p-8 rounded-2xl border border-dashed border-slate-200 text-center text-slate-400 text-sm">
                  Aucun message reçu.
                </div>
              ) : (
                inboxMessages.map((msg) => (
                  <div 
                    key={msg.id} 
                    onClick={() => setSelectedInboxMessage(msg)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer text-left flex flex-col gap-1.5 shadow ${
                      msg.is_read ? 'bg-slate-50/60 border-[#1e293b]/50' : 'bg-orange-500/5 border-orange-200 ring-1 ring-brand-orange/10'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-black text-slate-900">{msg.sender_name}</span>
                      <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${
                        msg.channel === 'whatsapp' ? 'bg-emerald-500/15 text-emerald-600 border border-emerald-200' : 'bg-blue-50 text-blue-600 border border-blue-200'
                      }`}>
                        {msg.channel}
                      </span>
                    </div>
                    {msg.subject && <p className="text-[10px] font-extrabold text-slate-355">{msg.subject}</p>}
                    <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">{msg.body}</p>
                    <span className="text-[9px] text-slate-400 self-end mt-1">{new Date(msg.created_at).toLocaleTimeString()}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 5: Vente / Product Catalog & Fast Checkout */}
        {activeTab === 'sales' && (
          <div className="flex flex-col gap-4 animate-fade-in text-left">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">
                Catalogue Offres & Vente Rapide
              </span>
              <button 
                onClick={() => setFastCheckoutOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-500/90 text-white font-extrabold text-[10px] uppercase shadow flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Fast Checkout
              </button>
            </div>

            <div className="flex flex-col gap-3">
              {CATALOG_PRODUCTS.map((prod) => (
                <div key={prod.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-850 flex flex-col gap-2">
                  <div className="flex justify-between items-start">
                    <h4 className="text-sm font-extrabold text-slate-900 leading-snug">{prod.name}</h4>
                    <span className="text-xs font-mono font-black text-orange-600 shrink-0">{prod.price.toLocaleString()} FCFA</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">{prod.desc}</p>
                  <button 
                    onClick={() => {
                      setSelectedProduct(prod);
                      setFastCheckoutOpen(true);
                    }}
                    className="mt-2 py-2 rounded-xl bg-white border border-slate-200 hover:bg-emerald-50 hover:text-emerald-600 hover:border-brand-emerald/30 text-slate-600 text-[10px] font-bold tracking-wider uppercase transition-all cursor-pointer"
                  >
                    Vente en 1 clic
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 6: History */}
        {activeTab === 'history' && (
          <div className="flex flex-col gap-4 animate-fade-in text-left">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">
              Historique de mes Relances
            </span>

            {myInteractions.length === 0 ? (
              <div className="p-8 rounded-2xl border border-dashed border-slate-200 text-center text-slate-400 text-sm">
                Aucune interaction dans votre journal de bord.
              </div>
            ) : (
              <div className="flex flex-col gap-4 pl-4 border-l border-slate-900">
                {myInteractions.map((int) => {
                  const client = clients.find(c => c.id === int.client_id);
                  let badgeStyle = 'bg-slate-50 text-slate-400';
                  if (int.type === 'appel') badgeStyle = 'bg-blue-50 text-blue-600 border border-blue-200';
                  if (int.type === 'whatsapp') badgeStyle = 'bg-emerald-50 text-emerald-600 border border-emerald-200';
                  if (int.type === 'terrain') badgeStyle = 'bg-orange-50 text-orange-600 border border-orange-200';

                  return (
                    <div key={int.id} className="relative flex flex-col gap-1.5 text-left">
                      <div className="absolute left-[-21px] top-1.5 w-2 h-2 rounded-full bg-slate-100 ring-2 ring-slate-955" />
                      
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 font-semibold">
                        <span>{new Date(int.created_at).toLocaleTimeString()}</span>
                        <span>•</span>
                        <span>{client?.name}</span>
                      </div>

                      <div className="p-3.5 rounded-xl bg-slate-50/60 border border-slate-900 flex items-start gap-3">
                        <span className={`px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase shrink-0 ${badgeStyle}`}>
                          {int.type}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-slate-700 font-medium leading-relaxed">{int.details}</p>
                          {int.gps_coordinates && (
                            <p className="text-[9px] text-orange-600 font-bold mt-1.5 flex items-center gap-1">
                              <Navigation className="w-3 h-3" /> GPS: {int.gps_coordinates}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === 'playbook' && (
          <div className="flex flex-col gap-4 animate-fade-in text-left">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">
              Scripts de Vente & Pitchs
            </span>
            <div className="flex flex-col gap-3">
              <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200">
                <span className="text-[10px] bg-orange-500/15 text-white px-2 py-0.5 rounded font-bold uppercase">Pitch Nouchi 🇨🇮</span>
                <p className="text-xs font-bold text-slate-800 mt-2">"Faut pas y a gâté !"</p>
                <p className="text-xs text-slate-400 mt-1 italic">
                  "Mon frère, y a pas l'homme pour DjagoCRM ! Le réseau se fatigue au pays mais tes ventes continuent. Tu tapes tes check-ins et tes rapports sans connexion, dès que le réseau revient, tout est dja dans le système. C'est le gbonhi pour douahou ton business !"
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200">
                <span className="text-[10px] bg-emerald-500/15 text-white px-2 py-0.5 rounded font-bold uppercase">Pitch Dioula 🌍</span>
                <p className="text-xs font-bold text-slate-800 mt-2">"DjagoCRM bè ta gnè"</p>
                <p className="text-xs text-slate-400 mt-1 italic">
                  "N'gagnan, DjagoCRM bè a to i bè baara kaili ni réseaux té yé. I bè clients toukoun, i bè appels ni WhatsApp kaili kabini i bolo la. DjagoCRM bè saii ye i bè wari sôrô !"
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200">
                <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded font-bold uppercase">Pitch Pro (DG / Décideur) 💼</span>
                <p className="text-xs font-bold text-slate-800 mt-2">"Supériorité Terrain face à Salesforce"</p>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  "DjagoCRM est conçu spécifiquement pour le contexte africain. Contrairement aux solutions américaines lourdes et coûteuses, notre CRM fonctionne en mode hors-ligne complet pour vos commerciaux terrain, intègre un bouton de relance WhatsApp direct avec templates pré-remplis et audite la position GPS réelle de vos visites physiques."
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'leaderboard' && (
          <div className="flex flex-col gap-4 animate-fade-in text-left">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">
              Classement des Commerciaux 🏆
            </span>
            <div className="flex flex-col gap-3">
              <div className="p-4 rounded-2xl bg-gradient-to-tr from-orange-500/20 to-brand-emerald/10 border border-brand-orange/30 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-orange-500 flex items-center justify-center font-extrabold text-white text-xs">1</div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Salif Commercial (Moi)</h4>
                    <p className="text-[9px] text-orange-600 font-bold uppercase tracking-wider">Commercial Suprême 🦁</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-black text-slate-900">8 Ventes</span>
                  <p className="text-[8px] text-slate-400">400 000 FCFA prime</p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50/60 border border-slate-850 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600 text-xs">2</div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">Koffi Junior</h4>
                    <p className="text-[9px] text-slate-455 uppercase">Chasseur de Deals 🎯</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-slate-800">5 Ventes</span>
                  <p className="text-[8px] text-slate-400">250 000 FCFA prime</p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50/60 border border-slate-850 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-355 text-xs">3</div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">Aminata Diallo</h4>
                    <p className="text-[9px] text-slate-455 uppercase">Espoir du Terrain 🌟</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-slate-800">3 Ventes</span>
                  <p className="text-[8px] text-slate-400">150 000 FCFA prime</p>
                </div>
              </div>
            </div>
          </div>
        )}

          {/* TAB MAP */}
        {activeTab === 'map' && (
          <div className="flex flex-col gap-4 animate-fade-in text-left">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">
              Tournée Terrain (Vue Carte)
            </span>
            <div className="w-full h-[400px] bg-slate-50 rounded-2xl border border-slate-200 relative overflow-hidden flex flex-col items-center justify-center glass-panel">
              <MapPin className="w-12 h-12 text-orange-600 mb-2 animate-bounce" />
              <p className="text-slate-400 font-medium text-sm text-center px-4">
                La carte interactive s'affichera ici.<br/>
                Intégration Google Maps / Leaflet à venir.
              </p>
            </div>
            {filteredClients.map((c) => (
              <div key={c.id} className="p-3 bg-slate-50/60 border border-slate-200 rounded-xl flex items-center justify-between glass-panel-hover">
                <div>
                  <h5 className="text-sm font-bold text-slate-800">{c.name}</h5>
                  <p className="text-[10px] text-slate-400">{c.company || 'Sans entreprise'}</p>
                </div>
                <button className="p-2 rounded-lg bg-orange-50 text-white hover:bg-orange-500 hover:text-white transition-all">
                  <Navigation className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

      </main>

      {/* Fast Checkout Form Modal */}
      {fastCheckoutOpen && (
        <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-slate-50 border border-slate-200 rounded-3xl p-5 shadow-2xl flex flex-col gap-4 text-left">
            <div className="flex justify-between items-start border-b border-slate-200 pb-2">
              <div>
                <h4 className="font-extrabold text-slate-900 text-base">Vente Rapide & Paiement</h4>
                <p className="text-[10px] text-slate-400">Produit: {selectedProduct.name}</p>
              </div>
              <button onClick={() => setFastCheckoutOpen(false)} className="p-1 rounded bg-white text-slate-400 hover:text-slate-900">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleFastCheckoutSubmit} className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Nom {vocab.client}</label>
                <input 
                  type="text" required placeholder="Ex: M. Souleymane Diop" value={checkoutClientName} onChange={e => setCheckoutClientName(e.target.value)}
                  className="p-2.5 bg-white border border-slate-850 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-brand-orange"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Téléphone</label>
                <input 
                  type="tel" required placeholder="Ex: +225 0708091011" value={checkoutClientPhone} onChange={e => setCheckoutClientPhone(e.target.value)}
                  className="p-2.5 bg-white border border-slate-850 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-brand-orange"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Entreprise (Optionnel)</label>
                <input 
                  type="text" placeholder="Ex: Diop Transport" value={checkoutClientCompany} onChange={e => setCheckoutClientCompany(e.target.value)}
                  className="p-2.5 bg-white border border-slate-850 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-brand-orange"
                />
              </div>

              <div className="flex flex-col gap-1.5 p-3 rounded-xl bg-white border border-slate-850">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Total à payer</span>
                  <span className="font-mono font-black text-orange-600">{selectedProduct.price.toLocaleString()} FCFA</span>
                </div>
                <div className="flex justify-between items-center text-[10px] text-emerald-600 font-bold mt-1">
                  <span>Méthode: Mobile Money (Wave/Orange)</span>
                  <span>Facture Acquittée</span>
                </div>
              </div>

              <button 
                type="submit"
                className="w-full py-3 rounded-xl bg-orange-500 hover:bg-orange-500/95 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Enregistrer la Vente</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Action Overlay Modals */}
      {selectedClientForAction && (
        <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-end justify-center px-4 pb-6">
          <div className="w-full max-w-sm p-6 rounded-2xl bg-slate-50 border border-slate-200 text-left shadow-2xl flex flex-col gap-4 animate-toast-slide-in">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-extrabold text-slate-900 text-lg">
                  {actionType === 'appel' && "Rapport d'Appel"}
                  {actionType === 'whatsapp' && "Relance WhatsApp"}
                  {actionType === 'email' && "Envoi de Mail Pro"}
                  {actionType === 'terrain' && "Rapport Terrain"}
                </h4>
                <p className="text-xs text-slate-400">Client : {selectedClientForAction.name}</p>
              </div>
              <button 
                onClick={() => {
                  setSelectedClientForAction(null);
                  setActionType(null);
                }}
                className="p-1 rounded bg-white border border-slate-850 hover:bg-slate-100 text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {actionType === 'appel' && (
              <div className="flex flex-col gap-3">
                <p className="text-xs text-slate-400">
                  Veuillez enregistrer les notes d'échange après votre appel ou dicter votre rapport.
                </p>

                <div className="flex flex-col gap-2 p-3 rounded-xl bg-white border border-slate-850">
                  <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase">
                    <span>Dictée Vocale Intelligente (Offline)</span>
                    {isRecording && recordingTarget === 'call' && (
                      <span className="text-red-500 animate-pulse flex items-center gap-1">
                        ● ENREGISTREMENT ({recordingSeconds}s)
                      </span>
                    )}
                  </div>
                  
                  {isRecording && recordingTarget === 'call' ? (
                    <div className="flex flex-col items-center justify-center gap-4 bg-gradient-to-br from-red-500/20 to-slate-900 border border-red-500/30 p-4 rounded-2xl glass-panel relative overflow-hidden">
                      <div className="absolute inset-0 bg-red-500/5 animate-pulse-slow"></div>
                      <div className="flex items-center gap-1.5 h-12 relative z-10">
                        {/* Audio Waveform Effect */}
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                          <div 
                            key={i} 
                            className="w-1.5 bg-red-500 rounded-full animate-bounce" 
                            style={{ 
                              height: `${Math.max(10, (i * 17) % 40)}px`, 
                              animationDelay: `${i * 0.1}s`,
                              animationDuration: '0.8s'
                            }} 
                          />
                        ))}
                      </div>
                      <p className="text-[10px] text-slate-700 relative z-10 text-center font-medium">
                        "Écoute en cours... L'IA transcrira automatiquement votre appel."
                      </p>
                      <button
                        onClick={stopRecording}
                        className="w-full py-2.5 bg-red-500 hover:bg-red-600 text-white font-bold text-[10px] rounded-xl uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(239,68,68,0.5)] relative z-10"
                      >
                        Arrêter & Transcrire l'Appel
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => startRecording('call')}
                      className="py-2 bg-slate-50 hover:bg-slate-100 text-orange-600 font-bold text-xs rounded-lg border border-orange-200 flex items-center justify-center gap-1.5 transition-all"
                    >
                      <Mic className="w-3.5 h-3.5" />
                      <span>Dicter mon rapport d'appel</span>
                    </button>
                  )}
                </div>

                <textarea
                  rows={3}
                  required
                  placeholder="Ex: Client intéressé, demande un devis révisé par e-mail demain."
                  value={callNotes}
                  onChange={(e) => setCallNotes(e.target.value)}
                  className="w-full p-3 rounded-xl bg-white border border-slate-850 focus:outline-none focus:border-blue-500 text-xs text-slate-800"
                />
                <button
                  onClick={saveCallNotes}
                  className="w-full py-2.5 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-bold text-xs shadow-lg transition-all"
                >
                  Sauvegarder le compte-rendu
                </button>
              </div>
            )}

            {actionType === 'whatsapp' && (
              <div className="flex flex-col gap-3">
                <label className="text-xs font-bold text-slate-400 uppercase">Modèle d'accroche</label>
                <select
                  value={selectedWhatsAppTemplate}
                  onChange={(e) => setSelectedWhatsAppTemplate(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-355 focus:outline-none focus:border-brand-emerald"
                >
                  {whatsappTemplates.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>

                <div className="p-3 rounded-xl bg-white border border-slate-850 text-[11px] text-slate-400 leading-relaxed font-mono">
                  {(whatsappTemplates.find(t => t.id === selectedWhatsAppTemplate)?.text || '')
                    .replace(/\\{\\{nom_client\\}\\}/g, selectedClientForAction.name)
                    .replace(/\\{\\{entreprise\\}\\}/g, selectedClientForAction.company || 'votre entreprise')
                    .replace(/\\{\\{nom_commercial\\}\\}/g, user?.name || 'votre conseiller')}
                </div>

                <button
                  onClick={sendWhatsAppMessage}
                  className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-500/95 text-white font-bold text-xs shadow-lg transition-all"
                >
                  Ouvrir WhatsApp
                </button>
              </div>
            )}

            {actionType === 'email' && (
              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Objet</label>
                  <input
                    type="text"
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 focus:outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Contenu / Notes d'envoi</label>
                  <textarea
                    rows={3}
                    placeholder="Contenu envoyé (catalogue joint, facture proforma...)"
                    value={emailNotes}
                    onChange={(e) => setEmailNotes(e.target.value)}
                    className="w-full p-3 rounded-xl bg-white border border-slate-200 focus:outline-none focus:border-purple-500 text-xs text-slate-800"
                  />
                </div>

                <button
                  onClick={sendEmailAction}
                  className="w-full py-2.5 rounded-xl bg-purple-500 hover:bg-purple-600 text-slate-900 font-bold text-xs shadow-lg transition-all"
                >
                  Envoyer E-mail
                </button>
              </div>
            )}

            {actionType === 'terrain' && (
              <div className="flex flex-col gap-3">
                <p className="text-xs text-slate-400">
                  L'application va capturer votre géolocalisation GPS réelle pour valider le passage terrain.
                </p>

                <div className="flex flex-col gap-2 p-3 rounded-xl bg-white border border-slate-850">
                  <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase">
                    <span>Dictée Vocale Intelligente (Offline)</span>
                    {isRecording && recordingTarget === 'terrain' && (
                      <span className="text-red-500 animate-pulse flex items-center gap-1">
                        ● ENREGISTREMENT ({recordingSeconds}s)
                      </span>
                    )}
                  </div>
                  
                  {isRecording && recordingTarget === 'terrain' ? (
                    <div className="flex flex-col items-center justify-center gap-4 bg-gradient-to-br from-orange-500/20 to-slate-900 border border-brand-orange/30 p-4 rounded-2xl glass-panel relative overflow-hidden">
                      <div className="absolute inset-0 bg-orange-500/5 animate-pulse-slow"></div>
                      <div className="flex items-center gap-1.5 h-12 relative z-10">
                        {/* Audio Waveform Effect */}
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                          <div 
                            key={i} 
                            className="w-1.5 bg-orange-500 rounded-full animate-bounce" 
                            style={{ 
                              height: `${Math.max(10, (i * 17) % 40)}px`, 
                              animationDelay: `${i * 0.1}s`,
                              animationDuration: '0.8s'
                            }} 
                          />
                        ))}
                      </div>
                      <p className="text-[10px] text-slate-700 relative z-10 text-center font-medium">
                        "Enregistrement de la visite terrain. L'IA extrait les points clés..."
                      </p>
                      <button
                        onClick={stopRecording}
                        className="w-full py-2.5 bg-orange-500 hover:bg-orange-500/90 text-white font-bold text-[10px] rounded-xl uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(255,122,0,0.5)] relative z-10"
                      >
                        Arrêter & Transcrire
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => startRecording('terrain')}
                      className="py-2 bg-slate-50 hover:bg-slate-100 text-orange-600 font-bold text-xs rounded-lg border border-orange-200 flex items-center justify-center gap-1.5 transition-all"
                    >
                      <Mic className="w-3.5 h-3.5" />
                      <span>Dicter mon rapport de visite</span>
                    </button>
                  )}
                </div>

                <textarea
                  rows={3}
                  required
                  placeholder="Rapport du passage physique (signature de devis, présentation échantillon...)"
                  value={terrainNotes}
                  onChange={(e) => setTerrainNotes(e.target.value)}
                  className="w-full p-3 rounded-xl bg-white border border-slate-850 focus:outline-none focus:border-brand-orange text-xs text-slate-800"
                />

                <button
                  onClick={saveTerrainCheckin}
                  disabled={gpsLoading || isRecording}
                  className="w-full py-2.5 rounded-xl bg-orange-500 hover:bg-orange-500/95 text-white font-bold text-xs shadow-lg transition-all flex items-center justify-center gap-1.5"
                >
                  {gpsLoading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Capture GPS...</span>
                    </>
                  ) : (
                    <span>Valider Visite Terrain</span>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Reply to Inbox Message Modal */}
      {selectedInboxMessage && (
        <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-slate-50 border border-slate-200 rounded-2xl p-5 shadow-2xl flex flex-col gap-4 text-left">
            <div className="flex justify-between items-start border-b border-slate-200 pb-2">
              <div>
                <h4 className="font-extrabold text-slate-900 text-base">Répondre à {selectedInboxMessage.sender_name}</h4>
                <p className="text-[10px] text-slate-400">Canal : {selectedInboxMessage.channel}</p>
              </div>
              <button 
                onClick={() => setSelectedInboxMessage(null)}
                className="p-1 rounded bg-white text-slate-400 hover:text-slate-900"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 bg-white border border-slate-850 rounded-xl text-xs text-slate-600 italic leading-relaxed">
              "{selectedInboxMessage.body}"
            </div>

            <form onSubmit={handleInboxReply} className="flex flex-col gap-3">
              <textarea
                rows={3}
                required
                placeholder="Écrivez votre réponse..."
                value={inboxReplyText}
                onChange={(e) => setInboxReplyText(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-white border border-slate-200 focus:outline-none focus:border-brand-orange text-xs text-slate-800"
              />
              <button
                type="submit"
                className="w-full py-2 rounded-xl bg-orange-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Envoyer la réponse</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Client Detail Modal with Submodules */}
      {selectedClientForModal && (
        <div className="fixed inset-0 bg-white/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-50 border border-slate-200 rounded-3xl p-5 shadow-2xl flex flex-col gap-4 text-left max-h-[85vh] overflow-y-auto scrollbar-none">
            <div className="flex justify-between items-start border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900">{selectedClientForModal.name}</h3>
                <p className="text-xs text-slate-400">{selectedClientForModal.company || 'Sans entreprise'}</p>
              </div>
              <button 
                onClick={() => setSelectedClientForModal(null)}
                className="p-1.5 rounded-lg bg-white border border-slate-850 hover:bg-slate-100 text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Contacts Submodule */}
            <div className="border-t border-slate-200/60 pt-3">
              <h4 className="text-xs font-bold text-orange-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" />
                <span>Contacts secondaires</span>
              </h4>
              <div className="flex flex-col gap-2 max-h-24 overflow-y-auto mb-2 scrollbar-none">
                {contacts.filter(c => c.client_id === selectedClientForModal.id).length === 0 ? (
                  <p className="text-[10px] text-slate-400 italic">Aucun contact enregistré.</p>
                ) : (
                  contacts.filter(c => c.client_id === selectedClientForModal.id).map(c => (
                    <div key={c.id} className="p-2 rounded-lg bg-white border border-slate-850 text-[10px] flex justify-between items-center">
                      <div>
                        <span className="font-extrabold text-slate-800">{c.name}</span>
                        <span className="text-slate-455 ml-1.5">({c.role})</span>
                      </div>
                      <span className="text-slate-400">{c.phone}</span>
                    </div>
                  ))
                )}
              </div>
              <form onSubmit={handleAddContactSubmit} className="grid grid-cols-2 gap-2 mt-2">
                <input 
                  type="text" required placeholder="Nom" value={contactName} onChange={e => setContactName(e.target.value)}
                  className="p-2 bg-white border border-slate-855 rounded-lg text-[10px] text-slate-800"
                />
                <input 
                  type="text" placeholder="Poste/Role" value={contactRole} onChange={e => setContactRole(e.target.value)}
                  className="p-2 bg-white border border-slate-855 rounded-lg text-[10px] text-slate-800"
                />
                <input 
                  type="tel" required placeholder="Téléphone" value={contactPhone} onChange={e => setContactPhone(e.target.value)}
                  className="p-2 bg-white border border-slate-855 rounded-lg text-[10px] text-slate-800 col-span-2"
                />
                <button type="submit" className="col-span-2 py-1.5 rounded bg-emerald-500 text-white text-[10px] font-bold">
                  + Ajouter Contact
                </button>
              </form>
            </div>

            {/* Transactions Submodule */}
            <div className="border-t border-slate-200/60 pt-3">
              <h4 className="text-xs font-bold text-orange-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <ClipboardList className="w-3.5 h-3.5" />
                <span>Transactions (Deals)</span>
              </h4>
              <div className="flex flex-col gap-2 max-h-24 overflow-y-auto mb-2 scrollbar-none">
                {transactions.filter(t => t.client_id === selectedClientForModal.id).length === 0 ? (
                  <p className="text-[10px] text-slate-400 italic">Aucun deal en cours.</p>
                ) : (
                  transactions.filter(t => t.client_id === selectedClientForModal.id).map(t => (
                    <div key={t.id} className="p-2 rounded-lg bg-white border border-slate-850 text-[10px] flex justify-between items-center">
                      <div>
                        <span className="font-extrabold text-slate-800 truncate block max-w-[150px]">{t.title}</span>
                        <span className="text-[9px] text-orange-600">{t.amount.toLocaleString()} FCFA</span>
                      </div>
                      <select 
                        value={t.stage}
                        onChange={e => updateTransactionStage(t.id, e.target.value as never)}
                        className="p-1 bg-slate-50 border border-slate-805 rounded text-[9px]"
                      >
                        <option value="contact">Contact</option>
                        <option value="presentation">Démo</option>
                        <option value="proposal">Offre</option>
                        <option value="negotiation">Négoc</option>
                        <option value="won">Gagné</option>
                        <option value="lost">Perdu</option>
                      </select>
                    </div>
                  ))
                )}
              </div>
              <form onSubmit={handleAddTransactionSubmit} className="flex flex-col gap-2 mt-2">
                <input 
                  type="text" required placeholder="Titre opportunité" value={dealTitle} onChange={e => setDealTitle(e.target.value)}
                  className="p-2 bg-white border border-slate-855 rounded-lg text-[10px] text-slate-800"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input 
                    type="number" required placeholder="Montant (FCFA)" value={dealAmount} onChange={e => setDealAmount(e.target.value)}
                    className="p-2 bg-white border border-slate-855 rounded-lg text-[10px] text-slate-800"
                  />
                  <select 
                    value={dealStage} onChange={e => setDealStage(e.target.value as never)}
                    className="p-2 bg-white border border-slate-855 rounded-lg text-[10px] text-slate-600"
                  >
                    <option value="contact">Contact</option>
                    <option value="presentation">Présentation</option>
                    <option value="proposal">Proposition</option>
                    <option value="negotiation">Négociation</option>
                  </select>
                </div>
                <button type="submit" className="py-1.5 rounded bg-emerald-500 text-white text-[10px] font-bold">
                  + Créer Deal
                </button>
              </form>
            </div>

            {/* Commandes Submodule */}
            <div className="border-t border-slate-200/60 pt-3">
              <h4 className="text-xs font-bold text-orange-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <CheckSquare className="w-3.5 h-3.5" />
                <span>Commandes & Livraisons</span>
              </h4>
              <div className="flex flex-col gap-2 max-h-24 overflow-y-auto mb-2 scrollbar-none">
                {orders.filter(o => o.client_id === selectedClientForModal.id).length === 0 ? (
                  <p className="text-[10px] text-slate-400 italic">Aucune commande enregistrée.</p>
                ) : (
                  orders.filter(o => o.client_id === selectedClientForModal.id).map(o => (
                    <div key={o.id} className="p-2 rounded-lg bg-white border border-slate-850 text-[9px] flex justify-between items-center">
                      <div>
                        <span className="font-extrabold text-slate-700 block truncate max-w-[120px]">{o.items}</span>
                        <span className="text-orange-600 font-bold">{o.total_amount.toLocaleString()} FCFA</span>
                      </div>
                      <div className="flex flex-col gap-0.5 items-end">
                        <span className={`px-1 rounded text-[7px] font-black uppercase ${
                          o.payment_status === 'paid' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
                        }`}>{o.payment_status}</span>
                        <span className="text-[7px] text-slate-400">{o.delivery_status}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <form onSubmit={handleAddOrderSubmit} className="grid grid-cols-2 gap-2 mt-2">
                <input 
                  type="text" required placeholder="Articles (ex: Licence x2)" value={orderItems} onChange={e => setOrderItems(e.target.value)}
                  className="p-2 bg-white border border-slate-855 rounded-lg text-[10px] text-slate-800"
                />
                <input 
                  type="number" required placeholder="Total (FCFA)" value={orderAmount} onChange={e => setOrderAmount(e.target.value)}
                  className="p-2 bg-white border border-slate-855 rounded-lg text-[10px] text-slate-800"
                />
                <button type="submit" className="col-span-2 py-1.5 rounded bg-emerald-500 text-white text-[10px] font-bold">
                  + Créer Commande
                </button>
              </form>
            </div>

            {/* Tickets SAV Submodule */}
            <div className="border-t border-slate-200/60 pt-3">
              <h4 className="text-xs font-bold text-orange-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <HeartHandshake className="w-3.5 h-3.5" />
                <span>Tickets SAV</span>
              </h4>
              <div className="flex flex-col gap-2 max-h-24 overflow-y-auto mb-2 scrollbar-none">
                {tickets.filter(t => t.client_id === selectedClientForModal.id).length === 0 ? (
                  <p className="text-[10px] text-slate-400 italic">Aucun ticket ouvert.</p>
                ) : (
                  tickets.filter(t => t.client_id === selectedClientForModal.id).map(t => (
                    <div key={t.id} className="p-2 rounded-lg bg-white border border-slate-850 text-[10px] flex justify-between items-center">
                      <div>
                        <span className="font-extrabold text-slate-800">{t.subject}</span>
                        <span className="text-[9px] text-slate-400 block">Priorité: {t.priority}</span>
                      </div>
                      <select
                        value={t.status}
                        onChange={e => updateTicketStatus(t.id, e.target.value as never)}
                        className="p-1 bg-slate-50 border border-slate-805 rounded text-[9px]"
                      >
                        <option value="new">Nouveau</option>
                        <option value="open">En cours</option>
                        <option value="resolved">Résolu</option>
                      </select>
                    </div>
                  ))
                )}
              </div>
              <form onSubmit={handleAddTicketSubmit} className="flex flex-col gap-2 mt-2">
                <input 
                  type="text" required placeholder="Sujet de l'anomalie" value={ticketSubject} onChange={e => setTicketSubject(e.target.value)}
                  className="p-2 bg-white border border-slate-855 rounded-lg text-[10px] text-slate-800"
                />
                <textarea 
                  rows={2} placeholder="Description du problème..." value={ticketDesc} onChange={e => setTicketDesc(e.target.value)}
                  className="p-2 bg-white border border-slate-855 rounded-lg text-[10px] text-slate-800"
                />
                <button type="submit" className="py-1.5 rounded bg-emerald-500 text-white text-[10px] font-bold">
                  + Ouvrir Ticket
                </button>
              </form>
            </div>

            {/* Agenda Meeting Submodule */}
            <div className="border-t border-slate-200/60 pt-3">
              <h4 className="text-xs font-bold text-orange-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                <span>Planifier un RDV / Réunion</span>
              </h4>
              <form onSubmit={handleAddMeetingSubmit} className="flex flex-col gap-2">
                <input 
                  type="text" required placeholder="Titre de la réunion (ex: Démo)" value={meetTitle} onChange={e => setMeetTitle(e.target.value)}
                  className="p-2 bg-white border border-slate-855 rounded-lg text-[10px] text-slate-800"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input 
                    type="datetime-local" required value={meetDate} onChange={e => setMeetDate(e.target.value)}
                    className="p-2 bg-white border border-slate-855 rounded-lg text-[10px] text-slate-600"
                  />
                  <select 
                    value={meetType} onChange={e => setMeetType(e.target.value as never)}
                    className="p-2 bg-white border border-slate-855 rounded-lg text-[10px] text-slate-600"
                  >
                    <option value="appel">Téléphone</option>
                    <option value="terrain">Visite Terrain</option>
                    <option value="demo">Démo Visio</option>
                  </select>
                </div>
                <button type="submit" className="py-1.5 rounded bg-orange-500 text-white text-[10px] font-bold">
                  + Planifier Réunion
                </button>
              </form>
            </div>

          </div>
        </div>
      )}

      {/* Bottom Navigation Bar */}
      <nav className="absolute bottom-0 left-0 w-full bg-white border-t border-[#1e293b]/70 py-2.5 px-2 grid grid-cols-8 gap-0.5 z-40">
        <button
          onClick={() => setActiveTab('prospects')}
          className={`flex flex-col items-center justify-center text-[7.5px] font-extrabold uppercase tracking-wide transition-colors ${
            activeTab === 'prospects' ? 'text-orange-600' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <Search className="w-4 h-4 mb-0.5" />
          <span>{vocab.clients}</span>
        </button>

        <button
          onClick={() => setActiveTab('sales')}
          className={`flex flex-col items-center justify-center text-[7.5px] font-extrabold uppercase tracking-wide transition-colors ${
            activeTab === 'sales' ? 'text-orange-600' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <ShoppingCart className="w-4 h-4 mb-0.5" />
          <span>Vente</span>
        </button>

        <button
          onClick={() => setActiveTab('add')}
          className={`flex flex-col items-center justify-center text-[7.5px] font-extrabold uppercase tracking-wide transition-colors ${
            activeTab === 'add' ? 'text-orange-600' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <Plus className="w-4 h-4 mb-0.5" />
          <span>Nouveau</span>
        </button>

        <button
          onClick={() => setActiveTab('agenda')}
          className={`flex flex-col items-center justify-center text-[7.5px] font-extrabold uppercase tracking-wide transition-colors ${
            activeTab === 'agenda' ? 'text-orange-600' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <Calendar className="w-4 h-4 mb-0.5" />
          <span>Agenda</span>
        </button>

        <button
          onClick={() => setActiveTab('inbox')}
          className={`flex flex-col items-center justify-center text-[7.5px] font-extrabold uppercase tracking-wide transition-colors relative ${
            activeTab === 'inbox' ? 'text-orange-600' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <Mail className="w-4 h-4 mb-0.5" />
          <span>Inbox</span>
          {inboxMessages.filter(m => !m.is_read).length > 0 && (
            <span className="absolute top-1 right-2 w-2 h-2 rounded-full bg-orange-500" />
          )}
        </button>

        <button 
            onClick={() => setActiveTab('map')}
            className={`flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-all cursor-pointer ${
            activeTab === 'map' ? 'text-orange-600' : 'text-slate-400 hover:text-slate-600'
          }`}>
            <MapPin className="w-5 h-5 mb-1" />
            <span className="text-[8px] font-bold uppercase tracking-widest">Carte</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`flex flex-col items-center justify-center text-[7.5px] font-extrabold uppercase tracking-wide transition-colors ${
            activeTab === 'history' ? 'text-orange-600' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <MapPin className="w-4 h-4 mb-0.5" />
          <span>Visites</span>
        </button>

        <button
          onClick={() => setActiveTab('playbook')}
          className={`flex flex-col items-center justify-center text-[7.5px] font-extrabold uppercase tracking-wide transition-colors ${
            activeTab === 'playbook' ? 'text-orange-600' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <BookOpen className="w-4 h-4 mb-0.5" />
          <span>Pitchs</span>
        </button>

        <button
          onClick={() => setActiveTab('leaderboard')}
          className={`flex flex-col items-center justify-center text-[7.5px] font-extrabold uppercase tracking-wide transition-colors ${
            activeTab === 'leaderboard' ? 'text-orange-600' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <Trophy className="w-4 h-4 mb-0.5" />
          <span>Leader</span>
        </button>
      </nav>
    </div>
  );

  return (
    <div className={`min-h-screen text-slate-900 flex items-center justify-center bg-white ${isDesktop ? 'p-8' : ''}`}>
      {isDesktop ? (
        <div className="max-w-6xl w-full grid grid-cols-12 gap-8 items-center">
          {/* Companion Left Panel */}
          <div className="col-span-7 flex flex-col gap-6 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-50 text-orange-600 text-xs font-semibold w-fit border border-orange-200 tracking-wider">
              💼 COMPAGNON DE BUREAU - WARA SPACE
            </div>

            <div className="flex flex-col gap-1.5">
              <h2 className="text-3xl font-extrabold text-slate-900 !my-0">
                Espace Commercial de <br />
                <span className="text-orange-600">{user?.name}</span>
              </h2>
              <p className="text-sm text-slate-400">
                Visualisez vos performances de terrain, gérez vos deals commerciaux, planifiez vos visites et répondez aux messages de vos clients.
              </p>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Prospects</span>
                <span className="text-2xl font-black text-slate-900 block mt-1">{myClients.length}</span>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Deals Actifs</span>
                <span className="text-2xl font-black text-orange-600 block mt-1">
                  {transactions.filter(t => t.stage !== 'won' && t.stage !== 'lost').length}
                </span>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Réunions</span>
                <span className="text-2xl font-black text-blue-600 block mt-1">{meetings.filter(m => m.assigned_to === user?.id).length}</span>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Visites</span>
                <span className="text-2xl font-black text-emerald-600 block mt-1">{countInteractionsByType('terrain')}</span>
              </div>
            </div>

            {/* Manager info & zone details */}
            <div className="p-4 rounded-xl bg-slate-50/60 border border-slate-200 flex flex-col gap-2.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Zone Commerciale</span>
                <span className="font-semibold text-slate-900">{user?.zone}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Manager Supervision</span>
                <span className="font-semibold text-slate-900">{getManagerName()}</span>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={logout}
                className="px-5 py-2.5 rounded-xl bg-red-50 hover:bg-red-555/20 text-red-600 text-xs font-bold border border-red-200 flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Déconnexion</span>
              </button>
            </div>
          </div>

          {/* Phone Frame App Interface */}
          <div className="col-span-5 flex justify-center">
            <div className="relative">
              <div className="absolute top-3 left-1/2 -translate-x-1/2 w-32 h-6 rounded-full bg-white z-40 border border-slate-855 flex items-center justify-center pointer-events-none">
                <div className="w-12 h-1 bg-slate-100 rounded-full" />
              </div>
              {mobileInterface}
            </div>
          </div>
        </div>
      ) : (
        mobileInterface
      )}

      {/* Offline Queue Inspector Drawer */}
      {isQueueDrawerOpen && (
        <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-sm p-6 rounded-2xl bg-slate-50 border border-slate-200 text-left shadow-2xl flex flex-col gap-4 animate-toast-slide-in">
            <div className="flex justify-between items-start border-b border-slate-200 pb-3">
              <div>
                <h4 className="font-extrabold text-slate-900 text-base">Actions en attente</h4>
                <p className="text-xs text-slate-400">Ces modifications seront envoyées à la reconnexion</p>
              </div>
              <button 
                onClick={() => setIsQueueDrawerOpen(false)}
                className="p-1 rounded bg-white border border-slate-850 hover:bg-slate-100 text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-col gap-2.5 max-h-60 overflow-y-auto pr-1">
              {offlineActions.length === 0 ? (
                <div className="py-8 flex flex-col items-center justify-center gap-3 text-slate-400">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600 opacity-50" />
                  <p className="text-xs font-medium">Toutes vos données sont synchronisées.</p>
                </div>
              ) : (
                offlineActions.map((act) => (
                  <div key={act.id} className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/50 flex items-center justify-between shadow-sm relative overflow-hidden group">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-orange-500 group-hover:w-1.5 transition-all"></div>
                    <div className="pl-2">
                      <span className="font-extrabold text-orange-600 uppercase text-[10px] tracking-wider block">
                        {act.actionType.replace(/_/g, ' ')}
                      </span>
                      <span className="text-slate-400 text-[10px] font-medium mt-0.5 block">
                        Enregistré à {new Date(act.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-orange-50 text-orange-600 text-[9px] font-bold border border-orange-200">
                      En attente réseau
                    </span>
                  </div>
                ))
              )}
            </div>

            <button
              onClick={async () => {
                await syncOfflineQueue();
                setIsQueueDrawerOpen(false);
              }}
              disabled={offlineActions.length === 0}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-orange-500 to-brand-emerald hover:opacity-90 text-white font-black text-[11px] uppercase tracking-widest shadow-lg transition-all disabled:opacity-30 disabled:grayscale"
            >
              Forcer la Synchronisation
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
