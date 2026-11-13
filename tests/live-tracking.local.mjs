import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { io } from "socket.io-client";
import { createApiClient } from "../src/lib/api-client.ts";
import { subscribeToShipment } from "../src/lib/tracking-subscription.ts";
import { publishDriverLocation } from "../src/lib/publish-driver-location.ts";

if (!process.argv.includes("--run-local"))
  throw new Error("Use --run-local; creates fictional local accounts and a shipment.");
const origin = "http://127.0.0.1:8000";
const suffix = randomUUID().slice(0, 8),
  password = `TrackingReview${randomUUID()}A1`;
const sockets = [];
let subscription;
function client() {
  let token;
  const session = createApiClient(`${origin}/api/v1`);
  session.register({
    get: () => token,
    set: (value) => {
      token = value.accessToken;
    },
    clear: () => {
      token = null;
    },
  });
  return {
    api: session.client,
    auth(value) {
      token = value;
    },
    socket() {
      const socket = io(origin, {
        auth: { token },
        transports: ["websocket"],
        autoConnect: false,
        reconnection: false,
      });
      sockets.push(socket);
      return socket;
    },
  };
}
async function waitFor(predicate) {
  const until = Date.now() + 8000;
  while (!predicate()) {
    if (Date.now() > until) throw new Error("Timed out waiting for local tracking state");
    await new Promise((resolve) => setTimeout(resolve, 20));
  }
}
async function main() {
  const release = await fetch(`${origin}/health/release`, {
    signal: AbortSignal.timeout(3000),
    redirect: "error",
  });
  assert.equal((await release.json()).environment, "local");
  const owner = client(),
    customer = client(),
    driver = client();
  for (const [account, role] of [
    [owner, "business"],
    [customer, "customer"],
  ]) {
    const value = (
      await account.api.post("/auth/register", {
        name: "Local Tracking Review",
        email: `${role}-tracking-${suffix}@example.test`,
        password,
        role,
        ...(role === "business" ? { businessName: "Local Tracking Review" } : {}),
      })
    ).data.data;
    account.auth(value.accessToken);
  }
  const driverEmail = `driver-tracking-${suffix}@example.test`;
  const invitation = (await owner.api.post("/driver-invitations", { email: driverEmail })).data
    .data;
  const membership = (
    await owner.api.post("/driver-invitations/accept", {
      token: invitation.token,
      email: driverEmail,
      name: "Local Tracking Driver",
      password,
      vehicleType: "bike",
      vehiclePlate: `QA-${suffix}`,
    })
  ).data.data;
  driver.auth(
    (await driver.api.post("/auth/login", { email: driverEmail, password })).data.data.accessToken,
  );
  await driver.api.patch("/drivers/me/location", { lat: 6.5, lng: 3.4 });
  const profile = (await driver.api.get("/drivers/me")).data.data;
  assert.equal(profile.currentLocation.lat, 6.5);
  assert.equal(profile.currentLocation.lng, 3.4);
  await assert.rejects(
    driver.api.patch("/drivers/me/location", { lat: 91, lng: 3.4 }),
    (e) => e.response?.status === 400,
  );
  await assert.rejects(
    customer.api.patch("/drivers/me/location", { lat: 6.5, lng: 3.4 }),
    (e) => e.response?.status === 403,
  );
  const shipment = (
    await owner.api.post(
      "/shipments",
      {
        description: "Fictional live tracking review",
        weightKg: 1,
        priceKobo: 250001,
        customerEmail: `customer-tracking-${suffix}@example.test`,
        pickupAddress: { street: "Fictional pickup", city: "Ikeja", state: "Lagos" },
        deliveryAddress: { street: "Fictional dropoff", city: "Yaba", state: "Lagos" },
      },
      { headers: { "Idempotency-Key": randomUUID() } },
    )
  ).data.data;
  await owner.api.patch(
    `/shipments/${shipment.id}/assign`,
    { driverId: membership.driverId, expectedVersion: shipment.version },
    { headers: { "Idempotency-Key": randomUUID() } },
  );
  const viewer = customer.socket(),
    publisher = driver.socket();
  let state;
  subscription = subscribeToShipment(viewer, shipment.trackingId, (next) => {
    state = next;
  });
  viewer.connect();
  publisher.connect();
  await waitFor(() => state?.joined && publisher.connected);
  const result = await publishDriverLocation(
    publisher,
    [shipment.trackingId],
    { lat: 6.51, lng: 3.41, timestamp: Date.now() },
    new Map(),
    () => true,
  );
  assert.equal(result.accepted, 1);
  await waitFor(() => state?.location);
  assert.equal(state.location.lat, 6.51);
  const detail = (await customer.api.get(`/shipments/${shipment.id}`)).data.data;
  assert.equal(detail.currentLocation.lat, 6.51);
  const publicRecord = (await customer.api.get(`/track/${shipment.trackingId}`)).data.data;
  assert.equal("currentLocation" in publicRecord, false);
  viewer.disconnect();
  assert.equal(state.location, null);
  viewer.connect();
  await waitFor(() => state.joined);
  assert.equal(state.location, null);
  const denied = await viewer.timeout(5000).emitWithAck("shipment:join", "IST-UNKNOWN-REVIEW");
  assert.equal(denied.code, "FORBIDDEN");
  console.log(
    "PASS: profile GPS save/read and validation, role rejection, authenticated client subscription, acknowledged publication, private persistence, public privacy, reconnect/rejoin and unknown-shipment denial. Fictional local records retained.",
  );
}
try {
  await main();
} catch (error) {
  console.error(
    `Local tracking check failed (${error.response?.status ?? error.code ?? error.name ?? "unknown"}); credentials and request bodies omitted.`,
  );
  process.exitCode = 1;
} finally {
  subscription?.dispose();
  for (const socket of sockets) socket.disconnect();
}
