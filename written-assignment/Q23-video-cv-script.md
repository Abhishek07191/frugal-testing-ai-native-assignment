# 2–3 Minute Video CV Script

## Suggested Delivery Length: 2 minutes 30 seconds

**Opening – About me**

Hello, my name is Abhishek Tiwari. I am an MCA student developing an AI-native approach to
software engineering and quality automation. In this repository, I completed an assignment
that combines UI automation, API security, browser tooling, and technical communication. I
will explain the role I am preparing for and how I worked on the project.

**Role of an AI-native engineer**

An AI-native engineer uses generative AI to accelerate design, implementation, learning, and
debugging, but remains responsible for the final engineering decision. AI can propose test
cases or alternative architectures quickly. The engineer verifies the proposal against
requirements, runs the code, and inspects real results. In my workflow, AI helped identify
edge cases, while Playwright, Node tests, and direct HTTP/browser inspection proved the
behavior. Responsible use means not entering secrets, not claiming unverified output, and
checking licenses and generated code.

**Complex technical project and challenge**

The most technically complete project in my submission is the combination of UI and API
automation. The UI project streams data over WebSocket, introduces real server packet drops,
applies 2000–7000 millisecond jitter, updates a Canvas dashboard, and verifies dynamic
synchronization. The challenge was that fixed sleeps can hide race conditions and create flaky
tests, so I used application-state guardians and measured a triple-click in a 30–120
millisecond window.

I also implemented a retrying review operation, exponential backoff, and a CLOSED, OPEN,
HALF-OPEN circuit state. On the API side, I built an HMAC-SHA256 PUT protocol using the exact
raw request body, runtime entity ID, Unix timestamp, constant-time comparison, timestamp
validation, tampering detection, and replay rejection. The hardest part was separating each
security control so tests proved the exact failure mode.

**Responsible use of generative AI**

I use generative AI with explicit boundaries. I provide architecture and acceptance criteria,
but I do not accept a generated answer without testing. I avoid credentials and private data.
I distinguish source evidence from plausible explanation. In this repository, I also
corrected existing documentation that had overstated or fabricated execution evidence. That
habit is especially important in software security and technical submissions.

**Solving ambiguity without AI**

Without AI, I would begin by reading source code and requirements, identify missing inputs,
and create measurable acceptance criteria. For a network problem, I would inspect packet
numbers, counters, and browser state. For an API problem, I would send controlled POST and PUT
requests and compare signatures. For the detailed written questions, if the original
assignment PDF is unavailable, I would not guess sub-question answers. I would identify the
missing prompt and request it. Then I would perform a small experiment, document assumptions,
and implement the smallest verifiable change.

**Closing**

This project demonstrates that I can combine browser automation, API security, Shadow DOM
analysis, documentation, and responsible AI use. I am ready to contribute to a testing or
engineering team, learn from real systems, and produce evidence that other people can review.
