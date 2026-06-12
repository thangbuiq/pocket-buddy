import { z } from "zod";

export const insightSchema = z.object({
  type: z.string().min(2),
  title: z.string().min(3),
  description: z.string().min(5),
  severity: z.enum(["info", "warning", "success"]).default("info"),
  dismissed: z.boolean().default(false),
});

export const generatedInsightsSchema = z.object({
  insights: z
    .array(
      z.object({
        type: z.enum([
          "spending_change",
          "category_trend",
          "budget_risk",
          "subscription_detection",
          "savings_opportunity",
        ]),
        title: z.string().min(5),
        description: z.string().min(20),
        severity: z.enum(["info", "warning", "success"]),
      })
    )
    .max(5),
});

export type InsightInput = z.infer<typeof insightSchema>;
