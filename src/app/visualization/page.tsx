'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { Icon, TopNav, BottomAction, SidebarNav, ProgressBar } from '@/components/SharedUI';
import { cn } from '@/lib/utils';
import { useRouter, useSearchParams } from 'next/navigation';
import { getStoredSimulations, saveSimulationResult, fetchSimulations } from '@/lib/storage';
import { generatePolicyPDF } from '@/lib/pdf-gen';

function VisualizationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fileName = searchParams.get('file');
  const simId = searchParams.get('simId');
  
  const [isMapping, setIsMapping] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState<'baseline' | 'proposed'>('proposed');
  const [activeView, setActiveView] = useState<'metrics' | 'sdg' | 'worldbank' | 'alignment' | 'causal' | 'comparison' | 'trace'>('metrics');
  const [activeComparisonTab, setActiveComparisonTab] = useState<'Economy' | 'Environment' | 'Social'>('Economy');
  const [simData, setSimData] = useState<any>(null);

  useEffect(() => {
    const loadData = async () => {
      const sims = await fetchSimulations();
      const currentSim = simId ? sims.find(s => s.id === simId) : sims[0];
      if (currentSim) {
        setSimData(currentSim.data);
      }
    };
    loadData();
  }, [simId]);

  // Helper to safely get indicator values
  const getIndicator = (group: 'economic' | 'social' | 'environmental', namePart: string) => {
    if (!simData?.outcomes?.[group]?.indicators) return null;
    return simData.outcomes[group].indicators.find((i: any) => i.name.toLowerCase().includes(namePart.toLowerCase()));
  };

  const gdpIndicator = getIndicator('economic', 'gdp');
  const carbonIndicator = getIndicator('environmental', 'carbon');
  const jobsIndicator = getIndicator('economic', 'job') || getIndicator('social', 'employment');

  const handleDeploy = async () => {
    setIsDeploying(true);
    
    // Create the simulation record
    const newSim = {
      id: simId || Math.random().toString(36).substr(2, 9),
      policyId: Date.now(),
      scenarioName: fileName || 'Estonia NECP 2030',
      timestamp: new Date().toISOString(),
      status: 'Completed' as const,
      data: simData || {}
    };

    // Simulate deployment process
    await saveSimulationResult(newSim);
    setTimeout(() => {
      setIsDeploying(false);
      setShowSuccess(true);
    }, 1000);
  };

  return (
    <main className="max-container flex flex-col min-h-screen bg-[#0a1118] text-foreground font-sans antialiased">
      <TopNav title="Global Impact Analysis" />

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden max-w-[1920px] mx-auto w-full">
        {/* Main Interaction Area */}
        <div className="flex-1 overflow-y-auto flex flex-col">
          
          {/* Dashboard Header - Full Width Top Section */}
          <div className="px-6 lg:px-16 pt-20 pb-16 border-b border-white/5 bg-gradient-to-br from-primary/10 via-transparent to-transparent relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/10 blur-[150px] rounded-full -mr-64 -mt-64 opacity-50" />
            
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12 max-w-7xl relative z-10">
              <div className="flex flex-col gap-8">
                <div className="flex items-center gap-4 text-xs font-bold text-primary uppercase tracking-[0.5em]">
                  <div className="w-16 h-[1px] bg-primary/40" />
                  <Icon name="analytics" className="text-xl" />
                  <span>Simulation Result: {fileName || 'Estonia NECP 2030'}</span>
                </div>
                <h2 className="text-7xl lg:text-8xl font-bold tracking-tighter leading-[0.8] text-white drop-shadow-2xl">
                  Outcome <br /> Projection
                </h2>
                <p className="text-xl text-muted-foreground/70 max-w-2xl leading-relaxed mt-4 font-medium">
                  {selectedScenario === 'baseline' 
                    ? "Baseline projection assumes current policy levers remain static. Economic and environmental indicators follow historical trends without intervention."
                    : (simData?.reasoning_summary || simData?.short_term_impact || "Analysis complete. Review the projected outcomes below.")
                  }
                </p>
              </div>
              
              <div className="flex flex-col gap-6 items-start lg:items-end">
                <div className="flex bg-white/[0.03] p-1.5 rounded-2xl border border-white/10 shadow-2xl backdrop-blur-xl">
                  <ScenarioBtn label="Baseline" active={selectedScenario === 'baseline'} onClick={() => setSelectedScenario('baseline')} />
                  <ScenarioBtn label="Proposed" active={selectedScenario === 'proposed'} onClick={() => setSelectedScenario('proposed')} primary />
                </div>
              </div>
            </div>
          </div>

          {/* Dedicated Navigation Bar */}
          <div className="px-6 lg:px-12 py-8 border-b border-white/5 sticky top-0 bg-[#0a1118]/60 backdrop-blur-2xl z-20">
            <div className="flex items-center gap-4 overflow-x-auto scrollbar-hide no-scrollbar py-1">
              <ViewToggle active={activeView === 'metrics'} icon="equalizer" onClick={() => setActiveView('metrics')} title="Indicators" />
              <ViewToggle active={activeView === 'trace'} icon="rule" onClick={() => setActiveView('trace')} title="Logic Trace" />
              <ViewToggle active={activeView === 'comparison'} icon="compare_arrows" onClick={() => setActiveView('comparison')} title="Policy Comparison" />
              <ViewToggle active={activeView === 'causal'} icon="account_tree" onClick={() => setActiveView('causal')} title="Causal Chain" />
              <ViewToggle active={activeView === 'alignment'} icon="radar" onClick={() => setActiveView('alignment')} title="Global Alignment" />
              <ViewToggle active={activeView === 'sdg'} icon="public" onClick={() => setActiveView('sdg')} title="SDG Goals" />
              <ViewToggle active={activeView === 'worldbank'} icon="account_balance" onClick={() => setActiveView('worldbank')} title="World Bank" />
            </div>
          </div>

          <div className="p-6 lg:p-12 flex flex-col gap-12">
            {activeView === 'metrics' && (
            <div className="flex flex-col gap-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                {/* Economic Horizon Card */}
                <div className="stitch-card p-8 bg-card-alt/30 border-white/5 flex flex-col gap-8 relative overflow-hidden group">
                  <div className="flex items-center justify-between relative z-10">
                    <div className="flex flex-col gap-1">
                      <h3 className="text-xl font-bold tracking-tight text-foreground/90">Economic Horizon</h3>
                      <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">{selectedScenario === 'baseline' ? 'Current Path' : '10-Year Growth Projection'}</p>
                    </div>
                    <span className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-bold uppercase rounded-full border border-primary/20">10-Year Outlook</span>
                  </div>

                  <div className="flex items-end justify-between relative z-10">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase">Projected GDP Growth</span>
                      <div className="flex items-center gap-3">
                        <span className="text-4xl font-bold font-mono tracking-tighter text-white">
                          {selectedScenario === 'baseline' ? '+1.2%' : (gdpIndicator?.change || '+4.2%')}
                        </span>
                        <div className={cn(
                          "flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold transition-all duration-500",
                          selectedScenario === 'baseline' ? "text-muted-foreground bg-white/5" : "text-green-400 bg-green-400/10"
                        )}>
                          <Icon name={selectedScenario === 'baseline' ? 'trending_flat' : 'trending_up'} className="text-xs" />
                          <span>{selectedScenario === 'baseline' ? 'Baseline' : (gdpIndicator?.trend === 'positive' ? 'Growth' : 'Decline')}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button className="stitch-button-secondary py-3 px-5 text-[10px] uppercase font-bold tracking-widest flex items-center gap-2">
                        <Icon name="tune" />
                        Adjust Params
                      </button>
                      <button 
                        className="stitch-button-primary py-3 px-5 text-[10px] uppercase font-bold tracking-widest flex items-center gap-2"
                        onClick={() => {
                          if (simData) {
                             generatePolicyPDF({
                               ...simData,
                               scenario_id: simId || 'temp',
                               name: fileName || 'Estonia NECP 2030',
                             });
                          }
                        }}
                      >
                        <Icon name="description" />
                        Export Brief
                      </button>
                    </div>
                  </div>

                  {/* Growth Line Chart */}
                  <div className="h-24 w-full relative mt-4">
                    <svg viewBox="0 0 400 100" className="w-full h-full overflow-visible">
                      <path 
                        d={selectedScenario === 'baseline' ? "M0,80 L400,70" : "M0,80 Q100,90 200,50 T400,10"} 
                        fill="none" 
                        className={cn("transition-all duration-1000 stroke-2", selectedScenario === 'baseline' ? "stroke-white/20" : "stroke-primary")}
                        strokeDasharray={selectedScenario === 'baseline' ? "4,4" : "400"}
                      />
                      <line x1="0" y1="80" x2="400" y2="80" className="stroke-white/10 stroke-1" strokeDasharray="4,4" />
                      <circle cx="0" cy="80" r="3" className="fill-primary" />
                      {selectedScenario === 'proposed' && (
                        <>
                          <circle cx="200" cy="50" r="3" className="fill-primary animate-pulse" />
                          <circle cx="400" cy="10" r="3" className="fill-primary shadow-[0_0_10px_rgba(19,127,236,1)]" />
                        </>
                      )}
                      {selectedScenario === 'baseline' && <circle cx="400" cy="70" r="3" className="fill-white/20" />}
                    </svg>
                    <div className="flex justify-between mt-4 text-[8px] font-bold text-muted-foreground/40 uppercase tracking-[0.2em]">
                      <span>Year 0</span>
                      <span>Year 5</span>
                      <span>Year 10</span>
                    </div>
                  </div>
                </div>

                {/* Equity Impact Matrix */}
                <div className="stitch-card p-8 bg-card-alt/30 border-white/5 flex flex-col gap-6">
                  <div className="flex flex-col gap-1">
                    <h3 className="text-xl font-bold tracking-tight text-foreground/90">Equity Impact Matrix</h3>
                    <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">{selectedScenario === 'baseline' ? 'Current Socio-Economic Status' : 'Stakeholder Resilience Mapping'}</p>
                  </div>

                  <div className="flex flex-col">
                    <div className="grid grid-cols-12 gap-4 pb-4 border-b border-white/5 text-[8px] font-bold text-muted-foreground/40 uppercase tracking-widest">
                      <div className="col-span-8">Stakeholder Group</div>
                      <div className="col-span-4 text-right">Impact</div>
                    </div>
                    <div className="flex flex-col">
                      {selectedScenario === 'baseline' ? (
                        <>
                          <StakeholderRow icon="factory" label="Tech Manufacturing" desc="Stagnant efficiency" impact="Low" status="neutral" />
                          <StakeholderRow icon="school" label="Urban Youth" desc="Limited skill pathways" impact="Med" status="neutral" />
                          <StakeholderRow icon="agriculture" label="Small-scale Farmers" desc="Traditional methods" impact="Med" status="neutral" />
                          <StakeholderRow icon="store" label="Service Sector" desc="Standard labor market" impact="Low" status="neutral" />
                        </>
                      ) : (
                        simData?.stakeholder_impacts?.slice(0, 4).map((s: any, i: number) => (
                          <StakeholderRow 
                            key={i}
                            icon="groups" 
                            label={s.group} 
                            desc={s.impact.substring(0, 30) + '...'} 
                            impact={s.sentiment === 'positive' ? 'High' : s.sentiment === 'negative' ? 'Risk' : 'Med'} 
                            status={s.sentiment} 
                          />
                        )) || (
                          <>
                            <StakeholderRow icon="factory" label="Tech Manufacturing" desc="Resource efficiency gain" impact="High" status="positive" />
                            <StakeholderRow icon="school" label="Urban Youth" desc="Upskilling opportunities" impact="Med" status="positive" />
                            <StakeholderRow icon="agriculture" label="Small-scale Farmers" desc="Transition cost burden" impact="High" status="negative" />
                            <StakeholderRow icon="store" label="Service Sector" desc="Moderate automation risk" impact="Risk" status="neutral" />
                          </>
                        )
                      )}
                    </div>
                  </div>
                  
                  <button className="text-center text-primary text-[10px] font-bold uppercase tracking-widest mt-2 hover:underline">
                    View Full Equity Report →
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                <IndicatorSection title="Systemic Resiliency" icon="trending_up">
                  <ImpactMetricCard 
                    label="GDP Growth" 
                    value={selectedScenario === 'baseline' ? "+1.2%" : (gdpIndicator?.value || "+2.4%")} 
                    sub={selectedScenario === 'baseline' ? "Standard" : (gdpIndicator?.trend === 'positive' ? "Moderate Gain" : "Adjustment")} 
                    status={selectedScenario === 'baseline' ? "neutral" : (gdpIndicator?.trend === 'positive' ? "positive" : "neutral")} 
                    chart={selectedScenario === 'baseline' ? [30, 32, 31, 33, 32, 34] : [30, 45, 40, 60, 55, 75]} 
                  />
                  <ImpactMetricCard 
                    label="Job Market" 
                    value={selectedScenario === 'baseline' ? "+0.8%" : (jobsIndicator?.value || "+8.2%")} 
                    sub={selectedScenario === 'baseline' ? "Baseline" : "Projected"} 
                    status={selectedScenario === 'baseline' ? "neutral" : (jobsIndicator?.trend === 'positive' ? "positive" : "neutral")} 
                    chart={selectedScenario === 'baseline' ? [20, 21, 22, 21, 23, 22] : [20, 35, 55, 40, 60, 80]} 
                  />
                </IndicatorSection>
                <IndicatorSection title="Sustainability" icon="eco">
                  <ImpactMetricCard 
                    label="Carbon Reduction" 
                    value={selectedScenario === 'baseline' ? "-2%" : (carbonIndicator?.value || "-18%")} 
                    sub={selectedScenario === 'baseline' ? "Slow Pace" : "On Track"} 
                    status={selectedScenario === 'baseline' ? "neutral" : (carbonIndicator?.trend === 'positive' ? "positive" : "neutral")} 
                    chart={selectedScenario === 'baseline' ? [90, 88, 89, 87, 86, 85] : [90, 80, 70, 60, 40, 20]} 
                  />
                  <ImpactMetricCard 
                    label="Energy Access" 
                    value={selectedScenario === 'baseline' ? "85%" : "100%"} 
                    sub={selectedScenario === 'baseline' ? "Incomplete" : "Universal"} 
                    status={selectedScenario === 'baseline' ? "neutral" : "positive"} 
                    chart={selectedScenario === 'baseline' ? [60, 65, 70, 75, 80, 85] : [60, 70, 80, 90, 100, 100]} 
                  />
                </IndicatorSection>
              </div>
            </div>
          )}

          {activeView === 'trace' && (
            <div className="flex flex-col lg:flex-row gap-12 animate-in fade-in slide-in-from-right-4 duration-600">
              {/* Left Column: Trace details */}
              <div className="flex-1 flex flex-col gap-10">
                <div className="flex flex-col gap-2">
                  <h2 className="text-3xl font-bold tracking-tight">{fileName || 'Universal Basic Income'} Impact</h2>
                  <p className="text-sm text-muted-foreground leading-relaxed max-w-xl">
                    Tracing the internal reasoning for the 2025-2030 projection.
                  </p>
                </div>

                <div className="flex flex-col gap-8">
                  {/* Input Data Points */}
                  <div className="stitch-card p-8 bg-card-alt/20 border-white/5 flex flex-col gap-6 relative group">
                    <div className="flex items-center justify-between">
                      <h3 className="text-[10px] font-bold text-primary uppercase tracking-[0.2em]">Input Data Points</h3>
                      <Icon name="database" className="text-primary/40" />
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <DataPointChip label="GDP Growth" value={selectedScenario === 'baseline' ? "1.2%" : "2.1%"} />
                      <DataPointChip label="Urban Density" value="High" />
                      <DataPointChip label="Labor Participation" value={selectedScenario === 'baseline' ? "58%" : "62%"} />
                      <DataPointChip label="Inflation Rate" value={selectedScenario === 'baseline' ? "4.1%" : "3.4%"} />
                      <button className="px-4 py-2 rounded-lg bg-white/5 border border-white/5 text-[10px] font-bold uppercase tracking-widest hover:bg-white/10 transition-colors">+8 More</button>
                    </div>
                  </div>

                  {/* Assumed Elasticities */}
                  <div className="stitch-card p-8 bg-card-alt/20 border-white/5 flex flex-col gap-6 relative group">
                    <div className="flex items-center justify-between">
                      <h3 className="text-[10px] font-bold text-primary uppercase tracking-[0.2em]">Assumed Elasticities</h3>
                      <Icon name="trending_up" className="text-primary/40" />
                    </div>
                    <div className="flex flex-col gap-8">
                      <ElasticityRow label="Tax Rate → Revenue" value={selectedScenario === 'baseline' ? "-0.05" : "-0.15"} progress={selectedScenario === 'baseline' ? 20 : 45} />
                      <ElasticityRow label="UBI → Consumption" value={selectedScenario === 'baseline' ? "N/A" : "+0.82"} progress={selectedScenario === 'baseline' ? 5 : 85} />
                      <ElasticityRow label="Automation → Employment" value={selectedScenario === 'baseline' ? "-0.12" : "-0.42"} progress={selectedScenario === 'baseline' ? 25 : 60} />
                    </div>
                  </div>

                  {/* Confidence Levels */}
                  <div className="stitch-card p-8 bg-card-alt/20 border-white/5 flex flex-col gap-6 relative group">
                    <div className="flex items-center justify-between">
                      <h3 className="text-[10px] font-bold text-primary uppercase tracking-[0.2em]">Confidence Levels</h3>
                      <Icon name="verified_user" className="text-primary/40" />
                    </div>
                    <div className="flex items-center gap-12">
                      <div className="relative w-32 h-32 flex items-center justify-center">
                        <svg className="w-full h-full -rotate-90">
                          <circle cx="64" cy="64" r="58" fill="none" stroke="currentColor" strokeWidth="8" className="text-white/5" />
                          <circle cx="64" cy="64" r="58" fill="none" stroke="currentColor" strokeWidth="8" strokeDasharray="364.4" strokeDashoffset={364.4 * (1 - (selectedScenario === 'baseline' ? 0.98 : 0.88))} className={cn("transition-all duration-1000", selectedScenario === 'baseline' ? "text-blue-500" : "text-green-500")} />
                        </svg>
                        <span className="absolute text-2xl font-bold font-mono text-white">{selectedScenario === 'baseline' ? '98%' : '88%'}</span>
                      </div>
                      <div className="flex flex-col gap-4">
                        <ConfidenceFactor label="Model Stability" value={selectedScenario === 'baseline' ? "Absolute" : "High"} color={selectedScenario === 'baseline' ? "bg-blue-500" : "bg-green-500"} />
                        <ConfidenceFactor label="Data Recency" value={selectedScenario === 'baseline' ? "Historical" : "Q3 2024"} color="bg-green-500" />
                        <ConfidenceFactor label="Uncertainty" value={selectedScenario === 'baseline' ? "None" : "Labor Flux"} color={selectedScenario === 'baseline' ? "bg-green-500" : "bg-amber-400"} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Logic Flow */}
              <div className="lg:w-[450px] flex flex-col gap-10">
                <div className="flex flex-col gap-6">
                  <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 border-b border-white/5 pb-4">Logic Flow</h3>
                  
                  <div className="flex flex-col relative pl-6">
                    <div className="absolute left-0 top-3 bottom-3 w-0.5 bg-white/5" />
                    
                    {simData?.timeline_events ? (
                      simData.timeline_events.map((event: any, i: number) => (
                        <FlowStep 
                          key={i}
                          title={`${event.year}: ${event.title}`} 
                          desc={event.description} 
                          status={i === 0 ? 'completed' : 'active'}
                        />
                      ))
                    ) : (
                      <>
                        <FlowStep 
                          title="Baseline Synthesis" 
                          desc="Aggregating historical labor trends from the Bureau of Economic Analysis (2010-2023)." 
                          status="completed"
                        />
                        <FlowStep 
                          title="Propensity Calibration" 
                          desc="Adjusting consumption multipliers based on current inflation-adjusted disposable income." 
                          status="completed"
                        />
                        <FlowStep 
                          title="Final Projection" 
                          desc="Monte Carlo simulation (10k iterations) to determine confidence intervals." 
                          status="active"
                        />
                      </>
                    )}
                  </div>
                </div>

                <div className="mt-auto flex flex-col gap-6">
                  <button className="stitch-button-primary w-full py-5 flex items-center justify-center gap-3 text-base font-bold uppercase tracking-[0.1em] shadow-2xl shadow-green-500/20 bg-green-500 hover:bg-green-600 border-green-500">
                    <Icon name="analytics" className="text-xl" />
                    <span>View Full Audit Log</span>
                  </button>
                  <div className="text-center">
                    <span className="text-[8px] font-bold text-muted-foreground/30 uppercase tracking-[0.4em]">Open-Box Logic Policy Simulator V2.4.1</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          {activeView === 'comparison' && (
            <div className="flex flex-col gap-10 animate-in fade-in slide-in-from-bottom-4 duration-600">
              <div className="flex flex-col gap-2">
                <h2 className="text-3xl font-bold tracking-tight">Simulator Analysis</h2>
                <p className="text-sm text-muted-foreground leading-relaxed max-w-xl">
                  Comparing fiscal and social impact trajectories across different strategic approaches.
                </p>
              </div>

              {/* Sub-tabs for Comparison */}
              <div className="flex border-b border-white/5 gap-8">
                {(['Economy', 'Environment', 'Social'] as const).map((tab) => (
                  <button 
                    key={tab} 
                    onClick={() => setActiveComparisonTab(tab)}
                    className={cn(
                      "pb-4 text-xs font-bold uppercase tracking-widest transition-all relative",
                      tab === activeComparisonTab ? "text-primary" : "text-muted-foreground hover:text-white"
                    )}
                  >
                    {tab}
                    {tab === activeComparisonTab && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary animate-in fade-in zoom-in duration-300" />}
                  </button>
                ))}
              </div>

              {activeComparisonTab === 'Economy' && (
                <div className="flex flex-col gap-10 animate-in fade-in duration-500">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="stitch-card p-6 bg-white/[0.02] border-white/5 flex flex-col gap-1">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-2 h-2 rounded-full bg-green-500" />
                        <span className="text-[10px] font-bold text-muted-foreground uppercase">Scenario A</span>
                      </div>
                      <h4 className="text-xl font-bold">Carbon Tax</h4>
                    </div>
                    <div className="stitch-card p-6 bg-white/[0.02] border-white/5 flex flex-col gap-1">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-2 h-2 rounded-full bg-blue-500" />
                        <span className="text-[10px] font-bold text-muted-foreground uppercase">Scenario B</span>
                      </div>
                      <h4 className="text-xl font-bold">Green Subsidies</h4>
                    </div>
                  </div>

                  <div className="flex flex-col gap-8">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-bold">Key Indicators</h3>
                      <span className="text-[10px] font-bold text-muted-foreground uppercase bg-white/5 px-2 py-1 rounded">10 Year Outlook</span>
                    </div>

                    <div className="flex flex-col gap-12 py-4">
                      <div className="flex flex-col gap-6 text-center">
                        <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-[0.2em]">GDP Impact</span>
                        <div className="flex items-center">
                          <div className="flex-1 flex flex-col gap-1">
                            <span className={cn("text-3xl font-bold font-mono transition-all duration-500", selectedScenario === 'baseline' ? "text-white/40" : "text-red-500")}>
                              {selectedScenario === 'baseline' ? "0.0%" : "-1.2%"}
                            </span>
                            <span className="text-[10px] text-muted-foreground font-medium uppercase">{selectedScenario === 'baseline' ? "No Change" : "Slight contraction"}</span>
                          </div>
                          <div className="w-px h-12 bg-white/5" />
                          <div className="flex-1 flex flex-col gap-1">
                            <span className={cn("text-3xl font-bold font-mono transition-all duration-500", selectedScenario === 'baseline' ? "text-white/40" : "text-green-500")}>
                              {selectedScenario === 'baseline' ? "+0.2%" : "+2.4%"}
                            </span>
                            <span className="text-[10px] text-muted-foreground font-medium uppercase">{selectedScenario === 'baseline' ? "Natural Growth" : "Accelerated growth"}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-6 text-center">
                        <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-[0.2em]">Budget Implications</span>
                        <div className="flex items-center">
                          <div className="flex-1 flex flex-col gap-1">
                            <div className={cn("flex items-center justify-center gap-2 transition-all duration-500", selectedScenario === 'baseline' ? "text-white/20" : "text-green-500")}>
                              <Icon name="add_circle" className="text-xl" />
                              <span className="text-3xl font-bold font-mono">{selectedScenario === 'baseline' ? "+$2B" : "+$85B"}</span>
                            </div>
                            <span className="text-[10px] text-muted-foreground font-medium uppercase">{selectedScenario === 'baseline' ? "Standard Revenue" : "Revenue Surplus"}</span>
                          </div>
                          <div className="w-px h-12 bg-white/5" />
                          <div className="flex-1 flex flex-col gap-1">
                            <div className={cn("flex items-center justify-center gap-2 transition-all duration-500", selectedScenario === 'baseline' ? "text-white/20" : "text-red-500")}>
                              <Icon name="remove_circle" className="text-xl" />
                              <span className="text-3xl font-bold font-mono">{selectedScenario === 'baseline' ? "-$1B" : "-$120B"}</span>
                            </div>
                            <span className="text-[10px] text-muted-foreground font-medium uppercase">{selectedScenario === 'baseline' ? "Maintenance" : "Fiscal Deficit"}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-6">
                    <h3 className="text-xl font-bold">Key Trade-offs</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedScenario === 'baseline' ? (
                        <>
                          <TradeOffCard label="Energy Prices" desc="Stable historical rates with minor inflation adjustment." status="neutral" />
                          <TradeOffCard label="Job Creation" desc="Sustained employment in traditional sectors." status="positive" />
                          <TradeOffCard label="Efficiency" desc="Standard industrial output per unit." status="neutral" />
                          <TradeOffCard label="National Debt" desc="Debt service ratio follows long-term average." status="neutral" />
                        </>
                      ) : (
                        <>
                          <TradeOffCard label="Energy Prices" desc="Significant increase for low-income households." status="negative" />
                          <TradeOffCard label="Job Creation" desc="Massive growth in renewable sector." status="positive" />
                          <TradeOffCard label="Efficiency" desc="Industrial output per unit of energy +12%." status="positive" />
                          <TradeOffCard label="National Debt" desc="Long-term debt service ratio increases." status="negative" />
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {activeComparisonTab === 'Environment' && (
                <div className="flex flex-col gap-10 animate-in fade-in duration-500">
                   <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                      <div className="stitch-card p-8 bg-card-alt/20 border-white/5 flex flex-col gap-6">
                        <h3 className="text-lg font-bold">Carbon Emission Trajectory</h3>
                        <div className="h-48 w-full flex items-end gap-2">
                           {[40, 60, 45, 80, 55, 90, 70].map((h, i) => (
                             <div key={i} className="flex-1 flex flex-col gap-1">
                                <div className="flex-1 flex items-end gap-1">
                                   <div className="flex-1 bg-red-500/20 border border-red-500/20 rounded-t" style={{ height: `${h}%` }} />
                                   <div className={cn(
                                     "flex-1 border rounded-t transition-all duration-1000",
                                     selectedScenario === 'baseline' ? "bg-white/5 border-white/10" : "bg-green-500 border-green-500/40"
                                   )} style={{ height: `${selectedScenario === 'baseline' ? h * 0.95 : h * 0.4}%` }} />
                                </div>
                                <span className="text-[8px] text-muted-foreground text-center">Y{i*2}</span>
                             </div>
                           ))}
                        </div>
                        <div className="flex justify-center gap-6 pt-2">
                           <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-red-500/40 rounded-full" />
                              <span className="text-[10px] font-bold text-muted-foreground uppercase">Historical</span>
                           </div>
                           <div className="flex items-center gap-2">
                              <div className={cn("w-2 h-2 rounded-full transition-colors", selectedScenario === 'baseline' ? "bg-white/20" : "bg-green-500")} />
                              <span className="text-[10px] font-bold text-muted-foreground uppercase">{selectedScenario === 'baseline' ? 'Baseline' : 'Proposed'}</span>
                           </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-4">
                         <div className="stitch-card p-6 bg-white/[0.02] border-white/5">
                            <div className="flex justify-between items-center mb-4">
                               <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Renewable Mix</span>
                               <span className={cn("text-xl font-bold transition-all", selectedScenario === 'baseline' ? "text-white/40" : "text-green-400")}>
                                 {selectedScenario === 'baseline' ? "+2%" : "+42%"}
                               </span>
                            </div>
                            <ProgressBar progress={selectedScenario === 'baseline' ? 12 : 72} label="Solar & Wind Adoption" />
                         </div>
                         <div className="stitch-card p-6 bg-white/[0.02] border-white/5">
                            <div className="flex justify-between items-center mb-4">
                               <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Forest Density</span>
                               <span className={cn("text-xl font-bold transition-all", selectedScenario === 'baseline' ? "text-white/40" : "text-green-400")}>
                                 {selectedScenario === 'baseline' ? "+0.5%" : "+12%"}
                               </span>
                            </div>
                            <ProgressBar progress={selectedScenario === 'baseline' ? 45 : 88} label="Reforestation Targets" />
                         </div>
                      </div>
                   </div>

                   <div className="flex flex-col gap-6">
                      <h3 className="text-xl font-bold">Environmental Outcomes</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <TradeOffCard label="Air Quality" desc="PM2.5 levels projected to drop by 22% in urban centers." status="positive" />
                        <TradeOffCard label="Biodiversity" desc="Corridor restoration protects 14 endangered species." status="positive" />
                        <TradeOffCard label="Water Stress" desc="Increased industrial recycling lowers extraction." status="positive" />
                      </div>
                   </div>
                </div>
              )}

              {activeComparisonTab === 'Social' && (
                <div className="flex flex-col gap-10 animate-in fade-in duration-500">
                   <div className="stitch-card p-8 bg-card-alt/20 border-white/5 flex flex-col gap-8">
                      <div className="flex items-center justify-between">
                         <h3 className="text-xl font-bold">Equity Impact Distribution</h3>
                         <div className="flex gap-2">
                            <span className="px-3 py-1 bg-white/5 rounded-full text-[10px] font-bold text-muted-foreground">Gini: {selectedScenario === 'baseline' ? '0.32' : '0.28'}</span>
                            <span className={cn(
                              "px-3 py-1 rounded-full text-[10px] font-bold",
                              selectedScenario === 'baseline' ? "bg-white/5 text-muted-foreground" : "bg-green-500/20 text-green-400"
                            )}>
                              {selectedScenario === 'baseline' ? 'Baseline' : '-4.2% Change'}
                            </span>
                         </div>
                      </div>

                      <div className="flex flex-col gap-6">
                         <StakeholderRow 
                           icon="group" 
                           label="Low Income Quintile" 
                           desc={selectedScenario === 'baseline' ? "Current welfare status" : "Direct subsidy impact"} 
                           impact={selectedScenario === 'baseline' ? "0%" : "+18%"} 
                           status={selectedScenario === 'baseline' ? "neutral" : "positive"} 
                         />
                         <StakeholderRow 
                           icon="workspace_premium" 
                           label="Skilled Labor" 
                           desc={selectedScenario === 'baseline' ? "Standard market growth" : "New green sector jobs"} 
                           impact={selectedScenario === 'baseline' ? "+1%" : "+12%"} 
                           status={selectedScenario === 'baseline' ? "neutral" : "positive"} 
                         />
                         <StakeholderRow 
                           icon="history_edu" 
                           label="Traditional Energy Workers" 
                           desc={selectedScenario === 'baseline' ? "Secure employment" : "Transition displacement risk"} 
                           impact={selectedScenario === 'baseline' ? "0%" : "-8%"} 
                           status={selectedScenario === 'baseline' ? "neutral" : "negative"} 
                         />
                      </div>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="stitch-card p-8 bg-white/[0.02] border-white/5 flex flex-col gap-4">
                         <div className="flex items-center gap-3">
                            <Icon name="health_and_safety" className="text-2xl text-primary" />
                            <h4 className="font-bold">Public Health Delta</h4>
                         </div>
                         <p className="text-sm text-muted-foreground">Reduced respiratory hospitalizations leads to <span className="text-white font-bold">$1.2B annual savings</span> in public health expenditure.</p>
                      </div>
                      <div className="stitch-card p-8 bg-white/[0.02] border-white/5 flex flex-col gap-4">
                         <div className="flex items-center gap-3">
                            <Icon name="school" className="text-2xl text-primary" />
                            <h4 className="font-bold">Education Access</h4>
                         </div>
                         <p className="text-sm text-muted-foreground">Energy stability in rural areas increases digital learning hours by <span className="text-white font-bold">14 hours/week</span> per student.</p>
                      </div>
                   </div>
                </div>
              )}

              <div className="flex gap-4 pt-4">
                <button className="flex-1 py-5 rounded-2xl bg-white/5 hover:bg-white/10 text-base font-bold uppercase tracking-widest border border-white/5 transition-all">Save Draft</button>
                <button 
                  onClick={handleDeploy}
                  disabled={isDeploying}
                  className={cn(
                    "flex-[2] py-5 rounded-2xl bg-green-500 hover:bg-green-600 text-base font-bold uppercase tracking-widest text-white shadow-2xl shadow-green-500/20 flex items-center justify-center gap-3 transition-all relative overflow-hidden",
                    isDeploying && "opacity-80 cursor-not-allowed"
                  )}
                >
                  {isDeploying ? (
                    <>
                      <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Deploying...</span>
                    </>
                  ) : (
                    <>
                      <span>Deploy Policy</span>
                      <Icon name="rocket_launch" />
                    </>
                  )}
                </button>
              </div>

              <div className="stitch-card p-8 bg-card-alt/20 border-white/5 flex flex-col gap-8">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold">Convergence Trend</h3>
                  <Icon name="info" className="text-muted-foreground/40" />
                </div>
                
                <div className="h-64 w-full flex items-end gap-6 pt-10">
                  <TrendBar heights={[30, 80]} label="Year 0" />
                  <TrendBar heights={[50, 40]} label="Year 5" />
                  <TrendBar heights={[90, 60]} label="Year 10" />
                </div>
              </div>
            </div>
          )}
          {activeView === 'causal' && (
            <div className="flex flex-col lg:flex-row gap-12 animate-in fade-in slide-in-from-right-4 duration-600">
              {/* Left Column: Causal Chain */}
              <div className="flex-1 flex flex-col gap-10">
                <div className="flex flex-col gap-2">
                  <h2 className="text-3xl font-bold tracking-tight">Causal Impact Chain</h2>
                  <p className="text-sm text-muted-foreground leading-relaxed max-w-xl">
                    Projected systemic shifts resulting from the adjusted policy levers on industrial energy consumers and regional sectors.
                  </p>
                </div>

                <div className="flex flex-col relative pl-4 lg:pl-0">
                  <div className="absolute left-[31px] lg:left-[39px] top-10 bottom-10 w-0.5 bg-gradient-to-b from-primary/40 via-primary/20 to-primary/5" />
                                    
                  <CausalNode 
                    icon="account_balance" 
                    type="ROOT POLICY" 
                    title={selectedScenario === 'baseline' ? "Current Framework" : "Policy Shift"} 
                    desc={selectedScenario === 'baseline' ? "Maintaining existing regulatory standards and energy mix." : "Targeting energy efficiency mandates and renewable mix benchmarks."} 
                    status={selectedScenario === 'baseline' ? "Baseline" : "Active Lever"}
                    active
                  />
                  <CausalNode 
                    icon="bolt" 
                    type="IMMEDIATE EFFECT" 
                    title={selectedScenario === 'baseline' ? "Stable Prices" : "Energy Price Shift"} 
                    desc={selectedScenario === 'baseline' ? "Energy costs follow standard inflation with no policy-induced spikes." : "Operating costs for high-intensity sectors increase by 4.2% initially."} 
                    status={selectedScenario === 'baseline' ? "Historical Data" : "98% Confidence"}
                  />
                  <CausalNode 
                    icon="psychology" 
                    type="SECONDARY SHIFT" 
                    title={selectedScenario === 'baseline' ? "Status Quo" : "Tech Adoption Surge"} 
                    desc={selectedScenario === 'baseline' ? "Incremental adoption of off-the-shelf technologies without incentives." : "Accelerated transition to smart-grid management and green hydrogen storage."} 
                    status={selectedScenario === 'baseline' ? "Baseline" : "Med. Uncertainty"}
                    warning={selectedScenario === 'proposed'}
                  />
                  <CausalNode 
                    icon="track_changes" 
                    type="TERMINAL OUTCOME" 
                    title={selectedScenario === 'baseline' ? "2030 Baseline" : "Emission Goals 2030"} 
                    desc={selectedScenario === 'baseline' ? "Projected 2M ton reduction based on current efficiency trends." : "Projected 12M ton reduction in annual CO2 output across the jurisdiction."} 
                    status={selectedScenario === 'baseline' ? "Low Impact" : "Confidence: 72%"}
                  />
                </div>
              </div>

              {/* Right Column: Assumptions & Summary */}
              <div className="lg:w-[450px] flex flex-col gap-8">
                <div className="flex flex-col gap-6">
                  <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 border-b border-white/5 pb-4">Analysis & Assumptions</h3>
                  
                  <AssumptionItem 
                    title="Market Elasticity" 
                    desc="Based on the 'Inter' model of industrial behavior, assuming a 0.8 correlation between energy price hikes and clean tech capital expenditure."
                    active
                  />
                  <AssumptionItem 
                    title="Evidence: 2022 Pilot Data" 
                    desc="Historical performance from similar regional rollouts suggests a 15% faster adoption rate in urban industrial clusters."
                  />
                  <AssumptionItem 
                    title="Uncertainty Factors" 
                    desc="Supply chain volatility for offshore wind turbine components remains a high-risk variable for stabilization."
                  />
                </div>

                <div className="mt-auto bg-primary/10 border border-primary/20 p-8 rounded-3xl flex items-center justify-between shadow-2xl relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="flex flex-col gap-1 relative z-10">
                    <span className="text-[8px] font-bold text-primary uppercase tracking-[0.2em]">Net Impact (2030)</span>
                    <span className="text-3xl font-bold font-mono text-white">-14.2%</span>
                    <span className="text-[10px] text-primary/60 font-medium">Emissions</span>
                  </div>
                  <div className="flex flex-col gap-1 text-right relative z-10">
                    <span className="text-[8px] font-bold text-amber-400 uppercase tracking-[0.2em]">GDP Delta</span>
                    <span className="text-3xl font-bold font-mono text-white">-0.4%</span>
                    <span className="text-[10px] text-amber-400/60 font-medium">Annual</span>
                  </div>
                  <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(19,127,236,0.5)] cursor-pointer hover:scale-110 transition-transform">
                    <Icon name="trending_up" className="text-white text-2xl" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeView === 'sdg' && (
            <div className="flex flex-col lg:flex-row gap-12 animate-in fade-in slide-in-from-bottom-4 duration-600">
              {/* Left Side: Alignment Profile */}
              <div className="flex-1 flex flex-col gap-10">
                <div className="flex flex-col gap-2">
                  <h2 className="text-3xl font-bold tracking-tight">SDG Alignment Profile</h2>
                  <p className="text-sm text-muted-foreground leading-relaxed max-w-xl">
                    Detailed performance analysis of the <span className="text-white font-bold">{fileName || 'Proposed Scenario'}</span> across the UN Sustainable Development Goals 2030.
                  </p>
                </div>

                <div className="stitch-card p-10 bg-card-alt/30 border-white/5 flex flex-col gap-12 relative overflow-hidden group">
                  <div className="max-w-md mx-auto w-full aspect-square relative py-6 scale-110">
                    <div className="w-full h-full relative group">
                      <svg viewBox="0 0 100 100" className="w-full h-full stroke-white/5 fill-none overflow-visible">
                        {[20, 40, 60, 80, 100].map((r) => (
                          <polygon key={r} points={getHexPoints(r)} className="stroke-white/5" />
                        ))}
                        {[0, 60, 120, 180, 240, 300].map((a) => (
                          <line key={a} x1="50" y1="50" x2={50 + 50 * Math.cos((a - 90) * Math.PI / 180)} y2={50 + 50 * Math.sin((a - 90) * Math.PI / 180)} className="stroke-white/5" />
                        ))}
                        {/* Baseline Polygon (Muted) */}
                        <polygon points="50,30 75,45 80,60 50,75 30,55 35,40" className="stroke-white/20 stroke-[0.5] fill-white/5" strokeDasharray="2,1" />
                        {/* Current Selection Polygon */}
                        <polygon 
                          points={selectedScenario === 'baseline' ? "50,30 75,45 80,60 50,75 30,55 35,40" : "50,15 85,35 80,70 50,90 20,70 15,35"} 
                          className={cn(
                            "transition-all duration-1000 stroke-[1.5]",
                            selectedScenario === 'baseline' ? "stroke-white/40 fill-white/10" : "stroke-primary fill-primary/20 group-hover:fill-primary/30"
                          )} 
                        />
                      </svg>
                      <AxisLabel top="-8%" left="50%" label="POVERTY" />
                      <AxisLabel top="25%" right="-18%" label="ECONOMY" />
                      <AxisLabel bottom="25%" right="-18%" label="CITIES" />
                      <AxisLabel bottom="-8%" left="50%" label="INEQUALITY" />
                      <AxisLabel bottom="25%" left="-18%" label="CLIMATE" />
                      <AxisLabel top="25%" left="-18%" label="HEALTH" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Side: Detailed Breakdown */}
              <div className="lg:w-[480px] flex flex-col gap-8">
                <div className="flex flex-col gap-2">
                  <h3 className="text-xl font-bold tracking-tight">Detailed Goal Breakdown</h3>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Performance across priority indicators</p>
                </div>

                <div className="flex flex-col gap-4">
                  {simData?.sdg_alignment ? (
                    simData.sdg_alignment.map((sdg: any) => (
                      <SDGBreakdownRow 
                        key={sdg.sdg_id}
                        id={sdg.sdg_id} 
                        name={sdg.sdg_name} 
                        score={sdg.impact_score === 'positive' ? 85 : sdg.impact_score === 'negative' ? -18 : 12} 
                        desc={sdg.justification} 
                        status={sdg.impact_score} 
                        icon={sdg.sdg_id === 1 ? "payments" : sdg.sdg_id === 11 ? "location_city" : sdg.sdg_id === 8 ? "trending_down" : "public"}
                      />
                    ))
                  ) : (
                    <>
                      <SDGBreakdownRow 
                        id={1} 
                        name="No Poverty" 
                        score={85} 
                        desc="Direct cash transfers and subsidy programs significantly reduce absolute poverty levels." 
                        status="positive" 
                        icon="payments"
                      />
                      
                      <button className="stitch-button-primary w-full py-5 flex items-center justify-center gap-3 text-base font-bold uppercase tracking-[0.1em] shadow-[0_10px_30px_rgba(34,197,94,0.15)] bg-green-500 hover:bg-green-600 border-green-500 shadow-green-500/20">
                        <span>View Full Analysis Report</span>
                        <Icon name="analytics" className="text-xl" />
                      </button>
    
                      <SDGBreakdownRow 
                        id={11} 
                        name="Sustainable Cities" 
                        score={12} 
                        desc="Mixed impact on urban density; requires zoning policy alignment to reach target." 
                        status="neutral" 
                        icon="location_city"
                      />
                      <SDGBreakdownRow 
                        id={8} 
                        name="Economic Growth" 
                        score={-18} 
                        desc="Potential short-term labor market volatility detected due to aggressive energy transition." 
                        status="negative" 
                        icon="trending_down"
                      />
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeView === 'worldbank' && (
            <div className="flex flex-col gap-10 animate-in fade-in duration-500">
              <div className="stitch-card p-10 bg-card-alt/20 border-white/5">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10">
                    <Icon name="account_balance" className="text-2xl text-primary" />
                  </div>
                  <div className="flex flex-col">
                    <h3 className="text-xl font-bold">World Bank Peer Comparison</h3>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Global Competitiveness Index (GCI) Alignment</p>
                  </div>
                </div>

                <div className="space-y-12">
                  <ComparisonRow 
                    label="Energy Security Index" 
                    local={selectedScenario === 'baseline' ? 62 : 88} 
                    global={72} 
                    desc={selectedScenario === 'baseline' ? "Current energy security relies heavily on historical grid stability with declining resilience." : "Estonia's projected energy security exceeds the regional average by 16% under this scenario."}
                  />
                  <ComparisonRow 
                    label="Ease of Doing Business (Green Tech)" 
                    local={selectedScenario === 'baseline' ? 48 : 92} 
                    global={65} 
                    desc={selectedScenario === 'baseline' ? "Existing regulatory environment for clean-tech remains at baseline regional standards." : "Proposed regulatory streamlining positions the jurisdiction as a Tier-1 destination for ESG capital."}
                  />
                  <ComparisonRow 
                    label="Public Debt to GDP Impact" 
                    local={selectedScenario === 'baseline' ? 28 : 45} 
                    global={55} 
                    desc={selectedScenario === 'baseline' ? "Historical debt-to-GDP ratio is low but provides minimal stimulus for structural shifts." : "While initial spending is high, the debt-service ratio remains 10% below World Bank 'Risk' thresholds."}
                  />
                </div>
              </div>
            </div>
          )}

          {activeView === 'alignment' && (
            <div className="flex flex-col gap-10 animate-in fade-in slide-in-from-bottom-4 duration-600">
              <div className="flex flex-col gap-2">
                <h2 className="text-3xl font-bold tracking-tight">Global Framework Alignment</h2>
                <p className="text-sm text-muted-foreground leading-relaxed max-w-xl">
                  Measuring the policy's convergence with international standards and multi-lateral agreements.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="stitch-card p-8 bg-card-alt/20 border-white/5 flex flex-col gap-6">
                  <div className="flex items-center gap-3">
                    <Icon name="public" className="text-primary text-2xl" />
                    <span className="text-sm font-bold">Paris Agreement</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between items-end">
                      <span className="text-3xl font-bold font-mono">{selectedScenario === 'baseline' ? '42%' : '94%'}</span>
                      <span className={cn("text-[10px] font-bold uppercase", selectedScenario === 'baseline' ? 'text-amber-400' : 'text-green-400')}>
                        {selectedScenario === 'baseline' ? 'Lagging' : 'Leading'}
                      </span>
                    </div>
                    <ProgressBar progress={selectedScenario === 'baseline' ? 42 : 94} />
                  </div>
                  <p className="text-[10px] text-muted-foreground leading-relaxed">Alignment with 1.5°C pathway and national contribution targets.</p>
                </div>

                <div className="stitch-card p-8 bg-card-alt/20 border-white/5 flex flex-col gap-6">
                  <div className="flex items-center gap-3">
                    <Icon name="gavel" className="text-primary text-2xl" />
                    <span className="text-sm font-bold">EU Taxonomy</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between items-end">
                      <span className="text-3xl font-bold font-mono">{selectedScenario === 'baseline' ? '65%' : '88%'}</span>
                      <span className={cn("text-[10px] font-bold uppercase", selectedScenario === 'baseline' ? 'text-amber-400' : 'text-green-400')}>
                        {selectedScenario === 'baseline' ? 'Partial' : 'High'}
                      </span>
                    </div>
                    <ProgressBar progress={selectedScenario === 'baseline' ? 65 : 88} />
                  </div>
                  <p className="text-[10px] text-muted-foreground leading-relaxed">Compliance with sustainable finance and disclosure regulations.</p>
                </div>

                <div className="stitch-card p-8 bg-card-alt/20 border-white/5 flex flex-col gap-6">
                  <div className="flex items-center gap-3">
                    <Icon name="groups" className="text-primary text-2xl" />
                    <span className="text-sm font-bold">ILO Standards</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between items-end">
                      <span className="text-3xl font-bold font-mono">{selectedScenario === 'baseline' ? '82%' : '96%'}</span>
                      <span className="text-[10px] font-bold text-green-400 uppercase">Universal</span>
                    </div>
                    <ProgressBar progress={selectedScenario === 'baseline' ? 82 : 96} />
                  </div>
                  <p className="text-[10px] text-muted-foreground leading-relaxed">Adherence to fair labor, worker safety, and transition rights.</p>
                </div>
              </div>

              <div className="stitch-card p-10 bg-white/[0.02] border-white/5 flex flex-col gap-8">
                <h3 className="text-xl font-bold">Convergence Trajectory (2025-2035)</h3>
                <div className="h-48 w-full relative">
                  <svg viewBox="0 0 1000 200" className="w-full h-full overflow-visible">
                    {/* Baseline Path */}
                    <path 
                      d="M0,150 L200,145 L400,148 L600,140 L800,142 L1000,138" 
                      fill="none" 
                      className="stroke-white/10 stroke-2" 
                      strokeDasharray="8,8"
                    />
                    {/* Proposed Path */}
                    <path 
                      d={selectedScenario === 'baseline' ? "M0,150 L200,145 L400,148 L600,140 L800,142 L1000,138" : "M0,150 Q250,140 500,80 T1000,20"} 
                      fill="none" 
                      className={cn("stroke-primary stroke-[3] transition-all duration-1000", selectedScenario === 'baseline' && "opacity-0")}
                    />
                    {/* Points */}
                    {[0, 250, 500, 750, 1000].map((x, i) => (
                      <circle key={i} cx={x} cy={selectedScenario === 'baseline' ? 150 - (i*2) : 150 - (i*30)} r="4" className="fill-primary shadow-[0_0_15px_rgba(19,127,236,0.5)]" />
                    ))}
                  </svg>
                  <div className="flex justify-between mt-4 text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest">
                    <span>Inception</span>
                    <span>Integration</span>
                    <span>Convergence</span>
                    <span>Leadership</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Side: Trade-off Matrix & Narrative */}
        <div className="lg:w-[480px] bg-card-alt/10 border-l border-white/5 p-6 lg:p-12 flex flex-col gap-10 overflow-y-auto">
          <div className="flex flex-col gap-2">
            <h3 className="text-xl font-bold tracking-tight">Trade-off Matrix</h3>
            <p className="text-[10px] text-muted-foreground leading-relaxed uppercase tracking-widest font-bold">
              Multi-dimensional Systemic Equilibrium
            </p>
          </div>

          <div className="aspect-square relative flex items-center justify-center py-6 lg:py-4">
            <div className="w-full h-full relative group scale-110">
              <svg viewBox="0 0 100 100" className="w-full h-full stroke-white/5 fill-none overflow-visible">
                {[20, 40, 60, 80, 100].map((r) => (
                  <polygon key={r} points={getHexPoints(r)} className="stroke-white/5" />
                ))}
                {[0, 60, 120, 180, 240, 300].map((a) => (
                  <line key={a} x1="50" y1="50" x2={50 + 50 * Math.cos((a - 90) * Math.PI / 180)} y2={50 + 50 * Math.sin((a - 90) * Math.PI / 180)} className="stroke-white/5" />
                ))}
                <polygon points="50,30 75,45 80,60 50,75 30,55 35,40" className="stroke-white/20 stroke-[0.5] fill-white/5" strokeDasharray="2,1" />
                <polygon 
                  points={selectedScenario === 'baseline' ? "50,30 75,45 80,60 50,75 30,55 35,40" : "50,15 90,30 85,70 50,90 20,60 25,35"} 
                  className={cn(
                    "transition-all duration-1000 stroke-[1.5]",
                    selectedScenario === 'baseline' ? "stroke-white/40 fill-white/10" : "stroke-primary fill-primary/20 group-hover:fill-primary/30 shadow-[0_0_20px_rgba(19,127,236,0.2)]"
                  )} 
                />
              </svg>
              <AxisLabel top="-5%" left="50%" label="Fiscal Stability" />
              <AxisLabel top="25%" right="-15%" label="Social Equality" />
              <AxisLabel bottom="25%" right="-15%" label="Climate Health" />
              <AxisLabel bottom="-5%" left="50%" label="Economic Growth" />
              <AxisLabel bottom="25%" left="-15%" label="Infrastructure" />
              <AxisLabel top="25%" left="-15%" label="Equity Index" />
            </div>
          </div>

          <div className="flex flex-col gap-6 mt-4">
            <div className="stitch-card p-8 bg-[#137fec]/5 border-[#137fec]/20 relative overflow-hidden group shadow-2xl">
              <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-primary mb-4 flex items-center gap-2">
                <Icon name="auto_awesome" />
                AI Strategy Insight
              </h4>
              <p className="text-sm lg:text-base text-foreground/90 leading-relaxed font-medium italic relative z-10">
                "{simData?.short_term_impact || (fileName?.toLowerCase().includes('estonia') 
                  ? "Estonia's pivot from oil shale to a renewable-led industrial base projects a +4.2% GDP growth by 2030. While initial fiscal layout for grid modernization is high, the long-term gains in energy independence and EU ETS savings yield a 12% net surplus." 
                  : "The Proposed Scenario achieves a superior balance between rapid climate transition and fiscal sustainability. While initial debt increases by 2.4%, the long-term gains in industrial efficiency and social equity generate a 12% net surplus by year 15.")}"
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div className="bg-white/5 border border-white/5 p-4 rounded-xl flex flex-col gap-1">
                 <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">Risk Level</span>
                 <span className="text-lg font-bold text-amber-400">MODERATE</span>
               </div>
               <div className="bg-white/5 border border-white/5 p-4 rounded-xl flex flex-col gap-1">
                 <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">Confidence</span>
                 <span className="text-lg font-bold text-blue-400">HIGH (92%)</span>
               </div>
            </div>
          </div>

          <div className="mt-auto lg:sticky lg:bottom-0 pt-12">
            <button 
              onClick={() => {
                setIsMapping(true);
                setTimeout(() => router.push('/map'), 1500);
              }}
              disabled={isMapping}
              className={cn(
                "w-full py-8 flex flex-col items-center justify-center gap-4 rounded-3xl transition-all duration-500 relative overflow-hidden group",
                isMapping ? "bg-primary/20" : "bg-primary hover:bg-primary-hover shadow-[0_20px_50px_rgba(19,127,236,0.3)] hover:shadow-[0_25px_60px_rgba(19,127,236,0.5)] hover:-translate-y-1"
              )}
            >
              {/* Animated Glow Overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shimmer" />
              
              <div className="flex items-center gap-4 relative z-10">
                {isMapping ? (
                  <div className="w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  <Icon name="map" className="text-4xl text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]" />
                )}
                <div className="flex flex-col items-start">
                  <span className="text-xl font-black uppercase tracking-[0.25em] text-white">
                    {isMapping ? "Synthesizing..." : "Geospatial View"}
                  </span>
                  {!isMapping && <span className="text-[10px] font-bold text-white/60 uppercase tracking-widest">Explore Geographic Impact</span>}
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
      <SidebarNav />

      {/* Deployment Success Overlay */}
      {showSuccess && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-[#0a1118]/90 backdrop-blur-xl animate-in fade-in duration-500">
          <div className="max-w-md w-full bg-card border border-white/10 p-10 rounded-[40px] shadow-[0_0_100px_rgba(34,197,94,0.15)] flex flex-col items-center text-center gap-8 animate-in zoom-in-95 slide-in-from-bottom-10 duration-700">
            <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(34,197,94,0.4)]">
              <Icon name="check" className="text-white text-5xl" />
            </div>
            
            <div className="flex flex-col gap-3">
              <h3 className="text-3xl font-bold tracking-tight text-white">Policy Deployed</h3>
              <p className="text-muted-foreground leading-relaxed">
                The <span className="text-white font-bold">{fileName || 'Estonia NECP 2030'}</span> has been successfully finalized and moved to the Completed section of your library.
              </p>
            </div>

            <div className="flex flex-col w-full gap-3">
              <button 
                className="w-full py-5 bg-primary hover:bg-primary-hover text-white rounded-2xl font-bold uppercase tracking-widest shadow-xl transition-all hover:scale-[1.02] flex items-center justify-center gap-3"
                onClick={() => {
                  if (simData) {
                    generatePolicyPDF({
                      ...simData,
                      scenario_id: simId || 'temp',
                      name: fileName || 'Estonia NECP 2030',
                    });
                  }
                }}
              >
                <Icon name="download" className="text-xl" />
                Download PDF Report
              </button>
              <button 
                onClick={() => router.push('/library')}
                className="w-full py-5 bg-green-500 hover:bg-green-600 text-white rounded-2xl font-bold uppercase tracking-widest shadow-xl transition-all hover:scale-[1.02]"
              >
                Go to Library
              </button>
              <button 
                onClick={() => setShowSuccess(false)}
                className="w-full py-5 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-bold uppercase tracking-widest border border-white/5 transition-all"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default function VisualizationPage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center text-white bg-[#0a1118]">Loading Visualization...</div>}>
      <VisualizationContent />
    </Suspense>
  );
}

const DataPointChip = ({ label, value }: { label: string, value: string }) => (
  <div className="px-4 py-2 rounded-xl bg-green-500/5 border border-green-500/10 flex items-center gap-2">
    <span className="text-[10px] font-medium text-green-400/80">{label}:</span>
    <span className="text-[10px] font-bold text-green-400">{value}</span>
  </div>
);

const ElasticityRow = ({ label, value, progress }: { label: string, value: string, progress: number }) => (
  <div className="flex flex-col gap-2">
    <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-white font-mono">{value}</span>
    </div>
    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
      <div className="h-full bg-primary rounded-full" style={{ width: `${progress}%` }} />
    </div>
  </div>
);

const ConfidenceFactor = ({ label, value, color }: { label: string, value: string, color: string }) => (
  <div className="flex items-center gap-3">
    <div className={cn("w-2 h-2 rounded-full", color)} />
    <span className="text-[10px] font-bold text-muted-foreground/80 uppercase tracking-widest">{label}:</span>
    <span className="text-[10px] font-bold text-foreground uppercase tracking-widest">{value}</span>
  </div>
);

const FlowStep = ({ title, desc, status }: { title: string, desc: string, status: 'completed' | 'active' }) => (
  <div className="flex gap-6 mb-12 last:mb-0 relative group">
    <div className={cn(
      "absolute -left-[30px] w-3 h-3 rounded-full border-2 border-[#0a1118] z-10",
      status === 'completed' ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" : "bg-white/20"
    )} />
    <div className="flex flex-col gap-1 pt-0.5">
      <h4 className={cn("text-sm font-bold", status === 'completed' ? "text-foreground/90" : "text-muted-foreground")}>{title}</h4>
      <p className="text-[10px] text-muted-foreground/60 leading-relaxed max-w-sm">{desc}</p>
    </div>
  </div>
);

const TradeOffCard = ({ label, desc, status }: any) => (
  <div className={cn(
    "stitch-card p-5 border-l-4 flex flex-col gap-2 bg-white/[0.02] hover:bg-white/[0.04] transition-all",
    status === 'positive' ? "border-green-500" : "border-red-500"
  )}>
    <span className="text-sm font-bold text-foreground/90">{label}</span>
    <p className="text-[10px] text-muted-foreground leading-relaxed">{desc}</p>
  </div>
);

const TrendBar = ({ heights, label }: any) => (
  <div className="flex-1 flex flex-col items-center gap-4 group h-full justify-end">
    <div className="w-full flex items-end justify-center gap-1 h-full">
      <div 
        className="w-8 bg-green-500/40 border border-green-500/20 rounded-t-lg transition-all duration-700 group-hover:bg-green-500/60" 
        style={{ height: `${heights[0]}%` }} 
      />
      <div 
        className="w-8 bg-blue-500/40 border border-blue-500/20 rounded-t-lg transition-all duration-700 group-hover:bg-blue-500/60" 
        style={{ height: `${heights[1]}%` }} 
      />
    </div>
    <span className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest">{label}</span>
  </div>
);

const SDGBreakdownRow = ({ id, name, score, desc, status, icon }: any) => (
  <div className="stitch-card p-6 bg-card-alt/20 border-white/5 flex flex-col gap-4 group hover:bg-white/[0.04] transition-all">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className={cn(
          "w-12 h-12 rounded-xl flex items-center justify-center border",
          status === 'positive' ? "bg-green-500/10 border-green-500/20 text-green-500" :
          status === 'negative' ? "bg-red-500/10 border-red-500/20 text-red-500" :
          "bg-white/5 border-white/10 text-muted-foreground"
        )}>
          <Icon name={icon} className="text-2xl" />
        </div>
        <div className="flex flex-col">
          <h4 className="font-bold text-foreground/90 text-base">SDG {id}: {name}</h4>
          <p className="text-xs text-muted-foreground/60 leading-tight pr-4">{desc}</p>
        </div>
      </div>
      <div className="flex flex-col items-end gap-1.5">
        <span className={cn(
          "font-mono font-bold text-lg",
          score > 0 ? "text-green-500" : score < 0 ? "text-red-500" : "text-muted-foreground"
        )}>
          {score > 0 ? `+${score}` : score}
        </span>
        <div className={cn(
          "w-2.5 h-2.5 rounded-full shadow-[0_0_10px_currentColor]",
          status === 'positive' ? "bg-green-500 text-green-500/50" :
          status === 'negative' ? "bg-red-500 text-red-500/50" :
          "bg-blue-400/50 text-blue-400/20"
        )} />
      </div>
    </div>
  </div>
);

const CausalNode = ({ icon, type, title, desc, status, active = false, warning = false }: any) => (
  <div className="flex gap-8 items-start mb-12 last:mb-0 relative z-10 group">
    <div className={cn(
      "w-14 lg:w-20 h-14 lg:h-20 rounded-full flex items-center justify-center border-4 transition-all duration-500",
      active ? "bg-primary border-primary/20 text-white shadow-[0_0_30px_rgba(19,127,236,0.4)] scale-110" : 
      warning ? "bg-card border-amber-500/20 text-amber-500 group-hover:border-amber-500/40" :
      "bg-card border-white/5 text-muted-foreground group-hover:border-primary/20"
    )}>
      <Icon name={icon} className="text-2xl lg:text-3xl" fill={active} />
    </div>
    <div className="flex flex-col gap-1 flex-1 pt-2">
      <div className="flex items-center justify-between">
        <span className={cn(
          "text-[10px] font-bold uppercase tracking-[0.15em]",
          active ? "text-primary" : "text-muted-foreground/60"
        )}>
          {type}
        </span>
        <span className={cn(
          "px-2 py-0.5 rounded text-[8px] font-bold uppercase border",
          active ? "bg-primary/10 text-primary border-primary/20" : 
          warning ? "bg-amber-500/10 text-amber-500 border-amber-500/20" :
          "bg-white/5 text-muted-foreground/40 border-white/5"
        )}>
          {status}
        </span>
      </div>
      <h4 className="text-xl font-bold text-foreground/90">{title}</h4>
      <p className="text-sm text-muted-foreground/80 leading-relaxed max-w-lg">{desc}</p>
    </div>
  </div>
);

const AssumptionItem = ({ title, desc, active = false }: any) => (
  <div className={cn(
    "stitch-card p-6 flex flex-col gap-4 transition-all border group cursor-pointer",
    active ? "bg-primary/5 border-primary/30 shadow-lg" : "bg-white/[0.02] border-white/5 hover:border-white/10"
  )}>
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className={cn(
          "w-8 h-8 rounded-lg flex items-center justify-center",
          active ? "bg-primary/20 text-primary" : "bg-white/5 text-muted-foreground"
        )}>
          <Icon name={active ? "info" : "database"} className="text-base" fill={active} />
        </div>
        <span className="text-sm font-bold text-foreground/90">{title}</span>
      </div>
      <Icon name={active ? "expand_less" : "expand_more"} className="text-muted-foreground/40 group-hover:text-muted-foreground" />
    </div>
    {active && (
      <p className="text-sm text-muted-foreground leading-relaxed animate-in fade-in slide-in-from-top-2 duration-300">
        {desc}
      </p>
    )}
  </div>
);

const StakeholderRow = ({ icon, label, desc, impact, status }: any) => (
  <div className="grid grid-cols-12 gap-4 py-5 border-b border-white/[0.03] items-center group/row">
    <div className="col-span-8 flex items-center gap-4">
      <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 group-hover/row:bg-primary/10 transition-colors">
        <Icon name={icon} className="text-primary text-xl" />
      </div>
      <div className="flex flex-col">
        <span className="text-sm font-bold text-foreground/90">{label}</span>
        <span className="text-[10px] text-muted-foreground">{desc}</span>
      </div>
    </div>
    <div className="col-span-4 flex items-center justify-end gap-2">
      <div className={cn(
        "w-2 h-2 rounded-full",
        status === 'positive' ? "bg-green-400" : status === 'negative' ? "bg-red-400" : "bg-amber-400"
      )} />
      <span className={cn(
        "text-[10px] font-bold uppercase tracking-widest",
        status === 'positive' ? "text-green-400" : status === 'negative' ? "text-red-400" : "text-amber-400"
      )}>
        {impact}
      </span>
    </div>
  </div>
);

const ScenarioBtn = ({ label, active, onClick, primary = false }: any) => (
  <button 
    onClick={onClick}
    className={cn(
      "px-8 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all",
      active ? (primary ? "bg-primary text-white shadow-[0_0_20px_rgba(19,127,236,0.3)]" : "bg-white/10 text-white shadow-lg") : "text-muted-foreground hover:text-foreground"
    )}
  >
    {label}
  </button>
);

const ViewToggle = ({ active, icon, onClick, title }: any) => (
  <button 
    onClick={onClick}
    className={cn(
      "h-12 px-4 rounded-xl flex items-center justify-center gap-3 transition-all border",
      active ? "bg-primary/10 border-primary/20 text-primary shadow-[0_0_15px_rgba(19,127,236,0.15)]" : "bg-white/5 border-white/5 text-muted-foreground hover:bg-white/10"
    )}
  >
    <Icon name={icon} className="text-xl" fill={active} />
    <span className="text-[10px] font-bold uppercase tracking-widest">{title}</span>
  </button>
);

const IndicatorSection = ({ title, icon, children }: any) => (
  <div className="flex flex-col gap-8 bg-white/[0.01] p-8 rounded-[32px] border border-white/[0.03]">
    <div className="flex items-center justify-between mb-2">
      <div className="flex items-center gap-3 ml-1">
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
          <Icon name={icon} className="text-primary text-base" />
        </div>
        <h3 className="text-xs font-black uppercase tracking-[0.25em] text-white/90">{title}</h3>
      </div>
      <button className="text-[10px] font-bold text-primary hover:underline tracking-widest uppercase">Trend View</button>
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
      {children}
    </div>
  </div>
);

const SDGCard = ({ id, name, score, status, color }: any) => (
  <div className="stitch-card p-6 bg-card-alt/20 border-white/5 hover:border-white/20 transition-all">
    <div className="flex justify-between items-start mb-4">
      <div className={cn("w-12 h-12 rounded-lg flex items-center justify-center text-white text-xl font-bold shadow-lg", color)}>
        {id}
      </div>
      <div className="text-right">
        <span className="text-[10px] font-bold text-primary uppercase tracking-widest">{status}</span>
        <div className="text-2xl font-bold font-mono">{score}%</div>
      </div>
    </div>
    <h4 className="font-bold text-sm text-foreground/80 mb-4">{name}</h4>
    <ProgressBar progress={score} />
  </div>
);

const ComparisonRow = ({ label, local, global, desc }: any) => (
  <div className="flex flex-col gap-4">
    <div className="flex justify-between items-end">
      <div className="flex flex-col gap-1">
        <span className="text-sm font-bold">{label}</span>
        <p className="text-[10px] text-muted-foreground max-w-sm">{desc}</p>
      </div>
      <div className="flex items-end gap-6">
        <div className="flex flex-col items-center">
          <span className="text-[8px] font-bold text-primary uppercase mb-1">Proposed</span>
          <span className="text-xl font-bold font-mono">{local}%</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-[8px] font-bold text-muted-foreground uppercase mb-1">Global Avg</span>
          <span className="text-xl font-bold font-mono opacity-40">{global}%</span>
        </div>
      </div>
    </div>
    <div className="h-2 w-full bg-white/5 rounded-full relative overflow-hidden">
      <div className="h-full bg-primary/40 rounded-full" style={{ width: `${global}%` }} />
      <div className="absolute top-0 h-full bg-primary rounded-full shadow-[0_0_10px_rgba(19,127,236,0.5)]" style={{ width: `${local}%` }} />
    </div>
  </div>
);

function getHexPoints(radius: number) {
  const points = [];
  for (let i = 0; i < 6; i++) {
    const angle = (i * 60 - 90) * Math.PI / 180;
    points.push(`${50 + radius / 2 * Math.cos(angle)},${50 + radius / 2 * Math.sin(angle)}`);
  }
  return points.join(' ');
}

const AxisLabel = ({ top, bottom, left, right, label }: any) => (
  <span className="absolute text-[8px] font-bold uppercase tracking-widest text-muted-foreground/60 whitespace-nowrap" style={{ top, bottom, left, right, transform: 'translateX(-50%)' }}>
    {label}
  </span>
);

const ImpactMetricCard = ({ label, value, sub, status, chart }: { label: string, value: string, sub: string, status: 'positive' | 'neutral' | 'negative', chart: number[] }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  const statusColor = status === 'positive' ? 'green' : status === 'neutral' ? 'amber' : 'red';
  
  return (
    <div 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        "stitch-card p-6 flex flex-col gap-6 bg-card-alt/20 border-white/[0.05] hover:border-white/20 transition-all duration-500 group relative overflow-hidden",
        isHovered && "shadow-[0_0_40px_rgba(19,127,236,0.1)] -translate-y-1"
      )}
    >
      {/* Background Glow */}
      <div className={cn(
        "absolute -right-4 -top-4 w-24 h-24 blur-[60px] rounded-full transition-opacity duration-700",
        status === 'positive' ? "bg-green-500/10" : status === 'neutral' ? "bg-amber-500/10" : "bg-red-500/10",
        isHovered ? "opacity-100" : "opacity-0"
      )} />

      <div className="flex justify-between items-start relative z-10">
        <div className="flex flex-col gap-1.5">
          <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-[0.2em]">{label}</span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono tracking-tighter text-white">{value}</span>
            {isHovered && (
              <span className="text-[10px] font-bold text-primary animate-in fade-in slide-in-from-left-2 tracking-widest">REAL-TIME</span>
            )}
          </div>
        </div>
        <div className={cn(
          "px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-all duration-500 shadow-sm",
          status === 'positive' ? "bg-green-500/10 text-green-400 border-green-500/30" : 
          status === 'neutral' ? "bg-amber-500/10 text-amber-400 border-amber-500/30" : 
          "bg-red-500/10 text-red-400 border-red-500/30",
          isHovered && "scale-105 border-opacity-100"
        )}>
          {sub}
        </div>
      </div>

      <div className="h-16 w-full relative mt-2 group-hover:scale-y-110 transition-transform duration-500">
        {/* SVG Area Chart */}
        <svg viewBox="0 0 100 40" className="w-full h-full overflow-visible" preserveAspectRatio="none">
          <defs>
            <linearGradient id={`gradient-${label.replace(/\s+/g, '')}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={status === 'positive' ? '#22c55e' : status === 'neutral' ? '#f59e0b' : '#ef4444'} stopOpacity="0.3" />
              <stop offset="100%" stopColor={status === 'positive' ? '#22c55e' : status === 'neutral' ? '#f59e0b' : '#ef4444'} stopOpacity="0" />
            </linearGradient>
          </defs>
          <path 
            d={`M 0 40 ${chart.map((h, i) => `L ${i * (100 / (chart.length - 1))} ${40 - (h * 0.4)}`).join(' ')} L 100 40 Z`} 
            fill={`url(#gradient-${label.replace(/\s+/g, '')})`}
            className="transition-all duration-700"
          />
          <path 
            d={`M 0 ${40 - (chart[0] * 0.4)} ${chart.slice(1).map((h, i) => `L ${(i + 1) * (100 / (chart.length - 1))} ${40 - (h * 0.4)}`).join(' ')}`} 
            fill="none" 
            className={cn(
              "stroke-2 transition-all duration-700",
              status === 'positive' ? "stroke-green-500" : status === 'neutral' ? "stroke-amber-400" : "stroke-red-500"
            )}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {isHovered && chart.map((h, i) => (
            <circle 
              key={i} 
              cx={i * (100 / (chart.length - 1))} 
              cy={40 - (h * 0.4)} 
              r="1.5" 
              className={cn(
                "fill-white animate-in zoom-in-50 duration-300",
                status === 'positive' ? "shadow-[0_0_8px_rgba(34,197,94,1)]" : "shadow-[0_0_8px_rgba(245,158,11,1)]"
              )} 
            />
          ))}
        </svg>
      </div>

      {isHovered && (
        <div className="absolute inset-0 bg-primary/5 backdrop-blur-[2px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity animate-in fade-in duration-300">
          <button className="bg-white text-primary px-6 py-2.5 rounded-xl font-bold text-[10px] uppercase tracking-[0.2em] shadow-2xl hover:scale-105 active:scale-95 transition-all">
            Inspect Metric
          </button>
        </div>
      )}
    </div>
  );
};

