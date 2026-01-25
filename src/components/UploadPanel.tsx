'use client';

import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, Loader2, Send } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UploadPanelProps {
  onAnalyze: (text: string) => Promise<void>;
  isLoading: boolean;
}

export const UploadPanel: React.FC<UploadPanelProps> = ({ onAnalyze, isLoading }) => {
  const [text, setText] = useState('');
  const [isParsing, setIsParsing] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    if (file.type === 'application/pdf') {
      setIsParsing(true);
      try {
        const formData = new FormData();
        formData.append('file', file);
        const res = await fetch('/api/parse', {
          method: 'POST',
          body: formData,
        });
        
        if (!res.ok) throw new Error('Failed to parse PDF');
        
        const data = await res.json();
        if (data.text) {
          setText(data.text);
        } else {
          throw new Error(data.error || 'No text extracted');
        }
      } catch (error) {
        console.error('PDF parsing error:', error);
        alert('Failed to extract text from PDF. Please ensure it is a valid text-based PDF.');
      } finally {
        setIsParsing(false);
      }
    } else {
      const reader = new FileReader();
      reader.onload = () => {
        const content = reader.result as string;
        setText(content);
      };
      reader.readAsText(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'text/plain': ['.txt'], 'application/pdf': ['.pdf'] },
    multiple: false,
    disabled: isParsing || isLoading
  });

  return (
    <div className="flex flex-col gap-6 h-full">
      <div className="flex flex-col gap-2">
        <h2 className="text-xl font-semibold">Policy Input</h2>
        <p className="text-sm text-muted-foreground">
          Upload a policy document (PDF/TXT) or paste the text below to start the simulation.
        </p>
      </div>

      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed border-border rounded-xl p-8 flex flex-col items-center justify-center gap-4 cursor-pointer transition-all",
          isDragActive ? "border-primary bg-primary/5" : "hover:border-primary/50 hover:bg-muted/50",
          (isParsing || isLoading) && "opacity-50 cursor-not-allowed"
        )}
      >
        <input {...getInputProps()} />
        <div className="p-3 bg-secondary rounded-full">
          {isParsing ? <Loader2 className="w-6 h-6 text-primary animate-spin" /> : <Upload className="w-6 h-6 text-primary" />}
        </div>
        <div className="text-center">
          <p className="font-medium">{isParsing ? "Extracting text..." : "Drop policy file here"}</p>
          <p className="text-xs text-muted-foreground mt-1">Supports PDF, TXT</p>
        </div>
      </div>

      <div className="relative flex-1">
        <textarea
          className="w-full h-full min-h-[300px] stitch-input resize-none pt-4"
          placeholder="Or paste policy text here..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={isParsing || isLoading}
        />
        <div className="absolute top-2 right-2 flex items-center gap-2">
          <FileText className="w-4 h-4 text-muted-foreground" />
        </div>
      </div>

      <button
        onClick={() => text && onAnalyze(text)}
        disabled={isLoading || isParsing || !text}
        className="stitch-button-primary flex items-center justify-center gap-2 py-3"
      >
        {isLoading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <>
            <Send className="w-5 h-5" />
            <span>Run Simulation</span>
          </>
        )}
      </button>

      <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
        <p className="text-[10px] text-yellow-500/80 leading-tight">
          DISCLAIMER: This tool is an AI-based simulator for educational exploration only. 
          It is not legal, financial, or policy advice.
        </p>
      </div>
    </div>
  );
};
