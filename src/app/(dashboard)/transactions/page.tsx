"use client";

import { AddTransactionSheet } from "@/components/forms/AddTransactionSheet";
import { TransactionCard } from "@/components/shared/TransactionCard";
import { useCreateTransaction, useTransactions } from "@/hooks/use-transactions";

export default function TransactionsPage() {
  const { data = [], isLoading } = useTransactions();
  const createTransaction = useCreateTransaction();

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Transactions</h1>
      <AddTransactionSheet
        onSubmit={async (data) => {
          await createTransaction.mutateAsync(data);
        }}
      />
      {isLoading ? (
        <p className="text-sm text-slate-400">Loading transactions...</p>
      ) : (
        <div className="space-y-3">
          {data.map((transaction) => (
            <TransactionCard key={transaction.id} transaction={transaction} />
          ))}
        </div>
      )}
    </div>
  );
}
