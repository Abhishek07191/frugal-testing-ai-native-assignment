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

## Synchronization and security

Q1 synchronization is derived from the WebSocket packet state, not fixed waiting. The retry
operation uses real HTTP 503 responses and backoff. Its circuit-breaker state is recorded on
the action panel and transitions through CLOSED, OPEN, and HALF-OPEN. Payload distortion is
performed by Playwright request routing and remains tested both transformed and unmodified.

Q2 preserves raw request text and includes timestamp and entity ID in its HMAC payload.
Signature verification uses `crypto.timingSafeEqual`, timestamp freshness uses an absolute
300-second window, and replay state is retained for accepted signed requests.
