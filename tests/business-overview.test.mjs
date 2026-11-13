import assert from "node:assert/strict";
import { test } from "node:test";
import { overviewCounts, nextPageCursor } from "../src/lib/business-overview.ts";

test("operational counts keep unsuccessful attempts and cancellations separate", () => {
  assert.deepEqual(
    overviewCounts({
      pending: 12,
      assigned: 3,
      picked_up: 4,
      in_transit: 5,
      out_for_delivery: 6,
      delivered: 40,
      failed: 2,
      cancelled: 9,
    }),
    { pending: 12, active: 18, delivered: 40, failed: 2, cancelled: 9 },
  );
  assert.deepEqual(overviewCounts({}), {
    pending: 0,
    active: 0,
    delivered: 0,
    failed: 0,
    cancelled: 0,
  });
});

test("pagination preserves opaque cursors and stops on the backend's terminal page", () => {
  const opaque = "unchanged_account_scoped_cursor";
  assert.equal(
    nextPageCursor({ data: [], pagination: { limit: 6, hasMore: true, nextCursor: opaque } }),
    opaque,
  );
  assert.equal(
    nextPageCursor({ data: [], pagination: { limit: 6, hasMore: false, nextCursor: opaque } }),
    undefined,
  );
});
