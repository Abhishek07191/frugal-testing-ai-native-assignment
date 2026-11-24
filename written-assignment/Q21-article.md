# Building Reliable AI-Native Quality Systems: From Browser Streams to Signed APIs

## Introduction

Software quality is changing. Generative AI can draft test cases, explain failures, and
accelerate implementation, but software is still validated by evidence. A UI can look
correct while packet handling fails. An API can return a plausible response while accepting
a tampered body or replayed request. An automation suite can pass while its assertions are
only timing logs. The AI-native engineer therefore uses AI for speed and breadth while
preserving deterministic tests, security boundaries, observable application state, and
human accountability.

This article describes the architecture and engineering principles demonstrated by three
small projects: a WebSocket streaming dashboard, an HMAC-SHA256 resource API, and a
Shadow DOM example. It is not a claim that these demonstrations are production scale.
Instead, they show how a student or junior engineer can make each requirement measurable.

## 1. Designing observable state

The Q1 dashboard begins in an unsynchronized state. It exposes a `data-state-sync` attribute
and hides a loading skeleton only after a valid WebSocket packet changes application state.
The test uses `waitForFunction` and Playwright assertions to wait for that state. It does not
perform a fixed delay to represent synchronization. This distinction is important: a socket
opening establishes transport availability, but the application is synchronized only when
usable packets have reached its data model and rendering path.

The dashboard also separates chart values, packet counters, drop counters, and retry/circuit
state. Separating these values makes failures diagnosable. A test can prove a chart has
rendered, while another proves packet loss or circuit transitions. A canvas alone is harder
to inspect; therefore the implementation exposes a valid DOM badge and text result while
also retaining a real canvas element.

## 2. Packet loss and latency

The WebSocket server creates packet objects every interval and schedules each delivery after
a random 2000–7000 millisecond delay. Every fourth packet is not sent, so the browser never
processes it. Counters distinguish packets generated, dropped, and delivered. The server
stores real application state instead of merely reporting a test log.

There are two useful testing observations. A Playwright route can observe upstream socket
messages and apply an additional route-level drop for a deterministic browser fault. The
server can independently impose its real dropped packet behavior. Tests should not claim
route interception alone proves server packet loss. In this repository, the API fault counters
and observed packet numbers demonstrate both sides. Jitter remains variable rather than a
fixed 5000-millisecond sleep.

The browser should continue after dropped packets. Losing a packet must not destroy
connection state or stop subsequent chart updates. A recovery test should therefore verify
both the drop marker/counter and one later delivered packet.

## 3. Races, retries, and circuit breakers

Three fast clicks are a concurrency and race problem. Q1 dispatches three animation-frame
events and measures the elapsed interval. It guards an operation while it is in flight and
records duplicate attempts as race guards rather than launching parallel work. This test
measures an actual interaction window, not a claim in a comment.

The retry implementation calls a review endpoint. A transient HTTP 503 is caught and retried
with 100, 200, 400 and later exponential delays. Permanent problems are not retryable unless
the protocol documents them as transient. Every attempt is observable in the log.

A circuit breaker then provides the larger failure boundary. In CLOSED state, operations are
allowed. In OPEN state, calls are blocked after the threshold. After a cooldown, HALF-OPEN
allows one controlled probe. Success closes the circuit; failure reopens it. A test verifies
all three data states and a real HTTP probe. Production circuits need distributed counters
and concurrency-safe clocks, but this local model demonstrates the state machine clearly.

## 4. API design and exact-body signing

The Q2 API creates an entity using POST and returns a runtime UUID. The test does not hard-code
that value. PUT uses the ID in the URL and `X-Entity-ID`, and the server verifies that they
match. This links authorization to the actual resource instead of accepting arbitrary entity
headers.

The signing payload is:

```text
timestamp + "\n" + entityId + "\n" + exact raw body
```

The HMAC-SHA256 server recomputes the same payload with the exact bytes received. This
prevents whitespace or field changes from becoming invisible. It does not merely sign a
JavaScript object after reparsing JSON, because reparsing can alter representation.

Timestamp validation also has a purpose. A valid signature from an old or future request
should not remain trusted indefinitely. Q2 accepts Unix seconds only inside an absolute
five-minute window. Replay detection adds a second independent control: after a signature
and timestamp pass authentication, the server records the exact replay key. A repeated PUT
receives 409 even though the cryptographic signature is valid.

## 5. Cryptographic verification and tampering

Signature parsing rejects malformed lengths and non-hexadecimal input. The expected and
provided digests are fixed-length buffers compared with `crypto.timingSafeEqual`. This is
defensible because a simple string comparison can reveal timing differences. It does not
claim timing safety for the entire application, especially if earlier validation lengths
cause different code paths. It is only one security layer.

Tampering tests change the body but reuse the original timestamp, entity ID, and signature.
The HMAC recomputation differs, and HTTP 401 is returned. Replay tests send the exact original
body and signature twice. The second request is recognized as replay and rejected. Malformed
JSON is checked only after authentication, then HTTP 400 is returned instead of reaching
entity state.

## 6. Shadow DOM and semantic locators

Shadow DOM is not a security boundary. It is an encapsulation boundary. Open roots have an
accessible host reference and shadow root that browser tooling can traverse. Closed roots
return `null` from `closedHost.shadowRoot` and cannot be reached with ordinary selectors
from outside the attachment scope.

Q3 demonstrates open content and both a closed root and a nested closed root beneath an open
root. Playwright uses a role/accessible-name strategy for open content and verifies that
ordinary document queries do not obtain hidden closed descendants. Closed-root automation
requires a retained reference from the component's creation scope, an application test seam,
or a supported browser-domain/CDP workflow. The result should be described precisely:
closed roots are encapsulated, not cryptographically secret.

## 7. AI-native practice

AI is useful for requirements brainstorming, test-matrix expansion, code review prompts,
and concise documentation. It is not reliable evidence. An AI-generated test may assert
console text instead of application state. An AI-generated cryptographic example may omit
timestamp freshness or replay cache behavior. AI may also describe a closed root as
completely inaccessible even though supported tooling or a retained reference exists.

The responsible workflow is: give AI architecture and constraints, ask for alternatives,
review generated code, execute it locally, inspect failures, and keep only tested changes.
The engineer verifies results with HTTP status codes, DOM attributes, packet counters,
timing measurements, and terminal pass/fail output. AI does not replace source control,
security review, or stakeholder clarification.

## Conclusion

Reliable automation depends on observable state, exact boundaries, and honest evidence.
Dynamic guardians replace sleeps. Packet counters and raw payloads replace unobservable
success logs. Retries prove real transient failure handling. Circuit breakers expose
state transitions. HMAC signing includes all signed facts and uses constant-time comparison.
Timestamp and replay controls limit reuse. Closed Shadow DOM is handled without overstating
what automation can access.

These patterns are small enough for an MCA student to explain yet substantial enough to
interview. The strongest submission is one where implementation, tests, reports, and
limitations agree. It should also identify manual work—video recording, Drive upload,
social evidence, and PDF submission—rather than fabricating it.

## References

- The Playwright documentation: locators, WebSocket routes, screenshots, reports, and
  `waitForFunction`.
- Node.js documentation: `crypto.createHmac`, `crypto.timingSafeEqual`, and the test runner.
- Express 5 and WebSocket (`ws`) package documentation.
- MDN Web Docs: Shadow DOM, closed shadow roots, ARIA roles and accessible names.
- OWASP guidance: replay resistance, timestamp validation, cryptographic message
  authentication, and constant-time comparison.
