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
  const { t, language, setLanguage } = useI18n();
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
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isSettingsOpen]);

  return (
    <>
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 px-2 pb-[max(env(safe-area-inset-bottom),0.75rem)] pt-2 backdrop-blur-[12px] md:hidden">
        <ul className="relative grid grid-cols-3 gap-1">
          {navItems.map((item) => {
            const active = pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex min-h-16 flex-col items-center justify-center rounded-[3px] border border-transparent transition-colors cursor-pointer",
                    active
                      ? "border-primary/25 bg-primary/10 text-primary"
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
                "flex min-h-16 w-full cursor-pointer flex-col items-center justify-center rounded-[3px] border border-transparent transition-colors",
                isSettingsOpen
                  ? "border-primary/25 bg-primary/10 text-primary"
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
              <div className="absolute bottom-[calc(100%+0.75rem)] right-0 flex w-64 flex-col rounded-[4px] border border-border bg-card p-2 shadow-lg animate-in slide-in-from-bottom-2 fade-in">
                <div className="border-b border-border p-2">
                  <span className="mb-2 block font-mono text-[0.6rem] uppercase tracking-[0.12em] text-muted">
                    Language
                  </span>
                  <div className="grid grid-cols-2 gap-1 rounded-[3px] border border-border bg-background p-1">
                    <button
                      type="button"
                      onClick={() => {
                        setLanguage("vi");
                        setIsSettingsOpen(false);
                      }}
                      className={cn(
                        "min-h-11 cursor-pointer rounded-[2px] px-3 font-mono text-[0.7rem] uppercase tracking-[0.08em] transition-colors",
                        language === "vi"
                          ? "bg-primary text-primary-foreground"
                          : "text-muted hover:text-foreground",
                      )}
                    >
                      VI
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setLanguage("en");
                        setIsSettingsOpen(false);
                      }}
                      className={cn(
                        "min-h-11 cursor-pointer rounded-[2px] px-3 font-mono text-[0.7rem] uppercase tracking-[0.08em] transition-colors",
                        language === "en"
                          ? "bg-primary text-primary-foreground"
                          : "text-muted hover:text-foreground",
                      )}
                    >
                      EN
                    </button>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setTheme(resolvedTheme === "dark" ? "light" : "dark");
                    setIsSettingsOpen(false);
                  }}
                  className="flex min-h-12 w-full cursor-pointer items-center gap-3 rounded-[3px] p-3 text-left text-muted transition-colors hover:bg-muted/10 hover:text-foreground"
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
                  className="flex min-h-12 w-full cursor-pointer items-center gap-3 rounded-[3px] p-3 text-left text-muted transition-colors hover:bg-muted/10 hover:text-foreground"
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
