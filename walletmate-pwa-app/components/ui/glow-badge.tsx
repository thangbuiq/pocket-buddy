import * as React from "react";
import { cn } from "@/lib/utils";

export function GlowBadge({
  className,
  children,
  color = "primary",
  ...props
}: React.ComponentProps<"span"> & {
  color?: "primary" | "success" | "danger" | "warning";
}) {
  const colors = {
    primary: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30",
    success: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    danger: "bg-red-500/20 text-red-300 border-red-500/30",
    warning: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border backdrop-blur-sm",
        colors[color],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}
