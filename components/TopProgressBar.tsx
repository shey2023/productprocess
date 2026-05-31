"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

/**
 * Lightweight NProgress-style top loading bar.
 * Animates on route change (pathname or query change).
 */
export default function TopProgressBar() {
  const pathname = usePathname();
  const search = useSearchParams();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const mountedRef = useRef(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    // Skip the very first mount — only animate on subsequent changes
    if (!mountedRef.current) {
      mountedRef.current = true;
      return;
    }

    // Clear any pending timers
    timers.current.forEach(clearTimeout);
    timers.current = [];

    setVisible(true);
    setProgress(10);

    timers.current.push(setTimeout(() => setProgress(45), 60));
    timers.current.push(setTimeout(() => setProgress(75), 200));
    timers.current.push(setTimeout(() => setProgress(92), 420));
    // Finish
    timers.current.push(
      setTimeout(() => {
        setProgress(100);
        timers.current.push(
          setTimeout(() => {
            setVisible(false);
            setProgress(0);
          }, 220),
        );
      }, 620),
    );

    return () => {
      timers.current.forEach(clearTimeout);
      timers.current = [];
    };
  }, [pathname, search]);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-x-0 top-0 z-[100] h-[2px]"
      style={{
        opacity: visible ? 1 : 0,
        transition: "opacity 260ms ease-out",
      }}
    >
      <div
        className="h-full bg-gradient-to-l from-transparent via-gold to-gold-deep shadow-[0_0_10px_rgba(201,169,110,0.6)]"
        style={{
          width: `${progress}%`,
          transition: "width 260ms cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      />
    </div>
  );
}
