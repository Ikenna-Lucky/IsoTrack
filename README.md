# IsoTrack frontend

IsoTrack is a shipment and fleet management application with separate workspaces
for businesses, drivers and customers. This repository contains the Next.js
frontend. The backend is a separate service that owns authentication, shipment
rules, persistence, email delivery and Stripe integration.

## What you can do

- **Businesses:** invite drivers into a private fleet, create and assign shipments,
  review delivery progress, manage failed deliveries and returns, and view analytics.
- **Drivers:** manage availability and vehicle details, work through assigned
  deliveries, share location and confirm handover with recipient delivery codes.
- **Customers:** review linked shipments, track deliveries and use supported Stripe
  sandbox checkout flows.
- **Public visitors:** view the landing pages and limited public shipment tracking.
- **Account holders:** manage profile settings, request email verification and
  password resets, and close eligible accounts.

Business and customer accounts can register publicly. Drivers join through fleet
invitations; there is no public driver-registration option.

## Stack

Next.js 15 App Router, React 19, TypeScript, Tailwind CSS 4, TanStack Query,
Zustand, Axios, React Hook Form, Zod, Socket.IO client and MapLibre GL.

## Run locally

Use Node.js 24 and npm, matching the CI runtime. Install dependencies with the
committed `package-lock.json`.

From this repository's root:

```sh
npm ci
```

Copy `.env.local.example` to `.env.local` if you do not already have a local
configuration. In PowerShell:

```powershell
Copy-Item .env.local.example .env.local
```

Start the separate backend using its repository's setup instructions, then run:

```sh
npm run dev
```

Open <http://localhost:3000>. The example expects the backend at
<http://localhost:8000>. Change the API URL if your backend uses another port.
The landing pages can render without a backend, but login, saved data and live
tracking require it.

## Environment variables

| Variable                   | Purpose                                                 | Local example           |
| -------------------------- | ------------------------------------------------------- | ----------------------- |
| `NEXT_PUBLIC_APP_URL`      | Frontend origin used for page metadata                  | `http://localhost:3000` |
| `NEXT_PUBLIC_API_URL`      | Backend base URL for HTTP requests and Socket.IO        | `http://localhost:8000` |
| `NEXT_PUBLIC_MAPTILER_KEY` | Optional MapTiler browser key; blank uses OpenStreetMap | Leave blank             |

Do not append `/api/v1` to the API URL; the HTTP client adds it. Socket.IO uses the
same backend base URL, so no separate WebSocket variable is needed.

All `NEXT_PUBLIC_*` values are visible in the browser and included at build time.
Rebuild after changing them. Keep database credentials, signing secrets, Microsoft
mail credentials and Stripe server keys in the backend. Restrict a MapTiler browser
key to the frontend domains where it will be used.

The backend's `FRONTEND_URL` must match the frontend origin for API access and
cookie-authenticated session operations. Driver location sharing also requires
browser permission and HTTPS when hosted; localhost supports local development.

## Commands and checks

| Command              | Purpose                                                      |
| -------------------- | ------------------------------------------------------------ |
| `npm run dev`        | Start the development server with Turbopack                  |
| `npm run lint`       | Run the configured Next.js/ESLint checks                     |
| `npm run test:unit`  | Run unit and loopback HTTP/API-client tests                  |
| `npm run build`      | Create the production build and generate Next.js route types |
| `npm run type-check` | Check TypeScript, including generated route types            |
| `npm start`          | Serve an existing production build                           |
| `npm run format`     | Format the repository with Prettier; this rewrites files     |

For a clean checkout, use the CI order:

```sh
npm run lint
npm run test:unit
npm run build
npm run type-check
```

GitHub Actions runs these checks on pull requests and pushes to
`isoTrack-dev-branch`, `isotrack-preview-branch` and `main`. See [CI setup](docs/ci.md)
for the required check and deployment-gating details.

The `tests/*.local.mjs` journeys are separate, opt-in checks that create synthetic
data against a local backend. Read their instructions before running them. Unit
tests and a successful build do not replace browser or hosted acceptance checks.

## Repository layout

```text
src/app/          Pages, layouts, route metadata and global styles
src/components/   Auth, dashboard, landing, map and tracking interfaces
src/hooks/        Queries, mutations and browser subscriptions
src/lib/          API client, contracts, formatting and workflow logic
src/providers/    Auth, query-cache and business-preference providers
src/store/        In-memory authentication state
src/types/        Shared frontend types
public/           Images, logos and other static assets
tests/            Unit tests and opt-in local journeys
docs/             Feature contracts, review evidence and remaining work
.github/          Frontend CI workflow
```

## API integration

Use the backend's `/docs/` Swagger interface and `/openapi.json` for request fields,
responses, authorization and errors. For a local backend on port 8000, open
<http://localhost:8000/docs/>.

API calls go through `src/lib/api.ts`. Session restoration uses the backend's
HttpOnly refresh cookie; access tokens stay in memory. Query caches are cleared
when the signed-in account changes. See [frontend integration](docs/frontend-integration.md)
for the session and API boundaries.

## Deployment

Deploy this repository as a Next.js project on Vercel, using the repository root,
Node.js 24, `npm ci` to install and `npm run build` to build. Keep the default
Next.js output configuration.

Use separate frontend settings for IsoTrack preview and production. Each frontend
must point to its matching backend, and that backend must trust the exact frontend
origin. Use a stable frontend URL for preview integration.

If a separate Vercel project tracks `isotrack-preview-branch` as its Production
Branch, set the **IsoTrack preview values in that project's Production environment**.
Vercel's environment label refers to the project, not the purpose of your Git branch.
A separate live project tracking `main` needs its own live URLs.

The CI workflow does not deploy the frontend or make Vercel wait for GitHub checks.
Configure release gating separately. Verify login, cookie refresh, role access,
shipment workflows, maps and socket reconnection against the deployed backend
before promoting a release.

## Feature notes and remaining verification

- [Current roadmap and acceptance gaps](docs/frontend-roadmap.md)
- [Business shipment workspace](docs/shipment-workspace.md) and [fleet integration](docs/fleet-integration.md)
- [Driver dashboard](docs/driver-dashboard.md) and [customer dashboard](docs/customer-dashboard.md)
- [Live tracking](docs/live-tracking.md) and [delivery confirmation](docs/delivery-confirmation.md)
- [Account email flows](docs/account-email.md) and [business preferences](docs/business-settings.md)

Real inbox delivery requires an authorized backend email sender. The backend
currently supports Stripe sandbox payments only. Hosted session behavior, browser
and device location checks, and provider acceptance need their own verification.
Help pages provide guidance; a support service is not configured.
