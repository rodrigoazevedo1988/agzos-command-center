import { create } from "zustand";
import { persist } from "zustand/middleware";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ApiKey {
  id: string;
  service: string;
  label: string;
  key: string;
  status: "connected" | "error" | "pending";
  lastChecked: string;
  icon: string;
}

export interface Integration {
  id: string;
  name: string;
  description: string;
  category: "analytics" | "ads" | "crm" | "communication" | "storage" | "payment";
  enabled: boolean;
  icon: string;
  color: string;
  webhookUrl?: string;
}

export interface BrandingSettings {
  agencyName: string;
  tagline: string;
  website: string;
  primaryColor: string;
  logoUrl: string;
  supportEmail: string;
  timezone: string;
  currency: string;
  language: string;
}

export interface NotificationSettings {
  emailDigest: "daily" | "weekly" | "none";
  overdueAlerts: boolean;
  newLeadAlerts: boolean;
  invoicePaidAlerts: boolean;
  deployAlerts: boolean;
  mentionAlerts: boolean;
}

// ─── Initial data ─────────────────────────────────────────────────────────────

const INITIAL_API_KEYS: ApiKey[] = [
  {
    id: "ga4",
    service: "Google Analytics 4",
    label: "GA4 Measurement ID",
    key: "G-XXXXXXXXXX",
    status: "connected",
    lastChecked: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    icon: "📊",
  },
  {
    id: "meta",
    service: "Meta Business",
    label: "Meta API Access Token",
    key: "EAAxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    status: "connected",
    lastChecked: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    icon: "📘",
  },
  {
    id: "semrush",
    service: "SEMrush",
    label: "API Key",
    key: "semrush_xxxxxxxxxxxxxxxxxxxxxxxx",
    status: "error",
    lastChecked: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    icon: "🔍",
  },
  {
    id: "linkedin",
    service: "LinkedIn Marketing",
    label: "Client Secret",
    key: "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    status: "pending",
    lastChecked: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    icon: "💼",
  },
  {
    id: "openai",
    service: "OpenAI",
    label: "API Key",
    key: "sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    status: "connected",
    lastChecked: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
    icon: "🤖",
  },
  {
    id: "stripe",
    service: "Stripe",
    label: "Secret Key",
    key: "sk_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    status: "connected",
    lastChecked: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    icon: "💳",
  },
];

const INITIAL_INTEGRATIONS: Integration[] = [
  {
    id: "google-analytics",
    name: "Google Analytics 4",
    description: "Métricas de tráfego e comportamento de usuários em todos os sites.",
    category: "analytics",
    enabled: true,
    icon: "📊",
    color: "text-orange-400",
  },
  {
    id: "meta-ads",
    name: "Meta Ads",
    description: "Gestão de campanhas no Facebook e Instagram Ads.",
    category: "ads",
    enabled: true,
    icon: "📘",
    color: "text-blue-400",
  },
  {
    id: "google-ads",
    name: "Google Ads",
    description: "Campanha de pesquisa, display e YouTube integradas.",
    category: "ads",
    enabled: true,
    icon: "🎯",
    color: "text-green-400",
  },
  {
    id: "hubspot",
    name: "HubSpot CRM",
    description: "Sincronização de leads e pipeline de vendas.",
    category: "crm",
    enabled: false,
    icon: "🔶",
    color: "text-orange-500",
  },
  {
    id: "slack",
    name: "Slack",
    description: "Notificações e alertas enviados diretamente para canais do Slack.",
    category: "communication",
    enabled: true,
    icon: "💬",
    color: "text-purple-400",
    webhookUrl: "https://hooks.slack.com/services/TXXXXXXXX/BXXXXXXXX/xxxxxxxx",
  },
  {
    id: "notion",
    name: "Notion",
    description: "Sincroniza tarefas e documentação com workspaces do Notion.",
    category: "storage",
    enabled: false,
    icon: "📋",
    color: "text-foreground",
  },
  {
    id: "stripe",
    name: "Stripe",
    description: "Cobranças, assinaturas e recibos automáticos para clientes.",
    category: "payment",
    enabled: true,
    icon: "💳",
    color: "text-indigo-400",
  },
  {
    id: "semrush",
    name: "SEMrush",
    description: "Relatórios de SEO, rankings de palavras-chave e auditorias.",
    category: "analytics",
    enabled: false,
    icon: "🔍",
    color: "text-yellow-400",
  },
];

const INITIAL_BRANDING: BrandingSettings = {
  agencyName: "Agzos Agency",
  tagline: "Performance & Growth",
  website: "https://agzos.agency",
  primaryColor: "#D10A11",
  logoUrl: "",
  supportEmail: "suporte@agzos.agency",
  timezone: "America/Sao_Paulo",
  currency: "BRL",
  language: "pt-BR",
};

const INITIAL_NOTIFICATION_SETTINGS: NotificationSettings = {
  emailDigest: "daily",
  overdueAlerts: true,
  newLeadAlerts: true,
  invoicePaidAlerts: true,
  deployAlerts: true,
  mentionAlerts: true,
};

// ─── Store ────────────────────────────────────────────────────────────────────

interface SettingsState {
  apiKeys: ApiKey[];
  integrations: Integration[];
  branding: BrandingSettings;
  notificationSettings: NotificationSettings;
  saved: boolean;

  updateApiKey: (id: string, key: string) => void;
  toggleIntegration: (id: string) => void;
  updateIntegrationWebhook: (id: string, url: string) => void;
  updateBranding: (patch: Partial<BrandingSettings>) => void;
  updateNotificationSettings: (patch: Partial<NotificationSettings>) => void;
  markSaved: () => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      apiKeys: INITIAL_API_KEYS,
      integrations: INITIAL_INTEGRATIONS,
      branding: INITIAL_BRANDING,
      notificationSettings: INITIAL_NOTIFICATION_SETTINGS,
      saved: false,

      updateApiKey: (id, key) =>
        set((s) => ({
          apiKeys: s.apiKeys.map((k) =>
            k.id === id ? { ...k, key, status: "pending" as const } : k
          ),
        })),

      toggleIntegration: (id) =>
        set((s) => ({
          integrations: s.integrations.map((i) =>
            i.id === id ? { ...i, enabled: !i.enabled } : i
          ),
        })),

      updateIntegrationWebhook: (id, url) =>
        set((s) => ({
          integrations: s.integrations.map((i) =>
            i.id === id ? { ...i, webhookUrl: url } : i
          ),
        })),

      updateBranding: (patch) =>
        set((s) => ({ branding: { ...s.branding, ...patch }, saved: false })),

      updateNotificationSettings: (patch) =>
        set((s) => ({
          notificationSettings: { ...s.notificationSettings, ...patch },
        })),

      markSaved: () => set({ saved: true }),
    }),
    {
      name: "agzos-settings",
    }
  )
);
