
import { GoogleGenAI, Modality } from "@google/genai";

const API_KEY = process.env.API_KEY;
if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

export const enhanceScript = async (script: string): Promise<string> => {
  const prompt = `You are an expert scriptwriter for viral social media videos. Your task is to rewrite the following script to make it more engaging and impactful.
Inject it with:
- A powerful, attention-grabbing hook at the beginning.
- Motivational and energetic language throughout.
- A natural, conversational tone.
- Keep the core message of the original script intact, but elevate the delivery.
- The final script should be concise and ready for voice-over.
- Return only the rewritten script, without any introductory text or labels.

Original Script:
---
${script}
---

Rewritten Script:`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text.trim();
  } catch (error) {
    console.error("Error enhancing script:", error);
    throw new Error("Failed to communicate with the Gemini API for script enhancement.");
  }
};

const formatScriptForMultiSpeaker = (script: string): string => {
  const words = script.trim().split(/\s+/);
  const chunkSize = 10;
  let conversation = '';
  let isSpeaker1 = true;

  for (let i = 0; i < words.length; i += chunkSize) {
    const chunk = words.slice(i, i + chunkSize).join(' ');
    if (chunk) {
      const speaker = isSpeaker1 ? 'SPEAKER1' : 'SPEAKER2';
      conversation += `${speaker}: ${chunk}\n`;
      isSpeaker1 = !isSpeaker1;
    }
  }
  return `TTS the following conversation between SPEAKER1 and SPEAKER2:\n${conversation}`;
};


export const generateVoice = async (
  text: string,
  voice1: string,
  voice2?: string
): Promise<string> => {
  try {
    let contents: any;
    let speechConfig: any;

    if (voice2) {
      const formattedText = formatScriptForMultiSpeaker(text);
      contents = [{ parts: [{ text: formattedText }] }];
      speechConfig = {
        multiSpeakerVoiceConfig: {
          speakerVoiceConfigs: [
            {
              speaker: 'SPEAKER1',
              voiceConfig: {
                prebuiltVoiceConfig: { voiceName: voice1 },
              },
            },
            {
              speaker: 'SPEAKER2',
              voiceConfig: {
                prebuiltVoiceConfig: { voiceName: voice2 },
              },
            },
          ],
        },
      };
    } else {
      contents = [{ parts: [{ text: text }] }];
      speechConfig = {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: voice1 },
        },
      };
    }
    
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: contents,
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: speechConfig,
      },
    });
    
    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) {
      throw new Error("No audio data received from API.");
    }
    return base64Audio;
  } catch (error) {
    console.error("Error generating voice:", error);
    throw new Error("Failed to communicate with the Gemini API for voice generation.");
  }
};
