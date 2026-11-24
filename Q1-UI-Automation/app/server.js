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
  if (typeof precision !== "string" || !/^\d+\.\d+$/.test(precision) || typeof amount !== "number") {
    return res.status(400).json({
      error: "VALIDATION_PRECISION_ERROR",
      message: "Malformed transaction precision. Expected digits dot digits.",
    });
  }
  res.json({ valid: true, normalizedPrecision: Number(precision).toFixed(2) });
});

const server = http.createServer(app);
attachWebSocketServer(server, faultCounters);
const port = Number(process.env.PORT || 4173);
server.listen(port, "127.0.0.1", () => {
  console.log(`Q1 dashboard listening at http://127.0.0.1:${port}`);
});
