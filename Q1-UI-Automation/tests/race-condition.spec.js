const { test, expect } = require("@playwright/test");

test("triple-click is timed and race-safe; retry and circuit states are functional", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByTestId("sync-badge")).toHaveAttribute("data-state-sync", "synchronized");

  const timing = await page.evaluate(async () => {
    const button = document.querySelector('[data-testid="action-button"]');
    button.dataset.failUntilAttempt = "99";
    const started = performance.now();
    button.click();
    let secondTime = 0;
    let thirdTime = 0;
    await new Promise((resolve) => {
      requestAnimationFrame(() => {
        secondTime = performance.now();
        button.click();
        const waitForWindow = () => requestAnimationFrame(() => {
          const elapsed = performance.now() - started;
          if (elapsed < 30) {
            waitForWindow();
            return;
          }
          thirdTime = performance.now();
          button.click();
          resolve();
        });
        waitForWindow();
      });
    });
    return {
      firstToThirdMs: thirdTime - started,
      lastIntervalMs: thirdTime - secondTime,
    };
  });

  expect(timing.firstToThirdMs).toBeGreaterThanOrEqual(30);
  expect(timing.firstToThirdMs).toBeLessThanOrEqual(120);
  await expect(page.getByTestId("action-status")).toContainText(/Review attempt|Circuit breaker opened|Circuit open/);
  await expect(page.getByTestId("retry-log")).toContainText("Retry state:");
  await expect(page.getByTestId("action-panel")).toHaveAttribute("data-circuit-state", "OPEN", { timeout: 20_000 });
  await expect(page.getByTestId("retry-log")).toContainText("Circuit state: OPEN");

  await expect(page.getByTestId("action-panel")).toHaveAttribute("data-circuit-state", "HALF_OPEN", { timeout: 5_000 });
  await page.getByTestId("action-button").click();
  await expect(page.getByTestId("action-panel")).toHaveAttribute("data-circuit-state", "CLOSED");
  await expect(page.getByTestId("retry-log")).toContainText("Circuit state: CLOSED");
});
