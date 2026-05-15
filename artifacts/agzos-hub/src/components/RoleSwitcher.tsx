import { useAuthStore } from "@/store/useAuthStore";
import { Role, ROLE_LABELS, ROLE_COLORS } from "@/lib/permissions";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, FlaskConical, X } from "lucide-react";

const ALL_ROLES: Role[] = [
  "admin",
  "account_manager",
  "traffic_manager",
  "designer",
  "developer",
  "financial",
  "client_viewer",
];

export function RoleSwitcher() {
  const user = useAuthStore((s) => s.user);
  const simulatedRole = useAuthStore((s) => s.simulatedRole);
  const simulateRole = useAuthStore((s) => s.simulateRole);
  const effectiveRole = useAuthStore((s) => s.effectiveRole);

  // Só admins reais podem ver o simulador
  if (!user || user.role !== "admin") return null;

  const current = effectiveRole() ?? user.role;
  const isSimulating = simulatedRole !== null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-colors text-xs font-medium ${
          isSimulating
            ? "border-amber-500/40 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20"
            : "border-dashed border-primary/40 bg-primary/5 hover:bg-primary/10 text-primary/80 hover:text-primary"
        }`}>
          <FlaskConical className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Testar Role:</span>
          <span className="font-bold">{ROLE_LABELS[current]}</span>
          <ChevronDown className="w-3 h-3 opacity-60" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuLabel className="text-xs text-muted-foreground flex items-center gap-1.5">
          <FlaskConical className="w-3 h-3" /> Simulador de Perfil
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {ALL_ROLES.map((role) => (
          <DropdownMenuItem
            key={role}
            className="cursor-pointer flex items-center justify-between"
            onClick={() => simulateRole(role === user.role ? null : role)}
          >
            <span className="text-sm">{ROLE_LABELS[role]}</span>
            {current === role && (
              <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${ROLE_COLORS[role]}`}>
                {isSimulating && role !== user.role ? "simulando" : "ativo"}
              </Badge>
            )}
          </DropdownMenuItem>
        ))}
        {isSimulating && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="cursor-pointer flex items-center gap-2 text-amber-400 hover:text-amber-300"
              onClick={() => simulateRole(null)}
            >
              <X className="w-3.5 h-3.5" />
              <span className="text-sm">Sair da simulação</span>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
