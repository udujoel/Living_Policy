'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Icon, TopNav, SidebarNav, ProgressBar, StatusPill } from '@/components/SharedUI';
import { cn } from '@/lib/utils';
import { useRouter, useSearchParams } from 'next/navigation';
import { saveSimulationResult, getAnalysisResult } from '@/lib/storage';

export default function SimulatorWorkspace1() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fileName = searchParams.get('file') || '';

  const [isSimulating, setIsSimulating] = useState(false);
  const [activeScenario, setActiveScenario] = useState<'baseline' | 'alternative'>('alternative');
  const [activeTab, setActiveTab] = useState<'policy' | 'timeline' | 'impact'>('policy');
  const [reasoning, setReasoning] = useState<string>("Adjust levers to see AI-powered causal reasoning for this policy scenario.");
  const [confidence, setConfidence] = useState<number>(92);
  const [expandedPhase, setExpandedPhase] = useState<string | null>(null);
  const [expandedKPI, setExpandedKPI] = useState<string | null>(null);

  const [levers, setLevers] = useState<any[]>([]);
  const [baselineLevers, setBaselineLevers] = useState<any[]>([]);
  const [activeSimId, setActiveSimId] = useState<string>(searchParams.get('simId') || Math.random().toString(36).substr(2, 9));

  useEffect(() => {
    if (fileName) {
      const result = getAnalysisResult(fileName);
      if (result && result.data && result.data.levers) {
        const mappedLevers = result.data.levers.map((l: any, i: number) => {
          const currentVal = parseFloat(l.current_value) || 50;
          return {
            id: i,
            name: l.name,
            value: currentVal,
            initialValue: currentVal, // Store for reset
            unit: l.unit || '',
            min: 0,
            max: currentVal * 2 || 100,
            icon: i % 4 === 0 ? 'payments' : i % 4 === 1 ? 'account_balance' : i % 4 === 2 ? 'factory' : 'bolt',
            desc: l.description || 'Impact variable detected in policy text'
          };
        });
        setLevers(mappedLevers);
        setBaselineLevers(JSON.parse(JSON.stringify(mappedLevers)));
      } else {
        const defaults = [
          { id: 1, name: 'Carbon Tax Rate', value: 75, initialValue: 75, unit: '$/tonne', min: 0, max: 200, icon: 'payments', desc: 'Levy on fossil fuel carbon output' },
          { id: 2, name: 'Grid Subsidy', value: 15, initialValue: 15, unit: '%', min: 0, max: 40, icon: 'account_balance', desc: 'National grid infrastructure support' },
          { id: 3, name: 'Industrial Cap', value: 500, initialValue: 500, unit: 'MW', min: 100, max: 1000, icon: 'factory', desc: 'Maximum energy allowance for heavy industry' },
          { id: 4, name: 'Zoning Coverage', value: 65, initialValue: 65, unit: '%', min: 0, max: 100, icon: 'map', desc: 'Regional areas permitted for development' },
        ];
        setLevers(defaults);
        setBaselineLevers(JSON.parse(JSON.stringify(defaults)));
      }
    }
  }, [fileName]);

  useEffect(() => {
    if (activeScenario === 'baseline') {
      setLevers(JSON.parse(JSON.stringify(baselineLevers)));
      setReasoning("Viewing the original policy parameters without modifications.");
    } else {
      setReasoning("Exploring an alternative future with adjusted policy levers.");
    }
  }, [activeScenario, baselineLevers]);

  const updateLever = (id: number, val: number) => {
    if (activeScenario === 'baseline') return;
    setLevers(prev => prev.map(l => l.id === id ? { ...l, value: val } : l));
    setReasoning(`Adjusting ${levers.find(l => l.id === id)?.name} will shift the projected outcomes for this jurisdiction.`);
  };

  const handleRunSimulation = async () => {
    setIsSimulating(true);
    try {
      const response = await fetch('/api/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          levers,
          analysisContext: { policyName: fileName || 'Generic Policy' }
        }),
      });
      
      const data = await response.json();
      
      saveSimulationResult({
        id: activeSimId,
        policyId: Date.now(),
        scenarioName: activeScenario === 'baseline' ? 'Baseline' : (fileName || 'Alternative Scenario'),
        timestamp: new Date().toISOString(),
        status: 'Draft',
        data: data
      });

      setReasoning(data.short_term_impact || "Simulation complete.");
      
      setTimeout(() => {
        router.push(`/visualization?file=${fileName}&simId=${activeSimId}`);
      }, 1500);
    } catch (error) {
      console.error('Simulation failed', error);
      setTimeout(() => router.push(`/visualization?file=${fileName}`), 1500);
    }
  };

  return (
    <main className="max-container flex flex-col min-h-screen pb-24 lg:pb-0 bg-[#0a1118] relative">
      <TopNav title="Scenario Simulator" />
      
      <div className="max-w-[1600px] mx-auto w-full flex flex-col flex-1 relative">
        {/* Simulation Sub-Header */}
        <div className="bg-card-alt/30 border-b border-white/5 px-6 lg:px-12 py-4 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex bg-white/5 p-1 rounded-xl w-fit border border-white/5">
            <button 
              onClick={() => setActiveScenario('baseline')}
              className={cn(
                "px-8 py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all", 
                activeScenario === 'baseline' ? "bg-white/10 text-white shadow-lg" : "text-muted-foreground hover:text-foreground"
              )}
            >
              Baseline
            </button>
            <button 
              onClick={() => setActiveScenario('alternative')}
              className={cn(
                "px-8 py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all", 
                activeScenario === 'alternative' ? "bg-primary text-white shadow-[0_0_20px_rgba(19,127,236,0.3)]" : "text-muted-foreground hover:text-foreground"
              )}
            >
              Alternative
            </button>
          </div>

          <div className="flex gap-10">
            <TabItem label="Policy Levers" active={activeTab === 'policy'} onClick={() => setActiveTab('policy')} />
            <TabItem label="Projection Timeline" active={activeTab === 'timeline'} onClick={() => setActiveTab('timeline')} />
            <TabItem label="System Impact" active={activeTab === 'impact'} onClick={() => setActiveTab('impact')} />
          </div>
        </div>

        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          {/* Main Workspace Area */}
          <div className="flex-1 overflow-y-auto p-6 lg:p-12 flex flex-col gap-10">
            {activeTab === 'policy' && (
              <div className="flex flex-col gap-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col gap-1">
                    <h2 className="text-xl lg:text-3xl font-bold tracking-tight">Policy Variables</h2>
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest">
                      {activeScenario === 'baseline' ? 'Viewing original policy constants' : 'Adjust variables to explore counterfactual outcomes'}
                    </p>
                  </div>
                  <button className="p-2 hover:bg-white/5 rounded-xl border border-white/5 text-muted-foreground group transition-colors">
                    <Icon name="filter_list" className="text-xl group-hover:text-primary" />
                  </button>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                  {levers.map((l) => (
                    <div 
                      key={l.id} 
                      className={cn(
                        "stitch-card p-10 flex flex-col gap-12 transition-all duration-500 relative overflow-hidden group",
                        activeScenario === 'baseline' 
                          ? "bg-white/[0.01] border-white/5 opacity-70" 
                          : "bg-gradient-to-br from-card-alt/40 to-transparent border-white/[0.05] hover:border-primary/30 hover:shadow-[0_0_50px_rgba(19,127,236,0.1)]"
                      )}
                    >
                      {/* Interactive Background Polish */}
                      <div className="absolute top-0 left-0 w-1 h-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0">
                         <button 
                           onClick={() => updateLever(l.id, l.initialValue)}
                           className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-[8px] font-bold uppercase tracking-widest text-muted-foreground hover:text-white"
                         >
                           Reset
                         </button>
                      </div>

                      <div className="flex justify-between items-start relative z-10">
                        <div className="flex items-center gap-6">
                          <div className={cn(
                            "w-16 h-16 rounded-2xl flex items-center justify-center border transition-all duration-500",
                            activeScenario === 'baseline' 
                              ? "bg-white/5 border-white/10 text-muted-foreground" 
                              : "bg-primary/10 border-primary/20 text-primary group-hover:scale-110 shadow-lg shadow-primary/5"
                          )}>
                            <Icon name={l.icon} className="text-3xl" />
                          </div>
                          <div className="flex flex-col gap-1">
                            <h3 className="font-black text-xl lg:text-2xl text-white tracking-tight">{l.name}</h3>
                            <p className="text-xs text-muted-foreground font-medium leading-relaxed max-w-[240px] line-clamp-2">
                              {l.desc || 'Policy lever extracted from document analysis.'}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex flex-col items-end gap-2">
                          <div className={cn(
                            "px-6 py-3 rounded-2xl border font-mono text-xl lg:text-2xl font-black transition-all",
                            activeScenario === 'baseline'
                              ? "bg-white/5 border-white/10 text-muted-foreground"
                              : "bg-primary text-white border-primary shadow-[0_0_25px_rgba(19,127,236,0.4)] scale-105"
                          )}>
                            {l.value}
                            <span className="text-xs ml-1 opacity-60 font-bold">{l.unit}</span>
                          </div>
                          {activeScenario !== 'baseline' && l.value !== l.initialValue && (
                            <span className={cn(
                              "text-[10px] font-bold uppercase tracking-widest",
                              l.value > l.initialValue ? "text-green-400" : "text-amber-400"
                            )}>
                              {l.value > l.initialValue ? 'Increased' : 'Decreased'}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="relative pt-4 px-2">
                        {/* Custom Slider Track */}
                        <div className="absolute h-1.5 top-[22px] left-2 right-2 bg-white/5 rounded-full" />
                        <input 
                          type="range" 
                          min={l.min} 
                          max={l.max} 
                          step={l.max > 100 ? 5 : 1}
                          value={l.value} 
                          disabled={activeScenario === 'baseline'}
                          onChange={(e) => updateLever(l.id, parseFloat(e.target.value))}
                          className={cn(
                            "relative w-full h-2 bg-transparent appearance-none cursor-pointer z-10 accent-primary",
                            "slider-thumb:w-6 slider-thumb:h-6 slider-thumb:rounded-full slider-thumb:bg-white slider-thumb:shadow-xl",
                            activeScenario === 'baseline' && "cursor-not-allowed opacity-0"
                          )}
                        />
                        <div className="flex justify-between mt-8">
                          <div className="flex flex-col gap-1.5">
                            <span className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em]">Min Target</span>
                            <span className="text-xs font-mono font-bold text-muted-foreground/40">{l.min}{l.unit}</span>
                          </div>
                          <div className="flex flex-col gap-1.5 items-end">
                            <span className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em]">Max Ceiling</span>
                            <span className="text-xs font-mono font-bold text-muted-foreground/40">{l.max}{l.unit}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'timeline' && (
              <div className="flex flex-col gap-12 animate-in fade-in slide-in-from-right-4 duration-500 h-full">
                <div className="flex flex-col gap-4">
                  <h2 className="text-3xl font-bold">Projection Timeline</h2>
                  <p className="text-muted-foreground uppercase tracking-widest text-xs">
                    {activeScenario === 'baseline' ? 'HISTORICAL TRAJECTORY WITHOUT INTERVENTION' : 'PHASED IMPACT ROLLOUT UNDER POLICY IMPLEMENTATION'}
                  </p>
                </div>
                
                {/* Interactive Timeline Visualization */}
                <div className="stitch-card p-12 bg-gradient-to-br from-card-alt/40 to-transparent border-white/5 relative overflow-hidden group">
                  <div className={cn(
                    "absolute top-0 left-0 w-full h-1 transition-all duration-700",
                    activeScenario === 'baseline' 
                      ? "bg-gradient-to-r from-amber-500/0 via-amber-500/40 to-amber-500/0" 
                      : "bg-gradient-to-r from-primary/0 via-primary/40 to-primary/0"
                  )} />
                  
                  {/* Animated Progress Line */}
                  <div className="relative mb-16">
                    <div className="absolute top-5 left-0 right-0 h-1 bg-white/5 rounded-full z-0" />
                    <div className={cn(
                      "absolute top-5 left-0 h-1 rounded-full z-0 transition-all duration-1000",
                      activeScenario === 'baseline' ? "bg-amber-500/30 w-1/4" : "bg-primary/60 w-3/4"
                    )} />
                    
                    <div className="flex justify-between relative">
                      <TimelinePhase 
                        year="2024" 
                        label={activeScenario === 'baseline' ? 'Stagnation' : 'Implementation'} 
                        active={true}
                        scenario={activeScenario}
                        description={activeScenario === 'baseline' 
                          ? 'Status quo maintained. No structural reforms.' 
                          : '€2.4B capital deployment initiates renewable infrastructure.'
                        }
                        onClick={() => setExpandedPhase(expandedPhase === '2024' ? null : '2024')}
                        expanded={expandedPhase === '2024'}
                        detailedInfo={activeScenario === 'baseline' ? {
                          title: '2024: Business-as-Usual Stagnation',
                          keyEvents: [
                            'Oil-shale dependency remains at 76% of electricity generation',
                            'Incremental GHG decline of 1.8%/year continues under existing EU ETS',
                            'Ida-Viru region unemployment persists at 12.4% (vs 5.8% national avg)',
                            'No major infrastructure investment in renewable capacity'
                          ],
                          economicImpact: 'GDP growth stagnates at +1.2%/year. Fiscal pressure mounts due to rising fossil fuel import costs (€680M annually) and vulnerability to commodity price volatility.',
                          stakeholders: [
                            { group: 'Oil-shale workers', impact: 'Stable but uncertain. No transition support programs.', sentiment: 'neutral' },
                            { group: 'Renewable sector', impact: 'Limited growth. Investment climate remains weak.', sentiment: 'negative' },
                            { group: 'Urban consumers', impact: 'Moderate energy price increases (+2.8% annually)', sentiment: 'negative' }
                          ]
                        } : {
                          title: '2024-2027: Immediate Transition Phase',
                          keyEvents: [
                            '€2.4B capital deployment triggers offshore wind farm construction (800MW capacity)',
                            'Just-transition fund (€420M) activated for 3,400 affected oil-shale workers',
                            'Grid modernization begins: smart metering rollout to 420,000 households',
                            'Green-tech incubator launched in Tallinn with EU co-financing (€85M)'
                          ],
                          economicImpact: 'GDP accelerates to +4.2%/year driven by construction boom and FDI inflows. 8,200 net new jobs created in renewable energy, grid infrastructure, and energy efficiency sectors. Short-term electricity prices rise +4.2% due to infrastructure costs, partially offset by €160M in EU subsidies.',
                          stakeholders: [
                            { group: 'Oil-shale workers', impact: 'Transition support: retraining vouchers (€12k/person), early retirement options', sentiment: 'mixed' },
                            { group: 'Renewable sector', impact: 'Boom period. Salaries increase 18% due to talent shortage.', sentiment: 'positive' },
                            { group: 'Construction industry', impact: '+2,400 jobs in infrastructure projects. €340M revenue surge.', sentiment: 'positive' },
                            { group: 'Urban consumers', impact: 'Initial price shock mitigated by efficiency gains and social tariffs', sentiment: 'neutral' }
                          ]
                        }}
                      />
                      <TimelinePhase 
                        year="2027" 
                        label={activeScenario === 'baseline' ? 'Slow Decline' : 'Acceleration'} 
                        active={activeScenario === 'alternative'}
                        scenario={activeScenario}
                        description={activeScenario === 'baseline' 
                          ? 'Market pressures increase. Competitiveness erodes.' 
                          : 'Green-tech sector expands. 8,200 new jobs created.'
                        }
                      />
                      <TimelinePhase 
                        year="2030" 
                        label={activeScenario === 'baseline' ? 'Penalty Zone' : 'Peak Delta'} 
                        active={activeScenario === 'alternative'}
                        scenario={activeScenario}
                        description={activeScenario === 'baseline' 
                          ? '€180M annual compliance penalties triggered.' 
                          : '42% renewable penetration achieved. €680M ETS savings.'
                        }
                      />
                      <TimelinePhase 
                        year="2035" 
                        label={activeScenario === 'baseline' ? 'Crisis' : 'Consolidation'} 
                        active={false}
                        scenario={activeScenario}
                        description={activeScenario === 'baseline' 
                          ? 'Structural crisis. Regional unemployment spikes.' 
                          : '70% GHG reduction unlocks €3.2B EU financing.'
                        }
                      />
                    </div>
                  </div>
                </div>

                {/* Detailed Phase Breakdown */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <PhaseCard 
                    period="Short-term (2024-2027)"
                    title={activeScenario === 'baseline' ? 'Continued Dependency' : 'Transition Phase'}
                    color={activeScenario === 'baseline' ? 'amber' : 'blue'}
                    metrics={activeScenario === 'baseline' ? [
                      { label: 'GDP Growth', value: '+1.2%/yr', negative: true },
                      { label: 'Oil-Shale Dependency', value: '76%', negative: true },
                      { label: 'Job Creation', value: '+420', negative: true },
                      { label: 'Renewable Share', value: '18%', negative: true }
                    ] : [
                      { label: 'GDP Acceleration', value: '+4.2%/yr', negative: false },
                      { label: 'Infrastructure Investment', value: '€2.4B', negative: false },
                      { label: 'Green Jobs Created', value: '+8,200', negative: false },
                      { label: 'Grid Modernization', value: '15% efficiency', negative: false }
                    ]}
                    description={activeScenario === 'baseline'
                      ? 'Economic stagnation persists in Ida-Viru. Fossil fuel volatility remains high. Incremental EU pressure builds with no strategic response.'
                      : 'Immediate capital deployment triggers renewable infrastructure build-out. Just-transition fund (€420M) mitigates 3,400 oil-shale job losses. GDP accelerates through EU taxonomy-aligned investments.'
                    }
                  />
                  
                  <PhaseCard 
                    period="Long-term (2028-2035)"
                    title={activeScenario === 'baseline' ? 'Structural Decline' : 'Systemic Transformation'}
                    color={activeScenario === 'baseline' ? 'red' : 'green'}
                    metrics={activeScenario === 'baseline' ? [
                      { label: 'Compliance Penalties', value: '€180M/yr', negative: true },
                      { label: 'Import Costs', value: '+€1.8B', negative: true },
                      { label: 'Regional Unemployment', value: '+9.2%', negative: true },
                      { label: 'Carbon Intensity', value: '312 gCO2/kWh', negative: true }
                    ] : [
                      { label: 'Emissions Reduction', value: '-70%', negative: false },
                      { label: 'Import Savings', value: '€1.1B/yr', negative: false },
                      { label: 'EU Climate Financing', value: '€3.2B', negative: false },
                      { label: 'Carbon Intensity', value: '82 gCO2/kWh', negative: false }
                    ]}
                    description={activeScenario === 'baseline'
                      ? 'Cumulative underinvestment triggers competitiveness crisis. Ida-Viru region faces mass unemployment. EU sanctions escalate. Energy security deteriorates.'
                      : 'Renewable penetration hits 42% vs 28% baseline. Ida-Viru pivots to green hydrogen hub (€890M private investment). Carbon intensity drops 73%. Estonia becomes regional clean energy exporter.'
                    }
                  />
                </div>

                {/* Comparative Impact Curve */}
                <div className="stitch-card p-10 bg-card-alt/20 border-white/5">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-sm font-bold uppercase tracking-widest">Cumulative Economic Impact</h3>
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-amber-500" />
                        <span className="text-xs text-muted-foreground">Baseline</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-primary" />
                        <span className="text-xs text-muted-foreground">Proposed</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Simple Bar Chart Comparison */}
                  <div className="space-y-6">
                    <ImpactBar 
                      label="2024-2027" 
                      baselineValue={activeScenario === 'baseline' ? 85 : 35} 
                      proposedValue={activeScenario === 'baseline' ? 35 : 85} 
                      baselineLabel="+€2.8B"
                      proposedLabel="+€6.4B"
                    />
                    <ImpactBar 
                      label="2028-2030" 
                      baselineValue={activeScenario === 'baseline' ? 65 : 25} 
                      proposedValue={activeScenario === 'baseline' ? 25 : 95} 
                      baselineLabel="+€1.2B"
                      proposedLabel="+€9.8B"
                    />
                    <ImpactBar 
                      label="2031-2035" 
                      baselineValue={activeScenario === 'baseline' ? 45 : 15} 
                      proposedValue={activeScenario === 'baseline' ? 15 : 100} 
                      baselineLabel="-€0.6B"
                      proposedLabel="+€14.2B"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'impact' && (
              <div className="flex flex-col gap-10 animate-in fade-in zoom-in-95 duration-500 h-full">
                <div className="flex flex-col gap-2">
                  <h2 className="text-3xl font-bold">Systemic Impact Preview</h2>
                  <p className="text-muted-foreground uppercase tracking-widest text-xs">
                    {activeScenario === 'baseline' ? 'BASELINE KPI TRAJECTORY WITHOUT INTERVENTION' : 'REAL-TIME KPI PROJECTIONS BASED ON ADJUSTED LEVERS'}
                  </p>
                </div>

                {/* Dynamic KPI Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <InteractiveKPICard 
                    label="Economic Growth" 
                    baselineValue="+1.2%" 
                    proposedValue="+4.2%"
                    currentValue={activeScenario === 'baseline' ? '+1.2%' : '+4.2%'}
                    trend={activeScenario === 'baseline' ? 'stagnant' : 'up'} 
                    icon="trending_up"
                    color={activeScenario === 'baseline' ? 'amber' : 'green'}
                    description={activeScenario === 'baseline' 
                      ? 'GDP growth remains below EU average. Limited competitiveness gains.'
                      : 'Green-tech sector drives 3pp acceleration above historical trend.'
                    }
                    onClick={() => setExpandedKPI(expandedKPI === 'growth' ? null : 'growth')}
                    expanded={expandedKPI === 'growth'}
                    detailedBreakdown={activeScenario === 'baseline' ? {
                      drivers: [
                        { factor: 'Services Sector', contribution: '+0.8%', note: 'Digital economy partially compensates' },
                        { factor: 'Manufacturing', contribution: '+0.3%', note: 'Stagnant productivity growth' },
                        { factor: 'Energy Sector', contribution: '+0.1%', note: 'Oil-shale declining competitiveness' }
                      ],
                      risks: [
                        'Fossil fuel price volatility creates fiscal uncertainty',
                        'Brain drain to higher-growth EU economies (est. -2,400 skilled workers/year)',
                        'Underinvestment in R&D (1.4% of GDP vs 2.1% EU avg)'
                      ],
                      comparison: { label: 'vs EU Average', value: '-1.1pp', trend: 'negative' }
                    } : {
                      drivers: [
                        { factor: 'Green-tech Sector', contribution: '+1.8%', note: '8,200 new jobs, €890M investment' },
                        { factor: 'Construction', contribution: '+1.2%', note: 'Infrastructure boom period' },
                        { factor: 'Manufacturing', contribution: '+0.8%', note: 'Clean energy supply chain' },
                        { factor: 'Services', contribution: '+0.4%', note: 'Consulting, engineering services' }
                      ],
                      risks: [
                        'Short-term inflation pressure from infrastructure costs',
                        'Talent shortage in specialized green-tech roles',
                        'Dependency on EU financing continuity'
                      ],
                      comparison: { label: 'vs EU Average', value: '+1.9pp', trend: 'positive' }
                    }}
                  />
                  <InteractiveKPICard 
                    label="Carbon Emissions" 
                    baselineValue="-8%" 
                    proposedValue="-70%"
                    currentValue={activeScenario === 'baseline' ? '-8%' : '-70%'}
                    trend={activeScenario === 'baseline' ? 'down' : 'down'} 
                    icon="eco"
                    color={activeScenario === 'baseline' ? 'red' : 'green'}
                    description={activeScenario === 'baseline' 
                      ? 'Incremental decline insufficient for Paris compliance. €180M penalties.'
                      : '62pp reduction vs baseline achieves 70% target by 2030.'
                    }
                  />
                  <InteractiveKPICard 
                    label="Employment" 
                    baselineValue="+420" 
                    proposedValue="+8,200"
                    currentValue={activeScenario === 'baseline' ? '+420 jobs' : '+8,200 jobs'}
                    trend={activeScenario === 'baseline' ? 'stagnant' : 'up'} 
                    icon="group"
                    color={activeScenario === 'baseline' ? 'amber' : 'blue'}
                    description={activeScenario === 'baseline' 
                      ? 'Minimal job creation. Ida-Viru unemployment remains elevated.'
                      : 'Net +4,800 jobs after 3,400 oil-shale transitions via €420M fund.'
                    }
                  />
                </div>

                {/* Detailed Impact Breakdown */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Environmental Impact */}
                  <ImpactDimensionCard
                    title="Environmental Impact"
                    icon="forest"
                    color={activeScenario === 'baseline' ? 'amber' : 'green'}
                    metrics={activeScenario === 'baseline' ? [
                      { label: 'Renewable Share', value: '28%', target: '42%', progress: 65 },
                      { label: 'Carbon Intensity', value: '312 gCO2/kWh', target: '82 gCO2/kWh', progress: 25 },
                      { label: 'Fossil Fuel Dependency', value: '76%', target: '24%', progress: 15 }
                    ] : [
                      { label: 'Renewable Share', value: '42%', target: '42%', progress: 100 },
                      { label: 'Carbon Intensity', value: '82 gCO2/kWh', target: '82 gCO2/kWh', progress: 100 },
                      { label: 'Fossil Fuel Dependency', value: '24%', target: '24%', progress: 100 }
                    ]}
                  />

                  {/* Economic Impact */}
                  <ImpactDimensionCard
                    title="Economic Impact"
                    icon="account_balance"
                    color={activeScenario === 'baseline' ? 'red' : 'blue'}
                    metrics={activeScenario === 'baseline' ? [
                      { label: 'GDP Acceleration', value: '+1.2%/yr', target: '+4.2%/yr', progress: 30 },
                      { label: 'Investment Flow', value: '€0.6B', target: '€2.4B', progress: 25 },
                      { label: 'Export Competitiveness', value: 'Declining', target: 'Leading', progress: 20 }
                    ] : [
                      { label: 'GDP Acceleration', value: '+4.2%/yr', target: '+4.2%/yr', progress: 100 },
                      { label: 'Investment Flow', value: '€2.4B', target: '€2.4B', progress: 100 },
                      { label: 'Export Competitiveness', value: 'Leading', target: 'Leading', progress: 100 }
                    ]}
                  />
                </div>

                {/* Synergy Analysis */}
                <div className={cn(
                  "stitch-card p-10 border-2 flex flex-col gap-6 transition-all duration-500",
                  activeScenario === 'baseline' 
                    ? "bg-amber-500/5 border-amber-500/20" 
                    : "bg-primary/5 border-primary/20 shadow-[0_0_30px_rgba(19,127,236,0.1)]"
                )}>
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center",
                      activeScenario === 'baseline' ? "bg-amber-500/20" : "bg-primary/20"
                    )}>
                      <Icon name="auto_awesome" className={cn(
                        "text-2xl",
                        activeScenario === 'baseline' ? "text-amber-400" : "text-primary"
                      )} />
                    </div>
                    <div className="flex flex-col gap-1">
                      <h4 className="font-bold uppercase tracking-widest text-xs text-muted-foreground/60">Causal Chain Analysis</h4>
                      <span className={cn(
                        "text-sm font-bold uppercase tracking-wider",
                        activeScenario === 'baseline' ? "text-amber-400" : "text-primary"
                      )}>
                        {activeScenario === 'baseline' ? 'Negative Feedback Loop' : 'Positive Synergy Detected'}
                      </span>
                    </div>
                  </div>
                  <p className="text-lg text-foreground/80 leading-relaxed font-medium border-l-4 pl-6 italic" style={{
                    borderColor: activeScenario === 'baseline' ? 'rgb(245 158 11 / 0.4)' : 'rgb(19 127 236 / 0.4)'
                  }}>
                    {activeScenario === 'baseline'
                      ? 'Status quo perpetuates oil-shale dependency, creating a negative feedback loop: high carbon intensity → EU compliance penalties → fiscal pressure → underinvestment in alternatives → persistent fossil dependency. Regional unemployment in Ida-Viru compounds social instability. Projected 4.2% competitiveness decline by 2030 vs EU peers.'
                      : 'Policy intervention creates a reinforcing positive cycle: renewable infrastructure investment → green-tech job creation → GDP acceleration → enhanced fiscal capacity → further clean energy expansion. Grid modernization reduces losses 15%, amplifying returns. Ida-Viru transformation into hydrogen hub attracts €890M private capital, converting liability into strategic asset. Second-order effect: 35% EV penetration vs 12% baseline drives transport electrification.'
                    }
                  </p>
                  
                  {/* Confidence Meter */}
                  <div className="flex items-center gap-8 pt-6 border-t border-white/5">
                    <div className="flex flex-col gap-2 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/60">Model Confidence</span>
                        <span className={cn(
                          "text-xs font-bold font-mono",
                          activeScenario === 'baseline' ? "text-amber-400" : "text-primary"
                        )}>
                          {activeScenario === 'baseline' ? '78%' : '92%'}
                        </span>
                      </div>
                      <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                        <div 
                          className={cn(
                            "h-full transition-all duration-1000",
                            activeScenario === 'baseline' ? "bg-amber-500/60" : "bg-primary/80"
                          )}
                          style={{ width: activeScenario === 'baseline' ? '78%' : '92%' }}
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Icon name="verified" className={cn(
                        "text-xl",
                        activeScenario === 'baseline' ? "text-amber-400" : "text-primary"
                      )} fill />
                      <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/60">Gemini 3 Verified</span>
                    </div>
                  </div>
                </div>

                {/* Risk Assessment */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <RiskCard
                    level={activeScenario === 'baseline' ? 'HIGH' : 'MODERATE'}
                    factor="Policy Continuity Risk"
                    probability={activeScenario === 'baseline' ? '68%' : '22%'}
                    impact={activeScenario === 'baseline' ? 'Critical' : 'Manageable'}
                    description={activeScenario === 'baseline'
                      ? 'High risk of disruptive policy shift under electoral pressure. Lack of strategic direction creates uncertainty.'
                      : 'Multi-stakeholder buy-in and EU alignment reduce reversal risk. Just-transition fund mitigates political backlash.'
                    }
                  />
                  <RiskCard
                    level={activeScenario === 'baseline' ? 'HIGH' : 'LOW'}
                    factor="Economic Volatility"
                    probability={activeScenario === 'baseline' ? '74%' : '18%'}
                    impact={activeScenario === 'baseline' ? 'Severe' : 'Limited'}
                    description={activeScenario === 'baseline'
                      ? 'Fossil fuel price swings directly impact fiscal stability. €180M annual penalty exposure compounds vulnerability.'
                      : 'Diversified energy mix and €1.1B import savings buffer against commodity shocks. Export capacity adds resilience.'
                    }
                  />
                </div>
              </div>
            )}
          </div>

          {/* Right Side: AI Reasoning (Desktop Sticky) */}
          <aside className="lg:w-[450px] bg-card-alt/10 border-l border-white/5 p-6 lg:p-12 flex flex-col gap-10 overflow-y-auto">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse shadow-[0_0_10px_rgba(19,127,236,0.8)]" />
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-primary tracking-[0.2em]">Causal Reasoning AI</h3>
            </div>
            
            <div className="stitch-card p-10 bg-[#137fec]/5 border-primary/20 relative overflow-hidden group shadow-2xl">
              <p className="text-base lg:text-xl text-foreground/90 leading-relaxed font-medium relative z-10 italic font-serif">
                "{reasoning}"
              </p>
              <div className="mt-8 flex items-center gap-5 relative z-10">
                <div className="flex -space-x-3">
                  <div className="w-8 h-8 rounded-full border-2 border-background-dark bg-blue-500 flex items-center justify-center text-[10px] font-bold shadow-lg">G3</div>
                  <div className="w-8 h-8 rounded-full border-2 border-background-dark bg-indigo-500 flex items-center justify-center text-[10px] font-bold shadow-lg">AI</div>
                </div>
                <div className="flex flex-col">
                  <span className="text-[8px] font-bold text-muted-foreground/40 uppercase">Confidence</span>
                  <span className="text-[10px] font-bold text-primary uppercase tracking-widest">{confidence}% Reliable</span>
                </div>
              </div>
            </div>

            <div className="stitch-card p-8 bg-amber-500/5 border-amber-500/20 shadow-xl">
              <div className="flex items-center gap-3 mb-5">
                <Icon name="warning" className="text-amber-500 text-xl" />
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-amber-500">Threshold Alert</h3>
              </div>
              <p className="text-sm text-amber-200/70 leading-relaxed font-medium">
                Exceeding $85/tonne may trigger industrial relocation. Model suggest 14% risk of capital flight in industrial zones.
              </p>
            </div>

            <div className="mt-auto lg:sticky lg:bottom-0 pt-10 flex flex-col gap-4">
              <button 
                onClick={handleRunSimulation}
                disabled={isSimulating}
                className={cn(
                  "stitch-button-primary w-full py-6 flex items-center justify-center gap-4 text-lg font-bold uppercase tracking-[0.2em] shadow-2xl shadow-primary/40 transition-all hover:scale-[1.02] active:scale-[0.98]",
                  isSimulating && "opacity-80"
                )}
              >
                {isSimulating ? (
                  <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Icon name="play_circle" className="text-3xl" fill />
                )}
                <span>{isSimulating ? "Synthesizing Future..." : "Run Full Simulation"}</span>
              </button>
              <p className="text-[10px] text-center text-muted-foreground/40 uppercase font-bold tracking-widest">Computational cost: 42 Tokens</p>
            </div>
          </aside>
        </div>
      </div>
      <SidebarNav />
    </main>
  );
}

const TabItem = ({ label, active, onClick }: any) => (
  <button 
    onClick={onClick}
    className={cn(
      "text-[10px] font-bold uppercase tracking-[0.15em] transition-all relative py-3 group",
      active ? "text-white" : "text-muted-foreground/60 hover:text-foreground"
    )}
  >
    {label}
    <div className={cn(
      "absolute -bottom-4 left-0 right-0 h-0.5 transition-all duration-500",
      active ? "bg-primary shadow-[0_0_15px_rgba(19,127,236,1)] opacity-100" : "bg-white/0 opacity-0 group-hover:bg-white/10 group-hover:opacity-100"
    )} />
  </button>
);

const TimelineStep = ({ year, label, active = false }: any) => (
  <div className="flex flex-col items-center gap-4 relative z-10 group">
    <div className={cn(
      "w-10 h-10 rounded-xl flex items-center justify-center border-2 transition-all duration-500 shadow-xl",
      active ? "bg-primary border-primary text-white scale-110 shadow-primary/20" : "bg-card border-white/5 text-muted-foreground/40 group-hover:border-primary/40"
    )}>
      <span className="text-[10px] font-bold">{year}</span>
    </div>
    <span className={cn("text-[10px] font-bold uppercase tracking-widest", active ? "text-primary" : "text-muted-foreground/30 group-hover:text-muted-foreground")}>{label}</span>
  </div>
);

const TimelinePhase = ({ year, label, active, scenario, description, onClick, expanded, detailedInfo }: any) => (
  <div className="flex flex-col items-center gap-4 relative z-10 group">
    <div 
      onClick={onClick}
      className={cn(
        "w-16 h-16 rounded-2xl flex items-center justify-center border-2 transition-all duration-500 shadow-xl relative overflow-hidden cursor-pointer",
        active 
          ? (scenario === 'baseline' 
            ? "bg-amber-500/20 border-amber-500 text-amber-400 scale-110 shadow-amber-500/30 hover:scale-125" 
            : "bg-primary border-primary text-white scale-110 shadow-primary/30 hover:scale-125")
          : "bg-card border-white/5 text-muted-foreground/40 group-hover:border-primary/30 group-hover:scale-105"
      )}
    >
      <span className="text-xs font-bold z-10">{year}</span>
      {active && (
        <div className={cn(
          "absolute inset-0 animate-pulse",
          scenario === 'baseline' ? "bg-amber-500/10" : "bg-primary/10"
        )} />
      )}
      {expanded && (
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center animate-pulse">
          <Icon name="info" className="text-white text-xs" />
        </div>
      )}
    </div>
    <div className="flex flex-col items-center gap-2 max-w-[120px]">
      <span className={cn(
        "text-[10px] font-bold uppercase tracking-widest text-center",
        active 
          ? (scenario === 'baseline' ? "text-amber-400" : "text-primary")
          : "text-muted-foreground/40 group-hover:text-muted-foreground"
      )}>
        {label}
      </span>
      <p className={cn(
        "text-[9px] text-center leading-tight transition-opacity duration-300",
        active ? "text-muted-foreground opacity-100" : "text-muted-foreground/0 group-hover:opacity-70"
      )}>
        {description}
      </p>
    </div>

    {/* Expanded Detail Modal */}
    {expanded && detailedInfo && typeof window !== 'undefined' && createPortal(
      <div className="fixed inset-0 z-[99999] flex items-center justify-center p-6 animate-in fade-in duration-300" onClick={onClick} style={{ isolation: 'isolate' }}>
        <div className="absolute inset-0 bg-black/60 backdrop-blur-md" />
        <div 
          onClick={(e) => e.stopPropagation()}
          className={cn(
            "relative max-w-2xl w-full max-h-[80vh] overflow-y-auto stitch-card p-8 border-2 shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-8 duration-300 z-10",
            scenario === 'baseline' ? "bg-[#0a1118]/95 backdrop-blur-xl border-amber-500/30" : "bg-[#0a1118]/95 backdrop-blur-xl border-primary/30"
          )}
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-8 pb-6 border-b border-white/10">
            <div className="flex items-center gap-4">
              <div className={cn(
                "w-14 h-14 rounded-2xl flex items-center justify-center border-2",
                scenario === 'baseline' ? "bg-amber-500/20 border-amber-500" : "bg-primary/20 border-primary"
              )}>
                <span className={cn(
                  "text-xl font-bold",
                  scenario === 'baseline' ? "text-amber-400" : "text-white"
                )}>{year}</span>
              </div>
              <div>
                <h3 className={cn(
                  "text-2xl font-bold tracking-tight",
                  scenario === 'baseline' ? "text-amber-400" : "text-primary"
                )}>
                  {detailedInfo.title}
                </h3>
                <span className="text-xs text-muted-foreground/60 uppercase tracking-widest font-bold mt-1 block">
                  {label} Phase
                </span>
              </div>
            </div>
            <button 
              onClick={onClick}
              className="p-2 hover:bg-white/10 rounded-xl transition-all hover:rotate-90 duration-300"
            >
              <Icon name="close" className="text-muted-foreground text-xl" />
            </button>
          </div>

          {/* Key Events */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-5">
              <Icon name="event" className={cn(
                "text-xl",
                scenario === 'baseline' ? "text-amber-400" : "text-primary"
              )} />
              <h4 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Key Events</h4>
            </div>
            <div className="grid grid-cols-1 gap-3">
              {detailedInfo.keyEvents.map((event: string, i: number) => (
                <div key={i} className="group flex items-start gap-4 p-4 bg-white/5 rounded-xl border border-white/5 hover:border-white/10 transition-all hover:bg-white/[0.08]">
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 font-bold text-xs",
                    scenario === 'baseline' ? "bg-amber-500/20 text-amber-400" : "bg-primary/20 text-primary"
                  )}>
                    {i + 1}
                  </div>
                  <span className="text-sm text-foreground/90 leading-relaxed pt-1">{event}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Economic Impact */}
          <div className="mb-8 p-6 bg-gradient-to-br from-white/10 to-white/5 rounded-xl border border-white/10">
            <div className="flex items-center gap-2 mb-4">
              <Icon name="account_balance" className={cn(
                "text-xl",
                scenario === 'baseline' ? "text-amber-400" : "text-primary"
              )} />
              <h4 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Economic Impact</h4>
            </div>
            <p className="text-sm text-foreground/80 leading-relaxed">{detailedInfo.economicImpact}</p>
          </div>

          {/* Stakeholder Impacts */}
          <div>
            <div className="flex items-center gap-2 mb-5">
              <Icon name="groups" className={cn(
                "text-xl",
                scenario === 'baseline' ? "text-amber-400" : "text-primary"
              )} />
              <h4 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Stakeholder Impacts</h4>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {detailedInfo.stakeholders.map((sh: any, i: number) => (
                <div key={i} className="flex items-start gap-4 p-5 bg-gradient-to-br from-white/10 to-white/5 rounded-xl border border-white/5 hover:border-white/10 transition-all group">
                  <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110",
                    sh.sentiment === 'positive' ? "bg-green-500/20 border border-green-500/30" : 
                    sh.sentiment === 'negative' ? "bg-red-500/20 border border-red-500/30" : 
                    "bg-amber-500/20 border border-amber-500/30"
                  )}>
                    <Icon name="person" className={cn(
                      "text-xl",
                      sh.sentiment === 'positive' ? "text-green-400" : 
                      sh.sentiment === 'negative' ? "text-red-400" : 
                      "text-amber-400"
                    )} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-base font-bold text-foreground">{sh.group}</span>
                      <div className={cn(
                        "px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider",
                        sh.sentiment === 'positive' ? "bg-green-500/20 text-green-400" : 
                        sh.sentiment === 'negative' ? "bg-red-500/20 text-red-400" : 
                        "bg-amber-500/20 text-amber-400"
                      )}>
                        {sh.sentiment}
                      </div>
                    </div>
                    <span className="text-sm text-muted-foreground/80 leading-relaxed">{sh.impact}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>,
      document.body
    )}
  </div>
);

const PhaseCard = ({ period, title, color, metrics, description }: any) => {
  const colorClasses = {
    amber: {
      border: 'border-amber-500/20',
      bg: 'bg-amber-500/5',
      text: 'text-amber-400',
      badge: 'bg-amber-500/20 text-amber-300'
    },
    blue: {
      border: 'border-primary/20',
      bg: 'bg-primary/5',
      text: 'text-primary',
      badge: 'bg-primary/20 text-blue-300'
    },
    green: {
      border: 'border-green-500/20',
      bg: 'bg-green-500/5',
      text: 'text-green-400',
      badge: 'bg-green-500/20 text-green-300'
    },
    red: {
      border: 'border-red-500/20',
      bg: 'bg-red-500/5',
      text: 'text-red-400',
      badge: 'bg-red-500/20 text-red-300'
    }
  };
  const colors = colorClasses[color as keyof typeof colorClasses];

  return (
    <div className={cn("stitch-card p-8 flex flex-col gap-6 transition-all hover:scale-[1.02]", colors.border, colors.bg)}>
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/60">{period}</span>
          <h3 className={cn("text-xl font-bold", colors.text)}>{title}</h3>
        </div>
        <div className={cn("px-4 py-2 rounded-lg text-[8px] font-bold uppercase tracking-wider", colors.badge)}>
          {metrics.length} Metrics
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {metrics.map((m: any, i: number) => (
          <div key={i} className="flex flex-col gap-1.5">
            <span className="text-[9px] text-muted-foreground/60 uppercase tracking-wider">{m.label}</span>
            <span className={cn(
              "text-lg font-mono font-bold",
              m.negative ? "text-red-400" : "text-green-400"
            )}>
              {m.value}
            </span>
          </div>
        ))}
      </div>

      <p className="text-sm text-muted-foreground/80 leading-relaxed border-t border-white/5 pt-6">
        {description}
      </p>
    </div>
  );
};

const ImpactBar = ({ label, baselineValue, proposedValue, baselineLabel, proposedLabel }: any) => (
  <div className="flex flex-col gap-3">
    <div className="flex items-center justify-between">
      <span className="text-xs font-bold text-muted-foreground">{label}</span>
      <div className="flex items-center gap-4 text-xs font-mono">
        <span className="text-amber-400">{baselineLabel}</span>
        <span className="text-primary">{proposedLabel}</span>
      </div>
    </div>
    <div className="relative h-12 bg-white/5 rounded-lg overflow-hidden">
      <div 
        className="absolute left-0 top-0 h-full bg-amber-500/30 transition-all duration-700 flex items-center justify-end pr-3"
        style={{ width: `${baselineValue}%` }}
      >
        <span className="text-[9px] font-bold text-amber-300 uppercase tracking-wider opacity-80">Baseline</span>
      </div>
      <div 
        className="absolute left-0 bottom-0 h-6 bg-primary/60 transition-all duration-700 flex items-center justify-end pr-3 shadow-lg"
        style={{ width: `${proposedValue}%` }}
      >
        <span className="text-[9px] font-bold text-white uppercase tracking-wider">Proposed</span>
      </div>
    </div>
  </div>
);

const MiniKPICard = ({ label, value, trend, color }: any) => (
  <div className="stitch-card p-6 flex flex-col gap-3 bg-card-alt/20 hover:bg-card-alt/40 transition-colors">
    <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">{label}</span>
    <div className="flex items-center justify-between">
      <span className="text-2xl font-bold font-mono text-foreground/90 tracking-tight">{value}</span>
      <Icon name={trend === 'up' ? 'trending_up' : 'trending_down'} className={cn("text-2xl", color)} />
    </div>
  </div>
);

const InteractiveKPICard = ({ label, baselineValue, proposedValue, currentValue, trend, icon, color, description, onClick, expanded, detailedBreakdown }: any) => {
  const colorClasses = {
    amber: { bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-400', icon: 'text-amber-500' },
    green: { bg: 'bg-green-500/10', border: 'border-green-500/30', text: 'text-green-400', icon: 'text-green-500' },
    blue: { bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-400', icon: 'text-blue-500' },
    red: { bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-400', icon: 'text-red-500' }
  };
  const colors = colorClasses[color as keyof typeof colorClasses];

  return (
    <div className="relative">
      <div 
        onClick={onClick}
        className={cn(
          "stitch-card p-6 flex flex-col gap-5 transition-all duration-500 cursor-pointer group",
          colors.bg, colors.border,
          expanded ? "scale-105 shadow-2xl" : "hover:scale-105"
        )}
      >
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">{label}</span>
          <div className="flex items-center gap-2">
            <Icon name={icon} className={cn("text-2xl", colors.icon)} />
            {expanded && (
              <div className={cn("w-2 h-2 rounded-full animate-pulse", colors.icon.replace('text', 'bg'))} />
            )}
          </div>
        </div>
        
        <div className="flex flex-col gap-2">
          <span className={cn("text-3xl font-bold font-mono tracking-tight", colors.text)}>
            {currentValue}
          </span>
          <div className="flex items-center gap-2 text-[9px] font-mono text-muted-foreground/60">
            <span>Baseline: {baselineValue}</span>
            <span>•</span>
            <span>Target: {proposedValue}</span>
          </div>
        </div>

        <p className="text-xs text-muted-foreground/70 leading-relaxed border-t border-white/5 pt-4">
          {description}
        </p>

        <div className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest text-muted-foreground/40 group-hover:text-primary transition-colors">
          <Icon name={expanded ? "expand_less" : "expand_more"} className="text-sm" />
          <span>{expanded ? 'Close Details' : 'View Breakdown'}</span>
        </div>
      </div>

      {/* Expanded Detail Panel */}
      {expanded && detailedBreakdown && typeof window !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-6 animate-in fade-in duration-300" style={{ isolation: 'isolate' }} onClick={onClick}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md" />
          <div 
            onClick={(e) => e.stopPropagation()}
            className={cn(
              "relative max-w-3xl w-full max-h-[85vh] overflow-y-auto stitch-card p-10 border-2 shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-8 duration-300",
              "bg-[#0a1118]/95 backdrop-blur-xl",
              colors.border
            )}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-8 pb-6 border-b border-white/10">
              <div className="flex items-center gap-4">
                <div className={cn(
                  "w-16 h-16 rounded-2xl flex items-center justify-center border-2 shadow-lg",
                  colors.bg, colors.border
                )}>
                  <Icon name={icon} className={cn("text-3xl", colors.icon)} />
                </div>
                <div>
                  <h3 className={cn("text-2xl font-bold tracking-tight", colors.text)}>
                    {label} Analysis
                  </h3>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="text-sm text-muted-foreground">Baseline: <span className="font-mono font-bold">{baselineValue}</span></span>
                    <Icon name="arrow_forward" className="text-muted-foreground/40 text-sm" />
                    <span className="text-sm text-muted-foreground">Proposed: <span className={cn("font-mono font-bold", colors.text)}>{proposedValue}</span></span>
                  </div>
                </div>
              </div>
              <button 
                onClick={onClick}
                className="p-2 hover:bg-white/10 rounded-xl transition-all hover:rotate-90 duration-300"
              >
                <Icon name="close" className="text-muted-foreground text-xl" />
              </button>
            </div>

            {/* Growth Drivers */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-6">
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center",
                  colors.bg
                )}>
                  <Icon name="timeline" className={cn("text-xl", colors.icon)} />
                </div>
                <h4 className="text-base font-bold uppercase tracking-widest">Growth Drivers</h4>
              </div>
              <div className="grid grid-cols-1 gap-4">
                {detailedBreakdown.drivers.map((driver: any, i: number) => (
                  <div key={i} className="group flex items-center gap-6 p-5 bg-gradient-to-r from-white/10 to-white/5 rounded-xl border border-white/5 hover:border-white/10 transition-all hover:scale-[1.02]">
                    <div className="flex items-center gap-4 flex-1">
                      <div className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center font-bold",
                        driver.contribution.startsWith('+') ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
                      )}>
                        <span className="text-lg font-mono">{driver.contribution}</span>
                      </div>
                      <div className="flex-1">
                        <div className="text-base font-bold text-foreground mb-1">{driver.factor}</div>
                        <div className="text-xs text-muted-foreground/70">{driver.note}</div>
                      </div>
                    </div>
                    <Icon name="chevron_right" className="text-muted-foreground/20 group-hover:text-primary transition-colors" />
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Key Risks */}
              <div className="p-6 bg-gradient-to-br from-amber-500/10 to-amber-500/5 border-2 border-amber-500/20 rounded-xl">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
                    <Icon name="warning" className="text-xl text-amber-400" />
                  </div>
                  <h4 className="text-sm font-bold uppercase tracking-widest text-amber-400">Key Risks</h4>
                </div>
                <div className="space-y-3">
                  {detailedBreakdown.risks.map((risk: string, i: number) => (
                    <div key={i} className="flex items-start gap-3 p-3 bg-black/20 rounded-lg">
                      <div className="w-6 h-6 rounded-full bg-amber-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs font-bold text-amber-400">{i + 1}</span>
                      </div>
                      <span className="text-sm text-foreground/80 leading-relaxed">{risk}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Comparative Performance */}
              <div className="p-6 bg-gradient-to-br from-white/10 to-white/5 border border-white/10 rounded-xl">
                <div className="flex items-center gap-3 mb-5">
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center",
                    colors.bg
                  )}>
                    <Icon name="compare_arrows" className={cn("text-xl", colors.icon)} />
                  </div>
                  <h4 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Comparative Performance</h4>
                </div>
                <div className="text-center py-8">
                  <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60 mb-3">
                    {detailedBreakdown.comparison.label}
                  </div>
                  <div className="flex items-center justify-center gap-4">
                    <span className={cn(
                      "text-5xl font-mono font-black",
                      detailedBreakdown.comparison.trend === 'positive' ? "text-green-400" : "text-red-400"
                    )}>
                      {detailedBreakdown.comparison.value}
                    </span>
                    <div className={cn(
                      "w-14 h-14 rounded-xl flex items-center justify-center",
                      detailedBreakdown.comparison.trend === 'positive' ? "bg-green-500/20" : "bg-red-500/20"
                    )}>
                      <Icon 
                        name={detailedBreakdown.comparison.trend === 'positive' ? 'trending_up' : 'trending_down'}
                        className={cn(
                          "text-3xl",
                          detailedBreakdown.comparison.trend === 'positive' ? "text-green-400" : "text-red-400"
                        )}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Badge */}
            <div className="flex items-center justify-center gap-3 pt-6 border-t border-white/5">
              <div className="flex -space-x-2">
                <div className="w-8 h-8 rounded-full border-2 border-background-dark bg-blue-500 flex items-center justify-center text-[10px] font-bold shadow-lg">G3</div>
                <div className="w-8 h-8 rounded-full border-2 border-background-dark bg-indigo-500 flex items-center justify-center text-[10px] font-bold shadow-lg">AI</div>
              </div>
              <span className="text-xs text-muted-foreground/60 uppercase tracking-widest font-bold">Powered by Gemini 3 Analysis</span>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

const ImpactDimensionCard = ({ title, icon, color, metrics }: any) => {
  const colorClasses = {
    amber: { border: 'border-amber-500/20', text: 'text-amber-400', progress: 'bg-amber-500' },
    green: { border: 'border-green-500/20', text: 'text-green-400', progress: 'bg-green-500' },
    blue: { border: 'border-blue-500/20', text: 'text-blue-400', progress: 'bg-blue-500' },
    red: { border: 'border-red-500/20', text: 'text-red-400', progress: 'bg-red-500' }
  };
  const colors = colorClasses[color as keyof typeof colorClasses];

  return (
    <div className={cn("stitch-card p-8 flex flex-col gap-6", colors.border)}>
      <div className="flex items-center gap-3">
        <Icon name={icon} className={cn("text-2xl", colors.text)} />
        <h3 className="text-sm font-bold uppercase tracking-widest">{title}</h3>
      </div>

      <div className="space-y-5">
        {metrics.map((m: any, i: number) => (
          <div key={i} className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground/60">{m.label}</span>
              <span className={cn("font-mono font-bold", colors.text)}>{m.value}</span>
            </div>
            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
              <div 
                className={cn("h-full transition-all duration-1000", colors.progress)}
                style={{ width: `${m.progress}%` }}
              />
            </div>
            <span className="text-[9px] text-muted-foreground/40">Target: {m.target}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const RiskCard = ({ level, factor, probability, impact, description }: any) => {
  const levelColors = {
    HIGH: { bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-400', badge: 'bg-red-500/20' },
    MODERATE: { bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-400', badge: 'bg-amber-500/20' },
    LOW: { bg: 'bg-green-500/10', border: 'border-green-500/30', text: 'text-green-400', badge: 'bg-green-500/20' }
  };
  const colors = levelColors[level as keyof typeof levelColors];

  return (
    <div className={cn("stitch-card p-6 flex flex-col gap-5", colors.bg, colors.border)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Icon name="warning" className={cn("text-xl", colors.text)} />
          <span className="text-sm font-bold">{factor}</span>
        </div>
        <div className={cn("px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider", colors.badge, colors.text)}>
          {level}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <span className="text-[9px] text-muted-foreground/60 uppercase tracking-wider">Probability</span>
          <span className={cn("text-lg font-mono font-bold", colors.text)}>{probability}</span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-[9px] text-muted-foreground/60 uppercase tracking-wider">Impact</span>
          <span className={cn("text-lg font-bold", colors.text)}>{impact}</span>
        </div>
      </div>

      <p className="text-xs text-muted-foreground/70 leading-relaxed border-t border-white/5 pt-4">
        {description}
      </p>
    </div>
  );
};
