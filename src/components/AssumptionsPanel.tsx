'use client';

import React from 'react';
import { Assumption } from '@/lib/types';
import { ShieldCheck, Info } from 'lucide-react';

interface AssumptionsPanelProps {
  assumptions: Assumption[];
}

export const AssumptionsPanel: React.FC<AssumptionsPanelProps> = ({ assumptions }) => {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2 mb-2">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Assumptions & Limitations</h3>
      </div>

      <div className="space-y-4">
        {assumptions.map((item) => (
          <div key={item.id} className="flex flex-col gap-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-muted-foreground line-clamp-1">{item.description}</span>
              <span className="font-mono text-primary">{item.confidence}% Confidence</span>
            </div>
            <div className="w-full bg-secondary h-1.5 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-1000 ${
                  item.confidence > 80 ? 'bg-green-500' : item.confidence > 50 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${item.confidence}%` }}
              />
            </div>
          </div>
        ))}

        <div className="bg-primary/5 border border-primary/10 rounded-lg p-3 mt-4">
          <div className="flex items-center gap-2 mb-1">
            <Info className="w-3 h-3 text-primary" />
            <span className="text-[10px] font-bold text-primary uppercase">Note on Uncertainty</span>
          </div>
          <p className="text-[10px] text-muted-foreground leading-tight">
            These simulations are based on AI causal reasoning. High confidence scores indicate strong alignment with the provided policy text, while lower scores reflect inferred or extrapolated outcomes.
          </p>
        </div>
      </div>
    </div>
  );
};
