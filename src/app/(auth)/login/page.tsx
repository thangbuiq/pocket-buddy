import Link from "next/link";

export default function LoginPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-6 py-12">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <h1 className="text-2xl font-semibold">Welcome back</h1>
        <p className="mt-1 text-sm text-slate-400">Sign in with Google or your email and password.</p>
        <form className="mt-6 space-y-3">
          <input type="email" placeholder="Email" className="min-h-11 w-full rounded-lg bg-slate-900 px-3" />
          <input type="password" placeholder="Password" className="min-h-11 w-full rounded-lg bg-slate-900 px-3" />
          <button className="min-h-11 w-full rounded-lg bg-indigo-600 px-4 font-medium text-white hover:bg-indigo-500" type="submit">
            Sign in
          </button>
        </form>
        <p className="mt-4 text-sm text-slate-400">
          New to Pocket Buddy? <Link href="/register" className="text-indigo-300">Create an account</Link>
        </p>
      </div>
    </main>
  );
}
