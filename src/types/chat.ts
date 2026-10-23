export type Gender = 'male' | 'female' | 'undisclosed';

export const GENDER_ALIASES: Record<Gender, string> = {
  male: 'Dawg',
  female: 'Amiga',
  undisclosed: 'Anon',
};

export interface UserProfile {
  id: string;
  gender?: Gender;
}

export interface PartnerProfile {
  id: string;
  gender?: Gender;
  roomId: string;
}

export type SenderType = 'you' | 'stranger' | 'system';

export interface ChatMessage {
  id: string;
  senderId: string;
  senderType: SenderType;
  text: string;
  timestamp: number;
}

export type MatchStatus = 'idle' | 'searching' | 'matched' | 'partner-left' | 'disconnected';

export interface QueueEntry {
  socketId: string;
  profile: UserProfile;
  joinedAt: number;
}
