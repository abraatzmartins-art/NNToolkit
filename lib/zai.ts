/**
 * AI helper — Google Gemini API
 * 
 * Uses the free Gemini API (gemini-2.0-flash) to power the AI search feature.
 * Get your API key at: https://aistudio.google.com/apikey
 * 
 * Environment variable: GEMINI_API_KEY
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

let _genAI: GoogleGenerativeAI | null = null;

function getGenAI(): GoogleGenerativeAI {
  if (_genAI) return _genAI;

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      'GEMINI_API_KEY não configurada. ' +
      'Gere uma chave grátis em https://aistudio.google.com/apikey ' +
      'e adicione como Environment Variable no Vercel.'
    );
  }

  _genAI = new GoogleGenerativeAI(apiKey);
  return _genAI;
}

/**
 * Send a chat completion request to Gemini.
 * Compatible interface for the AI search route.
 */
export async function aiChatCompletion(messages: { role: string; content: string }[]) {
  const genAI = getGenAI();
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

  // Extract system prompt and user messages
  let systemPrompt = '';
  const userMessages: string[] = [];

  for (const msg of messages) {
    if (msg.role === 'system') {
      systemPrompt = msg.content;
    } else {
      userMessages.push(msg.content);
    }
  }

  // Build the prompt
  let fullPrompt: string;
  if (systemPrompt) {
    fullPrompt = `${systemPrompt}\n\n---\n\nInstrução do usuário:\n${userMessages.join('\n')}`;
  } else {
    fullPrompt = userMessages.join('\n');
  }

  const result = await model.generateContent(fullPrompt);
  const response = result.response;
  const text = response.text();

  // Return in OpenAI-compatible format
  return {
    choices: [
      {
        message: {
          content: text,
          role: 'assistant',
        },
      },
    ],
  };
}
