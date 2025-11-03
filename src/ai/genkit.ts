import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

const DEFAULT_KEY = process.env.GEMINI_API_KEY;

export const ai = genkit({
  plugins: [googleAI(DEFAULT_KEY ? { apiKey: DEFAULT_KEY } : undefined as any)],
  model: 'googleai/gemini-2.5-flash',
});

export function getAi(options?: { apiKey?: string; model?: string }) {
  const { apiKey, model } = options || {};
  return genkit({
    plugins: [googleAI(apiKey ? { apiKey } : undefined as any)],
    model: model || 'googleai/gemini-2.5-flash',
  });
}

export function getGeminiApiKeys(): string[] {
  const list = (process.env.GEMINI_API_KEYS || '')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);
  const single = process.env.GEMINI_API_KEY?.trim();
  const keys = [...list];
  if (single && !keys.includes(single)) keys.push(single);
  return keys;
}