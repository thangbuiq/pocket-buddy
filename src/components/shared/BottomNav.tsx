"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ReceiptText } from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n, type TranslationKey } from "@/lib/i18n";

const items = [
  { href: "/dashboard", label: "dashboard", icon: Home },
  { href: "/transactions", label: "transactions", icon: ReceiptText },
] as const;

export function BottomNav() {
  const pathname = usePathname();
  const { t } = useI18n();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 px-2 pb-[max(env(safe-area-inset-bottom),0.5rem)] pt-2 backdrop-blur-[12px] md:hidden">
      <ul className="grid grid-cols-2 gap-1">
        {items.map((item) => {
          const active = pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  "flex min-h-11 flex-col items-center justify-center rounded-[3px] transition-colors cursor-pointer",
                  active ? "text-primary" : "text-muted hover:text-foreground",
                )}
              >
                <Icon className="mb-1 h-4 w-4" />
                <span className="font-mono text-[0.6rem] uppercase tracking-[0.1em]">
                  {t(item.label as TranslationKey)}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
