import { streamText } from "ai";
import { NextResponse } from "next/server";
import { aiModel } from "@/lib/ai";
import { auth } from "@/lib/auth";
import { assistantMessageSchema } from "@/lib/validations/assistant";
import { mockStore } from "@/lib/mock-db";

export async function POST(request: Request) {
  const session = await auth();
  const userId = session?.user?.id ?? "user_demo";

  const today = new Date().toISOString().slice(0, 10);
  const rateState = mockStore.aiRateLimit.get(userId);
  if (rateState?.date === today && rateState.count >= 20) {
    return NextResponse.json({ error: "Daily AI request limit reached" }, { status: 429 });
  }

  const parsed = assistantMessageSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  mockStore.aiRateLimit.set(userId, {
    date: today,
    count: rateState?.date === today ? rateState.count + 1 : 1,
  });

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({
      reply:
        "AI assistant is configured but OPENAI_API_KEY is missing. Add it in .env.local to enable streaming insights.",
    });
  }

  const result = await streamText({
    model: aiModel,
    system:
      "You are Pocket Buddy, a practical personal finance assistant. Use concise recommendations and explain spending patterns from the provided summary context.",
    messages: parsed.data.messages,
    temperature: 0.4,
  });

  return result.toUIMessageStreamResponse();
}
