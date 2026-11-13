export function workspaceDateTime(value?: string | number | null) {
  if (value === undefined || value === null || value === "") return "Not recorded";
  const date = new Date(value);
  return Number.isFinite(date.getTime())
    ? date.toLocaleString("en-NG", { dateStyle: "medium", timeStyle: "short" })
    : "Not recorded";
}
