<p align="center">
  <a href="https://esmiringle.mikealvizo.dev/" target="_blank" rel="noopener noreferrer">
    <img src="public/android-chrome-192x192.png" alt="esmiringle logo" width="100" height="100" style="border-radius: 22px;" />
  </a>
</p>

<h1 align="center">esmiringle ⚡</h1>

<p align="center">
  <b>Fast, anonymous, 1-on-1 real-time text chat with strangers.</b>
  <br />
  Featuring Cebuano (Bisaya) & English multi-language support, custom aliases, and zero sign-ups.
</p>

<p align="center">
  <a href="https://esmiringle.mikealvizo.dev/"><img src="https://img.shields.io/badge/Live%20Demo-esmiringle.mikealvizo.dev-0070f3?style=for-the-badge&logo=googlechrome&logoColor=white" alt="Live Demo" /></a>
  <img src="https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js" />
  <img src="https://img.shields.io/badge/Socket.io-4.8-010101?style=for-the-badge&logo=socketdotio&logoColor=white" alt="Socket.io" />
  <img src="https://img.shields.io/badge/TypeScript-5.6-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/TailwindCSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
</p>

---

## 🌟 What is esmiringle?

**esmiringle** is an open-source, privacy-first Omegle alternative engineered for spontaneous, frictionless 1-on-1 text conversations. Whether you want to share stories, make friends, practice languages, or just kill time, **esmiringle** pairs you with someone online in milliseconds.

No sign-ups, no accounts, and no data tracking — just pick your persona and start chatting.

### 🌐 Live Application
Experience it live right in your browser:  
👉 **[https://esmiringle.mikealvizo.dev/](https://esmiringle.mikealvizo.dev/)**

---

## ✨ Key Features

- ⚡ **Instant Peer Matchmaking**: Real-time room allocation powered by WebSockets (`Socket.io`) with automatic reconnection handling and queueing.
- 🇵🇭 **Bilingual Support (Bisaya & English)**: Built with deep cultural familiarity. Cebuano (Bisaya) is supported out of the box alongside English with dynamic runtime language switching.
- 🎭 **Expressive Personas & Aliases**:
  - 👨 **Dawg** (*Lalaki / Male*)
  - 👩 **Amiga** (*Babaye / Female*)
  - 👤 **Anon** (*Dili lang ko magsaba / Prefer not to say*)
- 🔒 **Privacy by Design**:
  - Zero registration or personal info required.
  - Ephemeral chat state managed purely in `sessionStorage`.
  - Messages are strictly routed in-memory through real-time sockets; no chat logs or databases store your conversations.
- 🔊 **Procedural Web Audio Engine**: Integrated dynamic sound effects (message alerts, matchmaking chime, click feedback, disconnect tone) synthesized on-the-fly using the browser's native **Web Audio API** — no heavy external audio files needed.
- ⌨️ **Keyboard Navigation**: Press <kbd>ESC</kbd> at any point to quickly skip, rematch with another stranger, or cancel matchmaking.
- 🌓 **Adaptive Light & Dark Mode**: Seamless theme switching with high contrast and smooth micro-animations.
- 🛡️ **Abuse & Spam Protection**: Sliding-window rate limiters, anti-flood message protection, and safety character counters to keep conversations human and enjoyable.
- 📊 **Real-time Live Online Counter**: Live active visitor tracker showing real-time community engagement.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Frontend**: [React 18](https://react.dev/), [Tailwind CSS](https://tailwindcss.com/), [Lucide React](https://lucide.dev/), [React Virtuoso](https://virtuoso.dev/)
- **Real-time Server**: [Socket.io](https://socket.io/) running on a custom [Node.js](https://nodejs.org/) HTTP server
- **Language**: [TypeScript](https://www.typescriptlang.org/) (executed with `tsx`)
- **Sound Engine**: Web Audio API (procedural frequency synthesis)
- **Deployment**: Node.js runtime / Render / Custom VPS behind reverse proxy

---

## 📂 Project Structure

```text
esmeringle/
├── public/                 # Static assets, icons, and logos
│   ├── android-chrome-192x192.png
│   ├── android-chrome-512x512.png
│   └── site.webmanifest
├── src/
│   ├── app/                # Next.js App Router (pages & layouts)
│   │   ├── chat/           # Dedicated 1-on-1 chat room route
│   │   ├── dashboard/      # Admin metrics & real-time monitoring
│   │   └── page.tsx        # Homepage, alias picker, and matchmaking radar
│   ├── components/         # Reusable UI components
│   │   ├── ChatViewport.tsx
│   │   ├── MatchmakingRadar.tsx
│   │   └── OnboardingModal.tsx
│   ├── context/            # Socket and session providers
│   ├── hooks/              # Custom hooks (useChatSocket, useTyping, etc.)
│   ├── server/             # Rate-limiting and connection management
│   ├── types/              # TypeScript interfaces and matchmaking types
│   └── utils/              # i18n translations, audio synthesis, user tracker
├── server.ts               # Custom Node HTTP + Socket.io server entry
├── package.json
└── tsconfig.json
```

---

## 🚀 Getting Started

Follow these instructions to run esmiringle locally on your machine.

### Prerequisites

- **Node.js**: v18.17.0 or higher
- **npm** or **pnpm** / **yarn**

### 1. Clone the Repository

```bash
git clone https://github.com/alvizojc1104/esmeringle.git
cd esmeringle
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Start the Development Server

```bash
PORT=3005 npm run dev
```

Open [http://localhost:3005](http://localhost:3005) in your browser.

> **Note**: A custom HTTP server (`server.ts`) initializes both the Next.js frontend and the Socket.io WebSocket server on the same port.

### 4. Build for Production

```bash
npm run build
npm start
```

---

## 🛡️ Community & Safety Guidelines

esmiringle is built for fun, authentic, and safe random conversations:
1. **18+ Community**: Intended strictly for mature users.
2. **Respect Privacy**: Never share personal phone numbers, real names, passwords, or social media handles with strangers.
3. **No Harassment or Inappropriate Conduct**: Maintain respect and keep conversations constructive.

---

## 👨‍💻 Author & Maintainer

- **Developer**: [Mike Alvizo](https://mikealvizo.dev) ([@alvizojc1104](https://github.com/alvizojc1104))
- **Live Site**: [https://esmiringle.mikealvizo.dev/](https://esmiringle.mikealvizo.dev/)

---

<p align="center">
  Made with ❤️ for spontaneous chats everywhere.
</p>
