import { NextRequest, NextResponse } from 'next/server';
import { callGeminiStructured } from '@/lib/gemini';
import { SIMULATION_PROMPT, SYSTEM_PERSONA } from '@/lib/prompts';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { analysisContext, levers } = await req.json();

    if (!analysisContext || !levers) {
      return NextResponse.json({ error: 'Context and levers are required' }, { status: 400 });
    }

    console.log('[Simulate API] Calling Gemini with context length:', analysisContext.length);
    console.log('[Simulate API] Levers:', JSON.stringify(levers));
    
    // Format levers for the prompt
    const leversText = levers.map((l: any) => 
      `- ${l.name}: ${l.value}${l.unit || ''} (Type: ${l.type || 'numeric'})`
    ).join('\n');

    const prompt = SIMULATION_PROMPT
      .replace('{{levers}}', leversText)
      .replace('{{analysisContext}}', JSON.stringify(analysisContext));
      
    const simulationResult = await callGeminiStructured(prompt, SYSTEM_PERSONA);
    
    console.log('[Simulate API] Gemini response:', JSON.stringify(simulationResult).substring(0, 200));

    // Validate minimal response structure
    if (!simulationResult || !simulationResult.outcomes) {
      console.error('[Simulate API] Invalid response format:', simulationResult);
      throw new Error('Invalid AI response format');
    }

    return NextResponse.json(simulationResult);
  } catch (error: any) {
    console.error('[Simulate API] Error:', error.message, error.stack);
    return NextResponse.json({ 
      error: error.message || 'Failed to simulate scenario',
    }, { status: 500 });
  }
}
