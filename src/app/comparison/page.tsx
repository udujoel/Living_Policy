'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { Icon, TopNav, SidebarNav } from '@/components/SharedUI';
import { cn } from '@/lib/utils';
import { SimulationResult } from '@/lib/types';
import Link from 'next/link';
import { getStoredSimulations, fetchSimulations } from '@/lib/storage';

// Mock baseline generator
const generateBaseline = (current: SimulationResult): SimulationResult => {
  return {
    ...current,
    scenario_id: 'baseline',
    name: 'Baseline: Current Policy',
    reasoning_summary: "Standard growth trajectory assuming current policy levers remain static.",
    outcomes: {
      economic: {
        summary: "Standard growth trajectory without intervention.",
        indicators: current.outcomes.economic.indicators.map(i => ({
          ...i,
          value: i.name.includes("Growth") ? "2.0%" : i.value.replace('+', '').replace('-', ''),
          change: "0%",
          trend: "neutral"
        }))
      },
      social: {
        summary: "Social metrics remain stable but stagnant.",
        indicators: current.outcomes.social.indicators.map(i => ({
          ...i,
          change: "0",
          trend: "neutral"
        }))
      },
      environmental: {
        summary: "Emissions continue at current rate.",
        indicators: current.outcomes.environmental.indicators.map(i => ({
          ...i,
          change: "0%",
          trend: "risk"
        }))
      }
    }
  };
};

function ComparisonPageContent() {
  const [scenarios, setScenarios] = useState<SimulationResult[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    const loadScenarios = async () => {
      const allScenarios: SimulationResult[] = [];

      // 1. Load saved simulations
      const savedSims = await fetchSimulations();
      savedSims.forEach(sim => {
        // Adapt stored format to SimulationResult if needed, or assume data structure matches
        if (sim.data) {
          allScenarios.push({
            ...sim.data,
            scenario_id: sim.id, // Use outer ID
            name: sim.scenarioName || sim.data.name || 'Untitled Scenario'
          });
        }
      });

      // 2. Load current draft simulation
      const currentDraftJson = localStorage.getItem('simulationResult');
      if (currentDraftJson) {
        try {
          const currentDraft: SimulationResult = JSON.parse(currentDraftJson);
          // Add as "Current Draft"
          allScenarios.push({
            ...currentDraft,
            scenario_id: 'current_draft',
            name: `Draft: ${currentDraft.name || 'Analysis in Progress'}`
          });

          // 3. Generate Baseline from draft (or first saved sim if no draft)
          const base = generateBaseline(currentDraft);
          allScenarios.unshift(base); // Add baseline to top
        } catch (e) {
          console.error("Failed to parse current draft", e);
        }
      } else if (allScenarios.length > 0) {
        // If no draft but saved sims, generate baseline from first saved
        const base = generateBaseline(allScenarios[0]);
        allScenarios.unshift(base);
      }

      setScenarios(allScenarios);

      // Default selection: Baseline + (Draft OR First Saved)
      const defaults = [];
      const baseline = allScenarios.find(s => s.scenario_id === 'baseline');
      if (baseline) defaults.push(baseline.scenario_id);
      
      const second = allScenarios.find(s => s.scenario_id === 'current_draft') || allScenarios.find(s => s.scenario_id !== 'baseline');
      if (second) defaults.push(second.scenario_id);

      setSelectedIds(defaults);
    };
    loadScenarios();
  }, []);

  const toggleSelection = (id: string) => {
    if (selectedIds.includes(id)) {
      if (selectedIds.length > 1) { // Prevent deselecting the last one
        setSelectedIds(selectedIds.filter(sid => sid !== id));
      }
    } else {
      if (selectedIds.length < 3) { // Max 3 comparisons
        setSelectedIds([...selectedIds, id]);
      }
    }
  };

  const getScenario = (id: string) => scenarios.find(s => s.scenario_id === id);

  if (scenarios.length === 0) {
    return (
      <main className="max-container flex flex-col h-screen overflow-hidden bg-[#0a1118] items-center justify-center text-center p-6">
        <Icon name="compare_arrows" className="text-6xl text-muted-foreground mb-4" />
        <h2 className="text-xl font-bold mb-2">No Simulations Found</h2>
        <p className="text-muted-foreground mb-6">Run a simulation or load a saved one to enable comparison mode.</p>
        <Link href="/dashboard" className="stitch-button-primary px-8 py-3">Go to Dashboard</Link>
        <SidebarNav />
      </main>
    );
  }

  return (
    <main className="max-container flex flex-col h-screen overflow-hidden pb-20 lg:pb-0 bg-[#0a1118]">
      <TopNav title="Scenario Comparison" />

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden max-w-[1800px] mx-auto w-full">
        {/* Sidebar: Scenario Selection */}
        <aside className="w-full lg:w-80 border-b lg:border-b-0 lg:border-r border-white/5 bg-background-dark/50 backdrop-blur-xl p-6 flex flex-col gap-6 overflow-y-auto z-20">
          <div className="flex flex-col gap-2">
            <h2 className="text-[10px] font-bold uppercase tracking-widest text-primary">Select Scenarios</h2>
            <p className="text-xs text-muted-foreground">Compare up to 3 scenarios side-by-side.</p>
          </div>

          <div className="flex flex-col gap-3">
            {scenarios.map(scenario => (
              <SelectionCard 
                key={scenario.scenario_id}
                title={scenario.name}
                type={scenario.scenario_id === 'baseline' ? 'baseline' : scenario.scenario_id === 'current_draft' ? 'draft' : 'saved'}
                active={selectedIds.includes(scenario.scenario_id)}
                onClick={() => toggleSelection(scenario.scenario_id)}
              />
            ))}
          </div>
          
          {/* Legend / Info */}
          <div className="mt-auto p-4 bg-white/5 rounded-lg border border-white/5">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Metric Legend</h3>
            <div className="flex flex-col gap-2 text-xs">
              <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-green-400"/> Positive Trend</div>
              <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-amber-400"/> Mixed / Neutral</div>
              <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-red-400"/> Negative / Risk</div>
            </div>
          </div>
        </aside>

        {/* Main Content: Comparison Matrix */}
        <section className="flex-1 overflow-x-auto overflow-y-auto bg-[#0d141b] relative">
          <div className="min-w-[800px] p-8 pb-32">
            {/* Header Row */}
            <div className="grid grid-cols-[200px_1fr] gap-6 mb-8">
              <div className="flex items-end pb-2">
                <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Metric Category</span>
              </div>
              <div className={`grid gap-6`} style={{ gridTemplateColumns: `repeat(${selectedIds.length}, 1fr)` }}>
                {selectedIds.map(id => {
                  const s = getScenario(id);
                  return (
                    <div key={id} className={cn(
                      "stitch-card p-6 flex flex-col gap-2 border-t-4",
                      id === 'baseline' ? "bg-white/5 border-t-white/20" : 
                      id === 'current_draft' ? "bg-primary/5 border-t-primary" : 
                      "bg-card-alt/20 border-t-blue-400"
                    )}>
                      <h3 className="font-bold text-lg leading-tight">{s?.name}</h3>
                      <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">{s?.reasoning_summary || "No summary available."}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Economic Section */}
            <ComparisonSection 
              title="Economic Outcomes" 
              category="economic" 
              scenarios={scenarios} 
              selectedIds={selectedIds} 
            />

            {/* Social Section */}
            <ComparisonSection 
              title="Social Outcomes" 
              category="social" 
              scenarios={scenarios} 
              selectedIds={selectedIds} 
            />

            {/* Environmental Section */}
            <ComparisonSection 
              title="Environmental Outcomes" 
              category="environmental" 
              scenarios={scenarios} 
              selectedIds={selectedIds} 
            />
            
          </div>
        </section>
      </div>
      <SidebarNav />
    </main>
  );
}

// Wrapper for Suspense
export default function ComparisonPage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center bg-[#0a1118] text-white">Loading Comparison...</div>}>
      <ComparisonPageContent />
    </Suspense>
  );
}

const SelectionCard = ({ title, active = false, type, onClick }: { title: string, active?: boolean, type: 'baseline'|'draft'|'saved', onClick: () => void }) => (
  <button 
    onClick={onClick}
    className={cn(
      "stitch-card p-4 flex items-center justify-between transition-all text-left group",
      active ? "border-primary/40 bg-primary/5 shadow-[0_0_15px_rgba(19,127,236,0.1)]" : "border-white/5 hover:bg-white/[0.02] opacity-70 hover:opacity-100"
    )}
  >
    <div className="flex flex-col gap-1">
      <span className={cn("text-xs font-bold uppercase tracking-wider", 
        type === 'baseline' ? "text-muted-foreground" : 
        type === 'draft' ? "text-primary" : "text-blue-400"
      )}>
        {type === 'baseline' ? 'Reference' : type === 'draft' ? 'Work in Progress' : 'Saved'}
      </span>
      <span className={cn("text-sm font-medium", active ? "text-foreground" : "text-muted-foreground group-hover:text-foreground transition-colors")}>{title}</span>
    </div>
    <div className={cn(
      "w-5 h-5 rounded-md border flex items-center justify-center transition-all shrink-0 ml-2",
      active ? "bg-primary border-primary" : "bg-white/5 border-white/10"
    )}>
      {active && <Icon name="check" className="text-white text-xs" />}
    </div>
  </button>
);

const ComparisonSection = ({ title, category, scenarios, selectedIds }: { title: string, category: 'economic'|'social'|'environmental', scenarios: SimulationResult[], selectedIds: string[] }) => {
  // Get all unique indicator names across selected scenarios to ensure alignment
  const allIndicators = new Set<string>();
  selectedIds.forEach(id => {
    const s = scenarios.find(sc => sc.scenario_id === id);
    s?.outcomes[category].indicators.forEach(i => allIndicators.add(i.name));
  });
  const indicatorsList = Array.from(allIndicators);

  if (indicatorsList.length === 0) return null;

  return (
    <div className="mb-12">
      <div className="flex items-center gap-4 mb-4">
        <div className="h-px flex-1 bg-white/10" />
        <h3 className="text-sm font-bold uppercase tracking-widest text-primary">{title}</h3>
        <div className="h-px flex-1 bg-white/10" />
      </div>

      <div className="flex flex-col gap-2">
        {indicatorsList.map(indName => (
          <div key={indName} className="grid grid-cols-[200px_1fr] gap-6 items-center hover:bg-white/[0.02] p-2 rounded transition-colors group">
            <div className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
              {indName}
            </div>
            <div className="grid gap-6" style={{ gridTemplateColumns: `repeat(${selectedIds.length}, 1fr)` }}>
              {selectedIds.map(id => {
                const s = scenarios.find(sc => sc.scenario_id === id);
                const indicator = s?.outcomes[category].indicators.find(i => i.name === indName);
                
                if (!indicator) return <div key={id} className="text-xs text-muted-foreground opacity-30 text-center">-</div>;

                return (
                  <div key={id} className="flex items-center justify-between bg-white/5 p-3 rounded border border-white/5 hover:border-white/10 transition-colors">
                    <span className="font-mono font-bold">{indicator.value}</span>
                    <div className="flex items-center gap-1.5">
                      <span className={cn(
                        "text-xs font-bold",
                        indicator.change.startsWith('+') ? "text-green-400" : indicator.change.startsWith('-') ? "text-red-400" : "text-muted-foreground"
                      )}>
                        {indicator.change}
                      </span>
                      {indicator.trend === 'positive' && <Icon name="trending_up" className="text-green-400 text-xs" />}
                      {indicator.trend === 'negative' && <Icon name="trending_down" className="text-red-400 text-xs" />}
                      {indicator.trend === 'risk' && <Icon name="warning" className="text-amber-400 text-xs" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
