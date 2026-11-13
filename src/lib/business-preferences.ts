export interface WorkspacePreferences {
  timezone: string;
  dateFormat: string;
  compactView: boolean;
  autoRefresh: boolean;
}
export const dateFormats = ["DD/MM/YYYY", "MM/DD/YYYY", "YYYY-MM-DD"] as const;
export const defaultWorkspacePreferences: WorkspacePreferences = {
  timezone: "Africa/Lagos",
  dateFormat: "DD/MM/YYYY",
  compactView: false,
  autoRefresh: true,
};
export function validTimezone(value: string) {
  try {
    new Intl.DateTimeFormat("en", { timeZone: value }).format();
    return true;
  } catch {
    return false;
  }
}
export function workspacePreferences(value?: Partial<WorkspacePreferences>): WorkspacePreferences {
  return {
    timezone:
      value?.timezone && validTimezone(value.timezone)
        ? value.timezone
        : defaultWorkspacePreferences.timezone,
    dateFormat: dateFormats.includes(value?.dateFormat as (typeof dateFormats)[number])
      ? value!.dateFormat!
      : defaultWorkspacePreferences.dateFormat,
    compactView: value?.compactView === true,
    autoRefresh: value?.autoRefresh !== false,
  };
}
export function workspaceDate(
  value: string | number | null | undefined,
  preferences: WorkspacePreferences,
) {
  if (value === null || value === undefined || value === "") return "Not recorded";
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return "Not recorded";
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-GB", {
      timeZone: preferences.timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    })
      .formatToParts(date)
      .map(({ type, value }) => [type, value]),
  );
  const formatted =
    preferences.dateFormat === "YYYY-MM-DD"
      ? `${parts.year}-${parts.month}-${parts.day}`
      : preferences.dateFormat === "MM/DD/YYYY"
        ? `${parts.month}/${parts.day}/${parts.year}`
        : `${parts.day}/${parts.month}/${parts.year}`;
  return `${formatted}, ${parts.hour}:${parts.minute}`;
}
export function workspaceRefresh(enabled: boolean, interval: number): number | false {
  return enabled ? interval : false;
}
