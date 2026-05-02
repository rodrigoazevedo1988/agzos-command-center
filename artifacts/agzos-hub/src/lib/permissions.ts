export type Role =
  | "admin"
  | "account_manager"
  | "traffic_manager"
  | "designer"
  | "developer"
  | "financial"
  | "client_viewer";

export const ROLE_LABELS: Record<Role, string> = {
  admin: "Administrador",
  account_manager: "Gerente de Conta",
  traffic_manager: "Gestor de Tráfego",
  designer: "Designer",
  developer: "Desenvolvedor",
  financial: "Financeiro",
  client_viewer: "Cliente (Visualização)",
};

export const ROLE_COLORS: Record<Role, string> = {
  admin: "bg-red-500/10 text-red-400 border-red-500/20",
  account_manager: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  traffic_manager: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  designer: "bg-pink-500/10 text-pink-400 border-pink-500/20",
  developer: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  financial: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  client_viewer: "bg-muted text-muted-foreground border-border",
};

export type NavModule =
  | "dashboard"
  | "sites"
  | "projects"
  | "clients"
  | "team"
  | "financial"
  | "tools"
  | "reports"
  | "settings"
  | "calendar";

export type Action =
  | "sites.create"
  | "sites.edit"
  | "sites.delete"
  | "projects.create"
  | "projects.edit"
  | "projects.delete"
  | "clients.create"
  | "clients.edit"
  | "clients.delete"
  | "team.invite"
  | "team.edit_permissions"
  | "financial.create"
  | "financial.edit"
  | "financial.delete"
  | "tools.create"
  | "tools.edit"
  | "tools.toggle"
  | "tools.delete";

export type PermissionMatrix = {
  modules: Record<NavModule, Role[]>;
  actions: Record<Action, Role[]>;
};

export const DEFAULT_PERMISSIONS: PermissionMatrix = {
  modules: {
    dashboard: ["admin", "account_manager", "traffic_manager", "designer", "developer", "financial", "client_viewer"],
    sites: ["admin", "account_manager", "designer", "developer", "client_viewer"],
    projects: ["admin", "account_manager", "traffic_manager", "designer", "developer", "client_viewer"],
    clients: ["admin", "account_manager", "financial"],
    team: ["admin", "account_manager"],
    financial: ["admin", "financial"],
    tools: ["admin", "developer", "designer", "traffic_manager"],
    reports: ["admin", "account_manager"],
    settings: ["admin"],
    calendar: ["admin", "account_manager", "traffic_manager", "designer", "developer", "financial", "client_viewer"],
  },
  actions: {
    "sites.create": ["admin", "account_manager", "developer"],
    "sites.edit": ["admin", "account_manager", "developer", "designer"],
    "sites.delete": ["admin"],
    "projects.create": ["admin", "account_manager", "traffic_manager"],
    "projects.edit": ["admin", "account_manager", "traffic_manager", "designer", "developer"],
    "projects.delete": ["admin"],
    "clients.create": ["admin", "account_manager"],
    "clients.edit": ["admin", "account_manager"],
    "clients.delete": ["admin"],
    "team.invite": ["admin"],
    "team.edit_permissions": ["admin"],
    "financial.create": ["admin", "financial"],
    "financial.edit": ["admin", "financial"],
    "financial.delete": ["admin"],
    "tools.create": ["admin", "developer"],
    "tools.edit": ["admin", "developer"],
    "tools.toggle": ["admin", "developer"],
    "tools.delete": ["admin"],
  },
};
