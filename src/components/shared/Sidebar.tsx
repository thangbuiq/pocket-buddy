"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const links = [
  ["/dashboard", "Dashboard"],
  ["/transactions", "Transactions"],
  ["/budgets", "Budgets"],
  ["/goals", "Goals"],
  ["/analytics", "Analytics"],
  ["/assistant", "Assistant"],
  ["/settings", "Settings"],
] as const;

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden min-h-screen w-64 border-r border-white/10 bg-slate-950/90 p-6 md:flex md:flex-col">
      <Link href="/dashboard" className="text-xl font-semibold text-indigo-300">
        Pocket Buddy
      </Link>
      <p className="mt-1 text-xs text-slate-400">AI-powered personal finance</p>
      <nav className="mt-8 space-y-2">
        {links.map(([href, label]) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "block rounded-lg px-3 py-2 text-sm text-slate-300 transition",
              pathname.startsWith(href) ? "bg-indigo-500/20 text-indigo-200" : "hover:bg-white/5"
            )}
          >
            {label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
