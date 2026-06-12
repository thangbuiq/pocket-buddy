import * as React from "react";
import { cn } from "@/lib/utils";

export function Card({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "rounded-[4px] border border-border bg-card p-6 transition-colors hover:border-muted",
        className,
      )}
      {...props}
    />
  );
}
