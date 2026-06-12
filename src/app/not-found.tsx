import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-6">
      <h1 className="text-3xl font-semibold">Page not found</h1>
      <p className="text-slate-400">The page you requested does not exist.</p>
      <Link href="/dashboard" className="rounded-lg bg-indigo-600 px-4 py-2 text-white">
        Go to dashboard
      </Link>
    </main>
  );
}
