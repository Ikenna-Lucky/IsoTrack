# Frontend CI

`.github/workflows/ci.yml` runs on pushes to `isoTrack-dev-branch`,
`isotrack-preview-branch` and `main`, on pull requests, and through the manual
GitHub Actions trigger. It uses Node 24 and installs from `package-lock.json`
with `npm ci`.

The `Frontend checks` job runs lint, unit/API-client tests, the production build
and a TypeScript check. Build runs before the explicit type check so a clean
checkout has Next.js's generated route types. Any failed step fails the job.
New pushes cancel older runs for the same ref.

The workflow needs no repository secrets, backend deployment, database or email
provider. Its public URLs use reserved test domains; they are build inputs, not
deployment configuration. Local manual journey scripts (`*.local.mjs`) are not
part of the unit suite. Passing CI does not establish browser behavior, hosted
session cookies, real email receipt or Stripe settlement.

After the first GitHub run, require `Frontend checks` in branch rules for preview
and main, and promote changes through pull requests. Check the rules' bypass
permissions as well. Branch rules protect merges; this workflow does not control
Vercel deployment timing. Vercel's Git integration may deploy before this job
finishes. Deployment gating needs separate hosting configuration or an explicit
deployment workflow.

Configure actual frontend/backend URLs in the corresponding Vercel environment.
This workflow neither deploys the app nor changes Vercel settings.
