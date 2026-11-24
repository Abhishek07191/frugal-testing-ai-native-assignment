# Video Recording Guide

## Q1 Workflow Video

Record a 3–5 minute uninterrupted screen recording:

1. Show repository and Q1 structure.
2. Explain the Express dashboard and WebSocket server.
3. Start the dashboard and open Chromium.
4. Show synchronization changing from unsynchronized to synchronized.
5. Run `npm run test:q1`.
6. Explain packet drops, jitter, triple-click, retry/backoff, circuit states, and payload
   interception while the terminal and report are visible.
7. Open the Playwright HTML report.
8. End with [docs/execution-results.md](./execution-results.md).

Do not describe route interception as server packet loss unless you show the `/api/faults`
counters and server implementation.

## Q2 Workflow Video

Record a 3–5 minute demonstration:

1. Explain exact raw-body signing.
2. Show `.env.example` and set a local secret in the terminal without displaying a real secret.
3. Start the server.
4. Run `npm run test:q2`.
5. Explain runtime POST entity IDs, PUT URL/header IDs, signature verification,
   `timingSafeEqual`, timestamp validation, tampering, and replay.
6. Open the test source and discuss HTTP 201/200/400/401/404/409 responses.

Do not publish the HMAC secret or terminal environment history.

## Q3 Workflow Video

Record a 2–3 minute demonstration:

1. Start `python3 -m http.server 4175`.
2. Open the page and show open, closed, and nested closed areas.
3. Demonstrate that ordinary closed-root queries return `null`.
4. Show `closedHost.shadowRoot === null`.
5. Explain retained references and supported alternatives.
6. Run `npm run test:q3`.

## Q23 Video CV

Use [Q23 video CV script](../written-assignment/Q23-video-cv-script.md). Record 2–3 minutes
in a quiet environment with a visible face and clear audio. Do not add employment,
certifications, or engagement metrics that are not supported by evidence.

## Recording Safety

- No passwords or secrets.
- No private browser profiles or unrelated tabs.
- No unverified success claims.
- Show current repository state and terminal output.
- State that recordings are awaiting the user's manual upload.
