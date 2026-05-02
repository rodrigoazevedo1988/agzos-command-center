import { create } from "zustand";

export type InvoiceStatus = "draft" | "sent" | "paid" | "overdue" | "cancelled";
export type InvoiceCategory = "retainer" | "project" | "ads_management" | "consulting" | "other";

export interface Invoice {
  id: string;
  number: string;
  clientId: string;
  clientName: string;
  projectName: string;
  amount: number;
  status: InvoiceStatus;
  category: InvoiceCategory;
  issueDate: string;
  dueDate: string;
  paidDate?: string;
  description: string;
}

export interface NewInvoiceInput {
  clientName: string;
  projectName: string;
  amount: number;
  category: InvoiceCategory;
  dueDate: string;
  description: string;
}

export interface MonthlyCashflow {
  month: string;
  received: number;
  expected: number;
  expenses: number;
}

const INVOICES: Invoice[] = [
  { id: "inv1",  number: "INV-2026-0052", clientId: "c1",  clientName: "Nexus Corp",     projectName: "Gestão de Ads",       amount: 12400, status: "paid",     category: "retainer",       issueDate: "2026-05-01", dueDate: "2026-05-10", paidDate: "2026-05-08", description: "Retainer mensal — Gestão completa de mídia paga." },
  { id: "inv2",  number: "INV-2026-0051", clientId: "c2",  clientName: "TechStart Ltda", projectName: "Performance SEO",     amount: 8000,  status: "sent",     category: "retainer",       issueDate: "2026-05-01", dueDate: "2026-05-15", description: "Retainer mensal — SEO + Conteúdo." },
  { id: "inv3",  number: "INV-2026-0050", clientId: "c3",  clientName: "FoodBrand Co",   projectName: "Social Media",        amount: 6000,  status: "overdue",  category: "retainer",       issueDate: "2026-04-01", dueDate: "2026-04-30", description: "Retainer mensal — Gestão de redes sociais." },
  { id: "inv4",  number: "INV-2026-0049", clientId: "c4",  clientName: "HealthTech BR",  projectName: "Onboarding + Setup",  amount: 4800,  status: "sent",     category: "project",        issueDate: "2026-05-02", dueDate: "2026-05-20", description: "Setup inicial — Google Ads, Meta e Analytics." },
  { id: "inv5",  number: "INV-2026-0048", clientId: "c1",  clientName: "Nexus Corp",     projectName: "Gestão de Ads",       amount: 12400, status: "paid",     category: "retainer",       issueDate: "2026-04-01", dueDate: "2026-04-10", paidDate: "2026-04-09", description: "Retainer mensal abril — Gestão completa." },
  { id: "inv6",  number: "INV-2026-0047", clientId: "c2",  clientName: "TechStart Ltda", projectName: "Performance SEO",     amount: 8000,  status: "paid",     category: "retainer",       issueDate: "2026-04-01", dueDate: "2026-04-15", paidDate: "2026-04-14", description: "Retainer mensal abril." },
  { id: "inv7",  number: "INV-2026-0046", clientId: "c3",  clientName: "FoodBrand Co",   projectName: "Campanha Verão",      amount: 9500,  status: "paid",     category: "ads_management", issueDate: "2026-03-15", dueDate: "2026-03-30", paidDate: "2026-03-29", description: "Gerenciamento de campanha especial Q1." },
  { id: "inv8",  number: "INV-2026-0045", clientId: "c5",  clientName: "Moda Urbana",    projectName: "Consultoria Inicial", amount: 1800,  status: "paid",     category: "consulting",     issueDate: "2026-03-01", dueDate: "2026-03-15", paidDate: "2026-03-10", description: "Sessão de diagnóstico e planejamento estratégico." },
  { id: "inv9",  number: "INV-2026-0044", clientId: "c1",  clientName: "Nexus Corp",     projectName: "Gestão de Ads",       amount: 12400, status: "paid",     category: "retainer",       issueDate: "2026-03-01", dueDate: "2026-03-10", paidDate: "2026-03-08", description: "Retainer mensal março." },
  { id: "inv10", number: "INV-2026-0043", clientId: "c2",  clientName: "TechStart Ltda", projectName: "Performance SEO",     amount: 8000,  status: "paid",     category: "retainer",       issueDate: "2026-03-01", dueDate: "2026-03-15", paidDate: "2026-03-13", description: "Retainer mensal março." },
  { id: "inv11", number: "INV-2026-0042", clientId: "c9",  clientName: "OldBrand SA",    projectName: "Campanha Q4",         amount: 7200,  status: "overdue",  category: "project",        issueDate: "2026-02-01", dueDate: "2026-02-28", description: "Última parcela do projeto — aguardando liquidação." },
  { id: "inv12", number: "INV-2026-0041", clientId: "c3",  clientName: "FoodBrand Co",   projectName: "Social Media",        amount: 6000,  status: "cancelled",category: "retainer",       issueDate: "2026-02-01", dueDate: "2026-02-28", description: "Retainer fevereiro — cancelado por solicitação." },
];

const CASHFLOW: MonthlyCashflow[] = [
  { month: "Dez/25", received: 38400, expected: 40000, expenses: 14200 },
  { month: "Jan/26", received: 44200, expected: 46000, expenses: 15800 },
  { month: "Fev/26", received: 29200, expected: 38000, expenses: 13600 },
  { month: "Mar/26", received: 51800, expected: 52000, expenses: 17200 },
  { month: "Abr/26", received: 47600, expected: 48000, expenses: 16400 },
  { month: "Mai/26", received: 12400, expected: 54000, expenses: 18000 },
];

let invSeq = 200;
function nextInvNumber() {
  invSeq++;
  return `INV-2026-${String(invSeq).padStart(4, "0")}`;
}

interface FinancialState {
  invoices: Invoice[];
  cashflow: MonthlyCashflow[];
  statusFilter: InvoiceStatus | "all";
  searchQuery: string;

  addInvoice: (input: NewInvoiceInput) => void;
  markPaid: (id: string) => void;
  cancelInvoice: (id: string) => void;
  setStatusFilter: (f: InvoiceStatus | "all") => void;
  setSearchQuery: (q: string) => void;

  getFiltered: () => Invoice[];
  getSummary: () => {
    totalReceived: number;
    pendingAmount: number;
    overdueAmount: number;
    draftCount: number;
  };
}

export const useFinancialStore = create<FinancialState>()((set, get) => ({
  invoices: INVOICES,
  cashflow: CASHFLOW,
  statusFilter: "all",
  searchQuery: "",

  addInvoice: (input) => {
    const inv: Invoice = {
      ...input,
      id: `inv${++invSeq}`,
      number: nextInvNumber(),
      clientId: "",
      status: "draft",
      issueDate: new Date().toISOString().split("T")[0],
    };
    set((s) => ({ invoices: [inv, ...s.invoices] }));
  },

  markPaid: (id) =>
    set((s) => ({
      invoices: s.invoices.map((inv) =>
        inv.id === id
          ? { ...inv, status: "paid" as const, paidDate: new Date().toISOString().split("T")[0] }
          : inv
      ),
    })),

  cancelInvoice: (id) =>
    set((s) => ({
      invoices: s.invoices.map((inv) =>
        inv.id === id ? { ...inv, status: "cancelled" as const } : inv
      ),
    })),

  setStatusFilter: (f) => set({ statusFilter: f }),
  setSearchQuery: (q) => set({ searchQuery: q }),

  getFiltered: () => {
    const { invoices, statusFilter, searchQuery } = get();
    return invoices.filter((inv) => {
      const matchStatus = statusFilter === "all" || inv.status === statusFilter;
      const q = searchQuery.toLowerCase();
      const matchSearch =
        !q ||
        inv.clientName.toLowerCase().includes(q) ||
        inv.number.toLowerCase().includes(q) ||
        inv.projectName.toLowerCase().includes(q);
      return matchStatus && matchSearch;
    });
  },

  getSummary: () => {
    const { invoices } = get();
    return {
      totalReceived: invoices.filter((i) => i.status === "paid").reduce((a, i) => a + i.amount, 0),
      pendingAmount: invoices.filter((i) => i.status === "sent").reduce((a, i) => a + i.amount, 0),
      overdueAmount: invoices.filter((i) => i.status === "overdue").reduce((a, i) => a + i.amount, 0),
      draftCount: invoices.filter((i) => i.status === "draft").length,
    };
  },
}));
