const { test, expect } = require("@playwright/test");

test("dashboard synchronizes and renders valid streamed chart data", async ({ page }) => {
  await page.goto("/");
  const guardian = page.waitForFunction(
    () => {
      const badge = document.querySelector('[data-testid="sync-badge"]');
      const skeleton = document.querySelector('[data-testid="loading-skeleton"]');
      const canvas = document.querySelector('[data-testid="market-chart"]');
      const ctx = canvas?.getContext("2d");
      return badge?.dataset.stateSync === "synchronized" &&
        getComputedStyle(skeleton).display === "none" &&
        !!ctx &&
        canvas.width > 0 &&
        canvas.height > 0;
    },
    undefined,
    { timeout: 15_000, polling: 50 }
  );
  await guardian;
  await expect(page.getByText("Synchronized")).toBeVisible();
  await expect(page.getByTestId("loading-skeleton")).toBeHidden();
  await expect(page.getByTestId("market-chart")).toBeVisible();
  await expect(page.getByTestId("packet-count")).not.toHaveText("Packets: 0");
  await page.screenshot({
    path: "test-results/dashboard-synchronized.png",
    fullPage: true,
  });
});
