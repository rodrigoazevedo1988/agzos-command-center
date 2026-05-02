import { useListClients, useGetClientFunnel } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Building2, Mail, Phone, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PermissionGuard } from "@/components/PermissionGuard";

export default function Clients() {
  const { data: clients, isLoading } = useListClients({});
  const { data: funnel, isLoading: funnelLoading } = useGetClientFunnel();

  const getStageColor = (stage: string) => {
    switch (stage) {
      case "active": return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
      case "lead": return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "proposal": return "bg-purple-500/10 text-purple-500 border-purple-500/20";
      case "contract": return "bg-orange-500/10 text-orange-500 border-orange-500/20";
      case "churned": return "bg-muted text-muted-foreground border-border";
      default: return "bg-muted text-muted-foreground border-border";
    }
  };

  const getStageLabel = (stage: string) => {
    switch (stage) {
      case "lead": return "Lead";
      case "proposal": return "Proposta";
      case "contract": return "Contrato";
      case "active": return "Ativo";
      case "churned": return "Cancelado";
      default: return stage;
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clientes</h1>
          <p className="text-muted-foreground text-sm">Gerencie relacionamentos e o funil de vendas.</p>
        </div>
        <PermissionGuard action="clients.create" tooltip="Apenas Admin e Gerente de Conta podem adicionar clientes.">
          <Button data-testid="btn-add-client" className="gap-2">
            <Plus className="w-4 h-4" /> Adicionar Cliente
          </Button>
        </PermissionGuard>
      </div>

      <Card className="border-border/50 bg-card/50 backdrop-blur-xl overflow-hidden">
        <div className="p-4 md:p-6 grid grid-cols-2 md:grid-cols-6 divide-x divide-y md:divide-y-0 divide-border/50 gap-y-4">
          <FunnelStat title="Leads" value={funnel?.lead} loading={funnelLoading} />
          <FunnelStat title="Propostas" value={funnel?.proposal} loading={funnelLoading} />
          <FunnelStat title="Contratos" value={funnel?.contract} loading={funnelLoading} />
          <FunnelStat title="Ativos" value={funnel?.active} loading={funnelLoading} className="text-emerald-500" />
          <FunnelStat title="Cancelados" value={funnel?.churned} loading={funnelLoading} className="text-muted-foreground" />
          <FunnelStat
            title="Pipeline Total"
            value={
              funnel?.totalPipelineValue
                ? `R$ ${funnel.totalPipelineValue.toLocaleString("pt-BR")}`
                : "R$ 0"
            }
            loading={funnelLoading}
            className="text-primary font-bold"
            isCurrency
          />
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-48 w-full rounded-xl" />
          ))
        ) : clients?.length === 0 ? (
          <div className="col-span-full py-12 text-center text-muted-foreground">
            <p>Nenhum cliente encontrado.</p>
          </div>
        ) : (
          clients?.map((client) => (
            <Card
              key={client.id}
              className="border-border/50 bg-card/50 backdrop-blur-xl hover:border-primary/30 transition-all group flex flex-col"
            >
              <CardHeader className="p-5 pb-0 flex flex-row items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold overflow-hidden">
                    {client.avatarUrl ? (
                      <img src={client.avatarUrl} alt={client.name} className="w-full h-full object-cover" />
                    ) : (
                      client.name.charAt(0)
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold leading-none">{client.name}</h3>
                    {client.companyName && (
                      <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                        <Building2 className="w-3 h-3" /> {client.companyName}
                      </p>
                    )}
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 -mr-2 -mt-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>Ver detalhes</DropdownMenuItem>
                    <PermissionGuard action="clients.edit" tooltip="Sem permissão para editar." hide>
                      <DropdownMenuItem>Editar cliente</DropdownMenuItem>
                    </PermissionGuard>
                    <PermissionGuard action="clients.delete" tooltip="Sem permissão para excluir." hide>
                      <DropdownMenuItem className="text-destructive">Excluir cliente</DropdownMenuItem>
                    </PermissionGuard>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardHeader>
              <CardContent className="p-5 pt-4 flex-1 flex flex-col">
                <div className="space-y-2 mb-4">
                  {client.email && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{client.email}</span>
                    </div>
                  )}
                  {client.phone && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{client.phone}</span>
                    </div>
                  )}
                </div>

                <div className="mt-auto pt-4 border-t border-border/50 flex items-center justify-between">
                  <Badge
                    variant="outline"
                    className={`px-2 py-0.5 text-xs font-medium ${getStageColor(client.stage)}`}
                  >
                    {getStageLabel(client.stage)}
                  </Badge>
                  {client.monthlyValue ? (
                    <div className="text-sm font-semibold">
                      R$ {client.monthlyValue.toLocaleString("pt-BR")}/mês
                    </div>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

function FunnelStat({
  title,
  value,
  loading,
  className = "text-foreground",
  isCurrency = false,
}: {
  title: string;
  value?: number | string;
  loading: boolean;
  className?: string;
  isCurrency?: boolean;
}) {
  return (
    <div className="flex flex-col items-center justify-center p-2 text-center">
      <span className="text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wider">
        {title}
      </span>
      {loading ? (
        <Skeleton className="h-6 w-16" />
      ) : (
        <span className={`text-xl font-bold ${className}`}>
          {value !== undefined ? value : isCurrency ? "R$ 0" : 0}
        </span>
      )}
    </div>
  );
}
