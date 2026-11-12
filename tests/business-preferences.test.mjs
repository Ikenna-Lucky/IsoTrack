import assert from "node:assert/strict";
import { test } from "node:test";
import {
  workspaceDate,
  workspacePreferences,
  workspaceRefresh,
} from "../src/lib/business-preferences.ts";

test("saved timezone and date order determine timestamps across calendar boundaries", () => {
  const date = "2026-11-12T00:30:00Z";
  assert.equal(
    workspaceDate(date, workspacePreferences({ timezone: "Africa/Lagos" })),
    "12/11/2026, 01:30",
  );
  assert.equal(
    workspaceDate(
      date,
      workspacePreferences({ timezone: "America/New_York", dateFormat: "MM/DD/YYYY" }),
    ),
    "11/11/2026, 19:30",
  );
  assert.equal(
    workspaceDate(date, workspacePreferences({ timezone: "UTC", dateFormat: "YYYY-MM-DD" })),
    "2026-11-12, 00:30",
  );
});
test("timezone formatting follows daylight saving transitions", () => {
  const preferences = workspacePreferences({ timezone: "America/New_York" });
  assert.equal(workspaceDate("2026-03-08T06:59:00Z", preferences), "08/03/2026, 01:59");
  assert.equal(workspaceDate("2026-03-08T07:00:00Z", preferences), "08/03/2026, 03:00");
});
test("invalid legacy settings and missing timestamps fall back safely", () => {
  const preferences = workspacePreferences({
    timezone: "invalid",
    dateFormat: "unsupported",
    autoRefresh: false,
    compactView: true,
  });
  assert.equal(preferences.timezone, "Africa/Lagos");
  assert.equal(preferences.dateFormat, "DD/MM/YYYY");
  assert.equal(preferences.compactView, true);
  for (const value of [null, undefined, "", "invalid"])
    assert.equal(workspaceDate(value, preferences), "Not recorded");
  assert.equal(workspaceRefresh(preferences.autoRefresh, 60000), false);
  assert.equal(workspaceRefresh(true, 10000), 10000);
});
