export const shipmentButton =
  "rounded-md border border-[var(--landing-border)] px-4 py-2.5 text-sm font-medium hover:bg-[var(--landing-tint)] disabled:opacity-50";
export const shipmentField =
  "w-full min-w-0 rounded-md border border-[var(--landing-border)] bg-[var(--landing-field)] px-3 py-3 text-sm";
export const shipmentPanel =
  "rounded-xl border border-[var(--landing-border)] bg-[var(--landing-panel)]";
export function shipmentDate(value?: string | null) {
  return value
    ? new Date(value).toLocaleString("en-NG", { dateStyle: "medium", timeStyle: "short" })
    : "Not recorded";
}
