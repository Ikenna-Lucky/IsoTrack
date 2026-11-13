# Recipient confirmation UI

Uses the development backend's existing delivery routes; no backend migration,
source, email settings or hosted environment was changed.

- Business shipment details expose the recipient email and send/replacement form
  only at `out_for_delivery`. Setting this email is separate from linking a
  customer account. Only the assigned driver can confirm handover.
- Driver Deliveries now reads cursor pages (`limit=20`, `includeCompleted=true`),
  with continuation and explicitly scoped search/counts. Current detail versions
  drive pickup, in-transit and out-for-delivery commands. The ordinary delivered
  command has been replaced by recipient-code entry.
- Both roles read active challenge metadata every 10 seconds, show email queue/
  processing/SMTP acceptance/failure state and expiry, and support manual refresh.
  SMTP acceptance is not described as inbox receipt. No usable challenge means
  the driver must ask the business to issue a new code.
- Eight decimal characters preserve leading zeros. Expired or stale challenges
  cannot enable confirmation; replacement/expiry clears an entered code. Wrong
  codes, locked/unavailable challenges, version conflicts and resend limits have
  recovery messages. Definitive failures require refresh before a new attempt.
- Each action uses a UUID Idempotency-Key and immutable body/version. Uncertain
  outcomes retain that exact request for explicit retry, including when panels
  collapse or client routes change. A wrong code is a definitive attempt; another
  entered code gets a new key. No automatic guessing or automatic resend.
- Codes remain only in input/request memory; they are not passed to React Query
  mutation/query caches, URLs, logs or browser storage. Unresolved requests have
  an unload warning, but cannot survive forced reload, hot reload, crashes or tab
  closure. Inspect current shipment state after losing an unresolved request.
- Shared shipment styling primitives were extracted to avoid circular imports.
  Driver page styling, search/filter controls, addresses, package/weight and GPS
  controls remain. The unsupported 40% driver-pay figure on this page is now
  labelled with the actual shipment value. This does not migrate driver earnings,
  overview, sidebar summaries or GPS/socket contracts.

The old driver failed-status shortcut is no longer sent through the ordinary
status endpoint: the backend requires a structured failure reason on its separate
exception route. Failure, retry and return forms are the next focused build.

## Validation

TypeScript, lint, all 25 unit tests and an isolated production build passed.
Browser checks against a separate fictional Docker business/driver covered actual
pickup → in transit → out for delivery, business issuance, wrong-code recovery,
refresh and successful recipient-code delivery. The delivered status and timestamp
were observed in the driver UI. Phone/tablet/desktop layout checks and the existing
business theme were reviewed.

Local outbound email workers stayed disabled. The synthetic review code was
prepared privately from the local-only test configuration; no production code or
secret was displayed or added to the frontend. This verifies the browser/API
handover, not Gmail/inbox delivery. Browser lost-response fault injection, real
email delivery and hosted acceptance remain unverified.
