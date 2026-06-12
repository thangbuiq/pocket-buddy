"use client";

import { useQuery } from "@tanstack/react-query";

export function useGoals() {
  return useQuery({
    queryKey: ["goals"],
    queryFn: async () => (await fetch("/api/goals")).json() as Promise<unknown[]>,
  });
}
