import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { analyzeTransactions } from "@/lib/api";
import { db } from "@/db";
import { insights } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import type { AnalyzeRequest } from "@/types";

type InsightsRequest = AnalyzeRequest & {
  regenerate?: boolean;
};

export async function POST(request: Request) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as InsightsRequest;
    const { regenerate = false, ...analyzeRequest } = body;

    // Check if an insight already exists for today
    const today = new Date();
    // format YYYY-MM-DD in UTC or local timezone of the server.
    // We'll use YYYY-MM-DD from the UTC ISO string to be consistent.
    const dateStr = today.toISOString().split("T")[0];

    const existingRows = await db
      .select()
      .from(insights)
      .where(
        and(
          eq(insights.userId, userId),
          eq(insights.date, dateStr),
          eq(insights.language, body.language),
        ),
      )
      .limit(1);

    if (existingRows.length > 0 && !regenerate) {
      return NextResponse.json(existingRows[0].content);
    }

    // No existing insight for today, or the user explicitly requested a refresh.
    const newAdvice = await analyzeTransactions(analyzeRequest);

    if (existingRows.length > 0) {
      await db
        .update(insights)
        .set({ content: newAdvice })
        .where(eq(insights.id, existingRows[0].id));
    } else {
      await db.insert(insights).values({
        userId,
        date: dateStr,
        language: body.language,
        content: newAdvice,
      });
    }

    return NextResponse.json(newAdvice);
  } catch (error) {
    console.error("[Insights API Error]", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal Server Error",
      },
      { status: 500 },
    );
  }
}
