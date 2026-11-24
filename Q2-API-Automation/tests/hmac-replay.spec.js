const test = require("node:test");
const assert = require("node:assert/strict");
const { spawn } = require("child_process");
const crypto = require("crypto");

const port = 4189;
const base = `http://127.0.0.1:${port}`;
const secret = "assignment-test-secret-not-for-production";
let server;

function sign(timestamp, id, rawBody) {
  return crypto.createHmac("sha256", secret)
    .update(`${timestamp}\n${id}\n${rawBody}`, "utf8")
    .digest("hex");
}

async function waitForServer() {
  const started = Date.now();
  while (Date.now() - started < 10_000) {
    try {
      const response = await fetch(`${base}/health`);
      if (response.ok) return;
    } catch (_error) {}
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  throw new Error("Q2 server did not start");
}

test.before(async () => {
  server = spawn(process.execPath, ["server/server.js"], {
    cwd: __dirname + "/..",
    env: { ...process.env, HMAC_SECRET: secret, PORT: String(port) },
    stdio: ["ignore", "pipe", "pipe"],
  });
  await waitForServer();
});

test.after(() => server?.kill("SIGTERM"));

async function postTransaction() {
  const response = await fetch(`${base}/transactions`, { method: "POST" });
  assert.equal(response.status, 201);
  return response.json();
}

async function putTransaction(id, rawBody, timestamp, signature) {
  return fetch(`${base}/transactions/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "X-Timestamp": String(timestamp),
      "X-Signature-Auth": signature,
      "X-Entity-ID": id,
    },
    body: rawBody,
  });
}

test("valid POST and signed PUT", async () => {
  const { id } = await postTransaction();
  const rawBody = JSON.stringify({ amount: 2500, currency: "USD" });
  const timestamp = Math.floor(Date.now() / 1000);
  const signature = sign(timestamp, id, rawBody);
  const response = await putTransaction(id, rawBody, timestamp, signature);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { id, status: "updated" });
});

test("invalid signature is rejected", async () => {
  const { id } = await postTransaction();
  const rawBody = JSON.stringify({ amount: 10, currency: "USD" });
  const timestamp = Math.floor(Date.now() / 1000);
  const response = await putTransaction(id, rawBody, timestamp, "0".repeat(64));
  assert.equal(response.status, 401);
  assert.equal((await response.json()).error, "INVALID_SIGNATURE");
});

test("modified payload is rejected when original signature is reused", async () => {
  const { id } = await postTransaction();
  const originalBody = JSON.stringify({ amount: 10, currency: "USD" });
  const timestamp = Math.floor(Date.now() / 1000);
  const originalSignature = sign(timestamp, id, originalBody);
  const changedBody = JSON.stringify({ amount: 11, currency: "USD" });
  const response = await putTransaction(id, changedBody, timestamp, originalSignature);
  assert.equal(response.status, 401);
  assert.equal((await response.json()).error, "INVALID_SIGNATURE");
});

test("expired timestamp is rejected", async () => {
  const { id } = await postTransaction();
  const rawBody = JSON.stringify({ amount: 10, currency: "USD" });
  const timestamp = Math.floor(Date.now() / 1000) - 301;
  const signature = sign(timestamp, id, rawBody);
  const response = await putTransaction(id, rawBody, timestamp, signature);
  assert.equal(response.status, 401);
  assert.equal((await response.json()).error, "EXPIRED_TIMESTAMP");
});

test("future timestamp is rejected", async () => {
  const { id } = await postTransaction();
  const rawBody = JSON.stringify({ amount: 10, currency: "USD" });
  const timestamp = Math.floor(Date.now() / 1000) + 301;
  const signature = sign(timestamp, id, rawBody);
  const response = await putTransaction(id, rawBody, timestamp, signature);
  assert.equal(response.status, 401);
  assert.equal((await response.json()).error, "EXPIRED_TIMESTAMP");
});

test("entity ID header must match the URL runtime ID", async () => {
  const { id } = await postTransaction();
  const rawBody = JSON.stringify({ amount: 10, currency: "USD" });
  const timestamp = Math.floor(Date.now() / 1000);
  const signature = sign(timestamp, id, rawBody);
  const response = await fetch(`${base}/transactions/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "X-Timestamp": String(timestamp),
      "X-Signature-Auth": signature,
      "X-Entity-ID": "different-id",
    },
    body: rawBody,
  });
  assert.equal(response.status, 400);
  assert.equal((await response.json()).error, "ENTITY_ID_MISMATCH");
});

test("malformed JSON is rejected after authentication", async () => {
  const { id } = await postTransaction();
  const rawBody = '{"amount":';
  const timestamp = Math.floor(Date.now() / 1000);
  const signature = sign(timestamp, id, rawBody);
  const response = await putTransaction(id, rawBody, timestamp, signature);
  assert.equal(response.status, 400);
  assert.equal((await response.json()).error, "INVALID_JSON");
});

test("valid replay is rejected", async () => {
  const { id } = await postTransaction();
  const rawBody = JSON.stringify({ amount: 99, currency: "USD" });
  const timestamp = Math.floor(Date.now() / 1000);
  const signature = sign(timestamp, id, rawBody);
  const first = await putTransaction(id, rawBody, timestamp, signature);
  assert.equal(first.status, 200);
  const completionTime = Date.now();
  const replaySubmittedAt = Date.now();
  const second = await putTransaction(id, rawBody, timestamp, signature);
  assert.ok(replaySubmittedAt - completionTime < 300);
  assert.equal(second.status, 409);
  assert.equal((await second.json()).error, "REPLAY_DETECTED");
});
