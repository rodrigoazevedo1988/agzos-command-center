import { create } from "zustand";
import { persist } from "zustand/middleware";

// ─── Types ────────────────────────────────────────────────────────────────────

export type NotificationType =
  | "overdue_task"
  | "new_lead"
  | "invoice_paid"
  | "mention"
  | "deploy_done";

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  href?: string;
  read: boolean;
  createdAt: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

let _seq = 100;
function uid() {
  return `notif-${Date.now()}-${++_seq}`;
}

export const NOTIF_META: Record<
  NotificationType,
  { label: string; color: string; emoji: string }
> = {
  overdue_task: { label: "Tarefa Atrasada", color: "text-red-400", emoji: "⚠️" },
  new_lead:     { label: "Novo Lead",        color: "text-emerald-400", emoji: "🙋" },
  invoice_paid: { label: "Fatura Paga",      color: "text-purple-400", emoji: "💸" },
  mention:      { label: "Menção",           color: "text-blue-400", emoji: "💬" },
  deploy_done:  { label: "Deploy Concluído", color: "text-yellow-400", emoji: "🚀" },
};

const INITIAL: AppNotification[] = [
  {
    id: uid(),
    type: "overdue_task",
    title: "Tarefa atrasada",
    body: "\"Integração CMS\" está 2 dias atrasada no projeto Website Agzos.",
    href: "/projects",
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 14).toISOString(),
  },
  {
    id: uid(),
    type: "new_lead",
    title: "Novo lead no CRM",
    body: "TechStart Ltda entrou em contato pelo formulário do site.",
    href: "/clients",
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 37).toISOString(),
  },
  {
    id: uid(),
    type: "invoice_paid",
    title: "Fatura paga",
    body: "Fatura #INV-0042 de R$ 4.800 foi confirmada pelo cliente Nexus Corp.",
    href: "/financial",
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 65).toISOString(),
  },
  {
    id: uid(),
    type: "mention",
    title: "Você foi mencionado",
    body: "Lucas Ferreira: \"@você pode revisar o copy da landing page?\"",
    href: "/projects",
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 130).toISOString(),
  },
  {
    id: uid(),
    type: "deploy_done",
    title: "Deploy concluído",
    body: "Projeto \"E-commerce Moda Urbana\" foi publicado com sucesso na Vercel.",
    href: "/sites",
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 210).toISOString(),
  },
  {
    id: uid(),
    type: "overdue_task",
    title: "Tarefa atrasada",
    body: "\"Criação dos criativos Meta Ads\" está 3 dias atrasada.",
    href: "/projects",
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
  },
  {
    id: uid(),
    type: "new_lead",
    title: "Novo lead no CRM",
    body: "FoodBrand Co enviou mensagem pelo WhatsApp integrado.",
    href: "/clients",
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
  },
  {
    id: uid(),
    type: "invoice_paid",
    title: "Fatura paga",
    body: "Fatura #INV-0039 de R$ 2.200 foi paga por FoodBrand Co.",
    href: "/financial",
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
  },
];

// ─── Realtime simulation templates ───────────────────────────────────────────

const REALTIME_POOL: Omit<AppNotification, "id" | "read" | "createdAt">[] = [
  {
    type: "overdue_task",
    title: "Tarefa atrasada",
    body: "\"Dashboard de analytics\" ultrapassou o prazo de entrega.",
    href: "/projects",
  },
  {
    type: "new_lead",
    title: "Novo lead no CRM",
    body: "HealthTech Brasil preencheu o formulário de orçamento.",
    href: "/clients",
  },
  {
    type: "invoice_paid",
    title: "Fatura paga",
    body: "Fatura #INV-0050 de R$ 7.500 foi confirmada por StartupXYZ.",
    href: "/financial",
  },
  {
    type: "mention",
    title: "Você foi mencionado",
    body: "Ana Ribeiro: \"@você pode dar uma olhada no arquivo de design?\"",
    href: "/projects",
  },
  {
    type: "deploy_done",
    title: "Deploy concluído",
    body: "Site \"Blog HealthTech\" publicado com sucesso na Netlify.",
    href: "/sites",
  },
];

// ─── Store ────────────────────────────────────────────────────────────────────

interface NotificationsState {
  notifications: AppNotification[];
  pushEnabled: boolean;
  simulationActive: boolean;

  addNotification: (n: Omit<AppNotification, "id" | "read" | "createdAt">) => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
  deleteNotification: (id: string) => void;
  clearAll: () => void;
  setPushEnabled: (v: boolean) => void;
  setSimulationActive: (v: boolean) => void;
  injectRealtime: () => void;
}

export const useNotificationsStore = create<NotificationsState>()(
  persist(
    (set, get) => ({
      notifications: INITIAL,
      pushEnabled: false,
      simulationActive: false,

      addNotification: (n) => {
        const notif: AppNotification = {
          ...n,
          id: uid(),
          read: false,
          createdAt: new Date().toISOString(),
        };
        set((s) => ({ notifications: [notif, ...s.notifications] }));
        return notif;
      },

      markRead: (id) =>
        set((s) => ({
          notifications: s.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
          ),
        })),

      markAllRead: () =>
        set((s) => ({
          notifications: s.notifications.map((n) => ({ ...n, read: true })),
        })),

      deleteNotification: (id) =>
        set((s) => ({
          notifications: s.notifications.filter((n) => n.id !== id),
        })),

      clearAll: () => set({ notifications: [] }),

      setPushEnabled: (v) => set({ pushEnabled: v }),
      setSimulationActive: (v) => set({ simulationActive: v }),

      injectRealtime: () => {
        const pool = REALTIME_POOL;
        const template = pool[Math.floor(Math.random() * pool.length)];
        const notif: AppNotification = {
          ...template,
          id: uid(),
          read: false,
          createdAt: new Date().toISOString(),
        };
        set((s) => ({ notifications: [notif, ...s.notifications] }));

        if (get().pushEnabled && "Notification" in window && Notification.permission === "granted") {
          new Notification(notif.title, {
            body: notif.body,
            icon: "/favicon.ico",
            tag: notif.id,
          });
        }

        return notif;
      },
    }),
    {
      name: "agzos-notifications",
      partialize: (s) => ({
        notifications: s.notifications,
        pushEnabled: s.pushEnabled,
      }),
    }
  )
);

// ─── Unread count selector ────────────────────────────────────────────────────

export const selectUnreadCount = (s: NotificationsState) =>
  s.notifications.filter((n) => !n.read).length;
