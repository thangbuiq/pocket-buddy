import { z } from "zod";

export const parsedExpenseSchema = z.object({
  type: z.enum(["expense", "income"]),
  amount: z.number().positive(),
  category: z.string(),
  description: z.string(),
  transactionDate: z.string(),
});

export type ParsedExpense = z.infer<typeof parsedExpenseSchema>;
