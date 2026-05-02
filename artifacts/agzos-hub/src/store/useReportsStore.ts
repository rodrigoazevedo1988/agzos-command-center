import { create } from "zustand";

// ─── Types ────────────────────────────────────────────────────────────────────

export type ReportPeriod = "3m" | "6m" | "12m" | "ytd";

export interface MonthlyRevenue {
  month: string;
  actual: number;
  projected: number;
  cost: number;
}

export interface ClientPerformance {
  client: string;
  revenue: number;
  cost: number;
  roi: number;
  projects: number;
  status: "active" | "at_risk" | "churned";
}

export interface ChannelData {
  channel: string;
  spend: number;
  revenue: number;
  leads: number;
  conversions: number;
  roi: number;
  color: string;
}

export interface RevenueKpis {
  totalRevenue: number;
  totalCost: number;
  averageRoi: number;
  activeClients: number;
  deliveredProjects: number;
  forecastNext3m: number;
  revenueGrowth: number;
  roiGrowth: number;
}

// ─── Mock data generators ─────────────────────────────────────────────────────

const MONTHLY_12M: MonthlyRevenue[] = [
  { month: "Jun/25", actual: 42000, projected: 40000, cost: 18000 },
  { month: "Jul/25", actual: 48500, projected: 46000, cost: 19200 },
  { month: "Ago/25", actual: 51000, projected: 50000, cost: 20100 },
  { month: "Set/25", actual: 47200, projected: 52000, cost: 19800 },
  { month: "Out/25", actual: 55800, projected: 54000, cost: 21500 },
  { month: "Nov/25", actual: 62000, projected: 58000, cost: 23000 },
  { month: "Dez/25", actual: 70400, projected: 65000, cost: 25200 },
  { month: "Jan/26", actual: 58600, projected: 68000, cost: 22800 },
  { month: "Fev/26", actual: 64200, projected: 70000, cost: 24100 },
  { month: "Mar/26", actual: 72800, projected: 74000, cost: 26300 },
  { month: "Abr/26", actual: 79500, projected: 78000, cost: 28000 },
  { month: "Mai/26", actual: 0,     projected: 85000, cost: 0 },
];

const CLIENTS: ClientPerformance[] = [
  { client: "Nexus Corp",      revenue: 148000, cost: 52000, roi: 184.6, projects: 8,  status: "active" },
  { client: "TechStart Ltda",  revenue: 96000,  cost: 38000, roi: 152.6, projects: 5,  status: "active" },
  { client: "FoodBrand Co",    revenue: 72000,  cost: 31000, roi: 132.3, projects: 4,  status: "active" },
  { client: "HealthTech BR",   revenue: 58000,  cost: 27000, roi: 114.8, projects: 3,  status: "active" },
  { client: "Moda Urbana",     revenue: 44000,  cost: 22000, roi: 100.0, projects: 3,  status: "at_risk" },
  { client: "StartupXYZ",      revenue: 31000,  cost: 18000, roi: 72.2,  projects: 2,  status: "active" },
  { client: "LogisTech",       revenue: 18000,  cost: 14000, roi: 28.6,  projects: 1,  status: "at_risk" },
  { client: "RetailPlus",      revenue: 0,      cost: 8000,  roi: -100,  projects: 1,  status: "churned" },
];

const CHANNELS: ChannelData[] = [
  { channel: "Google Ads",   spend: 42000, revenue: 168000, leads: 840,  conversions: 126, roi: 300.0, color: "#A855F7" },
  { channel: "Meta Ads",     spend: 35000, revenue: 122500, leads: 612,  conversions: 92,  roi: 250.0, color: "#EC4899" },
  { channel: "SEO Orgânico", spend: 18000, revenue: 90000,  leads: 450,  conversions: 68,  roi: 400.0, color: "#10B981" },
  { channel: "E-mail Mktg",  spend: 8000,  revenue: 40000,  leads: 280,  conversions: 42,  roi: 400.0, color: "#F59E0B" },
  { channel: "LinkedIn Ads", spend: 15000, revenue: 45000,  leads: 180,  conversions: 27,  roi: 200.0, color: "#3B82F6" },
  { channel: "TikTok Ads",   spend: 12000, revenue: 30000,  leads: 520,  conversions: 39,  roi: 150.0, color: "#EF4444" },
];

const KPIS: RevenueKpis = {
  totalRevenue: 751300,
  totalCost: 248200,
  averageRoi: 202.7,
  activeClients: 6,
  deliveredProjects: 27,
  forecastNext3m: 268000,
  revenueGrowth: 18.4,
  roiGrowth: 6.2,
};

// ─── Period slicing ───────────────────────────────────────────────────────────

function sliceByPeriod(data: MonthlyRevenue[], period: ReportPeriod): MonthlyRevenue[] {
  const counts: Record<ReportPeriod, number> = { "3m": 3, "6m": 6, "12m": 12, ytd: 5 };
  return data.slice(-counts[period]);
}

// ─── Store ────────────────────────────────────────────────────────────────────

interface ReportsState {
  period: ReportPeriod;
  kpis: RevenueKpis;
  allMonthlyData: MonthlyRevenue[];
  clients: ClientPerformance[];
  channels: ChannelData[];

  setPeriod: (p: ReportPeriod) => void;
  getMonthlyData: () => MonthlyRevenue[];
  exportCsv: (type: "revenue" | "clients" | "channels") => void;
}

export const useReportsStore = create<ReportsState>()((set, get) => ({
  period: "12m",
  kpis: KPIS,
  allMonthlyData: MONTHLY_12M,
  clients: CLIENTS,
  channels: CHANNELS,

  setPeriod: (period) => set({ period }),

  getMonthlyData: () => sliceByPeriod(get().allMonthlyData, get().period),

  exportCsv: (type) => {
    let csv = "";
    let filename = "";

    if (type === "revenue") {
      filename = "agzos_receita.csv";
      csv = "Mês,Receita Real,Receita Projetada,Custo\n";
      csv += get().getMonthlyData().map(
        (r) => `${r.month},${r.actual},${r.projected},${r.cost}`
      ).join("\n");
    } else if (type === "clients") {
      filename = "agzos_clientes.csv";
      csv = "Cliente,Receita,Custo,ROI (%),Projetos,Status\n";
      csv += get().clients.map(
        (c) => `${c.client},${c.revenue},${c.cost},${c.roi},${c.projects},${c.status}`
      ).join("\n");
    } else {
      filename = "agzos_canais.csv";
      csv = "Canal,Investimento,Receita,Leads,Conversões,ROI (%)\n";
      csv += get().channels.map(
        (c) => `${c.channel},${c.spend},${c.revenue},${c.leads},${c.conversions},${c.roi}`
      ).join("\n");
    }

    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  },
}));
