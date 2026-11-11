import assert from "node:assert/strict";
import { test } from "node:test";
import {
  exceptionActions,
  exceptionInput,
  nextExceptionVersion,
  exceptionExplanation,
} from "../src/lib/shipment-exceptions.ts";
const before = {
  status: "failed",
  actualPickup: null,
  driverId: "driver",
  attemptNumber: 1,
  returnState: "none",
};
test("failure and retry actions follow actor, custody and attempt rules", () => {
  for (const status of ["assigned", "picked_up", "in_transit", "out_for_delivery"])
    for (const role of ["driver", "business"])
      assert.deepEqual(exceptionActions({ ...before, status }, role), ["fail"]);
  assert.deepEqual(exceptionActions(before, "business"), ["retry", "cancel_failed"]);
  assert.deepEqual(exceptionActions({ ...before, actualPickup: "2026-11-11" }, "business"), [
    "retry",
    "return_request",
  ]);
  assert.deepEqual(exceptionActions({ ...before, attemptNumber: 3 }, "business"), [
    "cancel_failed",
  ]);
  assert.deepEqual(
    exceptionActions({ ...before, actualPickup: "2026-11-11", attemptNumber: 3 }, "business"),
    ["return_request"],
  );
  assert.deepEqual(exceptionActions(before, "driver"), []);
  for (const status of ["pending", "delivered", "cancelled"])
    assert.deepEqual(exceptionActions({ ...before, status }, "business"), []);
});
test("requested returns prevent retry and receipt closes the workflow", () => {
  const shipment = { ...before, actualPickup: "2026-11-11", returnState: "requested" };
  assert.deepEqual(exceptionActions(shipment, "business"), ["return_receive"]);
  assert.deepEqual(exceptionActions(shipment, "driver"), ["return_start"]);
  assert.deepEqual(exceptionActions({ ...shipment, returnState: "in_transit" }, "business"), [
    "return_receive",
  ]);
  assert.deepEqual(exceptionActions({ ...shipment, returnState: "in_transit" }, "driver"), []);
  for (const role of ["business", "driver"])
    assert.deepEqual(exceptionActions({ ...shipment, returnState: "received" }, role), []);
});
test("failure reasons and private notes match the bounded backend input", () => {
  const input = {
    action: "fail",
    expectedVersion: 4,
    reason: "other",
    note: "  Package seal damaged  ",
  };
  assert.equal(exceptionInput.parse(input).note, "Package seal damaged");
  for (const patch of [
    { note: " " },
    { note: "x".repeat(1001) },
    { reason: "unknown" },
    { expectedVersion: -1 },
    { expectedVersion: 2147483647 },
  ])
    assert(!exceptionInput.safeParse({ ...input, ...patch }).success);
  assert(exceptionInput.safeParse({ ...input, note: "x".repeat(1000) }).success);
  assert(
    !exceptionInput.safeParse({ action: "retry", expectedVersion: 4, reason: "other" }).success,
  );
});
test("private history uses version continuation rather than shipment cursors", () => {
  assert.equal(nextExceptionVersion({ pagination: { hasMore: true, nextBeforeVersion: 42 } }), 42);
  assert.equal(
    nextExceptionVersion({ pagination: { hasMore: false, nextBeforeVersion: 42 } }),
    undefined,
  );
  assert.equal(
    nextExceptionVersion({ pagination: { hasMore: true, nextBeforeVersion: null } }),
    undefined,
  );
});
test("review copy distinguishes custody-preserving retries and physical return receipt", () => {
  assert.match(exceptionExplanation("retry", false), /assignment will be cleared/);
  assert.match(exceptionExplanation("retry", true), /driver keeps the package/);
  assert.match(exceptionExplanation("return_receive", true), /physically returned/);
});
