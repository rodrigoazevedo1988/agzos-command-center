import { create } from "zustand";

export type ClientStage = "lead" | "proposal" | "contract" | "active" | "churned";

export interface ClientNote {
  id: string;
  text: string;
  author: string;
  createdAt: string;
}

export interface Client {
  id: string;
  name: string;
  companyName: string;
  email: string;
  phone: string;
  stage: ClientStage;
  monthlyValue: number;
  totalRevenue: number;
  avatar: string;
  industry: string;
  website: string;
  source: string;
  assignedTo: string;
  notes: ClientNote[];
  tags: string[];
  createdAt: string;
  lastContact: string;
}

export interface NewClientInput {
  name: string;
  companyName: string;
  email: string;
  phone: string;
  stage: ClientStage;
  monthlyValue: number;
  industry: string;
  website: string;
  source: string;
  assignedTo: string;
}

const MOCK_CLIENTS: Client[] = [
  {
    id: "c1", name: "Rodrigo Almeida", companyName: "Nexus Corp", email: "rodrigo@nexus.com",
    phone: "(11) 98765-4321", stage: "active", monthlyValue: 12400, totalRevenue: 148800,
    avatar: "RA", industry: "Tecnologia", website: "nexus.com.br", source: "Indicação",
    assignedTo: "Ana Rodrigues", tags: ["enterprise", "ads", "seo"],
    notes: [
      { id: "n1", text: "Cliente muito satisfeito com resultados Q1. Quer expandir orçamento de mídia.", author: "Ana Rodrigues", createdAt: new Date(Date.now() - 86400000 * 2).toISOString() },
      { id: "n2", text: "Reunião de alinhamento mensal agendada para dia 15.", author: "Lucas Ferreira", createdAt: new Date(Date.now() - 86400000 * 5).toISOString() },
    ],
    createdAt: "2024-06-15", lastContact: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: "c2", name: "Camila Torres", companyName: "TechStart Ltda", email: "camila@techstart.com",
    phone: "(21) 97654-3210", stage: "active", monthlyValue: 8000, totalRevenue: 96000,
    avatar: "CT", industry: "SaaS", website: "techstart.io", source: "Google Ads",
    assignedTo: "Ana Rodrigues", tags: ["saas", "growth", "performance"],
    notes: [
      { id: "n3", text: "Crescimento de 40% em leads qualificados este trimestre.", author: "Ana Rodrigues", createdAt: new Date(Date.now() - 86400000 * 7).toISOString() },
    ],
    createdAt: "2024-08-01", lastContact: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: "c3", name: "Felipe Nunes", companyName: "FoodBrand Co", email: "felipe@foodbrand.com",
    phone: "(31) 96543-2109", stage: "active", monthlyValue: 6000, totalRevenue: 72000,
    avatar: "FN", industry: "Alimentação", website: "foodbrand.com.br", source: "LinkedIn",
    assignedTo: "Lucas Ferreira", tags: ["social", "branding", "design"],
    notes: [],
    createdAt: "2024-09-10", lastContact: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
  {
    id: "c4", name: "Beatriz Souza", companyName: "HealthTech BR", email: "beatriz@healthtech.com",
    phone: "(41) 95432-1098", stage: "contract", monthlyValue: 4800, totalRevenue: 14400,
    avatar: "BS", industry: "Saúde", website: "healthtech.com.br", source: "Evento",
    assignedTo: "Ana Rodrigues", tags: ["health", "digital", "ads"],
    notes: [
      { id: "n4", text: "Contrato assinado. Iniciando onboarding semana que vem.", author: "Lucas Ferreira", createdAt: new Date(Date.now() - 86400000 * 1).toISOString() },
    ],
    createdAt: "2025-01-05", lastContact: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
  {
    id: "c5", name: "André Lima", companyName: "Moda Urbana", email: "andre@modaurbana.com",
    phone: "(51) 94321-0987", stage: "proposal", monthlyValue: 3600, totalRevenue: 0,
    avatar: "AL", industry: "Moda & Varejo", website: "modaurbana.com.br", source: "Instagram",
    assignedTo: "Ana Rodrigues", tags: ["ecommerce", "social", "ugc"],
    notes: [
      { id: "n5", text: "Proposta de R$ 3.600/mês enviada. Aguardando retorno do comercial.", author: "Ana Rodrigues", createdAt: new Date(Date.now() - 86400000 * 3).toISOString() },
    ],
    createdAt: "2025-02-18", lastContact: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: "c6", name: "Priya Sharma", companyName: "StartupXYZ", email: "priya@startupxyz.com",
    phone: "(11) 93210-9876", stage: "proposal", monthlyValue: 2800, totalRevenue: 0,
    avatar: "PS", industry: "Tecnologia", website: "startupxyz.com", source: "Indicação",
    assignedTo: "Lucas Ferreira", tags: ["startup", "performance", "growth"],
    notes: [],
    createdAt: "2025-03-10", lastContact: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    id: "c7", name: "Gabriel Martins", companyName: "LogisTech SA", email: "gabriel@logistech.com",
    phone: "(85) 92109-8765", stage: "lead", monthlyValue: 0, totalRevenue: 0,
    avatar: "GM", industry: "Logística", website: "logistech.com.br", source: "Google Ads",
    assignedTo: "Lucas Ferreira", tags: ["b2b", "logistics"],
    notes: [
      { id: "n6", text: "Primeiro contato feito via formulário. Ligação agendada para quinta.", author: "Lucas Ferreira", createdAt: new Date(Date.now() - 86400000 * 0.5).toISOString() },
    ],
    createdAt: "2025-04-28", lastContact: new Date(Date.now() - 86400000 * 0.5).toISOString(),
  },
  {
    id: "c8", name: "Vanessa Rocha", companyName: "RetailPlus", email: "vanessa@retailplus.com",
    phone: "(62) 91098-7654", stage: "lead", monthlyValue: 0, totalRevenue: 0,
    avatar: "VR", industry: "Varejo", website: "retailplus.com.br", source: "Cold outreach",
    assignedTo: "Ana Rodrigues", tags: ["retail", "ads"],
    notes: [],
    createdAt: "2025-04-30", lastContact: new Date(Date.now() - 86400000 * 0.2).toISOString(),
  },
  {
    id: "c9", name: "Marcos Pinto", companyName: "OldBrand SA", email: "marcos@oldbrand.com",
    phone: "(11) 90987-6543", stage: "churned", monthlyValue: 0, totalRevenue: 28000,
    avatar: "MP", industry: "Manufatura", website: "oldbrand.com.br", source: "Evento",
    assignedTo: "Lucas Ferreira", tags: ["legacy"],
    notes: [
      { id: "n7", text: "Cliente encerrou contrato por corte de budget. Porta aberta para retorno.", author: "Lucas Ferreira", createdAt: new Date(Date.now() - 86400000 * 30).toISOString() },
    ],
    createdAt: "2023-11-01", lastContact: new Date(Date.now() - 86400000 * 30).toISOString(),
  },
];

const STAGE_ORDER: ClientStage[] = ["lead", "proposal", "contract", "active", "churned"];

interface ClientsState {
  clients: Client[];
  addClient: (input: NewClientInput) => void;
  moveClient: (clientId: string, stage: ClientStage) => void;
  addNote: (clientId: string, text: string, author: string) => void;
  updateClient: (clientId: string, patch: Partial<Client>) => void;
  getByStage: (stage: ClientStage) => Client[];
  getPipelineValue: () => number;
}

let seq = 100;

export const useClientsStore = create<ClientsState>()((set, get) => ({
  clients: MOCK_CLIENTS,

  addClient: (input) => {
    const client: Client = {
      ...input,
      id: `c${++seq}`,
      totalRevenue: 0,
      avatar: input.name.slice(0, 2).toUpperCase(),
      tags: [],
      notes: [],
      createdAt: new Date().toISOString().split("T")[0],
      lastContact: new Date().toISOString(),
    };
    set((s) => ({ clients: [client, ...s.clients] }));
  },

  moveClient: (clientId, stage) =>
    set((s) => ({
      clients: s.clients.map((c) => c.id === clientId ? { ...c, stage } : c),
    })),

  addNote: (clientId, text, author) => {
    const note: ClientNote = {
      id: `note-${++seq}`,
      text,
      author,
      createdAt: new Date().toISOString(),
    };
    set((s) => ({
      clients: s.clients.map((c) =>
        c.id === clientId ? { ...c, notes: [note, ...c.notes] } : c
      ),
    }));
  },

  updateClient: (clientId, patch) =>
    set((s) => ({
      clients: s.clients.map((c) => c.id === clientId ? { ...c, ...patch } : c),
    })),

  getByStage: (stage) => get().clients.filter((c) => c.stage === stage),

  getPipelineValue: () =>
    get().clients
      .filter((c) => ["proposal", "contract"].includes(c.stage))
      .reduce((a, c) => a + c.monthlyValue * 12, 0),
}));

export { STAGE_ORDER };
