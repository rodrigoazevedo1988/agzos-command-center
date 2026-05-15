import {
  LayoutDashboard, Globe, LayoutList, Users, UsersRound,
  DollarSign, Wrench, CalendarDays, Activity, BarChart2,
  Settings, Bell, type LucideIcon,
} from "lucide-react";
import type { NavModule } from "@/lib/permissions";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  module: NavModule;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

export const NAV_GROUPS: NavGroup[] = [
  {
    label: "Painel",
    items: [
      { href: "/", label: "Dashboard", icon: LayoutDashboard, module: "dashboard" },
    ],
  },
  {
    label: "Operações",
    items: [
      { href: "/sites",     label: "Sites",      icon: Globe,        module: "sites" },
      { href: "/projects",  label: "Projetos",   icon: LayoutList,   module: "projects" },
      { href: "/clients",   label: "Clientes",   icon: Users,        module: "clients" },
      { href: "/calendar",  label: "Calendário", icon: CalendarDays, module: "calendar" },
    ],
  },
  {
    label: "Gestão",
    items: [
      { href: "/team",      label: "Equipe",       icon: UsersRound, module: "team" },
      { href: "/financial", label: "Financeiro",   icon: DollarSign, module: "financial" },
      { href: "/tools",     label: "Ferramentas",  icon: Wrench,     module: "tools" },
      { href: "/reports",   label: "Relatórios",   icon: BarChart2,  module: "reports" },
    ],
  },
  {
    label: "Sistema",
    items: [
      { href: "/activity",  label: "Atividade",      icon: Activity, module: "activity" },
      { href: "/settings",  label: "Configurações",  icon: Settings, module: "settings" },
    ],
  },
];

export const NOTIF_ITEM: NavItem = {
  href: "/notifications",
  label: "Notificações",
  icon: Bell,
  module: "dashboard", // visível para todos
};
