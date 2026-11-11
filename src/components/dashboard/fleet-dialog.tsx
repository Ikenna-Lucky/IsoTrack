"use client";
import { useEffect, useRef } from "react";
import { X } from "lucide-react";

export function FleetDialog({
  title,
  children,
  onClose,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    dialog?.showModal();
    const before = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      dialog?.close();
      document.body.style.overflow = before;
    };
  }, []);
  return (
    <dialog
      ref={ref}
      aria-labelledby="fleet-dialog-heading"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      className="fixed inset-0 m-auto max-h-[90dvh] w-[calc(100%-2rem)] max-w-xl overflow-y-auto rounded-xl border border-[var(--landing-border)] bg-[var(--landing-panel)] p-0 text-[var(--landing-ink)] shadow-xl backdrop:bg-black/65"
    >
      <div>
        <div className="flex items-center justify-between gap-4 border-b border-[var(--landing-border)] px-6 py-4">
          <h2 id="fleet-dialog-heading" className="text-lg font-semibold">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="grid size-11 shrink-0 place-items-center rounded-md hover:bg-[var(--landing-tint)]"
          >
            <X className="size-5" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </dialog>
  );
}
