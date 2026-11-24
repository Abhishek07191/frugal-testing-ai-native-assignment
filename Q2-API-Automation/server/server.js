const crypto = require("crypto");
const express = require("express");

const app = express();
app.use(express.text({ type: "*/*" }));

const secret = process.env.HMAC_SECRET;
if (!secret) {
  throw new Error("HMAC_SECRET is required; copy .env.example and set a secure environment variable.");
}

const entities = new Map();
const seenSignatures = new Map();

function signingPayload(timestamp, entityId, rawBody) {
  return `${timestamp}\n${entityId}\n${rawBody}`;
}

function computeSignature(timestamp, entityId, rawBody) {
  return crypto.createHmac("sha256", secret)
    .update(signingPayload(timestamp, entityId, rawBody), "utf8")
    .digest("hex");
}

function parseSignature(header) {
  if (typeof header !== "string" || !/^[a-f0-9]{64}$/i.test(header)) return null;
  return Buffer.from(header.toLowerCase(), "hex");
}

app.get("/health", (_req, res) => res.json({ ok: true, service: "q2-hmac-api" }));

app.post("/transactions", (_req, res) => {
  const id = crypto.randomUUID();
  entities.set(id, { id, status: "created" });
  res.status(201).json({ id });
});

app.put("/transactions/:id", (req, res) => {
  const entityId = req.params.id;
  const timestamp = req.headers["x-timestamp"];
  const signatureHeader = req.headers["x-signature-auth"];
  const entityHeader = req.headers["x-entity-id"];

  if (!entities.has(entityId)) return res.status(404).json({ error: "ENTITY_NOT_FOUND" });
  if (!timestamp || !signatureHeader || !entityHeader) {
    return res.status(400).json({ error: "AUTH_HEADERS_REQUIRED" });
  }
  if (entityHeader !== entityId) {
    return res.status(400).json({ error: "ENTITY_ID_MISMATCH" });
  }

  const seconds = Number(timestamp);
  if (!Number.isInteger(seconds) || String(seconds).length !== 10) {
    return res.status(400).json({ error: "INVALID_TIMESTAMP" });
  }
  const age = Math.abs(Math.floor(Date.now() / 1000) - seconds);
  if (age > 300) return res.status(401).json({ error: "EXPIRED_TIMESTAMP" });

  const rawBody = typeof req.body === "string" ? req.body : "";
  const expected = computeSignature(timestamp, entityId, rawBody);
  const provided = parseSignature(signatureHeader);
  const expectedBuffer = Buffer.from(expected, "hex");
  if (!provided || provided.length !== expectedBuffer.length ||
      !crypto.timingSafeEqual(provided, expectedBuffer)) {
    return res.status(401).json({ error: "INVALID_SIGNATURE" });
  }

  const replayKey = `${timestamp}:${signatureHeader.toLowerCase()}`;
  if (seenSignatures.has(replayKey)) {
    return res.status(409).json({
      error: "REPLAY_DETECTED",
      message: "The exact signed PUT was already accepted.",
    });
  }
  seenSignatures.set(replayKey, Date.now());

  let parsed;
  try { parsed = JSON.parse(rawBody); }
  catch (_error) { return res.status(400).json({ error: "INVALID_JSON" }); }

  const entity = entities.get(entityId);
  entity.status = "updated";
  entity.payload = parsed;
  res.json({ id: entityId, status: "updated" });
});

const port = Number(process.env.PORT || 4180);
if (require.main === module) {
  app.listen(port, "127.0.0.1", () => {
    console.log(`Q2 API listening at http://127.0.0.1:${port}`);
  });
}

module.exports = { app, signingPayload, computeSignature };
