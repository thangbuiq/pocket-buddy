import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="relative flex min-h-screen w-full flex-col justify-center px-6 py-12">
      {/* Subtle radial glow behind content */}
      <div
        className="pointer-events-none absolute inset-0 overflow-hidden"
        aria-hidden="true"
      >
        <div
          className="absolute left-1/2 top-1/3 h-[600px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-[0.04]"
          style={{
            background:
              "radial-gradient(ellipse at center, #4fffb0 0%, transparent 70%)",
          }}
        />
      </div>

      <div className="relative mx-auto w-full max-w-[680px]">
        {/* Header */}
        <div className="mb-16">
          <span className="font-mono text-[0.7rem] uppercase tracking-[0.15em] text-primary">
            Walletmate
          </span>
          <h1 className="mt-6 font-serif text-[clamp(2.5rem,5vw,4rem)] font-normal leading-[1.1] tracking-[-0.02em] text-foreground">
            Smarter budgeting with AI insights and offline-ready expense
            tracking.
          </h1>
          <p className="mt-6 font-sans text-lg leading-[1.7] text-text-dim max-w-[560px]">
            Track transactions, stay on budget, and get practical
            recommendations tailored to your real spending behavior.
          </p>
        </div>

        {/* CTAs */}
        <div className="flex flex-wrap gap-3">
          <Link
            href="/login"
            className="inline-flex min-h-12 items-center justify-center rounded-[3px] bg-primary px-6 font-mono text-[0.8rem] uppercase tracking-[0.08em] text-primary-foreground transition-opacity hover:opacity-85 cursor-pointer"
          >
            Try Demo
          </Link>
        </div>
      </div>
    </main>
  );
}
