import { NextRequest, NextResponse } from 'next/server';
import { uploadToR2 } from '@/lib/r2';

// Use legacy build of pdfjs-dist for Node.js compatibility
const pdfjs = require('pdfjs-dist/legacy/build/pdf.js');

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Convert file to buffer for both R2 and parsing
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to R2
    const path = `uploads/${Date.now()}-${file.name}`;
    const url = await uploadToR2(file, path);

    if (!url) {
      return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
    }

    // Extract Text if PDF
    let extractedText = '';
    if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
        try {
            const uint8Array = new Uint8Array(buffer);
            const loadingTask = pdfjs.getDocument({ data: uint8Array });
            const doc = await loadingTask.promise;
            
            const maxPages = Math.min(doc.numPages, 50); // Limit pages to avoid timeout
            for (let i = 1; i <= maxPages; i++) {
                const page = await doc.getPage(i);
                const textContent = await page.getTextContent();
                const pageText = textContent.items.map((item: any) => item.str).join(' ');
                extractedText += pageText + '\n';
            }
        } catch (e) {
            console.error("PDF Parse Error", e);
            extractedText = "Error extracting text from PDF.";
        }
    } else if (file.type === 'text/plain' || file.name.toLowerCase().endsWith('.txt') || file.name.toLowerCase().endsWith('.md')) {
        extractedText = buffer.toString('utf-8');
    }

    return NextResponse.json({ 
      success: true, 
      url, 
      name: file.name,
      size: file.size,
      text: extractedText.substring(0, 100000) // Return up to 100k chars
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
