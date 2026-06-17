"use client";

import Link from "next/link";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import Scene3D from "@/components/scene-3d";
import { SmoothScrollProvider } from "@/components/smooth-scroll-provider";
import { AnimatedContainer } from "@/components/ui/animated-container";

export default function LandingPage() {
  return (
    <SmoothScrollProvider>
      <LandingContent />
    </SmoothScrollProvider>
  );
}

function LandingContent() {
  const { theme, setTheme } = useTheme();

  return (
    <>
      <Scene3D />

      {/* Fixed top bar - logo center, theme toggle */}
      <header className="fixed top-0 left-0 right-0 z-20 flex items-center justify-between px-6 py-4">
        <div /> {/* spacer */}
        <span className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-text-dim/70">
          walletmate
        </span>
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="flex h-8 w-8 items-center justify-center rounded-[3px] text-text-dim/60 transition-colors hover:text-foreground cursor-pointer"
          aria-label="Toggle theme"
        >
          {theme === "dark" ? (
            <Sun className="h-4 w-4" />
          ) : (
            <Moon className="h-4 w-4" />
          )}
        </button>
      </header>

      <main className="relative z-10">
        {/* ── Section 1: Hero ── */}
        <section className="hero-section relative flex h-svh w-full items-center justify-center px-6 md:px-12">
          <div className="mx-auto w-full max-w-[720px]">
            <span className="block blur-reveal stagger-1 font-mono text-[0.7rem] uppercase tracking-[0.15em] text-primary">
              walletmate
            </span>
            <h1 className="blur-reveal stagger-2 mt-8 font-serif text-[clamp(2.5rem,5vw,4rem)] font-normal leading-[1.08] tracking-[-0.02em] text-foreground">
              Smarter budgeting with AI insights and offline-ready expense
              tracking.
            </h1>
            <p className="blur-reveal stagger-3 mt-8 font-sans text-lg leading-relaxed text-text-dim max-w-[580px]">
              Track transactions, stay on budget, and get practical
              recommendations tailored to your real spending behavior.
            </p>
          </div>

          <div className="scroll-indicator pointer-events-none absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 select-none">
            <span className="font-mono text-[0.6rem] uppercase tracking-[0.25em] text-text-dim/60">
              Scroll
            </span>
            <div className="scroll-dot h-1.5 w-1.5 rounded-full bg-text-dim/60" />
            <div className="h-10 w-px bg-gradient-to-b from-text-dim/40 to-transparent" />
          </div>
        </section>

        {/* ── Section 2: Features ── */}
        <section className="features-section relative flex min-h-[80vh] w-full items-center px-6 py-24 md:px-12">
          <span
            className="pointer-events-none absolute right-6 top-12 font-mono text-[clamp(6rem,15vw,12rem)] font-medium leading-none text-foreground/[0.02] select-none"
            aria-hidden="true"
          >
            02
          </span>

          <div className="mx-auto w-full max-w-[680px]">
            <span className="font-mono text-[0.7rem] uppercase tracking-[0.15em] text-primary">
              02 - Features
            </span>
            <h2 className="mt-4 font-serif text-[clamp(1.75rem,3vw,2.5rem)] font-normal leading-[1.2] tracking-[-0.01em] text-foreground">
              Built for clarity.
            </h2>

            <div className="mt-16 space-y-12">
              <AnimatedContainer
                animation="blur-reveal"
                delay={0}
                duration={0.5}
              >
                <div className="border-t border-border pt-6">
                  <h3 className="font-mono text-[0.75rem] uppercase tracking-[0.12em] text-foreground">
                    AI-Powered Parsing
                  </h3>
                  <p className="mt-2 font-sans text-base leading-relaxed text-text-dim max-w-[480px]">
                    Paste a receipt or type a transaction. Our AI extracts the
                    details instantly - amount, category, merchant.
                  </p>
                </div>
              </AnimatedContainer>

              <AnimatedContainer
                animation="blur-reveal"
                delay={0.12}
                duration={0.5}
              >
                <div className="border-t border-border pt-6">
                  <h3 className="font-mono text-[0.75rem] uppercase tracking-[0.12em] text-foreground">
                    Offline-First
                  </h3>
                  <p className="mt-2 font-sans text-base leading-relaxed text-text-dim max-w-[480px]">
                    Works without internet. Data syncs when you&apos;re back
                    online. Your finances, always accessible.
                  </p>
                </div>
              </AnimatedContainer>

              <AnimatedContainer
                animation="blur-reveal"
                delay={0.24}
                duration={0.5}
              >
                <div className="border-t border-border pt-6">
                  <h3 className="font-mono text-[0.75rem] uppercase tracking-[0.12em] text-foreground">
                    Smart Insights
                  </h3>
                  <p className="mt-2 font-sans text-base leading-relaxed text-text-dim max-w-[480px]">
                    Practical recommendations based on your real spending
                    patterns - not generic financial advice.
                  </p>
                </div>
              </AnimatedContainer>
            </div>
          </div>
        </section>

        {/* ── Section 3: CTA ── */}
        <section className="cta-section flex min-h-[60vh] w-full items-center justify-center px-6 py-24 md:px-12">
          <AnimatedContainer
            animation="slide-up"
            delay={0}
            duration={0.6}
            className="mx-auto w-full max-w-[560px] text-center"
          >
            <span className="font-mono text-[0.7rem] uppercase tracking-[0.15em] text-primary">
              03 - Start
            </span>
            <h2 className="mt-8 font-serif text-[clamp(2rem,4vw,3rem)] font-normal leading-[1.1] tracking-[-0.02em] text-foreground">
              Take control of your spending.
            </h2>
            <p className="mt-6 font-sans text-lg leading-relaxed text-text-dim">
              No credit card. No signup wall. Jump straight into the demo.
            </p>
            <div className="mt-10">
              <Link
                href="/login"
                className="inline-flex min-h-12 items-center justify-center rounded-[3px] bg-primary px-8 font-mono text-[0.8rem] uppercase tracking-[0.08em] text-primary-foreground transition-opacity hover:opacity-85 cursor-pointer"
              >
                Launch App
              </Link>
            </div>
          </AnimatedContainer>
        </section>
      </main>
    </>
  );
}
