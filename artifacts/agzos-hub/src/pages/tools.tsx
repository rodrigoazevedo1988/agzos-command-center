import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
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
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import {
  Plus, Search, ExternalLink, MoreHorizontal, Wrench,
  TrendingDown, DollarSign, Package, AlertTriangle,
} from "lucide-react";
import { PermissionGuard } from "@/components/PermissionGuard";
import {
  useToolsStore, Tool, ToolCategory, NewToolInput, CATEGORY_LABELS,
} from "@/store/useToolsStore";

const CATEGORIES: (ToolCategory | "all")[] = [
  "all", "advertising", "analytics", "seo", "design",
  "development", "communication", "finance", "crm", "other",
];

// ── Add Tool Dialog ────────────────────────────────────────────────────────────
function AddToolDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { addTool } = useToolsStore();
  const [form, setForm] = useState<NewToolInput>({
    name: "", description: "", category: "other",
    monthlyCost: 0, url: "", loginEmail: "",
  });
  const set = (k: keyof NewToolInput, v: string | number | ToolCategory) =>
    setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = () => {
    if (!form.name) return;
    addTool(form);
    onClose();
    setForm({ name: "", description: "", category: "other", monthlyCost: 0, url: "", loginEmail: "" });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-card border-border/50">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            <Wrench className="w-5 h-5 text-primary" /> Adicionar Ferramenta
          </DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 py-2">
          <div className="flex flex-col gap-1.5 col-span-2">
            <Label>Nome *</Label>
            <Input placeholder="Ex: Hotjar" value={form.name} onChange={(e) => set("name", e.target.value)} className="bg-muted/20 border-border/50" />
          </div>
          <div className="flex flex-col gap-1.5 col-span-2">
            <Label>Descrição</Label>
            <Input placeholder="Para que serve esta ferramenta?" value={form.description} onChange={(e) => set("description", e.target.value)} className="bg-muted/20 border-border/50" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Categoria</Label>
            <Select value={form.category} onValueChange={(v) => set("category", v as ToolCategory)}>
              <SelectTrigger className="bg-muted/20 border-border/50"><SelectValue /></SelectTrigger>
              <SelectContent>
                {CATEGORIES.filter((c) => c !== "all").map((c) => (
                  <SelectItem key={c} value={c}>{CATEGORY_LABELS[c]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Custo mensal (R$)</Label>
            <Input type="number" placeholder="0" value={form.monthlyCost || ""} onChange={(e) => set("monthlyCost", Number(e.target.value))} className="bg-muted/20 border-border/50" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>URL</Label>
            <Input placeholder="app.exemplo.com" value={form.url} onChange={(e) => set("url", e.target.value)} className="bg-muted/20 border-border/50" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>E-mail de acesso</Label>
            <Input type="email" placeholder="acesso@agencia.com" value={form.loginEmail} onChange={(e) => set("loginEmail", e.target.value)} className="bg-muted/20 border-border/50" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="border-border/50">Cancelar</Button>
          <Button onClick={handleSubmit} disabled={!form.name} className="gap-2">
            <Plus className="w-4 h-4" /> Adicionar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Tool Card ─────────────────────────────────────────────────────────────────
function ToolCard({ tool }: { tool: Tool }) {
  const { toggleStatus } = useToolsStore();
  const inactive = tool.status === "inactive";

  const isExpiringSoon = (() => {
    if (!tool.renewalDate) return false;
    const days = Math.ceil((new Date(tool.renewalDate).getTime() - Date.now()) / 86400000);
    return days > 0 && days <= 30;
  })();

  return (
    <Card
      className={`border-border/50 backdrop-blur-xl transition-all relative overflow-hidden ${
        inactive ? "bg-muted/10 opacity-60" : "bg-card/60 hover:border-primary/30"
      }`}
    >
      {isExpiringSoon && (
        <div className="absolute top-2.5 right-2.5 z-10">
          <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" title="Renovação em breve" />
        </div>
      )}
      <CardContent className="p-5 flex flex-col h-full gap-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className={`text-2xl w-10 h-10 rounded-xl bg-muted/30 flex items-center justify-center border border-border/30 shrink-0`}>
              {tool.icon}
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-sm leading-tight truncate">{tool.name}</h3>
              <Badge variant="secondary" className="mt-1 text-[10px] px-1.5 py-0">
                {CATEGORY_LABELS[tool.category]}
              </Badge>
            </div>
          </div>
          <PermissionGuard action="tools.toggle" tooltip="Sem permissão para ativar/desativar.">
            <Switch
              checked={!inactive}
              onCheckedChange={() => toggleStatus(tool.id)}
              className="scale-[0.8] origin-right shrink-0"
            />
          </PermissionGuard>
        </div>

        {/* Description */}
        {tool.description && (
          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{tool.description}</p>
        )}

        {/* Login */}
        {tool.loginEmail && (
          <div className="text-xs text-muted-foreground/70 bg-muted/20 px-2.5 py-1.5 rounded-md border border-border/20 truncate font-mono">
            {tool.loginEmail}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between mt-auto pt-3 border-t border-border/40">
          <div>
            <span className="font-bold text-sm">
              {tool.monthlyCost ? `R$ ${tool.monthlyCost.toLocaleString("pt-BR")}/mês` : "Gratuito"}
            </span>
            {tool.renewalDate && isExpiringSoon && (
              <div className="flex items-center gap-1 text-[10px] text-amber-400 mt-0.5">
                <AlertTriangle className="w-3 h-3" />
                Renova em {new Date(tool.renewalDate).toLocaleDateString("pt-BR")}
              </div>
            )}
          </div>
          <div className="flex items-center gap-1">
            {tool.url && (
              <a href={`https://${tool.url}`} target="_blank" rel="noreferrer"
                className="p-1.5 rounded-md hover:bg-muted/30 text-muted-foreground hover:text-primary transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
            <PermissionGuard action="tools.edit" tooltip="Sem permissão." hide>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="p-1.5 rounded-md hover:bg-muted/30 text-muted-foreground hover:text-foreground transition-colors">
                    <MoreHorizontal className="w-3.5 h-3.5" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-36">
                  <DropdownMenuItem className="text-xs">Editar</DropdownMenuItem>
                  <DropdownMenuItem className="text-xs text-destructive">Remover</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </PermissionGuard>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function Tools() {
  const {
    searchQuery, categoryFilter,
    setSearch, setCategoryFilter, getFiltered,
    getTotalActiveCost, getTotalInactiveCost,
  } = useToolsStore();
  const [addOpen, setAddOpen] = useState(false);

  const filtered = getFiltered();
  const activeCost = getTotalActiveCost();
  const inactiveCost = getTotalInactiveCost();
  const activeCount = filtered.filter((t) => t.status === "active").length;

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Ferramentas</h1>
          <p className="text-muted-foreground text-sm">Gerencie assinaturas, acessos e credenciais de software.</p>
        </div>
        <PermissionGuard action="tools.create" tooltip="Apenas Admin e Dev podem adicionar ferramentas.">
          <Button onClick={() => setAddOpen(true)} className="gap-2">
            <Plus className="w-4 h-4" /> Adicionar
          </Button>
        </PermissionGuard>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card/50 border border-border/40 rounded-xl p-4 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-primary/10 text-primary shrink-0"><DollarSign className="w-5 h-5" /></div>
          <div>
            <p className="text-xs text-muted-foreground">Custo mensal ativo</p>
            <p className="text-2xl font-bold">R$ {activeCost.toLocaleString("pt-BR")}</p>
            <p className="text-[10px] text-muted-foreground">≈ R$ {(activeCost * 12).toLocaleString("pt-BR")}/ano</p>
          </div>
        </div>
        <div className="bg-card/50 border border-border/40 rounded-xl p-4 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 shrink-0"><Package className="w-5 h-5" /></div>
          <div>
            <p className="text-xs text-muted-foreground">Ferramentas ativas</p>
            <p className="text-2xl font-bold">{activeCount}</p>
            <p className="text-[10px] text-muted-foreground">de {filtered.length} cadastradas</p>
          </div>
        </div>
        <div className="bg-card/50 border border-border/40 rounded-xl p-4 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-muted text-muted-foreground shrink-0"><TrendingDown className="w-5 h-5" /></div>
          <div>
            <p className="text-xs text-muted-foreground">Economia desativando</p>
            <p className="text-2xl font-bold">R$ {inactiveCost.toLocaleString("pt-BR")}</p>
            <p className="text-[10px] text-muted-foreground">em ferramentas inativas</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar ferramentas..."
            value={searchQuery}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-muted/20 border-border/50"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                categoryFilter === cat
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-muted/20 text-muted-foreground border-border/40 hover:border-border/80 hover:text-foreground"
              }`}
            >
              {CATEGORY_LABELS[cat]}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="py-20 text-center text-muted-foreground">
          <Wrench className="w-12 h-12 mx-auto mb-3 opacity-20" />
          <p>Nenhuma ferramenta encontrada.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((tool) => <ToolCard key={tool.id} tool={tool} />)}
        </div>
      )}

      <AddToolDialog open={addOpen} onClose={() => setAddOpen(false)} />
    </div>
  );
}
