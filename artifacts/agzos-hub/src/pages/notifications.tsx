import { useState } from "react";
import { useLocation } from "wouter";
import {
  Bell, BellRing, CheckCheck, Trash2, Filter, X, ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  useNotificationsStore,
  selectUnreadCount,
  NOTIF_META,
  NotificationType,
  AppNotification,
} from "@/store/useNotificationsStore";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function timeAgo(iso: string): string {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return "agora";
  if (diff < 3600) return `${Math.floor(diff / 60)} min atrás`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h atrás`;
  const d = Math.floor(diff / 86400);
  return d === 1 ? "ontem" : `${d} dias atrás`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

// ─── Filter options ───────────────────────────────────────────────────────────

type ReadFilter = "all" | "unread" | "read";

const TYPE_FILTERS: { value: NotificationType | "all"; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "overdue_task", label: "Tarefas" },
  { value: "new_lead", label: "Leads" },
  { value: "invoice_paid", label: "Faturas" },
  { value: "mention", label: "Menções" },
  { value: "deploy_done", label: "Deploys" },
];

// ─── Row component ────────────────────────────────────────────────────────────

function NotifCard({
  n,
  onRead,
  onDelete,
  onNavigate,
}: {
  n: AppNotification;
  onRead: (id: string) => void;
  onDelete: (id: string) => void;
  onNavigate: (href: string) => void;
}) {
  const meta = NOTIF_META[n.type];

  return (
    <div
      className={`group relative flex gap-4 px-5 py-4 cursor-pointer transition-colors hover:bg-accent/20 rounded-lg border ${
        !n.read
          ? "border-primary/20 bg-primary/5"
          : "border-border/40 bg-card"
      }`}
      onClick={() => {
        onRead(n.id);
        if (n.href) onNavigate(n.href);
      }}
    >
      {/* Unread dot */}
      {!n.read && (
        <span className="absolute right-4 top-4 w-2 h-2 rounded-full bg-primary" />
      )}

      {/* Emoji */}
      <div className="text-2xl shrink-0 select-none mt-0.5">{meta.emoji}</div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <span className={`text-sm font-semibold ${meta.color}`}>{n.title}</span>
          <Badge
            variant="outline"
            className={`text-[10px] px-1.5 py-0 h-4 border-current/30 ${meta.color}`}
          >
            {meta.label}
          </Badge>
        </div>
        <p className="text-sm text-foreground/80 leading-relaxed">{n.body}</p>
        <p className="text-xs text-muted-foreground mt-1.5">{formatDate(n.createdAt)}</p>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
        {!n.read && (
          <button
            title="Marcar como lida"
            className="p-1 rounded text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
            onClick={(e) => { e.stopPropagation(); onRead(n.id); }}
          >
            <CheckCheck className="w-4 h-4" />
          </button>
        )}
        <button
          title="Remover"
          className="p-1 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
          onClick={(e) => { e.stopPropagation(); onDelete(n.id); }}
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// ─── Push permission banner ───────────────────────────────────────────────────

function PushBanner() {
  const pushEnabled = useNotificationsStore((s) => s.pushEnabled);
  const setPushEnabled = useNotificationsStore((s) => s.setPushEnabled);
  const [dismissed, setDismissed] = useState(false);

  const supported = "Notification" in window;
  const alreadyGranted = supported && Notification.permission === "granted";

  if (pushEnabled || dismissed || !supported) return null;

  async function enable() {
    const perm = await Notification.requestPermission();
    if (perm === "granted") {
      setPushEnabled(true);
      new Notification("Agzos Hub", {
        body: "Notificações push ativadas com sucesso!",
        icon: "/favicon.ico",
      });
    }
  }

  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-primary/30 bg-primary/5 px-4 py-3 mb-6">
      <div className="flex items-center gap-3">
        <BellRing className="w-5 h-5 text-primary shrink-0" />
        <div>
          <p className="text-sm font-medium text-primary">
            {alreadyGranted ? "Push notifications disponíveis" : "Ative notificações push"}
          </p>
          <p className="text-xs text-muted-foreground">
            {alreadyGranted
              ? "Permissão já concedida — ative a opção abaixo."
              : "Receba alertas no browser mesmo com a aba em segundo plano."}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <Button size="sm" className="h-7 text-xs" onClick={enable}>
          Ativar
        </Button>
        <button onClick={() => setDismissed(true)}>
          <X className="w-4 h-4 text-muted-foreground hover:text-foreground" />
        </button>
      </div>
    </div>
  );
}

// ─── Settings card ────────────────────────────────────────────────────────────

function SettingsCard() {
  const pushEnabled = useNotificationsStore((s) => s.pushEnabled);
  const setPushEnabled = useNotificationsStore((s) => s.setPushEnabled);
  const simulationActive = useNotificationsStore((s) => s.simulationActive);
  const setSimulationActive = useNotificationsStore((s) => s.setSimulationActive);
  const injectRealtime = useNotificationsStore((s) => s.injectRealtime);

  async function handlePushToggle(enabled: boolean) {
    if (enabled) {
      if (!("Notification" in window)) return;
      const perm = await Notification.requestPermission();
      if (perm !== "granted") return;
    }
    setPushEnabled(enabled);
  }

  return (
    <div className="rounded-lg border border-border/50 bg-card divide-y divide-border/40 overflow-hidden">
      <div className="px-4 py-3">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Configurações</p>
      </div>

      <div className="px-4 py-3 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium">Push no browser</p>
          <p className="text-xs text-muted-foreground">Receba alertas em segundo plano</p>
        </div>
        <Switch checked={pushEnabled} onCheckedChange={handlePushToggle} />
      </div>

      <div className="px-4 py-3 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium">Simular tempo real</p>
          <p className="text-xs text-muted-foreground">Injeta notificações a cada 15 segundos</p>
        </div>
        <Switch checked={simulationActive} onCheckedChange={setSimulationActive} />
      </div>

      <div className="px-4 py-3">
        <Button
          size="sm"
          variant="outline"
          className="text-xs border-border/50 w-full"
          onClick={() => injectRealtime()}
        >
          Simular 1 notificação agora
        </Button>
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function NotificationsPage() {
  const [, navigate] = useLocation();
  const notifications = useNotificationsStore((s) => s.notifications);
  const unread = useNotificationsStore(selectUnreadCount);
  const markRead = useNotificationsStore((s) => s.markRead);
  const markAllRead = useNotificationsStore((s) => s.markAllRead);
  const deleteNotification = useNotificationsStore((s) => s.deleteNotification);
  const clearAll = useNotificationsStore((s) => s.clearAll);

  const [readFilter, setReadFilter] = useState<ReadFilter>("all");
  const [typeFilter, setTypeFilter] = useState<NotificationType | "all">("all");

  const filtered = notifications.filter((n) => {
    const matchRead =
      readFilter === "all" ||
      (readFilter === "unread" && !n.read) ||
      (readFilter === "read" && n.read);
    const matchType = typeFilter === "all" || n.type === typeFilter;
    return matchRead && matchType;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1 as any)}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              Notificações
              {unread > 0 && (
                <Badge className="bg-primary text-white text-sm px-2">{unread} novas</Badge>
              )}
            </h1>
            <p className="text-muted-foreground text-sm">{notifications.length} notificações no histórico</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {unread > 0 && (
            <Button variant="outline" size="sm" className="gap-2 border-border/50 text-xs" onClick={markAllRead}>
              <CheckCheck className="w-3.5 h-3.5" /> Marcar todas como lidas
            </Button>
          )}
          {notifications.length > 0 && (
            <Button variant="outline" size="sm" className="gap-2 border-border/50 text-xs text-destructive hover:text-destructive" onClick={clearAll}>
              <Trash2 className="w-3.5 h-3.5" /> Limpar tudo
            </Button>
          )}
        </div>
      </div>

      <PushBanner />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
        {/* Main column */}
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Read filter */}
            <div className="flex rounded-lg border border-border/50 overflow-hidden bg-card">
              {(["all", "unread", "read"] as ReadFilter[]).map((f) => (
                <button
                  key={f}
                  onClick={() => setReadFilter(f)}
                  className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                    readFilter === f
                      ? "bg-primary text-white"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/30"
                  }`}
                >
                  {f === "all" ? "Todos" : f === "unread" ? "Não lidas" : "Lidas"}
                </button>
              ))}
            </div>

            <Separator orientation="vertical" className="h-6 hidden sm:block" />

            {/* Type filter pills */}
            <div className="flex gap-1.5 flex-wrap">
              {TYPE_FILTERS.map((tf) => (
                <button
                  key={tf.value}
                  onClick={() => setTypeFilter(tf.value)}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
                    typeFilter === tf.value
                      ? "bg-primary/20 border-primary/50 text-primary"
                      : "border-border/50 text-muted-foreground hover:border-primary/30 hover:text-foreground"
                  }`}
                >
                  {tf.label}
                </button>
              ))}
            </div>
          </div>

          {/* List */}
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-20 text-muted-foreground">
              <Bell className="w-12 h-12 opacity-20" />
              <p className="text-sm">Nenhuma notificação encontrada</p>
              {(readFilter !== "all" || typeFilter !== "all") && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs"
                  onClick={() => { setReadFilter("all"); setTypeFilter("all"); }}
                >
                  Limpar filtros
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map((n) => (
                <NotifCard
                  key={n.id}
                  n={n}
                  onRead={markRead}
                  onDelete={deleteNotification}
                  onNavigate={(href) => navigate(href)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Settings sidebar */}
        <div className="space-y-4">
          <SettingsCard />

          {/* Stats */}
          <div className="rounded-lg border border-border/50 bg-card divide-y divide-border/40 overflow-hidden">
            <div className="px-4 py-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Resumo</p>
            </div>
            {Object.entries(NOTIF_META).map(([type, meta]) => {
              const count = notifications.filter((n) => n.type === type).length;
              const unreadCount = notifications.filter((n) => n.type === type && !n.read).length;
              return (
                <div key={type} className="px-4 py-2.5 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{meta.emoji}</span>
                    <span className="text-xs text-muted-foreground">{meta.label}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {unreadCount > 0 && (
                      <Badge className="bg-primary/20 text-primary border-primary/30 text-[10px] px-1.5 h-4">
                        {unreadCount}
                      </Badge>
                    )}
                    <span className="text-xs text-muted-foreground">{count} total</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
