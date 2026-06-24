import { LoginForm } from "./LoginForm";

export default function LoginPage() {
  const githubOAuthEnabled = Boolean(
    process.env.GITHUB_ID && process.env.GITHUB_SECRET,
  );

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="font-serif text-4xl text-foreground">Welcome</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Sign in to continue
          </p>
        </div>

        <LoginForm githubOAuthEnabled={githubOAuthEnabled} />

        {/* Welcome Notice */}
        <div className="rounded-md border border-border bg-card p-4 text-center">
          <p className="font-serif text-sm text-muted-foreground">
            Sign in to access your workspace and continue where you left off.
          </p>
        </div>
      </div>
    </div>
  );
}
