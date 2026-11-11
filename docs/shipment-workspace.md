# Business shipment workspace

Built against `isoTrack-dev-branch` in both repositories. No backend source or hosted database changes are required for this frontend slice.

## Contract and field coverage

| Screen                    | Backend contract and displayed fields                                                                                                                                                                                                                                                                                      |
| ------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Manifest                  | `GET /shipments?limit=20&cursor=…`; tracking ID, status, description, pickup/delivery city, created date, exact price and applied-payment flag. Search and every status filter are explicitly limited to loaded records. Continuation remains available when a filter matches none.                                        |
| Current details           | `GET /shipments/:id`; full street/city/state addresses, description, weight, existing dimensions, customer name/email/phone, recipient confirmation email, assigned driver name/email/phone/vehicle/plate, all shipment dates, attempt, failure reason and return state, optional last-reported coordinates.               |
| Payment context           | Shipment `isPaid` and latest payment amount/status/channel/created/paid timestamps shown separately. No assumption that provider-paid means payment applied; no collection/revenue claim.                                                                                                                                  |
| History                   | Independent `GET /shipments/:id/events?limit=20&cursor=…`; newest-first messages, statuses, timestamps and optional coordinates. Does not assume the detail response’s first 50 events are complete.                                                                                                                       |
| Driver selection          | `GET /drivers/available?limit=20&cursor=…`; bounded continuation, explicit loading/error/empty states. The server validates current fleet membership and availability.                                                                                                                                                     |
| Creation                  | `POST /shipments`; description, weightKg, both explicit address objects, positive integer priceKobo, optional customerEmail, recipientEmail, scheduledPickup. Customer email links an existing account; recipient email supplies the confirmation destination. Scheduling converts device-local input to an ISO timestamp. |
| Assignment / cancellation | `PATCH /shipments/:id/assign` and `DELETE /shipments/:id`; latest detail version copied into expectedVersion and stable Idempotency-Key header. Cancellation sends its JSON body and preserves the record. Pending/assigned cancellations remain server-authorized.                                                        |

Creation accepts exact NGN decimals and rejects fractional kobo, invalid/zero/overflow charges, blank addresses and invalid emails/dates. Monetary display retains two decimal places. Backend validation and authorization remain authoritative.

The former form collected pickup/recipient names and phones but never sent or saved them. It also imposed a Lagos default and a client-invented express surcharge. These unsupported intake controls have been replaced with persisted backend fields; package type/handling instructions can be entered in the description. No stored contact, dimension, payment or shipment history fields are removed. Customer IDs already attached to records remain visible through their account projection; intake links customers by email.

## Retry behavior

Each logical operation owns one UUID key and immutable request body. Network/server failures, timeouts, rate limits and in-progress responses offer an explicit same-request retry. Other failures require reloading current details before another assignment/cancellation decision. Version conflicts never silently advance the version and resubmit.

Unresolved requests stay in account-scoped module memory across client route navigation and collapsed records. Creation restores its exact review; shipment details restore the matching command. A browser unload warning protects unresolved operations. Requests are not written to browser storage and cannot survive a forced reload, tab closure, browser crash or development hot reload. After losing an unresolved request, inspect current records before starting a new action. This is not durable offline recovery.

New query keys isolate cursor responses from legacy page-based consumers. Successful writes invalidate shipments, drivers and business analytics. Conflict recovery refreshes the detail, manifest and history. Account changes already remount the business workspace and clear server query caches.

## Verification (local Docker only)

- TypeScript, lint, 22 unit tests and isolated production build passed.
- Actual HTTP verification: cursor continuation over 23 review records, recipient persistence, paged events, cancellation replay and stale-version rejection.
- Browser: load older records, scoped search, exact-charge intake/review/create, assignment, keep/confirm cancellation, stale conflict followed by explicit reload, and theme/responsive review at 390, 768 and 1440 pixels.
- Fictional review business and drivers only; hosted main/preview data untouched.

Browser fault injection for lost acknowledgements and forced-unload recovery was not performed. The retry classifier is unit-tested and backend replay verified over HTTP. Driver/customer legacy shipment hooks and payment screens are outside this slice. Delivery-code management, confirmation, failure/retry and custody/return actions remain the next focused integration.
