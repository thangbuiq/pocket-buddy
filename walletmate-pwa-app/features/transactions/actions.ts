"use server";

import { revalidatePath } from "next/cache";
import { transactionSchema } from "@/lib/validations/transactions";

export async function createTransactionAction(input: unknown) {
  const parsed = transactionSchema.parse(input);
  await fetch(
    `${process.env.AUTH_URL ?? "http://localhost:3000"}/api/transactions`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed),
      cache: "no-store",
    },
  );
  revalidatePath("/transactions");
}
