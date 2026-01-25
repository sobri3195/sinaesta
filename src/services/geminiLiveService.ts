import { GoogleGenAI } from '@google/genai';

type PatientContext = {
  persona: string;
  scenario: string;
  emotion: string;
  language: 'id-ID' | 'en-US';
  lastUserMessage: string;
  history: string[];
};

type GeminiResponse = {
  text: string;
  emotionShift: number;
  suggestedFollowUps: string[];
};

const FALLBACK_RESPONSES: Record<string, string[]> = {
  anxious: [
    'Saya masih agak cemas, bisa jelaskan lebih pelan?',
    'I am a bit nervous. Can you explain what you mean?',
  ],
  neutral: [
    'Baik dokter, silakan lanjutkan pertanyaannya.',
    'Okay doctor, please continue with your questions.',
  ],
  relieved: [
    'Saya merasa lebih tenang sekarang, terima kasih.',
    'I feel a bit calmer now, thank you.',
  ],
  guarded: [
    'Saya kurang yakin untuk menjawab itu sekarang.',
    'I am not sure I want to answer that right now.',
  ],
};

const pickFallback = (emotion: string, language: 'id-ID' | 'en-US') => {
  const options = FALLBACK_RESPONSES[emotion] || FALLBACK_RESPONSES.neutral;
  const response = options[Math.floor(Math.random() * options.length)];
  if (language === 'id-ID') {
    return response.includes('I ') ? 'Baik dokter, saya akan coba jawab.' : response;
  }
  return response.includes('Saya') ? 'Okay doctor, I will try to answer.' : response;
};

export class GeminiLiveService {
  private client: GoogleGenAI | null;

  constructor() {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;
    this.client = apiKey ? new GoogleGenAI({ apiKey }) : null;
  }

  async generateResponse(context: PatientContext): Promise<GeminiResponse> {
    if (!this.client) {
      return {
        text: pickFallback(context.emotion, context.language),
        emotionShift: context.lastUserMessage.toLowerCase().includes('maaf') ? 1 : 0,
        suggestedFollowUps: ['Explain next steps', 'Ask about symptom timeline', 'Check allergies'],
      };
    }

    const prompt = `You are an OSCE standardized patient. Persona: ${context.persona}.\n\nScenario: ${context.scenario}.\nCurrent emotion: ${context.emotion}.\nConversation history: ${context.history.join('\n')}.\nUser asked: ${context.lastUserMessage}.\nRespond as the patient in ${context.language === 'id-ID' ? 'Bahasa Indonesia' : 'English'}, 1-2 sentences, stay in character.`;

    const result = await this.client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    });

    const text = result.text || pickFallback(context.emotion, context.language);
    return {
      text,
      emotionShift: context.lastUserMessage.toLowerCase().includes('sorry') ? 1 : 0,
      suggestedFollowUps: ['Summarize findings', 'Provide reassurance', 'Ask about red flags'],
    };
  }
}

export const geminiLiveService = new GeminiLiveService();
