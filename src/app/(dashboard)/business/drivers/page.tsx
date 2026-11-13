"use client";

import { useState } from "react";
import { Bike, Car, Grid2X2, List, RefreshCw, Search, Star, Truck, UserRound } from "lucide-react";
import { useFleet } from "@/hooks/use-fleet";
import { FleetDriverDetail } from "@/components/dashboard/fleet-driver-detail";
import { FleetInvitations } from "@/components/dashboard/fleet-invitations";
import type { FleetDriver } from "@/lib/fleet-contract";
import type { DriverStatus } from "@/types";
import { cn } from "@/lib/utils";

const statuses = {
  available: "Available",
  on_delivery: "On delivery",
  offline: "Offline",
} as const;
const tones = {
  available: "text-[var(--landing-accent)]",
  on_delivery: "text-[var(--landing-warning)]",
  offline: "text-[var(--landing-muted)]",
};
function DriverCard({
  driver,
  list,
  onSelect,
}: {
  driver: FleetDriver;
  list: boolean;
  onSelect: () => void;
}) {
  const Icon = driver.vehicleType === "bike" ? Bike : driver.vehicleType === "car" ? Car : Truck;
  return (
    <article
      className={cn(
        "min-w-0 rounded-xl border border-[var(--landing-border)] bg-[var(--landing-panel)] p-5",
        list && "sm:grid sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:gap-5",
      )}
    >
      <div className="flex min-w-0 gap-4">
        {driver.user.avatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={driver.user.avatar}
            alt=""
            className="size-12 shrink-0 rounded-full object-cover"
          />
        ) : (
          <span className="grid size-12 shrink-0 place-items-center rounded-full bg-[var(--landing-selection)] text-[var(--landing-accent)]">
            <UserRound className="size-5" />
          </span>
        )}
        <div className="min-w-0">
          <h3 className="break-words text-base font-semibold">{driver.user.name}</h3>
          <p className={cn("mt-1 inline-flex items-center gap-2 text-xs", tones[driver.status])}>
            <span className="size-1.5 rounded-full bg-current" />
            {statuses[driver.status]}
            {driver.user.isActive === false ? " · Account inactive" : ""}
          </p>
          <p className="mt-3 flex flex-wrap items-center gap-2 text-xs text-[var(--landing-muted)]">
            <Icon className="size-4" />
            <span className="capitalize">{driver.vehicleType}</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono">{driver.vehiclePlate}</span>
          </p>
          <p className="mt-2 break-all text-xs text-[var(--landing-muted)]">{driver.user.email}</p>
          {driver.user.phone && (
            <p className="mt-1 text-xs text-[var(--landing-muted)]">{driver.user.phone}</p>
          )}
        </div>
      </div>
      <div className={cn("mt-5", list && "sm:mt-0 sm:min-w-44")}>
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--landing-border)] pt-4 text-xs">
          <span className="text-[var(--landing-muted)]">
            {driver.totalDeliveries} profile deliveries
          </span>
          <span className="inline-flex items-center gap-1 text-[var(--landing-warning)]">
            <Star className="size-3.5" />
            {Number.isFinite(driver.rating) ? driver.rating.toFixed(1) : "—"}
            <span className="sr-only"> profile rating</span>
          </span>
        </div>
        <button
          type="button"
          onClick={onSelect}
          className="mt-3 min-h-11 w-full rounded-md border border-[var(--landing-border)] px-3 text-sm font-medium text-[var(--landing-accent)] hover:bg-[var(--landing-tint)]"
        >
          View driver<span className="sr-only"> {driver.user.name}</span>
        </button>
      </div>
    </article>
  );
}

export default function DriversPage() {
  const fleet = useFleet();
  const [filter, setFilter] = useState<DriverStatus | "all">("all");
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [selected, setSelected] = useState<FleetDriver | null>(null);
  const drivers = fleet.data?.pages.flatMap((page) => page.data) ?? [];
  const filtered = drivers.filter((driver) => {
    const text = [driver.user.name, driver.user.email, driver.vehiclePlate, driver.vehicleType]
      .join(" ")
      .toLowerCase();
    return (
      (filter === "all" || driver.status === filter) && text.includes(search.trim().toLowerCase())
    );
  });
  const counts = {
    all: drivers.length,
    available: drivers.filter((d) => d.status === "available").length,
    on_delivery: drivers.filter((d) => d.status === "on_delivery").length,
    offline: drivers.filter((d) => d.status === "offline").length,
  };

  return (
    <div className="mx-auto max-w-[1440px] space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Your private fleet<span className="text-[var(--landing-accent)]">.</span>
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--landing-muted)]">
            The people behind your deliveries. Invite drivers, review their vehicles and check
            availability before dispatch.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void fleet.refetch()}
          disabled={fleet.isFetching}
          className="inline-flex min-h-11 items-center gap-2 rounded-md border border-[var(--landing-border)] px-4 text-sm disabled:opacity-50"
        >
          <RefreshCw
            className={cn("size-4", fleet.isFetching && "animate-spin motion-reduce:animate-none")}
          />
          Refresh fleet
        </button>
      </div>
      <FleetInvitations />
      <section aria-labelledby="roster-heading" className="space-y-5">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 id="roster-heading" className="text-xl font-semibold">
              Fleet roster
            </h2>
            <p className="mt-2 text-xs leading-5 text-[var(--landing-muted)]">
              {fleet.data
                ? `${drivers.length} drivers loaded. ${fleet.hasNextPage ? "More drivers are available." : "You’ve reached the end of this list."}`
                : "Your business drivers appear here."}{" "}
              Search and status filters apply to loaded drivers.
            </p>
          </div>
          <div
            className="flex gap-2 rounded-md border border-[var(--landing-border)] p-1"
            role="group"
            aria-label="Roster layout"
          >
            {[
              { value: "grid", Icon: Grid2X2 },
              { value: "list", Icon: List },
            ].map(({ value, Icon }) => (
              <button
                type="button"
                key={value}
                aria-label={`Show ${value} view`}
                aria-pressed={view === value}
                onClick={() => setView(value as "grid" | "list")}
                className={cn(
                  "grid size-11 place-items-center rounded",
                  view === value
                    ? "bg-[var(--landing-selection)] text-[var(--landing-accent)]"
                    : "text-[var(--landing-muted)]",
                )}
              >
                <Icon className="size-4" />
              </button>
            ))}
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2" role="group" aria-label="Driver availability">
            {(["all", "available", "on_delivery", "offline"] as const).map((value) => (
              <button
                type="button"
                key={value}
                aria-pressed={filter === value}
                onClick={() => setFilter(value)}
                className={cn(
                  "inline-flex min-h-11 items-center gap-2 rounded-md border px-3 text-sm",
                  filter === value
                    ? "border-[var(--landing-accent)] bg-[var(--landing-selection)] text-[var(--landing-accent)]"
                    : "border-[var(--landing-border)] text-[var(--landing-muted)]",
                )}
              >
                {value === "all" ? "All loaded" : statuses[value]}
                <span className="text-xs tabular-nums">{fleet.data ? counts[value] : "—"}</span>
              </button>
            ))}
          </div>
          <div className="relative min-w-0 flex-1 basis-60 sm:max-w-sm">
            <label htmlFor="fleet-search" className="sr-only">
              Search loaded drivers by name, email, plate or vehicle
            </label>
            <Search className="pointer-events-none absolute left-3 top-4 size-4 text-[var(--landing-muted)]" />
            <input
              id="fleet-search"
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search loaded drivers"
              className="min-h-12 w-full rounded-md border border-[var(--landing-border)] bg-[var(--landing-field)] pl-10 pr-3 text-sm"
            />
          </div>
        </div>
        {fleet.isPending && (
          <p
            role="status"
            className="rounded-xl border border-[var(--landing-border)] bg-[var(--landing-panel)] p-10 text-sm text-[var(--landing-muted)]"
          >
            Loading your fleet…
          </p>
        )}
        {fleet.isError && (
          <div
            role="alert"
            className="rounded-lg border border-[var(--landing-border)] p-5 text-sm"
          >
            <p>
              Could not load{" "}
              {drivers.length
                ? "more fleet records. Loaded drivers are still shown."
                : "your fleet."}
            </p>
            <button
              type="button"
              onClick={() => {
                if (fleet.isFetchNextPageError) void fleet.fetchNextPage();
                else void fleet.refetch();
              }}
              className="mt-2 min-h-11 text-[var(--landing-accent)] underline"
            >
              Try again
            </button>
          </div>
        )}
        {!fleet.isPending && !fleet.isError && !filtered.length && (
          <div className="rounded-xl border border-[var(--landing-border)] bg-[var(--landing-panel)] px-6 py-12 text-center">
            <Truck className="mx-auto size-8 text-[var(--landing-accent)]" />
            <h3 className="mt-4 text-base font-medium">
              {drivers.length || search || filter !== "all"
                ? "No loaded drivers match this view"
                : "Your fleet starts with an invitation"}
            </h3>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--landing-muted)]">
              {drivers.length || search || filter !== "all"
                ? "Try another filter, clear your search or load more drivers."
                : "Create an invitation above. Drivers appear here after accepting it."}
            </p>
            {(search || filter !== "all") && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setFilter("all");
                }}
                className="mt-4 min-h-11 text-sm text-[var(--landing-accent)]"
              >
                Clear filters
              </button>
            )}
          </div>
        )}
        <div
          className={view === "grid" ? "grid gap-4 md:grid-cols-2 2xl:grid-cols-3" : "space-y-4"}
        >
          {filtered.map((driver) => (
            <DriverCard
              key={driver.id}
              driver={driver}
              list={view === "list"}
              onSelect={() => setSelected(driver)}
            />
          ))}
        </div>
        {fleet.hasNextPage && (
          <div className="text-center">
            <button
              type="button"
              onClick={() => void fleet.fetchNextPage()}
              disabled={fleet.isFetchingNextPage}
              className="min-h-12 rounded-md border border-[var(--landing-border)] px-6 text-sm text-[var(--landing-accent)] disabled:opacity-50"
            >
              {fleet.isFetchingNextPage ? "Loading…" : "Load more drivers"}
            </button>
          </div>
        )}
      </section>
      {selected && (
        <FleetDriverDetail
          driver={drivers.find((driver) => driver.id === selected.id) ?? selected}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}
