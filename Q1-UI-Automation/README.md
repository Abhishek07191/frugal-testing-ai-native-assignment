# Q1 - UI Automation and Network Fault Dashboard

## Architecture
Express serves the financial dashboard and exposes a WebSocket at `/stream`. The browser updates a canvas chart and transaction table from streamed JSON. Playwright provides dynamic state guarding, WebSocket interception, payload interception, race handling, screenshots, traces, and HTML reports.

## Install
```bash
npm install
npx playwright install --with-deps chromium
```

## Run
```bash
npm start
# http://127.0.0.1:4173
```

## Test
```bash
npm test
npm run test:headed
```

The suite runs five tests:
1. synchronization and valid chart rendering;
2. every-fourth incoming packet dropped through Playwright routing, with 2–7 second server and route jitter;
3. triple-click after measurable synchronization;
4. malformed precision request capture and payload modification.
5. race-safe triple-click, retry, and all circuit states.

## Expected Output
Dashboard packets render as a live table/chart and the synchronization badge changes to `Synchronized`. Playwright verifies packet and jitter observations and a final server/route drop summary. A passing run ends with `5 passed`.

## Network Simulation
The server generates packets every 750 ms and schedules variable 2000–7000 ms jitter. It also marks every fourth server packet as an injected drop and exposes counters at `/api/faults`. The Playwright WebSocket route separately observes server-to-page traffic and drops every fourth incoming message. This is a deterministic local mock, not a real network or packet-loss implementation.

## Dynamic Guardian
The synchronization test uses `page.waitForFunction` with condition polling and a 15-second timeout. It verifies `data-state-sync=synchronized`, hidden skeleton, and a valid canvas size. It does not use static sleep for synchronization.

## Limitations
Canvas pixels are not OCR-validated; valid canvas dimensions and streamed values are tested. The WebSocket fault is isolated in Playwright interception. The exponential retry demo logs attempts but is intentionally local UI behavior, not a production transaction API.
