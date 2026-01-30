'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Icon, TopNav, BottomAction, StatusPill, SidebarNav } from '@/components/SharedUI';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { getStoredUploads, saveUpload, UploadedFile } from '@/lib/storage';

export default function UploadPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [uploads, setUploads] = useState<UploadedFile[]>([]);
  const [analyzingFile, setAnalyzingFile] = useState<UploadedFile | null>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const stored = getStoredUploads();
    if (stored.length > 0) {
      setUploads(stored);
      setAnalyzingFile(stored[0]);
    } else {
      setUploads([]);
      setAnalyzingFile(null);
    }
  }, []);

  const [findings, setFindings] = useState<any[]>([]);

  useEffect(() => {
    if (analyzingFile && progress < 100) {
      const timer = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(timer);
            return 100;
          }
          return prev + 5;
        });
      }, 500);
      return () => clearInterval(timer);
    }
  }, [analyzingFile, progress]);

  useEffect(() => {
    if (analyzingFile) {
      // Simulate extraction logic based on file name
      const name = analyzingFile.name.toLowerCase();
      if (name.includes('estonia')) {
        setFindings([
          { icon: 'flag', title: 'POLICY GOAL', desc: 'Reach climate neutrality by 2050 with an intermediate target of 70% reduction by 2030.', color: 'text-blue-400', bgColor: 'bg-blue-400/5' },
          { icon: 'warning', title: 'CONSTRAINT', desc: 'Phased exit from oil shale must maintain energy security and local employment in Ida-Viru.', color: 'text-amber-400', bgColor: 'bg-amber-400/5' },
          { icon: 'groups', title: 'AFFECTED POPULATION', desc: 'Energy sector employees, regional industrial hubs, and residential heating consumers.', color: 'text-green-400', bgColor: 'bg-green-400/5' }
        ]);
      } else {
        setFindings([
          { icon: 'flag', title: 'POLICY GOAL', desc: 'Reduce net carbon emissions by 40% across metropolitan transport by 2030.', color: 'text-blue-400', bgColor: 'bg-blue-400/5' },
          { icon: 'warning', title: 'CONSTRAINT', desc: 'Annual capital expenditure must not exceed $2.5B per fiscal year cycle.', color: 'text-amber-400', bgColor: 'bg-amber-400/5' },
          { icon: 'groups', title: 'AFFECTED POPULATION', desc: 'Urban commuters, Public transit operators, and Regional logistics fleets.', color: 'text-green-400', bgColor: 'bg-green-400/5' }
        ]);
      }
    }
  }, [analyzingFile]);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setIsUploading(true);
      setProgress(0);

      try {
        let data = null;

        // Use Presigned URL for files > 4MB to avoid Vercel 4.5MB body limit
        if (file.size > 4 * 1024 * 1024) {
            console.log("Large file detected (>4MB), using Presigned URL flow");
            
            // 1. Get Presigned URL
            const presignRes = await fetch('/api/upload/presign', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ filename: file.name, contentType: file.type })
            });
            
            if (!presignRes.ok) throw new Error('Failed to initiate secure upload');
            const { url, key } = await presignRes.json();
            
            // 2. Upload to R2 directly (Client -> Storage)
            const uploadRes = await fetch(url, {
                method: 'PUT',
                body: file,
                headers: { 'Content-Type': file.type }
            });
            
            if (!uploadRes.ok) throw new Error('Storage upload failed');
            
            // 3. Trigger Server Analysis (Server downloads from Storage)
            const processRes = await fetch('/api/upload', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    fileKey: key, 
                    fileName: file.name, 
                    fileType: file.type,
                    // Construct a virtual URL for the frontend reference
                    url: url.split('?')[0] 
                })
            });
            
            if (!processRes.ok) {
                const errText = await processRes.text();
                try {
                    const errJson = JSON.parse(errText);
                    throw new Error(errJson.error || 'Analysis processing failed');
                } catch {
                    throw new Error(`Processing failed: ${processRes.status} ${processRes.statusText}`);
                }
            }
            
            data = await processRes.json();

        } else {
            // Small File Flow (Direct API)
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch('/api/upload', {
              method: 'POST',
              body: formData,
            });

            if (!response.ok) {
                if (response.status === 413) throw new Error('File too large (Limit is 4.5MB for direct upload).');
                const errText = await response.text();
                try {
                   const errJson = JSON.parse(errText);
                   throw new Error(errJson.error || 'Upload failed');
                } catch {
                   throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
                }
            }
            data = await response.json();
        }

        if (data.success) {
           const newFile: UploadedFile = {
            id: Date.now(),
            name: data.name,
            source: data.url, // Store the R2 URL
            size: (file.size / (1024 * 1024)).toFixed(1) + ' MB',
            status: 'Parsed' as const
          };
          
          // Save extracted text to local storage for Analysis page to use
          if (data.text) {
            localStorage.setItem('current_policy_text', data.text);
            localStorage.setItem('current_policy_name', data.name);
          }
          
          saveUpload(newFile);
          setUploads(prev => [newFile, ...prev]);
          setAnalyzingFile(newFile);
          setSelectedId(newFile.id);
        } else {
          console.error('Upload failed', data.error);
          alert('Upload failed: ' + data.error);
        }
      } catch (err: any) {
        console.error('Upload error', err);
        alert(`Upload Error: ${err.message}`);
      } finally {
        setIsUploading(false);
      }
    }
  };

  return (
    <main className="max-container flex flex-col min-h-screen pb-24 lg:pb-0 bg-[#0a1118]">
      <TopNav title="Add Policy Document" />

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden max-w-7xl mx-auto w-full">
        {/* Left Side: Upload & Progress */}
        <div className="flex-1 overflow-y-auto p-6 lg:p-12 flex flex-col gap-10">
          {!analyzingFile && !isUploading ? (
            <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center gap-8 animate-in fade-in duration-500">
              <div className="w-32 h-32 bg-primary/5 rounded-[40px] flex items-center justify-center border border-primary/10 shadow-2xl">
                <Icon name="cloud_upload" className="text-6xl text-primary/40" />
              </div>
              <div className="flex flex-col gap-3 max-w-md">
                <h2 className="text-3xl font-bold tracking-tight">Upload Policy Document</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Start your simulation by uploading a PDF, CSV, or PNG policy document. 
                  Our AI will extract goals, levers, and constraints automatically.
                </p>
              </div>
              
              <div 
                onClick={handleUploadClick}
                className="w-full max-w-xl stitch-card p-12 lg:p-20 border-dashed border-2 bg-white/[0.01] hover:bg-white/[0.03] border-white/10 flex flex-col items-center justify-center text-center gap-6 transition-all cursor-pointer group"
              >
                <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} />
                <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-xl shadow-primary/20">
                  <Icon name="add" className="text-white text-3xl" />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="font-bold text-lg">Click to select file</span>
                  <span className="text-xs text-muted-foreground uppercase tracking-widest font-bold">PDF, PNG, CSV supported</span>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Analysis Header */}
              <div className="flex flex-col gap-6 animate-in slide-in-from-top-4 duration-500">
                <h2 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Currently Analyzing</h2>
                <div className="stitch-card p-5 bg-card-alt/40 border-white/5 relative group">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20">
                      <Icon name="description" className="text-primary text-2xl" />
                    </div>
                    <div className="flex flex-col flex-1 min-w-0">
                      <h4 className="text-base font-bold truncate">{analyzingFile?.name}</h4>
                      <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight mt-0.5">{analyzingFile?.size} • Processing...</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Icon name="sync" className="text-primary text-xl animate-spin" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Progress Section */}
              <div className="flex flex-col gap-4 animate-in slide-in-from-top-4 duration-600 delay-100">
                <div className="stitch-card p-6 bg-card-alt/30 border-white/5">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-xs font-bold text-foreground">AI Extraction Progress</span>
                    <span className="bg-primary/20 text-primary text-[10px] font-mono font-bold px-2 py-0.5 rounded-full">{progress}%</span>
                  </div>
                  <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden mb-4">
                    <div className="h-full bg-primary rounded-full transition-all duration-500 shadow-[0_0_15px_rgba(19,127,236,0.5)]" style={{ width: `${progress}%` }} />
                  </div>
                  <div className="flex items-center gap-2">
                    <Icon name="hourglass_empty" className="text-primary text-base animate-pulse" />
                    <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Reading goals and constraints...</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-6 animate-in slide-in-from-bottom-4 duration-700">
                <h2 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Extraction Findings</h2>
                
                <div className="flex flex-col gap-3">
                  {progress > 20 && findings[0] && (
                    <FindingItem {...findings[0]} className="animate-in fade-in slide-in-from-left-4 duration-500" />
                  )}
                  {progress > 50 && findings[1] && (
                    <FindingItem {...findings[1]} className="animate-in fade-in slide-in-from-left-4 duration-500" />
                  )}
                  {progress > 80 && findings[2] && (
                    <FindingItem {...findings[2]} className="animate-in fade-in slide-in-from-left-4 duration-500" />
                  )}
                  
                  {progress < 100 && (
                    <div className="stitch-card p-8 border-dashed border-2 border-white/5 bg-white/[0.01] flex flex-col items-center justify-center gap-3">
                      <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                      <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground opacity-40">Scanning remaining {100 - progress} clauses...</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Add another source */}
              <div 
                onClick={handleUploadClick}
                className="mt-6 p-10 border-dashed border-2 bg-white/[0.01] hover:bg-white/[0.03] border-white/10 rounded-2xl flex flex-col items-center justify-center text-center gap-4 transition-all cursor-pointer group"
              >
                <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Icon name="cloud_upload" className="text-muted-foreground text-xl" />
                </div>
                <div className="flex flex-col gap-1">
                  <h3 className="font-bold text-sm">Add another source</h3>
                  <p className="text-[10px] text-muted-foreground max-w-xs">Upload multiple PDFs or datasets to see cross-policy impact simulations.</p>
                </div>
                <button className="mt-2 bg-white/5 hover:bg-white/10 text-[10px] font-bold uppercase tracking-widest px-6 py-2 rounded-lg border border-white/5">Select New File</button>
              </div>
            </>
          )}
        </div>

        {/* Right Side: Bottom Buttons (Mobile Sticky / Desktop Fixed) */}
        <div className="p-6 lg:p-12 lg:w-[400px] flex flex-col gap-4 lg:bg-card-alt/10 lg:border-l border-white/5 lg:justify-end">
          <div className="flex flex-col gap-4 w-full">
            <button 
              onClick={() => {
                setAnalyzingFile(null);
                setUploads([]);
                setProgress(0);
                router.push('/dashboard');
              }}
              className="stitch-button-secondary w-full py-4 text-base font-bold uppercase tracking-widest"
            >
              Cancel
            </button>
            <button 
              onClick={() => router.push(`/analysis?file=${encodeURIComponent(analyzingFile?.name || '')}`)}
              disabled={!analyzingFile || progress < 100}
              className={cn(
                "stitch-button-primary w-full py-4 flex items-center justify-center gap-3 text-base font-bold uppercase tracking-widest shadow-2xl shadow-primary/20 transition-all",
                (!analyzingFile || progress < 100) && "opacity-50 cursor-not-allowed"
              )}
            >
              <span>Analyze Full Impact</span>
              <Icon name="play_arrow" className="text-xl" />
            </button>
          </div>
        </div>
      </div>
      <SidebarNav />
    </main>
  );
}

const FindingItem = ({ icon, title, desc, color, bgColor, className }: any) => (
  <div className={cn("p-5 rounded-xl border border-white/5 flex items-start gap-4 transition-all hover:bg-white/[0.02] shadow-sm", bgColor, className)}>
    <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border border-white/10", bgColor.replace('/5', '/20'))}>
      <Icon name={icon} className={cn("text-xl", color)} fill />
    </div>
    <div className="flex flex-col gap-1.5">
      <h4 className={cn("text-[10px] font-bold uppercase tracking-[0.1em]", color)}>{title}</h4>
      <p className="text-sm font-medium leading-relaxed text-foreground/90">{desc}</p>
    </div>
  </div>
);
