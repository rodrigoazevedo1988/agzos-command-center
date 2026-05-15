import { Sun, Moon } from "lucide-react";
import { Toggle } from "@/components/ui/toggle";
import { useThemeStore } from "@/store/useThemeStore";

export function ModeToggle() {
  const { theme, toggle } = useThemeStore();
  const isDark = theme === "dark";

  return (
    <Toggle
      pressed={isDark}
      onPressedChange={toggle}
      aria-label={`Mudar para modo ${isDark ? "claro" : "escuro"}`}
      className="group h-9 w-9 p-0 bg-transparent hover:bg-muted/50 data-[state=on]:bg-transparent"
    >
      <Moon
        className="h-4 w-4 shrink-0 scale-0 opacity-0 transition-all group-data-[state=on]:scale-100 group-data-[state=on]:opacity-100"
        aria-hidden="true"
      />
      <Sun
        className="absolute h-4 w-4 shrink-0 scale-100 opacity-100 transition-all group-data-[state=on]:scale-0 group-data-[state=on]:opacity-0"
        aria-hidden="true"
      />
    </Toggle>
  );
}
