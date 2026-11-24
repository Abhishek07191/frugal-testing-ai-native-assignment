# Q3 - Shadow DOM Demonstration

## Run
From this directory:
```bash
python3 -m http.server 4175
# Open http://127.0.0.1:4175
```

`index.html` creates:
- an open shadow host;
- an independently retained closed shadow root;
- a nested closed shadow root beneath the open root.

## Closed Root Limitation
After `attachShadow({ mode: "closed" })`, `closedHost.shadowRoot` is `null`, and `closedHost.querySelector(...)` cannot traverse the hidden root. Ordinary JavaScript cannot access it after attachment without the original reference. The demo does retain a reference in the script only to prove that instrumentation in the creating scope can still inspect it.

## Supported Alternatives
- attach instrumentation before or when creating the root and retain the explicit root reference;
- use browser-supported CDP DOM/accessibility domains where your automation environment permits it;
- expose documented test seams or semantic application components;
- for open roots, use Playwright locators with open-root traversal support.

## Semantic Prompt
The reusable advanced prompt is in [semantic-locator-prompt.md](./semantic-locator-prompt.md).

## Automated Verification
```bash
npm test
```
The Playwright test verifies open-root traversal and closed/nested closed ordinary-DOM
limitations. A success screenshot is written to `test-results/q3-shadow-dom.png`.
