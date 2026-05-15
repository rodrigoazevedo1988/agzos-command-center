import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus, MoreHorizontal, Search, Building2, Mail, Phone,
  TrendingUp, Users, DollarSign, ArrowRight, MessageSquare,
  Send, LayoutGrid, List, ChevronRight, Star, Globe, Tag,
} from "lucide-react";
import { PermissionGuard } from "@/components/PermissionGuard";
import { useAuthStore } from "@/store/useAuthStore";
import {
  useClientsStore, Client, ClientStage, STAGE_ORDER, NewClientInput,
} from "@/store/useClientsStore";

const STAGE_LABELS: Record<ClientStage, string> = {
  lead:     "Lead",
  proposal: "Proposta",
  contract: "Contrato",
  active:   "Ativo",
  churned:  "Cancelado",
};

const STAGE_COLORS: Record<ClientStage, string> = {
  lead:     "bg-blue-500/10 text-blue-400 border-blue-500/20",
  proposal: "bg-violet-500/10 text-violet-400 border-violet-500/20",
  contract: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  active:   "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  churned:  "bg-muted text-muted-foreground border-border",
};

const STAGE_BAR: Record<ClientStage, string> = {
  lead:     "bg-blue-500",
  proposal: "bg-violet-500",
  contract: "bg-amber-500",
  active:   "bg-emerald-500",
  churned:  "bg-muted-foreground/30",
};

const INDUSTRIES = [
  "Tecnologia", "SaaS", "E-commerce", "Saúde", "Educação",
  "Alimentação", "Moda & Varejo", "Financeiro", "Logística",
  "Imóveis", "Manufatura", "Entretenimento", "Outros",
];

const SOURCES = [
  "Indicação", "Google Ads", "LinkedIn", "Instagram", "Facebook",
  "Evento", "Cold outreach", "Parceiro", "Orgânico", "Outros",
];

// ── Add Client Dialog ─────────────────────────────────────────────────────────
function AddClientDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { addClient } = useClientsStore();
  const { user: currentUser } = useAuthStore();
  const [form, setForm] = useState<NewClientInput>({
    name: "", companyName: "", email: "", phone: "",
    stage: "lead", monthlyValue: 0, industry: "",
    website: "", source: "Indicação", assignedTo: currentUser?.name ?? "Admin",
  });
  const set = (k: keyof NewClientInput, v: string | number | ClientStage) =>
    setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = () => {
    if (!form.name || !form.email) return;
    addClient(form);
    onClose();
    setForm({ name: "", companyName: "", email: "", phone: "", stage: "lead", monthlyValue: 0, industry: "", website: "", source: "Indicação", assignedTo: currentUser?.name ?? "Admin" });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[560px] bg-card border-border/50">
        <DialogHeader>
          <DialogTitle className="text-xl">Novo Cliente</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 py-2">
          <div className="flex flex-col gap-1.5 col-span-2">
            <Label>Nome completo *</Label>
            <Input placeholder="João Silva" value={form.name} onChange={(e) => set("name", e.target.value)} className="bg-muted/20 border-border/50" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Empresa</Label>
            <Input placeholder="Acme Corp" value={form.companyName} onChange={(e) => set("companyName", e.target.value)} className="bg-muted/20 border-border/50" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Setor</Label>
            <Select value={form.industry} onValueChange={(v) => set("industry", v)}>
              <SelectTrigger className="bg-muted/20 border-border/50">
                <SelectValue placeholder="Selecionar..." />
              </SelectTrigger>
              <SelectContent>
                {INDUSTRIES.map((i) => <SelectItem key={i} value={i}>{i}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>E-mail *</Label>
            <Input type="email" placeholder="joao@empresa.com" value={form.email} onChange={(e) => set("email", e.target.value)} className="bg-muted/20 border-border/50" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Telefone</Label>
            <Input placeholder="(11) 99999-9999" value={form.phone} onChange={(e) => set("phone", e.target.value)} className="bg-muted/20 border-border/50" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Estágio no funil</Label>
            <Select value={form.stage} onValueChange={(v) => set("stage", v as ClientStage)}>
              <SelectTrigger className="bg-muted/20 border-border/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STAGE_ORDER.map((s) => (
                  <SelectItem key={s} value={s}>{STAGE_LABELS[s]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Valor mensal (R$)</Label>
            <Input type="number" placeholder="0" value={form.monthlyValue || ""} onChange={(e) => set("monthlyValue", Number(e.target.value))} className="bg-muted/20 border-border/50" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Website</Label>
            <Input placeholder="empresa.com.br" value={form.website} onChange={(e) => set("website", e.target.value)} className="bg-muted/20 border-border/50" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Origem</Label>
            <Select value={form.source} onValueChange={(v) => set("source", v)}>
              <SelectTrigger className="bg-muted/20 border-border/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SOURCES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="border-border/50">Cancelar</Button>
          <Button onClick={handleSubmit} disabled={!form.name || !form.email} className="gap-2">
            <Plus className="w-4 h-4" /> Adicionar Cliente
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Client Detail Dialog ──────────────────────────────────────────────────────
function ClientDetailDialog({ client, onClose }: { client: Client; onClose: () => void }) {
  const { addNote, moveClient } = useClientsStore();
  const { user: currentUser } = useAuthStore();
  const [note, setNote] = useState("");
  const [activeTab, setActiveTab] = useState<"overview" | "notes" | "activity">("overview");

  const handleAddNote = () => {
    if (!note.trim()) return;
    addNote(client.id, note.trim(), currentUser?.name ?? "Admin");
    setNote("");
  };

  const daysSince = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime();
    const d = Math.floor(diff / 86400000);
    if (d === 0) return "hoje";
    if (d === 1) return "ontem";
    return `${d} dias atrás`;
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[680px] bg-card border-border/50 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-xl font-bold text-primary shrink-0">
              {client.avatar}
            </div>
            <div>
              <DialogTitle className="text-xl leading-tight">{client.name}</DialogTitle>
              <p className="text-sm text-muted-foreground mt-0.5">{client.companyName} · {client.industry}</p>
              <Badge variant="outline" className={`mt-1.5 text-[10px] px-2 py-0.5 ${STAGE_COLORS[client.stage]}`}>
                {STAGE_LABELS[client.stage]}
              </Badge>
            </div>
          </div>
        </DialogHeader>

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-muted/20 rounded-lg border border-border/30 w-fit mt-1">
          {(["overview", "notes", "activity"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                activeTab === t ? "bg-card text-foreground shadow-sm border border-border/40" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {{ overview: "Visão Geral", notes: "Notas", activity: "Mover Estágio" }[t]}
            </button>
          ))}
        </div>

        {/* Overview */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-2 gap-4 mt-2">
            <InfoRow icon={<Mail className="w-3.5 h-3.5" />} label="E-mail" value={client.email} />
            <InfoRow icon={<Phone className="w-3.5 h-3.5" />} label="Telefone" value={client.phone || "—"} />
            <InfoRow icon={<Globe className="w-3.5 h-3.5" />} label="Website" value={client.website || "—"} />
            <InfoRow icon={<Tag className="w-3.5 h-3.5" />} label="Origem" value={client.source} />
            <InfoRow icon={<Star className="w-3.5 h-3.5" />} label="Responsável" value={client.assignedTo} />
            <InfoRow icon={<TrendingUp className="w-3.5 h-3.5" />} label="Último contato" value={daysSince(client.lastContact)} />
            <div className="col-span-2 grid grid-cols-2 gap-4">
              <div className="bg-muted/20 rounded-xl p-4 border border-border/30 text-center">
                <p className="text-xs text-muted-foreground mb-1">Mensalidade</p>
                <p className="text-2xl font-bold text-primary">
                  {client.monthlyValue ? `R$ ${client.monthlyValue.toLocaleString("pt-BR")}` : "—"}
                </p>
              </div>
              <div className="bg-muted/20 rounded-xl p-4 border border-border/30 text-center">
                <p className="text-xs text-muted-foreground mb-1">Receita Total</p>
                <p className="text-2xl font-bold text-emerald-400">
                  {client.totalRevenue ? `R$ ${client.totalRevenue.toLocaleString("pt-BR")}` : "—"}
                </p>
              </div>
            </div>
            {client.tags.length > 0 && (
              <div className="col-span-2 flex flex-wrap gap-1.5">
                {client.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-[10px] px-2 py-0.5">{tag}</Badge>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Notes */}
        {activeTab === "notes" && (
          <div className="flex flex-col gap-4 mt-2">
            <div className="flex gap-2">
              <Input
                placeholder="Adicione uma nota..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddNote()}
                className="bg-muted/20 border-border/50 flex-1"
              />
              <Button size="icon" onClick={handleAddNote} disabled={!note.trim()}>
                <Send className="w-4 h-4" />
              </Button>
            </div>
            {client.notes.length === 0 ? (
              <div className="py-10 text-center text-muted-foreground">
                <MessageSquare className="w-10 h-10 mx-auto mb-2 opacity-20" />
                <p className="text-sm">Nenhuma nota ainda.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                {client.notes.map((n) => (
                  <div key={n.id} className="bg-muted/20 rounded-xl p-4 border border-border/30">
                    <p className="text-sm leading-relaxed">{n.text}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-primary/70 font-medium">{n.author}</span>
                      <span className="text-xs text-muted-foreground">{daysSince(n.createdAt)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Move Stage */}
        {activeTab === "activity" && (
          <div className="flex flex-col gap-3 mt-2">
            <p className="text-sm text-muted-foreground">Mover para outro estágio do funil:</p>
            {STAGE_ORDER.filter((s) => s !== client.stage).map((s) => (
              <button
                key={s}
                onClick={() => { moveClient(client.id, s); onClose(); }}
                className="flex items-center justify-between p-4 rounded-xl bg-muted/20 border border-border/30 hover:border-primary/40 hover:bg-primary/5 transition-all text-left group"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-2.5 h-2.5 rounded-full ${STAGE_BAR[s]}`} />
                  <span className="font-medium">{STAGE_LABELS[s]}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </button>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 bg-muted/10 rounded-lg p-3 border border-border/20">
      <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
        {icon} {label}
      </span>
      <span className="text-sm font-medium truncate">{value}</span>
    </div>
  );
}

// ── Kanban Column ─────────────────────────────────────────────────────────────
function KanbanColumn({
  stage, clients, onSelect,
}: { stage: ClientStage; clients: Client[]; onSelect: (c: Client) => void }) {
  const { moveClient } = useClientsStore();
  const value = clients.reduce((a, c) => a + c.monthlyValue, 0);

  return (
    <div className="flex flex-col gap-3 min-w-[240px]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${STAGE_BAR[stage]}`} />
          <span className="text-sm font-semibold">{STAGE_LABELS[stage]}</span>
          <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">{clients.length}</Badge>
        </div>
        {value > 0 && <span className="text-xs text-muted-foreground">R$ {value.toLocaleString("pt-BR")}</span>}
      </div>

      <div className="flex flex-col gap-2 min-h-[120px]">
        {clients.map((c) => (
          <div
            key={c.id}
            onClick={() => onSelect(c)}
            className="bg-card/60 border border-border/40 rounded-xl p-3.5 hover:border-primary/40 hover:bg-card/90 transition-all cursor-pointer group"
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                  {c.avatar}
                </div>
                <div>
                  <p className="text-sm font-semibold leading-tight">{c.name}</p>
                  <p className="text-[10px] text-muted-foreground">{c.companyName}</p>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                  <button className="p-1 rounded-md hover:bg-muted/30 opacity-0 group-hover:opacity-100 transition-opacity">
                    <MoreHorizontal className="w-3.5 h-3.5 text-muted-foreground" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44">
                  {STAGE_ORDER.filter((s) => s !== stage).map((s) => (
                    <DropdownMenuItem
                      key={s}
                      onClick={(e) => { e.stopPropagation(); moveClient(c.id, s); }}
                      className="text-xs gap-2"
                    >
                      <ArrowRight className="w-3.5 h-3.5" />
                      Mover para {STAGE_LABELS[s]}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            {c.monthlyValue > 0 && (
              <p className="text-xs font-semibold text-primary mt-1">
                R$ {c.monthlyValue.toLocaleString("pt-BR")}/mês
              </p>
            )}
            {c.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {c.tags.slice(0, 2).map((t) => (
                  <Badge key={t} variant="secondary" className="text-[9px] px-1.5 py-0">{t}</Badge>
                ))}
              </div>
            )}
          </div>
        ))}
        {clients.length === 0 && (
          <div className="flex-1 rounded-xl border-2 border-dashed border-border/20 flex items-center justify-center py-8">
            <span className="text-xs text-muted-foreground/50">Vazio</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ── List View ─────────────────────────────────────────────────────────────────
function ListView({ clients, onSelect }: { clients: Client[]; onSelect: (c: Client) => void }) {
  return (
    <div className="bg-card/50 border border-border/50 rounded-xl overflow-hidden">
      <table className="w-full text-sm">
        <thead className="text-xs text-muted-foreground bg-muted/20 border-b border-border/50 uppercase">
          <tr>
            <th className="px-5 py-3 text-left font-medium">Cliente</th>
            <th className="px-5 py-3 text-left font-medium hidden md:table-cell">Empresa / Setor</th>
            <th className="px-5 py-3 text-left font-medium hidden lg:table-cell">Contato</th>
            <th className="px-5 py-3 text-left font-medium">Estágio</th>
            <th className="px-5 py-3 text-right font-medium">Valor/mês</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/30">
          {clients.map((c) => (
            <tr
              key={c.id}
              onClick={() => onSelect(c)}
              className="hover:bg-muted/10 transition-colors cursor-pointer"
            >
              <td className="px-5 py-3.5">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                    {c.avatar}
                  </div>
                  <span className="font-medium">{c.name}</span>
                </div>
              </td>
              <td className="px-5 py-3.5 hidden md:table-cell text-muted-foreground text-xs">
                <div>{c.companyName}</div>
                {c.industry && <div className="text-muted-foreground/60">{c.industry}</div>}
              </td>
              <td className="px-5 py-3.5 hidden lg:table-cell text-muted-foreground text-xs">{c.email}</td>
              <td className="px-5 py-3.5">
                <Badge variant="outline" className={`text-[10px] px-2 py-0.5 ${STAGE_COLORS[c.stage]}`}>
                  {STAGE_LABELS[c.stage]}
                </Badge>
              </td>
              <td className="px-5 py-3.5 text-right font-semibold">
                {c.monthlyValue ? `R$ ${c.monthlyValue.toLocaleString("pt-BR")}` : "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function Clients() {
  const { clients } = useClientsStore();
  const [view, setView] = useState<"kanban" | "list">("kanban");
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState<ClientStage | "all">("all");
  const [addOpen, setAddOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  const filtered = clients.filter((c) => {
    const matchStage = stageFilter === "all" || c.stage === stageFilter;
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      c.name.toLowerCase().includes(q) ||
      c.companyName.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q);
    return matchStage && matchSearch;
  });

  const byStage = (stage: ClientStage) =>
    filtered.filter((c) => c.stage === stage);

  const totalMRR = clients
    .filter((c) => c.stage === "active")
    .reduce((a, c) => a + c.monthlyValue, 0);

  const pipelineValue = clients
    .filter((c) => ["proposal", "contract"].includes(c.stage))
    .reduce((a, c) => a + c.monthlyValue * 12, 0);

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clientes</h1>
          <p className="text-muted-foreground text-sm">CRM — gerencie o relacionamento e o funil de vendas.</p>
        </div>
        <PermissionGuard action="clients.create" tooltip="Apenas Admin e Gerente de Conta podem adicionar clientes.">
          <Button onClick={() => setAddOpen(true)} className="gap-2">
            <Plus className="w-4 h-4" /> Adicionar Cliente
          </Button>
        </PermissionGuard>
      </div>

      {/* KPI Bar */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {STAGE_ORDER.map((stage) => {
          const count = clients.filter((c) => c.stage === stage).length;
          return (
            <button
              key={stage}
              onClick={() => setStageFilter(stageFilter === stage ? "all" : stage)}
              className={`flex flex-col items-center p-4 rounded-xl border transition-all ${
                stageFilter === stage
                  ? "border-primary/50 bg-primary/5"
                  : "border-border/40 bg-card/50 hover:border-border/70"
              }`}
            >
              <div className={`w-2 h-2 rounded-full mb-2 ${STAGE_BAR[stage]}`} />
              <span className="text-2xl font-bold">{count}</span>
              <span className="text-xs text-muted-foreground mt-0.5">{STAGE_LABELS[stage]}</span>
            </button>
          );
        })}
      </div>

      {/* MRR + Pipeline */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-1 bg-card/50 border border-border/40 rounded-xl p-4 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-primary/10 text-primary"><DollarSign className="w-5 h-5" /></div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">MRR Ativo</p>
            <p className="text-2xl font-bold">R$ {totalMRR.toLocaleString("pt-BR")}</p>
          </div>
        </div>
        <div className="md:col-span-1 bg-card/50 border border-border/40 rounded-xl p-4 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-violet-500/10 text-violet-400"><TrendingUp className="w-5 h-5" /></div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Pipeline (ARR)</p>
            <p className="text-2xl font-bold">R$ {pipelineValue.toLocaleString("pt-BR")}</p>
          </div>
        </div>
        <div className="md:col-span-1 bg-card/50 border border-border/40 rounded-xl p-4 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400"><Users className="w-5 h-5" /></div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Total Clientes</p>
            <p className="text-2xl font-bold">{clients.filter((c) => c.stage !== "churned").length}</p>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, empresa ou e-mail..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-muted/20 border-border/50"
          />
        </div>
        <div className="flex items-center gap-1 p-1 bg-muted/20 rounded-lg border border-border/40">
          <button
            onClick={() => setView("kanban")}
            className={`p-1.5 rounded-md transition-all ${view === "kanban" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setView("list")}
            className={`p-1.5 rounded-md transition-all ${view === "list" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Views */}
      {view === "kanban" ? (
        <div className="overflow-x-auto pb-4">
          <div className="flex gap-4" style={{ minWidth: `${STAGE_ORDER.length * 260}px` }}>
            {STAGE_ORDER.map((stage) => (
              <div key={stage} className="flex-1 min-w-[240px]">
                <KanbanColumn stage={stage} clients={byStage(stage)} onSelect={setSelectedClient} />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <ListView clients={filtered} onSelect={setSelectedClient} />
      )}

      {/* Dialogs */}
      <AddClientDialog open={addOpen} onClose={() => setAddOpen(false)} />
      {selectedClient && (
        <ClientDetailDialog
          client={clients.find((c) => c.id === selectedClient.id) ?? selectedClient}
          onClose={() => setSelectedClient(null)}
        />
      )}
    </div>
  );
}
