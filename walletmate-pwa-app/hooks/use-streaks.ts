"use client";

import { useQuery } from "@tanstack/react-query";
import type { SpendingStreak } from "@/types";

export function useSpendingStreak() {
  return useQuery({
    queryKey: ["streaks"],
    queryFn: async () =>
      (await fetch("/api/streaks")).json() as Promise<SpendingStreak>,
  });
}
