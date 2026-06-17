"use client";

import { useMutation } from "@tanstack/react-query";
import { suggestRecurring } from "@/lib/api";
import type {
  CandidateTransaction,
  HistoricalTransaction,
  RecurringSuggestion,
} from "@/types";

export function useSuggestRecurring() {
  return useMutation({
    mutationFn: async (payload: {
      candidate: CandidateTransaction;
      history: HistoricalTransaction[];
      language: "vi" | "en";
    }): Promise<RecurringSuggestion> => {
      return suggestRecurring(
        payload.candidate,
        payload.history,
        payload.language,
      );
    },
  });
}
