import Link from "next/link";

export default function RegisterPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-6 py-12">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <h1 className="text-2xl font-semibold">Create your account</h1>
        <p className="mt-1 text-sm text-slate-400">Set up your profile to start tracking money confidently.</p>
        <form className="mt-6 space-y-3">
          <input type="text" placeholder="Full name" className="min-h-11 w-full rounded-lg bg-slate-900 px-3" />
          <input type="email" placeholder="Email" className="min-h-11 w-full rounded-lg bg-slate-900 px-3" />
          <input type="password" placeholder="Password" className="min-h-11 w-full rounded-lg bg-slate-900 px-3" />
          <button className="min-h-11 w-full rounded-lg bg-indigo-600 px-4 font-medium text-white hover:bg-indigo-500" type="submit">
            Create account
          </button>
        </form>
        <p className="mt-4 text-sm text-slate-400">
          Already have an account? <Link href="/login" className="text-indigo-300">Sign in</Link>
        </p>
      </div>
    </main>
  );
}
