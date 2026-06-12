import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { mockStore } from "@/lib/mock-db";
import { transactionSchema } from "@/lib/validations/transactions";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  const userId = session?.user?.id ?? "user_demo";
  const payload = await request.json();
  const parsed = transactionSchema.safeParse(payload);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const index = mockStore.transactions.findIndex((item) => item.id === id && item.userId === userId);
  if (index < 0) return NextResponse.json({ error: "Not found" }, { status: 404 });

  mockStore.transactions[index] = {
    ...mockStore.transactions[index],
    ...parsed.data,
    updatedAt: new Date().toISOString(),
  };

  return NextResponse.json(mockStore.transactions[index]);
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  const userId = session?.user?.id ?? "user_demo";

  const index = mockStore.transactions.findIndex((item) => item.id === id && item.userId === userId);
  if (index < 0) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const [removed] = mockStore.transactions.splice(index, 1);
  return NextResponse.json(removed);
}
