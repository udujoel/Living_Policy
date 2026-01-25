import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Use require to bypass ESM import issues with this library
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const pdf = require('pdf-parse');
    const data = await pdf(buffer);

    return NextResponse.json({ text: data.text });
  } catch (error: any) {
    console.error('PDF Parse Error:', error);
    return NextResponse.json({ error: 'Failed to parse PDF' }, { status: 500 });
  }
}
