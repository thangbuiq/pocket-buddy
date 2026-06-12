import * as React from "react";
import { cn } from "@/lib/utils";

export function Button({ className, ...props }: React.ComponentProps<"button">) {
  return (
    <button
      className={cn("inline-flex min-h-11 items-center justify-center rounded-lg bg-indigo-600 px-4 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50", className)}
      {...props}
    />
  );
}
