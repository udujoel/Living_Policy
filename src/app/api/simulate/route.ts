import { NextRequest, NextResponse } from 'next/server';
import { callGeminiStructured } from '@/lib/gemini';
import { SIMULATION_PROMPT, SYSTEM_PERSONA } from '@/lib/prompts';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { levers, analysisContext } = await req.json();

    if (!levers || !analysisContext) {
      return NextResponse.json({ error: 'Levers and analysis context are required' }, { status: 400 });
    }

    const prompt = SIMULATION_PROMPT
      .replace('{{levers}}', JSON.stringify(levers, null, 2))
      .replace('{{analysisContext}}', JSON.stringify(analysisContext, null, 2));

    const simulation = await callGeminiStructured(prompt, SYSTEM_PERSONA);

    return NextResponse.json(simulation);
  } catch (error: any) {
    console.error('Simulation error:', error);
    return NextResponse.json({ error: error.message || 'Failed to simulate scenario' }, { status: 500 });
  }
}
