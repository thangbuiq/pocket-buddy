import * as React from "react";
import { cn } from "@/lib/utils";

export function Button({
  className,
  variant = "primary",
  ...props
}: React.ComponentProps<"button"> & {
  variant?:
    | "primary"
    | "secondary"
    | "destructive"
    | "ghost"
    | "glass"
    | "glow";
}) {
  const variants = {
    primary: "bg-primary text-primary-foreground hover:opacity-85",
    secondary:
      "bg-muted-background text-foreground border border-border hover:border-primary hover:text-primary",
    destructive: "bg-destructive text-primary-foreground hover:opacity-85",
    ghost:
      "text-muted border border-border hover:border-primary hover:text-primary",
    glass: "glass glass-hover text-foreground backdrop-blur-xl",
    glow: "bg-gradient-to-r from-indigo-500 to-purple-600 text-white glow glow-pulse hover:shadow-lg",
  };

  return (
    <button
      className={cn(
        "inline-flex min-h-11 items-center justify-center rounded-xl px-5 font-mono text-[0.8rem] font-medium uppercase tracking-[0.08em] transition-all duration-300 disabled:opacity-50 cursor-pointer",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
