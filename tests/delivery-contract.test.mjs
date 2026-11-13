import assert from "node:assert/strict";
import { test } from "node:test";
import {
  challengeUsable,
  recipientDeliveryCode,
  recipientConfirmationEmail,
  deliveryErrorMessage,
  deliveryEmailLabels,
} from "../src/lib/delivery-contract.ts";
test("delivery codes preserve leading zeros and reject nondecimal or malformed input", () => {
  assert.equal(recipientDeliveryCode.parse("00123456"), "00123456");
  for (const code of ["1234567", "123456789", "1234 567", "１２３４５６７８", "abcdefgh", 12345678])
    assert(!recipientDeliveryCode.safeParse(code).success);
  assert.equal(
    recipientConfirmationEmail.parse(" Recipient@Example.test "),
    "recipient@example.test",
  );
});
test("only the current unexpired challenge enables handover", () => {
  const challenge = {
    challengeId: "local",
    version: 4,
    expiresAt: "2026-11-11T12:00:00Z",
    deliveryState: "pending",
  };
  const expiry = Date.parse(challenge.expiresAt);
  assert(challengeUsable(challenge, 4, expiry - 1));
  assert(!challengeUsable(challenge, 4, expiry));
  assert(!challengeUsable(challenge, 5, expiry - 1));
  assert(!challengeUsable(null, 4, expiry - 1));
  assert(!challengeUsable({ ...challenge, expiresAt: "invalid" }, 4, expiry - 1));
});
test("delivery failures explain user recovery without claiming inbox delivery", () => {
  assert.match(
    deliveryErrorMessage({ response: { data: { error: "INVALID_DELIVERY_CODE" } } }),
    /incorrect/,
  );
  assert.match(
    deliveryErrorMessage({ response: { data: { error: "SHIPMENT_VERSION_CONFLICT" } } }),
    /Refresh/,
  );
  assert.match(
    deliveryErrorMessage({ response: { data: { error: "DELIVERY_RATE_LIMIT" } } }),
    /minute/,
  );
  assert.match(deliveryEmailLabels.sent, /mail service/);
});
