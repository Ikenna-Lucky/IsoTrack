import assert from "node:assert/strict";
import { test } from "node:test";
import { createWorkflowRequests } from "../src/lib/workflow-requests.ts";
import { deliveryPanelVisible } from "../src/lib/delivery-contract.ts";

test("uncertain writes retain the original request across panels until resolved", () => {
  const store = createWorkflowRequests();
  store.setAccount("owner");
  const command = { key: "same-key", body: { expectedVersion: 4, code: "00123456" } };
  let notifications = 0;
  const unsubscribe = store.subscribe(() => notifications++);
  store.set("owner", "shipment", "delivery", command);
  assert.equal(store.get("owner", "shipment", "delivery"), command);
  assert.equal(store.pending("owner", "shipment"), true);
  assert.equal(store.pending("owner", "other"), false);
  store.setAccount("owner");
  assert.equal(store.get("owner", "shipment", "delivery"), command);
  store.set("owner", "shipment", "delivery", null);
  assert.equal(store.pending("owner"), false);
  assert.equal(notifications, 2);
  unsubscribe();
});
test("sign-out and account switching scrub requests and reject late callbacks even after signing back in", () => {
  const store = createWorkflowRequests();
  store.setAccount("a");
  const generation = store.generation();
  store.set("a", "s", "delivery", { code: "00123456" });
  store.setAccount(null);
  store.setAccount("a");
  store.set("a", "s", "delivery", { code: "late" }, generation);
  assert.equal(store.pending("a"), false);
  store.set("a", "s", "exception", { note: "private" });
  store.setAccount("b");
  assert.equal(store.get("a", "s", "exception"), null);
  assert.equal(store.pending("b"), false);
  store.set("a", "s", "exception", { note: "late" });
  store.setAccount("a");
  assert.equal(store.pending("a"), false);
});
test("delivery recovery and feedback stay visible when another actor changes shipment state", () => {
  for (const role of ["business", "driver"])
    for (const status of ["failed", "cancelled", "delivered", undefined])
      assert.equal(deliveryPanelVisible(role, status, true), true);
  assert.equal(deliveryPanelVisible("business", "failed", false), false);
  assert.equal(deliveryPanelVisible("driver", "failed", false), false);
  assert.equal(deliveryPanelVisible("business", "out_for_delivery", false), true);
  assert.equal(deliveryPanelVisible("business", "failed", false, true), true);
  assert.equal(deliveryPanelVisible("business", undefined, false), true);
});

test("one shipment can reserve only one logical action across all panels", () => {
  const store = createWorkflowRequests();
  store.setAccount("owner");
  const command = { key: "delivery-original", body: { expectedVersion: 4 } };
  assert.equal(store.set("owner", "shipment", "delivery", command), true);
  assert.equal(store.set("owner", "shipment", "delivery", command), true);
  assert.equal(store.set("owner", "shipment", "exception", { key: "competing" }), false);
  assert.equal(store.set("owner", "shipment", "delivery", { key: "replacement" }), false);
  assert.equal(store.get("owner", "shipment", "delivery"), command);
  assert.equal(store.set("owner", "another-shipment", "shipment", { key: "independent" }), true);
});

test("late completion cannot clear a newer action after navigation and recovery", () => {
  const store = createWorkflowRequests();
  store.setAccount("owner");
  const generation = store.generation();
  const original = { key: "original" };
  const next = { key: "next" };
  store.set("owner", "shipment", "delivery", original);
  assert.equal(store.set("owner", "shipment", "delivery", null, generation, original), true);
  store.set("owner", "shipment", "delivery", next);
  assert.equal(store.set("owner", "shipment", "delivery", null, generation, original), false);
  assert.equal(store.get("owner", "shipment", "delivery"), next);
  assert.equal(store.set("owner", "shipment", "delivery", null, generation, next), true);
  assert.equal(store.pending("owner"), false);
});
