import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-6">
      <h1 className="text-3xl font-semibold text-foreground">Page not found</h1>
      <p className="text-muted">The page you requested does not exist.</p>
      <Link
        href="/dashboard"
        className="rounded-lg bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90"
      >
        Go to dashboard
      </Link>
    </main>
  );
}
