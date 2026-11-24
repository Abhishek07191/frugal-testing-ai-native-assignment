# Frugal Testing - AI-Native Software Engineer Assignment

This repository contains three runnable assignments:

| Directory | Assignment |
|---|---|
| [Q1-UI-Automation](./Q1-UI-Automation) | Express dashboard, WebSocket fault simulation, Playwright synchronization/race/payload tests |
| [Q2-API-Automation](./Q2-API-Automation) | HMAC-SHA256 authenticated API with replay/tampering tests |
| [Q3-Shadow-DOM](./Q3-Shadow-DOM) | Open/nested/closed Shadow DOM demonstration and semantic locator prompt |

## Codespaces Setup
```bash
npm run install:all
cd Q1-UI-Automation && npx playwright install --with-deps chromium
cd ..
```

## Run Q1
```bash
npm run test:q1
# manual dashboard:
npm start --prefix Q1-UI-Automation
```

Open `http://127.0.0.1:4173`.

## Run Q2
```bash
npm run test:q2
HMAC_SECRET='replace-with-a-local-secret' npm start --prefix Q2-API-Automation
```

Open/API base: `http://127.0.0.1:4180`.

## Run Q3
```bash
cd Q3-Shadow-DOM
python3 -m http.server 4175
```

Open `http://127.0.0.1:4175`.

## Run All Automated Tests
```bash
npm test
```

This runs Q1 Playwright tests and Q2 Node tests.

## Documentation
- [Technical architecture](./docs/technical-architecture.md)
- [Execution results](./docs/execution-results.md)
- [Evidence checklist](./docs/assignment-evidence-checklist.md)

## Actual Verification
The executed suites passed: Q1 4/4 Playwright tests and Q2 5/5 security tests. See the execution report for environment details and limitations.
