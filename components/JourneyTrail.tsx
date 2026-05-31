"use client";

import { motion } from "framer-motion";

type Step = { key: string; label: string };

/**
 * Customer-facing journey: shows ONLY the stages that actually happened
 * (in chronological order). The last one is the current stage.
 * Skipped stages are not shown.
 */
export default function JourneyTrail({
  steps,
}: {
  steps: Step[];
}) {
  if (steps.length === 0) return null;
  const currentIdx = steps.length - 1;

  return (
    <div className="w-full" dir="rtl">
      {/* Desktop — horizontal pill row with connectors */}
      <div className="hidden md:block">
        <div className="relative px-2">
          {/* Connector line */}
          <div className="absolute top-[14px] right-3 left-3 h-px bg-gold/40" />
          <ol className="relative flex items-start justify-between gap-2">
            {steps.map((s, i) => {
              const current = i === currentIdx;
              return (
                <motion.li
                  key={`${s.key}-${i}`}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08, duration: 0.4, ease: "easeOut" }}
                  className="relative flex flex-col items-center"
                >
                  <Dot current={current} />
                  <span
                    className={`mt-3 max-w-[8rem] truncate text-center text-[11px] tracking-wide ${
                      current ? "text-gold-deep" : "text-ink/70"
                    }`}
                  >
                    {s.label}
                  </span>
                </motion.li>
              );
            })}
          </ol>
        </div>
      </div>

      {/* Mobile — vertical with right rail */}
      <div className="md:hidden">
        <ol className="relative space-y-4 pr-6">
          <div className="absolute right-[10px] top-2 bottom-2 w-px bg-gold/40" />
          {steps.map((s, i) => {
            const current = i === currentIdx;
            return (
              <motion.li
                key={`${s.key}-${i}`}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06, duration: 0.35, ease: "easeOut" }}
                className="relative flex items-center gap-3"
              >
                <span className="absolute -right-[18px]">
                  <Dot current={current} />
                </span>
                <span
                  className={`text-sm pr-8 ${
                    current ? "text-gold-deep" : "text-ink/70"
                  }`}
                >
                  {s.label}
                </span>
              </motion.li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}

function Dot({ current }: { current: boolean }) {
  return (
    <span
      className={`relative grid h-5 w-5 place-items-center rounded-full ${
        current ? "bg-ivory ring-1 ring-gold" : "bg-gold"
      }`}
    >
      {current && (
        <span className="absolute inset-0 animate-pulse-soft rounded-full" />
      )}
      {current ? (
        <span className="h-1.5 w-1.5 rounded-full bg-gold" />
      ) : (
        // Check mark for completed
        <svg
          viewBox="0 0 24 24"
          className="h-2.5 w-2.5 fill-none stroke-ivory"
          strokeWidth={3}
          aria-hidden
        >
          <path d="M5 12l5 5L20 7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </span>
  );
}
