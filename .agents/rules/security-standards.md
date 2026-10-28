# Security Standards for esmiringle

These standards govern all development, architectural evaluations, and code modifications within the esmiringle codebase.

---

## 1. Non-Negotiable Directives

1. **Preserve Existing Functionality**: Never break real-time chat, matchmaking, audio synthesis, or user session flows to implement a theoretical security restriction.
2. **Verify Against Actual Code**: Never assume a vulnerability or security control exists without verifying the source code and runtime behavior.
3. **Avoid Unnecessary Dependencies**: Prefer native Node.js/Web APIs (`crypto`, `URL`, native regex) over third-party npm packages to reduce supply chain surface.
4. **Prioritize Real, High-Impact Vulnerabilities**: Focus on exploitable risks (e.g. Socket buffer exhaustion, unauthorized admin access, connection flooding) over low-severity theoretical claims.
5. **Secure Defaults**: New endpoints and socket handlers must fail closed and require explicit authorization or validation.
6. **No Breaking Destructive Changes**: Obtain explicit approval before introducing breaking schema changes, dropping features, or modifying critical routing.

---

## 2. Real-Time & Socket.IO Security Standards

- **Origin Validation**: Socket.IO connections in production must validate origins against authorized domains (e.g. `https://esmiringle.mikealvizo.dev/` and localhost in development) instead of unconstrained wildcards (`*`).
- **Buffer & Payload Limits**: Always enforce `maxHttpBufferSize` on Socket.IO servers (currently set to 1MB) and truncate individual incoming event fields (e.g. `text.slice(0, 1000)`).
- **Event Payload Validation**: Every incoming Socket.IO event handler (`send-message`, `typing`, `join-queue`, `skip-partner`, `report-partner`) must strictly validate:
  - Argument type (e.g., `typeof data.text === "string"`)
  - Argument length and boundary conditions
  - Room association (ensure sender belongs to the room they are messaging)
- **Rate Limiting & Flood Shielding**:
  - Connection rate limits per IP
  - Message frequency limits per socket and per IP
  - Skip frequency limits to prevent matchmaking queue starvation
  - Temporary blocklist for severe abuse

---

## 3. Web & API Security Standards

- **Zero Hardcoded Secrets**: Secrets such as `DASHBOARD_PASSWORD` must be loaded strictly from environment variables. Never commit secrets, tokens, or fallback defaults to version control.
- **Timing-Safe Authentication**: Authenticating tokens or passwords must use constant-time comparison (`crypto.timingSafeEqual`) to prevent side-channel timing attacks.
- **XSS Prevention**: User messages rendered in React JSX must rely on standard React text node escaping. Never use `dangerouslySetInnerHTML` for user-generated content.
- **HTTP Security Headers**: Next.js configuration and custom server responses should set security headers:
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: DENY`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - Content Security Policy (CSP) where appropriate for WebSockets (`connect-src 'self' wss: https:`)

---

## 4. Verification & Testing

Before completing any security-related modification:
- Run `npx tsc --noEmit` to verify type safety.
- Verify that rate limiters reset properly upon socket disconnection.
- Ensure that valid users can still queue, pair, chat, skip, and disconnect seamlessly.
