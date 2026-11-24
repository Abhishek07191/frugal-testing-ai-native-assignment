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
The latest `npm test` run passed:

- Q1: 5/5 Playwright tests
- Q2: 8/8 Node security tests
- Q3: 1/1 Playwright test

See [execution results](./docs/execution-results.md) for commands and actual results.

## Written Submission

- [Written questions Q4–Q20](./written-assignment/Q04-Q20.md)
- [Compulsory Q19](./written-assignment/Q19.md)
- [Q21 technical article](./written-assignment/Q21-article.md)
- [Q22 portfolio](./written-assignment/Q22-portfolio.md)
- [Q23 video CV script](./written-assignment/Q23-video-cv-script.md)
- [Consolidated PDF Markdown source](./docs/consolidated-pdf-source.md)
- [Submission guide](./docs/submission-guide.md)
- [Video recording guide](./docs/video-recording-guide.md)

The original detailed Q4–Q20 prompt and diagrams were not available, so these files must
be compared with the original assignment source before final PDF export.

## Clean Repository

`node_modules`, reports, test results, environment files, logs, and Playwright artifacts are
ignored. No secret is committed; Q2 requires `HMAC_SECRET` at runtime.

## Manual Actions Requiring Participation

- Provide the registration number; do not use a guessed filename.
- Supply or verify the original Q4–Q20 question source.
- Verify LinkedIn/profile and credential facts.
- Record Q1, Q2, Q3 workflow videos and the separate Q23 video CV.
- Upload videos and PDF to the requested Google Drive folders.
- Capture only real social engagement evidence if required.
- Update the resume with only supported facts.
- Submit the Google Form.
