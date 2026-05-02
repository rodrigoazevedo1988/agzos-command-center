import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ToolStatus = "active" | "inactive";
export type ToolCategory =
  | "advertising" | "analytics" | "design" | "development"
  | "communication" | "finance" | "crm" | "seo" | "other";

export interface Tool {
  id: string;
  name: string;
  description: string;
  category: ToolCategory;
  status: ToolStatus;
  monthlyCost: number;
  url: string;
  loginEmail: string;
  icon: string;
  color: string;
  renewalDate: string;
  usedBy: string[];
}

export interface NewToolInput {
  name: string;
  description: string;
  category: ToolCategory;
  monthlyCost: number;
  url: string;
  loginEmail: string;
}

const MOCK_TOOLS: Tool[] = [
  { id: "t1",  name: "Google Ads",      description: "Plataforma de anúncios de pesquisa, display e YouTube.",          category: "advertising",    status: "active",   monthlyCost: 0,    url: "ads.google.com",          loginEmail: "ads@agzos.agency",     icon: "🎯", color: "text-blue-400",   renewalDate: "", usedBy: ["Gestor de Tráfego", "Admin"] },
  { id: "t2",  name: "Meta Business",   description: "Gerenciador de campanhas Facebook e Instagram Ads.",               category: "advertising",    status: "active",   monthlyCost: 0,    url: "business.facebook.com",   loginEmail: "ads@agzos.agency",     icon: "📘", color: "text-indigo-400", renewalDate: "", usedBy: ["Gestor de Tráfego"] },
  { id: "t3",  name: "Google Analytics",description: "Análise de tráfego, comportamento e conversões em sites.",         category: "analytics",      status: "active",   monthlyCost: 0,    url: "analytics.google.com",    loginEmail: "analytics@agzos.agency",icon: "📊", color: "text-orange-400", renewalDate: "", usedBy: ["Admin", "Gerente de Conta"] },
  { id: "t4",  name: "SEMrush",         description: "SEO, análise de concorrentes e auditoria de sites.",               category: "seo",            status: "active",   monthlyCost: 450,  url: "semrush.com",             loginEmail: "seo@agzos.agency",     icon: "🔍", color: "text-yellow-400", renewalDate: "2026-07-01", usedBy: ["Designer", "Desenvolvedor"] },
  { id: "t5",  name: "Figma",           description: "Design de interfaces, prototipagem e colaboração.",                 category: "design",         status: "active",   monthlyCost: 180,  url: "figma.com",               loginEmail: "design@agzos.agency",  icon: "🎨", color: "text-pink-400",   renewalDate: "2026-06-01", usedBy: ["Designer"] },
  { id: "t6",  name: "Vercel",          description: "Deploy e hospedagem de aplicações frontend.",                       category: "development",    status: "active",   monthlyCost: 120,  url: "vercel.com",              loginEmail: "dev@agzos.agency",     icon: "▲",  color: "text-foreground", renewalDate: "2026-06-15", usedBy: ["Desenvolvedor"] },
  { id: "t7",  name: "Slack",           description: "Comunicação interna e com clientes.",                               category: "communication",  status: "active",   monthlyCost: 240,  url: "slack.com",               loginEmail: "admin@agzos.agency",   icon: "💬", color: "text-purple-400", renewalDate: "2026-08-01", usedBy: ["Todos"] },
  { id: "t8",  name: "Notion",          description: "Documentação, wikis e gestão de projetos.",                         category: "crm",            status: "active",   monthlyCost: 96,   url: "notion.so",               loginEmail: "admin@agzos.agency",   icon: "📋", color: "text-foreground", renewalDate: "2026-09-01", usedBy: ["Admin", "Gerente de Conta"] },
  { id: "t9",  name: "Stripe",          description: "Processamento de pagamentos e faturas automatizadas.",              category: "finance",        status: "active",   monthlyCost: 0,    url: "stripe.com",              loginEmail: "financeiro@agzos.agency",icon: "💳",color: "text-violet-400", renewalDate: "", usedBy: ["Financeiro", "Admin"] },
  { id: "t10", name: "Hotjar",          description: "Heatmaps, gravações de sessão e feedback de usuários.",             category: "analytics",      status: "inactive", monthlyCost: 280,  url: "hotjar.com",              loginEmail: "analytics@agzos.agency",icon: "🔥", color: "text-red-400",    renewalDate: "2026-05-31", usedBy: [] },
  { id: "t11", name: "Ahrefs",          description: "Análise de backlinks e oportunidades de SEO off-page.",             category: "seo",            status: "inactive", monthlyCost: 990,  url: "ahrefs.com",              loginEmail: "seo@agzos.agency",     icon: "🌐", color: "text-orange-500", renewalDate: "2026-06-30", usedBy: [] },
  { id: "t12", name: "GitHub",          description: "Versionamento de código e colaboração de desenvolvimento.",          category: "development",    status: "active",   monthlyCost: 72,   url: "github.com",              loginEmail: "dev@agzos.agency",     icon: "🐙", color: "text-foreground", renewalDate: "2026-07-15", usedBy: ["Desenvolvedor"] },
];

let toolSeq = 200;

interface ToolsState {
  tools: Tool[];
  searchQuery: string;
  categoryFilter: ToolCategory | "all";

  addTool: (input: NewToolInput) => void;
  toggleStatus: (id: string) => void;
  setSearch: (q: string) => void;
  setCategoryFilter: (c: ToolCategory | "all") => void;

  getFiltered: () => Tool[];
  getTotalActiveCost: () => number;
  getTotalInactiveCost: () => number;
}

export const useToolsStore = create<ToolsState>()(
  persist(
    (set, get) => ({
      tools: MOCK_TOOLS,
      searchQuery: "",
      categoryFilter: "all",

      addTool: (input) => {
        const tool: Tool = {
          ...input,
          id: `t${++toolSeq}`,
          status: "active",
          icon: "🔧",
          color: "text-muted-foreground",
          renewalDate: "",
          usedBy: [],
        };
        set((s) => ({ tools: [tool, ...s.tools] }));
      },

      toggleStatus: (id) =>
        set((s) => ({
          tools: s.tools.map((t) =>
            t.id === id
              ? { ...t, status: t.status === "active" ? "inactive" : "active" }
              : t
          ),
        })),

      setSearch: (q) => set({ searchQuery: q }),
      setCategoryFilter: (c) => set({ categoryFilter: c }),

      getFiltered: () => {
        const { tools, searchQuery, categoryFilter } = get();
        return tools.filter((t) => {
          const matchCat = categoryFilter === "all" || t.category === categoryFilter;
          const q = searchQuery.toLowerCase();
          const matchSearch = !q || t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q);
          return matchCat && matchSearch;
        });
      },

      getTotalActiveCost: () =>
        get().tools.filter((t) => t.status === "active").reduce((a, t) => a + t.monthlyCost, 0),

      getTotalInactiveCost: () =>
        get().tools.filter((t) => t.status === "inactive").reduce((a, t) => a + t.monthlyCost, 0),
    }),
    { name: "agzos-tools", partialize: (s) => ({ tools: s.tools }) }
  )
);

export const CATEGORY_LABELS: Record<ToolCategory | "all", string> = {
  all: "Todos",
  advertising: "Anúncios",
  analytics: "Analytics",
  design: "Design",
  development: "Dev",
  communication: "Comunicação",
  finance: "Financeiro",
  crm: "CRM",
  seo: "SEO",
  other: "Outros",
};
