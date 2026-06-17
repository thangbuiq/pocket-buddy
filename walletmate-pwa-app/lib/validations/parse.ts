import { z } from "zod";

export const parsedExpenseSchema = z.object({
  type: z.enum(["expense", "income"]),
  amount: z.number().positive(),
  category: z.string(),
  description: z.string(),
  transactionDate: z.string(),
  recurring: z.boolean().default(false),
  recurringFreq: z.enum(["daily", "weekly", "monthly", "yearly"]).optional(),
  recurringEndDate: z.string().date().optional(),
});

export type ParsedExpense = z.infer<typeof parsedExpenseSchema>;
