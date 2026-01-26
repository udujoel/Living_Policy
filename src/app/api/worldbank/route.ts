import { NextRequest, NextResponse } from 'next/server';
import { fetchWorldBankData } from '@/lib/worldbank';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const country = searchParams.get('country') || 'EST';

  try {
    const data = await fetchWorldBankData(country);
    return NextResponse.json(data);
  } catch (error) {
    console.error('World Bank API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch World Bank data' }, { status: 500 });
  }
}
