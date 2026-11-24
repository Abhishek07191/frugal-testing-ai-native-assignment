const http = require("http");
const path = require("path");
const express = require("express");
const { attachWebSocketServer } = require("./websocket-server");

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const faultCounters = { packetsSent: 0, packetsDropped: 0, packetsDelivered: 0 };

app.get("/api/health", (_req, res) => res.json({ ok: true, service: "q1-dashboard" }));
app.get("/api/faults", (_req, res) => res.json(faultCounters));
app.post("/api/transactions/validate", (req, res) => {
  const precision = req.body?.precision;
  const amount = req.body?.amount;
  if (typeof precision !== "string" || !/^(?:0|[1-9]\d*)\.(?:\d{1,2})$/.test(precision) ||
      typeof amount !== "number" || !Number.isFinite(amount) || amount < 0) {
    return res.status(400).json({
      error: "VALIDATION_PRECISION_ERROR",
      message: "Malformed transaction precision or amount. Expected a non-negative amount and precision with 1-2 decimal places.",
    });
  }
  res.json({ valid: true, normalizedPrecision: Number(precision).toFixed(2) });
});

app.post("/api/reviews", async (req, res) => {
  const failUntilAttempt = Math.max(1, Math.min(8, Number(req.body?.failUntilAttempt || 1)));
  const attempt = Math.max(1, Number(req.body?.attempt || 1));
  await new Promise((resolve) => setTimeout(resolve, 15));
  if (attempt < failUntilAttempt) {
    return res.status(503).json({ error: "REVIEW_TRANSIENT_FAILURE", attempt });
  }
  res.json({ ok: true, attempt });
});

const server = http.createServer(app);
attachWebSocketServer(server, faultCounters);
const port = Number(process.env.PORT || 4173);
server.listen(port, "127.0.0.1", () => {
  console.log(`Q1 dashboard listening at http://127.0.0.1:${port}`);
});
