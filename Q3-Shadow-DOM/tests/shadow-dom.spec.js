const { test, expect } = require("@playwright/test");

test("open and closed Shadow DOM behavior is observable and limited accurately", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("h1")).toContainText("Shadow DOM");

  const openInput = page.locator("#open-host").locator("input");
  await expect(openInput).toHaveAttribute("aria-label", "Open name");

  const browserResult = await page.evaluate(() => ({
    closedHostShadowRoot: document.querySelector("#closed-host").shadowRoot,
    openClosedName: document.querySelector("#closed-name"),
    nestedButtonFromOpenRoot: document.querySelector("#open-host")
      .shadowRoot?.querySelector("button"),
  }));
  expect(browserResult.closedHostShadowRoot).toBeNull();
  expect(browserResult.openClosedName).toBeNull();
  expect(browserResult.nestedButtonFromOpenRoot).toBeNull();

  await expect(page.locator("#result")).toContainText("closed root hidden");
  await expect(page.locator("#result")).toContainText("Nested closed query");
  await page.screenshot({
    path: "test-results/q3-shadow-dom.png",
    fullPage: true,
  });
});
