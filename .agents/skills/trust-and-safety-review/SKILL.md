---
name: trust-and-safety-review
description: >-
  Reviews anonymous chat abuse scenarios, user reporting mechanisms, moderation capabilities,
  and drafts Community Guidelines, Safety Centers, and safety policies for esmiringle.
  Use when analyzing harassment risks, evaluating moderation tools, or drafting safety guidelines.
---

# Trust and Safety Review Skill

This skill guides the analysis of abuse scenarios in anonymous text chatting, reviews current moderation mechanics, and drafts actionable community guidelines and safety documentation for esmiringle.

## Review Workflow

### 1. Anonymous Chat Threat & Abuse Modeling
Evaluate common threat scenarios native to anonymous peer chat:
- **Harassment & Bullying**: Unsolicited hate speech, verbal abuse, or repeated trolling.
- **Scams & Phishing**: Sharing phishing links, deceptive crypto/cash schemes, or social engineering.
- **Unsolicited Explicit Content**: Sexually explicit text or solicitation of minors.
- **Doxxing & Personal Data Exposure**: Attempts to extract personal numbers, social media handles, or home addresses.
- **Automated Spam / Bot Flooding**: Bots attempting to blast spam messages to maximize victim reach.

### 2. Audit Existing Moderation & Safety Controls
Review what the codebase currently supports:
- **Rate Limiting**: Check if abusive message flooding is mitigated by `messageLimiter` and `TemporaryBlocklist`.
- **Character Limits**: Check if message size guards (1,000 chars) prevent terminal/browser freeze.
- **Reporting Mechanism**:
  - Check `report-partner` event in `server.ts` and `SocketContext.tsx`.
  - Verify whether reporting triggers any action other than disconnecting the room.
  - Note UI gaps: Is there an accessible report button in `ChatViewport.tsx`?
- **Blocking / Banning**:
  - Review `TemporaryBlocklist` (currently blocks an IP for 60 seconds on extreme message flooding or connection flooding).
  - Note lack of user-initiated partner blocking or strike counters.
- **Age Gating**:
  - Inspect onboarding modal in `src/components/OnboardingModal.tsx` and home page guidelines.
  - Check whether 18+ requirement is communicated and whether an age confirmation barrier exists.

### 3. Community Guidelines & Safety Documentation Authoring
When authoring guidelines or Safety Center content:
- **Tone**: Clear, respectful, empowering, and culturally sensitive (support both Bisaya and English phrasing).
- **Core Rules**:
  1. **Strictly 18+**: State clearly that minors are prohibited.
  2. **Respect & Kindness**: Zero tolerance for hate speech, threats, harassment, or non-consensual sexual discussions.
  3. **Privacy First**: Explicitly warn users to never share real names, social media handles (Facebook, Instagram, Telegram), phone numbers, or passwords.
  4. **No Scams or Commercial Promotion**: Prohibit spam bots, selling, or financial solicitation.
- **Safety Tips for Strangers**:
  - How to handle an uncomfortable chat (instant skip via `ESC` or skip button).
  - How to report suspicious activity.
  - How to recognize social engineering tactics.

### 4. Proportionate Safety Recommendations
When recommending improvements:
- Propose lightweight, non-invasive features that maintain the anonymous, account-free nature of the app.
- Examples: Adding a visible "Report" button in the chat header, implementing in-memory strike counters per IP for repeated reports, and automated regex warnings for credit card / phone number patterns.
- Ensure all recommendations preserve the low-latency real-time performance.
