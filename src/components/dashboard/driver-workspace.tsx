"use client";
import { driverDate } from "@/lib/driver-workspace";
export {
  workspacePanel as driverPanel,
  workspaceButton as driverButton,
  workspaceField as driverField,
  WorkspaceHeading as DriverHeading,
  WorkspaceReadState as DriverReadState,
} from "./workspace-ui";
export function DriverRecordScope({
  count,
  more,
  updatedAt,
}: {
  count: number;
  more: boolean;
  updatedAt: number;
}) {
  return (
    <p role="status" className="text-xs leading-5 text-[var(--landing-muted)]">
      {count} assignments loaded{more ? "; more records are available" : "; end of current list"}.
      Counts describe loaded records, not lifetime totals.{" "}
      {updatedAt > 0 && `Last refreshed ${driverDate(new Date(updatedAt).toISOString())}.`} Times
      use your device timezone.
    </p>
  );
}
