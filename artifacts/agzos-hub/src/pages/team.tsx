import { useListTeamMembers } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { UserPlus, Mail, Briefcase } from "lucide-react";

export default function Team() {
  const { data: team, isLoading } = useListTeamMembers();

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin": return "bg-red-500/10 text-red-500 border-red-500/20";
      case "account_manager": return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "developer": return "bg-purple-500/10 text-purple-500 border-purple-500/20";
      case "designer": return "bg-pink-500/10 text-pink-500 border-pink-500/20";
      default: return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
    }
  };

  const translateRole = (role: string) => {
    switch (role) {
      case "admin": return "Administrador";
      case "account_manager": return "Gerente de Conta";
      case "traffic_manager": return "Gestor de Tráfego";
      case "designer": return "Designer";
      case "developer": return "Desenvolvedor";
      case "financial": return "Financeiro";
      case "client": return "Cliente";
      default: return role;
    }
  };

  const translateStatus = (status: string) => {
    switch (status) {
      case "active": return "Ativo";
      case "invited": return "Convidado";
      case "inactive": return "Inativo";
      default: return status;
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Equipe</h1>
          <p className="text-muted-foreground text-sm">Gerencie membros, cargos e acessos da agência.</p>
        </div>
        <Button data-testid="btn-invite-team" className="gap-2">
          <UserPlus className="w-4 h-4" /> Convidar Membro
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {isLoading ? (
          Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-64 w-full rounded-xl" />)
        ) : team?.length === 0 ? (
          <div className="col-span-full py-12 text-center text-muted-foreground">
            <p>Nenhum membro encontrado.</p>
          </div>
        ) : (
          team?.map((member) => (
            <Card key={member.id} className="border-border/50 bg-card/50 backdrop-blur-xl hover:border-primary/30 transition-all flex flex-col overflow-hidden group">
              <div className="h-16 bg-muted/20 w-full relative">
                {member.status === 'inactive' && <div className="absolute inset-0 bg-background/50 backdrop-blur-[1px] z-10" />}
              </div>
              <CardContent className="px-5 pb-5 pt-0 flex-1 flex flex-col items-center text-center relative">
                <div className="w-20 h-20 rounded-full border-4 border-card bg-primary/10 -mt-10 mb-3 flex items-center justify-center text-2xl font-bold text-primary overflow-hidden relative z-20 shadow-sm">
                  {member.avatarUrl ? (
                    <img src={member.avatarUrl} alt={member.name} className="w-full h-full object-cover" />
                  ) : (
                    member.name.charAt(0)
                  )}
                </div>
                
                <h3 className="font-semibold text-lg leading-tight">{member.name}</h3>
                <Badge variant="outline" className={`mt-2 mb-4 px-2.5 py-0.5 text-[10px] tracking-wider font-semibold ${getRoleColor(member.role)}`}>
                  {translateRole(member.role)}
                </Badge>
                
                <div className="w-full space-y-2.5 text-sm text-muted-foreground mt-auto bg-muted/10 p-3 rounded-lg border border-border/30">
                  <div className="flex items-center gap-2 justify-center">
                    <Mail className="w-3.5 h-3.5 opacity-70" />
                    <span className="truncate text-xs">{member.email}</span>
                  </div>
                  <div className="flex items-center justify-between px-1">
                    <span className="flex items-center gap-1.5 text-xs"><Briefcase className="w-3.5 h-3.5 opacity-70" /> Projetos</span>
                    <span className="font-medium text-foreground">{member.activeProjects || 0}</span>
                  </div>
                  <div className="flex items-center justify-between px-1">
                    <span className="text-xs">Status</span>
                    <span className={`text-xs font-medium ${member.status === 'active' ? 'text-emerald-500' : member.status === 'invited' ? 'text-yellow-500' : 'text-muted-foreground'}`}>
                      {translateStatus(member.status)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
