import assert from "node:assert/strict";
import { test } from "node:test";
import { loginDestination } from "../src/lib/auth-routing.ts";

test("login preserves only destinations inside the authenticated role's workspace", () => {
  assert.equal(
    loginDestination("/business/shipments?page=2", "business"),
    "/business/shipments?page=2",
  );
  for (const next of [
    null,
    "https://evil.test",
    "//evil.test",
    "/\\evil.test",
    "/customer",
    "/business-evil",
    "/business/../customer",
  ])
    assert.equal(loginDestination(next, "business"), "/business");
  assert.equal(loginDestination(null, "driver"), "/driver");
});
