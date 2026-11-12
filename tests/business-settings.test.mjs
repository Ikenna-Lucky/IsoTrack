import assert from "node:assert/strict";
import { test } from "node:test";
import { changedSettings, passwordProblem } from "../src/lib/business-settings.ts";
test("editing one preference preserves unrelated saved and future settings", () => {
  const original = { timezone: "Africa/Accra", language: "fr", future: "retained" };
  assert.deepEqual(changedSettings(original, { ...original, language: "en" }), { language: "en" });
  assert.deepEqual(changedSettings(original, { ...original }), {});
});
test("notification updates include complete changed channel pairs only", () => {
  const original = { delivered: { email: true, sms: true }, failed: { email: false, sms: true } };
  assert.deepEqual(
    changedSettings(original, { ...original, delivered: { email: false, sms: true } }),
    { delivered: { email: false, sms: true } },
  );
  assert.deepEqual(original.delivered, { email: true, sms: true });
});
test("password validation enforces backend complexity and bcrypt byte limit", () => {
  assert.equal(passwordProblem("Goodpass123"), null);
  assert.ok(passwordProblem("lowercase123"));
  assert.ok(passwordProblem("Uppercaseonly"));
  assert.ok(passwordProblem("A1" + "é".repeat(36)));
  assert.equal(passwordProblem("A1" + "é".repeat(35)), null);
});
