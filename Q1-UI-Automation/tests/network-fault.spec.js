const { test, expect } = require("@playwright/test");

test("WebSocket server drops every fourth packet and applies 2000-7000ms jitter", async ({ page, request }) => {
  const observed = [];
  let routeDropped = 0;

  await page.routeWebSocket("**/stream", (route) => {
    const upstream = route.connectToServer();
    let incomingCount = 0;
    upstream.onMessage((message) => {
      incomingCount += 1;
      const packet = JSON.parse(message.toString());
      observed.push(packet);
      expect(packet.jitterMs).toBeGreaterThanOrEqual(2000);
      expect(packet.jitterMs).toBeLessThanOrEqual(7000);
      if (incomingCount % 4 === 0) {
        routeDropped += 1;
        return;
      }
      route.send(message);
    });
  });

  await page.goto("/");
  await expect(page.getByTestId("sync-badge")).toHaveAttribute("data-state-sync", "synchronized");
  await expect.poll(async () => {
    const response = await request.get("/api/faults");
    const faults = await response.json();
    return faults.packetsDropped;
  }, { timeout: 30_000, intervals: [100, 250, 500] }).toBeGreaterThanOrEqual(1);

  await expect.poll(() => observed.length, { timeout: 30_000 }).toBeGreaterThanOrEqual(8);
  expect(observed.every((packet) =>
    packet.packetNumber % 4 !== 0
  )).toBe(true);
  expect(observed.every((packet) =>
    packet.jitterMs >= 2000 && packet.jitterMs <= 7000
  )).toBe(true);
  expect(routeDropped).toBeGreaterThanOrEqual(1);
  await expect(page.getByTestId("packet-count")).not.toHaveText("Packets: 0");
});
