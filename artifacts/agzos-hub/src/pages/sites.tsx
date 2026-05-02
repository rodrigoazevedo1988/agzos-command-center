import { useState } from "react";
import { useListSites, useGetSiteStats, SiteStatus } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Plus, ExternalLink, MoreVertical, Globe, Settings, Activity, PauseCircle } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PermissionGuard } from "@/components/PermissionGuard";

export default function Sites() {
  const [search, setSearch] = useState("");
  const { data: sites, isLoading } = useListSites({ search: search || undefined });
  const { data: stats, isLoading: statsLoading } = useGetSiteStats();

  const getStatusColor = (status: SiteStatus) => {
    switch (status) {
      case "active": return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
      case "development": return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "maintenance": return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      case "paused": return "bg-muted text-muted-foreground border-border";
      default: return "bg-muted text-muted-foreground border-border";
    }
  };

  const getStatusLabel = (status: SiteStatus) => {
    switch (status) {
      case "active": return "Ativo";
      case "development": return "Em Desenvolvimento";
      case "maintenance": return "Manutenção";
      case "paused": return "Pausado";
      default: return status;
    }
  };

  const getStatusIcon = (status: SiteStatus) => {
    switch (status) {
      case "active": return <Activity className="w-3 h-3 mr-1" />;
      case "development": return <Settings className="w-3 h-3 mr-1" />;
      case "maintenance": return <Settings className="w-3 h-3 mr-1" />;
      case "paused": return <PauseCircle className="w-3 h-3 mr-1" />;
      default: return null;
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sites</h1>
          <p className="text-muted-foreground text-sm">Gerencie todos os sites e aplicações dos clientes.</p>
        </div>
        <PermissionGuard action="sites.create" tooltip="Apenas Admin, Gerente de Conta e Dev podem adicionar sites.">
          <Button data-testid="btn-add-site" className="gap-2">
            <Plus className="w-4 h-4" /> Adicionar Site
          </Button>
        </PermissionGuard>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatCard title="Total" value={stats?.total} loading={statsLoading} />
        <StatCard title="Ativos" value={stats?.active} loading={statsLoading} className="text-emerald-500" />
        <StatCard title="Em Desenvolvimento" value={stats?.development} loading={statsLoading} className="text-blue-500" />
        <StatCard title="Manutenção" value={stats?.maintenance} loading={statsLoading} className="text-yellow-500" />
        <StatCard title="Pausados" value={stats?.paused} loading={statsLoading} className="text-muted-foreground" />
      </div>

      <Card className="border-border/50 bg-card/50 backdrop-blur-xl">
        <div className="p-4 border-b border-border/50 flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar sites..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-background/50 border-border/50"
              data-testid="input-search-sites"
            />
          </div>
        </div>

        <div className="p-0 overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground bg-muted/20 uppercase border-b border-border/50">
              <tr>
                <th className="px-6 py-4 font-medium">Site & URL</th>
                <th className="px-6 py-4 font-medium">Cliente</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Plataforma</th>
                <th className="px-6 py-4 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td className="px-6 py-4"><Skeleton className="h-5 w-48" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-5 w-32" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-6 w-24 rounded-full" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-5 w-20" /></td>
                    <td className="px-6 py-4 text-right"><Skeleton className="h-8 w-8 ml-auto rounded-md" /></td>
                  </tr>
                ))
              ) : sites?.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                    <Globe className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    <p>Nenhum site encontrado para os critérios informados.</p>
                  </td>
                </tr>
              ) : (
                sites?.map((site) => (
                  <tr key={site.id} className="hover:bg-muted/10 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="font-medium text-foreground">{site.name}</div>
                      <a
                        href={site.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1 mt-1 w-fit"
                      >
                        {site.url.replace(/^https?:\/\//, "")}
                        <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </a>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {site.clientName || "—"}
                    </td>
                    <td className="px-6 py-4">
                      <Badge
                        variant="outline"
                        className={`px-2.5 py-0.5 rounded-full font-medium ${getStatusColor(site.status)}`}
                      >
                        {getStatusIcon(site.status)}
                        <span>{getStatusLabel(site.status)}</span>
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {site.platform || "—"}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            data-testid={`btn-site-actions-${site.id}`}
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44">
                          <PermissionGuard action="sites.edit" tooltip="Sem permissão para editar." hide>
                            <DropdownMenuItem className="cursor-pointer">
                              Editar detalhes
                            </DropdownMenuItem>
                          </PermissionGuard>
                          {site.adminUrl && (
                            <DropdownMenuItem
                              className="cursor-pointer"
                              onClick={() => window.open(site.adminUrl, "_blank")}
                            >
                              Abrir Admin
                            </DropdownMenuItem>
                          )}
                          <PermissionGuard action="sites.delete" tooltip="Sem permissão para excluir." hide>
                            <DropdownMenuItem className="text-destructive cursor-pointer focus:bg-destructive focus:text-destructive-foreground">
                              Excluir site
                            </DropdownMenuItem>
                          </PermissionGuard>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function StatCard({
  title,
  value,
  loading,
  className = "text-foreground",
}: {
  title: string;
  value?: number;
  loading: boolean;
  className?: string;
}) {
  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-xl">
      <CardContent className="p-4 flex flex-col items-center text-center">
        <p className="text-xs font-medium text-muted-foreground mb-1">{title}</p>
        {loading ? (
          <Skeleton className="h-7 w-12" />
        ) : (
          <p className={`text-2xl font-bold ${className}`}>{value || 0}</p>
        )}
      </CardContent>
    </Card>
  );
}
