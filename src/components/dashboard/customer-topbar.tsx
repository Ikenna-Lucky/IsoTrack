"use client";
import { WorkspaceTopbar } from "./workspace-topbar";
export function CustomerTopbar(props: {
  title: string;
  onMenuClick: () => void;
  menuOpen: boolean;
}) {
  return <WorkspaceTopbar {...props} role="customer" />;
}
