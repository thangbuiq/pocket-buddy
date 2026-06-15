"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface AnimatedContainerProps extends React.ComponentProps<"div"> {
  animation?: "blur-reveal" | "slide-up" | "scale-in" | "fade-up";
  delay?: number;
  duration?: number;
  once?: boolean;
}

export function AnimatedContainer({
  className,
  children,
  animation = "slide-up",
  delay = 0,
  duration = 0.5,
  once = true,
  ...props
}: AnimatedContainerProps) {
  const [isVisible, setIsVisible] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (once && ref.current) {
            observer.unobserve(ref.current);
          }
        } else if (!once) {
          setIsVisible(false);
        }
      },
      { threshold: 0.1 },
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [once]);

  const animations = {
    "blur-reveal": "blur-reveal",
    "slide-up": "slide-up",
    "scale-in": "scale-in",
    "fade-up": "animate-in",
  };

  return (
    <div
      ref={ref}
      className={cn(
        isVisible && animations[animation],
        !isVisible && "opacity-0",
        className,
      )}
      style={{
        animationDelay: `${delay}s`,
        animationDuration: `${duration}s`,
      }}
      {...props}
    >
      {children}
    </div>
  );
}
