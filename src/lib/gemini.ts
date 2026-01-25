import OpenAI from 'openai';

let openaiClient: OpenAI | null = null;

function getOpenAIClient() {
  if (!openaiClient) {
    openaiClient = new OpenAI({
      apiKey: process.env.OPENROUTER_API_KEY || 'dummy_key', // Avoid build error if key is missing
      baseURL: process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1',
      defaultHeaders: {
        'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001',
        'X-Title': 'Living Policy Simulator',
      },
    });
  }
  return openaiClient;
}

// Gemini 3 model (hackathon compliance)
export const GEMINI_MODEL = 'google/gemini-3-flash-preview';

export interface GeminiResponse {
  content: string;
  usage?: any;
}

export async function callGemini(
  prompt: string,
  systemPrompt: string = '',
  temperature: number = 0.7
): Promise<GeminiResponse> {
  try {
    const openai = getOpenAIClient();
    const response = await openai.chat.completions.create({
      model: GEMINI_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt },
      ],
      temperature: temperature,
    });

    return {
      content: response.choices[0].message.content || '',
      usage: response.usage,
    };
  } catch (error) {
    console.error('Error calling Gemini via OpenRouter:', error);
    throw error;
  }
}

export async function callGeminiStructured(
  prompt: string,
  systemPrompt: string = '',
  temperature: number = 0.1
): Promise<any> {
  try {
    const openai = getOpenAIClient();
    
    console.log('[Gemini] Calling model:', GEMINI_MODEL);
    console.log('[Gemini] System prompt length:', systemPrompt.length);
    console.log('[Gemini] User prompt length:', prompt.length);
    
    const response = await openai.chat.completions.create({
      model: GEMINI_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt },
      ],
      temperature: temperature,
      response_format: { type: 'json_object' },
    });

    console.log('[Gemini] Response received, usage:', response.usage);
    
    const content = response.choices[0].message.content || '{}';
    
    console.log('[Gemini] Raw content:', content.substring(0, 200));
    
    const parsed = JSON.parse(content);
    return parsed;
  } catch (error: any) {
    console.error('[Gemini] Error details:', {
      message: error.message,
      status: error.status,
      type: error.type,
      code: error.code
    });
    throw error;
  }
}
