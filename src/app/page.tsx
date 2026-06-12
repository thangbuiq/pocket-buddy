import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col justify-center gap-10 px-6 py-16">
      <section className="rounded-3xl border border-white/10 bg-gradient-to-br from-indigo-500/20 to-violet-500/10 p-8 shadow-2xl backdrop-blur">
        <p className="text-sm uppercase tracking-[0.2em] text-indigo-200">Pocket Buddy</p>
        <h1 className="mt-4 max-w-2xl text-4xl font-semibold leading-tight text-white md:text-5xl">
          Smarter budgeting with AI insights and offline-ready expense tracking.
        </h1>
        <p className="mt-4 max-w-xl text-slate-300">
          Track transactions, stay on budget, and get practical recommendations tailored to your real spending behavior.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/register" className="min-h-11 rounded-xl bg-indigo-600 px-5 py-3 font-medium text-white hover:bg-indigo-500">
            Start free
          </Link>
          <Link href="/login" className="min-h-11 rounded-xl border border-white/20 px-5 py-3 font-medium text-slate-100 hover:bg-white/10">
            Sign in
          </Link>
        </div>
      </section>
    </main>
  );
}
