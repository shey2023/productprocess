"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState, useTransition } from "react";

type Props = {
  customerName: string;
  onConfirm: () => Promise<void>;
};

export default function DeleteOrderButton({ customerName, onConfirm }: Props) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-full border border-hairline px-5 py-2.5 text-[10px] uppercase tracking-wider2 text-stone transition-all duration-150 hover:border-red-400/60 hover:text-red-500 active:scale-[0.97]"
      >
        <svg
          viewBox="0 0 24 24"
          className="h-3.5 w-3.5 fill-none stroke-current"
          strokeWidth={1.5}
          aria-hidden
        >
          <path
            d="M4 7h16M10 11v6M14 11v6M5 7l1 13a2 2 0 002 2h8a2 2 0 002-2l1-13M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        מחק הזמנה
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => !pending && setOpen(false)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-ink/70 px-6 backdrop-blur-md safe-px safe-pb safe-pt"
            role="dialog"
            aria-modal="true"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={{ duration: 0.24, ease: "easeOut" }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-2xl border border-hairline bg-ivory p-8 shadow-lift"
            >
              <div className="text-center">
                <div className="mx-auto mb-5 grid h-12 w-12 place-items-center rounded-full border border-red-400/30 bg-red-50/40">
                  <svg
                    viewBox="0 0 24 24"
                    className="h-5 w-5 fill-none stroke-red-500/80"
                    strokeWidth={1.5}
                    aria-hidden
                  >
                    <path
                      d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <p className="eyebrow mb-3">פעולה בלתי הפיכה</p>
                <h2 className="font-hebrew-serif text-2xl font-normal text-ink">
                  למחוק את הזמנת
                  <br />
                  <span className="text-gold-deep">{customerName}</span>?
                </h2>
                <p className="mt-4 text-sm leading-relaxed text-stone">
                  כל העדכונים, התמונות והקישור האישי של הלקוח יימחקו לצמיתות.
                  לא ניתן לשחזר.
                </p>
              </div>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row-reverse">
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => {
                    startTransition(async () => {
                      await onConfirm();
                    });
                  }}
                  className="flex-1 rounded-full bg-red-500/90 px-6 py-3 text-[10px] uppercase tracking-wider2 text-ivory transition-all duration-150 hover:bg-red-600 active:scale-[0.97] disabled:opacity-60"
                >
                  {pending ? "מוחק…" : "כן, מחק לצמיתות"}
                </button>
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => setOpen(false)}
                  className="flex-1 rounded-full border border-hairline px-6 py-3 text-[10px] uppercase tracking-wider2 text-stone transition-all duration-150 hover:border-gold hover:text-ink active:scale-[0.97] disabled:opacity-60"
                >
                  ביטול
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
