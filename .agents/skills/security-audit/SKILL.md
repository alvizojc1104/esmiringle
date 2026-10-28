---
name: security-audit
description: >-
  Audits application entry points, Socket.IO real-time event handlers, rate limiting,
  input validation, dependency security, and server configurations in esmiringle.
  Use when conducting security assessments, reviewing vulnerability reports, or
  verifying defense mechanisms before deploying changes.
---

# Security Audit Skill

This skill guides security analysis, vulnerability assessments, and remediation planning for esmiringle.

## Audit Workflow

### 1. Connection & Transport Security
- Inspect Socket.IO server initialization in `server.ts`.
- Check CORS settings (`cors.origin`): Verify whether wildcard `*` should be restricted to trusted origins in production.
- Review payload constraints: Check `maxHttpBufferSize` (default 1MB) and ensure buffer starvation cannot occur.
- Review IP resolution: Verify `getClientIp` logic against proxy spoofing (e.g., verifying `cf-connecting-ip` / `x-forwarded-for` ordering and trust).

### 2. Event Handler & Input Validation
Inspect all Socket.IO event listeners:
- `join-queue`: Validate that `profile` is strictly type-checked and that `profile.id` and `profile.gender` cannot inject malicious payloads or exceed bounded lengths.
- `send-message`: Verify message payload schema (`{ text: string }`), length truncation (`slice(0, 1000)`), and verify that only users in an active room can transmit messages.
- `skip-partner` & `typing`: Check for rate limit evasion or rapid socket recycling.
- `report-partner`: Check how the report event is handled server-side.

### 3. Rate Limiting & Anti-DDoS Assessment
Review `src/server/rateLimiter.ts`:
- Check sliding window implementation and timer cleanup (`prune()` every 60s).
- Verify connection limits (30 connections / 60s per IP).
- Verify message limits (5 messages / 3s, abusive flood threshold >12).
- Verify skip limits (4 skips / 4s).
- Check `TemporaryBlocklist` duration and memory footprint.
- Test whether socket reconnection bypasses socket-level rate limiting (IP-level limiter must catch it).

### 4. Authentication & Protected Surfaces
- Inspect `/api/dashboard/stats` and `/api/admin/metrics`.
- Verify that `DASHBOARD_PASSWORD` is enforced from `process.env`.
- Ensure constant-time string comparison (`crypto.timingSafeEqual`) is used for credential checks.
- Verify that no fallback passwords exist in code.

### 5. Client-Side Rendering & XSS
- Inspect `src/components/ChatViewport.tsx`.
- Ensure user messages are rendered via native React string children rather than HTML parsing or `dangerouslySetInnerHTML`.
- Check handling of URLs, mentions, or markdown (if any).

### 6. Vulnerability Classification Matrix

When reporting vulnerabilities, classify according to:
- **Critical**: Unauthenticated remote code execution, secret leakage, or complete denial of service.
- **High**: Rate-limit bypass causing server crashes, persistent message interception, or admin bypass.
- **Medium**: Permissive CORS in production, IP spoofing via crafted headers, or missing security headers.
- **Low / Informational**: Lack of automated URL defanging, missing rate-limiting on reporting endpoints.

### 7. Remediation Validation
After proposing fixes:
1. Run `npx tsc --noEmit` to verify type safety.
2. Confirm chat flow (queue -> match -> send -> skip -> disconnect) remains fully operational.
3. Validate that no existing tests or dependencies were broken.
