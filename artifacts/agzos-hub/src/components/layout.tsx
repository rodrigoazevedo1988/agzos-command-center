import { Link, useLocation } from "wouter";
import {
  LayoutDashboard, Globe, LayoutList, Users, UsersRound,
  DollarSign, Wrench, Menu, Bell, BarChart2, Settings,
  Search, Sun, Moon, CalendarDays, Activity,
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import type { AuthUser } from "@/store/useAuthStore";
import { ROLE_LABELS, ROLE_COLORS, NavModule } from "@/lib/permissions";
import { RoleSwitcher } from "@/components/RoleSwitcher";
import { NotificationBell } from "@/components/NotificationBell";
import { CommandPalette } from "@/components/CommandPalette";
import { useThemeStore } from "@/store/useThemeStore";
import { useNotificationsStore, selectUnreadCount } from "@/store/useNotificationsStore";

const NAV_ITEMS: { href: string; label: string; icon: any; module: NavModule }[] = [
  { href: "/",             label: "Dashboard",     icon: LayoutDashboard, module: "dashboard" },
  { href: "/sites",        label: "Sites",         icon: Globe,           module: "sites" },
  { href: "/projects",     label: "Projetos",      icon: LayoutList,      module: "projects" },
  { href: "/clients",      label: "Clientes",      icon: Users,           module: "clients" },
  { href: "/team",         label: "Equipe",        icon: UsersRound,      module: "team" },
  { href: "/financial",    label: "Financeiro",    icon: DollarSign,      module: "financial" },
  { href: "/tools",        label: "Ferramentas",   icon: Wrench,          module: "tools" },
  { href: "/calendar",     label: "Calendário",    icon: CalendarDays,    module: "calendar" },
  { href: "/activity",     label: "Atividade",     icon: Activity,        module: "activity" },
  { href: "/reports",      label: "Relatórios",    icon: BarChart2,       module: "reports" },
  { href: "/settings",     label: "Configurações", icon: Settings,        module: "settings" },
];

const NOTIF_NAV = { href: "/notifications", label: "Notificações", icon: Bell };

function NotifNavLink({ location, onNavigate }: { location: string; onNavigate: () => void }) {
  const unread = useNotificationsStore(selectUnreadCount);
  const isActive = location === NOTIF_NAV.href;
  return (
    <div className="px-4 pt-2 border-t border-sidebar-border/50 mt-2">
      <Link href={NOTIF_NAV.href} onClick={onNavigate}>
        <div
          className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors cursor-pointer text-sm font-medium ${
            isActive
              ? "bg-sidebar-accent text-sidebar-accent-foreground"
              : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
          }`}
        >
          <div className="relative">
            <NOTIF_NAV.icon className={`h-4 w-4 shrink-0 ${isActive ? "text-primary" : ""}`} />
            {unread > 0 && (
              <span className="absolute -top-1.5 -right-1.5 h-3.5 w-3.5 rounded-full bg-primary text-[9px] font-bold text-white flex items-center justify-center leading-none">
                {unread > 9 ? "9+" : unread}
              </span>
            )}
          </div>
          {NOTIF_NAV.label}
          {unread > 0 && (
            <Badge className="ml-auto bg-primary/20 text-primary border-primary/30 text-[10px] px-1.5 py-0 h-4">
              {unread}
            </Badge>
          )}
        </div>
      </Link>
    </div>
  );
}

function SidebarNav({
  visibleItems, location, user, onNavigate,
}: {
  visibleItems: typeof NAV_ITEMS; location: string; user: AuthUser; onNavigate: () => void;
}) {
  return (
    <div className="flex flex-col gap-2 p-4 h-full bg-sidebar border-r border-sidebar-border">
      <div className="px-2 py-4 mb-2">
        <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent tracking-tight">
          Agzos Hub
        </h1>
        <p className="text-xs text-sidebar-foreground/40 mt-0.5">Sistema Interno</p>
      </div>

      <nav className="flex flex-col gap-1 flex-1 overflow-y-auto">
        {visibleItems.map((item) => {
          const isActive =
            location === item.href ||
            (item.href !== "/" && location.startsWith(item.href));
          return (
            <Link key={item.href} href={item.href} onClick={onNavigate}>
              <div
                className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors cursor-pointer text-sm font-medium ${
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                }`}
                data-testid={`nav-${item.label.toLowerCase()}`}
              >
                <item.icon className={`h-4 w-4 shrink-0 ${isActive ? "text-primary" : ""}`} />
                {item.label}
              </div>
            </Link>
          );
        })}
      </nav>

      <NotifNavLink location={location} onNavigate={onNavigate} />

      <div className="mt-auto pt-4 border-t border-sidebar-border space-y-3">
        <div className="px-3">
          <Badge
            variant="outline"
            className={`text-[10px] px-2 py-0.5 w-full justify-center font-semibold tracking-wide ${ROLE_COLORS[user.role]}`}
          >
            {ROLE_LABELS[user.role]}
          </Badge>
        </div>
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs shrink-0">
            {user.avatarInitials}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-medium text-sidebar-foreground truncate">{user.name}</span>
            <span className="text-xs text-sidebar-foreground/50 truncate">{user.email}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const user = useAuthStore((s) => s.user);
  const canAccessModule = useAuthStore((s) => s.canAccessModule);
  const { theme, toggle } = useThemeStore();

  // Apply theme class to <html>
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    root.classList.toggle("light", theme === "light");
  }, [theme]);

  const visibleItems = NAV_ITEMS.filter((item) => canAccessModule(item.module));

  const openCmd = () => {
    document.dispatchEvent(
      new KeyboardEvent("keydown", { key: "k", metaKey: true, bubbles: true })
    );
  };

  return (
    <div className={`flex min-h-[100dvh] w-full bg-background text-foreground ${theme}`}>
      {/* Sidebar Desktop */}
      <aside className="hidden md:block w-64 h-screen sticky top-0 shrink-0">
        <SidebarNav
          visibleItems={visibleItems}
          location={location}
          user={user}
          onNavigate={() => {}}
        />
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="flex items-center justify-between px-4 md:px-8 py-3 border-b border-border bg-card/50 backdrop-blur-xl sticky top-0 z-20">
          {/* Mobile: logo + hamburger */}
          <div className="flex items-center gap-3 md:hidden">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" data-testid="btn-mobile-menu">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-64 bg-sidebar border-sidebar-border">
                <SidebarNav
                  visibleItems={visibleItems}
                  location={location}
                  user={user}
                  onNavigate={() => setMobileOpen(false)}
                />
              </SheetContent>
            </Sheet>
            <h1 className="text-lg font-bold bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
              Agzos Hub
            </h1>
          </div>

          {/* Desktop: Cmd+K search hint */}
          <button
            onClick={openCmd}
            className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border/50 bg-muted/20 hover:bg-muted/40 transition-colors text-muted-foreground text-xs min-w-[200px]"
          >
            <Search className="w-3.5 h-3.5 shrink-0" />
            <span className="flex-1 text-left">Buscar...</span>
            <kbd className="pointer-events-none inline-flex h-4 select-none items-center gap-1 rounded border border-border/60 bg-muted px-1.5 font-mono text-[9px] font-medium opacity-70">
              ⌘K
            </kbd>
          </button>

          {/* Topbar right */}
          <div className="flex items-center gap-2">
            {/* Dark/Light toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggle}
              className="h-9 w-9 text-muted-foreground hover:text-foreground"
              title={theme === "dark" ? "Ativar modo claro" : "Ativar modo escuro"}
            >
              {theme === "dark"
                ? <Sun className="w-4 h-4" />
                : <Moon className="w-4 h-4" />
              }
            </Button>
            <NotificationBell />
            <RoleSwitcher />
          </div>
        </header>

        <main className="flex-1 p-4 md:p-8 overflow-x-hidden">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>

      <CommandPalette />
    </div>
  );
}
