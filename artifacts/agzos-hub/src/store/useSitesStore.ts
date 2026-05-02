import { create } from "zustand";

export type SiteStatus = "active" | "development" | "maintenance" | "paused";
export type SitePlatform = "Lovable" | "Replit" | "WordPress" | "Webflow" | "Next.js" | "Shopify" | "Custom";

export interface SiteDeployment {
  id: string;
  date: string;
  author: string;
  message: string;
  status: "success" | "failed" | "in_progress";
  sha: string;
}

export interface SiteMetrics {
  visitsToday: number;
  conversions: number;
  bounceRate: number;
}

export interface Site {
  id: string;
  name: string;
  url: string;
  adminUrl?: string;
  editUrl?: string;
  clientName: string;
  status: SiteStatus;
  platform: SitePlatform;
  gradient: string;
  metrics: SiteMetrics;
  deployments: SiteDeployment[];
  lastDeployedAt: string;
  tags: string[];
}

const MOCK_SITES: Site[] = [
  {
    id: "1",
    name: "Agzos Agency",
    url: "https://agzos.agency",
    adminUrl: "https://agzos.agency/admin",
    editUrl: "https://lovable.dev/projects/agzos",
    clientName: "Agzos Interna",
    status: "active",
    platform: "Lovable",
    gradient: "from-violet-600 via-purple-700 to-indigo-800",
    tags: ["landing", "corporativo"],
    metrics: { visitsToday: 1842, conversions: 94, bounceRate: 28 },
    lastDeployedAt: "2025-05-01T14:22:00Z",
    deployments: [
      { id: "d1", date: "2025-05-01T14:22:00Z", author: "Carlos Dev", message: "feat: hero section redesign", status: "success", sha: "a3f9c12" },
      { id: "d2", date: "2025-04-28T10:11:00Z", author: "Julia Lima", message: "fix: mobile nav overflow", status: "success", sha: "b2e7d04" },
      { id: "d3", date: "2025-04-22T17:45:00Z", author: "Carlos Dev", message: "chore: update deps", status: "failed", sha: "c1d5a98" },
      { id: "d4", date: "2025-04-15T09:30:00Z", author: "Lucas Ferreira", message: "feat: add contact form", status: "success", sha: "d4f8b23" },
    ],
  },
  {
    id: "2",
    name: "MBO Consultoria",
    url: "https://mbo.com.br",
    adminUrl: "https://mbo.com.br/wp-admin",
    clientName: "MBO Empresas",
    status: "active",
    platform: "WordPress",
    gradient: "from-emerald-500 via-teal-600 to-cyan-700",
    tags: ["institucional", "blog"],
    metrics: { visitsToday: 3201, conversions: 187, bounceRate: 42 },
    lastDeployedAt: "2025-04-29T08:15:00Z",
    deployments: [
      { id: "d5", date: "2025-04-29T08:15:00Z", author: "Ana Rodrigues", message: "update: novo post blog", status: "success", sha: "e5c2a11" },
      { id: "d6", date: "2025-04-20T16:40:00Z", author: "Carlos Dev", message: "fix: plugin de cache", status: "success", sha: "f6d3b44" },
      { id: "d7", date: "2025-04-10T11:20:00Z", author: "Ana Rodrigues", message: "feat: página de serviços", status: "success", sha: "g7e4c55" },
    ],
  },
  {
    id: "3",
    name: "TechFlow SaaS",
    url: "https://techflow.io",
    editUrl: "https://replit.com/@agzos/techflow",
    clientName: "TechFlow Inc.",
    status: "development",
    platform: "Replit",
    gradient: "from-blue-500 via-blue-700 to-violet-800",
    tags: ["saas", "dashboard", "app"],
    metrics: { visitsToday: 512, conversions: 38, bounceRate: 19 },
    lastDeployedAt: "2025-05-01T22:05:00Z",
    deployments: [
      { id: "d8", date: "2025-05-01T22:05:00Z", author: "Carlos Dev", message: "feat: auth module MVP", status: "in_progress", sha: "h8f5d66" },
      { id: "d9", date: "2025-05-01T18:30:00Z", author: "Carlos Dev", message: "feat: dashboard charts", status: "success", sha: "i9g6e77" },
      { id: "d10", date: "2025-04-30T15:00:00Z", author: "Julia Lima", message: "ui: design system tokens", status: "success", sha: "j0h7f88" },
    ],
  },
  {
    id: "4",
    name: "Boutique Eleganza",
    url: "https://eleganza.com.br",
    adminUrl: "https://eleganza.myshopify.com/admin",
    clientName: "Eleganza Fashion",
    status: "active",
    platform: "Shopify",
    gradient: "from-rose-500 via-pink-600 to-fuchsia-700",
    tags: ["e-commerce", "moda"],
    metrics: { visitsToday: 4873, conversions: 312, bounceRate: 35 },
    lastDeployedAt: "2025-04-27T13:00:00Z",
    deployments: [
      { id: "d11", date: "2025-04-27T13:00:00Z", author: "Ana Rodrigues", message: "feat: coleção verão 2025", status: "success", sha: "k1i8g99" },
      { id: "d12", date: "2025-04-18T09:45:00Z", author: "Julia Lima", message: "fix: checkout mobile", status: "success", sha: "l2j9h00" },
    ],
  },
  {
    id: "5",
    name: "ImovelMax",
    url: "https://imovelmax.com.br",
    editUrl: "https://lovable.dev/projects/imovelmax",
    clientName: "ImovelMax Imóveis",
    status: "maintenance",
    platform: "Lovable",
    gradient: "from-amber-500 via-orange-600 to-red-700",
    tags: ["imóveis", "landing"],
    metrics: { visitsToday: 891, conversions: 43, bounceRate: 51 },
    lastDeployedAt: "2025-04-25T10:00:00Z",
    deployments: [
      { id: "d13", date: "2025-04-25T10:00:00Z", author: "Carlos Dev", message: "maintenance: db migration", status: "in_progress", sha: "m3k0i11" },
      { id: "d14", date: "2025-04-20T14:30:00Z", author: "Carlos Dev", message: "fix: filtro de busca", status: "success", sha: "n4l1j22" },
    ],
  },
  {
    id: "6",
    name: "Studio Vértice",
    url: "https://vertice.studio",
    editUrl: "https://webflow.com/design/vertice",
    clientName: "Vértice Criativo",
    status: "active",
    platform: "Webflow",
    gradient: "from-sky-400 via-blue-500 to-indigo-600",
    tags: ["portfólio", "criativo"],
    metrics: { visitsToday: 2104, conversions: 156, bounceRate: 24 },
    lastDeployedAt: "2025-04-30T17:22:00Z",
    deployments: [
      { id: "d15", date: "2025-04-30T17:22:00Z", author: "Julia Lima", message: "feat: galeria interativa", status: "success", sha: "o5m2k33" },
      { id: "d16", date: "2025-04-23T11:10:00Z", author: "Julia Lima", message: "ui: tipografia refinada", status: "success", sha: "p6n3l44" },
      { id: "d17", date: "2025-04-16T08:55:00Z", author: "Ana Rodrigues", message: "content: atualiza bio", status: "success", sha: "q7o4m55" },
    ],
  },
  {
    id: "7",
    name: "DataPulse Analytics",
    url: "https://datapulse.io",
    editUrl: "https://replit.com/@agzos/datapulse",
    clientName: "DataPulse Corp.",
    status: "paused",
    platform: "Next.js",
    gradient: "from-slate-600 via-slate-700 to-slate-800",
    tags: ["analytics", "dashboard", "b2b"],
    metrics: { visitsToday: 0, conversions: 0, bounceRate: 0 },
    lastDeployedAt: "2025-03-10T12:00:00Z",
    deployments: [
      { id: "d18", date: "2025-03-10T12:00:00Z", author: "Carlos Dev", message: "chore: freeze build", status: "success", sha: "r8p5n66" },
    ],
  },
];

interface SitesFilter {
  search: string;
  status: SiteStatus | "all";
  platform: SitePlatform | "all";
}

interface SitesStore {
  sites: Site[];
  filter: SitesFilter;
  setSearch: (search: string) => void;
  setStatus: (status: SiteStatus | "all") => void;
  setPlatform: (platform: SitePlatform | "all") => void;
  clearFilters: () => void;
  filteredSites: () => Site[];
  stats: () => { total: number; active: number; development: number; maintenance: number; paused: number };
}

export const useSitesStore = create<SitesStore>()((set, get) => ({
  sites: MOCK_SITES,
  filter: { search: "", status: "all", platform: "all" },

  setSearch: (search) => set((s) => ({ filter: { ...s.filter, search } })),
  setStatus: (status) => set((s) => ({ filter: { ...s.filter, status } })),
  setPlatform: (platform) => set((s) => ({ filter: { ...s.filter, platform } })),
  clearFilters: () => set({ filter: { search: "", status: "all", platform: "all" } }),

  filteredSites: () => {
    const { sites, filter } = get();
    return sites.filter((site) => {
      const matchSearch =
        !filter.search ||
        site.name.toLowerCase().includes(filter.search.toLowerCase()) ||
        site.url.toLowerCase().includes(filter.search.toLowerCase()) ||
        site.clientName.toLowerCase().includes(filter.search.toLowerCase()) ||
        site.tags.some((t) => t.toLowerCase().includes(filter.search.toLowerCase()));
      const matchStatus = filter.status === "all" || site.status === filter.status;
      const matchPlatform = filter.platform === "all" || site.platform === filter.platform;
      return matchSearch && matchStatus && matchPlatform;
    });
  },

  stats: () => {
    const { sites } = get();
    return {
      total: sites.length,
      active: sites.filter((s) => s.status === "active").length,
      development: sites.filter((s) => s.status === "development").length,
      maintenance: sites.filter((s) => s.status === "maintenance").length,
      paused: sites.filter((s) => s.status === "paused").length,
    };
  },
}));
