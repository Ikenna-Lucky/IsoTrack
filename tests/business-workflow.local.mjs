import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { startBusinessReviewProxy } from "./helpers/business-review-proxy.mjs";
import { createApiClient } from "../src/lib/api-client.ts";
import { newShipmentSchema, uncertainShipmentError } from "../src/lib/shipment-workspace.ts";
import { createWorkflowRequests } from "../src/lib/workflow-requests.ts";

// Explicit opt-in local API exercise, excluded from ordinary *.test.mjs tests.
if (!process.argv.includes("--run-local"))
  throw new Error(
    "Use --run-local; creates fictional accounts/shipments in the isolated local API",
  );
const proxy = await startBusinessReviewProxy(0);
const origin = `http://127.0.0.1:${proxy.address().port}`;
const session = createApiClient(`${origin}/api/v1`);
let access = null;
session.register({
  get: () => access,
  set: (value) => {
    access = value.accessToken;
  },
  clear: () => {
    access = null;
  },
});
const api = session.client;
const suffix = randomUUID().slice(0, 8);
const password = `Review${randomUUID()}A1`;
const ownerEmail = `workflow-${suffix}@example.test`;
const driverEmail = `driver-${suffix}@example.test`;
const pending = createWorkflowRequests();
const report = [];
const read = async (id) => (await api.get(`/shipments/${id}`)).data.data;
const fault = async (path, mode, status) =>
  fetch(`${origin}/__review/fault`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ method: "POST", path, mode, ...(status ? { status } : {}) }),
  });
async function command(id, path, body) {
  const result = await api.post(`/shipments/${id}/${path}`, body, {
    headers: { "Idempotency-Key": randomUUID() },
  });
  return result.data.data;
}
try {
  const registered = await api.post("/auth/register", {
    name: "Workflow Review Owner",
    email: ownerEmail,
    password,
    role: "business",
    businessName: `Workflow Review ${suffix}`,
  });
  access = registered.data.data.accessToken;
  pending.setAccount(registered.data.data.user.id);
  const invitation = (await api.post("/driver-invitations", { email: driverEmail })).data.data;
  const membership = (
    await api.post("/driver-invitations/accept", {
      token: invitation.token,
      email: driverEmail,
      name: "Workflow Review Driver",
      password,
      vehicleType: "bike",
      vehiclePlate: `QA-${suffix}`,
    })
  ).data.data;
  assert.ok(membership.driverId);
  const history = (await api.get("/driver-invitations")).data.data;
  assert.ok(history.find((value) => value.id === invitation.id).acceptedAt);
  report.push("invitation creation, new driver enrollment and accepted history");
  const input = newShipmentSchema.parse({
    description: `Local workflow review ${suffix}`,
    weightKg: 2,
    pickupAddress: { street: "Fictional pickup", city: "Ikeja", state: "Lagos" },
    deliveryAddress: { street: "Fictional destination", city: "Yaba", state: "Lagos" },
    priceKobo: 250001,
    recipientEmail: `recipient-${suffix}@example.test`,
  });
  const key = randomUUID();
  const owner = registered.data.data.user.id;
  const creation = { key, body: input };
  assert.equal(pending.set(owner, "create", "shipment", creation), true);
  await fault("/api/v1/shipments", "drop");
  await assert.rejects(
    api.post("/shipments", input, { headers: { "Idempotency-Key": key } }),
    (error) => uncertainShipmentError(error),
  );
  assert.equal(pending.get(owner, "create", "shipment"), creation);
  const recovered = await api.post("/shipments", creation.body, {
    headers: { "Idempotency-Key": creation.key },
  });
  assert.equal(recovered.headers["idempotency-replayed"], "true");
  const shipment = recovered.data.data;
  assert.equal(shipment.priceKobo, 250001);
  pending.set(owner, "create", "shipment", null, pending.generation(), creation);
  report.push("lost creation acknowledgement recovered with identical key/body and one shipment");
  const assigned = (
    await api.patch(
      `/shipments/${shipment.id}/assign`,
      { expectedVersion: shipment.version, driverId: membership.driverId },
      { headers: { "Idempotency-Key": randomUUID() } },
    )
  ).data.data;
  await assert.rejects(
    api.delete(`/shipments/${shipment.id}`, {
      data: { expectedVersion: shipment.version },
      headers: { "Idempotency-Key": randomUUID() },
    }),
    (error) =>
      error.response?.status === 409 && error.response.data.error === "SHIPMENT_VERSION_CONFLICT",
  );
  let current = await read(shipment.id);
  assert.equal(current.version, assigned.version);
  report.push("assignment and explicit stale-version rejection without cancellation");
  for (const status of ["picked_up", "in_transit", "out_for_delivery"])
    current = (
      await api.patch(
        `/shipments/${shipment.id}/status`,
        { expectedVersion: current.version, status },
        { headers: { "Idempotency-Key": randomUUID() } },
      )
    ).data.data;
  const issued = await command(shipment.id, "delivery-code", {
    expectedVersion: current.version,
    recipientEmail: input.recipientEmail,
  });
  assert.ok(issued.challengeId);
  assert.equal("code" in issued, false);
  const metadata = (await api.get(`/shipments/${shipment.id}/delivery-code`)).data.data;
  assert.equal(metadata.challengeId, issued.challengeId);
  report.push(
    "pickup, transit, out-for-delivery and recipient-code metadata without code exposure",
  );
  current = await read(shipment.id);
  current = await command(shipment.id, "exceptions", {
    action: "fail",
    expectedVersion: current.version,
    reason: "recipient_unavailable",
  });
  current = await command(shipment.id, "exceptions", {
    action: "retry",
    expectedVersion: current.version,
  });
  assert.equal(current.attemptNumber, 2);
  assert.equal(current.status, "picked_up");
  current = await command(shipment.id, "exceptions", {
    action: "fail",
    expectedVersion: current.version,
    reason: "other",
    note: "Fictional review return",
  });
  current = await command(shipment.id, "exceptions", {
    action: "return_request",
    expectedVersion: current.version,
  });
  const ownerToken = access;
  const login = await api.post("/auth/login", { email: driverEmail, password });
  access = login.data.data.accessToken;
  current = await command(shipment.id, "exceptions", {
    action: "return_start",
    expectedVersion: current.version,
  });
  access = ownerToken;
  const returnKey = randomUUID();
  const returnBody = { action: "return_receive", expectedVersion: current.version };
  await fault(`/api/v1/shipments/${shipment.id}/exceptions`, "drop");
  await assert.rejects(
    api.post(`/shipments/${shipment.id}/exceptions`, returnBody, {
      headers: { "Idempotency-Key": returnKey },
    }),
    (error) => uncertainShipmentError(error),
  );
  const receipt = await api.post(`/shipments/${shipment.id}/exceptions`, returnBody, {
    headers: { "Idempotency-Key": returnKey },
  });
  assert.equal(receipt.headers["idempotency-replayed"], "true");
  assert.equal(receipt.data.data.returnState, "received");
  const exceptions = (
    await api.get(`/shipments/${shipment.id}/exceptions`, { params: { limit: 20 } })
  ).data.data;
  assert.equal(exceptions.filter((value) => value.action === "return_receive").length, 1);
  await assert.rejects(
    api.get(`/shipments/${shipment.id}/delivery-code`),
    (error) => error.response?.status === 404,
  );
  report.push(
    "failure, custody-preserving retry, second failure, return request/transit/receipt and lost-receipt replay without duplicate audit",
  );
  await fault("/api/v1/shipments", "reject", 429);
  await assert.rejects(
    api.post("/shipments", input, { headers: { "Idempotency-Key": randomUUID() } }),
    (error) => error.response?.status === 429 && uncertainShipmentError(error),
  );
  report.push("throttled writes retain uncertain-request classification");
  const state = await (await fetch(`${origin}/__review/state`)).json();
  assert.ok(state.attempts.every((attempt) => attempt.sameBody));
  console.log(
    JSON.stringify(
      {
        passed: report,
        limits: [
          "Direct HTTP through production Axios client; not browser UI acceptance",
          "No email delivery or valid-code handover exercised",
          "Fictional local records retained; no hosted data touched",
        ],
      },
      null,
      2,
    ),
  );
} finally {
  await new Promise((done) => {
    proxy.close(done);
    proxy.closeAllConnections();
  });
}
