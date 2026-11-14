# Account email flows

Signup requests verification after the backend confirms account creation. If the
email request fails, account creation is retained and the user can request again
on `/verify-email`. Verification remains optional for the existing login policy.
The driver invitation flow still ends at sign-in; it does not pretend enrollment
is proof of email verification. Existing users can open Verify email from sign-in.

The new routes use the existing auth layout, typography and light/dark tokens:

- `/verify-email`: request a link, or explicitly POST the email fragment proof.
- `/forgot-password`: request recovery with a generic response for eligible and
  ineligible accounts.
- `/reset-password`: submit a single-use proof and validated new password, clear
  local auth after success and direct the user back to sign-in.

Email links carry `#token=...`, never an access JWT. Proofs are validated, kept only
in component memory and removed from browser history on initial capture. They are
not submitted on GET/page mount or placed in query/mutation caches, storage or
analytics. Confirmation pages use no-referrer/noindex metadata. Reopen the original
email link after reload. Invalid/expired/used links offer a new request.

The backend's configured Outlook sender sends automatically through Microsoft
Graph once authorized and workers are enabled. Frontend code contains no Microsoft
credentials. HTTP request acceptance is not recipient inbox delivery. The sender
and hosted URLs can be supplied through backend/deployment environment settings
later; local development works with mail workers disabled.

Verification evidence: frontend TypeScript/lint and 59 tests passed; production
build generated 26 pages. Backend HTTP integration covers actual proof consumption,
expiry, reuse, credential binding and session invalidation. Browser rendering and
actual hosted inbox/Stripe/cross-domain session acceptance remain unverified.
