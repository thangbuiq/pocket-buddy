"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner, type ToasterProps } from "sonner";

export function Toaster({ ...props }: ToasterProps) {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      position="top-right"
      richColors
      closeButton
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:rounded-[4px] group-[.toaster]:border group-[.toaster]:border-border group-[.toaster]:bg-card group-[.toaster]:text-foreground group-[.toaster]:shadow-[0_18px_60px_rgba(0,0,0,0.35)] group-[.toaster]:backdrop-blur-xl",
          title:
            "group-[.toast]:font-mono group-[.toast]:text-[0.74rem] group-[.toast]:uppercase group-[.toast]:tracking-[0.1em]",
          description:
            "group-[.toast]:font-sans group-[.toast]:text-sm group-[.toast]:text-muted",
          success:
            "group-[.toaster]:border-success/40 group-[.toaster]:bg-card group-[.toaster]:text-success",
          error:
            "group-[.toaster]:border-destructive/40 group-[.toaster]:bg-card group-[.toaster]:text-destructive",
          closeButton:
            "group-[.toaster]:border-border group-[.toaster]:bg-background group-[.toaster]:text-muted group-[.toaster]:hover:text-foreground",
        },
      }}
      {...props}
    />
  );
}
