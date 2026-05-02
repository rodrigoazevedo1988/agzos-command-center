import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus, Search, DollarSign, TrendingUp, AlertCircle, Clock,
  FileText, MoreHorizontal, CheckCircle2, XCircle, Send,
  BarChart3, Download, ChevronDown,
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from "recharts";
import { PermissionGuard } from "@/components/PermissionGuard";
import {
  useFinancialStore, Invoice, InvoiceStatus, InvoiceCategory, NewInvoiceInput,
} from "@/store/useFinancialStore";

const STATUS_LABEL: Record<InvoiceStatus, string> = {
  draft: "Rascunho", sent: "Enviado", paid: "Pago",
  overdue: "Vencido", cancelled: "Cancelado",
};
const STATUS_COLOR: Record<InvoiceStatus, string> = {
  draft:     "bg-muted text-muted-foreground border-border",
  sent:      "bg-blue-500/10 text-blue-400 border-blue-500/20",
  paid:      "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  overdue:   "bg-red-500/10 text-red-400 border-red-500/20",
  cancelled: "bg-muted text-muted-foreground/50 border-border line-through",
};
const CATEGORY_LABEL: Record<InvoiceCategory, string> = {
  retainer:      "Retainer",
  project:       "Projeto",
  ads_management:"Gestão de Ads",
  consulting:    "Consultoria",
  other:         "Outros",
};

const TOOLTIP_STYLE = {
  backgroundColor: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
  borderRadius: "8px",
  fontSize: "12px",
  color: "hsl(var(--foreground))",
};

// ── Create Invoice Dialog ──────────────────────────────────────────────────────
function CreateInvoiceDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { addInvoice } = useFinancialStore();
  const today = new Date().toISOString().split("T")[0];
  const [form, setForm] = useState<NewInvoiceInput>({
    clientName: "", projectName: "", amount: 0,
    category: "retainer", dueDate: "", description: "",
  });
  const set = (k: keyof NewInvoiceInput, v: string | number | InvoiceCategory) =>
    setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = () => {
    if (!form.clientName || !form.amount) return;
    addInvoice(form);
    onClose();
    setForm({ clientName: "", projectName: "", amount: 0, category: "retainer", dueDate: "", description: "" });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[520px] bg-card border-border/50">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" /> Nova Fatura
          </DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 py-2">
          <div className="flex flex-col gap-1.5 col-span-2">
            <Label>Cliente *</Label>
            <Input placeholder="Nome do cliente" value={form.clientName} onChange={(e) => set("clientName", e.target.value)} className="bg-muted/20 border-border/50" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Projeto / Serviço</Label>
            <Input placeholder="Ex: Gestão de Ads" value={form.projectName} onChange={(e) => set("projectName", e.target.value)} className="bg-muted/20 border-border/50" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Categoria</Label>
            <Select value={form.category} onValueChange={(v) => set("category", v as InvoiceCategory)}>
              <SelectTrigger className="bg-muted/20 border-border/50"><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.entries(CATEGORY_LABEL).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Valor (R$) *</Label>
            <Input type="number" placeholder="0,00" value={form.amount || ""} onChange={(e) => set("amount", Number(e.target.value))} className="bg-muted/20 border-border/50" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Vencimento</Label>
            <Input type="date" min={today} value={form.dueDate} onChange={(e) => set("dueDate", e.target.value)} className="bg-muted/20 border-border/50" />
          </div>
          <div className="flex flex-col gap-1.5 col-span-2">
            <Label>Descrição</Label>
            <Input placeholder="Descreva os serviços..." value={form.description} onChange={(e) => set("description", e.target.value)} className="bg-muted/20 border-border/50" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="border-border/50">Cancelar</Button>
          <Button onClick={handleSubmit} disabled={!form.clientName || !form.amount} className="gap-2">
            <Plus className="w-4 h-4" /> Criar Fatura
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Invoice Row ────────────────────────────────────────────────────────────────
function InvoiceRow({ invoice }: { invoice: Invoice }) {
  const { markPaid, cancelInvoice } = useFinancialStore();
  const isOverdue = invoice.status === "overdue";
  const isPaid = invoice.status === "paid";
  const isCancelled = invoice.status === "cancelled";

  return (
    <tr className={`hover:bg-muted/5 transition-colors ${isCancelled ? "opacity-50" : ""}`}>
      <td className="px-5 py-3.5">
        <div className="font-mono text-xs text-muted-foreground">{invoice.number}</div>
        <div className="text-xs text-muted-foreground/60">{CATEGORY_LABEL[invoice.category]}</div>
      </td>
      <td className="px-5 py-3.5">
        <div className="font-medium text-sm">{invoice.clientName}</div>
        {invoice.projectName && <div className="text-xs text-muted-foreground">{invoice.projectName}</div>}
      </td>
      <td className="px-5 py-3.5 font-semibold">
        R$ {invoice.amount.toLocaleString("pt-BR")}
      </td>
      <td className="px-5 py-3.5">
        <Badge variant="outline" className={`text-[10px] px-2 py-0.5 ${STATUS_COLOR[invoice.status]}`}>
          {STATUS_LABEL[invoice.status]}
        </Badge>
      </td>
      <td className="px-5 py-3.5 text-xs text-muted-foreground">
        <div className={`flex items-center gap-1 ${isOverdue ? "text-red-400" : ""}`}>
          <Clock className="w-3 h-3 opacity-60" />
          {invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString("pt-BR") : "—"}
        </div>
        {isPaid && invoice.paidDate && (
          <div className="text-emerald-400 flex items-center gap-1 mt-0.5">
            <CheckCircle2 className="w-3 h-3" />
            Pago em {new Date(invoice.paidDate).toLocaleDateString("pt-BR")}
          </div>
        )}
      </td>
      <td className="px-5 py-3.5 text-right">
        {!isPaid && !isCancelled && (
          <PermissionGuard action="financial.edit" tooltip="Sem permissão para editar faturas." hide>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7">
                  <MoreHorizontal className="w-3.5 h-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                {invoice.status !== "paid" && (
                  <DropdownMenuItem onClick={() => markPaid(invoice.id)} className="text-xs gap-2 text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Marcar como Pago
                  </DropdownMenuItem>
                )}
                {invoice.status === "draft" && (
                  <DropdownMenuItem className="text-xs gap-2">
                    <Send className="w-3.5 h-3.5" /> Enviar ao cliente
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => cancelInvoice(invoice.id)} className="text-xs gap-2 text-destructive">
                  <XCircle className="w-3.5 h-3.5" /> Cancelar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </PermissionGuard>
        )}
      </td>
    </tr>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function Financial() {
  const {
    cashflow, statusFilter, searchQuery,
    setStatusFilter, setSearchQuery, getFiltered, getSummary,
  } = useFinancialStore();
  const [createOpen, setCreateOpen] = useState(false);

  const filtered = getFiltered();
  const summary = getSummary();

  const exportCSV = () => {
    const rows = [
      ["Número", "Cliente", "Projeto", "Categoria", "Valor", "Status", "Emissão", "Vencimento", "Pago em"],
      ...filtered.map((inv) => [
        inv.number, inv.clientName, inv.projectName, CATEGORY_LABEL[inv.category],
        inv.amount, STATUS_LABEL[inv.status], inv.issueDate, inv.dueDate, inv.paidDate ?? "",
      ]),
    ];
    const csv = "\uFEFF" + rows.map((r) => r.join(";")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "faturas_agzos.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Financeiro</h1>
          <p className="text-muted-foreground text-sm">Gerencie faturas, fluxo de caixa e receitas.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={exportCSV} className="gap-2 border-border/50">
            <Download className="w-4 h-4" /> Exportar
          </Button>
          <PermissionGuard action="financial.create" tooltip="Apenas Admin e Financeiro podem criar faturas.">
            <Button onClick={() => setCreateOpen(true)} className="gap-2">
              <Plus className="w-4 h-4" /> Criar Fatura
            </Button>
          </PermissionGuard>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          icon={<CheckCircle2 className="w-5 h-5" />}
          iconClass="bg-emerald-500/10 text-emerald-400"
          label="Total Recebido"
          value={`R$ ${summary.totalReceived.toLocaleString("pt-BR")}`}
          sub="faturas pagas"
        />
        <KPICard
          icon={<Send className="w-5 h-5" />}
          iconClass="bg-blue-500/10 text-blue-400"
          label="A Receber"
          value={`R$ ${summary.pendingAmount.toLocaleString("pt-BR")}`}
          sub="enviadas e abertas"
        />
        <KPICard
          icon={<AlertCircle className="w-5 h-5" />}
          iconClass="bg-red-500/10 text-red-400"
          label="Em Atraso"
          value={`R$ ${summary.overdueAmount.toLocaleString("pt-BR")}`}
          sub="vencidas sem pagamento"
          alert={summary.overdueAmount > 0}
        />
        <KPICard
          icon={<FileText className="w-5 h-5" />}
          iconClass="bg-muted text-muted-foreground"
          label="Rascunhos"
          value={String(summary.draftCount)}
          sub="aguardando envio"
        />
      </div>

      {/* Cashflow Chart */}
      <Card className="border-border/50 bg-card/50 backdrop-blur-xl">
        <CardHeader className="border-b border-border/50 flex flex-row items-center gap-3 py-4">
          <BarChart3 className="w-4 h-4 text-primary" />
          <CardTitle className="text-base">Fluxo de Caixa — Últimos 6 meses</CardTitle>
        </CardHeader>
        <CardContent className="pt-4 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={cashflow} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="gReceived" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="gExpected" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="gExpenses" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#EF4444" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#EF4444" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.4} />
              <XAxis dataKey="month" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} />
              <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v: number) => [`R$ ${v.toLocaleString("pt-BR")}`, ""]} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Area type="monotone" dataKey="received"  name="Recebido"  stroke="hsl(var(--primary))" fill="url(#gReceived)"  strokeWidth={2} dot={false} />
              <Area type="monotone" dataKey="expected"  name="Previsto"  stroke="#10B981"              fill="url(#gExpected)"  strokeWidth={2} dot={false} strokeDasharray="4 2" />
              <Area type="monotone" dataKey="expenses"  name="Despesas"  stroke="#EF4444"              fill="url(#gExpenses)"  strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Invoices Table */}
      <Card className="border-border/50 bg-card/50 backdrop-blur-xl">
        <CardHeader className="border-b border-border/50 py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <CardTitle className="text-base flex-1">Faturas</CardTitle>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <Input
                  placeholder="Buscar..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 h-8 text-sm bg-muted/20 border-border/50"
                />
              </div>
              <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as InvoiceStatus | "all")}>
                <SelectTrigger className="h-8 w-36 text-xs bg-muted/20 border-border/50">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {Object.entries(STATUS_LABEL).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs text-muted-foreground bg-muted/20 border-b border-border/40 uppercase">
              <tr>
                <th className="px-5 py-3 text-left font-medium">Nº / Categoria</th>
                <th className="px-5 py-3 text-left font-medium">Cliente / Projeto</th>
                <th className="px-5 py-3 text-left font-medium">Valor</th>
                <th className="px-5 py-3 text-left font-medium">Status</th>
                <th className="px-5 py-3 text-left font-medium">Vencimento</th>
                <th className="px-5 py-3 text-right font-medium">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-muted-foreground">
                    <FileText className="w-10 h-10 mx-auto mb-2 opacity-20" />
                    <p className="text-sm">Nenhuma fatura encontrada.</p>
                  </td>
                </tr>
              ) : (
                filtered.map((inv) => <InvoiceRow key={inv.id} invoice={inv} />)
              )}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 border-t border-border/30 flex items-center justify-between text-xs text-muted-foreground">
          <span>{filtered.length} fatura{filtered.length !== 1 ? "s" : ""}</span>
          <span>Total: R$ {filtered.reduce((a, i) => a + i.amount, 0).toLocaleString("pt-BR")}</span>
        </div>
      </Card>

      <CreateInvoiceDialog open={createOpen} onClose={() => setCreateOpen(false)} />
    </div>
  );
}

function KPICard({
  icon, iconClass, label, value, sub, alert = false,
}: {
  icon: React.ReactNode; iconClass: string;
  label: string; value: string; sub: string; alert?: boolean;
}) {
  return (
    <Card className={`border-border/50 bg-card/50 backdrop-blur-xl ${alert ? "border-red-500/30" : ""}`}>
      <CardContent className="p-5 flex items-center gap-4">
        <div className={`p-3 rounded-xl shrink-0 ${iconClass}`}>{icon}</div>
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground truncate">{label}</p>
          <p className={`text-2xl font-bold tracking-tight ${alert ? "text-red-400" : ""}`}>{value}</p>
          <p className="text-[10px] text-muted-foreground/70 mt-0.5">{sub}</p>
        </div>
      </CardContent>
    </Card>
  );
}
