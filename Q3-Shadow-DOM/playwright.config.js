const { defineConfig } = require("@playwright/test");

module.exports = defineConfig({
  testDir: "./tests",
  timeout: 30_000,
  reporter: [["list"]],
  use: {
    baseURL: "http://127.0.0.1:4175",
  },
  webServer: {
    command: "python3 -m http.server 4175",
    url: "http://127.0.0.1:4175",
    reuseExistingServer: true,
  },
});
