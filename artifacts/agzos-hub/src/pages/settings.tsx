import { useState } from "react";
import {
  Settings, Key, Puzzle, Palette, Bell, Save, Eye, EyeOff,
  CheckCircle2, AlertCircle, Clock, RefreshCw, ExternalLink,
  Shield, Brush, Globe, Mail,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useSettingsStore } from "@/store/useSettingsStore";
import { useAuthStore } from "@/store/useAuthStore";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function timeAgo(iso: string) {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return "agora";
  if (diff < 3600) return `${Math.floor(diff / 60)}min atrás`;
  return `${Math.floor(diff / 3600)}h atrás`;
}

const STATUS_META = {
  connected: { icon: CheckCircle2, cls: "text-emerald-400", label: "Conectado" },
  error:     { icon: AlertCircle,  cls: "text-red-400",     label: "Erro" },
  pending:   { icon: Clock,        cls: "text-amber-400",   label: "Pendente" },
};

const CATEGORY_LABELS: Record<string, string> = {
  analytics: "Analytics",
  ads: "Publicidade",
  crm: "CRM",
  communication: "Comunicação",
  storage: "Armazenamento",
  payment: "Pagamentos",
};

// ─── Section wrapper ──────────────────────────────────────────────────────────

function Section({ id, icon: Icon, title, description, children }: {
  id: string; icon: React.ElementType; title: string; description: string;
  children: React.ReactNode;
}) {
  return (
    <Card id={id} className="border-border/50 bg-card/60 scroll-mt-6">
      <CardHeader className="pb-3 border-b border-border/40">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Icon className="w-4 h-4 text-primary" />
          </div>
          <div>
            <CardTitle className="text-base">{title}</CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-4">{children}</CardContent>
    </Card>
  );
}

// ─── API Key row ──────────────────────────────────────────────────────────────

function ApiKeyRow({ apiKey }: { apiKey: ReturnType<typeof useSettingsStore.getState>["apiKeys"][0] }) {
  const updateApiKey = useSettingsStore((s) => s.updateApiKey);
  const [visible, setVisible] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(apiKey.key);

  const meta = STATUS_META[apiKey.status];

  function mask(k: string) {
    if (k.length <= 8) return "••••••••";
    return k.slice(0, 4) + "••••••••" + k.slice(-4);
  }

  return (
    <div className="flex items-start gap-3 py-3 border-b border-border/30 last:border-0">
      <div className="text-xl shrink-0 mt-0.5">{apiKey.icon}</div>
      <div className="flex-1 min-w-0 space-y-1.5">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium">{apiKey.service}</span>
          <Badge variant="outline" className={`text-[10px] px-1.5 h-4 border-current/30 ${meta.cls}`}>
            <meta.icon className="w-2.5 h-2.5 mr-0.5" />{meta.label}
          </Badge>
          <span className="text-[10px] text-muted-foreground/60">Verificado {timeAgo(apiKey.lastChecked)}</span>
        </div>
        <p className="text-xs text-muted-foreground">{apiKey.label}</p>
        {editing ? (
          <div className="flex items-center gap-2 mt-1">
            <Input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              className="h-7 text-xs font-mono bg-background/50 border-border/50 flex-1"
              placeholder="Cole a chave de API aqui..."
            />
            <Button size="sm" className="h-7 text-xs px-2" onClick={() => { updateApiKey(apiKey.id, draft); setEditing(false); }}>
              Salvar
            </Button>
            <Button size="sm" variant="ghost" className="h-7 text-xs px-2" onClick={() => { setDraft(apiKey.key); setEditing(false); }}>
              Cancelar
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2 mt-1">
            <code className="text-xs text-muted-foreground font-mono bg-background/40 px-2 py-0.5 rounded">
              {visible ? apiKey.key : mask(apiKey.key)}
            </code>
            <button onClick={() => setVisible((v) => !v)} className="text-muted-foreground hover:text-foreground transition-colors">
              {visible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
          </div>
        )}
      </div>
      {!editing && (
        <Button size="sm" variant="outline" className="h-7 text-xs border-border/50 shrink-0" onClick={() => setEditing(true)}>
          Editar
        </Button>
      )}
    </div>
  );
}

// ─── Integration row ──────────────────────────────────────────────────────────

function IntegrationRow({ integration }: { integration: ReturnType<typeof useSettingsStore.getState>["integrations"][0] }) {
  const toggleIntegration = useSettingsStore((s) => s.toggleIntegration);
  const updateIntegrationWebhook = useSettingsStore((s) => s.updateIntegrationWebhook);
  const [webhookDraft, setWebhookDraft] = useState(integration.webhookUrl || "");
  const [editingWebhook, setEditingWebhook] = useState(false);

  return (
    <div className="flex items-start gap-3 py-3 border-b border-border/30 last:border-0">
      <div className="text-xl shrink-0 mt-0.5">{integration.icon}</div>
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium">{integration.name}</span>
          <Badge variant="outline" className="text-[10px] px-1.5 h-4 border-border/40 text-muted-foreground">
            {CATEGORY_LABELS[integration.category]}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground">{integration.description}</p>
        {integration.webhookUrl !== undefined && integration.enabled && (
          <div>
            {editingWebhook ? (
              <div className="flex items-center gap-2 mt-1">
                <Input
                  value={webhookDraft}
                  onChange={(e) => setWebhookDraft(e.target.value)}
                  className="h-6 text-[10px] font-mono bg-background/50 border-border/50 flex-1"
                  placeholder="https://hooks.slack.com/..."
                />
                <Button size="sm" className="h-6 text-[10px] px-2" onClick={() => { updateIntegrationWebhook(integration.id, webhookDraft); setEditingWebhook(false); }}>
                  OK
                </Button>
              </div>
            ) : (
              <button className="text-[10px] text-muted-foreground hover:text-primary flex items-center gap-1 mt-0.5" onClick={() => setEditingWebhook(true)}>
                <ExternalLink className="w-3 h-3" /> Editar Webhook URL
              </button>
            )}
          </div>
        )}
      </div>
      <Switch
        checked={integration.enabled}
        onCheckedChange={() => toggleIntegration(integration.id)}
        className="shrink-0 mt-0.5"
      />
    </div>
  );
}

// ─── Sidebar nav ──────────────────────────────────────────────────────────────

const SECTIONS = [
  { id: "branding",       label: "Identidade",     icon: Brush },
  { id: "api-keys",       label: "API Keys",        icon: Key },
  { id: "integrations",   label: "Integrações",     icon: Puzzle },
  { id: "notifications",  label: "Notificações",    icon: Bell },
  { id: "security",       label: "Segurança",       icon: Shield },
];

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const { apiKeys, integrations, branding, notificationSettings, updateBranding, updateNotificationSettings } = useSettingsStore();
  const user = useAuthStore((s) => s.user);
  const [activeSection, setActiveSection] = useState("branding");
  const [saved, setSaved] = useState(false);

  function handleSaveBranding() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const grouped = integrations.reduce((acc, i) => {
    (acc[i.category] = acc[i.category] || []).push(i);
    return acc;
  }, {} as Record<string, typeof integrations>);

  return (
    <div className="space-y-6 pb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
        <p className="text-muted-foreground text-sm">Gerencie a identidade, integrações e segurança da agência.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-6">
        {/* Sidebar */}
        <nav className="space-y-1 lg:sticky lg:top-20 h-fit">
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              onClick={() => {
                setActiveSection(s.id);
                document.getElementById(s.id)?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-left ${
                activeSection === s.id
                  ? "bg-primary/15 text-primary"
                  : "text-muted-foreground hover:bg-accent/30 hover:text-foreground"
              }`}
            >
              <s.icon className="w-4 h-4 shrink-0" />
              {s.label}
            </button>
          ))}
        </nav>

        {/* Sections */}
        <div className="space-y-6">
          {/* Branding */}
          <Section id="branding" icon={Brush} title="Identidade da Agência" description="Informações públicas e personalizações visuais.">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs">Nome da Agência</Label>
                <Input
                  value={branding.agencyName}
                  onChange={(e) => updateBranding({ agencyName: e.target.value })}
                  className="bg-background/50 border-border/50"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Tagline</Label>
                <Input
                  value={branding.tagline}
                  onChange={(e) => updateBranding({ tagline: e.target.value })}
                  className="bg-background/50 border-border/50"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Website</Label>
                <Input
                  value={branding.website}
                  onChange={(e) => updateBranding({ website: e.target.value })}
                  className="bg-background/50 border-border/50"
                  placeholder="https://"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">E-mail de Suporte</Label>
                <Input
                  value={branding.supportEmail}
                  onChange={(e) => updateBranding({ supportEmail: e.target.value })}
                  className="bg-background/50 border-border/50"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Cor Principal</Label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={branding.primaryColor}
                    onChange={(e) => updateBranding({ primaryColor: e.target.value })}
                    className="w-10 h-9 rounded border border-border/50 cursor-pointer bg-transparent"
                  />
                  <Input
                    value={branding.primaryColor}
                    onChange={(e) => updateBranding({ primaryColor: e.target.value })}
                    className="bg-background/50 border-border/50 font-mono"
                    placeholder="#A855F7"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Fuso Horário</Label>
                <Select value={branding.timezone} onValueChange={(v) => updateBranding({ timezone: v })}>
                  <SelectTrigger className="bg-background/50 border-border/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="America/Sao_Paulo">America/São Paulo (BRT)</SelectItem>
                    <SelectItem value="America/Manaus">America/Manaus (AMT)</SelectItem>
                    <SelectItem value="America/Fortaleza">America/Fortaleza (BRT)</SelectItem>
                    <SelectItem value="Europe/Lisbon">Europe/Lisbon (WET)</SelectItem>
                    <SelectItem value="America/New_York">America/New York (EST)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Moeda</Label>
                <Select value={branding.currency} onValueChange={(v) => updateBranding({ currency: v })}>
                  <SelectTrigger className="bg-background/50 border-border/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BRL">BRL — Real Brasileiro</SelectItem>
                    <SelectItem value="USD">USD — Dólar Americano</SelectItem>
                    <SelectItem value="EUR">EUR — Euro</SelectItem>
                    <SelectItem value="GBP">GBP — Libra Esterlina</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Idioma</Label>
                <Select value={branding.language} onValueChange={(v) => updateBranding({ language: v })}>
                  <SelectTrigger className="bg-background/50 border-border/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
                    <SelectItem value="pt-PT">Português (Portugal)</SelectItem>
                    <SelectItem value="en-US">English (US)</SelectItem>
                    <SelectItem value="es">Español</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end mt-4">
              <Button onClick={handleSaveBranding} className="gap-2">
                {saved ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                {saved ? "Salvo!" : "Salvar Identidade"}
              </Button>
            </div>
          </Section>

          {/* API Keys */}
          <Section id="api-keys" icon={Key} title="Chaves de API" description="Conecte serviços externos. As chaves são mascaradas por segurança.">
            <div className="divide-y divide-border/30">
              {apiKeys.map((k) => <ApiKeyRow key={k.id} apiKey={k} />)}
            </div>
            <div className="mt-3 p-3 rounded-lg bg-amber-500/5 border border-amber-500/20 flex items-start gap-2">
              <Shield className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-300/80">
                Nunca compartilhe chaves de API. Elas são armazenadas localmente e nunca enviadas a servidores externos nesta versão.
              </p>
            </div>
          </Section>

          {/* Integrations */}
          <Section id="integrations" icon={Puzzle} title="Integrações" description="Ative e configure conexões com ferramentas externas.">
            <div className="space-y-6">
              {Object.entries(grouped).map(([category, items]) => (
                <div key={category}>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">{CATEGORY_LABELS[category]}</p>
                  <div className="divide-y divide-border/30 rounded-lg border border-border/40 overflow-hidden">
                    {items.map((i) => <IntegrationRow key={i.id} integration={i} />)}
                  </div>
                </div>
              ))}
            </div>
          </Section>

          {/* Notification Settings */}
          <Section id="notifications" icon={Bell} title="Preferências de Notificação" description="Configure quando e como você quer ser notificado.">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs">Resumo por e-mail</Label>
                <Select
                  value={notificationSettings.emailDigest}
                  onValueChange={(v) => updateNotificationSettings({ emailDigest: v as any })}
                >
                  <SelectTrigger className="bg-background/50 border-border/50 max-w-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Diário</SelectItem>
                    <SelectItem value="weekly">Semanal</SelectItem>
                    <SelectItem value="none">Desativado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator className="border-border/40" />

              <div className="space-y-3">
                {[
                  { key: "overdueAlerts",    label: "Tarefas atrasadas", desc: "Alerta quando uma tarefa passa do prazo." },
                  { key: "newLeadAlerts",    label: "Novos leads", desc: "Alerta quando um novo lead entra no CRM." },
                  { key: "invoicePaidAlerts",label: "Fatura paga", desc: "Confirmação ao receber pagamento de cliente." },
                  { key: "deployAlerts",     label: "Deploy concluído", desc: "Notifica ao publicar um site ou app." },
                  { key: "mentionAlerts",    label: "Menções", desc: "Alerta quando alguém menciona você." },
                ].map(({ key, label, desc }) => (
                  <div key={key} className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium">{label}</p>
                      <p className="text-xs text-muted-foreground">{desc}</p>
                    </div>
                    <Switch
                      checked={notificationSettings[key as keyof typeof notificationSettings] as boolean}
                      onCheckedChange={(v) => updateNotificationSettings({ [key]: v })}
                    />
                  </div>
                ))}
              </div>
            </div>
          </Section>

          {/* Security */}
          <Section id="security" icon={Shield} title="Segurança" description="Informações de acesso e proteções da conta.">
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-4 py-2 border-b border-border/30">
                <div>
                  <p className="text-sm font-medium">Usuário atual</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                </div>
                <Badge variant="outline" className="text-xs">Administrador</Badge>
              </div>
              <div className="flex items-center justify-between gap-4 py-2 border-b border-border/30">
                <div>
                  <p className="text-sm font-medium">Autenticação em 2 fatores</p>
                  <p className="text-xs text-muted-foreground">Adicione uma camada extra de segurança.</p>
                </div>
                <Badge variant="outline" className="text-xs text-amber-400 border-amber-400/30 bg-amber-400/10">Não configurado</Badge>
              </div>
              <div className="flex items-center justify-between gap-4 py-2 border-b border-border/30">
                <div>
                  <p className="text-sm font-medium">Sessões ativas</p>
                  <p className="text-xs text-muted-foreground">1 dispositivo ativo no momento.</p>
                </div>
                <Button size="sm" variant="outline" className="text-xs border-border/50 h-7">Ver sessões</Button>
              </div>
              <div className="flex items-center justify-between gap-4 py-2">
                <div>
                  <p className="text-sm font-medium text-destructive">Revogar acesso</p>
                  <p className="text-xs text-muted-foreground">Encerrará todas as sessões ativas.</p>
                </div>
                <Button size="sm" variant="outline" className="text-xs border-destructive/40 text-destructive hover:bg-destructive/10 h-7">Revogar</Button>
              </div>
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
}
