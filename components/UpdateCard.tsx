"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import Lightbox from "./Lightbox";

type Props = {
  stageLabel: string;
  stageDescription?: string | null;
  createdAt: string;
  noteText?: string | null;
  images: string[];
  index?: number;
};

export default function UpdateCard({
  stageLabel,
  stageDescription,
  createdAt,
  noteText,
  images,
  index = 0,
}: Props) {
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

  return (
    <>
      <motion.li
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.5, ease: "easeOut", delay: 0.05 * index }}
        className="relative"
      >
        {/* Timeline dot */}
        <span className="absolute -right-[25px] top-2 h-2 w-2 rounded-full bg-gold ring-2 ring-ivory sm:-right-[27px]" />

        <div className="mb-1 flex items-baseline justify-between gap-2">
          <span className="font-hebrew-serif text-lg text-ink sm:text-xl">
            {stageLabel}
          </span>
          <span className="shrink-0 text-[11px] uppercase tracking-wider2 text-stone/70">
            {new Date(createdAt).toLocaleDateString("he-IL")}
          </span>
        </div>

        {stageDescription && (
          <p className="mb-2 text-xs leading-relaxed text-stone/70 italic">{stageDescription}</p>
        )}

        {noteText && (
          <p className="mb-4 text-sm leading-relaxed text-stone">{noteText}</p>
        )}

        {images.length > 0 && (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3">
            {images.map((src, i) => (
              <button
                key={src}
                type="button"
                onClick={() => setLightboxIdx(i)}
                className="group relative aspect-square overflow-hidden rounded-lg ring-1 ring-hairline transition-all duration-200 hover:ring-gold focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={src}
                  alt=""
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                />
              </button>
            ))}
          </div>
        )}
      </motion.li>

      {lightboxIdx !== null && (
        <Lightbox
          images={images}
          startIndex={lightboxIdx}
          onClose={() => setLightboxIdx(null)}
        />
      )}
    </>
  );
}
