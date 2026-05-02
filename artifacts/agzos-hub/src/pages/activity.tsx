import { useState, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import {
  Activity, DollarSign, FolderOpen, Users, Globe,
  CheckSquare, UserPlus, RefreshCw, ArrowLeft, Filter,
  Clock, TrendingUp, AlertCircle, Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ActivityItem {
  id: number;
  type: string;
  description: string;
  entityName: string | null;
  createdAt: string;
}

// ─── Config per event type ────────────────────────────────────────────────────

const TYPE_CONFIG: Record<string, {
  label: string;
  icon: React.ElementType;
  color: string;
  bg: string;
  badge: string;
}> = {
  invoice_paid: {
    label: "Fatura paga",
    icon: DollarSign,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10 border-emerald-500/20",
    badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  },
  project_created: {
    label: "Projeto criado",
    icon: FolderOpen,
    color: "text-violet-400",
    bg: "bg-violet-500/10 border-violet-500/20",
    badge: "bg-violet-500/10 text-violet-400 border-violet-500/20",
  },
  client_added: {
    label: "Cliente adicionado",
    icon: Users,
    color: "text-blue-400",
    bg: "bg-blue-500/10 border-blue-500/20",
    badge: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  },
  site_added: {
    label: "Site adicionado",
    icon: Globe,
    color: "text-cyan-400",
    bg: "bg-cyan-500/10 border-cyan-500/20",
    badge: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  },
  task_completed: {
    label: "Tarefa concluída",
    icon: CheckSquare,
    color: "text-teal-400",
    bg: "bg-teal-500/10 border-teal-500/20",
    badge: "bg-teal-500/10 text-teal-400 border-teal-500/20",
  },
  team_invited: {
    label: "Membro convidado",
    icon: UserPlus,
    color: "text-orange-400",
    bg: "bg-orange-500/10 border-orange-500/20",
    badge: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  },
};

const FALLBACK_CONFIG = {
  label: "Evento",
  icon: Activity,
  color: "text-muted-foreground",
  bg: "bg-muted/30 border-border/50",
  badge: "bg-muted/30 text-muted-foreground border-border/50",
};

function getCfg(type: string) {
  return TYPE_CONFIG[type] ?? FALLBACK_CONFIG;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function timeAgo(iso: string): string {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return "agora";
  if (diff < 3600) return `${Math.floor(diff / 60)}min atrás`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h atrás`;
  const d = Math.floor(diff / 86400);
  return d === 1 ? "ontem" : `${d} dias atrás`;
}

function formatFull(iso: string): string {
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────

function KpiCard({
  icon: Icon, label, value, color,
}: { icon: React.ElementType; label: string; value: number; color: string }) {
  return (
    <Card className="border-border/50 bg-card/60">
      <CardContent className="p-4 flex items-center gap-3">
        <div className={`p-2 rounded-lg ${color} bg-current/10`} style={{ background: "color-mix(in srgb, currentColor 10%, transparent)" }}>
          <Icon className={`w-4 h-4 ${color}`} />
        </div>
        <div>
          <p className="text-xl font-bold">{value}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Timeline Item ────────────────────────────────────────────────────────────

function TimelineItem({ item, isLast }: { item: ActivityItem; isLast: boolean }) {
  const cfg = getCfg(item.type);
  const Icon = cfg.icon;

  return (
    <div className="flex gap-4 group">
      {/* line + dot */}
      <div className="flex flex-col items-center shrink-0">
        <div className={`w-8 h-8 rounded-full border flex items-center justify-center ${cfg.bg} shrink-0`}>
          <Icon className={`w-3.5 h-3.5 ${cfg.color}`} />
        </div>
        {!isLast && (
          <div className="w-px flex-1 mt-1 bg-border/40 min-h-[20px]" />
        )}
      </div>

      {/* content */}
      <div className="pb-5 flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className={`text-[10px] px-1.5 py-0.5 border ${cfg.badge}`}>
              {cfg.label}
            </Badge>
            {item.entityName && (
              <span className="text-sm font-medium text-foreground truncate max-w-[200px]">
                {item.entityName}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0" title={formatFull(item.createdAt)}>
            <Clock className="w-3 h-3" />
            {timeAgo(item.createdAt)}
          </div>
        </div>
        <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
          {item.description}
        </p>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const TYPE_FILTER_OPTIONS = [
  { value: "all", label: "Todos os tipos" },
  { value: "invoice_paid", label: "Faturas pagas" },
  { value: "project_created", label: "Projetos criados" },
  { value: "client_added", label: "Clientes adicionados" },
  { value: "site_added", label: "Sites adicionados" },
  { value: "task_completed", label: "Tarefas concluídas" },
  { value: "team_invited", label: "Membros convidados" },
];

export default function ActivityPage() {
  const [, navigate] = useLocation();
  const [items, setItems] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [typeFilter, setTypeFilter] = useState("all");
  const [limit, setLimit] = useState(50);

  const fetchActivity = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await fetch(`/api/mobile/notifications?limit=${limit}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data: ActivityItem[] = await res.json();
      setItems(data);
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Activity feed error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchActivity();
    const interval = setInterval(() => fetchActivity(true), 30_000);
    return () => clearInterval(interval);
  }, [fetchActivity]);

  const filtered = typeFilter === "all"
    ? items
    : items.filter((i) => i.type === typeFilter);

  // KPI counts
  const counts = items.reduce<Record<string, number>>((acc, i) => {
    acc[i.type] = (acc[i.type] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-6 pb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground"
            onClick={() => navigate("/")}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Feed de Atividade</h1>
            <p className="text-muted-foreground text-sm flex items-center gap-1.5 mt-0.5">
              <Activity className="w-3.5 h-3.5" />
              Histórico unificado de todas as ações do sistema
              {lastUpdated && (
                <span className="text-xs">
                  · atualizado às {lastUpdated.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                </span>
              )}
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 text-xs border-border/50"
          onClick={() => fetchActivity(true)}
          disabled={refreshing}
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
          Atualizar
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {Object.entries(TYPE_CONFIG).map(([type, cfg]) => (
          <button
            key={type}
            onClick={() => setTypeFilter(typeFilter === type ? "all" : type)}
            className={`text-left transition-all rounded-xl border p-3 flex items-center gap-2.5 cursor-pointer
              ${typeFilter === type
                ? `${cfg.bg} ring-2 ring-primary/40`
                : "border-border/50 bg-card/60 hover:bg-card"
              }`}
          >
            <div className={`p-1.5 rounded-lg ${cfg.bg}`}>
              <cfg.icon className={`w-3.5 h-3.5 ${cfg.color}`} />
            </div>
            <div>
              <p className="text-lg font-bold leading-none">{counts[type] ?? 0}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight">{cfg.label}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Filter bar */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Filter className="w-3.5 h-3.5" />
          Filtrar:
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="h-8 w-[200px] text-xs border-border/50">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {TYPE_FILTER_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value} className="text-xs">
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={String(limit)} onValueChange={(v) => setLimit(Number(v))}>
          <SelectTrigger className="h-8 w-[130px] text-xs border-border/50">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="20" className="text-xs">Últimos 20</SelectItem>
            <SelectItem value="50" className="text-xs">Últimos 50</SelectItem>
            <SelectItem value="100" className="text-xs">Últimos 100</SelectItem>
            <SelectItem value="200" className="text-xs">Últimos 200</SelectItem>
          </SelectContent>
        </Select>
        {typeFilter !== "all" && (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 text-xs gap-1.5 text-muted-foreground"
            onClick={() => setTypeFilter("all")}
          >
            Limpar filtro
          </Button>
        )}
        <span className="text-xs text-muted-foreground ml-auto">
          {filtered.length} evento{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Timeline */}
      <Card className="border-border/50 bg-card/60">
        <CardHeader className="pb-3 border-b border-border/50">
          <CardTitle className="text-sm flex items-center gap-2 text-muted-foreground font-medium">
            <TrendingUp className="w-4 h-4" />
            Timeline de eventos
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6 px-6">
          {loading ? (
            <div className="flex items-center justify-center py-16 gap-3 text-muted-foreground">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-sm">Carregando atividade...</span>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
              <AlertCircle className="w-10 h-10 text-muted-foreground/30" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Nenhum evento encontrado</p>
                <p className="text-xs text-muted-foreground/60 mt-1">
                  {typeFilter !== "all" ? "Tente remover o filtro aplicado." : "Ainda não há atividade registrada."}
                </p>
              </div>
            </div>
          ) : (
            <div>
              {filtered.map((item, idx) => (
                <TimelineItem
                  key={item.id}
                  item={item}
                  isLast={idx === filtered.length - 1}
                />
              ))}
              {filtered.length >= limit && (
                <div className="pt-2 flex justify-center">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs border-border/50 gap-2"
                    onClick={() => setLimit((l) => l + 50)}
                  >
                    <RefreshCw className="w-3 h-3" />
                    Carregar mais
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
