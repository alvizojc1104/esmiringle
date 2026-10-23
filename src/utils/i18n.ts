export type Language = "en" | "bisaya";

export interface Translations {
  appName: string;
  online: string;
  talkToStrangers: string;
  subTitle: string;
  chooseAlias: string;
  chattingAs: string;
  change: string;
  startChat: string;
  escTip: string;
  lookingForStranger: string;
  connectingOnline: string;
  cancel: string;
  stranger: string;
  connected: string;
  reconnecting: string;
  disconnectedStatus: string;
  connectionLostDesc: string;
  leave: string;
  welcomeChat: (alias: string, article: string) => string;
  typing: (alias: string) => string;
  partnerDisconnected: (alias: string) => string;
  partnerSkipped: (alias: string) => string;
  connectionEnded: string;
  findNewStranger: string;
  skip: string;
  next: string;
  typePlaceholder: string;
  rematchPlaceholder: (alias: string) => string;
  rateLimitWarning: string;
  modalTitle: string;
  modalSubTitle: string;
  maleLabel: string;
  femaleLabel: string;
  preferNotToSayLabel: string;
  communityNotesTitle: string;
  noteAge: string;
  noteNoNudity: string;
  notePrivacy: string;
}

export const translations: Record<Language, Translations> = {
  en: {
    appName: "esmiringle",
    online: "online",
    talkToStrangers: "Talk to strangers",
    subTitle: "live 1-on-1 anonymous text chat.",
    chooseAlias: "Choose your alias:",
    chattingAs: "Chatting as:",
    change: "Change",
    startChat: "start esmiringling",
    escTip: "Press ESC to skip anytime.",
    lookingForStranger: "Looking for a stranger...",
    connectingOnline: "Connecting you with someone online on esmiringle.",
    cancel: "Cancel (ESC)",
    stranger: "Stranger",
    connected: "Connected",
    reconnecting: "Reconnecting...",
    disconnectedStatus: "Disconnected",
    connectionLostDesc:
      "Connection lost (phone was locked or network disconnected). Click 'Skip' to rematch.",
    leave: "Leave",
    welcomeChat: (alias, article) =>
      `You are now chatting with ${article} ${alias}. Say hi!`,
    typing: (alias) => `${alias} is typing`,
    partnerDisconnected: (alias) => `${alias} has disconnected`,
    partnerSkipped: (alias) => `${alias} skipped to the next person.`,
    connectionEnded: "The connection ended.",
    findNewStranger: "Skip / Find New Stranger (ESC)",
    skip: "Skip",
    next: "Skip",
    typePlaceholder: "Type a message... (Press Enter to send)",
    rematchPlaceholder: (alias) =>
      `${alias} disconnected. Click 'Skip' to rematch.`,
    rateLimitWarning: "You are sending messages too fast! Please slow down.",
    modalTitle: "Choose your alias",
    modalSubTitle: "Select how you want to be identified in chat.",
    maleLabel: "Male",
    femaleLabel: "Female",
    preferNotToSayLabel: "Prefer not to say",
    communityNotesTitle: "Community Guidelines & Safety",
    noteAge: "18+ Only: You must be at least 18 years old to use esmiringle.",
    noteNoNudity:
      "No nudity or explicit content — keep it friendly and just for fun.",
    notePrivacy:
      "Protect your privacy: Never share real names, passwords, phone numbers, or social accounts.",
  },
  bisaya: {
    appName: "esmiringle",
    online: "online",
    talkToStrangers: "Chika sa mga estranghero",
    subTitle: "direkta nga 1-on-1 anonymous text chat.",
    chooseAlias: "Pilia imong alias:",
    chattingAs: "Nag-chat isip:",
    change: "Ilisi",
    startChat: "mag-esmiringle na",
    escTip: "Pindota ang ESC para mo-skip bisan kanus-a.",
    lookingForStranger: "Nangita og kastorya...",
    connectingOnline: "Gikonektar ka sa usa ka tawo sa esmiringle.",
    cancel: "Kanselahon (ESC)",
    stranger: "Estranghero",
    connected: "Konektado",
    reconnecting: "Nagkonektar og balik...",
    disconnectedStatus: "Nawala ang koneksyon",
    connectionLostDesc:
      "Nawala ang koneksyon (basin na-lock ang screen o nawala ang net). Pindota ang 'Skip' para mangita og lain.",
    leave: "Biya",
    welcomeChat: (alias) =>
      `Nakig-istorya na ka sa usa ka ${alias}. Pangumusta!`,
    typing: (alias) => `Nagsulat si ${alias}...`,
    partnerDisconnected: (alias) => `Nibiya na si ${alias}`,
    partnerSkipped: (alias) => `Ni-skip si ${alias} sa sunod nga tawo.`,
    connectionEnded: "Naundang na ang inyong istorya.",
    findNewStranger: "Skip / Pangita og Bag-ong Kastorya (ESC)",
    skip: "Skip",
    next: "Skip",
    typePlaceholder: "Pag-type dinhi... (Pindota ang Enter aron ipadala)",
    rematchPlaceholder: (alias) =>
      `Nibiya si ${alias}. Pindota ang 'Skip' para mangita og lain.`,
    rateLimitWarning: "Paspas ra kaayo imong pag-chat! Hinay-hinay lang usa.",
    modalTitle: "Pilia imong alias",
    modalSubTitle: "Pilia kung unsaon ka pag-ila sa chat.",
    maleLabel: "Lalaki",
    femaleLabel: "Babaye",
    preferNotToSayLabel: "Basta secret",
    communityNotesTitle: "Mga Pahimangno ug Kaluwasan",
    noteAge:
      "18+ Lamang: Kinahanglan 18 anyos pataas para mogamit sa esmiringle.",
    noteNoNudity:
      "Bawal ang law-ay o bastos — para lang sa lingaw-lingaw ug pakighigala.",
    notePrivacy:
      "Ampingi imong privacy: Ayaw ihatag imong password, phone number, o personal accounts.",
  },
};
