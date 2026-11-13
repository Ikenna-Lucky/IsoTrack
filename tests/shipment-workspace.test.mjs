import assert from "node:assert/strict";
import { test } from "node:test";
import {
  nairaToKobo,
  newShipmentSchema,
  shipmentMatches,
  uncertainShipmentError,
  shipmentMoney,
} from "../src/lib/shipment-workspace.ts";
test("shipment charges preserve exact kobo and reject rounding or overflow", () => {
  assert.equal(nairaToKobo("2500.01"), 250001);
  assert.match(shipmentMoney(250001), /2,500\.01/);
  assert.equal(nairaToKobo("0.1"), 10);
  for (const value of ["1.001", "-3", "Infinity", "1e4", "", "9007199254740992"])
    assert(Number.isNaN(nairaToKobo(value)));
});
const input = {
  description: "Careful handling",
  weightKg: 2,
  priceKobo: 250001,
  pickupAddress: { street: "Office", city: "Yaba", state: "Lagos" },
  deliveryAddress: { street: "Depot", city: "Port Harcourt", state: "Rivers" },
};
test("intake separates customer access from recipient confirmation and requires explicit addresses", () => {
  const parsed = newShipmentSchema.parse({
    ...input,
    customerEmail: " CUSTOMER@example.test ",
    recipientEmail: " RECIPIENT@example.test ",
  });
  assert.equal(parsed.customerEmail, "customer@example.test");
  assert.equal(parsed.recipientEmail, "recipient@example.test");
  assert(
    !newShipmentSchema.safeParse({ ...input, pickupAddress: { ...input.pickupAddress, city: " " } })
      .success,
  );
  for (const priceKobo of [0, 1.1, 2147483648])
    assert(!newShipmentSchema.safeParse({ ...input, priceKobo }).success);
  assert(!newShipmentSchema.safeParse({ ...input, scheduledPickup: "bad-date" }).success);
  assert(!newShipmentSchema.safeParse({ ...input, priority: "express" }).success);
});
test("ambiguous responses retain the request while definitive conflicts require a new decision", () => {
  for (const error of [
    {},
    { response: { status: 503 } },
    { response: { status: 409, data: { error: "IDEMPOTENCY_IN_PROGRESS" } } },
    { response: { status: 429 } },
  ])
    assert(uncertainShipmentError(error));
  for (const status of [400, 401, 403, 404, 410, 422])
    assert(!uncertainShipmentError({ response: { status } }));
  assert(
    !uncertainShipmentError({
      response: { status: 409, data: { error: "SHIPMENT_VERSION_CONFLICT" } },
    }),
  );
});
test("manifest search and status filters include cancelled and failed as separate states", () => {
  const shipment = {
    ...input,
    trackingId: "IST-TEST",
    status: "cancelled",
    customer: { name: "Local Customer", email: "customer@example.test" },
  };
  assert(shipmentMatches(shipment, "port harcourt", "cancelled"));
  assert(shipmentMatches(shipment, "customer@example.test", "all"));
  assert(!shipmentMatches(shipment, "", "failed"));
  assert(!shipmentMatches(shipment, "", "active"));
});
