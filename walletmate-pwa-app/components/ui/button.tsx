import * as React from "react";
import { cn } from "@/lib/utils";

export function Button({
  className,
  variant = "primary",
  ...props
}: React.ComponentProps<"button"> & {
  variant?: "primary" | "secondary" | "destructive" | "ghost";
}) {
  const variants = {
    primary: "bg-primary text-primary-foreground hover:opacity-85",
    secondary:
      "bg-muted-background text-foreground border border-border hover:border-primary hover:text-primary",
    destructive: "bg-destructive text-primary-foreground hover:opacity-85",
    ghost:
      "text-muted border border-border hover:border-primary hover:text-primary",
  };

  return (
    <button
      className={cn(
        "inline-flex min-h-11 items-center justify-center rounded-[3px] px-5 font-mono text-[0.8rem] font-medium uppercase tracking-[0.08em] transition-opacity disabled:opacity-50 cursor-pointer",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
