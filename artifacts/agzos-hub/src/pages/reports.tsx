import { useState, useRef } from "react";
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, LineChart, Line,
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  Legend, RadarChart, Radar, PolarGrid, PolarAngleAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp, TrendingDown, Download, FileSpreadsheet, FileText,
  DollarSign, Users, Target, Briefcase, ArrowUpRight, ArrowDownRight,
  BarChart2, PieChart as PieIcon, Activity, Printer, Loader2,
} from "lucide-react";
import { useReportsStore, ReportPeriod } from "@/store/useReportsStore";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const BRL = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0 });

const PCT = (v: number) => `${v > 0 ? "+" : ""}${v.toFixed(1)}%`;

const TOOLTIP_STYLE = {
  backgroundColor: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
  borderRadius: 8,
  color: "hsl(var(--foreground))",
  fontSize: 12,
};

const STATUS_META: Record<string, { label: string; cls: string }> = {
  active:   { label: "Ativo",    cls: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" },
  at_risk:  { label: "Em Risco", cls: "bg-amber-500/15 text-amber-400 border-amber-500/30" },
  churned:  { label: "Inativo",  cls: "bg-red-500/15 text-red-400 border-red-500/30" },
};

// ─── Period selector ──────────────────────────────────────────────────────────

const PERIODS: { value: ReportPeriod; label: string }[] = [
  { value: "3m", label: "3 meses" },
  { value: "6m", label: "6 meses" },
  { value: "12m", label: "12 meses" },
  { value: "ytd", label: "Ano atual" },
];

function PeriodSelector({ value, onChange }: { value: ReportPeriod; onChange: (p: ReportPeriod) => void }) {
  return (
    <div className="flex rounded-lg border border-border/50 overflow-hidden bg-card">
      {PERIODS.map((p) => (
        <button
          key={p.value}
          onClick={() => onChange(p.value)}
          className={`px-3 py-1.5 text-xs font-medium transition-colors ${
            value === p.value
              ? "bg-primary text-white"
              : "text-muted-foreground hover:text-foreground hover:bg-accent/30"
          }`}
        >
          {p.label}
        </button>
      ))}
    </div>
  );
}

// ─── KPI card ─────────────────────────────────────────────────────────────────

function KpiCard({
  title, value, sub, growth, icon: Icon, accent = false,
}: {
  title: string; value: string; sub?: string; growth?: number;
  icon: React.ElementType; accent?: boolean;
}) {
  const up = growth !== undefined && growth >= 0;
  return (
    <Card className={`border-border/50 bg-card/60 backdrop-blur ${accent ? "border-primary/40 bg-primary/5" : ""}`}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className={`p-2 rounded-lg ${accent ? "bg-primary/20" : "bg-accent/30"}`}>
            <Icon className={`w-4 h-4 ${accent ? "text-primary" : "text-muted-foreground"}`} />
          </div>
          {growth !== undefined && (
            <span className={`flex items-center gap-0.5 text-xs font-medium ${up ? "text-emerald-400" : "text-red-400"}`}>
              {up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
              {PCT(growth)}
            </span>
          )}
        </div>
        <p className="text-2xl font-bold tracking-tight">{value}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{title}</p>
        {sub && <p className="text-[10px] text-muted-foreground/60 mt-0.5">{sub}</p>}
      </CardContent>
    </Card>
  );
}

// ─── Revenue forecast chart ───────────────────────────────────────────────────

function RevenueForecastChart() {
  const getMonthlyData = useReportsStore((s) => s.getMonthlyData);
  const data = getMonthlyData();

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="gradActual" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#A855F7" stopOpacity={0.35} />
            <stop offset="95%" stopColor="#A855F7" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="gradProjected" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10B981" stopOpacity={0.25} />
            <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="gradCost" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#EF4444" stopOpacity={0.2} />
            <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
        <YAxis axisLine={false} tickLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} />
        <RechartsTooltip
          contentStyle={TOOLTIP_STYLE}
          formatter={(v: number, name: string) => [BRL(v), name === "actual" ? "Receita Real" : name === "projected" ? "Previsão" : "Custo"]}
        />
        <Legend formatter={(v) => v === "actual" ? "Receita Real" : v === "projected" ? "Previsão" : "Custo"} />
        <Area type="monotone" dataKey="actual" stroke="#A855F7" strokeWidth={2} fill="url(#gradActual)" dot={false} />
        <Area type="monotone" dataKey="projected" stroke="#10B981" strokeWidth={2} strokeDasharray="5 3" fill="url(#gradProjected)" dot={false} />
        <Area type="monotone" dataKey="cost" stroke="#EF4444" strokeWidth={1.5} fill="url(#gradCost)" dot={false} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

// ─── Client performance bar chart ─────────────────────────────────────────────

function ClientBarChart() {
  const clients = useReportsStore((s) => s.clients);
  const data = clients.filter((c) => c.status !== "churned").map((c) => ({
    name: c.client.split(" ")[0],
    Receita: c.revenue,
    Custo: c.cost,
  }));

  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
        <YAxis axisLine={false} tickLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} />
        <RechartsTooltip contentStyle={TOOLTIP_STYLE} formatter={(v: number) => BRL(v)} />
        <Legend />
        <Bar dataKey="Receita" fill="#A855F7" radius={[4, 4, 0, 0]} />
        <Bar dataKey="Custo" fill="#EC4899" radius={[4, 4, 0, 0]} opacity={0.7} />
      </BarChart>
    </ResponsiveContainer>
  );
}

// ─── Channel pie + bar ────────────────────────────────────────────────────────

function ChannelDonut() {
  const channels = useReportsStore((s) => s.channels);
  const data = channels.map((c) => ({ name: c.channel, value: c.revenue, color: c.color }));
  const total = data.reduce((a, c) => a + c.value, 0);

  return (
    <div className="relative">
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={data} cx="50%" cy="50%" innerRadius={55} outerRadius={85}
            paddingAngle={2} dataKey="value"
          >
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.color} opacity={0.9} />
            ))}
          </Pie>
          <RechartsTooltip
            contentStyle={TOOLTIP_STYLE}
            formatter={(v: number) => [BRL(v), "Receita"]}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="text-xs text-muted-foreground">Total</span>
        <span className="text-sm font-bold">{BRL(total)}</span>
      </div>
    </div>
  );
}

function ChannelRoiBar() {
  const channels = useReportsStore((s) => s.channels);
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={channels} layout="vertical" margin={{ top: 5, right: 10, left: 60, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
        <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} unit="%" />
        <YAxis type="category" dataKey="channel" axisLine={false} tickLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} width={60} />
        <RechartsTooltip contentStyle={TOOLTIP_STYLE} formatter={(v: number) => [`${v}%`, "ROI"]} />
        <Bar dataKey="roi" radius={[0, 4, 4, 0]}>
          {channels.map((c, i) => <Cell key={i} fill={c.color} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

// ─── Radar performance ────────────────────────────────────────────────────────

function PerformanceRadar() {
  const data = [
    { metric: "Receita", A: 92, B: 75 },
    { metric: "ROI", A: 88, B: 72 },
    { metric: "Leads", A: 76, B: 80 },
    { metric: "Conversão", A: 84, B: 65 },
    { metric: "Retenção", A: 78, B: 90 },
    { metric: "NPS", A: 90, B: 70 },
  ];
  return (
    <ResponsiveContainer width="100%" height={220}>
      <RadarChart data={data}>
        <PolarGrid stroke="hsl(var(--border))" />
        <PolarAngleAxis dataKey="metric" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
        <Radar name="Este trimestre" dataKey="A" stroke="#A855F7" fill="#A855F7" fillOpacity={0.3} />
        <Radar name="Trimestre anterior" dataKey="B" stroke="#10B981" fill="#10B981" fillOpacity={0.2} />
        <Legend />
      </RadarChart>
    </ResponsiveContainer>
  );
}

// ─── Client ROI table ─────────────────────────────────────────────────────────

function ClientRoiTable() {
  const clients = useReportsStore((s) => s.clients);
  const exportCsv = useReportsStore((s) => s.exportCsv);

  return (
    <Card className="border-border/50 bg-card/60">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="w-4 h-4 text-primary" /> Performance por Cliente
          </CardTitle>
          <Button size="sm" variant="outline" className="gap-1.5 text-xs border-border/50 h-7" onClick={() => exportCsv("clients")}>
            <FileSpreadsheet className="w-3.5 h-3.5" /> Exportar CSV
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/40">
                {["Cliente", "Receita", "Custo", "ROI", "Projetos", "Status"].map((h) => (
                  <th key={h} className="px-4 py-2.5 text-left text-xs text-muted-foreground font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {clients.map((c, i) => {
                const meta = STATUS_META[c.status];
                return (
                  <tr key={i} className="border-b border-border/20 hover:bg-accent/20 transition-colors">
                    <td className="px-4 py-3 font-medium">{c.client}</td>
                    <td className="px-4 py-3 text-emerald-400 font-mono">{BRL(c.revenue)}</td>
                    <td className="px-4 py-3 text-red-400 font-mono">{BRL(c.cost)}</td>
                    <td className="px-4 py-3">
                      <span className={`font-mono font-semibold ${c.roi >= 100 ? "text-emerald-400" : c.roi >= 0 ? "text-amber-400" : "text-red-400"}`}>
                        {c.roi >= 0 ? "+" : ""}{c.roi.toFixed(1)}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">{c.projects}</td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className={`text-[10px] px-1.5 h-5 ${meta.cls}`}>{meta.label}</Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Channel table ────────────────────────────────────────────────────────────

function ChannelTable() {
  const channels = useReportsStore((s) => s.channels);
  const exportCsv = useReportsStore((s) => s.exportCsv);

  return (
    <Card className="border-border/50 bg-card/60">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Target className="w-4 h-4 text-primary" /> Performance por Canal
          </CardTitle>
          <Button size="sm" variant="outline" className="gap-1.5 text-xs border-border/50 h-7" onClick={() => exportCsv("channels")}>
            <FileSpreadsheet className="w-3.5 h-3.5" /> Exportar CSV
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/40">
                {["Canal", "Investimento", "Receita", "Leads", "Conversões", "ROI"].map((h) => (
                  <th key={h} className="px-4 py-2.5 text-left text-xs text-muted-foreground font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {channels.map((c, i) => (
                <tr key={i} className="border-b border-border/20 hover:bg-accent/20 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{c.icon}</span>
                      <span className="font-medium">{c.channel}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-red-400 font-mono">{BRL(c.spend)}</td>
                  <td className="px-4 py-3 text-emerald-400 font-mono">{BRL(c.revenue)}</td>
                  <td className="px-4 py-3 text-center">{c.leads.toLocaleString("pt-BR")}</td>
                  <td className="px-4 py-3 text-center">{c.conversions}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 rounded-full flex-1 bg-border/40 overflow-hidden max-w-16">
                        <div className="h-full rounded-full" style={{ width: `${Math.min(c.roi / 5, 100)}%`, backgroundColor: c.color }} />
                      </div>
                      <span className="font-mono font-semibold text-emerald-400 text-xs">{c.roi.toFixed(0)}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── PDF export helper ────────────────────────────────────────────────────────

async function generatePDF(
  reportRef: React.RefObject<HTMLDivElement>,
  kpis: ReturnType<typeof useReportsStore.getState>["kpis"],
  period: ReportPeriod,
  setPdfLoading: (v: boolean) => void
) {
  setPdfLoading(true);
  try {
    const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
      import("jspdf"),
      import("html2canvas"),
    ]);

    const PERIOD_LABELS: Record<ReportPeriod, string> = {
      "3m": "Últimos 3 meses", "6m": "Últimos 6 meses",
      "12m": "Últimos 12 meses", "ytd": "Ano atual",
    };

    const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const W = pdf.internal.pageSize.getWidth();
    const H = pdf.internal.pageSize.getHeight();
    const now = new Date();
    const dateStr = now.toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });

    // ── Cover page ──────────────────────────────────────────────
    pdf.setFillColor(10, 10, 10);
    pdf.rect(0, 0, W, H, "F");

    // Accent bar
    pdf.setFillColor(168, 85, 247);
    pdf.rect(0, 0, 6, H, "F");

    // Title
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(28);
    pdf.setFont("helvetica", "bold");
    pdf.text("Relatório de Performance", 16, 60);

    pdf.setFontSize(13);
    pdf.setTextColor(168, 85, 247);
    pdf.setFont("helvetica", "normal");
    pdf.text("Agzos Hub — Sistema de Gestão de Agência", 16, 72);

    pdf.setFontSize(11);
    pdf.setTextColor(180, 180, 180);
    pdf.text(`Período: ${PERIOD_LABELS[period]}`, 16, 84);
    pdf.text(`Gerado em: ${dateStr}`, 16, 91);

    // KPI summary boxes
    const kpiItems = [
      { label: "Receita Total", value: BRL(kpis.totalRevenue), color: [168, 85, 247] as [number,number,number] },
      { label: "ROI Médio",     value: `${kpis.averageRoi.toFixed(1)}%`,  color: [16, 185, 129] as [number,number,number] },
      { label: "Clientes Ativos", value: String(kpis.activeClients), color: [59, 130, 246] as [number,number,number] },
      { label: "Projetos Entregues", value: String(kpis.deliveredProjects), color: [234, 179, 8] as [number,number,number] },
    ];
    const boxW = (W - 32 - 9) / 4;
    kpiItems.forEach((item, i) => {
      const x = 16 + i * (boxW + 3);
      const y = 108;
      pdf.setFillColor(30, 30, 30);
      pdf.roundedRect(x, y, boxW, 28, 2, 2, "F");
      pdf.setFillColor(...item.color);
      pdf.roundedRect(x, y, boxW, 2.5, 1, 1, "F");
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(13);
      pdf.setFont("helvetica", "bold");
      pdf.text(item.value, x + 4, y + 16);
      pdf.setFontSize(7);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(170, 170, 170);
      pdf.text(item.label, x + 4, y + 23);
    });

    // Divider
    pdf.setDrawColor(50, 50, 50);
    pdf.setLineWidth(0.5);
    pdf.line(16, 145, W - 16, 145);

    pdf.setTextColor(120, 120, 120);
    pdf.setFontSize(8);
    pdf.text("Este relatório foi gerado automaticamente pelo Agzos Hub.", 16, 152);
    pdf.text("Todos os dados refletem o estado atual do sistema.", 16, 158);

    // Footer on cover
    pdf.setFontSize(7);
    pdf.setTextColor(80, 80, 80);
    pdf.text(`Agzos Hub  •  agzos.agency  •  ${dateStr}`, W / 2, H - 8, { align: "center" });

    // ── Content pages (snapshot of DOM) ─────────────────────────
    if (reportRef.current) {
      pdf.addPage();

      const canvas = await html2canvas(reportRef.current, {
        backgroundColor: "#0a0a0a",
        scale: 1.5,
        useCORS: true,
        logging: false,
        windowWidth: 1200,
      });

      const imgData = canvas.toDataURL("image/jpeg", 0.85);
      const ratio = canvas.width / canvas.height;
      const imgW = W - 20;
      const imgH = imgW / ratio;
      const pageContentH = H - 20;
      let yPos = 10;
      let remaining = imgH;
      let srcY = 0;

      while (remaining > 0) {
        const sliceH = Math.min(remaining, pageContentH);
        const srcH = (sliceH / imgH) * canvas.height;

        // Create a slice canvas
        const sliceCanvas = document.createElement("canvas");
        sliceCanvas.width = canvas.width;
        sliceCanvas.height = srcH;
        const ctx = sliceCanvas.getContext("2d")!;
        ctx.drawImage(canvas, 0, srcY, canvas.width, srcH, 0, 0, canvas.width, srcH);
        const sliceData = sliceCanvas.toDataURL("image/jpeg", 0.85);

        pdf.addImage(sliceData, "JPEG", 10, yPos, imgW, sliceH);
        remaining -= sliceH;
        srcY += srcH;
        if (remaining > 0) {
          pdf.addPage();
          yPos = 10;
        }
      }

      // Footer on all pages
      const totalPages = pdf.getNumberOfPages();
      for (let pg = 1; pg <= totalPages; pg++) {
        pdf.setPage(pg);
        pdf.setFontSize(7);
        pdf.setTextColor(80, 80, 80);
        pdf.text(`Agzos Hub  •  ${dateStr}  •  Página ${pg} de ${totalPages}`, W / 2, H - 4, { align: "center" });
      }
    }

    const filename = `agzos-relatorio-${period}-${now.getFullYear()}${String(now.getMonth()+1).padStart(2,"0")}.pdf`;
    pdf.save(filename);
  } catch (err) {
    console.error("PDF error:", err);
  } finally {
    setPdfLoading(false);
  }
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function Reports() {
  const { kpis, period, setPeriod, exportCsv } = useReportsStore();
  const [activeTab, setActiveTab] = useState<"overview" | "clients" | "channels" | "forecast">("overview");
  const [pdfLoading, setPdfLoading] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  const tabs = [
    { id: "overview",  label: "Visão Geral",  icon: BarChart2 },
    { id: "clients",   label: "Clientes",     icon: Users },
    { id: "channels",  label: "Canais",       icon: PieIcon },
    { id: "forecast",  label: "Previsão",     icon: TrendingUp },
  ] as const;

  return (
    <div className="space-y-6 pb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Relatórios</h1>
          <p className="text-muted-foreground text-sm">Análise de performance, ROI e previsão de receita.</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <PeriodSelector value={period} onChange={setPeriod} />
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs border-border/50"
            disabled={pdfLoading}
            onClick={() => generatePDF(reportRef, kpis, period, setPdfLoading)}
          >
            {pdfLoading
              ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Gerando PDF...</>
              : <><FileText className="w-3.5 h-3.5" /> Exportar PDF</>
            }
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5 text-xs border-border/50" onClick={() => exportCsv("revenue")}>
            <FileSpreadsheet className="w-3.5 h-3.5" /> Exportar CSV
          </Button>
        </div>
      </div>

      {/* Capturable content for PDF */}
      <div ref={reportRef}>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard title="Receita Total" value={BRL(kpis.totalRevenue)} growth={kpis.revenueGrowth} icon={DollarSign} accent />
        <KpiCard title="ROI Médio" value={`${kpis.averageRoi.toFixed(1)}%`} growth={kpis.roiGrowth} icon={TrendingUp} />
        <KpiCard title="Clientes Ativos" value={String(kpis.activeClients)} sub="De 8 cadastrados" icon={Users} />
        <KpiCard title="Projetos Entregues" value={String(kpis.deliveredProjects)} sub={`Previsão +R$ ${(kpis.forecastNext3m / 1000).toFixed(0)}k`} icon={Briefcase} />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border/50 pb-0">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id as any)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === t.id
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <t.icon className="w-3.5 h-3.5" />
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab: Overview */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="lg:col-span-2 border-border/50 bg-card/60">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Activity className="w-4 h-4 text-primary" /> Receita vs Custo Mensal
                </CardTitle>
              </CardHeader>
              <CardContent><RevenueForecastChart /></CardContent>
            </Card>

            <Card className="border-border/50 bg-card/60">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <BarChart2 className="w-4 h-4 text-primary" /> Performance Geral
                </CardTitle>
              </CardHeader>
              <CardContent><PerformanceRadar /></CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="border-border/50 bg-card/60">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Users className="w-4 h-4 text-primary" /> Receita por Cliente
                </CardTitle>
              </CardHeader>
              <CardContent><ClientBarChart /></CardContent>
            </Card>

            <Card className="border-border/50 bg-card/60">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <PieIcon className="w-4 h-4 text-primary" /> Mix de Canais
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-2 items-center">
                <ChannelDonut />
                <div className="space-y-1.5">
                  {useReportsStore.getState().channels.map((c, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: c.color }} />
                      <span className="text-muted-foreground truncate">{c.channel}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Tab: Clients */}
      {activeTab === "clients" && (
        <div className="space-y-4">
          <ClientRoiTable />
          <Card className="border-border/50 bg-card/60">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-primary" /> Receita vs Custo por Cliente
              </CardTitle>
            </CardHeader>
            <CardContent><ClientBarChart /></CardContent>
          </Card>
        </div>
      )}

      {/* Tab: Channels */}
      {activeTab === "channels" && (
        <div className="space-y-4">
          <ChannelTable />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="border-border/50 bg-card/60">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <PieIcon className="w-4 h-4 text-primary" /> Distribuição de Receita
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 items-center gap-4">
                <ChannelDonut />
                <div className="space-y-2">
                  {useReportsStore.getState().channels.map((c, i) => (
                    <div key={i} className="space-y-0.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: c.color }} />
                          {c.channel}
                        </span>
                        <span className="text-muted-foreground">{((c.revenue / useReportsStore.getState().channels.reduce((a, x) => a + x.revenue, 0)) * 100).toFixed(0)}%</span>
                      </div>
                      <div className="h-1 rounded-full bg-border/40">
                        <div className="h-full rounded-full" style={{ width: `${((c.revenue / useReportsStore.getState().channels.reduce((a, x) => a + x.revenue, 0)) * 100).toFixed(0)}%`, backgroundColor: c.color }} />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-card/60">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-primary" /> ROI por Canal
                </CardTitle>
              </CardHeader>
              <CardContent><ChannelRoiBar /></CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Tab: Forecast */}
      {activeTab === "forecast" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Card className="border-primary/30 bg-primary/5">
              <CardContent className="p-5">
                <p className="text-xs text-muted-foreground mb-1">Previsão próximos 3 meses</p>
                <p className="text-2xl font-bold text-primary">{BRL(kpis.forecastNext3m)}</p>
                <p className="text-xs text-muted-foreground mt-0.5">Baseado na tendência atual</p>
              </CardContent>
            </Card>
            <Card className="border-border/50 bg-card/60">
              <CardContent className="p-5">
                <p className="text-xs text-muted-foreground mb-1">Crescimento YoY estimado</p>
                <p className="text-2xl font-bold text-emerald-400">+{kpis.revenueGrowth}%</p>
                <p className="text-xs text-muted-foreground mt-0.5">vs. mesmo período anterior</p>
              </CardContent>
            </Card>
            <Card className="border-border/50 bg-card/60">
              <CardContent className="p-5">
                <p className="text-xs text-muted-foreground mb-1">Meta de receita anual</p>
                <p className="text-2xl font-bold">R$ 1,2M</p>
                <div className="mt-2 h-1.5 rounded-full bg-border/40">
                  <div className="h-full w-[63%] rounded-full bg-primary" />
                </div>
                <p className="text-xs text-muted-foreground mt-1">63% atingido (R$ 751k)</p>
              </CardContent>
            </Card>
          </div>

          <Card className="border-border/50 bg-card/60">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-primary" /> Projeção de Receita — 12 meses
                </CardTitle>
                <Button size="sm" variant="outline" className="gap-1.5 text-xs border-border/50 h-7" onClick={() => exportCsv("revenue")}>
                  <FileSpreadsheet className="w-3.5 h-3.5" /> Exportar
                </Button>
              </div>
            </CardHeader>
            <CardContent><RevenueForecastChart /></CardContent>
          </Card>
        </div>
      )}

      </div>{/* end reportRef */}
    </div>
  );
}
