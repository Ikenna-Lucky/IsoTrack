import assert from "node:assert/strict";
import { test } from "node:test";
import { createServer } from "node:http";
import { once } from "node:events";
import { setTimeout as delay } from "node:timers/promises";
import { createApiClient } from "../src/lib/api-client.ts";

// Real loopback HTTP verifies Axios interceptors, concurrency and bounded retries.
// It does not emulate browser cookie storage or replace deployed browser checks.
async function fixture(t, handler) {
  const server = createServer(async (req, res) => {
    const result = await handler(req);
    res.writeHead(result.status ?? 200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(result.body ?? { success: true }));
  }).listen(0, "127.0.0.1");
  await once(server, "listening");
  t.after(
    () =>
      new Promise((resolve) => {
        server.close(resolve);
        server.closeAllConnections();
      }),
  );
  const session = createApiClient(`http://127.0.0.1:${server.address().port}`);
  let token = "old",
    cleared = 0;
  session.register({
    get: () => token,
    set: (data) => {
      token = data.accessToken;
    },
    clear: () => {
      token = null;
      cleared++;
    },
  });
  return { ...session, token: () => token, cleared: () => cleared };
}
const renewed = { data: { accessToken: "new", user: { id: "user-a" } } };

test("concurrent expired requests share one refresh and retry with the new token", async (t) => {
  let refreshes = 0;
  const session = await fixture(t, async (req) => {
    if (req.url === "/auth/refresh") {
      refreshes++;
      await delay(30);
      return { body: renewed };
    }
    return { status: req.headers.authorization === "Bearer new" ? 200 : 401 };
  });
  const responses = await Promise.all(
    Array.from({ length: 8 }, () => session.client.get("/shipments")),
  );
  assert.equal(responses.length, 8);
  assert.equal(refreshes, 1);
  assert.equal(session.token(), "new");
});

test("bootstrap callers share the same rotating refresh exchange", async (t) => {
  let refreshes = 0;
  const session = await fixture(t, async () => {
    refreshes++;
    await delay(20);
    return { body: renewed };
  });
  await Promise.all([session.refresh(), session.refresh(), session.refresh()]);
  assert.equal(refreshes, 1);
});

test("a late old-token 401 reuses the refreshed token without rotating again", async (t) => {
  let refreshes = 0;
  const session = await fixture(t, async (req) => {
    if (req.url === "/auth/refresh") {
      refreshes++;
      return { body: renewed };
    }
    if (req.headers.authorization === "Bearer new") return {};
    if (req.url === "/slow") await delay(100);
    return { status: 401 };
  });
  await Promise.all([session.client.get("/slow"), session.client.get("/fast")]);
  assert.equal(refreshes, 1);
});

test("failed refresh clears state once and rejects all waiting requests", async (t) => {
  let refreshes = 0;
  const session = await fixture(t, async (req) => {
    if (req.url === "/auth/refresh") {
      refreshes++;
      await delay(30);
    }
    return { status: 401 };
  });
  const results = await Promise.allSettled(
    Array.from({ length: 5 }, () => session.client.get("/shipments")),
  );
  assert(results.every((result) => result.status === "rejected"));
  assert.equal(refreshes, 1);
  assert.equal(session.cleared(), 1);
});

test("persistent 401 stops after one retry; password/login failures never refresh", async (t) => {
  let refreshes = 0,
    reads = 0;
  const session = await fixture(t, async (req) => {
    if (req.url === "/auth/refresh") {
      refreshes++;
      return { body: renewed };
    }
    if (req.url === "/shipments") reads++;
    return { status: 401 };
  });
  await assert.rejects(session.client.get("/shipments"));
  assert.equal(reads, 2);
  assert.equal(refreshes, 1);
  for (const path of ["/auth/login", "/auth/password", "/auth/deactivate"])
    await assert.rejects(session.client.post(path));
  assert.equal(refreshes, 1);
});

test("signout during refresh fences the late response", async (t) => {
  let started;
  const received = new Promise((resolve) => {
    started = resolve;
  });
  const session = await fixture(t, async () => {
    started();
    await delay(60);
    return { body: renewed };
  });
  const pending = session.refresh();
  await received;
  session.invalidate();
  await assert.rejects(pending, /Session changed/);
  assert.equal(session.token(), "old");
  assert.equal(session.cleared(), 0);
});

test("successful responses from a previous account are discarded after identity changes", async (t) => {
  let started;
  const received = new Promise((resolve) => {
    started = resolve;
  });
  const session = await fixture(t, async () => {
    started();
    await delay(40);
    return { body: { data: { id: "previous-account-private-profile" } } };
  });
  const pending = session.client.get("/business/profile");
  await received;
  session.invalidate();
  await assert.rejects(pending, /Session changed/);
});
