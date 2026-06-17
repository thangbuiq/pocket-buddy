"use client";

import { AddTransactionSheet } from "@/components/forms/AddTransactionSheet";
import { TransactionCard } from "@/components/shared/TransactionCard";
import {
  useCreateTransaction,
  useTransactions,
  useDeleteTransaction,
} from "@/hooks/use-transactions";
import { useI18n } from "@/lib/i18n";
import { Trash2 } from "lucide-react";

export default function TransactionsPage() {
  const { t } = useI18n();
  const { data = [], isLoading } = useTransactions();
  const createTransaction = useCreateTransaction();
  const deleteTransaction = useDeleteTransaction();

  return (
    <div className="space-y-8 animate-in">
      {/* Page Heading */}
      <div>
        <span className="eyebrow mb-3 block">Transactions</span>
        <h1 className="font-serif text-[2.5rem] font-normal leading-[1.1] tracking-[-0.02em] text-foreground">
          {t("transactions")}
        </h1>
      </div>

      <AddTransactionSheet
        onSubmit={async (data) => {
          await createTransaction.mutateAsync(data);
        }}
      />
      {isLoading ? (
        <p className="text-sm text-muted">{t("loading")}</p>
      ) : data.length === 0 ? (
        <p className="text-sm text-muted">{t("noTransactions")}</p>
      ) : (
        <div className="space-y-3">
          {data.map((transaction) => (
            <div key={transaction.id} className="relative group">
              <TransactionCard transaction={transaction} />
              <button
                onClick={async () => {
                  if (confirm(t("deleteConfirm"))) {
                    deleteTransaction.mutate(transaction.id);
                  }
                }}
                className="absolute right-2 top-2 rounded p-2 text-muted opacity-0 transition hover:bg-destructive/20 hover:text-destructive group-hover:opacity-100 cursor-pointer"
                aria-label="Delete transaction"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
