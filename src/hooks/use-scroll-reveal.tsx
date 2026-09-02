import { useEffect, useRef, useState } from "react";

type RevealOptions = {
  /** IntersectionObserver threshold (0–1). Default 0.15 */
  threshold?: number;
  /** Root margin for triggering earlier/later. Default "0px 0px -60px 0px" */
  rootMargin?: string;
  /** Once revealed, stop observing. Default true */
  once?: boolean;
};

/**
 * Attaches an IntersectionObserver to a ref and returns whether the
 * element is "revealed" (i.e. has scrolled into view).
 *
 * Respects `prefers-reduced-motion` - when the user prefers reduced
 * motion the hook immediately returns `true` so every element renders
 * without an animation.
 */
export function useScrollReveal<T extends HTMLElement = HTMLDivElement>(
  options: RevealOptions = {},
) {
  const { threshold = 0.15, rootMargin = "0px 0px -60px 0px", once = true } = options;
  const ref = useRef<T>(null);
  const [isRevealed, setIsRevealed] = useState(false);

  useEffect(() => {
    // Respect reduced-motion preference
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setIsRevealed(true);
      return;
    }

    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry && entry.isIntersecting) {
          setIsRevealed(true);
          if (once) observer.unobserve(el);
        } else if (!once) {
          setIsRevealed(false);
        }
      },
      { threshold, rootMargin },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, rootMargin, once]);

  return { ref, isRevealed };
}

/**
 * Helper that builds className strings for reveal animations.
 * Combines a base "pre-reveal" state with the revealed state.
 */
export function revealClass(
  isRevealed: boolean,
  variant: "fade-up" | "fade-in" | "scale-in" | "slide-left" | "slide-right" | "blur-in" = "fade-up",
  delayMs = 0,
): string {
  const base = "transition-all duration-700 ease-out will-change-[transform,opacity,filter]";
  const delay = delayMs > 0 ? `delay-[${delayMs}ms]` : "";

  const variants = {
    "fade-up": {
      hidden: "opacity-0 translate-y-8",
      visible: "opacity-100 translate-y-0",
    },
    "fade-in": {
      hidden: "opacity-0",
      visible: "opacity-100",
    },
    "scale-in": {
      hidden: "opacity-0 scale-95",
      visible: "opacity-100 scale-100",
    },
    "slide-left": {
      hidden: "opacity-0 -translate-x-10",
      visible: "opacity-100 translate-x-0",
    },
    "slide-right": {
      hidden: "opacity-0 translate-x-10",
      visible: "opacity-100 translate-x-0",
    },
    "blur-in": {
      hidden: "opacity-0 blur-sm scale-[0.97]",
      visible: "opacity-100 blur-0 scale-100",
    },
  };

  const v = variants[variant] || variants["fade-up"];
  const state = isRevealed ? v!.visible : v!.hidden;

  return [base, delay, state].filter(Boolean).join(" ");
}

/**
 * Stagger helper - returns the delay in ms for the nth item in a list,
 * with a configurable base offset and per-item increment.
 */
export function staggerDelay(index: number, baseMs = 0, incrementMs = 80): number {
  return baseMs + index * incrementMs;
}
