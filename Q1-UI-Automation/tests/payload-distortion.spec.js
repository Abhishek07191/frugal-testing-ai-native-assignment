const { test, expect } = require("@playwright/test");

test("malformed precision is sent and is surfaced as a validation rejection", async ({ page }) => {
  let capturedBody;
  await page.route("**/api/transactions/validate", async (route) => {
    const request = route.request();
    capturedBody = JSON.parse(request.postData());
    await route.continue();
  });

  await page.goto("/");
  await page.waitForFunction(
    () => document.querySelector('[data-testid="sync-badge"]')?.dataset.stateSync === "synchronized",
    undefined,
    { timeout: 15_000, polling: 50 }
  );
  await page.getByTestId("validate-button").click();

  await expect(page.getByTestId("validation-message")).toContainText("Rejected:");
  await expect(page.getByTestId("validation-toast")).toHaveClass(/visible/);
  expect(capturedBody).toEqual({
    amount: 1234.56,
    precision: "12.345...malformed",
  });
});
