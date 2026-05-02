import { useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { Bell, BellRing, Check, CheckCheck, Trash2, Settings2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  useNotificationsStore,
  selectUnreadCount,
  NOTIF_META,
  AppNotification,
} from "@/store/useNotificationsStore";

// ─── Time formatting ──────────────────────────────────────────────────────────

function timeAgo(iso: string): string {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return "agora";
  if (diff < 3600) return `${Math.floor(diff / 60)}min atrás`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h atrás`;
  return `${Math.floor(diff / 86400)}d atrás`;
}

// ─── Single row ───────────────────────────────────────────────────────────────

function NotifRow({
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
      className={`group relative flex gap-3 px-4 py-3 cursor-pointer transition-colors hover:bg-accent/30 ${
        !n.read ? "bg-primary/5" : ""
      }`}
      onClick={() => {
        onRead(n.id);
        if (n.href) onNavigate(n.href);
      }}
    >
      {/* Unread dot */}
      {!n.read && (
        <span className="absolute left-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-primary" />
      )}

      {/* Emoji icon */}
      <div className="mt-0.5 text-lg shrink-0 select-none">{meta.emoji}</div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium leading-snug ${meta.color}`}>{n.title}</p>
        <p className="text-xs text-muted-foreground leading-snug mt-0.5 line-clamp-2">{n.body}</p>
        <p className="text-[10px] text-muted-foreground/60 mt-1">{timeAgo(n.createdAt)}</p>
      </div>

      {/* Actions (appear on hover) */}
      <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
        {!n.read && (
          <button
            title="Marcar como lida"
            className="text-muted-foreground hover:text-primary transition-colors"
            onClick={(e) => { e.stopPropagation(); onRead(n.id); }}
          >
            <Check className="w-3.5 h-3.5" />
          </button>
        )}
        <button
          title="Remover"
          className="text-muted-foreground hover:text-destructive transition-colors"
          onClick={(e) => { e.stopPropagation(); onDelete(n.id); }}
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

// ─── Bell Dropdown ────────────────────────────────────────────────────────────

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const [, navigate] = useLocation();

  const notifications = useNotificationsStore((s) => s.notifications);
  const unread = useNotificationsStore(selectUnreadCount);
  const markRead = useNotificationsStore((s) => s.markRead);
  const markAllRead = useNotificationsStore((s) => s.markAllRead);
  const deleteNotification = useNotificationsStore((s) => s.deleteNotification);
  const clearAll = useNotificationsStore((s) => s.clearAll);
  const pushEnabled = useNotificationsStore((s) => s.pushEnabled);
  const setPushEnabled = useNotificationsStore((s) => s.setPushEnabled);
  const simulationActive = useNotificationsStore((s) => s.simulationActive);
  const setSimulationActive = useNotificationsStore((s) => s.setSimulationActive);
  const injectRealtime = useNotificationsStore((s) => s.injectRealtime);
  const syncFromApi = useNotificationsStore((s) => s.syncFromApi);

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Sync real activity from API on mount + every 60s
  useEffect(() => {
    syncFromApi();
    const t = setInterval(() => syncFromApi(), 60_000);
    return () => clearInterval(t);
  }, [syncFromApi]);

  // Real-time simulation
  useEffect(() => {
    if (!simulationActive) return;
    const t = setInterval(() => injectRealtime(), 15000);
    return () => clearInterval(t);
  }, [simulationActive, injectRealtime]);

  async function handlePushToggle(enabled: boolean) {
    if (enabled) {
      if (!("Notification" in window)) return;
      const perm = await Notification.requestPermission();
      if (perm !== "granted") return;
    }
    setPushEnabled(enabled);
  }

  const recent = notifications.slice(0, 8);

  return (
    <div className="relative" ref={ref}>
      {/* Trigger */}
      <Button
        variant="ghost"
        size="icon"
        className="relative"
        onClick={() => setOpen((o) => !o)}
        aria-label="Notificações"
      >
        {unread > 0 ? (
          <BellRing className="h-5 w-5 text-primary animate-[ring_1s_ease-in-out]" />
        ) : (
          <Bell className="h-5 w-5" />
        )}
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-primary text-[10px] font-bold text-white flex items-center justify-center leading-none">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </Button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-12 w-80 z-50 rounded-xl border border-border/60 bg-card shadow-2xl shadow-black/40 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-primary" />
              <span className="font-semibold text-sm">Notificações</span>
              {unread > 0 && (
                <Badge className="bg-primary/20 text-primary border-primary/30 text-[10px] px-1.5 py-0 h-4">
                  {unread}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-1">
              {unread > 0 && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  title="Marcar todas como lidas"
                  onClick={markAllRead}
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                className={`h-6 w-6 ${showSettings ? "text-primary" : ""}`}
                title="Configurações"
                onClick={() => setShowSettings((s) => !s)}
              >
                <Settings2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>

          {/* Settings panel */}
          {showSettings && (
            <div className="px-4 py-3 border-b border-border/50 bg-accent/10 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium">Push no browser</p>
                  <p className="text-[10px] text-muted-foreground">Requer permissão do navegador</p>
                </div>
                <Switch
                  checked={pushEnabled}
                  onCheckedChange={handlePushToggle}
                  className="scale-75"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium">Simular tempo real</p>
                  <p className="text-[10px] text-muted-foreground">Gera notificações a cada 15s</p>
                </div>
                <Switch
                  checked={simulationActive}
                  onCheckedChange={setSimulationActive}
                  className="scale-75"
                />
              </div>
            </div>
          )}

          {/* List */}
          <ScrollArea className="max-h-72">
            {recent.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-10 text-muted-foreground">
                <Bell className="w-8 h-8 opacity-30" />
                <p className="text-sm">Sem notificações</p>
              </div>
            ) : (
              <div className="divide-y divide-border/30">
                {recent.map((n) => (
                  <NotifRow
                    key={n.id}
                    n={n}
                    onRead={markRead}
                    onDelete={deleteNotification}
                    onNavigate={(href) => { setOpen(false); navigate(href); }}
                  />
                ))}
              </div>
            )}
          </ScrollArea>

          {/* Footer */}
          <div className="border-t border-border/50 px-4 py-2 flex items-center justify-between">
            <button
              className="text-xs text-primary hover:underline font-medium"
              onClick={() => { setOpen(false); navigate("/notifications"); }}
            >
              Ver todas ({notifications.length})
            </button>
            {notifications.length > 0 && (
              <button
                className="text-xs text-muted-foreground hover:text-destructive transition-colors flex items-center gap-1"
                onClick={clearAll}
              >
                <Trash2 className="w-3 h-3" />
                Limpar tudo
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
