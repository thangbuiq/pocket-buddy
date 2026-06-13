import { z } from "zod";

export const budgetSchema = z.object({
  category: z.string().min(2).max(50),
  limitAmount: z.number().positive(),
  month: z.number().int().min(1).max(12),
  year: z
    .number()
    .int()
    .min(2000)
    .max(new Date().getFullYear() + 10),
});

export type BudgetInput = z.infer<typeof budgetSchema>;
