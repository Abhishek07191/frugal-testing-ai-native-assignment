# Execution Results

Results below reflect commands executed in this repository on 2026-11-24.

## Q1
Command: `npm run test:q1`

Actual result:
- 4 Playwright tests passed
- 0 failed
- Runtime: 19.8 seconds
- Dashboard synchronization passed
- Payload interception passed
- Race/retry test passed
- WebSocket route test passed
- Network route observed 6 incoming packets and dropped 1 by packet 4
- Jitter examples: 3171 ms, 4028 ms, 5655 ms, 5780 ms, 5825 ms

Browser dependencies initially were missing (`libatk-1.0.so.0`) and were installed with `npx playwright install-deps chromium`. The rerun passed.

## Q2
Command: `npm run test:q2`

Actual result:
- 5 Node tests passed
- 0 failed
- Runtime: 428 ms
- Valid POST/PUT passed
- Invalid signature passed
- Modified payload passed
- Expired timestamp passed
- Replay passed

## Q3
Served on `http://127.0.0.1:4175` and verified in headless Chromium. The browser confirmed that ordinary closed-root queries returned `null`, `closedHost.shadowRoot` was `null`, the open root exposed an accessible input, and the nested closed descendant was not ordinary-query traversable.

## Reports and Artifacts
- Playwright HTML report: `Q1-UI-Automation/playwright-report/` when generated
- Playwright traces/screenshots: `Q1-UI-Automation/test-results/` only for failed tests
- API test output: terminal output

These artifacts are generated and ignored by Git; no submission PDF or external Drive link was fabricated.
