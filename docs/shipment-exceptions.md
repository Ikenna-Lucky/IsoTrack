# Failed deliveries, retries and returns

Uses the existing development backend. No backend source/schema, hosted
environment, email configuration or deployment changed.

## Field and action coverage

Business shipment details and driver cards read the current version, failure
reason/time, attemptNumber, actualPickup, driverId, returnState and returnedAt.
The server remains authoritative for ownership, fleet membership and custody.

| Action         | Frontend behavior                                                                                                                                                          |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| fail           | Owner or assigned driver chooses one of seven backend reasons. Private note is limited to 1,000 characters; Other requires an explanation.                                 |
| retry          | Business only; failed, no return requested, fewer than three attempts. Explains that pre-pickup retry clears assignment; post-pickup retry preserves driver and custody.   |
| return_request | Business only, failed and picked up with assigned driver. Explains that another delivery attempt will no longer be available.                                              |
| return_start   | Assigned driver only, following a return request.                                                                                                                          |
| return_receive | Business only, from requested or in-transit return. Requires an explicit physical-receipt checkbox. This is an accountable attestation, not independent proof of handover. |
| cancel_failed  | Business only, failed before recorded pickup. Preserves records and history; does not issue a refund.                                                                      |

Every action has a review step. Cancelling review preserves its note draft.
Receipt closes the workflow permanently; another delivery needs a new shipment.
The manifest and driver cards show return labels separately from shipment status.
The driver's Held packages filter excludes received returns. Search/counts cover
loaded records. Return-in-transit work is included in the existing GPS control's
tracking IDs; its legacy socket transport was not changed or verified.

## Requests and private history

`POST /shipments/:id/exceptions` sends the reviewed immutable body, current
expectedVersion and UUID Idempotency-Key. Uncertain results retain the same request
for explicit retry; definitive conflicts require reload and a new decision.
Success refreshes shipments, events, private history, analytics, drivers and
delivery metadata. The backend revokes old delivery codes.

Shipment, delivery and exception panels now share a subscribed, account-scoped
memory store. Unresolved requests disable competing actions across panels. They
survive client navigation/collapsed cards and warn on unload, but do not survive
forced reload, hot reload, crashes or tab closure. No code, note, address or
request is written to browser storage. Inspect current shipment state after losing
an unresolved request.

Private history loads on expansion using
`GET /shipments/:id/exceptions?limit=20&beforeVersion=…` and
`pagination.nextBeforeVersion`, rather than shipment cursors. It displays action,
reason, private note, actor account ID, version, attempt and date. No actor name is
invented. Notes are never copied into public tracking or public events.

## Verification

- TypeScript, lint, 30 unit tests and isolated production build passed.
- Local Docker browser journey: Other-note validation; driver failure; private
  audit; preserved review draft; business retry after pickup; second failure;
  return request; driver return transit; mandatory receipt attestation; closed
  return; cancellation before pickup at attempt three.
- Actual HTTP: pre-pickup retry clears assignment and increments attempts; fourth
  attempt denied; private-history version pagination; exact-key replay without
  duplicate audit; stale-version rejection; full return audit/custody timestamps;
  closed-return retry denied; old code unavailable; private notes absent from
  public tracking.
- Rendered review at 390/768/1440 pixels, business light/dark and driver dark.
  Corrected attempt-limit copy and removed empty dispatch sections. Browser
  warning/error log was empty during review.

Only separate fictional review accounts were used. Browser lost-response fault
injection, forced-unload recovery, real email, GPS and hosted acceptance remain
unverified. No full backend regression was rerun because backend source/schema
were unchanged. Other role dashboards and legacy earnings remain separate work.
