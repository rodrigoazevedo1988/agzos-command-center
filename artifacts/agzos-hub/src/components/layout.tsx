import { Link, useLocation } from "wouter";
import {
  LayoutDashboard,
  Globe,
  LayoutList,
  Users,
  UsersRound,
  DollarSign,
  Wrench,
  Menu,
  LogOut,
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { ROLE_LABELS, ROLE_COLORS, NavModule } from "@/lib/permissions";
import { RoleSwitcher } from "@/components/RoleSwitcher";

const NAV_ITEMS: { href: string; label: string; icon: any; module: NavModule }[] = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard, module: "dashboard" },
  { href: "/sites", label: "Sites", icon: Globe, module: "sites" },
  { href: "/projects", label: "Projetos", icon: LayoutList, module: "projects" },
  { href: "/clients", label: "Clientes", icon: Users, module: "clients" },
  { href: "/team", label: "Equipe", icon: UsersRound, module: "team" },
  { href: "/financial", label: "Financeiro", icon: DollarSign, module: "financial" },
  { href: "/tools", label: "Ferramentas", icon: Wrench, module: "tools" },
];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, canAccessModule } = useAuthStore();

  const visibleItems = NAV_ITEMS.filter((item) => canAccessModule(item.module));

  const NavContent = () => (
    <div className="flex flex-col gap-2 p-4 h-full bg-sidebar border-r border-sidebar-border">
      <div className="px-2 py-4 mb-2">
        <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent tracking-tight">
          Agzos Hub
        </h1>
        <p className="text-xs text-sidebar-foreground/40 mt-0.5">Sistema Interno</p>
      </div>

      <nav className="flex flex-col gap-1 flex-1">
        {visibleItems.map((item) => {
          const isActive =
            location === item.href ||
            (item.href !== "/" && location.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
            >
              <div
                className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors cursor-pointer text-sm font-medium ${
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                }`}
                data-testid={`nav-${item.label.toLowerCase()}`}
              >
                <item.icon
                  className={`h-4 w-4 shrink-0 ${isActive ? "text-primary" : ""}`}
                />
                {item.label}
              </div>
            </Link>
          );
        })}
      </nav>

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
            <span className="text-sm font-medium text-sidebar-foreground truncate">
              {user.name}
            </span>
            <span className="text-xs text-sidebar-foreground/50 truncate">
              {user.email}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-[100dvh] w-full bg-background text-foreground dark">
      {/* Sidebar Desktop */}
      <aside className="hidden md:block w-64 h-screen sticky top-0 shrink-0">
        <NavContent />
      </aside>

      {/* Conteúdo principal */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="flex items-center justify-between px-4 md:px-8 py-3 border-b border-border bg-card/50 backdrop-blur-xl sticky top-0 z-20">
          {/* Mobile: logo + hambúrguer */}
          <div className="flex items-center gap-3 md:hidden">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  data-testid="btn-mobile-menu"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent
                side="left"
                className="p-0 w-64 bg-sidebar border-sidebar-border"
              >
                <NavContent />
              </SheetContent>
            </Sheet>
            <h1 className="text-lg font-bold bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
              Agzos Hub
            </h1>
          </div>

          {/* Desktop: espaço vazio à esquerda para o topbar */}
          <div className="hidden md:block" />

          {/* Role Switcher (dev only) */}
          <div className="flex items-center gap-3">
            <RoleSwitcher />
          </div>
        </header>

        <main className="flex-1 p-4 md:p-8 overflow-x-hidden">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
