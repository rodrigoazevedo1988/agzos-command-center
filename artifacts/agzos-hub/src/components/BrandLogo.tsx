import { useThemeStore } from "@/store/useThemeStore";
import { APP_SUBTITLE } from "@/lib/brand";
import { cn } from "@/lib/utils";

interface BrandLogoProps {
  variant?: "header" | "login" | "compact";
  className?: string;
}

export function BrandLogo({ variant = "header", className }: BrandLogoProps) {
  const theme = useThemeStore((s) => s.theme);
  // dark mode → logo branco/vermelho (logo-light.svg)
  // light mode → logo preto/vermelho (logo-dark.svg)
  const logoSrc = theme === "dark" ? "/brand/logo-light.svg" : "/brand/logo-dark.svg";

  if (variant === "login") {
    return (
      <div className={cn("flex flex-col items-center gap-3", className)}>
        <img
          src={logoSrc}
          alt="Agzos Agency"
          className="h-10 w-auto object-contain"
        />
        <span className="text-xs font-medium tracking-widest uppercase text-muted-foreground">
          {APP_SUBTITLE}
        </span>
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <img
          src="/brand/logo-mark.svg"
          alt="Agzos"
          className="h-6 w-6 object-contain"
        />
      </div>
    );
  }

  // header variant — bloco marca estilo 21st
  return (
    <div
      className={cn(
        "flex items-center gap-2 border border-primary/40 bg-primary rounded-md h-9 px-3",
        className
      )}
    >
      <img
        src="/brand/logo-mark.svg"
        alt="Agzos"
        className="h-5 w-5 object-contain brightness-0 invert"
      />
      <span className="hidden sm:block text-sm font-semibold text-primary-foreground tracking-tight whitespace-nowrap">
        {APP_SUBTITLE}
      </span>
    </div>
  );
}
