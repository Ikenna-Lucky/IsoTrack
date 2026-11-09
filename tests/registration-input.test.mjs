import assert from "node:assert/strict";
import { test } from "node:test";
import { registrationInput } from "../src/lib/registration-input.ts";

const customer = {
  name: "Customer",
  email: "customer@example.test",
  password: "StrongPassword123!",
  role: "customer",
};
test("public signup rejects driver enrollment while customers can switch away from an empty business form", () => {
  assert(registrationInput().safeParse({ ...customer, businessName: "" }).success);
  assert(
    !registrationInput().safeParse({ ...customer, role: "business", businessName: " " }).success,
  );
  assert(!registrationInput().safeParse({ ...customer, role: "driver" }).success);
  assert(
    registrationInput().safeParse({ ...customer, role: "business", businessName: "Fleet" }).success,
  );
});
test("driver signup requires an invitation, recipient identity and vehicle details", () => {
  const driver = {
    ...customer,
    role: "driver",
    token: "a".repeat(43),
    vehicleType: "bike",
    vehiclePlate: "LAG-123",
  };
  assert(registrationInput(true).safeParse(driver).success);
  for (const change of [
    { token: "" },
    { vehiclePlate: " " },
    { vehicleType: undefined },
    { role: "customer" },
  ])
    assert(!registrationInput(true).safeParse({ ...driver, ...change }).success);
});
test("signup enforces the server's UTF-8 password ceiling", () => {
  assert(!registrationInput().safeParse({ ...customer, password: "A1" + "é".repeat(36) }).success);
  assert(registrationInput().safeParse({ ...customer, password: "A1" + "é".repeat(35) }).success);
});
