import assert from "node:assert/strict";
import { test } from "node:test";
import {
  driverWorkSummary,
  driverDate,
  driverProfileInput,
  driverVehicleInput,
} from "../src/lib/driver-workspace.ts";

test("driver work separates failed custody from delivered and physically received returns", () => {
  const item = { returnState: "none", actualPickup: null };
  const records = [
    { ...item, id: "assigned", status: "assigned" },
    { ...item, id: "moving", status: "in_transit", actualPickup: "2026-11-12T10:00:00Z" },
    { ...item, id: "pre-pickup", status: "failed" },
    { ...item, id: "held", status: "failed", actualPickup: "2026-11-12T10:00:00Z" },
    {
      ...item,
      id: "returning",
      status: "failed",
      actualPickup: "2026-11-12T10:00:00Z",
      returnState: "in_transit",
    },
    {
      ...item,
      id: "received",
      status: "failed",
      actualPickup: "2026-11-12T10:00:00Z",
      returnState: "received",
    },
    { ...item, id: "done", status: "delivered" },
    { ...item, id: "cancelled", status: "cancelled" },
  ];
  const result = driverWorkSummary(records);
  assert.deepEqual(
    result.moving.map(({ id }) => id),
    ["assigned", "moving"],
  );
  assert.deepEqual(
    result.held.map(({ id }) => id),
    ["held", "returning"],
  );
  assert.deepEqual(
    result.returned.map(({ id }) => id),
    ["received"],
  );
  assert.deepEqual(
    result.delivered.map(({ id }) => id),
    ["done"],
  );
});
test("missing actual delivery time is never replaced by a created or updated date", () => {
  for (const value of [undefined, null, "", "invalid"])
    assert.equal(driverDate(value), "Not recorded");
  assert.notEqual(driverDate("2026-11-12T10:00:00Z"), "Not recorded");
});
test("driver contact edits follow documented clearing and length constraints", () => {
  const valid = { name: " Ada Driver ", phone: "+2348012345678", emergencyContact: "" };
  assert.equal(driverProfileInput.parse(valid).name, "Ada Driver");
  assert.equal(driverProfileInput.safeParse({ ...valid, phone: "" }).success, true);
  for (const update of [
    { phone: "0123456789" },
    { phone: "not-a-number" },
    { name: "A" },
    { emergencyContact: "x".repeat(21) },
  ])
    assert.equal(driverProfileInput.safeParse({ ...valid, ...update }).success, false);
});
test("vehicle edits preserve valid optional clearing and enforce Swagger bounds", () => {
  const valid = {
    vehicleType: "bike",
    vehiclePlate: "LAG-123",
    vehicleModel: "",
    vehicleColor: "",
    vehicleYear: "",
    vehicleInsurance: "",
  };
  assert.equal(driverVehicleInput.safeParse(valid).success, true);
  for (const update of [
    { vehicleType: "bus" },
    { vehiclePlate: "AB" },
    { vehiclePlate: "x".repeat(21) },
    { vehicleModel: "x".repeat(61) },
    { vehicleColor: "x".repeat(31) },
    { vehicleYear: "20267" },
    { vehicleInsurance: "x".repeat(61) },
  ])
    assert.equal(driverVehicleInput.safeParse({ ...valid, ...update }).success, false);
});
