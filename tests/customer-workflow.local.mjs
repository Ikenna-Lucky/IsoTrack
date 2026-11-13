import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { createApiClient } from "../src/lib/api-client.ts";
import { publicTrackingSchema } from "../src/lib/tracking-contract.ts";
if (!process.argv.includes("--run-local"))
  throw new Error("Use --run-local; creates fictional local review accounts and shipments.");
const origin = "http://127.0.0.1:8000";
const identity = await fetch(`${origin}/health/release`, {
  signal: AbortSignal.timeout(3000),
  redirect: "error",
});
assert.equal((await identity.json()).environment, "local");
const suffix = randomUUID().slice(0, 8),
  password = `CustomerReview${randomUUID()}A1`;
const credentials = {
  email: `customer-review-${suffix}@example.test`,
  password,
  trackingId: "",
  shipmentId: "",
};
const make = () => {
  let access = null;
  const session = createApiClient(`${origin}/api/v1`);
  session.register({
    get: () => access,
    set: (value) => (access = value.accessToken),
    clear: () => (access = null),
  });
  return { api: session.client, authenticate: (value) => (access = value) };
};
const owner = make(),
  customer = make(),
  other = make();
const register = async (client, body) => {
  const value = (await client.api.post("/auth/register", { ...body, password })).data.data;
  client.authenticate(value.accessToken);
  return value.user;
};
await register(owner, {
  name: "Customer Review Owner",
  email: `owner-customer-${suffix}@example.test`,
  role: "business",
  businessName: "Customer QA",
});
const user = await register(customer, {
  name: "Customer Review Recipient",
  email: credentials.email,
  role: "customer",
});
await register(other, {
  name: "Customer Review Other",
  email: `other-customer-${suffix}@example.test`,
  role: "customer",
});
const shipments = [];
for (let index = 0; index < 3; index++)
  shipments.push(
    (
      await owner.api.post(
        "/shipments",
        {
          description: `Fictional Customer QA ${index}`,
          weightKg: 1,
          priceKobo: 250001,
          pickupAddress: { street: "Fictional pickup", city: "Ikeja", state: "Lagos" },
          deliveryAddress: { street: "Fictional destination", city: "Yaba", state: "Lagos" },
          ...(index < 2 ? { customerId: user.id } : {}),
        },
        { headers: { "Idempotency-Key": randomUUID() } },
      )
    ).data.data,
  );
const first = (await customer.api.get("/shipments", { params: { limit: 1 } })).data;
assert.equal(first.data.length, 1);
assert.equal(first.pagination.hasMore, true);
const second = (
  await customer.api.get("/shipments", {
    params: { limit: 1, cursor: first.pagination.nextCursor },
  })
).data;
assert.equal(second.data.length, 1);
assert.notEqual(first.data[0].id, second.data[0].id);
assert.equal(second.pagination.hasMore, false);
const detail = (await customer.api.get(`/shipments/${shipments[0].id}`)).data.data;
assert.equal(detail.priceKobo, 250001);
assert.equal("recipientEmail" in detail, false);
assert.equal(detail.pickupAddress.street, "Fictional pickup");
const events = (await customer.api.get(`/shipments/${detail.id}/events`, { params: { limit: 20 } }))
  .data;
assert.equal(events.data.length, 1);
for (const client of [customer, other])
  await assert.rejects(
    client.api.get(`/shipments/${shipments[client === customer ? 2 : 0].id}`),
    (error) => [403, 404].includes(error.response?.status),
  );
const raw = (await customer.api.get(`/track/${detail.trackingId}`)).data.data;
const publicRecord = publicTrackingSchema.parse(raw);
assert.equal(publicRecord.trackingId, detail.trackingId);
for (const field of ["driver", "pickupAddress", "deliveryAddress", "priceKobo", "currentLocation"])
  assert.equal(field in raw, false);
await assert.rejects(
  customer.api.get("/shipments", { params: { page: 1, pageSize: 20 } }),
  (error) => error.response?.status === 400,
);
credentials.trackingId = detail.trackingId;
credentials.shipmentId = detail.id;
const file = join(tmpdir(), "isotrack-customer-review.local.json");
await writeFile(file, JSON.stringify(credentials));
console.log(
  "PASS: linked cursor pagination, exact kobo, detail/history, unlinked and other-account denial, public privacy and rejected legacy pagination. Fictional QA login saved to OS temp; no payment or email sent.",
);
