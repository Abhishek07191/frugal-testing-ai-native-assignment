# Q2 - HMAC-SHA256 API Security

## Signing Format
The exact raw signing payload is:
```text
X-Timestamp + "\n" + entityId + "\n" + exact raw UTF-8 request body
```

The signature is:
```text
HMAC-SHA256(HMAC_SECRET, signingPayload)
```
and is sent as lowercase hexadecimal in `X-Signature-Auth`.

Headers required for PUT:
- `X-Timestamp`: live Unix seconds
- `X-Signature-Auth`: 64-character lowercase/uppercase hexadecimal HMAC
- `X-Entity-ID`: entity ID (also verified from the URL)

The entity ID is in the URL, and timestamp, entity ID, and raw body are all included in the signature. The server rejects stale timestamps older or newer than 300 seconds and uses `crypto.timingSafeEqual` for signature verification.

## Install and Run
```bash
cp .env.example .env
# Replace HMAC_SECRET with a local high-entropy value
npm install
HMAC_SECRET='replace-with-a-local-secret' npm start
```

The server starts at `http://127.0.0.1:4180` by default.

## Test
```bash
npm test
```

The tests create a process with a test-only environment secret. They cover valid POST/PUT,
invalid signature, modified payload, expired and future timestamps, entity-ID mismatch,
malformed JSON, and replay.

## Expected Security Responses
- `201` valid POST
- `200` valid PUT
- `400` malformed headers or JSON
- `401` invalid signature or expired timestamp
- `409` exact replay
- `404` unknown entity

## Replay and Tampering
The replay test submits a valid PUT, captures its signature and timestamp, changes one character of the body, and reuses the originals. The modified body fails HMAC verification. A second identical signed PUT is then rejected as replay.

## Limitation
The in-memory entity and replay stores reset when the process restarts. This demonstrates the protocol but is not a persistent distributed replay cache.
