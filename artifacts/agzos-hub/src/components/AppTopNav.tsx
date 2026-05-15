import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X, Search, LogOut } from "lucide-react";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { BrandLogo } from "@/components/BrandLogo";
import { ModeToggle } from "@/components/ModeToggle";
import { NotificationBell } from "@/components/NotificationBell";
import { RoleSwitcher } from "@/components/RoleSwitcher";
import { NAV_GROUPS, NOTIF_ITEM, type NavItem } from "@/lib/nav-groups";
import { ROLE_LABELS, ROLE_COLORS, type Role } from "@/lib/permissions";
import { useAuthStore } from "@/store/useAuthStore";
import { useNotificationsStore, selectUnreadCount } from "@/store/useNotificationsStore";
import { cn } from "@/lib/utils";
import type { AuthUser } from "@/store/useAuthStore";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getUserInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function isItemActive(location: string, href: string) {
  return location === href || (href !== "/" && location.startsWith(href));
}

// ─── Single nav link (icon + label) ──────────────────────────────────────────

function NavLink({
  item,
  location,
  onClick,
  className,
}: {
  item: NavItem;
  location: string;
  onClick?: () => void;
  className?: string;
}) {
  const Icon = item.icon;
  const active = isItemActive(location, item.href);
  return (
    <Link href={item.href} onClick={onClick}>
      <span
        className={cn(
          "flex items-center gap-2 py-2 px-2 rounded-md text-sm cursor-pointer transition-colors",
          active ? "text-primary font-medium" : "text-muted-foreground hover:text-foreground",
          className
        )}
        data-testid={`nav-${item.label.toLowerCase()}`}
      >
        <Icon className="h-3.5 w-3.5 shrink-0" />
        {item.label}
      </span>
    </Link>
  );
}

// ─── User menu ────────────────────────────────────────────────────────────────

function UserMenu({ user, onLogout }: { user: AuthUser; onLogout: () => void }) {
  const effectiveRole = useAuthStore((s) => s.effectiveRole)();
  const displayRole = (effectiveRole ?? user.role) as Role;

  return (
    <div className="flex items-center gap-2">
      <div className="hidden md:flex flex-col items-end">
        <span className="text-xs font-medium text-foreground leading-none">{user.name}</span>
        <Badge
          variant="outline"
          className={cn(
            "text-[9px] px-1.5 py-0 h-3.5 mt-0.5 font-semibold tracking-wide",
            ROLE_COLORS[displayRole]
          )}
        >
          {ROLE_LABELS[displayRole]}
        </Badge>
      </div>
      <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs shrink-0 border border-primary/30">
        {getUserInitials(user.name)}
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={onLogout}
        className="h-8 w-8 text-muted-foreground hover:text-red-400 hover:bg-red-500/10"
        title="Sair"
      >
        <LogOut className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}

// ─── Desktop nav ──────────────────────────────────────────────────────────────

function DesktopNav({
  location,
  canAccessModule,
}: {
  location: string;
  canAccessModule: (m: string) => boolean;
}) {
  const visibleGroups = NAV_GROUPS.map((g) => ({
    ...g,
    items: g.items.filter((i) => canAccessModule(i.module)),
  })).filter((g) => g.items.length > 0);

  return (
    <NavigationMenu>
      <NavigationMenuList className="gap-0.5">
        {visibleGroups.map((group) => {
          if (group.items.length === 1) {
            const item = group.items[0];
            const Icon = item.icon;
            const active = isItemActive(location, item.href);
            return (
              <NavigationMenuItem key={group.label}>
                <NavigationMenuLink asChild>
                  <Link href={item.href}>
                    <span
                      className={cn(
                        "inline-flex items-center gap-1.5 h-9 px-3 rounded-md text-sm font-medium transition-colors cursor-pointer",
                        active
                          ? "bg-primary text-primary-foreground"
                          : "text-foreground/70 hover:bg-muted hover:text-foreground"
                      )}
                      data-testid={`nav-${item.label.toLowerCase()}`}
                    >
                      <Icon className="h-3.5 w-3.5 shrink-0" />
                      {item.label}
                    </span>
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
            );
          }

          const groupActive = group.items.some((i) => isItemActive(location, i.href));

          return (
            <NavigationMenuItem key={group.label}>
              <NavigationMenuTrigger
                className={cn(
                  "h-9 px-3 text-sm font-medium rounded-md transition-colors",
                  groupActive
                    ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground"
                    : "bg-transparent text-foreground/70 hover:bg-muted hover:text-foreground data-[state=open]:bg-muted"
                )}
              >
                {group.label}
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid w-48 gap-0.5 p-2">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const active = isItemActive(location, item.href);
                    return (
                      <li key={item.href}>
                        <NavigationMenuLink asChild>
                          <Link href={item.href}>
                            <span
                              className={cn(
                                "flex items-center gap-2 select-none rounded-md px-3 py-2 text-sm leading-none no-underline outline-none transition-colors cursor-pointer",
                                active
                                  ? "bg-primary text-primary-foreground"
                                  : "text-foreground/80 hover:bg-primary hover:text-primary-foreground"
                              )}
                              data-testid={`nav-${item.label.toLowerCase()}`}
                            >
                              <Icon className="h-3.5 w-3.5 shrink-0" />
                              {item.label}
                            </span>
                          </Link>
                        </NavigationMenuLink>
                      </li>
                    );
                  })}
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
          );
        })}
      </NavigationMenuList>
    </NavigationMenu>
  );
}

// ─── Mobile nav ───────────────────────────────────────────────────────────────

function MobileNav({
  location,
  canAccessModule,
  onNavigate,
  user,
  onLogout,
}: {
  location: string;
  canAccessModule: (m: string) => boolean;
  onNavigate: () => void;
  user: AuthUser;
  onLogout: () => void;
}) {
  const unread = useNotificationsStore(selectUnreadCount);
  const effectiveRole = useAuthStore((s) => s.effectiveRole)();
  const displayRole = (effectiveRole ?? user.role) as Role;
  const NotifIcon = NOTIF_ITEM.icon;

  const visibleGroups = NAV_GROUPS.map((g) => ({
    ...g,
    items: g.items.filter((i) => canAccessModule(i.module)),
  })).filter((g) => g.items.length > 0);

  return (
    <div className="flex flex-col h-full">
      {/* Notificações no topo */}
      <div className="pb-4 border-b border-border mb-2">
        <Link href={NOTIF_ITEM.href} onClick={onNavigate}>
          <span className="flex items-center gap-2 px-1 py-2 text-sm font-medium text-foreground/80 hover:text-foreground cursor-pointer">
            <NotifIcon className="h-4 w-4 shrink-0" />
            {NOTIF_ITEM.label}
            {unread > 0 && (
              <Badge className="ml-auto bg-primary/20 text-primary border-primary/30 text-[10px] px-1.5 py-0 h-4">
                {unread > 9 ? "9+" : unread}
              </Badge>
            )}
          </span>
        </Link>
      </div>

      {/* Grupos em accordion */}
      <div className="flex-1 overflow-y-auto">
        <Accordion type="multiple" className="w-full">
          {visibleGroups.map((group) => {
            if (group.items.length === 1) {
              const item = group.items[0];
              return (
                <AccordionItem key={group.label} value={group.label} className="border-b border-border/50">
                  <NavLink item={item} location={location} onClick={onNavigate} className="py-3" />
                </AccordionItem>
              );
            }

            return (
              <AccordionItem key={group.label} value={group.label} className="border-b border-border/50">
                <AccordionTrigger className="py-3 text-sm font-semibold hover:no-underline">
                  {group.label}
                </AccordionTrigger>
                <AccordionContent>
                  <ul className="space-y-1 pl-2 pb-2">
                    {group.items.map((item) => (
                      <li key={item.href}>
                        <NavLink item={item} location={location} onClick={onNavigate} />
                      </li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </div>

      {/* Rodapé: usuário + sair */}
      <div className="pt-4 border-t border-border mt-2 space-y-3">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm shrink-0 border border-primary/30">
            {getUserInitials(user.name)}
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-sm font-medium truncate">{user.name}</span>
            <span className="text-xs text-muted-foreground truncate">{user.email}</span>
          </div>
          <Badge
            variant="outline"
            className={cn("text-[10px] px-2 py-0.5 font-semibold tracking-wide shrink-0", ROLE_COLORS[displayRole])}
          >
            {ROLE_LABELS[displayRole]}
          </Badge>
        </div>
        <button
          onClick={() => { onLogout(); onNavigate(); }}
          className="flex items-center gap-2 w-full px-2 py-2 rounded-md text-sm text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-colors"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          Sair
        </button>
      </div>
    </div>
  );
}

// ─── AppTopNav (main export) ──────────────────────────────────────────────────

export function AppTopNav({
  onLogout,
  onOpenCmd,
}: {
  onLogout: () => void;
  onOpenCmd: () => void;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [location] = useLocation();
  const user = useAuthStore((s) => s.user);
  const canAccessModule = useAuthStore((s) => s.canAccessModule);

  if (!user) return null;

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-border/60">
      <div className="px-4 md:px-6">
        <div className="flex items-center justify-between h-14 gap-4">

          {/* Esquerda: logo */}
          <Link href="/">
            <BrandLogo variant="header" />
          </Link>

          {/* Centro: nav desktop */}
          <div className="hidden lg:flex flex-1 justify-center">
            <DesktopNav location={location} canAccessModule={canAccessModule} />
          </div>

          {/* Direita: ações */}
          <div className="flex items-center gap-1">
            {/* Busca ⌘K */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onOpenCmd}
              className="hidden md:flex items-center gap-1.5 h-9 px-2.5 text-muted-foreground hover:text-foreground text-xs border border-border/50 bg-muted/20 hover:bg-muted/40"
              aria-label="Buscar (⌘K)"
            >
              <Search className="h-3.5 w-3.5 shrink-0" />
              <span className="hidden lg:inline">Buscar...</span>
              <kbd className="hidden lg:inline-flex pointer-events-none h-4 select-none items-center gap-1 rounded border border-border/60 bg-muted px-1.5 font-mono text-[9px] font-medium opacity-70">
                ⌘K
              </kbd>
            </Button>

            <ModeToggle />
            <NotificationBell />
            <RoleSwitcher />

            {/* Usuário desktop */}
            <div className="hidden md:flex">
              <UserMenu user={user} onLogout={onLogout} />
            </div>

            {/* Hamburger mobile */}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="lg:hidden h-9 w-9"
                  data-testid="btn-mobile-menu"
                  aria-label="Menu"
                >
                  {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80 p-6 bg-background border-border">
                <MobileNav
                  location={location}
                  canAccessModule={canAccessModule}
                  onNavigate={() => setMobileOpen(false)}
                  user={user}
                  onLogout={onLogout}
                />
              </SheetContent>
            </Sheet>
          </div>

        </div>
      </div>
    </header>
  );
}
