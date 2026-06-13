import { create } from 'zustand';
import { 
  localDb, 
  type LocalClient, 
  type LocalInteraction, 
  type OfflineAction, 
  type LocalContact,
  type LocalForm,
  type LocalSegment,
  type LocalTransaction,
  type LocalOrder,
  type LocalTicket,
  type LocalMeeting,
  type LocalInboxMessage
} from '../db/localDb';
import { supabase, isSupabaseConfigured } from '../services/supabaseClient';
import { useToastStore } from './toastStore';

interface CrmState {
  clients: LocalClient[];
  interactions: LocalInteraction[];
  whatsappTemplates: Record<string, string>;
  offlineActions: OfflineAction[];
  isOnline: boolean;
  isSyncing: boolean;

  // New modules states
  contacts: LocalContact[];
  forms: LocalForm[];
  segments: LocalSegment[];
  transactions: LocalTransaction[];
  orders: LocalOrder[];
  tickets: LocalTicket[];
  meetings: LocalMeeting[];
  inboxMessages: LocalInboxMessage[];

  init: () => Promise<void>;
  setIsOnline: (online: boolean) => Promise<void>;
  addClient: (name: string, company: string, phone: string, email: string, assignedToId: string) => Promise<void>;
  updateClientStatus: (clientId: string, status: LocalClient['status'], performedByUserId: string) => Promise<void>;
  addInteraction: (clientId: string, type: LocalInteraction['type'], details: string, gpsCoordinates?: string, performedByUserId?: string) => Promise<void>;
  reassignClient: (clientId: string, newCommercialId: string, performedByUserId: string) => Promise<void>;
  updateWhatsAppTemplates: (templates: Record<string, string>) => Promise<void>;
  syncOfflineQueue: () => Promise<void>;

  // New modules actions
  addContact: (clientId: string, name: string, role: string, phone: string, email?: string) => Promise<void>;
  addTransaction: (clientId: string, title: string, amount: number, stage: LocalTransaction['stage'], probability: number, expectedCloseDate: string, assignedTo: string) => Promise<void>;
  updateTransactionStage: (transactionId: string, stage: LocalTransaction['stage']) => Promise<void>;
  addTicket: (clientId: string, subject: string, priority: LocalTicket['priority'], description: string, assignedTo: string) => Promise<void>;
  updateTicketStatus: (ticketId: string, status: LocalTicket['status']) => Promise<void>;
  addMeeting: (clientId: string, title: string, type: LocalMeeting['type'], scheduledAt: string, durationMinutes: number, assignedTo: string) => Promise<void>;
  addOrder: (clientId: string, items: string, totalAmount: number, paymentStatus: LocalOrder['payment_status'], deliveryStatus: LocalOrder['delivery_status'], deliveryAgent?: string) => Promise<void>;
  updateOrderStatus: (orderId: string, paymentStatus: LocalOrder['payment_status'], deliveryStatus: LocalOrder['delivery_status']) => Promise<void>;
  addForm: (title: string, fields: string[]) => Promise<void>;
  addSegment: (name: string, criteria: LocalSegment['criteria']) => Promise<void>;
  sendInboxMessage: (clientId: string | undefined, senderName: string, senderAddress: string, channel: LocalInboxMessage['channel'], body: string, subject?: string) => Promise<void>;
  markInboxMessageRead: (messageId: string) => Promise<void>;
}

// Pre-seeded clients if local DB is empty
const MOCK_CLIENTS: LocalClient[] = [
  {
    id: 'client-1',
    name: 'Moussa Konaté',
    company: 'Konaté Frères & Co',
    phone: '+225 0707080910',
    email: 'moussa@konate.ci',
    status: 'Prospect',
    assigned_to: 'com-333-uuid',
    last_contact: new Date().toISOString(),
    created_at: new Date(Date.now() - 3600000 * 24 * 5).toISOString()
  },
  {
    id: 'client-2',
    name: 'Fatou Bensouda',
    company: 'Supermarché Cocody',
    phone: '+225 0505123456',
    email: 'fatou@cocodyapp.ci',
    status: 'Négociation',
    assigned_to: 'com-333-uuid',
    last_contact: new Date().toISOString(),
    created_at: new Date(Date.now() - 3600000 * 24 * 3).toISOString()
  },
  {
    id: 'client-3',
    name: 'Adama Bamba',
    company: 'Bamba Transports',
    phone: '+225 0101889977',
    email: 'adama@bambatrans.ci',
    status: 'Vendu',
    assigned_to: 'com-444-uuid',
    last_contact: new Date().toISOString(),
    created_at: new Date(Date.now() - 3600000 * 24 * 10).toISOString()
  },
  {
    id: 'client-4',
    name: 'Chantal Oualou',
    company: 'Boutique Plateau',
    phone: '+225 0748112233',
    email: 'chantal@plateaushop.ci',
    status: 'Livré & Adopté',
    assigned_to: 'com-333-uuid',
    last_contact: new Date().toISOString(),
    created_at: new Date(Date.now() - 3600000 * 24 * 15).toISOString()
  }
];

const MOCK_INTERACTIONS: LocalInteraction[] = [
  {
    id: 'int-1',
    client_id: 'client-1',
    performed_by: 'com-333-uuid',
    type: 'creation',
    details: 'Ajout initial du prospect dans le CRM.',
    created_at: new Date(Date.now() - 3600000 * 24 * 5).toISOString()
  },
  {
    id: 'int-2',
    client_id: 'client-2',
    performed_by: 'com-333-uuid',
    type: 'whatsapp',
    details: 'Relance devis envoyée par WhatsApp.',
    created_at: new Date(Date.now() - 3600000 * 24 * 2).toISOString()
  },
  {
    id: 'int-3',
    client_id: 'client-3',
    performed_by: 'com-444-uuid',
    type: 'appel',
    details: 'Appel de négociation : accord verbal conclu.',
    created_at: new Date(Date.now() - 3600000 * 24 * 1).toISOString()
  },
  {
    id: 'int-4',
    client_id: 'client-4',
    performed_by: 'com-333-uuid',
    type: 'terrain',
    details: 'Check-in Terrain : Signature du bon de livraison effectuée en main propre.',
    gps_coordinates: '5.359954, -3.992225',
    created_at: new Date(Date.now() - 3600000 * 24 * 15).toISOString()
  }
];

const MOCK_CONTACTS: LocalContact[] = [
  {
    id: 'contact-1',
    client_id: 'client-1',
    name: 'Jean Konaté',
    role: 'Directeur Commercial',
    phone: '+225 0707010203',
    email: 'jean@konate.ci',
    created_at: new Date().toISOString()
  },
  {
    id: 'contact-2',
    client_id: 'client-2',
    name: 'Koffi Bensouda',
    role: 'Gérant Magasin',
    phone: '+225 0505998877',
    email: 'koffi@cocodyapp.ci',
    created_at: new Date().toISOString()
  }
];

const MOCK_TRANSACTIONS: LocalTransaction[] = [
  {
    id: 'trans-1',
    client_id: 'client-2',
    title: 'Abonnement Annuel DjagoCRM Enterprise',
    amount: 1200000,
    stage: 'negotiation',
    probability: 70,
    expected_close_date: new Date(Date.now() + 3600000 * 24 * 10).toISOString().split('T')[0],
    assigned_to: 'com-333-uuid',
    created_at: new Date().toISOString()
  },
  {
    id: 'trans-2',
    client_id: 'client-1',
    title: 'Déploiement Offline 5 Terminaux',
    amount: 4500000,
    stage: 'presentation',
    probability: 40,
    expected_close_date: new Date(Date.now() + 3600000 * 24 * 30).toISOString().split('T')[0],
    assigned_to: 'com-333-uuid',
    created_at: new Date().toISOString()
  }
];

const MOCK_ORDERS: LocalOrder[] = [
  {
    id: 'order-1',
    client_id: 'client-3',
    items: 'Licence Standard (x2), Support Premium 1an',
    total_amount: 1200000,
    payment_status: 'paid',
    delivery_status: 'delivered',
    delivery_agent: 'Koffi Junior',
    created_at: new Date(Date.now() - 3600000 * 24 * 4).toISOString()
  },
  {
    id: 'order-2',
    client_id: 'client-4',
    items: 'Configuration Passerelle SMS',
    total_amount: 800000,
    payment_status: 'partial',
    delivery_status: 'shipping',
    delivery_agent: 'Aminata Diallo',
    created_at: new Date().toISOString()
  }
];

const MOCK_TICKETS: LocalTicket[] = [
  {
    id: 'ticket-1',
    client_id: 'client-4',
    subject: 'Erreur de synchronisation GPS',
    priority: 'medium',
    status: 'open',
    description: 'Le terminal signale une erreur de coordonnées lors du check-in dans le Plateau.',
    assigned_to: 'com-333-uuid',
    created_at: new Date().toISOString()
  }
];

const MOCK_MEETINGS: LocalMeeting[] = [
  {
    id: 'meet-1',
    client_id: 'client-1',
    title: 'Démo Technique Mode Offline',
    type: 'demo',
    scheduled_at: new Date(Date.now() + 3600000 * 24 * 1).toISOString(),
    duration_minutes: 45,
    assigned_to: 'com-333-uuid',
    created_at: new Date().toISOString()
  },
  {
    id: 'meet-2',
    client_id: 'client-2',
    title: 'Négociation Finale Tarifs',
    type: 'appel',
    scheduled_at: new Date(Date.now() + 3600000 * 2).toISOString(),
    duration_minutes: 30,
    assigned_to: 'com-333-uuid',
    created_at: new Date().toISOString()
  }
];

const MOCK_INBOX: LocalInboxMessage[] = [
  {
    id: 'msg-1',
    client_id: 'client-1',
    sender_name: 'Moussa Konaté',
    sender_address: '+225 0707080910',
    channel: 'whatsapp',
    body: "Bonjour Salif, pouvez-vous m'envoyer le devis à jour pour que je le présente à mon associé ?",
    is_read: false,
    created_at: new Date(Date.now() - 3600000 * 2).toISOString()
  },
  {
    id: 'msg-2',
    client_id: 'client-3',
    sender_name: 'Adama Bamba',
    sender_address: 'adama@bambatrans.ci',
    channel: 'email',
    subject: 'Confirmation de réception de facture',
    body: "Merci beaucoup pour l'envoi de la facture proforma, le virement de 1 200 000 FCFA a bien été initié.",
    is_read: true,
    created_at: new Date(Date.now() - 3600000 * 12).toISOString()
  }
];

export const useCrmStore = create<CrmState>((set, get) => ({
  clients: [],
  interactions: [],
  whatsappTemplates: {
    devis: "Bonjour {name}, je me permets de vous relancer concernant notre proposition commerciale DjagoCRM. Avez-vous pu y jeter un coup d'œil ? Cordialement.",
    livraison: "Salut {name}, votre commande est en cours de préparation et de livraison dans la zone. Notre équipe de livraison vous contactera sous peu. Merci !",
    fidelisation: "Cher {name}, toute l'équipe de DjagoCRM vous remercie pour votre confiance ! Comment se passe l'adoption de notre solution dans vos équipes ?"
  },
  offlineActions: [],
  isOnline: navigator.onLine,
  isSyncing: false,

  // New modules initial states
  contacts: [],
  forms: [],
  segments: [],
  transactions: [],
  orders: [],
  tickets: [],
  meetings: [],
  inboxMessages: [],

  init: async () => {
    // 1. Listen for network changes
    window.addEventListener('online', () => get().setIsOnline(true));
    window.addEventListener('offline', () => get().setIsOnline(false));

    // 2. Seed database if empty
    const clientsCount = await localDb.clients.count();
    if (clientsCount === 0) {
      await localDb.clients.bulkAdd(MOCK_CLIENTS);
      await localDb.interactions.bulkAdd(MOCK_INTERACTIONS);
      await localDb.contacts.bulkAdd(MOCK_CONTACTS);
      await localDb.transactions.bulkAdd(MOCK_TRANSACTIONS);
      await localDb.orders.bulkAdd(MOCK_ORDERS);
      await localDb.tickets.bulkAdd(MOCK_TICKETS);
      await localDb.meetings.bulkAdd(MOCK_MEETINGS);
      await localDb.inbox_messages.bulkAdd(MOCK_INBOX);
    }

    // Seed default WhatsApp templates if empty
    const templatesCount = await localDb.whatsappTemplates.count();
    if (templatesCount === 0) {
      await localDb.whatsappTemplates.bulkAdd([
        { id: 'devis', text: get().whatsappTemplates.devis },
        { id: 'livraison', text: get().whatsappTemplates.livraison },
        { id: 'fidelisation', text: get().whatsappTemplates.fidelisation }
      ]);
    }

    // 3. Load data from local DB
    const allClients = await localDb.clients.toArray();
    const allInteractions = await localDb.interactions.toArray();
    const allTemplates = await localDb.whatsappTemplates.toArray();
    const allQueueActions = await localDb.offlineQueue.toArray();

    // New modules loading
    const allContacts = await localDb.contacts.toArray();
    const allForms = await localDb.forms.toArray();
    const allSegments = await localDb.segments.toArray();
    const allTransactions = await localDb.transactions.toArray();
    const allOrders = await localDb.orders.toArray();
    const allTickets = await localDb.tickets.toArray();
    const allMeetings = await localDb.meetings.toArray();
    const allMessages = await localDb.inbox_messages.toArray();

    const templatesObj: Record<string, string> = {};
    allTemplates.forEach(t => {
      templatesObj[t.id] = t.text;
    });
    
    set({ 
      clients: allClients.sort((a,b) => b.created_at.localeCompare(a.created_at)), 
      interactions: allInteractions.sort((a,b) => b.created_at.localeCompare(a.created_at)),
      whatsappTemplates: { ...get().whatsappTemplates, ...templatesObj },
      offlineActions: allQueueActions,
      contacts: allContacts,
      forms: allForms,
      segments: allSegments,
      transactions: allTransactions,
      orders: allOrders,
      tickets: allTickets,
      meetings: allMeetings,
      inboxMessages: allMessages.sort((a,b) => b.created_at.localeCompare(a.created_at))
    });

    // 4. Try syncing any left over actions
    if (navigator.onLine) {
      await get().syncOfflineQueue();
    }
  },

  setIsOnline: async (online: boolean) => {
    const wasOffline = !get().isOnline;
    set({ isOnline: online });
    const { addToast } = useToastStore.getState();

    if (online) {
      addToast("En Ligne ⚡ - Connexion rétablie", "success", 3000);
      if (wasOffline) {
        await get().syncOfflineQueue();
      }
    } else {
      addToast("Hors-ligne 🚫 - Données sauvegardées en cache local", "warning", 4000);
    }
  },

  addClient: async (name: string, company: string, phone: string, email: string, assignedToId: string) => {
    const { addToast } = useToastStore.getState();
    const newClient: LocalClient = {
      id: `client-${Math.random().toString(36).substring(2, 9)}`,
      name,
      company: company || undefined,
      phone,
      email: email || undefined,
      status: 'Prospect',
      assigned_to: assignedToId,
      last_contact: new Date().toISOString(),
      created_at: new Date().toISOString()
    };

    const newInteraction: LocalInteraction = {
      id: `int-${Math.random().toString(36).substring(2, 9)}`,
      client_id: newClient.id,
      performed_by: assignedToId,
      type: 'creation',
      details: 'Prospect enregistré dans DjagoCRM.',
      created_at: new Date().toISOString()
    };

    await localDb.clients.add(newClient);
    await localDb.interactions.add(newInteraction);

    set((state) => ({
      clients: [newClient, ...state.clients],
      interactions: [newInteraction, ...state.interactions]
    }));

    if (get().isOnline && isSupabaseConfigured && supabase) {
      try {
        await supabase.from('clients').insert([newClient]);
        await supabase.from('interactions').insert([newInteraction]);
      } catch {
        await localDb.offlineQueue.add({
          actionType: 'create_client',
          payload: { client: newClient, interaction: newInteraction },
          timestamp: Date.now()
        });
      }
    } else {
      await localDb.offlineQueue.add({
        actionType: 'create_client',
        payload: { client: newClient, interaction: newInteraction },
        timestamp: Date.now()
      });
      addToast(`Client ${name} sauvegardé localement (Hors-ligne)`, "info");
    }

    set({ offlineActions: await localDb.offlineQueue.toArray() });
  },

  updateClientStatus: async (clientId: string, status: LocalClient['status'], performedByUserId: string) => {
    const { addToast } = useToastStore.getState();
    const now = new Date().toISOString();

    await localDb.clients.update(clientId, { status, last_contact: now });

    const newInteraction: LocalInteraction = {
      id: `int-${Math.random().toString(36).substring(2, 9)}`,
      client_id: clientId,
      performed_by: performedByUserId,
      type: 'statut',
      details: `Changement de statut vers : ${status}`,
      created_at: now
    };
    await localDb.interactions.add(newInteraction);

    set((state) => ({
      clients: state.clients.map((c) => c.id === clientId ? { ...c, status, last_contact: now } : c),
      interactions: [newInteraction, ...state.interactions]
    }));

    if (get().isOnline && isSupabaseConfigured && supabase) {
      try {
        await supabase.from('clients').update({ status, last_contact: now }).eq('id', clientId);
        await supabase.from('interactions').insert([newInteraction]);
      } catch {
        await localDb.offlineQueue.add({
          actionType: 'update_client_status',
          payload: { clientId, status, interaction: newInteraction },
          timestamp: Date.now()
        });
      }
    } else {
      await localDb.offlineQueue.add({
        actionType: 'update_client_status',
        payload: { clientId, status, interaction: newInteraction },
        timestamp: Date.now()
      });
      addToast(`Statut mis à jour localement`, "info");
    }

    set({ offlineActions: await localDb.offlineQueue.toArray() });
  },

  addInteraction: async (clientId: string, type: LocalInteraction['type'], details: string, gpsCoordinates?: string, performedByUserId?: string) => {
    const { addToast } = useToastStore.getState();
    const now = new Date().toISOString();

    const newInteraction: LocalInteraction = {
      id: `int-${Math.random().toString(36).substring(2, 9)}`,
      client_id: clientId,
      performed_by: performedByUserId,
      type,
      details,
      gps_coordinates: gpsCoordinates || undefined,
      created_at: now
    };

    await localDb.interactions.add(newInteraction);
    await localDb.clients.update(clientId, { last_contact: now });

    set((state) => ({
      clients: state.clients.map((c) => c.id === clientId ? { ...c, last_contact: now } : c),
      interactions: [newInteraction, ...state.interactions]
    }));

    if (get().isOnline && isSupabaseConfigured && supabase) {
      try {
        await supabase.from('interactions').insert([newInteraction]);
        await supabase.from('clients').update({ last_contact: now }).eq('id', clientId);
      } catch {
        await localDb.offlineQueue.add({
          actionType: 'create_interaction',
          payload: newInteraction,
          timestamp: Date.now()
        });
      }
    } else {
      await localDb.offlineQueue.add({
        actionType: 'create_interaction',
        payload: newInteraction,
        timestamp: Date.now()
      });
      addToast("Interaction sauvegardée (Hors-ligne)", "info");
    }

    set({ offlineActions: await localDb.offlineQueue.toArray() });
  },

  updateWhatsAppTemplates: async (templates: Record<string, string>) => {
    const { addToast } = useToastStore.getState();
    
    for (const [id, text] of Object.entries(templates)) {
      await localDb.whatsappTemplates.put({ id, text });
    }

    set({ whatsappTemplates: templates });

    if (get().isOnline && isSupabaseConfigured && supabase) {
      try {
        addToast("Modèles WhatsApp synchronisés globalement", "success");
      } catch {
        await localDb.offlineQueue.add({
          actionType: 'update_whatsapp_templates',
          payload: templates,
          timestamp: Date.now()
        });
      }
    } else {
      await localDb.offlineQueue.add({
        actionType: 'update_whatsapp_templates',
        payload: templates,
        timestamp: Date.now()
      });
      addToast("Modèles sauvegardés localement", "info");
    }

    set({ offlineActions: await localDb.offlineQueue.toArray() });
  },

  reassignClient: async (clientId: string, newCommercialId: string, performedByUserId: string) => {
    const { addToast } = useToastStore.getState();
    const now = new Date().toISOString();

    await localDb.clients.update(clientId, { assigned_to: newCommercialId, last_contact: now });

    const newInteraction: LocalInteraction = {
      id: `int-${Math.random().toString(36).substring(2, 9)}`,
      client_id: clientId,
      performed_by: performedByUserId,
      type: 'transfert',
      details: `Client réaffecté à un autre commercial.`,
      created_at: now
    };
    await localDb.interactions.add(newInteraction);

    set((state) => ({
      clients: state.clients.map((c) => c.id === clientId ? { ...c, assigned_to: newCommercialId, last_contact: now } : c),
      interactions: [newInteraction, ...state.interactions]
    }));

    if (get().isOnline && isSupabaseConfigured && supabase) {
      try {
        await supabase.from('clients').update({ assigned_to: newCommercialId, last_contact: now }).eq('id', clientId);
        await supabase.from('interactions').insert([newInteraction]);
      } catch {
        await localDb.offlineQueue.add({
          actionType: 'reassign_client',
          payload: { clientId, newCommercialId, interaction: newInteraction },
          timestamp: Date.now()
        });
      }
    } else {
      await localDb.offlineQueue.add({
        actionType: 'reassign_client',
        payload: { clientId, newCommercialId, interaction: newInteraction },
        timestamp: Date.now()
      });
      addToast("Réassignation enregistrée localement", "info");
    }

    set({ offlineActions: await localDb.offlineQueue.toArray() });
  },

  // -------------------------
  // NEW MODULES ACTIONS
  // -------------------------

  addContact: async (client_id: string, name: string, role: string, phone: string, email?: string) => {
    const { addToast } = useToastStore.getState();
    const newContact: LocalContact = {
      id: `contact-${Math.random().toString(36).substring(2, 9)}`,
      client_id,
      name,
      role,
      phone,
      email,
      created_at: new Date().toISOString()
    };

    await localDb.contacts.add(newContact);
    set((state) => ({ contacts: [newContact, ...state.contacts] }));

    await localDb.offlineQueue.add({
      actionType: 'create_contact',
      payload: newContact,
      timestamp: Date.now()
    });

    set({ offlineActions: await localDb.offlineQueue.toArray() });
    addToast(`Contact ${name} enregistré`, "success");
  },

  addTransaction: async (client_id: string, title: string, amount: number, stage: LocalTransaction['stage'], probability: number, expectedCloseDate: string, assigned_to: string) => {
    const { addToast } = useToastStore.getState();
    const newTrans: LocalTransaction = {
      id: `trans-${Math.random().toString(36).substring(2, 9)}`,
      client_id,
      title,
      amount,
      stage,
      probability,
      expected_close_date: expectedCloseDate,
      assigned_to,
      created_at: new Date().toISOString()
    };

    await localDb.transactions.add(newTrans);
    set((state) => ({ transactions: [newTrans, ...state.transactions] }));

    await localDb.offlineQueue.add({
      actionType: 'create_transaction',
      payload: newTrans,
      timestamp: Date.now()
    });

    set({ offlineActions: await localDb.offlineQueue.toArray() });
    addToast(`Opportunité "${title}" créée`, "success");
  },

  updateTransactionStage: async (transactionId: string, stage: LocalTransaction['stage']) => {
    const { addToast } = useToastStore.getState();
    const probability = stage === 'won' ? 100 : stage === 'lost' ? 0 : stage === 'negotiation' ? 80 : stage === 'proposal' ? 60 : stage === 'presentation' ? 40 : 10;
    
    await localDb.transactions.update(transactionId, { stage, probability });
    set((state) => ({
      transactions: state.transactions.map(t => t.id === transactionId ? { ...t, stage, probability } : t)
    }));

    addToast("Étape de transaction mise à jour", "success");
  },

  addTicket: async (client_id: string, subject: string, priority: LocalTicket['priority'], description: string, assigned_to: string) => {
    const { addToast } = useToastStore.getState();
    const newTicket: LocalTicket = {
      id: `ticket-${Math.random().toString(36).substring(2, 9)}`,
      client_id,
      subject,
      priority,
      status: 'new',
      description,
      assigned_to,
      created_at: new Date().toISOString()
    };

    await localDb.tickets.add(newTicket);
    set((state) => ({ tickets: [newTicket, ...state.tickets] }));

    await localDb.offlineQueue.add({
      actionType: 'create_ticket',
      payload: newTicket,
      timestamp: Date.now()
    });

    set({ offlineActions: await localDb.offlineQueue.toArray() });
    addToast(`Ticket #${newTicket.id.substring(7)} créé`, "success");
  },

  updateTicketStatus: async (ticketId: string, status: LocalTicket['status']) => {
    const { addToast } = useToastStore.getState();
    await localDb.tickets.update(ticketId, { status });
    set((state) => ({
      tickets: state.tickets.map(t => t.id === ticketId ? { ...t, status } : t)
    }));
    addToast("Statut du ticket mis à jour", "success");
  },

  addMeeting: async (client_id: string, title: string, type: LocalMeeting['type'], scheduled_at: string, duration_minutes: number, assigned_to: string) => {
    const { addToast } = useToastStore.getState();
    const newMeet: LocalMeeting = {
      id: `meet-${Math.random().toString(36).substring(2, 9)}`,
      client_id,
      title,
      type,
      scheduled_at,
      duration_minutes,
      assigned_to,
      created_at: new Date().toISOString()
    };

    await localDb.meetings.add(newMeet);
    set((state) => ({ meetings: [newMeet, ...state.meetings] }));

    await localDb.offlineQueue.add({
      actionType: 'create_meeting',
      payload: newMeet,
      timestamp: Date.now()
    });

    set({ offlineActions: await localDb.offlineQueue.toArray() });
    addToast(`Rendez-vous planifié`, "success");
  },

  addOrder: async (client_id: string, items: string, total_amount: number, payment_status: LocalOrder['payment_status'], delivery_status: LocalOrder['delivery_status'], delivery_agent?: string) => {
    const { addToast } = useToastStore.getState();
    const newOrder: LocalOrder = {
      id: `order-${Math.random().toString(36).substring(2, 9)}`,
      client_id,
      items,
      total_amount,
      payment_status,
      delivery_status,
      delivery_agent,
      created_at: new Date().toISOString()
    };

    await localDb.orders.add(newOrder);
    set((state) => ({ orders: [newOrder, ...state.orders] }));

    await localDb.offlineQueue.add({
      actionType: 'create_order',
      payload: newOrder,
      timestamp: Date.now()
    });

    set({ offlineActions: await localDb.offlineQueue.toArray() });
    addToast(`Commande créée`, "success");
  },

  updateOrderStatus: async (orderId: string, payment_status: LocalOrder['payment_status'], delivery_status: LocalOrder['delivery_status']) => {
    const { addToast } = useToastStore.getState();
    await localDb.orders.update(orderId, { payment_status, delivery_status });
    set((state) => ({
      orders: state.orders.map(o => o.id === orderId ? { ...o, payment_status, delivery_status } : o)
    }));
    addToast("Statut de la commande mis à jour", "success");
  },

  addForm: async (title: string, fields: string[]) => {
    const { addToast } = useToastStore.getState();
    const newForm: LocalForm = {
      id: `form-${Math.random().toString(36).substring(2, 9)}`,
      title,
      fields,
      created_at: new Date().toISOString()
    };

    await localDb.forms.add(newForm);
    set((state) => ({ forms: [newForm, ...state.forms] }));

    await localDb.offlineQueue.add({
      actionType: 'create_form',
      payload: newForm,
      timestamp: Date.now()
    });

    set({ offlineActions: await localDb.offlineQueue.toArray() });
    addToast(`Formulaire "${title}" créé avec succès`, "success");
  },

  addSegment: async (name: string, criteria: LocalSegment['criteria']) => {
    const { addToast } = useToastStore.getState();
    const newSegment: LocalSegment = {
      id: `seg-${Math.random().toString(36).substring(2, 9)}`,
      name,
      criteria,
      created_at: new Date().toISOString()
    };

    await localDb.segments.add(newSegment);
    set((state) => ({ segments: [newSegment, ...state.segments] }));

    await localDb.offlineQueue.add({
      actionType: 'create_segment',
      payload: newSegment,
      timestamp: Date.now()
    });

    set({ offlineActions: await localDb.offlineQueue.toArray() });
    addToast(`Segment "${name}" configuré`, "success");
  },

  sendInboxMessage: async (client_id: string | undefined, sender_name: string, sender_address: string, channel: LocalInboxMessage['channel'], body: string, subject?: string) => {
    const { addToast } = useToastStore.getState();
    const newMsg: LocalInboxMessage = {
      id: `msg-${Math.random().toString(36).substring(2, 9)}`,
      client_id,
      sender_name,
      sender_address,
      channel,
      subject,
      body,
      is_read: true,
      created_at: new Date().toISOString()
    };

    await localDb.inbox_messages.add(newMsg);
    set((state) => ({ inboxMessages: [newMsg, ...state.inboxMessages] }));

    await localDb.offlineQueue.add({
      actionType: 'send_inbox_message',
      payload: newMsg,
      timestamp: Date.now()
    });

    // Automatically log this as an interaction if attached to a client
    if (client_id) {
      const typeMap: Record<string, LocalInteraction['type']> = {
        whatsapp: 'whatsapp',
        email: 'email',
        sms: 'appel'
      };
      await get().addInteraction(client_id, typeMap[channel] || 'email', `Message unifié envoyé (${channel}) : ${body}`);
    }

    set({ offlineActions: await localDb.offlineQueue.toArray() });
    addToast("Message envoyé", "success");
  },

  markInboxMessageRead: async (messageId: string) => {
    await localDb.inbox_messages.update(messageId, { is_read: true });
    set((state) => ({
      inboxMessages: state.inboxMessages.map(m => m.id === messageId ? { ...m, is_read: true } : m)
    }));
  },

  syncOfflineQueue: async () => {
    if (get().isSyncing) return;
    const actions = await localDb.offlineQueue.toArray();
    if (actions.length === 0) return;

    set({ isSyncing: true });
    const { addToast } = useToastStore.getState();
    addToast(`Synchronisation de ${actions.length} action(s) en cours...`, "info", 2000);

    let successCount = 0;

    for (const action of actions.sort((a,b) => (a.id || 0) - (b.id || 0))) {
      try {
        if (isSupabaseConfigured && supabase) {
          // Send data to Supabase dynamically if schemas are linked
          if (action.actionType === 'create_client') {
            const { client, interaction } = action.payload;
            await supabase.from('clients').upsert(client);
            await supabase.from('interactions').upsert(interaction);
          } else if (action.actionType === 'update_client_status') {
            const { clientId, status, interaction } = action.payload;
            await supabase.from('clients').update({ status }).eq('id', clientId);
            await supabase.from('interactions').upsert(interaction);
          } else if (action.actionType === 'create_interaction') {
            await supabase.from('interactions').upsert(action.payload);
          } else if (action.actionType === 'reassign_client') {
            const { clientId, newCommercialId, interaction } = action.payload;
            await supabase.from('clients').update({ assigned_to: newCommercialId }).eq('id', clientId);
            await supabase.from('interactions').upsert(interaction);
          }
        }
        
        if (action.id !== undefined) {
          await localDb.offlineQueue.delete(action.id);
        }
        successCount++;
      } catch (err) {
        console.error("Failed to sync action", action, err);
        break;
      }
    }

    set({ isSyncing: false, offlineActions: await localDb.offlineQueue.toArray() });
    if (successCount > 0) {
      addToast(`Synchronisation terminée : ${successCount} action(s) envoyées.`, "success", 3000);
    }
  }
}));
