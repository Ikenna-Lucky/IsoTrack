"use client";
import { WorkspaceTopbar } from "./workspace-topbar";
export function DriverTopbar(props: { title: string; onMenuClick: () => void; menuOpen: boolean }) {
  return <WorkspaceTopbar {...props} role="driver" />;
}
