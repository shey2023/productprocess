"use client";

import { motion } from "framer-motion";

type Props = {
  customerName: string;
  stageLabel: string;
  heroImage?: string;
};

export default function CompletionHero({
  customerName,
  stageLabel,
  heroImage,
}: Props) {
  return (
    <header className="mb-12 text-center sm:mb-16">
      {/* Ready badge with shimmer */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="mb-8 inline-flex"
      >
        <span className="shimmer-mask relative inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/5 px-4 py-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-gold" />
          <span className="text-[10px] uppercase tracking-wider2 text-gold-deep">
            {stageLabel}
          </span>
        </span>
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, delay: 0.15, ease: "easeOut" }}
        className="font-hebrew-serif text-4xl font-normal leading-tight text-ink sm:text-6xl"
      >
        התכשיט שלך מוכן
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.9, delay: 0.45 }}
        className="mx-auto mt-5 max-w-sm text-sm leading-relaxed text-stone sm:mt-6"
      >
        {customerName}, מלאכת היצירה הושלמה.
        <br />
        תודה שנתת לנו ללוות אותך ברגע המיוחד הזה.
      </motion.p>

      {heroImage && (
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.6, delay: 0.7, ease: "easeOut" }}
          className="mt-10 sm:mt-12"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={heroImage}
            alt=""
            className="mx-auto aspect-square w-full max-w-xs rounded-2xl object-cover shadow-lift ring-1 ring-hairline sm:max-w-md"
          />
        </motion.div>
      )}

      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.9, delay: 1.2, ease: "easeOut" }}
        className="mx-auto mt-10 h-px w-16 bg-gold sm:mt-12"
      />
    </header>
  );
}
