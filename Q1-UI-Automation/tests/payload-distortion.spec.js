const { test, expect } = require("@playwright/test");

test("malformed precision is intercepted, modified, and accepted by the application", async ({ page }) => {
  let capturedOriginal;
  let capturedModified;

  await page.route("**/api/transactions/validate", async (route) => {
    capturedOriginal = JSON.parse(route.request().postData());
    capturedModified = { ...capturedOriginal, precision: "12.34" };
    await route.continue({ postData: JSON.stringify(capturedModified) });
  });

  await page.goto("/");
  await expect(page.getByTestId("sync-badge")).toHaveAttribute("data-state-sync", "synchronized");
  await page.getByTestId("validate-button").click();

  await expect(page.getByTestId("validation-message")).toHaveText("Transaction accepted");
  expect(capturedOriginal).toEqual({
    amount: 1234.56,
    precision: "12.345...malformed",
  });
  expect(capturedModified).toEqual({ amount: 1234.56, precision: "12.34" });
});

test("unmodified malformed precision is rejected gracefully", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByTestId("sync-badge")).toHaveAttribute("data-state-sync", "synchronized");
  await page.evaluate(() => {
    document.querySelector('[data-testid="validate-button"]').click();
  });
  await expect(page.getByTestId("validation-message")).toContainText("Rejected:");
  await expect(page.getByTestId("validation-toast")).toHaveClass(/visible/);
});
