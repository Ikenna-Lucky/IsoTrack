"use client";

import { useEffect, useRef, useState } from "react";

interface UseInViewOptions extends IntersectionObserverInit {
  /** Disconnect after first intersection (default: true) */
  once?: boolean | undefined;
}

/**
 * Fires `inView = true` when the returned `ref` element enters the viewport.
 * By default triggers once and disconnects — perfect for scroll-reveal animations.
 */
export function useInView(options?: UseInViewOptions) {
  const { once = true, ...observerOptions } = options ?? {};
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setInView(true);
          if (once) observer.disconnect();
        } else if (!once) {
          setInView(false);
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -60px 0px", ...observerOptions },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [once]); // eslint-disable-line react-hooks/exhaustive-deps

  return { ref, inView };
}
