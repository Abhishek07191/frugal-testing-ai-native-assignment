# Execution Results

Results below reflect commands executed in this repository on 2026-11-24.

## Actual Automated Run

Command: `npm test`

Run date: 2026-11-24.

### Q1 – UI automation

- Command: `npm run test:q1`
- 5 tests passed; 0 failed
- Runtime: 41.0 seconds for the final Q1 rerun; the full-suite rerun immediately before the
  fault-counter UI update reported 39.0 seconds
- Verified dashboard synchronization, server and route packet behavior,
  2000–7000 ms jitter values, malformed-payload interception/modification,
  graceful malformed-payload rejection, measured triple-click timing, retry behavior,
  OPEN/HALF-OPEN/CLOSED circuit transitions.

### Q2 – API security

- Command: `npm run test:q2`
- 8 tests passed; 0 failed
- Runtime: 454.598 ms
- Verified POST/PUT, invalid signature, tampered payload, expired and future timestamps,
  entity-ID mismatch, malformed JSON, and replay rejection.

### Q3 – Shadow DOM

- Command: `npm run test:q3`
- 1 test passed; 0 failed
- Runtime: 2.0 seconds
- Verified open-root traversal and closed/nested closed ordinary-DOM limitation.

## Reports and Artifacts

- Q1 HTML report: `Q1-UI-Automation/playwright-report/`
- Q1 screenshots: `Q1-UI-Automation/test-results/` (generated only when tests run successfully
  or when the failure policy applies)
- Q1 failure traces: `Q1-UI-Automation/test-results/`
- Q3 screenshots: `Q3-Shadow-DOM/test-results/`
- API test output: terminal output

Reports and screenshots are ignored by Git. This file contains no invented external links,
video evidence, PDF, or submission result.
