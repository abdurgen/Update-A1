
export type PrebuiltVoice = 'Kore' | 'Puck' | 'Charon' | 'Fenrir' | 'Zephyr';

export interface VoiceOption {
  id: string;
  name: string;
  description: string;
  geminiVoice: PrebuiltVoice;
}
