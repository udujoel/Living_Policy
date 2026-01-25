import { NextRequest, NextResponse } from 'next/server';
import { callGeminiStructured } from '@/lib/gemini';
import { ANALYSIS_PROMPT, SYSTEM_PERSONA } from '@/lib/prompts';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { policyText } = await req.json();

    if (!policyText) {
      return NextResponse.json({ error: 'Policy text is required' }, { status: 400 });
    }

    console.log('[Analyze API] Calling Gemini with', policyText.substring(0, 100) + '...');
    
    const prompt = ANALYSIS_PROMPT.replace('{{policyText}}', policyText);
    const analysis = await callGeminiStructured(prompt, SYSTEM_PERSONA);
    
    console.log('[Analyze API] Gemini response:', JSON.stringify(analysis).substring(0, 200));

    // Validate response structure
    if (!analysis || typeof analysis !== 'object') {
      console.error('[Analyze API] Invalid response format:', analysis);
      return NextResponse.json({ 
        error: 'Invalid AI response format',
        goals: [],
        levers: [],
        constraints: []
      }, { status: 200 });
    }

    return NextResponse.json(analysis);
  } catch (error: any) {
    console.error('[Analyze API] Error:', error.message, error.stack);
    
    // Return a structured error response that won't break the UI
    return NextResponse.json({ 
      error: error.message || 'Failed to analyze policy',
      goals: [],
      levers: [],
      constraints: [],
      title: 'Analysis Error',
      summary: 'The AI service encountered an error. Please check your API key and try again.'
    }, { status: 200 }); // Return 200 with error data instead of 500
  }
}
