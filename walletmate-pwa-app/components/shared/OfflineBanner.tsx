"use client";

import { useEffect, useState } from "react";
import { WifiOff } from "lucide-react";

export function OfflineBanner() {
  const [online, setOnline] = useState(true);

  useEffect(() => {
    const updateStatus = () => setOnline(navigator.onLine);
    updateStatus();
    window.addEventListener("online", updateStatus);
    window.addEventListener("offline", updateStatus);
    return () => {
      window.removeEventListener("online", updateStatus);
      window.removeEventListener("offline", updateStatus);
    };
  }, []);

  if (online) return null;

  return (
    <div className="flex items-center justify-center gap-2 border-b border-primary bg-accent-dim/50 px-4 py-2 font-mono text-[0.75rem] uppercase tracking-[0.1em] text-primary">
      <WifiOff className="h-3.5 w-3.5" />[ offline mode ]
    </div>
  );
}
