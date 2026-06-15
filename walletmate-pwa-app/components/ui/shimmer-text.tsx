import * as React from "react";
import { cn } from "@/lib/utils";

export function ShimmerText({
  className,
  children,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      className={cn("relative inline-block overflow-hidden", className)}
      {...props}
    >
      <span className="relative z-10">{children}</span>
      <span className="absolute inset-0 shimmer z-0" />
    </span>
  );
}
