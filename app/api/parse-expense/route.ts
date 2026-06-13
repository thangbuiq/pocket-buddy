import { NextResponse } from "next/server";
import { aiModel } from "@/lib/ai";
import { parsedExpenseSchema } from "@/lib/validations/parse";
import { z } from "zod";

export const maxDuration = 30;

const requestSchema = z.object({
  text: z.string().min(1).max(500),
  language: z.enum(["vi", "en"]).default("vi"),
});

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = requestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { text, language } = parsed.data;

  // If no OpenAI key, return error to redirect to manual input
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      { error: "AI service not configured", redirect: "/transactions" },
      { status: 503 }
    );
  }

  try {
    const today = new Date().toISOString().slice(0, 10);
    const langHint = language === "vi" ? "Vietnamese" : "English";

    const structuredModel = aiModel.withStructuredOutput(parsedExpenseSchema, {
      method: "functionCalling",
    });

    const result = await structuredModel.invoke([
      {
        role: "user",
        content: `Parse this ${langHint} text into a financial transaction. Today's date is ${today}.

Text: "${text}"

Rules:
- Default type is "expense" unless words like "lương", "salary", "received", "nhận" indicate income
- Extract amount (handle Vietnamese shortcuts: "50k" = 50000, "1tr" = 1000000, "1.5tr" = 1500000)
- Categorize into: Ăn uống, Di chuyển, Mua sắm, Giải trí, Hóa đơn, Sức khỏe, Học tập, Lương, Khác
- Description should be concise
- Date: use today if not specified, otherwise parse relative dates like "hôm qua" (yesterday)
- Return amount as a number (not string)
- Use field name "transactionDate" for the date (not "date")
- Respond in JSON format.`,
      },
    ]);

    return NextResponse.json(result);
  } catch (error) {
    console.error("AI parse error:", error);
    return NextResponse.json(
      { error: "Failed to parse transaction", redirect: "/transactions" },
      { status: 500 }
    );
  }
}
