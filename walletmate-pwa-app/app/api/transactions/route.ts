import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createTransaction, getTransactions } from "@/lib/transactions-store";
import { transactionSchema } from "@/lib/validations/transactions";

export async function GET() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await getTransactions(userId);
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = await request.json();
  const parsed = transactionSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const transaction = await createTransaction(userId, parsed.data);
  return NextResponse.json(transaction, { status: 201 });
}
