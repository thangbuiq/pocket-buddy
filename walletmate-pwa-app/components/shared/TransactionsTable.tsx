"use client";

import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { DataTable } from "@/components/ui/data-table";
import { formatCurrency } from "@/lib/utils";
import type { Transaction } from "@/types";

function SortHeader({
  label,
  column,
}: {
  label: string;
  column: {
    toggleSorting: (desc?: boolean) => void;
    getIsSorted: () => false | "asc" | "desc";
  };
}) {
  return (
    <button
      type="button"
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      className="inline-flex items-center gap-1 transition-colors hover:text-primary"
    >
      {label}
      <ArrowUpDown className="h-3.5 w-3.5" />
    </button>
  );
}

export function TransactionsTable({
  transactions,
  currency = "VND",
}: {
  transactions: Transaction[];
  currency?: string;
}) {
  const columns = useMemo<ColumnDef<Transaction>[]>(
    () => [
      {
        accessorKey: "transactionDate",
        header: ({ column }) => <SortHeader label="Date" column={column} />,
        cell: ({ row }) => (
          <span className="whitespace-nowrap font-mono">
            {row.original.transactionDate}
          </span>
        ),
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
        header: ({ column }) => <SortHeader label="Amount" column={column} />,
        cell: ({ row }) => (
          <span className="whitespace-nowrap font-mono">
            {formatCurrency(row.original.amount, currency)}
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
          <span className="block min-w-48">
            {row.original.description || "No description"}
          </span>
        ),
      },
      {
        accessorKey: "recurring",
        header: "Recurring",
        cell: ({ row }) => (
          <span className="font-mono text-[0.75rem] uppercase tracking-[0.08em] text-muted">
            {row.original.recurring
              ? (row.original.recurringFreq ?? "Yes")
              : "No"}
          </span>
        ),
      },
    ],
    [currency],
  );

  return (
    <DataTable
      columns={columns}
      data={transactions}
      emptyLabel="No transactions found."
      className="[&_table]:min-w-[780px]"
    />
  );
}
