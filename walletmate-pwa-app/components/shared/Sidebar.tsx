"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useTheme } from "next-themes";
import { LogOut, Sun, Moon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n, type TranslationKey } from "@/lib/i18n";

const links = [
  ["/dashboard", "dashboard"],
  ["/transactions", "transactions"],
] as const;

export function Sidebar() {
  const pathname = usePathname();
  const { t, language, setLanguage } = useI18n();
  const { theme, setTheme } = useTheme();

  return (
    <aside className="sticky top-0 hidden h-screen w-[220px] border-r border-border bg-card md:flex md:flex-col">
      {/* Logo area */}
      <div className="px-6 pt-6 pb-4">
        <Link href="/dashboard" className="font-serif text-xl text-foreground">
          Walletmate
        </Link>
        <p className="mt-1 font-mono text-[0.65rem] uppercase tracking-[0.12em] text-muted">
          AI Finance
        </p>
      </div>

      {/* Navigation */}
      <nav className="mt-4 flex-1 space-y-1 px-3">
        {links.map(([href, labelKey]) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "block rounded-[3px] px-3 py-2 font-mono text-[0.75rem] uppercase tracking-[0.1em] transition-colors",
              pathname.startsWith(href)
                ? "text-primary"
                : "text-text-dim hover:text-foreground",
            )}
          >
            {t(labelKey as TranslationKey)}
          </Link>
        ))}
      </nav>

      {/* Language & Theme toggles */}
      <div className="space-y-4 px-3 pb-4">
        {/* Language toggle */}
        <div className="space-y-1.5">
          <span className="font-mono text-[0.6rem] uppercase tracking-[0.12em] text-muted">
            Language
          </span>
          <div className="flex gap-1">
            <button
              onClick={() => setLanguage("en")}
              className={cn(
                "flex-1 rounded-[3px] px-2 py-1.5 font-mono text-[0.7rem] uppercase tracking-[0.08em] transition-colors cursor-pointer",
                language === "en"
                  ? "bg-primary/15 text-primary"
                  : "text-text-dim hover:text-foreground",
              )}
            >
              EN
            </button>
            <button
              onClick={() => setLanguage("vi")}
              className={cn(
                "flex-1 rounded-[3px] px-2 py-1.5 font-mono text-[0.7rem] uppercase tracking-[0.08em] transition-colors cursor-pointer",
                language === "vi"
                  ? "bg-primary/15 text-primary"
                  : "text-text-dim hover:text-foreground",
              )}
            >
              VI
            </button>
          </div>
        </div>

        {/* Theme toggle */}
        <div className="space-y-1.5">
          <span className="font-mono text-[0.6rem] uppercase tracking-[0.12em] text-muted">
            {t("appearance")}
          </span>
          <div className="flex gap-1">
            <button
              onClick={() => setTheme("light")}
              className={cn(
                "flex-1 flex items-center justify-center gap-1 rounded-[3px] px-2 py-1.5 font-mono text-[0.7rem] uppercase tracking-[0.08em] transition-colors cursor-pointer",
                theme === "light"
                  ? "bg-primary/15 text-primary"
                  : "text-text-dim hover:text-foreground",
              )}
            >
              <Sun className="h-3 w-3" />
              {t("themeLight")}
            </button>
            <button
              onClick={() => setTheme("dark")}
              className={cn(
                "flex-1 flex items-center justify-center gap-1 rounded-[3px] px-2 py-1.5 font-mono text-[0.7rem] uppercase tracking-[0.08em] transition-colors cursor-pointer",
                theme === "dark"
                  ? "bg-primary/15 text-primary"
                  : "text-text-dim hover:text-foreground",
              )}
            >
              <Moon className="h-3 w-3" />
              {t("themeDark")}
            </button>
          </div>
        </div>
      </div>

      {/* Sign out */}
      <div className="px-3 pb-6">
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex w-full items-center gap-2 rounded-[3px] px-3 py-2 font-mono text-[0.75rem] uppercase tracking-[0.1em] text-text-dim transition-colors hover:text-foreground cursor-pointer"
        >
          <LogOut className="h-3.5 w-3.5" />
          {t("signOut")}
        </button>
      </div>
    </aside>
  );
}
