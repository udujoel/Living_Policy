import { NextRequest, NextResponse } from 'next/server';
import { getPresignedUploadUrl } from '@/lib/r2';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { filename, contentType } = await req.json();
    if (!filename || !contentType) {
        return NextResponse.json({ error: 'Missing filename or contentType' }, { status: 400 });
    }

    const key = `uploads/${Date.now()}-${filename}`;
    
    const url = await getPresignedUploadUrl(key, contentType);
    
    if (!url) {
        return NextResponse.json({ error: 'Failed to generate presigned URL' }, { status: 500 });
    }

    return NextResponse.json({ url, key });
  } catch (error) {
    console.error("Presign error:", error);
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
