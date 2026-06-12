"use client";

import { useState } from "react";
import { Sparkles, X } from "lucide-react";

export function InsightBanner({ title, description }: { title: string; description: string }) {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  return (
    <div className="rounded-2xl border border-indigo-400/30 bg-indigo-500/10 p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="flex items-center gap-2 text-sm font-medium text-indigo-200">
            <Sparkles className="h-4 w-4" />
            AI Insight
          </p>
          <h3 className="mt-1 font-semibold text-white">{title}</h3>
          <p className="mt-1 text-sm text-slate-300">{description}</p>
        </div>
        <button
          className="rounded p-1 text-slate-400 hover:bg-white/10 hover:text-white"
          onClick={() => setDismissed(true)}
          aria-label="Dismiss insight"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
