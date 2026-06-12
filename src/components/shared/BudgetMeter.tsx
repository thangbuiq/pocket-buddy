import { cn } from "@/lib/utils";

export function BudgetMeter({ category, used, limit }: { category: string; used: number; limit: number }) {
  const percentage = Math.min(Math.round((used / limit) * 100), 100);
  const tone = percentage >= 80 ? "bg-red-500" : percentage >= 60 ? "bg-amber-500" : "bg-emerald-500";

  return (
    <div className="space-y-2 rounded-xl border border-white/10 bg-white/5 p-4">
      <div className="flex justify-between text-sm">
        <span>{category}</span>
        <span>{percentage}%</span>
      </div>
      <div className="h-2 rounded-full bg-slate-700">
        <div className={cn("h-2 rounded-full transition-all duration-300", tone)} style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
}
