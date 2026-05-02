import { useAuthStore } from "@/store/useAuthStore";
import { Action } from "@/lib/permissions";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import React from "react";

interface PermissionGuardProps {
  action: Action;
  children: React.ReactElement;
  tooltip?: string;
  hide?: boolean;
}

export function PermissionGuard({
  action,
  children,
  tooltip,
  hide = false,
}: PermissionGuardProps) {
  const can = useAuthStore((s) => s.can);
  const hasPermission = can(action);

  if (!hasPermission && hide) return null;

  if (!hasPermission) {
    const disabledChild = React.cloneElement(children, {
      disabled: true,
      className: `${children.props.className ?? ""} opacity-40 cursor-not-allowed pointer-events-none`,
      onClick: undefined,
      "data-disabled": true,
    });

    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="inline-flex">{disabledChild}</span>
        </TooltipTrigger>
        <TooltipContent side="top" className="text-xs max-w-48 text-center">
          {tooltip ?? "Você não tem permissão para esta ação."}
        </TooltipContent>
      </Tooltip>
    );
  }

  return children;
}
