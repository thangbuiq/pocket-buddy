import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { mockStore } from "@/lib/mock-db";
import { budgetSchema } from "@/lib/validations/budgets";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  const userId = session?.user?.id ?? "user_demo";
  const payload = await request.json();
  const parsed = budgetSchema.safeParse(payload);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const index = mockStore.budgets.findIndex((item) => item.id === id && item.userId === userId);
  if (index < 0) return NextResponse.json({ error: "Not found" }, { status: 404 });

  mockStore.budgets[index] = { ...mockStore.budgets[index], ...parsed.data };
  return NextResponse.json(mockStore.budgets[index]);
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  const userId = session?.user?.id ?? "user_demo";

  const index = mockStore.budgets.findIndex((item) => item.id === id && item.userId === userId);
  if (index < 0) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const [removed] = mockStore.budgets.splice(index, 1);
  return NextResponse.json(removed);
}
