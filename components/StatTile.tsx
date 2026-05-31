"use client";

import { motion } from "framer-motion";

type Props = {
  value: number | string;
  label: string;
  accent?: "ink" | "gold";
  index?: number;
};

export default function StatTile({
  value,
  label,
  accent = "ink",
  index = 0,
}: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: index * 0.08, ease: "easeOut" }}
      className="group relative overflow-hidden rounded-2xl border border-hairline bg-porcelain/70 p-6 backdrop-blur-sm transition-shadow hover:shadow-soft sm:p-7"
    >
      <div
        className={`text-3xl font-normal tracking-tight sm:text-4xl ${
          accent === "gold" ? "text-gold-deep" : "text-ink"
        }`}
        style={{ fontFamily: "var(--font-playfair), var(--font-frank), serif" }}
      >
        {value}
      </div>
      <p className="mt-2 text-[10px] uppercase tracking-wider2 text-stone">
        {label}
      </p>
      {/* Bottom border accent */}
      <span
        aria-hidden
        className={`absolute bottom-0 right-0 left-0 h-px ${
          accent === "gold" ? "bg-gold" : "bg-hairline"
        }`}
      />
      <motion.span
        aria-hidden
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.9, delay: 0.35 + index * 0.08, ease: "easeOut" }}
        style={{ transformOrigin: "right" }}
        className="absolute bottom-0 right-0 left-0 h-[2px] origin-right bg-gold/70"
      />
    </motion.div>
  );
}
