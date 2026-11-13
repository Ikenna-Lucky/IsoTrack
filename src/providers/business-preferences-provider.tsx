"use client";
import { createContext, useContext } from "react";
import { useBusinessPreferences } from "@/hooks/use-business";
import {
  type WorkspacePreferences,
  workspaceDate,
  workspacePreferences,
} from "@/lib/business-preferences";

const PreferencesContext = createContext<WorkspacePreferences | null>(null);
export function BusinessPreferencesProvider({ children }: { children: React.ReactNode }) {
  const query = useBusinessPreferences();
  const preferences = workspacePreferences(query.data);
  return (
    <PreferencesContext.Provider value={preferences}>
      <div data-business-density={preferences.compactView ? "compact" : "comfortable"}>
        {query.isError && (
          <p
            role="status"
            className="border-b border-amber-500/30 bg-amber-500/10 px-4 py-2 text-sm"
          >
            {query.data
              ? "Could not refresh workspace preferences. Last loaded choices remain active."
              : "Workspace preferences could not load. Using Lagos time and standard spacing."}
            <button className="ml-3 min-h-11 underline" onClick={() => void query.refetch()}>
              Retry preferences
            </button>
          </p>
        )}
        {children}
      </div>
    </PreferencesContext.Provider>
  );
}
export function useWorkspaceDate() {
  const preferences = useContext(PreferencesContext);
  return (value?: string | number | null) =>
    preferences
      ? workspaceDate(value, preferences)
      : value === null || value === undefined || value === ""
        ? "Not recorded"
        : new Date(value).toLocaleString("en-NG", { dateStyle: "medium", timeStyle: "short" });
}
