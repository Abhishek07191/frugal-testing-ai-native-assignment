const { test, expect } = require("@playwright/test");

test("triple-click starts during synchronized UI and uses retry-safe action handling", async ({ page }) => {
  await page.goto("/");
  await page.waitForFunction(
    () => document.querySelector('[data-testid="sync-badge"]')?.dataset.stateSync === "synchronized",
    undefined,
    { timeout: 15_000, polling: 50 }
  );

  await page.evaluate(() => {
    // Frame-based delay keeps the trigger approximately 64ms after synchronization.
    let frames = 0;
    function fireTripleClick() {
      frames += 1;
      if (frames === 4) {
        const button = document.querySelector('[data-testid="action-button"]');
        button.click();
        button.click();
        button.click();
      } else {
        requestAnimationFrame(fireTripleClick);
      }
    }
    requestAnimationFrame(fireTripleClick);
  });

  await expect(page.getByTestId("action-status")).toHaveText(/Review attempt|Review started/);
  await expect(page.getByTestId("retry-log")).toContainText("Retry state:");
});
