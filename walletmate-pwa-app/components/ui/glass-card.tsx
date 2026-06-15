import * as React from "react";
import { cn } from "@/lib/utils";

export function GlassCard({
  className,
  children,
  hover = true,
  glow = false,
  ...props
}: React.ComponentProps<"div"> & {
  hover?: boolean;
  glow?: boolean;
}) {
  return (
    <div
      className={cn(
        "glass rounded-2xl p-6 transition-all duration-300",
        hover && "glass-hover cursor-pointer",
        glow && "glow-border",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
