"use client";

import { useTransition } from "react";

type Props = {
  onConfirm: () => Promise<void>;
};

export default function DeleteUpdateButton({ onConfirm }: Props) {
  const [pending, startTransition] = useTransition();

  function handleClick() {
    if (!confirm("למחוק עדכון זה לצמיתות?")) return;
    startTransition(async () => {
      await onConfirm();
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending}
      className="shrink-0 rounded px-2 py-1 text-xs text-stone/40 transition hover:bg-red-50 hover:text-red-500 disabled:opacity-40"
    >
      {pending ? "…" : "מחק"}
    </button>
  );
}
