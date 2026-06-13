import { z } from "zod";

export const goalSchema = z.object({
  name: z.string().min(2).max(100),
  targetAmount: z.number().positive(),
  currentAmount: z.number().min(0).default(0),
  targetDate: z.string().date().nullable().optional(),
  status: z.enum(["active", "completed", "abandoned"]).default("active"),
});

export type GoalInput = z.input<typeof goalSchema>;
