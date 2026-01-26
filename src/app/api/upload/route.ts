import { NextRequest, NextResponse } from 'next/server';
import { uploadToR2 } from '@/lib/r2';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const path = `uploads/${Date.now()}-${file.name}`;
    const url = await uploadToR2(file, path);

    if (!url) {
      return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      url, 
      name: file.name,
      size: file.size
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
