import assert from "node:assert/strict";
import { test } from "node:test";
import { accountEmailToken } from "../src/lib/account-email.ts";
test("account email proofs are accepted only as one correctly formed fragment token", () => {
  const token = "a".repeat(43) + "." + "b".repeat(43);
  assert.equal(accountEmailToken("#token=" + token), token);
  for (const hash of [
    "",
    "#token=bad",
    "#token=" + token + "&token=" + token,
    "#access_token=" + token,
    "#token=" + "a".repeat(5000),
  ])
    assert.equal(accountEmailToken(hash), null);
});
