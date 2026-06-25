"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { useQueryClient } from "@tanstack/react-query";
import {
  Check,
  FileSpreadsheet,
  Loader2,
  Upload,
  X,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { DataTable } from "@/components/ui/data-table";
import { Toggle } from "@/components/ui/toggle";
import { parseBatchFile } from "@/lib/api";
import { useI18n } from "@/lib/i18n";
import { formatCurrency } from "@/lib/utils";
import type { ParsedExpense } from "@/lib/validations/parse";

const MAX_BATCH_FILE_SIZE = 5 * 1024 * 1024;
const MAX_BATCH_TRANSACTIONS = 50;
const ACCEPTED_FILE_TYPES =
  ".csv,.xlsx,.pdf,.jpg,.jpeg,.png,.webp,.gif,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/pdf,image/jpeg,image/png,image/webp,image/gif";

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

  const toggleRow = useCallback((id: string) => {
    setRows((current) =>
      current.map((row) =>
        row.id === id ? { ...row, approved: !row.approved } : row,
      ),
    );
  }, []);

  const validateFile = (file: File) => {
    const extension = file.name.split(".").pop()?.toLowerCase();
    if (
      !["csv", "xlsx", "pdf", "jpg", "jpeg", "png", "webp", "gif"].includes(
        extension ?? "",
      )
    ) {
      return {
        title: "Unsupported file type",
        description: "Upload a CSV, XLSX, PDF, JPG, PNG, WebP, or GIF file.",
      };
    }
    if (file.size > MAX_BATCH_FILE_SIZE) {
      return {
        title: "File too large",
        description: "Upload a smaller file. Maximum file size is 5 MB.",
      };
    }
    return null;
  };

  const handleFile = async (file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      setRows([]);
      setFileName(null);
      setError(validationError.description);
      toast.error(validationError.title, {
        description: validationError.description,
      });
      return;
    }

    setError(null);
    setIsParsing(true);
    setFileName(file.name);

    try {
      const parsedRows = await parseBatchFile(file, language);
      if (parsedRows.length === 0) {
        setRows([]);
        setError("No transactions were found in this file.");
        toast.error("No transactions found", {
          description: "Try another CSV, XLSX, PDF, or image file.",
        });
      } else if (parsedRows.length > MAX_BATCH_TRANSACTIONS) {
        setRows([]);
        setError(
          `This file has ${parsedRows.length} transactions. Maximum ${MAX_BATCH_TRANSACTIONS} transactions per file.`,
        );
        toast.error("Too many transactions", {
          description: `Split transactions into multiple files. Maximum ${MAX_BATCH_TRANSACTIONS} transactions per file.`,
        });
      } else {
        setRows(
          parsedRows.map((row, index) => ({
            ...row,
            recurring: false,
            recurringFreq: undefined,
            id: `${file.name}-${index}-${row.transactionDate}-${row.amount}`,
            approved: true,
          })),
        );
        toast.success("File parsed", {
          description: `${parsedRows.length} transactions are ready for review.`,
        });
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
      console.error("[BatchTransactionImport] Parse error:", err);
      setError(message);
      toast.error("Could not parse file", {
        description: message,
      });
    } finally {
      setIsParsing(false);
    }
  };

  const columns = useMemo<ColumnDef<BatchRow>[]>(
    () => [
      {
        id: "approved",
        header: "Approve",
        cell: ({ row }) => {
          const transaction = row.original;
          return (
            <Toggle
              type="button"
              pressed={transaction.approved}
              onPressedChange={() => toggleRow(transaction.id)}
              size="sm"
              className="w-24 data-[state=off]:border-destructive/40 data-[state=off]:bg-destructive/10 data-[state=off]:text-destructive"
              aria-label={`Approve ${transaction.description}`}
            >
              {transaction.approved ? (
                <Check className="h-4 w-4" />
              ) : (
                <X className="h-4 w-4" />
              )}
              {transaction.approved ? "Yes" : "No"}
            </Toggle>
          );
        },
      },
      {
        accessorKey: "type",
        header: "Type",
        cell: ({ row }) => (
          <span
            className={`font-mono text-[0.75rem] uppercase tracking-[0.08em] ${
              row.original.type === "income"
                ? "text-success"
                : "text-destructive"
            }`}
          >
            {row.original.type}
          </span>
        ),
      },
      {
        accessorKey: "amount",
        header: "Amount",
        cell: ({ row }) => (
          <span className="whitespace-nowrap font-mono">
            {formatCurrency(row.original.amount)}
          </span>
        ),
      },
      {
        accessorKey: "category",
        header: "Category",
        cell: ({ row }) => (
          <span className="whitespace-nowrap">{row.original.category}</span>
        ),
      },
      {
        accessorKey: "description",
        header: "Description",
        cell: ({ row }) => (
          <span className="block min-w-48">{row.original.description}</span>
        ),
      },
      {
        accessorKey: "transactionDate",
        header: "Date",
        cell: ({ row }) => (
          <span className="whitespace-nowrap font-mono">
            {row.original.transactionDate}
          </span>
        ),
      },
    ],
    [toggleRow],
  );

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
      toast.success("Transactions imported", {
        description: `${approvedRows.length} approved ${
          approvedRows.length === 1 ? "transaction was" : "transactions were"
        } saved.`,
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to save rows";
      console.error("[BatchTransactionImport] Save error:", err);
      setError(message);
      toast.error("Could not import transactions", {
        description: message,
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section
      id="batch-import"
      className="rounded-[4px] border border-border bg-card p-4 sm:p-6"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <span className="font-mono text-[0.75rem] uppercase tracking-[0.12em] text-primary">
            Batch Import
          </span>
          <h2 className="mt-1 font-serif text-[1.7rem] leading-tight text-foreground sm:text-[2rem]">
            CSV / Excel / PDF / Image{" "}
            <span className="serif-accent">review</span>
          </h2>
          <p className="mt-2 max-w-xl font-sans text-sm leading-6 text-muted sm:text-base">
            CSV, XLSX, PDF, JPG, PNG, WebP, or GIF. Up to{" "}
            {MAX_BATCH_TRANSACTIONS} transactions and 5 MB per file. Upload a
            smaller file or split transactions into multiple files if needed.
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
          <DataTable
            columns={columns}
            data={rows}
            className="mt-5 min-w-full [&_table]:min-w-[760px]"
            emptyLabel="No transactions found."
          />

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
