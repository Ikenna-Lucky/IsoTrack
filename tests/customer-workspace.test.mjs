import { trackingIdInput, publicTrackingSchema } from "../src/lib/tracking-contract.ts";
import assert from "node:assert/strict";
import { test } from "node:test";
import { customerShipmentCounts, customerProfileInput } from "../src/lib/customer-workspace.ts";
import { workspaceDateTime } from "../src/lib/workspace-format.ts";
import {
  paymentOutcome,
  verificationSchema,
  cancellationSchema,
  checkoutFailureIsUncertain,
} from "../src/lib/customer-payment.ts";
const reference = "IST-PAY-abcdefghijklmnopqrstuvwx";
test("public tracking projection cannot expose private addresses, identity, price or GPS", () => {
  const value = publicTrackingSchema.parse({
    trackingId: "IST-TEST",
    status: "failed",
    scheduledPickup: null,
    estimatedDelivery: null,
    actualDelivery: null,
    events: [
      {
        status: "failed",
        message: "Delivery attempt unsuccessful",
        createdAt: "2026-11-12T10:00:00Z",
        note: "private",
      },
    ],
    eventsTruncated: true,
    priceKobo: 100,
    driver: { name: "private" },
    pickupAddress: { street: "private" },
    currentLocation: { lat: 1, lng: 2 },
  });
  assert.equal("driver" in value, false);
  assert.equal("pickupAddress" in value, false);
  assert.equal("priceKobo" in value, false);
  assert.equal("currentLocation" in value, false);
  assert.equal("note" in value.events[0], false);
  assert.equal(value.eventsTruncated, true);
});
test("tracking IDs are normalized and restricted before network lookup", () => {
  assert.equal(trackingIdInput.parse(" ist-test_1 "), "IST-TEST_1");
  for (const value of ["", "../private", "a?secret=x", "a".repeat(65)])
    assert.equal(trackingIdInput.safeParse(value).success, false);
});
test("customer summaries describe loaded outcomes rather than charges as spending", () => {
  assert.deepEqual(
    customerShipmentCounts([
      { status: "assigned", isPaid: false },
      { status: "failed", isPaid: true },
      { status: "delivered", isPaid: true },
      { status: "cancelled", isPaid: false },
    ]),
    { active: 1, delivered: 1, unpaid: 2 },
  );
  assert.equal(workspaceDateTime(null), "Not recorded");
  assert.equal(workspaceDateTime("invalid"), "Not recorded");
  assert.equal(customerProfileInput.safeParse({ name: "Ada", phone: "" }).success, true);
  assert.equal(customerProfileInput.safeParse({ name: "A", phone: "123" }).success, false);
});
test("Stripe paid alone never produces a settled confirmation", () => {
  const base = {
    reference,
    paid: true,
    applied: false,
    requiresReview: false,
    channel: "stripe_checkout",
    status: "paid",
    checkoutState: "processing",
  };
  assert.equal(paymentOutcome(verificationSchema.parse(base)), "unresolved");
  assert.equal(
    paymentOutcome(verificationSchema.parse({ ...base, applied: true, checkoutState: "settled" })),
    "settled",
  );
  assert.equal(
    paymentOutcome(verificationSchema.parse({ ...base, applied: true, checkoutState: undefined })),
    "settled",
  );
  assert.equal(
    paymentOutcome(
      verificationSchema.parse({
        ...base,
        applied: true,
        requiresReview: true,
        checkoutState: "settled",
      }),
    ),
    "review",
  );
  assert.equal(
    paymentOutcome(
      verificationSchema.parse({
        ...base,
        applied: true,
        status: "unpaid",
        checkoutState: "settled",
      }),
    ),
    "unresolved",
  );
  assert.equal(
    paymentOutcome(
      verificationSchema.parse({
        ...base,
        paid: false,
        checkoutState: "expired",
        status: "unpaid",
      }),
    ),
    "closed",
  );
  assert.equal(
    paymentOutcome(verificationSchema.parse({ ...base, paid: true, checkoutState: "expired" })),
    "unresolved",
  );
});
test("partial payment responses and cancellation acknowledgements cannot prove settlement", () => {
  assert.equal(verificationSchema.safeParse({ paid: true }).success, false);
  const cancelled = cancellationSchema.parse({
    reference,
    requiresReview: false,
    checkoutState: "processing",
  });
  assert.equal("applied" in cancelled, false);
  for (const error of [
    new Error("network"),
    { response: { status: 500 } },
    { response: { status: 408 } },
    { response: { status: 429 } },
    { response: { status: 409, data: { error: "CHECKOUT_ALREADY_ACTIVE" } } },
  ])
    assert.equal(checkoutFailureIsUncertain(error), true);
  assert.equal(checkoutFailureIsUncertain({ response: { status: 400 } }), false);
});
