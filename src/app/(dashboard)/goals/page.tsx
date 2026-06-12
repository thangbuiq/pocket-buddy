export default function GoalsPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Financial Goals</h1>
      <article className="rounded-2xl border border-white/10 bg-white/5 p-5">
        <p className="text-sm text-slate-400">Emergency Fund</p>
        <p className="mt-1 text-xl font-semibold">$4,200 / $10,000</p>
        <div className="mt-3 h-3 rounded-full bg-slate-700">
          <div className="h-3 w-[42%] rounded-full bg-indigo-500" />
        </div>
        <p className="mt-2 text-sm text-slate-400">Projected completion: March 2027</p>
      </article>
    </div>
  );
}
