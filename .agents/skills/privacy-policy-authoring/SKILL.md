---
name: privacy-policy-authoring
description: >-
  Maps application data flows, audits storage mechanisms, and drafts legal documentation
  including Privacy Policies, Terms of Service, and data disclosures for esmiringle.
  Use when analyzing user data retention, drafting legal notices, or verifying compliance
  with privacy regulations like the Philippine Data Privacy Act of 2012 (RA 10173).
---

# Privacy Policy Authoring Skill

This skill guides the empirical mapping of data flows and the authoring of clear, legally consistent privacy policies and terms for esmiringle.

## Authoring Workflow

### 1. Empirical Codebase Data Flow Mapping
Before writing any policy statements, inspect the active codebase to confirm data handling:
- **Chat Message Content**: Verify that messages are routed directly in-memory through `socket.to(room.partnerSocketId).emit(...)` and that no SQL, NoSQL, disk, or cloud databases exist.
- **Client Storage**:
  - `localStorage`: Document usage of `esmeringle_did` (anonymous pseudo-random device ID).
  - `sessionStorage`: Document usage of `esmeringle_profile` (chosen alias/gender), `esmeringle_lang`, `esmeringle_theme`, and `esmeringle_dashboard_auth`.
  - Confirm that no tracking or profiling cookies are used.
- **Server Metrics & Memory**:
  - Document the in-memory `activeUsersMap` and `recentActivities` in `server.ts`.
  - Disclose that IP addresses, User-Agents, and socket IDs are stored in volatile server memory solely for DDoS mitigation, abuse prevention, and live metrics.
  - Confirm that all in-memory metrics are destroyed upon server restart.
- **Third-Party Processors**:
  - Check for external CDNs, fonts, or analytics (Google Fonts, Cloudflare, hosting provider).
  - Disclose host-level network logging (e.g., Render/Cloudflare ingress logs).

### 2. Philippine Data Privacy Act (RA 10173) Alignment
Ensure compliance considerations specific to Philippine jurisdiction:
- **Principles of Transparency, Legitimate Purpose, and Proportionality**:
  - State clearly why transient IP processing occurs (anti-abuse, security, network routing).
  - State that no marketing profiles or user registries are created.
- **Data Subject Rights**:
  - Address rights regarding data access, rectification, and erasure.
  - Explain that because users are strictly anonymous and messages are ephemeral, historical chats cannot be retrieved, exported, or deleted on demand.
  - Provide instructions for users to clear their browser storage (`localStorage.clear()`).
- **Data Protection Officer / Inquiries**:
  - Designate contact mechanisms for privacy questions (e.g. email or GitHub repository issue).

### 3. Policy Drafting Framework

Draft documents using plain language with clear sections:
1. **Introduction & Scope**: Service description and operator identity.
2. **Information We Do Not Collect**: Emphasize zero registration, no email/phone collection, no persistent chat logs.
3. **Information Handled During Use**:
   - Chosen alias (Dawg, Amiga, Anon).
   - Technical metadata (IP address, User-Agent, device type).
   - Ephemeral messages (relayed in memory, never persisted).
4. **How Information Is Used**: Matchmaking, anti-DDoS, rate limiting, and community protection.
5. **Data Retention**: Ephemeral lifetime (discarded immediately or kept in memory up to 150 events).
6. **Cookies and Local Storage**: Clear distinction between cookies (none) and web storage.
7. **Age Restrictions**: 18+ requirement.
8. **Disclaimers & Contact**: Required legal review advisory notice.

### 4. Verification Check
- Ensure no drafted document promises features that do not exist (e.g., automated end-to-end encryption or AI content moderation).
- Add mandatory disclaimer: *"This document is an operational draft and requires formal review by qualified legal counsel."*
