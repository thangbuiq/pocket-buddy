import { z } from "zod";

export const assistantMessageSchema = z.object({
  messages: z.array(
    z.object({
      id: z.string(),
      role: z.enum(["user", "assistant", "system"]),
      content: z.string().min(1),
    })
  ),
  context: z
    .object({
      periodDays: z.number().int().positive().default(90),
      summary: z.record(z.string(), z.unknown()).default({}),
    })
    .optional(),
});
