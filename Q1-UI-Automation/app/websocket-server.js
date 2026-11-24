const { WebSocketServer } = require("ws");

function attachWebSocketServer(server, counters) {
  const wss = new WebSocketServer({ server, path: "/stream" });
  wss.on("connection", (socket) => {
    const timer = setInterval(() => {
      counters.packetsSent += 1;
      const packetNumber = counters.packetsSent;
      const jitter = 2000 + Math.floor(Math.random() * 5001); // inclusive 2000-7000 ms
      const packet = {
        packetNumber,
        symbol: ["AAPL", "MSFT", "NVDA", "GOOG"][packetNumber % 4],
        value: Number((100 + Math.random() * 400).toFixed(4)),
        jitterMs: jitter,
        timestamp: new Date().toISOString(),
      };
      setTimeout(() => {
        if (socket.readyState !== socket.OPEN) return;
        if (packetNumber % 4 === 0) {
          counters.packetsDropped += 1;
          return;
        }
        counters.packetsDelivered += 1;
        socket.send(JSON.stringify(packet));
      }, jitter);
    }, 750);

    socket.on("close", () => clearInterval(timer));
  });
  return wss;
}

module.exports = { attachWebSocketServer };
