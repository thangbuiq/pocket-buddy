import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getSpendingStreak } from "@/lib/transactions-store";

export async function GET() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const streak = await getSpendingStreak(userId);
  return NextResponse.json(streak);
}
