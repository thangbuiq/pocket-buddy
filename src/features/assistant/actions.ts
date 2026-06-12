"use server";

import { revalidatePath } from "next/cache";

export async function generateInsightsAction() {
  await fetch(`${process.env.AUTH_URL ?? "http://localhost:3000"}/api/insights`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      type: "spending_change",
      title: "Weekly trend generated",
      description: "Your transportation costs dropped 12% versus last week.",
      severity: "success",
    }),
  });
  revalidatePath("/dashboard");
}
