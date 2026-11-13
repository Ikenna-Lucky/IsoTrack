# Business Analytics

Rebuilt against the development backend's `GET /business/analytics`. No backend
source, schema, hosted data or deployment changed.

## Contract and definitions

- `totalShipments` and `statusBreakdown` describe every business shipment at its
  current status. Awaiting assignment is pending; active deliveries sum assigned,
  picked_up, in_transit and out_for_delivery. Failed and cancelled stay separate.
- Delivered share is delivered divided by all shipments, including pending,
  active, unsuccessful and cancelled records. It is explicitly not a delivery-
  attempt success rate. An empty business has no defined share.
- `totalRevenueKobo` is labelled Total shipment value: the backend sums all prices,
  including unpaid, failed and cancelled shipments. No collected-revenue claim is
  made. Aggregate formatting preserves kobo even near the safe-integer ceiling.
- Unsuccessful totals include returns, including received returns; the page does
  not present them as outstanding custody or held-package counts.
- `recentShipments` displays the latest ten created records, separately labelled
  from aggregate totals. Shows tracking ID, current status, route cities,
  description, created time, exact price and payment-applied flag. The full
  shipment workspace remains the place for paged records and operational actions.

The old weekly revenue chart used a partial shipment list and unsupported
pageSize parameters. It has been replaced by an all-time current-status
distribution with visible counts and percentages. No date filter, daily trend,
route ranking or payment revenue is fabricated. Zero counts have zero-width bars.
The developer-facing route-intelligence placeholder has been removed.

## Loading and existing consumers

The existing analytics query/cache key remains shared with Overview. It now uses
an abort signal and validates safe integer totals, status taxonomy, aggregate
consistency and the bounded recent projection. Validation does not discard other
shipment fields used by existing consumers. Incomplete or inconsistent responses
become query errors instead of fallback zeros.

Manual refresh and the existing 60-second refresh remain. The page distinguishes
initial loading, initial failure, successful empty data and refresh failure with
retained prior figures, showing the last successful refresh time. The existing
account-switch cache clearing remains in effect. Analytics now uses the shared
light/dark dashboard tokens; Settings and Help have not been redesigned here.

## Evidence

TypeScript, lint, all 34 frontend unit tests and isolated production build passed.
Local Docker HTTP verification created separate fictional business/driver
fixtures: 13 shipments across all eight statuses, one delivered via the actual
confirmation API, all unpaid, with latest-ten output and exact total price
including cancelled shipments. A separate empty business returned zero totals.
No real recipient email was sent.

Browser review verified empty/populated Analytics, correct 13-record aggregates
versus ten recent records, 7.7% delivered share, exact kobo display, manual refresh,
account switching, shipment-workspace navigation, light/dark and 390/768/1440px
layouts. The phone summary was revised to two columns. Network-failure states
were inspected in code and validation tested; browser lost-response/dependency
fault injection and hosted acceptance were not performed.

Next business slices: Settings, then the operational Help guide.
