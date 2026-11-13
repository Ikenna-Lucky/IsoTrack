import assert from "node:assert/strict";
import { test } from "node:test";
import { createServer } from "node:http";
import { once } from "node:events";
import { createApiClient } from "../src/lib/api-client.ts";
import { initializeCustomerCheckout } from "../src/lib/customer-payment.ts";
import { createWorkflowRequests } from "../src/lib/workflow-requests.ts";

test("lost checkout acknowledgement retries identical request key/body and recovers one reference", async (t) => {
  const seen = [];
  let committed = false;
  const checkout = {
    reference: "IST-PAY-abcdefghijklmnopqrstuvwx",
    authorizationUrl: "https://checkout.stripe.com/c/pay/cs_test_example",
    sessionId: "cs_test_example",
    amountKobo: 250001,
  };
  const server = createServer(async (req, res) => {
    let body = "";
    for await (const chunk of req) body += chunk;
    seen.push({ path: req.url, key: req.headers["idempotency-key"], body });
    if (!committed) {
      committed = true;
      req.socket.destroy();
      return;
    }
    res.writeHead(200, { "Content-Type": "application/json", "Idempotency-Replayed": "true" });
    res.end(JSON.stringify({ data: checkout }));
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
  session.register({ get: () => "fixture-token", set: () => {}, clear: () => {} });
  const memory = createWorkflowRequests();
  memory.setAccount("customer");
  const request = { key: "checkout-request-key-123456", body: { shipmentId: "shipment" } };
  assert.equal(memory.set("customer", "shipment", "checkout", request), true);
  await assert.rejects(initializeCustomerCheckout(session.client, request));
  assert.equal(memory.get("customer", "shipment", "checkout"), request);
  const result = await initializeCustomerCheckout(
    session.client,
    memory.get("customer", "shipment", "checkout"),
  );
  assert.equal(result.reference, checkout.reference);
  assert.equal(result.amountKobo, 250001);
  assert.deepEqual(seen, [
    { path: "/payments/initialize", key: request.key, body: JSON.stringify(request.body) },
    { path: "/payments/initialize", key: request.key, body: JSON.stringify(request.body) },
  ]);
  memory.setAccount("other");
  assert.equal(memory.get("other", "shipment", "checkout"), null);
  assert.equal(memory.set("customer", "shipment", "checkout", null), false);
});
