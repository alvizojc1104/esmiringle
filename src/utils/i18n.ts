export type Language = 'en' | 'bisaya';

export interface Translations {
  appName: string;
  online: string;
  welcomeTitle: string;
  welcomeSubtitle: string;
  genderPrompt: string;
  genderMale: string;
  genderFemale: string;
  genderUndisclosed: string;
  precautionsTitle: string;
  rule18Plus: string;
  ruleZeroTolerance: string;
  rulePrivacy: string;
  ruleModeration: string;
  startChatting: string;
  chattingWithSomeoneNew: string;
  chattingWith: (gender?: string) => string;
  youLabel: string;
  strangerLabel: string;
  start: string;
  stop: string;
  skip: string;
  skipConfirm: string; // "Really?" or "Sure oy?"
  lookingForStranger: string;
  connectingOnline: string;
  typePlaceholder: string;
  rateLimitWarning: string;
  strangerDisconnected: string;
  strangerSkipped: string;
  connectionEnded: string;
  connectionLostDesc: string;
  typingStranger: string;
  reportStranger: string;
  reportedToast: string;
}

export const translations: Record<Language, Translations> = {
  en: {
    appName: "esmeringle",
    online: "online",
    welcomeTitle: "Meet strangers safely.",
    welcomeSubtitle: "Live 1-on-1 anonymous text chat. No accounts, no hassle.",
    genderPrompt: "I identify as:",
    genderMale: "Male",
    genderFemale: "Female",
    genderUndisclosed: "Prefer not to say",
    precautionsTitle: "Safety & Community Precautions",
    rule18Plus: "18+ Only: You must be at least 18 years old to use esmeringle.",
    ruleZeroTolerance: "Zero tolerance for nudity, sexual harassment, hate speech, or abuse.",
    rulePrivacy: "Stay anonymous: Never share passwords, phone numbers, or personal social media.",
    ruleModeration: "Be respectful. Violators are banned immediately.",
    startChatting: "Start Chatting",
    chattingWithSomeoneNew: "You're now chatting with someone new",
    chattingWith: (gender?: string) =>
      gender === "female"
        ? "Chatting with Amiga ♀"
        : gender === "male"
        ? "Chatting with Dawg ♂"
        : "Chatting with Stranger 👤",
    youLabel: "You",
    strangerLabel: "Stranger",
    start: "Start",
    stop: "Stop",
    skip: "Skip",
    skipConfirm: "Really?",
    lookingForStranger: "Looking for a stranger...",
    connectingOnline: "Connecting you with someone online on esmeringle...",
    typePlaceholder: "Type a message...",
    rateLimitWarning: "⚠️ You are sending messages too fast! Please slow down.",
    strangerDisconnected: "Stranger has disconnected",
    strangerSkipped: "Stranger has skipped",
    connectionEnded: "The connection ended.",
    connectionLostDesc: "Connection lost (phone was locked or network disconnected). Click 'Start' to rematch.",
    typingStranger: "Stranger is typing...",
    reportStranger: "Report stranger",
    reportedToast: "Stranger has been reported and skipped.",
  },
  bisaya: {
    appName: "esmeringle",
    online: "online",
    welcomeTitle: "Kastorya og estranghero sa luwas nga paagi.",
    welcomeSubtitle: "Direkta nga 1-on-1 anonymous text chat. Walay account, walay hasol.",
    genderPrompt: "Akong gender:",
    genderMale: "Lalaki",
    genderFemale: "Babaye",
    genderUndisclosed: "Dili lang ko magsaba",
    precautionsTitle: "Mga Pahimangno ug Kaluwasan",
    rule18Plus: "18+ Lamang: Kinahanglan 18 anyos pataas para mogamit sa esmeringle.",
    ruleZeroTolerance: "Bawal ang law-ay, bastos, pagpanghasi, o pagpamalikas.",
    rulePrivacy: "Mag-amping: Ayaw ihatag imong password, phone number, o personal accounts.",
    ruleModeration: "Pagtahod sa usag-usa. Ang mga magbinuang i-ban dayon.",
    startChatting: "Sugdi ang Chat",
    chattingWithSomeoneNew: "Nakig-chat ka na og bag-ong estranghero",
    chattingWith: (gender?: string) =>
      gender === "female"
        ? "Kastorya nimo si Amiga ♀"
        : gender === "male"
        ? "Kastorya nimo si Dawg ♂"
        : "Kastorya nimo ang Estranghero 👤",
    youLabel: "Ikaw",
    strangerLabel: "Estranghero",
    start: "Sugod",
    stop: "Undang",
    skip: "Skip",
    skipConfirm: "Sure oy?",
    lookingForStranger: "Nangita og estranghero...",
    connectingOnline: "Gikonektar ka sa usa ka tawo nga online sa esmeringle...",
    typePlaceholder: "Pag-type dinhi...",
    rateLimitWarning: "⚠️ Paspas ra kaayo imong pag-chat! Hinay-hinay lang usa.",
    strangerDisconnected: "Nibiya na ang estranghero",
    strangerSkipped: "Ni-skip ang estranghero",
    connectionEnded: "Naundang na ang inyong istorya.",
    connectionLostDesc: "Nawala ang koneksyon (basin na-lock ang screen o nawala ang net). Pindota ang 'Sugod' para mangita og lain.",
    typingStranger: "Nagsulat ang estranghero...",
    reportStranger: "I-report ang estranghero",
    reportedToast: "Nareport ug gi-skip na ang estranghero.",
  },
};
