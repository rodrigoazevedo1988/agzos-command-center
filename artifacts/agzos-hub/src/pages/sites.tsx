import { useState, useEffect, useRef } from "react";
import { useSitesStore, Site, SiteStatus, SitePlatform, SiteDeployment, NewSiteInput } from "@/store/useSitesStore";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Search, Plus, ExternalLink, Globe, Settings,
  PauseCircle, ChevronDown, X, Rocket, Code2,
  Eye, TrendingUp, Percent, Clock, CheckCircle2, XCircle, Loader2,
  Filter, LayoutGrid, List, Zap, Tag, Link2
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PermissionGuard } from "@/components/PermissionGuard";

const PLATFORMS: (SitePlatform | "all")[] = ["all", "Lovable", "Replit", "WordPress", "Webflow", "Next.js", "Shopify", "Custom"];
const STATUSES: { value: SiteStatus | "all"; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "active", label: "Ativo" },
  { value: "development", label: "Dev" },
  { value: "maintenance", label: "Manutenção" },
  { value: "paused", label: "Pausado" },
];

function useCountUp(target: number, duration = 1200) {
  const [count, setCount] = useState(0);
  const raf = useRef<number | null>(null);

  useEffect(() => {
    if (target === 0) { setCount(0); return; }
    const start = performance.now();
    const animate = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) raf.current = requestAnimationFrame(animate);
    };
    raf.current = requestAnimationFrame(animate);
    return () => { if (raf.current) cancelAnimationFrame(raf.current); };
  }, [target, duration]);

  return count;
}

function useDebounce<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

function getStatusColor(status: SiteStatus) {
  switch (status) {
    case "active": return "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";
    case "development": return "bg-blue-500/15 text-blue-400 border-blue-500/30";
    case "maintenance": return "bg-yellow-500/15 text-yellow-400 border-yellow-500/30";
    case "paused": return "bg-muted/50 text-muted-foreground border-border";
    default: return "bg-muted/50 text-muted-foreground border-border";
  }
}

function getStatusLabel(status: SiteStatus) {
  switch (status) {
    case "active": return "Ativo";
    case "development": return "Em Dev";
    case "maintenance": return "Manutenção";
    case "paused": return "Pausado";
    default: return status;
  }
}

function getPlatformColor(platform: string) {
  switch (platform) {
    case "Lovable": return "bg-pink-500/15 text-pink-400 border-pink-500/30";
    case "Replit": return "bg-orange-500/15 text-orange-400 border-orange-500/30";
    case "WordPress": return "bg-sky-500/15 text-sky-400 border-sky-500/30";
    case "Webflow": return "bg-blue-500/15 text-blue-400 border-blue-500/30";
    case "Next.js": return "bg-slate-400/15 text-slate-300 border-slate-400/30";
    case "Shopify": return "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";
    default: return "bg-violet-500/15 text-violet-400 border-violet-500/30";
  }
}

function getEditLabel(platform: string) {
  if (platform === "Lovable") return "Abrir no Lovable";
  if (platform === "Replit") return "Abrir no Replit";
  if (platform === "Webflow") return "Abrir no Webflow";
  return "Abrir Editor";
}

function getEditIcon(platform: string) {
  if (platform === "Lovable") return <Zap className="w-3.5 h-3.5" />;
  if (platform === "Replit") return <Code2 className="w-3.5 h-3.5" />;
  return <Code2 className="w-3.5 h-3.5" />;
}

function StatusBadge({ status }: { status: SiteStatus }) {
  const isActive = status === "active";
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(status)}`}>
      {isActive && (
        <span className="relative flex h-1.5 w-1.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
        </span>
      )}
      {status === "development" && <Settings className="w-3 h-3 animate-spin [animation-duration:3s]" />}
      {status === "maintenance" && <Settings className="w-3 h-3" />}
      {status === "paused" && <PauseCircle className="w-3 h-3" />}
      {getStatusLabel(status)}
    </span>
  );
}

function MetricBadge({ icon, value, label, suffix = "" }: { icon: React.ReactNode; value: number; label: string; suffix?: string }) {
  const count = useCountUp(value);
  return (
    <div className="flex flex-col items-center gap-0.5">
      <div className="flex items-center gap-1 text-muted-foreground">
        {icon}
        <span className="text-[10px] uppercase tracking-wider font-medium">{label}</span>
      </div>
      <span className="text-sm font-bold text-foreground tabular-nums">
        {count.toLocaleString("pt-BR")}{suffix}
      </span>
    </div>
  );
}

function DeploymentStatus({ status }: { status: SiteDeployment["status"] }) {
  if (status === "success") return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
  if (status === "failed") return <XCircle className="w-4 h-4 text-red-500" />;
  return <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />;
}

function DeploymentHistoryDialog({ site, open, onClose }: { site: Site; open: boolean; onClose: () => void }) {
  function formatDate(iso: string) {
    return new Date(iso).toLocaleString("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg bg-card border-border/50">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Rocket className="w-4 h-4 text-primary" />
            Histórico de Deployments — {site.name}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
          {site.deployments.map((dep) => (
            <div key={dep.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/20 border border-border/40 hover:bg-muted/30 transition-colors">
              <div className="mt-0.5 shrink-0">
                <DeploymentStatus status={dep.status} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{dep.message}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-muted-foreground">{dep.author}</span>
                  <span className="text-xs text-muted-foreground/50">·</span>
                  <span className="font-mono text-xs text-primary/80">{dep.sha}</span>
                  <span className="text-xs text-muted-foreground/50">·</span>
                  <span className="text-xs text-muted-foreground">{formatDate(dep.date)}</span>
                </div>
              </div>
              <Badge
                variant="outline"
                className={`text-[10px] shrink-0 ${dep.status === "success" ? "border-emerald-500/30 text-emerald-400" : dep.status === "failed" ? "border-red-500/30 text-red-400" : "border-blue-500/30 text-blue-400"}`}
              >
                {dep.status === "success" ? "OK" : dep.status === "failed" ? "FALHA" : "running"}
              </Badge>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function SiteThumbnail({ site }: { site: Site }) {
  return (
    <div className={`relative w-full h-36 rounded-t-xl bg-gradient-to-br ${site.gradient} overflow-hidden`}>
      <div className="absolute inset-0 opacity-10">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id={`grid-${site.id}`} width="24" height="24" patternUnits="userSpaceOnUse">
              <path d="M 24 0 L 0 0 0 24" fill="none" stroke="white" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill={`url(#grid-${site.id})`} />
        </svg>
      </div>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
        <Globe className="w-8 h-8 text-white/60" />
        <span className="text-white/80 text-xs font-mono truncate px-4 max-w-full">{site.url.replace(/^https?:\/\//, "")}</span>
      </div>
      <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-black/40 to-transparent" />
      <div className="absolute top-2 left-2 right-2 flex items-center justify-between">
        <StatusBadge status={site.status} />
        <Badge variant="outline" className={`text-[10px] font-medium border ${getPlatformColor(site.platform)}`}>
          {site.platform}
        </Badge>
      </div>
    </div>
  );
}

function SiteCard({ site }: { site: Site }) {
  const [showDeployments, setShowDeployments] = useState(false);

  return (
    <>
      <Card className="group border-border/40 bg-card/60 backdrop-blur-xl hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 overflow-hidden flex flex-col p-0">
        <SiteThumbnail site={site} />

        <div className="flex flex-col flex-1 p-4 gap-3">
          <div>
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="font-semibold text-foreground truncate">{site.name}</h3>
                <p className="text-xs text-muted-foreground truncate mt-0.5">{site.clientName}</p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Settings className="h-3.5 w-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel className="text-xs text-muted-foreground">Ações</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <PermissionGuard action="sites.edit" tooltip="Sem permissão para editar." hide>
                    <DropdownMenuItem className="cursor-pointer text-sm">
                      Editar detalhes
                    </DropdownMenuItem>
                  </PermissionGuard>
                  {site.adminUrl && (
                    <DropdownMenuItem className="cursor-pointer text-sm" onClick={() => window.open(site.adminUrl, "_blank")}>
                      Abrir Admin
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem className="cursor-pointer text-sm" onClick={() => setShowDeployments(true)}>
                    Ver deployments
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <PermissionGuard action="sites.delete" tooltip="Sem permissão para excluir." hide>
                    <DropdownMenuItem className="text-destructive cursor-pointer focus:bg-destructive/10 text-sm">
                      Excluir site
                    </DropdownMenuItem>
                  </PermissionGuard>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {site.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {site.tags.map((tag) => (
                  <span key={tag} className="inline-flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded bg-muted/40 text-muted-foreground border border-border/40">
                    <Tag className="w-2.5 h-2.5" />
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-3 gap-2 py-3 border-y border-border/30">
            <MetricBadge icon={<Eye className="w-3 h-3" />} value={site.metrics.visitsToday} label="Visitas" />
            <MetricBadge icon={<TrendingUp className="w-3 h-3" />} value={site.metrics.conversions} label="Conv." />
            <MetricBadge icon={<Percent className="w-3 h-3" />} value={site.metrics.bounceRate} label="Bounce" suffix="%" />
          </div>

          <div className="flex items-center gap-1.5 mt-auto">
            <Button
              size="sm"
              className="flex-1 h-8 text-xs gap-1.5"
              onClick={() => window.open(site.url, "_blank")}
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Abrir Site
            </Button>
            {site.editUrl && (
              <Button
                size="sm"
                variant="outline"
                className="flex-1 h-8 text-xs gap-1.5 border-border/50 hover:border-primary/50"
                onClick={() => window.open(site.editUrl, "_blank")}
              >
                {getEditIcon(site.platform)}
                {getEditLabel(site.platform)}
              </Button>
            )}
            <Button
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0 shrink-0 text-muted-foreground hover:text-foreground"
              onClick={() => setShowDeployments(true)}
              title="Histórico de deployments"
            >
              <Clock className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </Card>

      <DeploymentHistoryDialog site={site} open={showDeployments} onClose={() => setShowDeployments(false)} />
    </>
  );
}

function SiteRow({ site }: { site: Site }) {
  const [showDeployments, setShowDeployments] = useState(false);

  return (
    <>
      <tr className="hover:bg-muted/10 transition-colors group">
        <td className="px-4 py-3">
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${site.gradient} flex items-center justify-center shrink-0`}>
              <Globe className="w-4 h-4 text-white/80" />
            </div>
            <div className="min-w-0">
              <div className="font-medium text-foreground truncate">{site.name}</div>
              <a href={site.url} target="_blank" rel="noreferrer" className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1 mt-0.5 w-fit">
                {site.url.replace(/^https?:\/\//, "")}
                <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </a>
            </div>
          </div>
        </td>
        <td className="px-4 py-3 text-sm text-muted-foreground">{site.clientName}</td>
        <td className="px-4 py-3"><StatusBadge status={site.status} /></td>
        <td className="px-4 py-3">
          <Badge variant="outline" className={`text-xs border ${getPlatformColor(site.platform)}`}>{site.platform}</Badge>
        </td>
        <td className="px-4 py-3">
          <div className="flex items-center gap-3 text-xs tabular-nums">
            <span className="flex items-center gap-1 text-muted-foreground">
              <Eye className="w-3 h-3" />
              {site.metrics.visitsToday.toLocaleString("pt-BR")}
            </span>
            <span className="flex items-center gap-1 text-muted-foreground">
              <TrendingUp className="w-3 h-3" />
              {site.metrics.conversions}
            </span>
            <span className="flex items-center gap-1 text-muted-foreground">
              <Percent className="w-3 h-3" />
              {site.metrics.bounceRate}%
            </span>
          </div>
        </td>
        <td className="px-4 py-3 text-right">
          <div className="flex items-center justify-end gap-1">
            <Button size="sm" variant="ghost" className="h-7 px-2 text-xs gap-1" onClick={() => window.open(site.url, "_blank")}>
              <ExternalLink className="w-3 h-3" />
              Abrir
            </Button>
            {site.editUrl && (
              <Button size="sm" variant="ghost" className="h-7 px-2 text-xs gap-1" onClick={() => window.open(site.editUrl, "_blank")}>
                {getEditIcon(site.platform)}
                Editor
              </Button>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7">
                  <Settings className="h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <PermissionGuard action="sites.edit" tooltip="Sem permissão para editar." hide>
                  <DropdownMenuItem className="cursor-pointer text-sm">Editar detalhes</DropdownMenuItem>
                </PermissionGuard>
                {site.adminUrl && (
                  <DropdownMenuItem className="cursor-pointer text-sm" onClick={() => window.open(site.adminUrl, "_blank")}>Abrir Admin</DropdownMenuItem>
                )}
                <DropdownMenuItem className="cursor-pointer text-sm" onClick={() => setShowDeployments(true)}>Ver deployments</DropdownMenuItem>
                <DropdownMenuSeparator />
                <PermissionGuard action="sites.delete" tooltip="Sem permissão para excluir." hide>
                  <DropdownMenuItem className="text-destructive cursor-pointer focus:bg-destructive/10 text-sm">Excluir site</DropdownMenuItem>
                </PermissionGuard>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </td>
      </tr>
      <DeploymentHistoryDialog site={site} open={showDeployments} onClose={() => setShowDeployments(false)} />
    </>
  );
}

const PLATFORM_OPTIONS: SitePlatform[] = ["Lovable", "Replit", "WordPress", "Webflow", "Next.js", "Shopify", "Custom"];
const STATUS_OPTIONS: { value: SiteStatus; label: string }[] = [
  { value: "active", label: "Ativo" },
  { value: "development", label: "Em Desenvolvimento" },
  { value: "maintenance", label: "Manutenção" },
  { value: "paused", label: "Pausado" },
];

const EMPTY_FORM: NewSiteInput = {
  name: "",
  url: "",
  adminUrl: "",
  editUrl: "",
  clientName: "",
  status: "development",
  platform: "Lovable",
  tags: [],
};

function AddSiteDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const addSite = useSitesStore((s) => s.addSite);
  const [form, setForm] = useState<NewSiteInput>(EMPTY_FORM);
  const [tagInput, setTagInput] = useState("");
  const [errors, setErrors] = useState<Partial<Record<keyof NewSiteInput, string>>>({});

  function set<K extends keyof NewSiteInput>(key: K, value: NewSiteInput[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  }

  function addTag() {
    const t = tagInput.trim().toLowerCase();
    if (t && !form.tags.includes(t)) {
      setForm((f) => ({ ...f, tags: [...f.tags, t] }));
    }
    setTagInput("");
  }

  function removeTag(tag: string) {
    setForm((f) => ({ ...f, tags: f.tags.filter((t) => t !== tag) }));
  }

  function validate() {
    const errs: Partial<Record<keyof NewSiteInput, string>> = {};
    if (!form.name.trim()) errs.name = "Nome é obrigatório.";
    if (!form.url.trim()) errs.url = "URL é obrigatória.";
    if (!form.clientName.trim()) errs.clientName = "Cliente é obrigatório.";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleSubmit() {
    if (!validate()) return;
    addSite(form);
    setForm(EMPTY_FORM);
    setTagInput("");
    setErrors({});
    onClose();
  }

  function handleClose() {
    setForm(EMPTY_FORM);
    setTagInput("");
    setErrors({});
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg bg-card border-border/50">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="w-4 h-4 text-primary" />
            Adicionar Novo Site
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-sm">
            Preencha os dados do site. Campos com * são obrigatórios.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2 max-h-[60vh] overflow-y-auto pr-1">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 space-y-1.5">
              <Label htmlFor="site-name" className="text-sm">Nome do site *</Label>
              <Input
                id="site-name"
                placeholder="Ex: Agzos Agency"
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                className={`bg-background/50 border-border/50 ${errors.name ? "border-destructive" : ""}`}
              />
              {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
            </div>

            <div className="col-span-2 space-y-1.5">
              <Label htmlFor="site-url" className="text-sm">URL do site *</Label>
              <div className="relative">
                <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <Input
                  id="site-url"
                  placeholder="https://meusite.com.br"
                  value={form.url}
                  onChange={(e) => set("url", e.target.value)}
                  className={`pl-8 bg-background/50 border-border/50 ${errors.url ? "border-destructive" : ""}`}
                />
              </div>
              {errors.url && <p className="text-xs text-destructive">{errors.url}</p>}
            </div>

            <div className="col-span-2 space-y-1.5">
              <Label htmlFor="site-client" className="text-sm">Cliente *</Label>
              <Input
                id="site-client"
                placeholder="Ex: Empresa Ltda."
                value={form.clientName}
                onChange={(e) => set("clientName", e.target.value)}
                className={`bg-background/50 border-border/50 ${errors.clientName ? "border-destructive" : ""}`}
              />
              {errors.clientName && <p className="text-xs text-destructive">{errors.clientName}</p>}
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm">Plataforma</Label>
              <Select value={form.platform} onValueChange={(v) => set("platform", v as SitePlatform)}>
                <SelectTrigger className="bg-background/50 border-border/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PLATFORM_OPTIONS.map((p) => (
                    <SelectItem key={p} value={p}>{p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm">Status inicial</Label>
              <Select value={form.status} onValueChange={(v) => set("status", v as SiteStatus)}>
                <SelectTrigger className="bg-background/50 border-border/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((s) => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="site-admin" className="text-sm">URL do Admin</Label>
              <Input
                id="site-admin"
                placeholder="https://site.com/admin"
                value={form.adminUrl}
                onChange={(e) => set("adminUrl", e.target.value)}
                className="bg-background/50 border-border/50"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="site-edit" className="text-sm">URL do Editor</Label>
              <Input
                id="site-edit"
                placeholder="https://lovable.dev/..."
                value={form.editUrl}
                onChange={(e) => set("editUrl", e.target.value)}
                className="bg-background/50 border-border/50"
              />
            </div>

            <div className="col-span-2 space-y-1.5">
              <Label className="text-sm">Tags</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Ex: landing, e-commerce..."
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
                  className="bg-background/50 border-border/50 flex-1"
                />
                <Button type="button" variant="outline" size="sm" onClick={addTag} className="border-border/50 shrink-0">
                  Adicionar
                </Button>
              </div>
              {form.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {form.tags.map((tag) => (
                    <span key={tag} className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                      <Tag className="w-2.5 h-2.5" />
                      {tag}
                      <button onClick={() => removeTag(tag)} className="hover:text-destructive transition-colors">
                        <X className="w-2.5 h-2.5" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 pt-2">
          <Button variant="outline" className="border-border/50" onClick={handleClose}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} className="gap-2">
            <Plus className="w-4 h-4" />
            Adicionar Site
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function StatCard({ title, value, className = "text-foreground" }: { title: string; value: number; className?: string }) {
  const count = useCountUp(value);
  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-xl">
      <CardContent className="p-4 flex flex-col items-center text-center">
        <p className="text-xs font-medium text-muted-foreground mb-1">{title}</p>
        <p className={`text-2xl font-bold tabular-nums ${className}`}>{count}</p>
      </CardContent>
    </Card>
  );
}

export default function Sites() {
  const { filter, setSearch, setStatus, setPlatform, clearFilters, filteredSites, stats } = useSitesStore();
  const [rawSearch, setRawSearch] = useState(filter.search);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [addOpen, setAddOpen] = useState(false);
  const debouncedSearch = useDebounce(rawSearch, 300);

  useEffect(() => {
    setSearch(debouncedSearch);
  }, [debouncedSearch, setSearch]);

  const sites = filteredSites();
  const s = stats();
  const hasFilters = filter.search || filter.status !== "all" || filter.platform !== "all";

  const activePlatforms = PLATFORMS.filter((p) => p === "all" || useSitesStore.getState().sites.some((s) => s.platform === p));

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sites</h1>
          <p className="text-muted-foreground text-sm">Gerencie todos os sites e aplicações dos clientes.</p>
        </div>
        <PermissionGuard action="sites.create" tooltip="Apenas Admin, Gerente de Conta e Dev podem adicionar sites.">
          <Button data-testid="btn-add-site" className="gap-2" onClick={() => setAddOpen(true)}>
            <Plus className="w-4 h-4" /> Adicionar Site
          </Button>
        </PermissionGuard>
      </div>

      <AddSiteDialog open={addOpen} onClose={() => setAddOpen(false)} />

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <StatCard title="Total" value={s.total} />
        <StatCard title="Ativos" value={s.active} className="text-emerald-400" />
        <StatCard title="Em Desenvolvimento" value={s.development} className="text-blue-400" />
        <StatCard title="Manutenção" value={s.maintenance} className="text-yellow-400" />
        <StatCard title="Pausados" value={s.paused} className="text-muted-foreground" />
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-52">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, URL, cliente ou tag..."
              value={rawSearch}
              onChange={(e) => setRawSearch(e.target.value)}
              className="pl-9 pr-8 bg-background/50 border-border/50 h-9"
              data-testid="input-search-sites"
            />
            {rawSearch && (
              <button
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => { setRawSearch(""); setSearch(""); }}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className={`h-9 gap-2 border-border/50 ${filter.status !== "all" ? "border-primary/50 text-primary" : ""}`}>
                  <Filter className="w-3.5 h-3.5" />
                  {filter.status === "all" ? "Status" : getStatusLabel(filter.status as SiteStatus)}
                  <ChevronDown className="w-3 h-3 opacity-60" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-40">
                {STATUSES.map((s) => (
                  <DropdownMenuItem
                    key={s.value}
                    className={`cursor-pointer text-sm ${filter.status === s.value ? "text-primary font-medium" : ""}`}
                    onClick={() => setStatus(s.value as SiteStatus | "all")}
                  >
                    {s.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className={`h-9 gap-2 border-border/50 ${filter.platform !== "all" ? "border-primary/50 text-primary" : ""}`}>
                  <Globe className="w-3.5 h-3.5" />
                  {filter.platform === "all" ? "Plataforma" : filter.platform}
                  <ChevronDown className="w-3 h-3 opacity-60" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-44">
                {activePlatforms.map((p) => (
                  <DropdownMenuItem
                    key={p}
                    className={`cursor-pointer text-sm ${filter.platform === p ? "text-primary font-medium" : ""}`}
                    onClick={() => setPlatform(p as SitePlatform | "all")}
                  >
                    {p === "all" ? "Todas" : p}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {hasFilters && (
              <Button variant="ghost" size="sm" className="h-9 text-muted-foreground hover:text-foreground gap-1.5" onClick={() => { clearFilters(); setRawSearch(""); }}>
                <X className="w-3.5 h-3.5" />
                Limpar
              </Button>
            )}
          </div>

          <div className="flex items-center gap-1 ml-auto border border-border/50 rounded-lg p-0.5">
            <Button
              variant={view === "grid" ? "secondary" : "ghost"}
              size="icon"
              className="h-7 w-7"
              onClick={() => setView("grid")}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </Button>
            <Button
              variant={view === "list" ? "secondary" : "ghost"}
              size="icon"
              className="h-7 w-7"
              onClick={() => setView("list")}
            >
              <List className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>

        {filter.status !== "all" || filter.platform !== "all" ? (
          <div className="flex items-center gap-2 flex-wrap">
            {filter.status !== "all" && (
              <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border font-medium ${getStatusColor(filter.status as SiteStatus)}`}>
                {getStatusLabel(filter.status as SiteStatus)}
                <button onClick={() => setStatus("all")}><X className="w-3 h-3" /></button>
              </span>
            )}
            {filter.platform !== "all" && (
              <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border font-medium ${getPlatformColor(filter.platform)}`}>
                {filter.platform}
                <button onClick={() => setPlatform("all")}><X className="w-3 h-3" /></button>
              </span>
            )}
          </div>
        ) : null}
      </div>

      {sites.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
          <Globe className="w-14 h-14 text-muted-foreground/20" />
          <p className="text-muted-foreground">Nenhum site encontrado para os critérios informados.</p>
          {hasFilters && (
            <Button variant="outline" size="sm" onClick={() => { clearFilters(); setRawSearch(""); }}>
              Limpar filtros
            </Button>
          )}
        </div>
      ) : view === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {sites.map((site) => (
            <SiteCard key={site.id} site={site} />
          ))}
        </div>
      ) : (
        <Card className="border-border/50 bg-card/50 backdrop-blur-xl overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground bg-muted/20 uppercase border-b border-border/50">
                <tr>
                  <th className="px-4 py-3 font-medium">Site & URL</th>
                  <th className="px-4 py-3 font-medium">Cliente</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Plataforma</th>
                  <th className="px-4 py-3 font-medium">Métricas</th>
                  <th className="px-4 py-3 font-medium text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {sites.map((site) => (
                  <SiteRow key={site.id} site={site} />
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {sites.length > 0 && (
        <p className="text-xs text-muted-foreground text-center pb-2">
          Exibindo {sites.length} de {useSitesStore.getState().sites.length} sites
        </p>
      )}
    </div>
  );
}
