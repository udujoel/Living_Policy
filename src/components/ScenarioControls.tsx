'use client';

import React from 'react';
import * as Slider from '@radix-ui/react-slider';
import { PolicyLever } from '@/lib/types';
import { Settings2 } from 'lucide-react';

interface ScenarioControlsProps {
  levers: PolicyLever[];
  values: Record<string, any>;
  onChange: (id: string, value: any) => void;
}

export const ScenarioControls: React.FC<ScenarioControlsProps> = ({ levers, values, onChange }) => {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2 mb-2">
        <Settings2 className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Adjust Levers</h3>
      </div>
      
      {levers.map((lever) => (
        <div key={lever.id} className="stitch-card p-4 flex flex-col gap-3">
          <div className="flex justify-between items-start">
            <div>
              <p className="font-medium text-sm">{lever.name}</p>
              <p className="text-xs text-muted-foreground">{lever.description}</p>
            </div>
            <span className="text-sm font-mono bg-secondary px-2 py-0.5 rounded border border-border">
              {values[lever.id] ?? lever.current_value} {lever.unit}
            </span>
          </div>

          {(lever.type === 'percentage' || lever.type === 'numeric') && (
            <Slider.Root
              className="relative flex items-center select-none touch-none w-full h-5"
              defaultValue={[parseFloat(lever.current_value)]}
              max={lever.range?.max ?? 100}
              min={lever.range?.min ?? 0}
              step={1}
              onValueChange={([val]) => onChange(lever.id, val)}
            >
              <Slider.Track className="bg-secondary relative grow rounded-full h-[4px]">
                <Slider.Range className="absolute bg-primary rounded-full h-full" />
              </Slider.Track>
              <Slider.Thumb
                className="block w-4 h-4 bg-primary shadow-lg rounded-full hover:scale-110 focus:outline-none transition-transform cursor-grab active:cursor-grabbing"
                aria-label={lever.name}
              />
            </Slider.Root>
          )}

          {lever.type === 'boolean' && (
            <button
              onClick={() => onChange(lever.id, !values[lever.id])}
              className={`w-full py-2 rounded-lg text-sm font-medium border transition-all ${
                values[lever.id] 
                  ? 'bg-primary/20 border-primary text-primary' 
                  : 'bg-secondary border-border text-muted-foreground'
              }`}
            >
              {values[lever.id] ? 'Enabled' : 'Disabled'}
            </button>
          )}
        </div>
      ))}
    </div>
  );
};
