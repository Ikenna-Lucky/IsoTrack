import assert from "node:assert/strict";
import { test } from "node:test";
import { createServer } from "node:http";
import { Server } from "socket.io";
import { io } from "socket.io-client";
import { acceptedLocation, locationIsFresh, trackingAllowed } from "../src/lib/live-tracking.ts";
import { publishDriverLocation } from "../src/lib/publish-driver-location.ts";
import { subscribeToShipment } from "../src/lib/tracking-subscription.ts";
const sample = (timestamp = Date.now()) => ({ lat: 6.5, lng: 3.4, timestamp });

test("location validation isolates shipments, rejects reordered/future GPS and distinguishes stale positions", () => {
  const now = Date.now();
  const value = { trackingId: "IST-A", ...sample(now) };
  assert.ok(acceptedLocation(value, "IST-A", now - 1, now));
  for (const changed of [
    { trackingId: "IST-B" },
    { lat: 91 },
    { lng: -181 },
    { timestamp: now + 5001 },
    { speed: 101 },
    { heading: 360 },
  ])
    assert.equal(acceptedLocation({ ...value, ...changed }, "IST-A", now - 1, now), null);
  assert.equal(acceptedLocation(value, "IST-A", now, now), null);
  assert.equal(locationIsFresh(now - 30001, now), false);
  assert.equal(locationIsFresh(now, now), true);
  assert.equal(trackingAllowed("delivered"), false);
  assert.equal(trackingAllowed("failed", "received"), false);
  assert.equal(trackingAllowed("failed", "in_transit"), true);
});

test("publisher requires acknowledgements, bounds work, skips duplicate samples and never queues stale GPS", async () => {
  const sent = [];
  let active = true;
  const socket = {
    connected: true,
    timeout: () => ({
      emitWithAck: async (event, payload) => {
        assert.equal(event, "driver:location");
        sent.push(payload);
        if (payload.trackingId === "denied") return { ok: false, code: "LOCATION_REJECTED" };
        if (payload.trackingId === "lost") throw new Error("Acknowledgement lost");
        if (payload.trackingId === "stop") active = false;
        return { ok: true };
      },
    }),
  };
  const published = new Map();
  const current = sample();
  assert.deepEqual(
    await publishDriverLocation(socket, ["denied", "lost", "ok"], current, published, () => active),
    { accepted: 1, rejected: 2 },
  );
  assert.equal(published.has("lost"), false);
  await publishDriverLocation(socket, ["ok"], current, published, () => active);
  assert.equal(sent.length, 3);
  await publishDriverLocation(socket, ["old"], sample(Date.now() - 31000), published, () => active);
  assert.equal(sent.length, 3);
  await publishDriverLocation(
    socket,
    Array.from({ length: 30 }, (_, i) => String(i)),
    current,
    published,
    () => active,
  );
  assert.equal(sent.length, 13);
  await publishDriverLocation(socket, ["stop", "after-stop"], current, published, () => active);
  assert.equal(published.has("stop"), false);
  assert.equal(
    sent.some((value) => value.trackingId === "after-stop"),
    false,
  );
});

async function waitFor(predicate) {
  const until = Date.now() + 5000;
  while (!predicate()) {
    if (Date.now() > until) throw new Error("Tracking state timed out");
    await new Promise((resolve) => setTimeout(resolve, 10));
  }
}
test("real Socket.IO client rejoins after reconnect and clears position after denial or disconnect", async () => {
  const http = createServer();
  const server = new Server(http);
  let permitted = true;
  let joins = 0;
  server.use((socket, next) =>
    socket.handshake.auth.token === "fixture-token" ? next() : next(new Error("Unauthorized")),
  );
  server.on("connection", (socket) => {
    socket.on("shipment:join", (id, ack) => {
      joins++;
      ack({ ok: permitted && id === "IST-A" });
    });
  });
  await new Promise((resolve) => http.listen(0, "127.0.0.1", resolve));
  const socket = io(`http://127.0.0.1:${http.address().port}`, {
    auth: { token: "fixture-token" },
    transports: ["websocket"],
    autoConnect: false,
  });
  let state;
  const subscription = subscribeToShipment(socket, "IST-A", (next) => {
    state = next;
  });
  try {
    socket.connect();
    await waitFor(() => state?.joined);
    server.emit("driver:location", { trackingId: "IST-A", ...sample() });
    await waitFor(() => state.location);
    const accepted = state.location;
    server.emit("driver:location", { trackingId: "IST-B", ...sample(Date.now() + 1) });
    await new Promise((resolve) => setTimeout(resolve, 30));
    assert.deepEqual(state.location, accepted);
    socket.disconnect();
    assert.equal(state.location, null);
    socket.connect();
    await waitFor(() => state.joined && joins >= 2);
    assert.equal(state.location, null);
    server.emit("driver:location", { trackingId: "IST-A", ...sample() });
    await waitFor(() => state.location);
    permitted = false;
    await subscription.recheck();
    assert.equal(state.joined, false);
    assert.equal(state.location, null);
    server.emit("driver:location", { trackingId: "IST-A", ...sample() });
    await new Promise((resolve) => setTimeout(resolve, 30));
    assert.equal(state.location, null);
  } finally {
    subscription.dispose();
    socket.disconnect();
    await new Promise((resolve) => server.close(resolve));
  }
});
