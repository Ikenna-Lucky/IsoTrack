import { createServer } from "node:http";
import { once } from "node:events";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";

/** Local manual QA only: forward to the existing local API and lose selected acknowledgements. */
export async function startBusinessReviewProxy(port = 8002) {
  const origin = "http://127.0.0.1:8000";
  const identity = await fetch(`${origin}/health/release`, {
    redirect: "error",
    signal: AbortSignal.timeout(3000),
  });
  if (!identity.ok || (await identity.json()).environment !== "local")
    throw new Error(
      "Business review requires the isolated local backend, never a hosted deployment",
    );
  const faults = [];
  const attempts = [];
  const originalBodies = new Map();
  const server = createServer(async (request, response) => {
    try {
      const url = new URL(request.url, "http://localhost");
      const chunks = [];
      for await (const chunk of request) {
        chunks.push(chunk);
        if (chunks.reduce((sum, chunk) => sum + chunk.length, 0) > 262144)
          throw new Error("Review payload too large");
      }
      const body = Buffer.concat(chunks);
      const send = (status, data) => {
        response.writeHead(status, {
          "Content-Type": "application/json",
          "Cache-Control": "no-store",
        });
        response.end(JSON.stringify(data));
      };
      if (url.pathname === "/__review/state" && request.method === "GET")
        return send(200, { attempts, faults });
      if (url.pathname === "/__review/fault" && request.method === "POST") {
        const fault = JSON.parse(body.toString());
        if (
          !["GET", "POST", "PATCH", "DELETE"].includes(fault.method) ||
          !/^\/api\/v1\/(shipments|drivers|driver-invitations)(?:\/|$)/.test(fault.path) ||
          !["drop", "reject"].includes(fault.mode) ||
          !Number.isInteger(fault.count ?? 1) ||
          (fault.count ?? 1) < 1 ||
          (fault.count ?? 1) > 5 ||
          ![400, 403, 404, 409, 429, 503].includes(fault.status ?? 503) ||
          !Number.isInteger(fault.delayMs ?? 0) ||
          (fault.delayMs ?? 0) < 0 ||
          (fault.delayMs ?? 0) > 10000
        )
          return send(400, { error: "Invalid review fault" });
        faults.push({ ...fault, count: fault.count ?? 1 });
        return send(201, { configured: true });
      }
      if (!url.pathname.startsWith("/api/v1/"))
        return send(404, { error: "Review route not found" });
      const fault = faults.find(
        (fault) =>
          fault.count > 0 && fault.method === request.method && fault.path === url.pathname,
      );
      if (fault?.mode === "reject") {
        fault.count--;
        response.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
        response.setHeader("Access-Control-Allow-Credentials", "true");
        response.setHeader("Access-Control-Expose-Headers", "Retry-After, Idempotency-Replayed");
        response.setHeader("Retry-After", "2");
        return send(fault.status ?? 503, {
          success: false,
          error:
            fault.status === 429
              ? "RATE_LIMITED"
              : fault.status === 404
                ? "NOT_FOUND"
                : "REQUEST_PROTECTION_UNAVAILABLE",
          message: "Review-only service interruption",
        });
      }
      const headers = { ...request.headers };
      for (const name of ["host", "connection", "content-length"]) delete headers[name];
      const result = await fetch(`${origin}${url.pathname}${url.search}`, {
        method: request.method,
        headers,
        ...(body.length ? { body } : {}),
        redirect: "manual",
        signal: AbortSignal.timeout(20000),
      });
      const bytes = Buffer.from(await result.arrayBuffer());
      if (request.headers["idempotency-key"]) {
        const key = `${request.method}:${url.pathname}:${request.headers["idempotency-key"]}`;
        const original = originalBodies.get(key);
        attempts.push({
          method: request.method,
          path: url.pathname,
          key: request.headers["idempotency-key"],
          sameBody: !original || original.equals(body),
          status: result.status,
          replayed: result.headers.get("Idempotency-Replayed") === "true",
          acknowledgementLost: fault?.mode === "drop" && result.ok,
        });
        originalBodies.set(key, body);
      }
      if (fault?.mode === "drop" && result.ok) {
        fault.count--;
        if (fault.delayMs) await new Promise((done) => setTimeout(done, fault.delayMs));
        response.destroy();
        return;
      }
      result.headers.forEach((value, name) => {
        if (
          ![
            "connection",
            "content-length",
            "content-encoding",
            "transfer-encoding",
            "set-cookie",
          ].includes(name)
        )
          response.setHeader(name, value);
      });
      const cookies = result.headers.getSetCookie();
      if (cookies.length) response.setHeader("Set-Cookie", cookies);
      response.writeHead(result.status);
      response.end(bytes);
    } catch {
      if (!response.headersSent && !response.destroyed)
        response.writeHead(502, { "Content-Type": "application/json" });
      if (!response.destroyed)
        response.end(JSON.stringify({ success: false, error: "REVIEW_PROXY_UNAVAILABLE" }));
    }
  });
  server.listen(port, "127.0.0.1");
  await once(server, "listening");
  return server;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await startBusinessReviewProxy();
  console.log(
    "Local Business QA proxy on http://localhost:8002. Use only with fictional review accounts; control endpoints stay on loopback.",
  );
}
