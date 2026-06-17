"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";

function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.419-1.305.762-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  );
}

export default function LoginPage() {
  const [loading, setLoading] = useState<string | null>(null);

  const handleDemoLogin = async () => {
    setLoading("demo");
    await signIn("demo", { callbackUrl: "/dashboard" });
  };

  const handleGitHubLogin = async () => {
    setLoading("github");
    await signIn("github", { callbackUrl: "/dashboard" });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="font-serif text-4xl text-foreground">Welcome</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Sign in to continue
          </p>
        </div>

        <div className="space-y-3">
          <button
            onClick={handleGitHubLogin}
            disabled={loading !== null}
            className="flex w-full items-center justify-center gap-2 rounded-md bg-foreground px-4 py-3 font-medium text-background transition-colors hover:bg-foreground/90 disabled:opacity-50 cursor-pointer"
          >
            <GitHubIcon className="h-5 w-5" />
            {loading === "github" ? "Connecting..." : "Continue with GitHub"}
          </button>

          <button
            onClick={handleDemoLogin}
            disabled={loading !== null}
            className="w-full rounded-md border border-border bg-background px-4 py-3 font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground disabled:opacity-50 cursor-pointer"
          >
            {loading === "demo" ? "Loading..." : "Try Demo"}
          </button>
        </div>

        {/* Welcome Notice */}
        <div className="rounded-md border border-border bg-card p-4 text-center">
          <p className="text-sm text-muted-foreground">
            Sign in to access your workspace and continue where you left off.
          </p>
        </div>
      </div>
    </div>
  );
}
