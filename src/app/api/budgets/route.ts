import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { mockStore } from "@/lib/mock-db";
import { budgetSchema } from "@/lib/validations/budgets";

export async function GET() {
  const session = await auth();
  const userId = session?.user?.id ?? "user_demo";
  return NextResponse.json(mockStore.budgets.filter((budget) => budget.userId === userId));
}

export async function POST(request: Request) {
  const session = await auth();
  const userId = session?.user?.id ?? "user_demo";
  const payload = await request.json();
  const parsed = budgetSchema.safeParse(payload);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const budget = {
    id: crypto.randomUUID(),
    userId,
    ...parsed.data,
    createdAt: new Date().toISOString(),
  };

  mockStore.budgets.unshift(budget);
  return NextResponse.json(budget, { status: 201 });
}
