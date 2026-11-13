# Live tracking and driver profile location

Implemented 13 November 2026 using existing backend contracts. No new endpoint,
database migration or backend behavior change was needed. Swagger already documents
`PATCH /api/v1/drivers/me/location`; the generated specification check passed with
59 operations.

## Where to use it

- Driver → Settings → Profile → Update profile location performs a one-off GPS save.
  It does not start shipment tracking.
- Driver → Deliveries → Start sharing enables GPS reporting while that page stays
  mounted. Stop sharing, leaving the page or signing out stops new reports. It does
  not erase the last saved location. Browser permission is required; deployed use
  requires a secure context. Locked-phone/background operation is not guaranteed.
- Business and Customer → open an active linked shipment → Driver location shows
  the connection, last received coordinates and measurement age. Show position on
  map loads the map on demand. Terminal shipments have no live tracking panel;
  failed shipments with a return in transit remain eligible.
- Public tracking remains status/date/event-only. Knowing a tracking ID does not
  authorize precise location access.

## Design

The user needs to distinguish a confirmed, recent position from a disconnected or
outdated record. Panels follow the existing Business/Driver/Customer tokens and
typography: calm, legible and operational. The functional signature is the measured
position and its age, with the map secondary. No guessed route, arrival time or
default marker is presented as a real driver location.

## Contracts and limits

The profile endpoint accepts only finite bounded `lat`/`lng`. Continuous sharing
saves the profile at most once per 30 seconds per mounted sharing session. Profile
location and shipment location remain separate records.

Socket.IO connects to the API origin with `auth.token`. Token changes dispose the
old connection; access tokens are refreshed through the existing serialized HTTP
refresh path before expiry. Server disconnect/authentication failures can trigger
refresh, bounded to avoid a refresh loop. Network reconnect attempts are bounded;
the UI offers manual retry. Token/session behavior still needs hosted acceptance.

Subscriptions join again after reconnect and require a successful acknowledgement.
An idle subscription rechecks permission every 15 seconds. Denial, disconnect or
subscription disposal removes its local location state. The backend rechecks
authorization per event and before delivery. An already authorized in-flight
operation can finish during an access change; the interval is not an immediate
revocation guarantee.

Only opted-in drivers publish, using the GPS sample's measured timestamp. A send
cycle runs every five seconds without overlapping another cycle and selects at
most ten loaded eligible tracking IDs, rotating through longer lists. Publishing
is sequential and acknowledged. Duplicate accepted timestamps, stale samples and
offline GPS queues are not replayed. Partial rejection is visible and does not
prevent the remaining batch from being attempted. Larger loaded queues can mean
less frequent updates for each shipment.

The viewer validates shipment identity, coordinates and sample order. Positions
older than 30 seconds are labelled outdated. Reconnect waits for a new authorized
sample; it does not label a cached position as live. Stopping sharing has no
server-side erase operation. A previously received sample becomes outdated.

The map uses the existing MapLibre dependency, MapTiler when
`NEXT_PUBLIC_MAPTILER_KEY` is configured, otherwise OpenStreetMap raster tiles.
Attribution is retained. Tile-provider availability and terms are separate from
Socket.IO delivery. Coordinate feedback remains available if tiles fail. Choose
and verify the tile provider's production service/capacity policy before release.

## Verification

- Frontend unit/HTTP/real Socket.IO client suite: 58 tests passed.
- Frontend TypeScript and lint passed. Production build generated all 23 pages.
- Backend real Socket.IO/PostgreSQL suite: all 14 tests passed, covering anonymous
  and foreign access, assignment/fleet ownership, malformed/stale GPS, reassignment,
  session revocation/expiry, reconnect, outages, write races and transport bounds.
- Explicit local journey passed profile save/read, invalid coordinate rejection,
  non-driver rejection, authenticated subscription, acknowledged publication,
  private persistence, public privacy and reconnect/rejoin. It retained fictional
  local accounts and a shipment. No payment or external mail was sent by the script.

Run the data-creating journey deliberately, with the local API running:

```sh
node tests/live-tracking.local.mjs --run-local
```

It refuses a release identity other than `local`. Ordinary unit tests use a
loopback server and do not create application accounts or request device GPS.
Socket.IO server is a development dependency for those client tests.

## Remaining acceptance

Per the user's preference, no browser was opened for this slice. Browser GPS
permission/denial, real device movement, page/background transitions, map tiles,
keyboard behavior and narrow/wide light/dark rendering remain visually unverified.
Hosted networking, cookie/token rotation, multiple tabs and mobile background
constraints require separate deployment acceptance. Multi-instance socket delivery
still needs the backend's shared-adapter/deployment work; this implementation does
not claim distributed tracking readiness.
