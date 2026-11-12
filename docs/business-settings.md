# Business Settings

Business Settings uses the shared workspace light/dark theme. Profile, Notifications and Preferences drafts remain mounted while switching sections. Security unmounts to discard passwords. Drafts are memory-only and are lost when leaving or reloading the page.

## Backend mapping

- Account name and optional phone: PATCH /auth/me. Email is read-only. Avatar and emergency contact are never rewritten by this screen.
- Business name and address (street, city, state): GET/PATCH /business/profile. Unchanged addresses are omitted so a name/contact save cannot erase extra stored address fields. The backend address-edit contract supports only these three fields.
- Notifications: GET/PATCH /business/notifications, eight supported events with email/SMS pairs. Only changed event pairs are sent. The backend stores these choices but delivery workers do not currently consume them.
- Preferences: GET/PATCH /business/preferences, timezone/currency/language/dateFormat/compactView/autoRefresh. These are saved defaults; the dashboard does not yet apply them. Appearance uses the existing top-bar theme control.
- Password: direct PATCH /auth/password; backend password complexity and UTF-8 byte limit are checked before sending. Success clears local authentication immediately and opens login; the backend revokes all sessions. Passwords do not enter React Query mutation variables.
- Deactivation: existing POST /auth/deactivate flow, with current-password confirmation, retained history and server-enforced offboarding blockers. Shared component styling is opt-in so other roles keep their existing appearance.

Initial profile/preferences load failures block editing rather than allowing fallback defaults to be saved. Background refreshes do not replace initialized drafts. Sparse preference PATCH responses merge into the existing GET cache and trigger revalidation. Profile account/contact and business writes are separate backend requests; partial failures are disclosed and retries omit already-saved contact values. There is no backend version precondition for settings, so concurrent editing across browsers is not conflict-protected.

## Verification

Type checking, lint and 37 unit tests passed. An isolated production build passed. Local Docker QA used a fictional business: loaded non-default preferences, retained an unsaved profile draft across sections, saved a business-name change without rewriting its address, and saved one notification channel without changing its paired SMS or other events. Persistence was independently checked through the local API. Rendered review covered 390px, 768px and desktop, with light/dark checks. Password and deactivation submission were not performed in browser QA. Network fault injection and simultaneous-browser editing were not tested.
