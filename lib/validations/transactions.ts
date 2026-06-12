import { z } from "zod";

export const transactionSchema = z.object({
  type: z.enum(["income", "expense"]),
  amount: z.number().positive(),
  category: z.string().min(2).max(50),
  description: z.string().max(200).optional(),
  transactionDate: z.string().date(),
  recurring: z.boolean().default(false),
  recurringFreq: z.enum(["daily", "weekly", "monthly", "yearly"]).optional(),
  syncStatus: z.enum(["synced", "pending"]).default("synced"),
});

export type TransactionInput = z.input<typeof transactionSchema>;
