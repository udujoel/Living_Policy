import { NextRequest, NextResponse } from 'next/server';
import { uploadToR2, downloadFromR2 } from '@/lib/r2';

// Use legacy build of pdfjs-dist for Node.js compatibility
const pdfjs = require('pdfjs-dist/legacy/build/pdf.js');

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') || '';
    
    let buffer: Buffer;
    let fileName: string;
    let fileType: string;
    let fileSize: number;
    let publicUrl: string | null = null;

    if (contentType.includes('application/json')) {
        // Mode 1: Process already uploaded file (Large files)
        const body = await req.json();
        const { fileKey, fileName: name, fileType: type } = body;
        
        if (!fileKey) return NextResponse.json({ error: 'Missing fileKey' }, { status: 400 });
        
        const downloaded = await downloadFromR2(fileKey);
        if (!downloaded) return NextResponse.json({ error: 'File not found in storage' }, { status: 404 });
        
        buffer = downloaded;
        fileName = name || 'unknown.pdf';
        fileType = type || (fileName.endsWith('.pdf') ? 'application/pdf' : 'text/plain');
        fileSize = buffer.length;
        publicUrl = body.url || null; 
        
    } else {
        // Mode 2: Direct Upload (Small files)
        const formData = await req.formData();
        const file = formData.get('file') as File;
        if (!file) return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        
        const arrayBuffer = await file.arrayBuffer();
        buffer = Buffer.from(arrayBuffer);
        fileName = file.name;
        fileType = file.type;
        fileSize = file.size;
        
        const path = `uploads/${Date.now()}-${fileName}`;
        publicUrl = await uploadToR2(file, path);
        if (!publicUrl) return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
    }

    // Extract Text if PDF
    let extractedText = '';
    const isPdf = fileType === 'application/pdf' || fileName.toLowerCase().endsWith('.pdf');
    
    if (isPdf) {
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
    } else if (fileType === 'text/plain' || fileName.toLowerCase().endsWith('.txt') || fileName.toLowerCase().endsWith('.md')) {
        extractedText = buffer.toString('utf-8');
    }

    return NextResponse.json({ 
      success: true, 
      url: publicUrl, 
      name: fileName,
      size: fileSize,
      text: extractedText.substring(0, 100000) // Return up to 100k chars
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
