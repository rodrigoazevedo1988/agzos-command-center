import { useListProjects, useGetProjectsSummary } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, ListFilter, Calendar } from "lucide-react";
import { PermissionGuard } from "@/components/PermissionGuard";

export default function Projects() {
  const { data: projects, isLoading } = useListProjects({});
  const { data: summary, isLoading: summaryLoading } = useGetProjectsSummary();

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent": return "bg-red-500/10 text-red-500 border-red-500/20";
      case "high": return "bg-orange-500/10 text-orange-500 border-orange-500/20";
      case "medium": return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "low": return "bg-muted text-muted-foreground border-border";
      default: return "bg-muted text-muted-foreground border-border";
    }
  };

  const translatePriority = (priority: string) => {
    switch (priority) {
      case "urgent": return "URGENTE";
      case "high": return "ALTO";
      case "medium": return "MÉDIO";
      case "low": return "BAIXO";
      default: return priority.toUpperCase();
    }
  };

  const translateStatus = (status: string) => {
    switch (status) {
      case "planning": return "Planejamento";
      case "active": return "Em Andamento";
      case "review": return "Em Revisão";
      case "completed": return "Concluído";
      case "paused": return "Pausado";
      case "cancelled": return "Cancelado";
      default: return status;
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Projetos</h1>
          <p className="text-muted-foreground text-sm">Acompanhe projetos, tarefas e prazos da agência.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2 border-border/50 bg-background/50">
            <ListFilter className="w-4 h-4" /> Filtrar
          </Button>
          <PermissionGuard action="projects.create" tooltip="Apenas Admin, Gerente de Conta e Gestor de Tráfego podem criar projetos.">
            <Button data-testid="btn-add-project" className="gap-2">
              <Plus className="w-4 h-4" /> Novo Projeto
            </Button>
          </PermissionGuard>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="Total de Projetos" value={summary?.total} loading={summaryLoading} />
        <StatCard title="Em Andamento" value={summary?.byStatus?.active} loading={summaryLoading} className="text-primary" />
        <StatCard title="Concluídos (Mês)" value={summary?.completedThisMonth} loading={summaryLoading} className="text-emerald-500" />
        <StatCard title="Atrasados" value={summary?.overdue} loading={summaryLoading} className="text-destructive" />
      </div>

      <div className="grid grid-cols-1 gap-4">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-xl" />
          ))
        ) : projects?.length === 0 ? (
          <Card className="border-border/50 bg-card/50 backdrop-blur-xl border-dashed">
            <div className="py-12 text-center text-muted-foreground">
              <p>Nenhum projeto encontrado.</p>
            </div>
          </Card>
        ) : (
          projects?.map((project) => (
            <Card
              key={project.id}
              className="border-border/50 bg-card/50 backdrop-blur-xl hover:border-primary/50 transition-colors group cursor-pointer overflow-hidden relative"
            >
              <div className="absolute top-0 left-0 w-1 h-full bg-border group-hover:bg-primary transition-colors" />
              <CardContent className="p-5 flex flex-col md:flex-row gap-6 md:items-center">
                <div className="flex-1 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-lg">{project.name}</h3>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                        {project.description || "Sem descrição"}
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className={`ml-4 shrink-0 uppercase text-[10px] tracking-wider px-2 py-0.5 ${getPriorityColor(project.priority)}`}
                    >
                      {translatePriority(project.priority)}
                    </Badge>
                  </div>

                  <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-muted-foreground">
                    {project.clientName && (
                      <span className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary/50" />
                        {project.clientName}
                      </span>
                    )}
                    {project.assigneeName && (
                      <span className="flex items-center gap-1.5">
                        <div className="w-4 h-4 rounded-full bg-muted flex items-center justify-center text-[8px] font-bold text-foreground">
                          {project.assigneeName.charAt(0)}
                        </div>
                        {project.assigneeName}
                      </span>
                    )}
                    {project.dueDate && (
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(project.dueDate).toLocaleDateString("pt-BR")}
                      </span>
                    )}
                  </div>
                </div>

                <div className="w-full md:w-64 shrink-0 space-y-2">
                  <div className="flex justify-between items-end text-sm">
                    <span className="font-medium text-foreground">
                      {translateStatus(project.status)}
                    </span>
                    <span className="text-muted-foreground text-xs">{project.progress}%</span>
                  </div>
                  <Progress value={project.progress} className="h-2 bg-muted/30" />
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
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
