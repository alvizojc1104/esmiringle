export type Language = 'en' | 'bisaya';

export interface Translations {
  appName: string;
  online: string;
  welcomeTitle: string;
  ageNotice: string;
  ruleNoNudity: string;
  ruleCamera: string;
  ruleRespect: string;
  ruleViolators: string;
  chattingWithSomeoneNew: string;
  locationBadge: string;
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
    welcomeTitle: "Welcome to esmeringle.",
    ageNotice: "You must be 18 or older",
    ruleNoNudity: "No nudity, hate speech, or harassment",
    ruleCamera: "Do not ask for gender — this is not a dating site",
    ruleRespect: "Be respectful to strangers",
    ruleViolators: "Violators will be banned",
    chattingWithSomeoneNew: "You're now chatting with someone new",
    locationBadge: "Philippines",
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
    welcomeTitle: "Malipayong pag-abot sa esmeringle.",
    ageNotice: "Kinahanglan 18 anyos pataas",
    ruleNoNudity: "Walay law-ay, kasuko, o pagpamalikas",
    ruleCamera: "Ayaw pangutana og gender — dili ni dating site",
    ruleRespect: "Pagtahod sa mga estranghero",
    ruleViolators: "Ang mga malapason i-ban",
    chattingWithSomeoneNew: "Nakig-chat ka na og bag-ong estranghero",
    locationBadge: "Pilipinas",
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
