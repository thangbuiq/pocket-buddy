import type { ParsedExpense } from "@/lib/validations/parse";
import type {
  AnalyzeRequest,
  AnalyzeResponse,
  CandidateTransaction,
  HistoricalTransaction,
  RecurringSuggestion,
} from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

/**
 * Parse expense/income from text using the Python FastAPI backend.
 */
export async function parseText(
  text: string,
  language: "vi" | "en",
): Promise<ParsedExpense> {
  const res = await fetch(`${API_URL}/api/parse-text`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, language }),
  });

  if (!res.ok) {
    const error = await res.json();
    if (error.redirect) {
      throw new Error(
        JSON.stringify({ message: error.error, redirect: error.redirect }),
      );
    }
    throw new Error(error.error || "Failed to parse text");
  }

  return res.json() as Promise<ParsedExpense>;
}

/**
 * Parse expense/income from an image receipt using the Python FastAPI backend.
 */
export async function parseImage(file: File): Promise<ParsedExpense> {
  const formData = new FormData();
  formData.append("image", file);

  console.log("[parseImage] Sending image:", {
    name: file.name,
    type: file.type,
    size: file.size,
  });

  let res: Response;
  try {
    res = await fetch(`${API_URL}/api/parse-image`, {
      method: "POST",
      body: formData,
    });
  } catch (err) {
    console.error("[parseImage] Fetch failed:", err);
    throw new Error(
      `Network error: ${err instanceof Error ? err.message : "Unknown error"}`,
    );
  }

  if (!res.ok) {
    // Try to parse error as JSON, fall back to text
    let errorMessage = `Request failed with status ${res.status}`;
    try {
      const error = await res.json();
      if (error.redirect) {
        throw new Error(
          JSON.stringify({ message: error.error, redirect: error.redirect }),
        );
      }
      errorMessage = error.error || errorMessage;
    } catch {
      // Response is not JSON - use status text
      errorMessage = `${res.status} ${res.statusText}`.trim() || errorMessage;
    }
    throw new Error(errorMessage);
  }

  return res.json() as Promise<ParsedExpense>;
}

/**
 * Parse transactions from a CSV/XLSX file using the Python FastAPI backend.
 */
export async function parseBatchFile(
  file: File,
  language: "vi" | "en",
): Promise<ParsedExpense[]> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(
    `${API_URL}/api/parse-batch?language=${encodeURIComponent(language)}`,
    {
      method: "POST",
      body: formData,
    },
  );

  if (!res.ok) {
    const error = await res.json();
    if (error.redirect) {
      throw new Error(
        JSON.stringify({ message: error.error, redirect: error.redirect }),
      );
    }
    throw new Error(error.error || "Failed to parse batch file");
  }

  const data = (await res.json()) as { transactions: ParsedExpense[] };
  return data.transactions;
}

/**
 * Ask the Python backend whether a candidate transaction should be recurring.
 * Sends the candidate plus a limited history (previous + current month).
 */
export async function suggestRecurring(
  candidate: CandidateTransaction,
  history: HistoricalTransaction[],
  language: "vi" | "en",
): Promise<RecurringSuggestion> {
  const res = await fetch(`${API_URL}/api/suggest-recurring`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ candidate, history, language }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Failed to suggest recurrence");
  }

  return res.json() as Promise<RecurringSuggestion>;
}

/**
 * Ask the Python backend to generate proactive insights from transaction history.
 */
export async function analyzeTransactions(
  request: AnalyzeRequest,
): Promise<AnalyzeResponse> {
  const res = await fetch(`${API_URL}/api/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Failed to analyze transactions");
  }

  return res.json() as Promise<AnalyzeResponse>;
}
