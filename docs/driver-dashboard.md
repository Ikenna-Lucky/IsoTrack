# Driver workspace

The Driver workspace follows the Business dashboard visual system: shared
landing-theme tokens in light/dark modes, Geist type, a 256px sidebar, 80px top
bar, matching content padding, restrained panels and teal navigation with amber
primary actions. Driver priorities are current assignments, package custody and
recipient-confirmed handover. Mobile retains direct Deliveries access alongside
the same accessible navigation-drawer pattern as Business.

Overview uses the cursor API for current assignments, including failed packages
still held by the driver. Counts are explicitly scoped to loaded records.
The existing /driver/earnings URL is retained as Delivery record, without the
unsupported 40% calculation, payout balance or Friday payment promise. Driver
records describe currently linked assignments rather than immutable lifetime
history. No earnings or support endpoint was added.

Profile and vehicle forms wait for real profile data, validate against Swagger,
send only changed keys and retain drafts across settings sections. Explicit
reload replaces drafts. Security unmounts to discard passwords and changes the
password directly without putting passwords into mutation caches. Raw driver
PATCH responses merge into the profile cache without discarding nested user data.
Driver Settings now saves independent in-app/email choices for assignments,
confirmed deliveries and failed attempts. Unsupported event choices stay stored
and are not presented as working controls. Help describes actual handover, failed-attempt,
retry and return permissions; it does not pretend to send support messages.

The notification inbox uses cursor pagination and bounded mark-read batches.
Driver UI state remounts on account change. Existing handover and exception
panels inherit workspace tokens instead of overriding them with dark colours.

Verification: 49 frontend unit/client tests, TypeScript, lint and production build
passed. Tests cover failed custody versus received returns, missing delivery
timestamps and contact/vehicle input constraints. Browser access is disabled in
Work settings: no rendered light/dark, responsive or interaction acceptance is
claimed for this revision. Run those checks at 390/768/1440px before acceptance.
Live tracking authentication remains the separate roadmap item; this revision
does not establish that the existing GPS broadcast reaches authorized viewers.


## Notification delivery update

Notification drafts survive section changes; editing sends only changed complete
channel pairs. Failed initial reads block the form. Reload saved choices replaces
the draft; background refresh does not silently overwrite edits. `push` maps to
In-app in the UI and does not mean browser push. Existing inbox history remains
when opting out. Help now explains the supported events and separate account
recovery/recipient email policies.

Verification: frontend TypeScript, lint, 49 unit/client tests and production build
passed. Backend TypeScript, lint, 105 unit tests and production build passed;
Swagger export validated. Six Driver notification tests and twelve existing
outbox integration tests passed against disposable local PostgreSQL/Redis/SMTP.
Eight migration tests passed, including fresh install, upgrades and rollback.
Migration 0018 was applied to the verified local database. The local app has
notification workers disabled, so queued app notifications will not dispatch
until a worker is deliberately configured and enabled. No external mail was sent.
Browser interaction/visual acceptance and actual inbox receipt remain unverified.
