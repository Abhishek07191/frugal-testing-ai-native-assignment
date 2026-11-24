# Technical Architecture

## Repository Layout
The repository has three independently runnable assignments. Q1 combines Express, WebSocket, Canvas, and Playwright. Q2 combines Express and Node.js crypto. Q3 is a static vanilla-JavaScript Shadow DOM demonstration.

## Q1
`app/server.js` serves static assets and REST validation. `app/websocket-server.js` owns packet generation and jitter. Browser code renders chart state and provides retry/circuit behavior. Playwright owns fault routing and assertions.

State flow:
1. the page begins `data-state-sync=unsynchronized`;
2. the WebSocket opens and chart initial values are prepared;
3. the guardian observes synchronization;
4. the skeleton hides and the canvas renders.

## Q2
POST creates an in-memory entity. PUT recomputes HMAC from the exact raw body, timestamp, and entity ID. Signature verification precedes replay checks and uses constant-time comparison.

Signing:
```text
hex(HMAC-SHA256(secret, timestamp + "\n" + entityId + "\n" + rawBody))
```

## Q3
Open roots are normally traversable with Playwright and shadow-aware browser APIs. Closed roots require a retained reference, instrumentation, or supported CDP/test seams.
