"use client";

import { useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  Check,
  FileSpreadsheet,
  Loader2,
  Upload,
  X,
  XCircle,
} from "lucide-react";
import { parseBatchFile } from "@/lib/api";
import { useI18n } from "@/lib/i18n";
import { formatCurrency, parseNumberInput } from "@/lib/utils";
import type { ParsedExpense } from "@/lib/validations/parse";

const MAX_BATCH_FILE_SIZE = 5 * 1024 * 1024;
const MAX_BATCH_TRANSACTIONS = 100;
const ACCEPTED_FILE_TYPES =
  ".csv,.xlsx,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

const CATEGORIES = [
  "Ăn uống",
  "Di chuyển",
  "Mua sắm",
  "Giải trí",
  "Hóa đơn",
  "Sức khỏe",
  "Học tập",
  "Lương",
  "Khác",
];

type BatchRow = ParsedExpense & {
  id: string;
  approved: boolean;
};

export function BatchTransactionImport() {
  const { language } = useI18n();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [rows, setRows] = useState<BatchRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const approvedCount = rows.filter((row) => row.approved).length;

  const updateRow = <K extends keyof ParsedExpense>(
    id: string,
    field: K,
    value: ParsedExpense[K],
  ) => {
    setRows((current) =>
      current.map((row) => (row.id === id ? { ...row, [field]: value } : row)),
    );
  };

  const toggleRow = (id: string) => {
    setRows((current) =>
      current.map((row) =>
        row.id === id ? { ...row, approved: !row.approved } : row,
      ),
    );
  };

  const validateFile = (file: File) => {
    const extension = file.name.split(".").pop()?.toLowerCase();
    if (!["csv", "xlsx"].includes(extension ?? "")) {
      return "Only CSV and XLSX files are supported.";
    }
    if (file.size > MAX_BATCH_FILE_SIZE) {
      return "File too large. Maximum size is 5 MB.";
    }
    return null;
  };

  const handleFile = async (file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    setIsParsing(true);
    setFileName(file.name);

    try {
      const parsedRows = await parseBatchFile(file, language);
      setRows(
        parsedRows.slice(0, MAX_BATCH_TRANSACTIONS).map((row, index) => ({
          ...row,
          recurring: false,
          recurringFreq: undefined,
          id: `${file.name}-${index}-${row.transactionDate}-${row.amount}`,
          approved: true,
        })),
      );
      if (parsedRows.length === 0) {
        setError("No transactions were found in this file.");
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to parse file";
      try {
        const parsed = JSON.parse(message);
        if (parsed.redirect) {
          window.location.href = parsed.redirect;
          return;
        }
      } catch {
        // Keep the original message.
      }
      setError(message);
    } finally {
      setIsParsing(false);
    }
  };

  const handleSaveApproved = async () => {
    const approvedRows = rows.filter((row) => row.approved);
    if (approvedRows.length === 0) return;

    setError(null);
    setIsSaving(true);
    try {
      for (const row of approvedRows) {
        const res = await fetch("/api/transactions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: row.type,
            amount: row.amount,
            category: row.category,
            description: row.description,
            transactionDate: row.transactionDate,
            recurring: row.recurring,
            recurringFreq: row.recurringFreq,
            recurringEndDate: row.recurringEndDate,
            syncStatus: "synced",
          }),
        });
        if (!res.ok) throw new Error("Failed to save approved transactions");
      }
      await queryClient.invalidateQueries({ queryKey: ["transactions"] });
      setRows([]);
      setFileName(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save rows");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className="rounded-[4px] border border-border bg-card p-4 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <span className="font-mono text-[0.75rem] uppercase tracking-[0.12em] text-primary">
            Batch Import
          </span>
          <h2 className="mt-1 font-serif text-[1.7rem] leading-tight text-foreground sm:text-[2rem]">
            CSV / Excel <span className="serif-accent">review</span>
          </h2>
          <p className="mt-2 max-w-xl font-sans text-sm leading-6 text-muted sm:text-base">
            CSV or XLSX only. Up to {MAX_BATCH_TRANSACTIONS} transactions and 5
            MB per file.
          </p>
        </div>

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isParsing || isSaving}
          className="flex min-h-14 w-full items-center justify-center gap-2 rounded-[3px] bg-primary px-5 font-mono text-[0.8rem] uppercase tracking-[0.08em] text-primary-foreground transition-opacity hover:opacity-85 disabled:opacity-50 sm:w-auto"
        >
          {isParsing ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Upload className="h-5 w-5" />
          )}
          {isParsing ? "Parsing" : "Upload File"}
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPTED_FILE_TYPES}
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) void handleFile(file);
          event.target.value = "";
        }}
      />

      {fileName && (
        <div className="mt-4 flex items-center gap-2 rounded-[3px] border border-border bg-background px-3 py-3 text-sm text-foreground">
          <FileSpreadsheet className="h-4 w-4 shrink-0 text-primary" />
          <span className="min-w-0 flex-1 truncate">{fileName}</span>
          {rows.length > 0 && (
            <span className="font-mono text-xs text-muted">
              {approvedCount}/{rows.length} approved
            </span>
          )}
        </div>
      )}

      {error && (
        <p className="mt-3 rounded-[3px] border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}

      {rows.length > 0 && (
        <>
          <div className="mt-5 overflow-x-auto rounded-[3px] border border-border">
            <table className="min-w-[820px] w-full border-collapse bg-background text-left">
              <thead>
                <tr className="border-b border-border text-[0.7rem] uppercase tracking-[0.1em] text-muted">
                  <th className="w-24 px-3 py-3 font-mono">Approve</th>
                  <th className="w-28 px-3 py-3 font-mono">Type</th>
                  <th className="w-36 px-3 py-3 font-mono">Amount</th>
                  <th className="w-36 px-3 py-3 font-mono">Category</th>
                  <th className="px-3 py-3 font-mono">Description</th>
                  <th className="w-40 px-3 py-3 font-mono">Date</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-border last:border-b-0"
                  >
                    <td className="px-3 py-3">
                      <button
                        type="button"
                        onClick={() => toggleRow(row.id)}
                        className={`flex min-h-11 w-20 items-center justify-center gap-1 rounded-[3px] border font-mono text-[0.7rem] uppercase tracking-[0.08em] ${
                          row.approved
                            ? "border-success/40 bg-success/10 text-success"
                            : "border-destructive/40 bg-destructive/10 text-destructive"
                        }`}
                      >
                        {row.approved ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <X className="h-4 w-4" />
                        )}
                        {row.approved ? "Yes" : "No"}
                      </button>
                    </td>
                    <td className="px-3 py-3">
                      <select
                        value={row.type}
                        onChange={(event) =>
                          updateRow(
                            row.id,
                            "type",
                            event.target.value as ParsedExpense["type"],
                          )
                        }
                        className="min-h-11 w-full rounded-[3px] border border-border bg-card px-2 text-sm text-foreground focus:border-primary focus:outline-none"
                      >
                        <option value="expense">Expense</option>
                        <option value="income">Income</option>
                      </select>
                    </td>
                    <td className="px-3 py-3">
                      <input
                        value={row.amount ? String(row.amount) : ""}
                        inputMode="decimal"
                        onChange={(event) =>
                          updateRow(
                            row.id,
                            "amount",
                            parseNumberInput(event.target.value),
                          )
                        }
                        className="min-h-11 w-full rounded-[3px] border border-border bg-card px-2 text-sm text-foreground focus:border-primary focus:outline-none"
                        aria-label="Amount"
                      />
                    </td>
                    <td className="px-3 py-3">
                      <select
                        value={row.category}
                        onChange={(event) =>
                          updateRow(row.id, "category", event.target.value)
                        }
                        className="min-h-11 w-full rounded-[3px] border border-border bg-card px-2 text-sm text-foreground focus:border-primary focus:outline-none"
                      >
                        {CATEGORIES.map((category) => (
                          <option key={category} value={category}>
                            {category}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-3 py-3">
                      <input
                        value={row.description}
                        onChange={(event) =>
                          updateRow(row.id, "description", event.target.value)
                        }
                        className="min-h-11 w-full min-w-48 rounded-[3px] border border-border bg-card px-2 text-sm text-foreground focus:border-primary focus:outline-none"
                        aria-label="Description"
                      />
                    </td>
                    <td className="px-3 py-3">
                      <input
                        type="date"
                        value={row.transactionDate}
                        onChange={(event) =>
                          updateRow(
                            row.id,
                            "transactionDate",
                            event.target.value,
                          )
                        }
                        className="min-h-11 w-full rounded-[3px] border border-border bg-card px-2 text-sm text-foreground focus:border-primary focus:outline-none"
                        aria-label="Transaction date"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={handleSaveApproved}
              disabled={isSaving || approvedCount === 0}
              className="flex min-h-14 flex-1 items-center justify-center gap-2 rounded-[3px] bg-primary px-5 font-mono text-[0.8rem] uppercase tracking-[0.08em] text-primary-foreground transition-opacity hover:opacity-85 disabled:opacity-50"
            >
              {isSaving ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Check className="h-5 w-5" />
              )}
              Save Approved ({approvedCount})
            </button>
            <button
              type="button"
              onClick={() => {
                setRows([]);
                setFileName(null);
                setError(null);
              }}
              disabled={isSaving}
              className="flex min-h-14 items-center justify-center gap-2 rounded-[3px] border border-border px-5 font-mono text-[0.8rem] uppercase tracking-[0.08em] text-muted transition-colors hover:border-primary hover:text-primary disabled:opacity-50"
            >
              <XCircle className="h-5 w-5" />
              Clear
            </button>
          </div>

          <p className="mt-3 text-sm text-muted">
            Approved total:{" "}
            {formatCurrency(
              rows
                .filter((row) => row.approved)
                .reduce((sum, row) => sum + row.amount, 0),
            )}
          </p>
        </>
      )}
    </section>
  );
}
