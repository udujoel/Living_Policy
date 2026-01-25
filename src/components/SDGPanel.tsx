'use client';

import React from 'react';
import { SDGAlignment } from '@/lib/types';
import { CheckCircle2, AlertCircle, XCircle } from 'lucide-react';

interface SDGPanelProps {
  alignments: SDGAlignment[];
}

export const SDGPanel: React.FC<SDGPanelProps> = ({ alignments }) => {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2 mb-2">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">SDG Alignment</h3>
      </div>

      <div className="space-y-3">
        {alignments.map((sdg) => (
          <div key={sdg.sdg_id} className="stitch-card p-3 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold w-6 h-6 flex items-center justify-center bg-primary/20 text-primary rounded">
                  {sdg.sdg_id}
                </span>
                <span className="text-sm font-medium">{sdg.sdg_name}</span>
              </div>
              <SDGImpactBadge score={sdg.impact_score} />
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">{sdg.justification}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

const SDGImpactBadge = ({ score }: { score: SDGAlignment['impact_score'] }) => {
  if (score === 'positive') {
    return (
      <div className="flex items-center gap-1 text-[10px] font-bold text-green-400 bg-green-400/10 px-2 py-0.5 rounded border border-green-400/20">
        <CheckCircle2 className="w-3 h-3" />
        <span>POSITIVE</span>
      </div>
    );
  }
  if (score === 'mixed') {
    return (
      <div className="flex items-center gap-1 text-[10px] font-bold text-yellow-400 bg-yellow-400/10 px-2 py-0.5 rounded border border-yellow-400/20">
        <AlertCircle className="w-3 h-3" />
        <span>MIXED</span>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-1 text-[10px] font-bold text-red-400 bg-red-400/10 px-2 py-0.5 rounded border border-red-400/20">
      <XCircle className="w-3 h-3" />
      <span>NEGATIVE</span>
    </div>
  );
};
