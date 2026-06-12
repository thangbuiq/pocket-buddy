"use client";

import { useQuery } from "@tanstack/react-query";
import type { Insight } from "@/types";

export function useInsights() {
  return useQuery({
    queryKey: ["insights"],
    queryFn: async () => (await fetch("/api/insights")).json() as Promise<Insight[]>,
  });
}
