import assert from "node:assert/strict";
import { test } from "node:test";
import {
  invitationEmail,
  invitationToken,
  invitationState,
  driverHasCustody,
} from "../src/lib/fleet-contract.ts";
test("invitation inputs preserve the server's normalized email and token format", () => {
  assert.equal(invitationEmail.parse("  Tariye@Example.test  "), "tariye@example.test");
  assert(!invitationEmail.safeParse("not-an-email").success);
  assert(invitationToken.safeParse("a".repeat(43)).success);
  for (const token of ["a".repeat(42), "a".repeat(44), "!".repeat(43)])
    assert(!invitationToken.safeParse(token).success);
});
test("accepted/revoked invitations retain their terminal state after expiry", () => {
  const item = { expiresAt: "2026-11-11T10:00:00Z", acceptedAt: null, revokedAt: null };
  const now = Date.parse(item.expiresAt);
  assert.equal(invitationState(item, now - 1), "Pending");
  assert.equal(invitationState(item, now), "Expired");
  assert.equal(invitationState({ ...item, acceptedAt: "2026-11-10T10:00:00Z" }, now), "Accepted");
  assert.equal(invitationState({ ...item, revokedAt: "2026-11-10T10:00:00Z" }, now), "Revoked");
});
test("failed packages remain operational work until custody is resolved", () => {
  assert(driverHasCustody({ status: "in_transit" }));
  assert(
    driverHasCustody({ status: "failed", actualPickup: "2026-11-10", returnState: "requested" }),
  );
  assert(!driverHasCustody({ status: "failed", actualPickup: null }));
  assert(
    !driverHasCustody({ status: "failed", actualPickup: "2026-11-10", returnState: "received" }),
  );
  assert(!driverHasCustody({ status: "delivered" }));
});
