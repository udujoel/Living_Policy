'use client';

import React from 'react';
import { IndicatorGroup, SimulationResult } from '@/lib/types';
import { TrendingUp, TrendingDown, Minus, AlertTriangle, Clock, Target, Lightbulb } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OutcomeViewProps {
  result: SimulationResult;
}

export const OutcomeView: React.FC<OutcomeViewProps> = ({ result }) => {
  return (
    <div className="flex flex-col gap-8 pb-10">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <OutcomeCard title="Economic" data={result.outcomes.economic} color="blue" icon={<TrendingUp className="w-4 h-4" />} />
        <OutcomeCard title="Social" data={result.outcomes.social} color="purple" icon={<Target className="w-4 h-4" />} />
        <OutcomeCard title="Environmental" data={result.outcomes.environmental} color="green" icon={<Lightbulb className="w-4 h-4" />} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="stitch-card p-6 flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">Short-term Horizon (1-3y)</h3>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">{result.short_term_impact}</p>
        </div>

        <div className="stitch-card p-6 flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">Long-term Horizon (5-10y+)</h3>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">{result.long_term_impact}</p>
        </div>
      </div>

      <div className="stitch-card p-6">
        <h3 className="font-semibold mb-4">Trade-offs & Second-Order Effects</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h4 className="text-xs font-bold uppercase text-muted-foreground mb-3 tracking-widest">Trade-offs</h4>
            <ul className="space-y-2">
              {result.trade_offs.map((item, i) => (
                <li key={i} className="text-sm flex gap-2">
                  <span className="text-primary">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase text-muted-foreground mb-3 tracking-widest">Second-Order Effects</h4>
            <ul className="space-y-2">
              {result.second_order_effects.map((item, i) => (
                <li key={i} className="text-sm flex gap-2">
                  <span className="text-primary">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

interface OutcomeCardProps {
  title: string;
  data: IndicatorGroup;
  color: 'blue' | 'purple' | 'green';
  icon: React.ReactNode;
}

const OutcomeCard: React.FC<OutcomeCardProps> = ({ title, data, color, icon }) => {
  const colorMap = {
    blue: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
    purple: 'text-purple-400 bg-purple-400/10 border-purple-400/20',
    green: 'text-green-400 bg-green-400/10 border-green-400/20',
  };

  return (
    <div className="stitch-card overflow-hidden">
      <div className={cn("px-4 py-2 border-b border-inherit flex items-center justify-between", colorMap[color])}>
        <span className="text-xs font-bold uppercase tracking-widest">{title}</span>
        {icon}
      </div>
      <div className="p-4 flex flex-col gap-4">
        <p className="text-xs text-muted-foreground line-clamp-2">{data.summary}</p>
        <div className="space-y-3">
          {data.indicators.map((indicator, i) => (
            <div key={i} className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">{indicator.name}</span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold">{indicator.value}</span>
                <TrendIcon trend={indicator.trend} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const TrendIcon = ({ trend }: { trend: string }) => {
  if (trend === 'positive') return <TrendingUp className="w-3 h-3 text-green-400" />;
  if (trend === 'negative') return <TrendingDown className="w-3 h-3 text-red-400" />;
  if (trend === 'risk') return <AlertTriangle className="w-3 h-3 text-yellow-400" />;
  return <Minus className="w-3 h-3 text-muted-foreground" />;
};
