import { create } from "zustand";
import { persist } from "zustand/middleware";

// ─── Types ────────────────────────────────────────────────────────────────────

export type NotificationType =
  | "overdue_task"
  | "new_lead"
  | "invoice_paid"
  | "mention"
  | "deploy_done"
  | "task_completed"
  | "project_created"
  | "site_added"
  | "team_invited";

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  href?: string;
  read: boolean;
  createdAt: string;
  apiId?: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

let _seq = 100;
function uid() {
  return `notif-${Date.now()}-${++_seq}`;
}

export const NOTIF_META: Record<
  NotificationType,
  { label: string; color: string; emoji: string }
> = {
  overdue_task:    { label: "Tarefa Atrasada",    color: "text-red-400",     emoji: "⚠️" },
  new_lead:        { label: "Novo Lead",           color: "text-emerald-400", emoji: "🙋" },
  invoice_paid:    { label: "Fatura Paga",         color: "text-purple-400",  emoji: "💸" },
  mention:         { label: "Menção",              color: "text-blue-400",    emoji: "💬" },
  deploy_done:     { label: "Deploy Concluído",    color: "text-yellow-400",  emoji: "🚀" },
  task_completed:  { label: "Tarefa Concluída",    color: "text-teal-400",    emoji: "✅" },
  project_created: { label: "Projeto Criado",      color: "text-violet-400",  emoji: "📁" },
  site_added:      { label: "Site Adicionado",     color: "text-cyan-400",    emoji: "🌐" },
  team_invited:    { label: "Membro Convidado",    color: "text-orange-400",  emoji: "👤" },
};

// ─── API type → NotificationType + title ──────────────────────────────────────

interface ApiActivity {
  id: number;
  type: string;
  description: string;
  entityName: string | null;
  createdAt: string;
}

function apiActivityToNotif(a: ApiActivity): Omit<AppNotification, "read"> {
  const typeMap: Record<string, { type: NotificationType; title: string; href: string }> = {
    invoice_paid:    { type: "invoice_paid",    title: "Fatura paga",         href: "/financial" },
    client_added:    { type: "new_lead",         title: "Novo cliente",         href: "/clients" },
    task_completed:  { type: "task_completed",   title: "Tarefa concluída",     href: "/projects" },
    project_created: { type: "project_created",  title: "Novo projeto criado",  href: "/projects" },
    site_added:      { type: "site_added",       title: "Novo site adicionado", href: "/sites" },
    team_invited:    { type: "team_invited",     title: "Membro convidado",     href: "/team" },
  };
  const meta = typeMap[a.type] ?? { type: "mention" as NotificationType, title: "Evento", href: "/" };
  return {
    id: `api-${a.id}`,
    apiId: a.id,
    type: meta.type,
    title: meta.title,
    body: a.description,
    href: meta.href,
    createdAt: a.createdAt,
  };
}

// ─── Initial mock notifications (shown until real data loads) ─────────────────

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
];

// ─── Realtime simulation pool ─────────────────────────────────────────────────

const REALTIME_POOL: Omit<AppNotification, "id" | "read" | "createdAt">[] = [
  { type: "overdue_task", title: "Tarefa atrasada",   body: "\"Dashboard de analytics\" ultrapassou o prazo de entrega.", href: "/projects" },
  { type: "new_lead",     title: "Novo lead no CRM",  body: "HealthTech Brasil preencheu o formulário de orçamento.", href: "/clients" },
  { type: "invoice_paid", title: "Fatura paga",       body: "Fatura #INV-0050 de R$ 7.500 foi confirmada por StartupXYZ.", href: "/financial" },
  { type: "mention",      title: "Você foi mencionado", body: "Ana Ribeiro: \"@você pode dar uma olhada no arquivo de design?\"", href: "/projects" },
  { type: "deploy_done",  title: "Deploy concluído",  body: "Site \"Blog HealthTech\" publicado com sucesso na Netlify.", href: "/sites" },
];

// ─── Store ────────────────────────────────────────────────────────────────────

interface NotificationsState {
  notifications: AppNotification[];
  seenApiIds: number[];
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
  syncFromApi: () => Promise<void>;
}

export const useNotificationsStore = create<NotificationsState>()(
  persist(
    (set, get) => ({
      notifications: INITIAL,
      seenApiIds: [],
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
      },

      syncFromApi: async () => {
        try {
          const res = await fetch("/api/mobile/notifications?limit=50");
          if (!res.ok) return;
          const items: ApiActivity[] = await res.json();

          const { seenApiIds, notifications } = get();
          const seenSet = new Set(seenApiIds);

          const newNotifs: AppNotification[] = [];
          const newSeenIds: number[] = [];

          for (const item of items) {
            if (seenSet.has(item.id)) continue;
            newSeenIds.push(item.id);
            const notif: AppNotification = {
              ...apiActivityToNotif(item),
              read: true,
            };
            newNotifs.push(notif);
          }

          if (newNotifs.length === 0) return;

          // Remove existing mock notifications with apiId to avoid duplicates
          const existingApiIds = new Set(newNotifs.map((n) => n.apiId));
          const filtered = notifications.filter(
            (n) => !n.apiId || !existingApiIds.has(n.apiId)
          );

          // Mark the most recent one unread so it shows as a new notification
          if (newNotifs.length > 0) {
            newNotifs[0].read = false;
          }

          set({
            notifications: [...newNotifs, ...filtered].slice(0, 60),
            seenApiIds: [...seenApiIds, ...newSeenIds],
          });
        } catch {
          // silently fail — real-time sync is best-effort
        }
      },
    }),
    {
      name: "agzos-notifications-v2",
      partialize: (s) => ({
        notifications: s.notifications,
        seenApiIds: s.seenApiIds,
        pushEnabled: s.pushEnabled,
      }),
    }
  )
);

// ─── Selectors ────────────────────────────────────────────────────────────────

export const selectUnreadCount = (s: NotificationsState) =>
  s.notifications.filter((n) => !n.read).length;
