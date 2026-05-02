import { useState } from "react";
import { useListTeamMembers } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { UserPlus, Mail, Briefcase, Shield, CheckCircle2, XCircle } from "lucide-react";
import { PermissionGuard } from "@/components/PermissionGuard";
import { useAuthStore } from "@/store/useAuthStore";
import {
  Role,
  NavModule,
  Action,
  ROLE_LABELS,
  ROLE_COLORS,
  DEFAULT_PERMISSIONS,
  PermissionMatrix,
} from "@/lib/permissions";

const ALL_ROLES: Role[] = [
  "admin",
  "account_manager",
  "traffic_manager",
  "designer",
  "developer",
  "financial",
  "client_viewer",
];

const MODULE_LABELS: Record<NavModule, string> = {
  dashboard: "Dashboard",
  sites: "Sites",
  projects: "Projetos",
  clients: "Clientes",
  team: "Equipe",
  financial: "Financeiro",
  tools: "Ferramentas",
};

const ACTION_LABELS: Record<Action, string> = {
  "sites.create": "Criar Sites",
  "sites.edit": "Editar Sites",
  "sites.delete": "Excluir Sites",
  "projects.create": "Criar Projetos",
  "projects.edit": "Editar Projetos",
  "projects.delete": "Excluir Projetos",
  "clients.create": "Criar Clientes",
  "clients.edit": "Editar Clientes",
  "clients.delete": "Excluir Clientes",
  "team.invite": "Convidar Membros",
  "team.edit_permissions": "Editar Permissões",
  "financial.create": "Criar Faturas",
  "financial.edit": "Editar Faturas",
  "financial.delete": "Excluir Faturas",
  "tools.create": "Adicionar Ferramentas",
  "tools.edit": "Editar Ferramentas",
  "tools.toggle": "Ativar/Desativar Ferramentas",
  "tools.delete": "Excluir Ferramentas",
};

const ACTION_GROUPS: { label: string; actions: Action[] }[] = [
  {
    label: "Sites",
    actions: ["sites.create", "sites.edit", "sites.delete"],
  },
  {
    label: "Projetos",
    actions: ["projects.create", "projects.edit", "projects.delete"],
  },
  {
    label: "Clientes",
    actions: ["clients.create", "clients.edit", "clients.delete"],
  },
  {
    label: "Equipe",
    actions: ["team.invite", "team.edit_permissions"],
  },
  {
    label: "Financeiro",
    actions: ["financial.create", "financial.edit", "financial.delete"],
  },
  {
    label: "Ferramentas",
    actions: ["tools.create", "tools.edit", "tools.toggle", "tools.delete"],
  },
];

export default function Team() {
  const [activeTab, setActiveTab] = useState<"members" | "permissions">("members");
  const { data: team, isLoading } = useListTeamMembers();
  const { permissions, updatePermissions, can } = useAuthStore();

  const canEditPermissions = can("team.edit_permissions");

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin": return "bg-red-500/10 text-red-500 border-red-500/20";
      case "account_manager": return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "developer": return "bg-purple-500/10 text-purple-500 border-purple-500/20";
      case "designer": return "bg-pink-500/10 text-pink-500 border-pink-500/20";
      default: return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
    }
  };

  const translateRole = (role: string) => ROLE_LABELS[role as Role] ?? role;

  const translateStatus = (status: string) => {
    switch (status) {
      case "active": return "Ativo";
      case "invited": return "Convidado";
      case "inactive": return "Inativo";
      default: return status;
    }
  };

  const toggleModulePermission = (module: NavModule, role: Role) => {
    if (!canEditPermissions) return;
    const current = permissions.modules[module] ?? [];
    const updated = current.includes(role)
      ? current.filter((r) => r !== role)
      : [...current, role];
    updatePermissions({
      ...permissions,
      modules: { ...permissions.modules, [module]: updated },
    });
  };

  const toggleActionPermission = (action: Action, role: Role) => {
    if (!canEditPermissions) return;
    const current = permissions.actions[action] ?? [];
    const updated = current.includes(role)
      ? current.filter((r) => r !== role)
      : [...current, role];
    updatePermissions({
      ...permissions,
      actions: { ...permissions.actions, [action]: updated },
    });
  };

  const resetPermissions = () => {
    updatePermissions(DEFAULT_PERMISSIONS);
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Equipe</h1>
          <p className="text-muted-foreground text-sm">Gerencie membros, cargos e acessos da agência.</p>
        </div>
        <PermissionGuard action="team.invite" tooltip="Apenas o Administrador pode convidar novos membros.">
          <Button data-testid="btn-invite-team" className="gap-2">
            <UserPlus className="w-4 h-4" /> Convidar Membro
          </Button>
        </PermissionGuard>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-muted/30 rounded-lg border border-border/50 w-fit">
        <button
          onClick={() => setActiveTab("members")}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
            activeTab === "members"
              ? "bg-card text-foreground shadow-sm border border-border/50"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <UserPlus className="w-4 h-4" />
          Membros
        </button>
        <button
          onClick={() => setActiveTab("permissions")}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
            activeTab === "permissions"
              ? "bg-card text-foreground shadow-sm border border-border/50"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Shield className="w-4 h-4" />
          Permissões
          {!canEditPermissions && (
            <Badge variant="outline" className="text-[9px] px-1.5 py-0 ml-1 text-muted-foreground border-border">
              só leitura
            </Badge>
          )}
        </button>
      </div>

      {/* ── Tab: Membros ── */}
      {activeTab === "members" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {isLoading ? (
            Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-64 w-full rounded-xl" />
            ))
          ) : team?.length === 0 ? (
            <div className="col-span-full py-12 text-center text-muted-foreground">
              <p>Nenhum membro encontrado.</p>
            </div>
          ) : (
            team?.map((member) => (
              <Card
                key={member.id}
                className="border-border/50 bg-card/50 backdrop-blur-xl hover:border-primary/30 transition-all flex flex-col overflow-hidden group"
              >
                <div className="h-16 bg-muted/20 w-full relative">
                  {member.status === "inactive" && (
                    <div className="absolute inset-0 bg-background/50 backdrop-blur-[1px] z-10" />
                  )}
                </div>
                <CardContent className="px-5 pb-5 pt-0 flex-1 flex flex-col items-center text-center relative">
                  <div className="w-20 h-20 rounded-full border-4 border-card bg-primary/10 -mt-10 mb-3 flex items-center justify-center text-2xl font-bold text-primary overflow-hidden relative z-20 shadow-sm">
                    {member.avatarUrl ? (
                      <img
                        src={member.avatarUrl}
                        alt={member.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      member.name.charAt(0)
                    )}
                  </div>

                  <h3 className="font-semibold text-lg leading-tight">{member.name}</h3>
                  <Badge
                    variant="outline"
                    className={`mt-2 mb-4 px-2.5 py-0.5 text-[10px] tracking-wider font-semibold ${getRoleColor(member.role)}`}
                  >
                    {translateRole(member.role)}
                  </Badge>

                  <div className="w-full space-y-2.5 text-sm text-muted-foreground mt-auto bg-muted/10 p-3 rounded-lg border border-border/30">
                    <div className="flex items-center gap-2 justify-center">
                      <Mail className="w-3.5 h-3.5 opacity-70" />
                      <span className="truncate text-xs">{member.email}</span>
                    </div>
                    <div className="flex items-center justify-between px-1">
                      <span className="flex items-center gap-1.5 text-xs">
                        <Briefcase className="w-3.5 h-3.5 opacity-70" /> Projetos
                      </span>
                      <span className="font-medium text-foreground">{member.activeProjects || 0}</span>
                    </div>
                    <div className="flex items-center justify-between px-1">
                      <span className="text-xs">Status</span>
                      <span
                        className={`text-xs font-medium ${
                          member.status === "active"
                            ? "text-emerald-500"
                            : member.status === "invited"
                            ? "text-yellow-500"
                            : "text-muted-foreground"
                        }`}
                      >
                        {translateStatus(member.status)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* ── Tab: Permissões ── */}
      {activeTab === "permissions" && (
        <div className="flex flex-col gap-6">
          {/* Banner de aviso se não for admin */}
          {!canEditPermissions && (
            <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/20 border border-border/50 text-sm text-muted-foreground">
              <Shield className="w-4 h-4 shrink-0 text-primary/60" />
              Você está visualizando as permissões em modo somente leitura. Apenas o Administrador pode editá-las.
            </div>
          )}

          {/* Acesso aos Módulos */}
          <Card className="border-border/50 bg-card/50 backdrop-blur-xl">
            <CardHeader className="border-b border-border/50 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-semibold">Acesso aos Módulos</CardTitle>
                  <p className="text-xs text-muted-foreground mt-1">Quais seções do sistema cada perfil pode visualizar</p>
                </div>
                {canEditPermissions && (
                  <Button variant="outline" size="sm" onClick={resetPermissions} className="text-xs border-border/50">
                    Restaurar padrão
                  </Button>
                )}
              </div>
            </CardHeader>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/50">
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider w-40">
                      Módulo
                    </th>
                    {ALL_ROLES.map((role) => (
                      <th key={role} className="px-3 py-3 text-center">
                        <Badge
                          variant="outline"
                          className={`text-[10px] px-2 py-0.5 whitespace-nowrap ${ROLE_COLORS[role]}`}
                        >
                          {ROLE_LABELS[role].split(" ")[0]}
                        </Badge>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {(Object.keys(MODULE_LABELS) as NavModule[]).map((module) => (
                    <tr key={module} className="hover:bg-muted/5">
                      <td className="px-6 py-3 font-medium text-foreground">
                        {MODULE_LABELS[module]}
                      </td>
                      {ALL_ROLES.map((role) => {
                        const hasAccess = permissions.modules[module]?.includes(role);
                        return (
                          <td key={role} className="px-3 py-3 text-center">
                            {canEditPermissions ? (
                              <div className="flex justify-center">
                                <Switch
                                  checked={!!hasAccess}
                                  onCheckedChange={() => toggleModulePermission(module, role)}
                                  disabled={role === "admin"}
                                  className="scale-75"
                                />
                              </div>
                            ) : hasAccess ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-500 mx-auto" />
                            ) : (
                              <XCircle className="w-4 h-4 text-muted-foreground/30 mx-auto" />
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Permissões de Ações */}
          {ACTION_GROUPS.map((group) => (
            <Card key={group.label} className="border-border/50 bg-card/50 backdrop-blur-xl">
              <CardHeader className="border-b border-border/30 py-3 px-6">
                <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  {group.label}
                </CardTitle>
              </CardHeader>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/30">
                      <th className="px-6 py-2 text-left text-xs font-medium text-muted-foreground w-48">
                        Ação
                      </th>
                      {ALL_ROLES.map((role) => (
                        <th key={role} className="px-3 py-2 text-center">
                          <span className="text-[10px] text-muted-foreground/70 font-medium">
                            {ROLE_LABELS[role].split(" ")[0]}
                          </span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/20">
                    {group.actions.map((action) => (
                      <tr key={action} className="hover:bg-muted/5">
                        <td className="px-6 py-2.5 text-sm text-foreground/80">
                          {ACTION_LABELS[action]}
                        </td>
                        {ALL_ROLES.map((role) => {
                          const hasAccess = permissions.actions[action]?.includes(role);
                          return (
                            <td key={role} className="px-3 py-2.5 text-center">
                              {canEditPermissions ? (
                                <div className="flex justify-center">
                                  <Switch
                                    checked={!!hasAccess}
                                    onCheckedChange={() => toggleActionPermission(action, role)}
                                    disabled={role === "admin"}
                                    className="scale-75"
                                  />
                                </div>
                              ) : hasAccess ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-500 mx-auto" />
                              ) : (
                                <XCircle className="w-4 h-4 text-muted-foreground/30 mx-auto" />
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
