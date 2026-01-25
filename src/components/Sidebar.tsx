'use client';

import React from 'react';
import { PolicyAnalysis } from '@/lib/types';
import { FileText, Users, Building2, Info } from 'lucide-react';

interface SidebarProps {
  analysis: PolicyAnalysis | null;
}

export const Sidebar: React.FC<SidebarProps> = ({ analysis }) => {
  if (!analysis) {
    return (
      <div className="flex flex-col gap-6">
        <div className="stitch-card p-6 border-dashed bg-transparent flex flex-col items-center justify-center text-center gap-4 py-20">
          <Info className="w-10 h-10 text-muted-foreground/30" />
          <p className="text-sm text-muted-foreground">Upload a policy to see analysis results here.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="stitch-card p-6 flex flex-col gap-4">
        <div className="flex items-center gap-2 text-primary">
          <FileText className="w-5 h-5" />
          <h2 className="font-bold">Policy Summary</h2>
        </div>
        <h3 className="text-lg font-semibold leading-tight">{analysis.title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">{analysis.summary}</p>
      </div>

      <div className="stitch-card p-6 flex flex-col gap-4">
        <div className="flex items-center gap-2 text-blue-400">
          <Users className="w-5 h-5" />
          <h2 className="font-bold">Stakeholders</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          {analysis.populations.map((p, i) => (
            <span key={i} className="text-xs bg-blue-400/10 text-blue-400 border border-blue-400/20 px-2 py-1 rounded">
              {p}
            </span>
          ))}
        </div>
      </div>

      <div className="stitch-card p-6 flex flex-col gap-4">
        <div className="flex items-center gap-2 text-purple-400">
          <Building2 className="w-5 h-5" />
          <h2 className="font-bold">Sectors</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          {analysis.sectors.map((s, i) => (
            <span key={i} className="text-xs bg-purple-400/10 text-purple-400 border border-purple-400/20 px-2 py-1 rounded">
              {s}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
