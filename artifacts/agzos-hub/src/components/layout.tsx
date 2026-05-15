import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuthStore } from "@/store/useAuthStore";
import { useThemeStore } from "@/store/useThemeStore";
import { AppTopNav } from "@/components/AppTopNav";
import { CommandPalette } from "@/components/CommandPalette";
import { cn } from "@/lib/utils";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [, navigate] = useLocation();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const { theme } = useThemeStore();

  // Aplica classe de tema no <html>
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    root.classList.toggle("light", theme === "light");
  }, [theme]);

  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const openCmd = () => {
    document.dispatchEvent(
      new KeyboardEvent("keydown", { key: "k", metaKey: true, bubbles: true })
    );
  };

  return (
    <div className={cn("min-h-[100dvh] flex flex-col bg-background text-foreground", theme)}>
      <AppTopNav onLogout={handleLogout} onOpenCmd={openCmd} />

      <main className="flex-1 pt-14 px-4 md:px-8 overflow-x-hidden">
        <div className="mx-auto max-w-7xl py-6">{children}</div>
      </main>

      <CommandPalette />
    </div>
  );
}
