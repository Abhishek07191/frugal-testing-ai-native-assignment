const chart = document.querySelector("[data-testid=market-chart]");
const ctx = chart.getContext("2d");
const skeleton = document.querySelector("[data-testid=loading-skeleton]");
const syncBadge = document.querySelector("[data-testid=sync-badge]");
const rows = document.querySelector("[data-testid=transaction-rows]");
let packetCount = 0;
let faultCount = 0;
let chartValues = [];

function drawChart() {
  ctx.clearRect(0, 0, chart.width, chart.height);
  if (chartValues.length < 2) return;
  const width = chart.width;
  const height = chart.height;
  const values = chartValues.slice(-24);
  const min = Math.min(...values) * 0.98;
  const max = Math.max(...values) * 1.02;
  ctx.strokeStyle = "#2563eb";
  ctx.lineWidth = 5;
  ctx.beginPath();
  values.forEach((value, index) => {
    const x = (index / (values.length - 1)) * width;
    const y = height - ((value - min) / (max - min || 1)) * (height - 35);
    index ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
  });
  ctx.stroke();
  document.querySelector("[data-testid=first-item-value]").textContent =
    `$${values.at(-1).toFixed(2)}`;
}

function addTransaction(packet) {
  const row = document.createElement("tr");
  row.dataset.packetNumber = String(packet.packetNumber);
  row.innerHTML = `<td>${new Date(packet.timestamp).toLocaleTimeString()}</td>
    <td>${packet.symbol}</td><td>$${packet.value.toFixed(2)}</td><td>Streamed</td>`;
  rows.prepend(row);
  while (rows.children.length > 8) rows.lastElementChild.remove();
}

function setSynchronized() {
  if (syncBadge.dataset.stateSync === "synchronized") return;
  syncBadge.dataset.stateSync = "synchronized";
  document.querySelector("#syncText").textContent = "Synchronized";
  skeleton.classList.add("hidden");
  drawChart();
}

const socket = new WebSocket(`ws://${location.host}/stream`);
socket.addEventListener("open", () => {
  window.setTimeout(() => {
    if (chartValues.length === 0) chartValues = [250, 252, 249, 255];
    setSynchronized();
  }, 900);
});
socket.addEventListener("message", (event) => {
  const packet = JSON.parse(event.data);
  packetCount += 1;
  if (packet.injectedDropMarker) {
    faultCount += 1;
    document.querySelector("[data-testid=fault-count]").textContent =
      `Injected drops: ${faultCount}`;
    return;
  }
  chartValues.push(packet.value);
  document.querySelector("[data-testid=first-item-symbol]").textContent = packet.symbol;
  document.querySelector("#portfolioValue").textContent =
    `$${chartValues.reduce((a, b) => a + b, 0).toFixed(2)}`;
  document.querySelector("[data-testid=packet-count]").textContent =
    `Packets: ${packetCount}`;
  addTransaction(packet);
  drawChart();
  setSynchronized();
});
socket.addEventListener("close", () => {
  syncBadge.dataset.stateSync = "unsynchronized";
  document.querySelector("#syncText").textContent = "Disconnected";
});

const actionButton = document.querySelector("[data-testid=action-button]");
const actionStatus = document.querySelector("[data-testid=action-status]");
const retryLog = document.querySelector("[data-testid=retry-log]");
let circuitOpen = false;

actionButton.addEventListener("click", async () => {
  if (circuitOpen) {
    logRetry("Circuit OPEN: operation blocked");
    actionStatus.textContent = "Circuit open";
    return;
  }
  actionStatus.textContent = "Review started";
  await exponentialAction(0);
});

function logRetry(message) {
  const entry = document.createElement("div");
  entry.textContent = `${new Date().toISOString()} ${message}`;
  retryLog.prepend(entry);
}

async function exponentialAction(attempt) {
  if (attempt >= 4) {
    circuitOpen = true;
    logRetry("Circuit state: OPEN");
    actionStatus.textContent = "Circuit breaker opened";
    window.setTimeout(() => {
      circuitOpen = false;
      logRetry("Circuit state: CLOSED");
    }, 5000);
    return;
  }
  const delay = 50 * (2 ** attempt);
  await new Promise((resolve) => window.setTimeout(resolve, delay));
  actionStatus.textContent = `Review attempt ${attempt + 1} complete`;
  logRetry(`Retry state: attempt=${attempt + 1}, backoff=${delay}ms`);
}

document.querySelector("[data-testid=validate-button]").addEventListener("click", async () => {
  const malformedPrecision = "12.345...malformed";
  const payload = { amount: 1234.56, precision: malformedPrecision };
  const toast = document.querySelector("[data-testid=validation-toast]");
  const message = document.querySelector("[data-testid=validation-message]");
  try {
    const response = await fetch("/api/transactions/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(`${result.error}: ${result.message}`);
    message.textContent = "Transaction accepted";
  } catch (error) {
    message.textContent = `Rejected: ${error.message}`;
    toast.textContent = `Validation toast: ${error.message}`;
    toast.classList.add("visible");
    window.setTimeout(() => toast.classList.remove("visible"), 5000);
  }
});
