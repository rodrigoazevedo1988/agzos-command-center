import { useListTools } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, ExternalLink, Wrench, ShieldAlert } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { PermissionGuard } from "@/components/PermissionGuard";

export default function Tools() {
  const { data: tools, isLoading } = useListTools();

  const totalMonthlyCost =
    tools?.reduce((acc, tool) => {
      return acc + (tool.status === "active" ? tool.monthlyCost || 0 : 0);
    }, 0) || 0;

  const translateCategory = (category: string) => {
    switch (category) {
      case "advertising": return "Anúncios";
      case "analytics": return "Analytics";
      case "design": return "Design";
      case "development": return "Desenvolvimento";
      case "communication": return "Comunicação";
      case "finance": return "Financeiro";
      case "other": return "Outros";
      default: return category;
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Ferramentas</h1>
          <p className="text-muted-foreground text-sm">Gerencie assinaturas e credenciais de softwares.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-muted/30 px-4 py-2 rounded-lg border border-border/50 text-right">
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Custo Mensal</p>
            <p className="text-xl font-bold text-foreground">
              R$ {totalMonthlyCost.toLocaleString("pt-BR")}
            </p>
          </div>
          <PermissionGuard action="tools.create" tooltip="Apenas Admin e Dev podem adicionar ferramentas.">
            <Button data-testid="btn-add-tool" className="gap-2 h-14 px-6">
              <Plus className="w-4 h-4" /> Adicionar
            </Button>
          </PermissionGuard>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {isLoading ? (
          Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-44 w-full rounded-xl" />
          ))
        ) : tools?.length === 0 ? (
          <div className="col-span-full py-12 text-center text-muted-foreground">
            <Wrench className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p>Nenhuma ferramenta cadastrada.</p>
          </div>
        ) : (
          tools?.map((tool) => (
            <Card
              key={tool.id}
              className={`border-border/50 backdrop-blur-xl transition-all relative overflow-hidden ${
                tool.status === "inactive"
                  ? "bg-muted/10 opacity-70 grayscale-[0.5]"
                  : "bg-card/50 hover:border-primary/30"
              }`}
            >
              {tool.status === "inactive" && (
                <div className="absolute inset-0 bg-background/20 z-10 pointer-events-none" />
              )}
              <CardContent className="p-5 flex flex-col h-full relative z-20">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1 pr-4">
                    <h3 className="font-semibold text-lg leading-tight">{tool.name}</h3>
                    <Badge variant="secondary" className="mt-1.5 text-[10px] px-2 py-0">
                      {translateCategory(tool.category)}
                    </Badge>
                  </div>
                  <PermissionGuard
                    action="tools.toggle"
                    tooltip="Apenas Admin e Dev podem ativar/desativar ferramentas."
                  >
                    <Switch
                      checked={tool.status === "active"}
                      className="scale-75 origin-right"
                    />
                  </PermissionGuard>
                </div>

                <div className="space-y-2 mb-4 flex-1">
                  {tool.loginEmail && (
                    <div className="text-xs text-muted-foreground flex items-center gap-2 bg-muted/20 p-2 rounded-md border border-border/30">
                      <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{tool.loginEmail}</span>
                    </div>
                  )}
                  {(tool as any).notes && (
                    <p className="text-xs text-muted-foreground line-clamp-2">{(tool as any).notes}</p>
                  )}
                </div>

                <div className="flex items-center justify-between mt-auto pt-4 border-t border-border/50">
                  <span className="font-bold text-sm">
                    {tool.monthlyCost
                      ? `R$ ${Number(tool.monthlyCost).toLocaleString("pt-BR")}/mês`
                      : "Gratuito"}
                  </span>
                  {tool.url && (
                    <a
                      href={tool.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-primary hover:text-primary/80 transition-colors p-2 -mr-2"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
