import { NextResponse } from "next/server";
import { generateObject } from "ai";
import { auth } from "@/lib/auth";
import { aiModel } from "@/lib/ai";
import { mockStore } from "@/lib/mock-db";
import { generatedInsightsSchema, insightSchema } from "@/lib/validations/insights";

export async function GET() {
  const session = await auth();
  const userId = session?.user?.id ?? "user_demo";
  return NextResponse.json(mockStore.insights.filter((item) => item.userId === userId && !item.dismissed));
}

export async function POST(request: Request) {
  const session = await auth();
  const userId = session?.user?.id ?? "user_demo";

  const existing = mockStore.insights.filter((item) => item.userId === userId);
  if (existing.length >= 5) {
    return NextResponse.json({ error: "Weekly insight limit reached" }, { status: 429 });
  }

  if (!process.env.OPENAI_API_KEY) {
    const payload = await request.json();
    const parsed = insightSchema.safeParse(payload);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

    const insight = {
      id: crypto.randomUUID(),
      userId,
      ...parsed.data,
      createdAt: new Date().toISOString(),
    };
    mockStore.insights.unshift(insight);
    return NextResponse.json(insight, { status: 201 });
  }

  const { object } = await generateObject({
    model: aiModel,
    schema: generatedInsightsSchema,
    prompt:
      "Generate up to five concise personal-finance insights for a fintech app user. Include spending changes, category trends, budget risks, recurring subscriptions, and realistic savings opportunities.",
  });

  const created = object.insights.map((item) => ({
    id: crypto.randomUUID(),
    userId,
    ...item,
    dismissed: false,
    createdAt: new Date().toISOString(),
  }));

  mockStore.insights.unshift(...created);
  return NextResponse.json(created, { status: 201 });
}
