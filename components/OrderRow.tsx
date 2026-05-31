"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import MiniTimeline from "./MiniTimeline";

type Stage = { key: string };

type Order = {
  id: string;
  customer_name: string | null;
  jewelry_type: string | null;
  current_stage: string;
  phone_number?: string | null;
};

type Props = {
  order: Order;
  stages: Stage[];
  stageLabel: string;
  isFinal: boolean;
  index?: number;
};

export default function OrderRow({
  order,
  stages,
  stageLabel,
  isFinal,
  index = 0,
}: Props) {
  return (
    <motion.li
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.05, ease: "easeOut" }}
    >
      <Link
        href={`/admin/orders/${order.id}`}
        className="group relative flex items-center gap-4 py-5 pr-5 transition-all duration-200 hover:-translate-y-px"
      >
        {/* Accent strip */}
        <span
          aria-hidden
          className={`absolute top-3 bottom-3 right-0 w-[3px] rounded-full transition-all ${
            isFinal
              ? "bg-gold"
              : "bg-hairline group-hover:bg-gold/70"
          }`}
        />

        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-2">
            <span className="font-hebrew-serif text-lg text-ink transition-colors group-hover:text-gold-deep sm:text-xl">
              {order.customer_name}
            </span>
            <span className="text-[10px] uppercase tracking-wider2 text-stone/60">
              {stageLabel}
            </span>
          </div>
          <div className="mt-1 flex items-center gap-3 text-sm text-stone/80">
            <span className="truncate">{order.jewelry_type}</span>
            {order.phone_number && (
              <span className="hidden text-xs text-stone/50 sm:inline" dir="ltr">
                {order.phone_number}
              </span>
            )}
          </div>
          <div className="mt-2">
            <MiniTimeline
              stages={stages}
              currentKey={order.current_stage}
              isFinal={isFinal}
            />
          </div>
        </div>

        <span className="shrink-0 text-stone/40 transition-all duration-200 group-hover:-translate-x-1 group-hover:text-gold">
          ←
        </span>
      </Link>
    </motion.li>
  );
}
