import * as React from "react";
import { cn } from "@/lib/utils";

export function Input({ className, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      className={cn(
        "min-h-11 w-full rounded-[3px] border border-border bg-card px-3.5 text-foreground font-sans text-[0.9rem] placeholder:text-muted focus:border-primary focus:outline-none",
        className,
      )}
      {...props}
    />
  );
}
