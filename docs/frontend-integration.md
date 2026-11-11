# Frontend integration

Work stays on `isoTrack-dev-branch`. The backend preview is a separate deployment;
the existing main frontend/backend are not promoted by this work.

## First integration slice

- Public registration supports business and customer accounts only.
- `/join-fleet` accepts a privately shared invitation token, the invited email,
  credentials and vehicle details. It calls the invitation endpoint, then sends
  the driver to sign in. Tokens are entered into the form, not placed in URLs.
- Session bootstrap and expired requests share one refresh; protected requests
  retry once, and late old-token responses reuse the refreshed token. Password
  confirmation failures do not trigger refresh or signout.
- Web Locks serialize refresh exchanges between tabs where supported. Tokens
  remain in memory. Browser cookie and multi-tab behavior still need deployed
  acceptance; loopback tests do not prove those browser boundaries.
- Cached queries are cleared when the authenticated account changes.
- Role redirects are restricted to the matching dashboard path segment.
- All three settings screens use password-confirmed account deactivation. The
  backend controls eligibility; conflicts are shown without erasing records.

## Environment

Use `.env.local` for local settings. Every `NEXT_PUBLIC_` value is public browser
configuration; never add backend signing secrets, database credentials or Stripe
server keys to this repository.

```dotenv
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=https://isotrack-backend-preview.onrender.com
NEXT_PUBLIC_WS_URL=https://isotrack-backend-preview.onrender.com
```

The API value is the origin without `/api/v1`. The HTTP client adds that prefix.
Public environment values are included at build time; rebuild after changing them.
The preview backend must trust the exact frontend origin via its `FRONTEND_URL`.
Do not change the live backend's origin to test the preview frontend.

## Verification

Run `npm run type-check`, `npm run lint`, `npm run test:unit`, and `npm run build`.
The session-client tests use real loopback HTTP and Axios; the route/input tests
are pure unit tests. Neither establishes a browser login against Render.

Local browser inspection covers public account choices, business-field switching,
invitation required-field errors and accessible field labels. No hosted accounts
were created or deactivated for those form checks.

On 2026-11-09, types, lint and the production build passed, along with 13/13
frontend tests and no skips or todos. Browser acceptance of authenticated settings
and the hosted cookie boundary is still pending the candidate preview release.

Before accepting this slice on preview:

1. Deploy the backend closeout candidate, including migrations 0016 and 0017, via
   the existing preview promotion workflow; confirm its CI and release identity.
2. Configure a separate frontend preview and its matching trusted backend Origin.
3. Exercise signup/login/reload, simultaneous expired requests, multiple tabs,
   logout/reload and account switching with browser cookies enabled.
4. Invite a disposable driver, reject wrong/expired/replayed invitations, then
   sign in and verify the driver workspace. Existing unlinked driver enrollment
   needs its signed-in UI in the fleet-management slice.
5. Check wrong-password and blocked deactivation without losing the session;
   deactivate an eligible disposable account and verify login is denied.

## Next slice

### Business overview and navigation

The business shell and `/business` overview now share the landing theme preference
and tokens. Navigation adapts to a native modal drawer on narrow screens. The
overview uses business-wide analytics for summary counts and a separate cursor
shipment query (`limit=6`, opaque `cursor`) for the recent list. It does not derive
business totals from loaded shipment pages. `totalRevenueKobo` is presented as
total shipment value, including unpaid/cancelled records, not collected revenue.
Failed deliveries and cancellations are separate; no unsupported fleet total,
driver earnings, payout timing or invented charts appear on the overview.

The business notification panel reads cursor pages and exposes continuation for
bounded mark-all-read batches, with mutation/load errors. It uses distinct cache
keys so legacy dashboard consumers do not receive incompatible response shapes.

This slice targets the development backend contract, including the bounded
collections build. The existing shipment workspace, fleet, analytics, driver and
customer screens still need the integration work below. Links from the overview
are navigation to those existing screens, not proof those workflows are accepted.
Backend promotion and hosted Vercel/Render session acceptance remain separate.

Local visual QA on 2026-11-11 used an external temporary API fixture with fictional
business/shipment records; no authentication bypass or sample records were added
to the application. Checks covered light/dark themes, 1440px desktop, 768px tablet
and 390px phone layouts, cursor continuation, notification read batches, empty
results, initial dependency failures and retained totals after a failed refresh.
The modal drawer was checked for Escape dismissal and focus restoration; phone
and tablet document widths did not overflow. The temporary services were stopped
after inspection. This is UI/contract-fixture evidence, not hosted API acceptance.

Wire role dashboards and fleet management to the frozen backend contract. Adopt
cursor pagination rather than treating the first page as the complete fleet,
shipment or notification collection. Add business invitation creation/revocation,
existing-driver acceptance and remove legacy mock/fallback behaviors as each
journey is integrated. Shipment commands then need versions and stable per-action
idempotency keys; payment completion must use backend settlement state.

The complete API contract is in the sibling backend repository's
`docs/frontend-handoff.md`. Dashboard, shipment, tracking and payment browser
compatibility are still work in progress; the authentication changes do not
establish that every existing button works with the updated backend.
