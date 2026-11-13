import assert from "node:assert/strict";
import { test } from "node:test";
import {
  analyticsMoney,
  analyticsSummary,
  analyticsPercent,
  validateBusinessAnalytics,
} from "../src/lib/business-analytics.ts";
test("analytics uses whole-business counts and separates outcomes", () => {
  assert.deepEqual(
    analyticsSummary({
      totalShipments: 20,
      statusBreakdown: {
        pending: 4,
        assigned: 2,
        picked_up: 1,
        in_transit: 2,
        out_for_delivery: 1,
        delivered: 7,
        failed: 2,
        cancelled: 1,
      },
    }),
    { pending: 4, active: 6, delivered: 7, failed: 2, cancelled: 1, deliveredShare: 35 },
  );
  assert.equal(analyticsPercent(0, 20), 0);
  assert.equal(analyticsPercent(7, 20), 35);
});
test("empty business is known zero with no defined delivered share", () => {
  const empty = {
    totalShipments: 0,
    totalRevenueKobo: 0,
    statusBreakdown: {},
    recentShipments: [],
  };
  assert.equal(validateBusinessAnalytics(empty), empty);
  assert.equal(analyticsSummary(empty).deliveredShare, null);
  assert.equal(analyticsPercent(0, 0), null);
});
test("analytics rejects partial and inconsistent responses while preserving existing shipment fields", () => {
  const item = {
    id: "local",
    trackingId: "IST-LOCAL",
    status: "pending",
    description: "Sample",
    priceKobo: 10001,
    isPaid: false,
    createdAt: "2026-11-11T10:00:00Z",
    pickupAddress: { city: "Yaba" },
    deliveryAddress: { city: "Lekki" },
    dimensions: { length: 1, width: 2, height: 3 },
  };
  const value = {
    totalShipments: 1,
    totalRevenueKobo: 10001,
    statusBreakdown: { pending: 1 },
    recentShipments: [item],
  };
  assert.equal(validateBusinessAnalytics(value), value);
  assert.equal(value.recentShipments[0].dimensions.height, 3);
  for (const patch of [
    { totalShipments: 2 },
    { totalRevenueKobo: -1 },
    { totalRevenueKobo: Number.MAX_SAFE_INTEGER + 1 },
    { statusBreakdown: { pending: -1 } },
    { statusBreakdown: { unknown: 1 } },
    { recentShipments: [{ ...item, createdAt: "bad" }] },
    { recentShipments: [{ ...item, deliveryAddress: null }] },
  ])
    assert.throws(() => validateBusinessAnalytics({ ...value, ...patch }));
  assert.throws(() => validateBusinessAnalytics({ totalShipments: 0 }));
});
test("aggregate shipment value retains kobo at the safe-integer ceiling", () => {
  assert.equal(analyticsMoney(250001), "₦2,500.01");
  assert.equal(analyticsMoney(0), "₦0.00");
  assert.equal(analyticsMoney(Number.MAX_SAFE_INTEGER), "₦90,071,992,547,409.91");
});
