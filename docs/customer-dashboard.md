# Customer dashboard

Updated 13 November 2026. Frontend implementation and local contract checks are
complete; rendered acceptance and hosted payment acceptance remain unverified.
No backend endpoint or schema changes were required for this work.

## Design direction

The customer needs to find a linked package, understand its recorded progress,
and resolve payment without accidentally paying twice. The direction is the same
operational workspace used by Business and Driver: restrained, legible, calm and
specific to deliveries. Tracking IDs and recorded event history are the signature
details, rather than decorative charts or invented totals.

The layout uses the existing light/dark landing tokens, Geist typography, teal
status/navigation accents, amber primary actions, 256px sidebar and shared account
header. Profile completion appears only on Overview. Mobile navigation uses a
native dialog. Shared header and workspace primitives now serve Driver and Customer
to keep their design and notification behavior consistent.

## Implemented behavior

- Overview shows loaded-record counts and recent linked shipments. These are not
  lifetime totals. It does not calculate spending from a partial page.
- My shipments uses cursor pagination (`limit` and `cursor`). Search and status
  filters explicitly apply to loaded records. A selected shipment can be opened
  directly with `?shipment=<internal ID>` even before its list page is loaded.
- Linked detail reads the participant endpoint and paginated history. It shows
  actual recorded dates, exact kobo amounts, driver contact when supplied, return
  state and separate applied-payment versus latest-payment-record information.
- Customer and public tracking use the limited public contract: status, supplied
  dates and recorded generic events. They do not promise routes, driver GPS,
  addresses or contact details from the public response. Truncated history is
  identified. Authenticated live location is a separate roadmap item.
- Settings edits validated name/phone, keeps email read-only, supports password
  change with sign-in afterward, and uses the existing deactivation flow.
- The shared inbox uses cursor pagination, loaded-unread scope, retry feedback and
  bounded mark-all-read batches.

## Payment rules

Checkout initialization sends `Idempotency-Key` and retains the original key/body
for uncertain outcomes. Requests are account-scoped and memory-only: a reload,
closed tab or sign-out loses that recovery request. Inspect payment records before
starting a replacement after losing it.

A redirect or provider `paid` flag alone is not settlement. Confirmation requires
paid, applied, no review requirement and compatible checkout state. Pending,
review, unresolved and closed states have separate feedback. A reference lookup
allows recovery from the return URL or a manually entered reference. An unresolved
return reference blocks new checkout controls until resolved. Closed/settled
references require shipment refresh before releasing that block.

Closing an unpaid checkout reconciles its current state; it is not a refund.
Cancelled shipments do not offer a new checkout. Payment copy explicitly describes
the supported sandbox flow.

## Verification

- TypeScript, lint and 55 frontend unit/HTTP-client tests passed.
- Production build passed and generated all 23 pages.
- A loopback HTTP test verifies a lost checkout acknowledgement is retried with
  the same key/body and recovers one checkout with the exact kobo amount.
- The explicit local API journey passed cursor continuation, linked detail/history,
  exact amounts, unlinked/other-account denial, public privacy and rejected legacy
  pagination. It created fictional local accounts/shipments and retained them; it
  did not initialize payments or send email.

Run that data-creating journey only when intended:

```sh
node tests/customer-workflow.local.mjs --run-local
```

The script requires a local release identity and writes its fictional review login
to the OS temporary directory. The ordinary unit suite does not run it.

## Remaining acceptance

Authenticated Customer screens have not been visually accepted. Browser navigation
was blocked during the attempted review; subsequent closeout was requested without
opening the browser. Check Overview, shipments/detail, tracking, Settings and the
inbox at narrow and wide widths in both themes, including keyboard navigation,
loading, empty and error states. Shared Driver header behavior also merits a visual
regression check.

Stripe sandbox settlement/review, actual mail receipt and cross-domain session
behavior require the separate hosted acceptance work. Local checks do not prove
those integrations. No push, merge or deployment was performed.
