# Privacy and Compliance Rules for esmiringle

These rules govern how user privacy, data handling, and regulatory compliance are analyzed, documented, and enforced in esmiringle.

---

## 1. Core Privacy Directives

1. **Zero Message Persistence**: esmiringle operates on a strict ephemeral model. User chat messages must never be written to persistent databases, log files, analytics sinks, or disk storage.
2. **Data Minimization**: Collect only what is strictly necessary to maintain the real-time socket connection and prevent platform abuse.
3. **No Deceptive Compliance Claims**: Never state that esmiringle is "100% compliant with GDPR/HIPAA/COPPA" without empirical architectural verification. Always clearly indicate where formal external legal review is needed.
4. **Transparent Disclosures**: Privacy policies and in-app notices must accurately reflect the code's real behavior regarding IP addresses, local storage, session storage, and dashboard analytics.
5. **No Persistent User Tracking**: Do not introduce third-party ad trackers, tracking cookies, or persistent cross-site device fingerprinting scripts.

---

## 2. Philippine Data Privacy Act of 2012 (RA 10173) Alignment

As a platform developed and operated with Philippine and global users:
- **General Principles**: Adhere to the core tenets of Transparency, Legitimate Purpose, and Proportionality (RA 10173 Section 11).
- **Processing of Personal Information**:
  - IP addresses and User-Agent strings qualify as Personal Information when linked or linkable to an identifiable individual.
  - Ephemeral processing of IP addresses is justified under legitimate interest for abuse prevention, security defense, and routing.
  - Inform users about the purpose and retention period of server-side in-memory metrics.
- **Data Subject Rights**: Clearly state how users can exercise their rights or clear local session data.
- **Security of Personal Information**: Enforce reasonable organizational, physical, and technical measures to protect in-memory sessions and server configurations.

---

## 3. Storage & Analytics Disclosures

- **Client-Side Storage**:
  - `localStorage`: Used solely for client-side device persistence (`esmeringle_did`).
  - `sessionStorage`: Used for transient runtime state (`esmeringle_profile`, `esmeringle_lang`, `esmeringle_theme`, `esmeringle_dashboard_auth`).
  - **No HTTP Cookies** are set or used for user profiling or tracking.
- **Server-Side In-Memory Metrics**:
  - In-memory dashboard tracking (`activeUsersMap`, `recentActivities`, `totalUniqueDevices`) retains up to 150 transient events.
  - Metrics are lost upon server restart and are never exported to external data brokers or cloud storage.

---

## 4. Policy Authoring Requirements

When drafting or updating legal policies (Terms of Service, Privacy Policy, Community Guidelines):
- Ensure terms reflect real, current features (e.g. text-only chat, 1,000 char limit, procedural audio).
- Do not list features as "actively moderated" if automated keyword/image filters do not exist in code.
- Always include an advisory notice: *"These terms and policies represent operational documentation and require formal review by qualified legal counsel."*
