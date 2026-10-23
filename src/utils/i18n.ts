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
  leave: string;
  welcomeChat: (alias: string, article: string) => string;
  typing: (alias: string) => string;
  partnerDisconnected: (alias: string) => string;
  partnerSkipped: (alias: string) => string;
  connectionEnded: string;
  findNewStranger: string;
  next: string;
  typePlaceholder: string;
  rematchPlaceholder: (alias: string) => string;
  modalTitle: string;
  modalSubTitle: string;
  maleLabel: string;
  femaleLabel: string;
  preferNotToSayLabel: string;
}

export const translations: Record<Language, Translations> = {
  en: {
    appName: "esmeringle",
    online: "online",
    talkToStrangers: "Talk to strangers",
    subTitle: "live 1-on-1 anonymous text chat.",
    chooseAlias: "Choose your alias:",
    chattingAs: "Chatting as:",
    change: "Change",
    startChat: "Start Chat",
    escTip: "Press ESC to skip to the next person anytime.",
    lookingForStranger: "Looking for a stranger...",
    connectingOnline: "Connecting you with someone online on esmeringle.",
    cancel: "Cancel (ESC)",
    stranger: "Stranger",
    connected: "Connected",
    leave: "Leave",
    welcomeChat: (alias, article) =>
      `You are now chatting with ${article} ${alias}. Say hi!`,
    typing: (alias) => `${alias} is typing`,
    partnerDisconnected: (alias) => `${alias} has disconnected`,
    partnerSkipped: (alias) => `${alias} skipped to the next person.`,
    connectionEnded: "The connection ended.",
    findNewStranger: "Find New Stranger (ESC)",
    next: "Next",
    typePlaceholder: "Type a message... (Press Enter to send)",
    rematchPlaceholder: (alias) =>
      `${alias} disconnected. Click 'Next' to rematch.`,
    modalTitle: "Choose your alias",
    modalSubTitle: "Select how you want to be identified in chat.",
    maleLabel: "Male",
    femaleLabel: "Female",
    preferNotToSayLabel: "Prefer not to say",
  },
  bisaya: {
    appName: "esmeringle",
    online: "online",
    talkToStrangers: "Chika sa mga estranghero",
    subTitle: "direkta nga 1-on-1 anonymous text chat.",
    chooseAlias: "Pilia imong alias:",
    chattingAs: "Nag-chat isip:",
    change: "Ilisi",
    startChat: "Sugdi ang Chat",
    escTip: "Pindota ang ESC para molayat sa sunod nga tawo bisan kanus-a.",
    lookingForStranger: "Nangita og kastorya...",
    connectingOnline: "Gikonektar ka sa usa ka tawo sa esmeringle.",
    cancel: "Kanselahon (ESC)",
    stranger: "Estranghero",
    connected: "Konektado",
    leave: "Biya-e",
    welcomeChat: (alias) =>
      `Nakig-istorya na ka sa usa ka ${alias}. Pangumusta!`,
    typing: (alias) => `Nagsulat si ${alias}...`,
    partnerDisconnected: (alias) => `Nibiya na si ${alias}`,
    partnerSkipped: (alias) => `Nilayat si ${alias} sa sunod nga tawo.`,
    connectionEnded: "Naundang na ang inyong istorya.",
    findNewStranger: "Pangita og Bag-ong Kastorya (ESC)",
    next: "Sunod",
    typePlaceholder: "Pag-type dinhi... (Pindota ang Enter aron ipadala)",
    rematchPlaceholder: (alias) =>
      `Nibiya si ${alias}. Pindota ang 'Sunod' para mangita og lain.`,
    modalTitle: "Pilia imong alias",
    modalSubTitle: "Pilia kung unsaon ka pag-ila sa chat.",
    maleLabel: "Lalaki",
    femaleLabel: "Babaye",
    preferNotToSayLabel: "Secret lang",
  },
};
