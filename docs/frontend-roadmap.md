# Frontend closeout

Reviewed 12 November 2026 against the Swagger/OpenAPI contract and the current
frontend. Scope is frontend work; no backend implementation or deployment changed.

| Priority | Area                        | Current state / remaining work                                                                                                                                                                                                                                                |
| -------- | --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1        | Business workflow review    | Main screens and forms exist. Recovery hardening and direct local HTTP journey checks passed in this review. Browser fault-injection acceptance remains blocked because local browser use is disabled in Work settings. Do not call this fully accepted yet.                  |
| 2        | Apply saved preferences     | Business timezone/language/date format/density/refresh choices are stored but not applied consistently. Notification delivery behavior belongs to the backend; stored settings alone do not enable channels.                                                                  |
| 3        | Driver dashboard            | Rebuild overview, Settings and Help against actual contracts. Replace unsupported 40% earnings and Friday payout claims with supported delivery history/operational summaries. Deliveries already has versioned proof/exception workflows; shared recovery fixes apply there. |
| 4        | Customer dashboard          | Align overview, cursor shipment lists, limited public versus private tracking, checkout/review/cancellation states and Settings. Payment hook still lacks initialization idempotency and treats provider-paid as confirmation without checking applied/requiresReview.        |
| 5        | Authenticated live tracking | Add token-based sockets, token rotation/reconnect/rejoin, acknowledgements, access/freshness feedback and bounded location delivery. Current socket hooks lack auth.token.                                                                                                    |
| 6        | Hosted acceptance           | Verify actual email receipt, Stripe sandbox settlement/review and cross-domain cookies, refresh, logout and multiple tabs on the selected deployments. Local HTTP results do not establish these.                                                                             |
| 7        | Frontend preview            | Connect a separate frontend preview to the matching backend candidate and verify together before promotion. No merge/push/deployment performed by this review.                                                                                                                |

Help currently supplies guidance only; no actual support service is configured.
Account recovery/verification browser pages should also be checked before launch:
backend endpoints do not by themselves establish a complete frontend flow.

## Business workflow review results

Existing dirty changes at the start of the review were preserved: shared request
memory, generation fencing and delivery-panel visibility recovery. This review
extended them with:

- Synchronous per-shipment reservation across dispatch, delivery and exception
  panels. A competing action cannot replace the original before React renders.
- Completion tied to its original request, so an old response cannot clear a newer
  pending operation after navigation/recovery.
- Same-request dispatch recovery remains accessible when shipment detail reads fail.
- Delivery state refresh no longer depends on challenge metadata after a shipment
  leaves out-for-delivery.

Requests remain memory-only, account-scoped and unavailable after forced reload,
browser crash, tab closure or hot reload. Do not claim durable offline recovery.
Inspect current records before initiating a replacement after losing the key.

Verification performed:

- 42 frontend unit/HTTP-client tests passed, including five request-memory and
  recovery tests; TypeScript and lint passed.
- Production build passed with all 23 pages generated. Local review servers were
  stopped after checks; no permanent frontend environment values were changed.
- Opt-in local API journey used fictional accounts and shipment data with the
  production Axios client against the isolated local backend, through a loopback
  fault proxy. No backend source, secrets or hosted environment was accessed.
- Invitation creation, new-driver enrollment and accepted history; exact-kobo
  shipment creation; assignment; stale-version rejection; pickup/transit/
  out-for-delivery; recipient challenge issuance and metadata.
- Failure, custody-preserving retry, second failure, return request, driver return
  transit, owner receipt, private audit and obsolete challenge unavailability.
- Lost successful creation and receipt acknowledgements recovered with identical
  key/body and `Idempotency-Replayed: true`; receipt audit appeared once.
- Injected 429 remained an uncertain retry outcome. Fault proxy confirmed repeated
  keys used identical bodies; no request payloads, passwords or tokens were logged.

Run the explicit local journey only when intended:

```sh
node tests/business-workflow.local.mjs --run-local
```

It requires the local API at 127.0.0.1:8000 and refuses non-local release identity.
It creates and retains fictional review accounts/shipments; it performs no cleanup
or hosted changes. The ordinary unit suite does not run it.

## Remaining browser acceptance for item 1

With local browser use enabled, run the actual frontend against the isolated local
API. The helper `tests/helpers/business-review-proxy.mjs` can simulate responses
lost after commit or temporary read/write rejection. Keep it loopback-only and
use fictional accounts. Its fault/state controls are manual QA facilities, not
application endpoints or production middleware.

1. Create/copy/revoke an invitation; check failed invitation creation recovery
   without blind duplicate issuance. New driver joins then signs in separately.
2. Review/create a shipment; lose the response, navigate away/back, and recover
   the same creation. Verify no duplicate and no browser-storage request data.
3. Assign/cancel with stale version and explicit reload. Lose an acknowledgement,
   collapse/reopen the record, reject detail reads, and recover the original action.
4. Issue/replace code, retain recovery if another actor fails/closes the shipment,
   and check missing/dead/expired challenge feedback. Valid-code driver handover
   needs a deliberate local test-code/email fixture; do not read backend secrets.
5. Exercise Other-note validation, retry limits and return-receipt attestation.
   Lose receipt acknowledgement, navigate/reopen and recover without duplicate audit.
6. Verify competing controls disabled, focus/announced feedback, no private data
   after account switch, and no layout overflow at 390/768/1440px in both themes.

Browser checks were attempted but the tool reported that local browser use is
disabled in Work settings. The changes have not been visually reverified in this
review. Prior slice documents retain historical browser evidence; they are not a
new passing result for the changed recovery paths.
