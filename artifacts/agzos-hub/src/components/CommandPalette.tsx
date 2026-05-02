import { useEffect, useState, useMemo } from "react";
import { useLocation } from "wouter";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import {
  LayoutDashboard, Globe, LayoutList, Users, UsersRound,
  DollarSign, Wrench, BarChart2, Settings, Bell,
  Building2, FileText, Search,
} from "lucide-react";
import { useClientsStore } from "@/store/useClientsStore";
import { useFinancialStore } from "@/store/useFinancialStore";
import { useToolsStore } from "@/store/useToolsStore";

const NAV_PAGES = [
  { label: "Dashboard",       href: "/",              icon: LayoutDashboard },
  { label: "Sites",           href: "/sites",         icon: Globe },
  { label: "Projetos",        href: "/projects",      icon: LayoutList },
  { label: "Clientes",        href: "/clients",       icon: Users },
  { label: "Equipe",          href: "/team",          icon: UsersRound },
  { label: "Financeiro",      href: "/financial",     icon: DollarSign },
  { label: "Ferramentas",     href: "/tools",         icon: Wrench },
  { label: "Relatórios",      href: "/reports",       icon: BarChart2 },
  { label: "Configurações",   href: "/settings",      icon: Settings },
  { label: "Notificações",    href: "/notifications", icon: Bell },
];

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [, navigate] = useLocation();

  const { clients } = useClientsStore();
  const { invoices } = useFinancialStore();
  const { tools } = useToolsStore();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  const go = (href: string) => {
    navigate(href);
    setOpen(false);
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Buscar páginas, clientes, faturas..." />
      <CommandList>
        <CommandEmpty>
          <div className="flex flex-col items-center gap-2 py-4 text-muted-foreground">
            <Search className="w-8 h-8 opacity-30" />
            <p className="text-sm">Nenhum resultado encontrado.</p>
          </div>
        </CommandEmpty>

        {/* Navigation */}
        <CommandGroup heading="Páginas">
          {NAV_PAGES.map((page) => {
            const Icon = page.icon;
            return (
              <CommandItem key={page.href} value={page.label} onSelect={() => go(page.href)} className="gap-3">
                <Icon className="w-4 h-4 text-muted-foreground" />
                {page.label}
                <CommandShortcut className="text-[10px]">{page.href === "/" ? "Início" : ""}</CommandShortcut>
              </CommandItem>
            );
          })}
        </CommandGroup>

        <CommandSeparator />

        {/* Clients */}
        <CommandGroup heading="Clientes">
          {clients.slice(0, 5).map((c) => (
            <CommandItem key={c.id} value={`${c.name} ${c.companyName}`} onSelect={() => go("/clients")} className="gap-3">
              <div className="w-6 h-6 rounded bg-primary/10 border border-primary/20 flex items-center justify-center text-[10px] font-bold text-primary shrink-0">
                {c.avatar}
              </div>
              <span>{c.name}</span>
              <span className="text-muted-foreground text-xs">{c.companyName}</span>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        {/* Invoices */}
        <CommandGroup heading="Faturas">
          {invoices.slice(0, 4).map((inv) => (
            <CommandItem key={inv.id} value={`${inv.number} ${inv.clientName}`} onSelect={() => go("/financial")} className="gap-3">
              <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
              <span className="font-mono text-xs">{inv.number}</span>
              <span className="text-muted-foreground text-xs">— {inv.clientName}</span>
              <CommandShortcut className="text-xs font-semibold text-foreground">
                R$ {inv.amount.toLocaleString("pt-BR")}
              </CommandShortcut>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        {/* Tools */}
        <CommandGroup heading="Ferramentas">
          {tools.filter((t) => t.status === "active").slice(0, 4).map((t) => (
            <CommandItem key={t.id} value={t.name} onSelect={() => go("/tools")} className="gap-3">
              <span className="text-base w-5 shrink-0">{t.icon}</span>
              <span>{t.name}</span>
              <span className="text-muted-foreground text-xs">{t.url}</span>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
