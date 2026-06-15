import Dexie, { type Table } from 'dexie';

export interface LocalClient {
  id: string;
  name: string;
  company?: string;
  phone: string;
  email?: string;
  service_article?: string;
  status: 'Prospect' | 'Négociation' | 'Vendu' | 'En cours de livraison' | 'Livré & Adopté';
  assigned_to?: string;
  last_contact?: string;
  created_at: string;
}

export interface LocalInteraction {
  id: string;
  client_id: string;
  performed_by?: string;
  type: 'appel' | 'whatsapp' | 'email' | 'terrain' | 'creation' | 'transfert' | 'statut';
  details?: string;
  gps_coordinates?: string;
  created_at: string;
}

export interface WhatsAppTemplate {
  id: string;
  name: string;
  text: string;
}

export interface OfflineAction {
  id?: number;
  actionType: 'create_client' | 'update_client_status' | 'create_interaction' | 'reassign_client' | 'update_whatsapp_templates' | 'create_contact' | 'create_transaction' | 'create_ticket' | 'create_meeting' | 'create_order' | 'create_form' | 'create_segment' | 'send_inbox_message';
  payload: unknown;
  timestamp: number;
  retries?: number;
}

export interface LocalContact {
  id: string;
  client_id: string;
  name: string;
  role: string;
  phone: string;
  email?: string;
  created_at: string;
}

export interface LocalForm {
  id: string;
  title: string;
  fields: string[]; // ['name', 'phone', 'company', etc]
  created_at: string;
}

export interface LocalSegment {
  id: string;
  name: string;
  criteria: {
    status?: string;
    zone?: string;
    noContactDays?: number;
  };
  created_at: string;
}

export interface LocalTransaction {
  id: string;
  client_id: string;
  title: string;
  amount: number;
  stage: 'contact' | 'presentation' | 'proposal' | 'negotiation' | 'won' | 'lost';
  probability: number;
  expected_close_date: string;
  assigned_to: string;
  created_at: string;
}

export interface LocalOrder {
  id: string;
  client_id: string;
  items: string; // JSON or text description
  total_amount: number;
  payment_status: 'unpaid' | 'partial' | 'paid';
  delivery_status: 'preparing' | 'shipping' | 'delivered' | 'returned';
  delivery_agent?: string;
  created_at: string;
}

export interface LocalTicket {
  id: string;
  client_id: string;
  subject: string;
  priority: 'low' | 'medium' | 'high';
  status: 'new' | 'open' | 'resolved';
  description: string;
  assigned_to: string;
  created_at: string;
}

export interface LocalMeeting {
  id: string;
  client_id: string;
  title: string;
  type: 'appel' | 'terrain' | 'demo';
  scheduled_at: string;
  duration_minutes: number;
  assigned_to: string;
  created_at: string;
}

export interface LocalInboxMessage {
  id: string;
  client_id?: string;
  sender_name: string;
  sender_address: string;
  channel: 'whatsapp' | 'email' | 'sms';
  subject?: string;
  body: string;
  is_read: boolean;
  created_at: string;
}

class DjagoLocalDatabase extends Dexie {
  clients!: Table<LocalClient, string>;
  interactions!: Table<LocalInteraction, string>;
  offlineQueue!: Table<OfflineAction, number>;
  whatsappTemplates!: Table<WhatsAppTemplate, string>;
  contacts!: Table<LocalContact, string>;
  forms!: Table<LocalForm, string>;
  segments!: Table<LocalSegment, string>;
  transactions!: Table<LocalTransaction, string>;
  orders!: Table<LocalOrder, string>;
  tickets!: Table<LocalTicket, string>;
  meetings!: Table<LocalMeeting, string>;
  inbox_messages!: Table<LocalInboxMessage, string>;

  constructor() {
    super('DjagoCRM_LocalDB');
    this.version(3).stores({
      clients: 'id, name, status, assigned_to, created_at',
      interactions: 'id, client_id, performed_by, type, created_at',
      offlineQueue: '++id, actionType, timestamp',
      whatsappTemplates: 'id',
      contacts: 'id, client_id',
      forms: 'id',
      segments: 'id',
      transactions: 'id, client_id, stage, assigned_to',
      orders: 'id, client_id, payment_status, delivery_status',
      tickets: 'id, client_id, priority, status, assigned_to',
      meetings: 'id, client_id, scheduled_at, assigned_to',
      inbox_messages: 'id, client_id, channel, is_read, created_at'
    });
  }
}

export const localDb = new DjagoLocalDatabase();

