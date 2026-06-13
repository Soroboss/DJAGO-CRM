export type ModuleState = {
  sales: boolean;
  support: boolean;
  delivery: boolean;
  field_tracking: boolean;
  inventory: boolean;
};

export type Vocabulary = {
  client: string;
  clients: string;
  transaction: string;
  transactions: string;
  agent: string;
  agents: string;
};

export type IndustryConfig = {
  id: string;
  label: string;
  description: string;
  defaultModules: ModuleState;
  vocabulary: Vocabulary;
};

export const INDUSTRIES: Record<string, IndustryConfig> = {
  b2b_services: {
    id: 'b2b_services',
    label: 'Services B2B & Agences',
    description: 'Idéal pour le conseil, les agences de communication, et les prestations B2B.',
    defaultModules: {
      sales: true,
      support: true,
      delivery: false,
      field_tracking: false,
      inventory: false
    },
    vocabulary: {
      client: 'Client',
      clients: 'Clients',
      transaction: 'Contrat',
      transactions: 'Contrats',
      agent: 'Consultant',
      agents: 'Consultants'
    }
  },
  real_estate: {
    id: 'real_estate',
    label: 'Immobilier',
    description: 'Agences immobilières, promoteurs et gestionnaires de biens.',
    defaultModules: {
      sales: true,
      support: true,
      delivery: false,
      field_tracking: true,
      inventory: false
    },
    vocabulary: {
      client: 'Acquéreur',
      clients: 'Acquéreurs',
      transaction: 'Mandat',
      transactions: 'Mandats',
      agent: 'Agent',
      agents: 'Agents'
    }
  },
  ecommerce: {
    id: 'ecommerce',
    label: 'E-commerce & Vente',
    description: 'Boutiques en ligne, vente de détail et expéditions.',
    defaultModules: {
      sales: true,
      support: true,
      delivery: true,
      field_tracking: false,
      inventory: true
    },
    vocabulary: {
      client: 'Client',
      clients: 'Clients',
      transaction: 'Commande',
      transactions: 'Commandes',
      agent: 'Vendeur',
      agents: 'Vendeurs'
    }
  },
  healthcare: {
    id: 'healthcare',
    label: 'Santé & Médical',
    description: 'Cabinets médicaux, cliniques et professionnels de santé.',
    defaultModules: {
      sales: true,
      support: false,
      delivery: false,
      field_tracking: false,
      inventory: false
    },
    vocabulary: {
      client: 'Patient',
      clients: 'Patients',
      transaction: 'Consultation',
      transactions: 'Consultations',
      agent: 'Praticien',
      agents: 'Praticiens'
    }
  },
  construction: {
    id: 'construction',
    label: 'BTP & Construction',
    description: 'Entreprises de bâtiment, artisans et suivi de chantier.',
    defaultModules: {
      sales: true,
      support: true,
      delivery: true,
      field_tracking: true,
      inventory: true
    },
    vocabulary: {
      client: 'Maître d\'ouvrage',
      clients: 'Maîtres d\'ouvrage',
      transaction: 'Chantier',
      transactions: 'Chantiers',
      agent: 'Chef de chantier',
      agents: 'Chefs de chantier'
    }
  }
};

export const DEFAULT_INDUSTRY_CONFIG = INDUSTRIES['b2b_services'];

export const getIndustryConfig = (industryId?: string): IndustryConfig => {
  if (!industryId || !INDUSTRIES[industryId]) return DEFAULT_INDUSTRY_CONFIG;
  return INDUSTRIES[industryId];
};
