import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { mockStore } from "@/lib/mock-db";
import { transactionSchema } from "@/lib/validations/transactions";

export async function GET() {
  const session = await auth();
  const userId = session?.user?.id ?? "user_demo";
  return NextResponse.json(mockStore.transactions.filter((transaction) => transaction.userId === userId));
}

export async function POST(request: Request) {
  const session = await auth();
  const userId = session?.user?.id ?? "user_demo";

  const payload = await request.json();
  const parsed = transactionSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const transaction = {
    id: crypto.randomUUID(),
    userId,
    ...parsed.data,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  mockStore.transactions.unshift(transaction);
  return NextResponse.json(transaction, { status: 201 });
}
