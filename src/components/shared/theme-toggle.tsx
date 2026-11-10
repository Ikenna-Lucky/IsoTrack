"use client";

import { useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";

const KEY = "isotrack-landing-theme";
const EVENT = "isotrack-theme-change";

function readTheme() {
  return document.documentElement.dataset.landingTheme === "light" ? "light" : "dark";
}

function subscribe(update: () => void) {
  const onStorage = (event: StorageEvent) => {
    if (event.key !== KEY && event.key !== null) return;
    document.documentElement.dataset.landingTheme = event.newValue === "light" ? "light" : "dark";
    update();
  };
  window.addEventListener(EVENT, update);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(EVENT, update);
    window.removeEventListener("storage", onStorage);
  };
}

export function ThemeToggle() {
  const theme = useSyncExternalStore(subscribe, readTheme, () => "dark");
  const label = theme === "dark" ? "Switch to light mode" : "Switch to dark mode";
  function toggle() {
    const next = readTheme() === "dark" ? "light" : "dark";
    document.documentElement.dataset.landingTheme = next;
    try {
      localStorage.setItem(KEY, next);
    } catch {
      /* The theme still works when storage is unavailable. */
    }
    window.dispatchEvent(new Event(EVENT));
  }
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      title={label}
      className="inline-flex size-11 shrink-0 items-center justify-center rounded-md border border-[var(--landing-border)] text-[var(--landing-ink)] hover:bg-[var(--landing-tint)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-500"
    >
      {theme === "dark" ? (
        <Sun aria-hidden="true" className="size-4" />
      ) : (
        <Moon aria-hidden="true" className="size-4" />
      )}
    </button>
  );
}
