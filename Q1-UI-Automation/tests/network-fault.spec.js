const { test, expect } = require("@playwright/test");

test("route drops every fourth packet and introduces 2000-7000ms jitter", async ({ page }) => {
  let incomingCount = 0;
  let droppedCount = 0;
  await page.routeWebSocket("**/stream", (route) => {
    const upstream = route.connectToServer();
    upstream.onMessage((message) => {
      incomingCount += 1;
      if (incomingCount % 4 === 0) {
        droppedCount += 1;
        console.log(`FAULT drop packet ${incomingCount}; dropped=${droppedCount}`);
        return;
      }
      const jitter = 2000 + Math.floor(Math.random() * 5001);
      console.log(`FAULT packet=${incomingCount} jitterMs=${jitter}`);
      setTimeout(() => route.send(message), jitter);
    });
  });

  await page.goto("/");
  await page.waitForFunction(
    () => document.querySelector('[data-testid="sync-badge"]')?.dataset.stateSync === "synchronized",
    undefined,
    { timeout: 15_000, polling: 50 }
  );
  await expect.poll(() => incomingCount, { timeout: 20_000 }).toBeGreaterThanOrEqual(4);
  expect(droppedCount).toBeGreaterThanOrEqual(1);
  await expect(page.getByTestId("fault-count")).not.toHaveText("Injected drops: 0");
  console.log(`FAULT SUMMARY incoming=${incomingCount} dropped=${droppedCount}`);
});
