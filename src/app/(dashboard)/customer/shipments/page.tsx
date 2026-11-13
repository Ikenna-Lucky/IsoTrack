"use client";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useCustomerShipments } from "@/hooks/use-customer";
import { shipmentLabels } from "@/lib/business-overview";
import { shipmentMoney } from "@/lib/shipment-workspace";
import { workspaceDateTime } from "@/lib/workspace-format";
import { CustomerShipment } from "@/components/dashboard/customer-shipment";
import { PaymentReferenceLookup } from "@/components/dashboard/customer-payment";
import {
  WorkspaceHeading,
  WorkspaceReadState,
  workspaceButton,
  workspaceField,
  workspacePanel,
} from "@/components/dashboard/workspace-ui";
function CustomerShipments() {
  const params = useSearchParams();
  const query = useCustomerShipments();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [selected, setSelected] = useState<string | null>(params.get("shipment"));
  const requestedShipment = params.get("shipment");
  useEffect(() => setSelected(requestedShipment), [requestedShipment]);
  const [paymentBlocked, setPaymentBlocked] = useState(!!params.get("payment_reference"));
  const records = query.data?.pages.flatMap((page) => page.data) ?? [];
  const term = search.trim().toLowerCase();
  const visible = records.filter(
    (item) =>
      (status === "all" || item.status === status) &&
      [item.trackingId, item.pickupAddress.city, item.deliveryAddress.city, item.description].some(
        (value) => value.toLowerCase().includes(term),
      ),
  );
  return (
    <div className="mx-auto max-w-[1440px] space-y-8">
      <WorkspaceHeading
        eyebrow="Customer workspace"
        title="My shipments"
        action={
          <button
            className={workspaceButton}
            disabled={query.isFetching}
            onClick={() => void query.refetch()}
          >
            Refresh shipments
          </button>
        }
      >
        Open a linked shipment to review its route, recorded events and payment state.
      </WorkspaceHeading>
      <PaymentReferenceLookup
        initialReference={params.get("payment_reference") ?? ""}
        cancelled={params.get("payment_cancelled") === "1"}
        onPendingChange={setPaymentBlocked}
      />
      <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_240px]">
        <label className="text-sm">
          Search loaded shipments
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className={`${workspaceField} mt-2`}
            placeholder="Tracking ID, route or description"
          />
        </label>
        <label className="text-sm">
          Status
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className={`${workspaceField} mt-2`}
          >
            <option value="all">All statuses</option>
            {Object.entries(shipmentLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
      </div>
      <WorkspaceReadState
        pending={query.isPending}
        error={query.isError}
        retry={() => void query.refetch()}
      >
        {query.data && (
          <>
            <p className="text-xs text-[var(--landing-muted)]">
              {records.length} linked shipments loaded. Search and filters apply to loaded records
              {query.hasNextPage ? "; load more to keep looking" : ""}. Newest first.
            </p>
            {!visible.length && (
              <div className={`${workspacePanel} p-6`}>
                <h2 className="font-semibold">
                  {records.length ? "No loaded shipments match" : "No linked shipments yet"}
                </h2>
                <p className="mt-2 text-sm leading-6 text-[var(--landing-muted)]">
                  {records.length
                    ? "Change the search or load more records."
                    : "Ask the sending business to link the shipment to your customer account. You can still use public tracking with a tracking ID."}
                </p>
              </div>
            )}
            <ul className="divide-y divide-[var(--landing-border)]">
              {visible.map((item) => (
                <li key={item.id} className="py-4">
                  <button
                    aria-expanded={selected === item.id}
                    aria-controls={selected === item.id ? "selected-customer-shipment" : undefined}
                    onClick={() => setSelected(selected === item.id ? null : item.id)}
                    className="flex min-h-16 w-full flex-wrap items-center justify-between gap-4 rounded-md p-3 text-left hover:bg-[var(--landing-tint)]"
                  >
                    <span className="min-w-0">
                      <span className="block break-all font-mono text-sm font-semibold">
                        {item.trackingId}
                      </span>
                      <span className="mt-2 block text-xs text-[var(--landing-muted)]">
                        {item.pickupAddress.city} to {item.deliveryAddress.city} /{" "}
                        {workspaceDateTime(item.createdAt)}
                      </span>
                    </span>
                    <span className="text-right">
                      <span className="block text-sm text-[var(--landing-accent)]">
                        {shipmentLabels[item.status]}
                      </span>
                      <span className="mt-2 block text-xs text-[var(--landing-muted)]">
                        {shipmentMoney(item.priceKobo)} /{" "}
                        {item.isPaid ? "Payment applied" : "Payment not recorded"}
                      </span>
                    </span>
                  </button>
                  {selected === item.id && (
                    <div id="selected-customer-shipment" className="mt-3">
                      <CustomerShipment
                        key={selected}
                        id={selected}
                        paymentBlocked={paymentBlocked}
                      />
                    </div>
                  )}
                </li>
              ))}
            </ul>
            {query.hasNextPage && (
              <button
                className={workspaceButton}
                disabled={query.isFetchingNextPage}
                onClick={() => void query.fetchNextPage()}
              >
                {query.isFetchingNextPage ? "Loading..." : "Load more shipments"}
              </button>
            )}
          </>
        )}
      </WorkspaceReadState>
      {selected && !visible.some((item) => item.id === selected) && (
        <div id="selected-customer-shipment" className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">Selected shipment</h2>
            <button className={workspaceButton} onClick={() => setSelected(null)}>
              Close detail
            </button>
          </div>
          <CustomerShipment key={selected} id={selected} paymentBlocked={paymentBlocked} />
        </div>
      )}
    </div>
  );
}
export default function CustomerShipmentsPage() {
  return (
    <Suspense fallback={<p role="status">Loading shipments...</p>}>
      <CustomerShipments />
    </Suspense>
  );
}
