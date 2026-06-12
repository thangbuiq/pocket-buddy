"use server";

import { revalidatePath } from "next/cache";
import { budgetSchema } from "@/lib/validations/budgets";

export async function createBudgetAction(input: unknown) {
  const parsed = budgetSchema.parse(input);
  await fetch(`${process.env.AUTH_URL ?? "http://localhost:3000"}/api/budgets`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(parsed),
    cache: "no-store",
  });
  revalidatePath("/budgets");
}
