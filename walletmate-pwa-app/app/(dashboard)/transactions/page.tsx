"use client";

import { AddTransactionSheet } from "@/components/forms/AddTransactionSheet";
import { BatchTransactionImport } from "@/components/forms/BatchTransactionImport";
import { TransactionCard } from "@/components/shared/TransactionCard";
import {
  useCreateTransaction,
  useTransactions,
  useDeleteTransaction,
  useUpdateTransaction,
} from "@/hooks/use-transactions";
import { useI18n } from "@/lib/i18n";
import { Trash2 } from "lucide-react";
import { useConfirm } from "@/components/ui/confirm-dialog";
import type { Transaction } from "@/types";

export default function TransactionsPage() {
  const { t } = useI18n();
  const { data = [], isLoading } = useTransactions();
  const createTransaction = useCreateTransaction();
  const deleteTransaction = useDeleteTransaction();
  const updateTransaction = useUpdateTransaction();
  const { confirm } = useConfirm();

  const handleCancelRecurring = async (transaction: Transaction) => {
    if (
      !(await confirm({
        title: "Cancel Recurring",
        description: t("recurringCancel") as string,
        confirmText: "Stop Recurring",
      }))
    )
      return;

    updateTransaction.mutate({
      id: transaction.id,
      payload: {
        type: transaction.type,
        amount: transaction.amount,
        category: transaction.category,
        description: transaction.description,
        transactionDate: transaction.transactionDate,
        recurring: false,
        syncStatus: transaction.syncStatus,
      },
    });
  };

  return (
    <div className="space-y-7 animate-in sm:space-y-10">
      {/* Page Heading */}
      <div>
        <span className="eyebrow mb-3 block">Transactions</span>
        <h1 className="font-serif text-[2.7rem] font-normal leading-[1.05] text-foreground sm:text-[3.25rem]">
          {t("transactions")}
        </h1>
      </div>

      <div className="space-y-4 sm:space-y-6">
        <BatchTransactionImport />
        <AddTransactionSheet
          onSubmit={async (data) => {
            await createTransaction.mutateAsync(data);
          }}
        />
      </div>

      {isLoading ? (
        <p className="text-base text-muted">{t("loading")}</p>
      ) : data.length === 0 ? (
        <p className="text-base text-muted">{t("noTransactions")}</p>
      ) : (
        <section className="space-y-3">
          <span className="eyebrow block">History</span>
          {data.map((transaction) => (
            <div key={transaction.id} className="relative group">
              <TransactionCard
                transaction={transaction}
                onCancelRecurring={handleCancelRecurring}
              />
              <button
                onClick={async () => {
                  if (
                    await confirm({
                      title: "Delete Transaction",
                      description: t("deleteConfirm") as string,
                    })
                  ) {
                    deleteTransaction.mutate(transaction.id);
                  }
                }}
                className="absolute right-2 bottom-2 flex h-11 w-11 items-center justify-center rounded-[3px] text-muted transition hover:bg-destructive/20 hover:text-destructive cursor-pointer opacity-100 md:h-auto md:w-auto md:p-2 md:opacity-0 md:group-hover:opacity-100"
                aria-label="Delete transaction"
              >
                <Trash2 className="h-5 w-5 md:h-4 md:w-4" />
              </button>
            </div>
          ))}
        </section>
      )}
    </div>
  );
}
