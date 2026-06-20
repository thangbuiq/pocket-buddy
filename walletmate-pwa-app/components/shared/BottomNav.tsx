"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useTheme } from "next-themes";
import { Home, ReceiptText, Settings, Sun, Moon, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n, type TranslationKey } from "@/lib/i18n";

const navItems = [
  { href: "/dashboard", label: "dashboard", icon: Home },
  { href: "/transactions", label: "transactions", icon: ReceiptText },
] as const;

export function BottomNav() {
  const pathname = usePathname();
  const { t } = useI18n();
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const menuRef = useRef<HTMLLIElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsSettingsOpen(false);
      }
    }
    if (isSettingsOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.addEventListener("mousedown", handleClickOutside);
    };
  }, [isSettingsOpen]);

  return (
    <>
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 px-2 pb-[max(env(safe-area-inset-bottom),0.5rem)] pt-2 backdrop-blur-[12px] md:hidden">
        <ul className="grid grid-cols-3 gap-1 relative">
          {navItems.map((item) => {
            const active = pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex min-h-[3.5rem] flex-col items-center justify-center rounded-[3px] transition-colors cursor-pointer",
                    active
                      ? "text-primary"
                      : "text-muted hover:text-foreground",
                  )}
                  onClick={() => setIsSettingsOpen(false)}
                >
                  <Icon className="mb-1 h-5 w-5" />
                  <span className="font-mono text-[0.65rem] uppercase tracking-[0.1em]">
                    {t(item.label as TranslationKey)}
                  </span>
                </Link>
              </li>
            );
          })}

          {/* Settings button */}
          <li ref={menuRef}>
            <button
              onClick={() => setIsSettingsOpen(!isSettingsOpen)}
              className={cn(
                "flex min-h-[3.5rem] w-full flex-col items-center justify-center rounded-[3px] transition-colors cursor-pointer",
                isSettingsOpen
                  ? "text-primary"
                  : "text-muted hover:text-foreground",
              )}
            >
              <Settings className="mb-1 h-5 w-5" />
              <span className="font-mono text-[0.65rem] uppercase tracking-[0.1em]">
                {t("settings")}
              </span>
            </button>

            {/* Settings Menu Popup */}
            {isSettingsOpen && (
              <div className="absolute bottom-[calc(100%+0.5rem)] right-0 w-48 flex flex-col rounded-[4px] border border-border bg-card p-2 shadow-lg animate-in slide-in-from-bottom-2 fade-in">
                <button
                  onClick={() => {
                    setTheme(resolvedTheme === "dark" ? "light" : "dark");
                    setIsSettingsOpen(false);
                  }}
                  className="flex w-full items-center gap-3 rounded-[3px] p-3 text-left text-muted transition-colors hover:bg-muted/10 hover:text-foreground cursor-pointer"
                >
                  {mounted && resolvedTheme === "dark" ? (
                    <Sun className="h-4 w-4" />
                  ) : (
                    <Moon className="h-4 w-4" />
                  )}
                  <span className="font-sans text-sm font-medium">
                    {mounted && resolvedTheme === "dark"
                      ? t("themeLight")
                      : t("themeDark")}
                  </span>
                </button>
                <button
                  onClick={() => {
                    signOut({ callbackUrl: "/login" });
                    setIsSettingsOpen(false);
                  }}
                  className="flex w-full items-center gap-3 rounded-[3px] p-3 text-left text-muted transition-colors hover:bg-muted/10 hover:text-foreground cursor-pointer"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="font-sans text-sm font-medium">
                    {t("signOut")}
                  </span>
                </button>
              </div>
            )}
          </li>
        </ul>
      </nav>
    </>
  );
}
