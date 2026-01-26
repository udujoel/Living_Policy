'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { Icon, TopNav, BottomAction, SidebarNav } from '@/components/SharedUI';
import { cn } from '@/lib/utils';
import { useRouter, useSearchParams } from 'next/navigation';
import { saveAnalysisResult } from '@/lib/storage';

function AnalysisContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fileName = searchParams.get('file') || 'Clean Energy Act 2024';
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [activeTab, setActiveTab] = useState<'document' | 'extraction'>('document');
  const [analysisData, setAnalysisData] = useState<any>(null);

  useEffect(() => {
    const runAnalysis = async () => {
      setIsAnalyzing(true);
      try {
        let contextualText = `Draft Policy: ${fileName}. This regulation mandates a transition to renewable energy by 2030, targeting a 40% mix. It assumes stable federal tax credits and infrastructure upgrades. Budget is capped at $2.5B annually.`;

        // Enhance prompt for the Estonia NECP specifically
        if (fileName.includes('Estonia') || fileName.includes('Energy and Climate Plan')) {
          contextualText = `
            Document: Estonia's National Energy and Climate Plan (NECP) 2030.
            Overview: This plan outlines Estonia's strategy to reach 2030 climate goals. 
            Key Targets: 
            - Reduce greenhouse gas emissions by 70% compared to 1990 levels.
            - Renewable energy must account for at least 42% of final energy consumption.
            - Energy efficiency: final energy consumption should not exceed 32-33 TWh.
            Levers: 
            - Carbon Tax (EU ETS price dependency)
            - Wind Farm Subsidies (Offshore and Onshore)
            - Shale Oil Exit strategy speed
            - Public Transport Electrification budget
            Constraints: 
            - Security of supply (must maintain base load)
            - Socio-economic impact on Ida-Viru county (shale oil workers)
            - Budget ceiling for energy transition: €2.4 Billion.
          `;
        }

        const response = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            policyText: contextualText
          }),
        });
        
        if (!response.ok) {
          console.error('API Error:', response.status, response.statusText);
          throw new Error(`API returned ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Analysis API Response:', data);
        
        // Validate response structure
        if (!data || typeof data !== 'object') {
          console.error('Invalid response format:', data);
          throw new Error('Invalid API response format');
        }
        
        setAnalysisData(data);
        
        // Save for simulator
        saveAnalysisResult({
          fileName,
          data,
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        console.error('Analysis failed', error);
      } finally {
        setIsAnalyzing(false);
      }
    };

    runAnalysis();
  }, [fileName]);

  // Derive jurisdiction from file name
  const getJurisdiction = () => {
    if (fileName.toLowerCase().includes('estonia')) return 'Republic of Estonia';
    if (fileName.toLowerCase().includes('illinois')) return 'State of Illinois';
    if (fileName.toLowerCase().includes('zoning')) return 'Regional Authority';
    return 'Federal Jurisdiction';
  };

  const jurisdiction = getJurisdiction();

  const handleSaveDraft = () => {
    // Only save if data is available
    if (analysisData) {
      saveAnalysisResult({
        fileName,
        data: analysisData,
        timestamp: new Date().toISOString()
      });
      alert('Draft saved successfully to your dashboard.');
    } else {
      alert('Analysis not yet complete. Please wait for the extraction to finish.');
    }
  };

  return (
    <main className="max-container flex flex-col min-h-screen pb-24 lg:pb-0 bg-[#0a1118]">
      <TopNav title="Policy Analysis" />

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden max-w-[1600px] mx-auto w-full">
        {/* Left Side: Policy Context & Tabs */}
        <div className="flex-1 overflow-y-auto flex flex-col">
          <div className="p-6 lg:px-12 lg:py-8 border-b border-white/5 flex flex-col gap-6">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 text-[10px] font-bold text-primary uppercase tracking-widest">
                <span>Project: EcoGrid 2030</span>
                <span className="w-1 h-1 bg-white/20 rounded-full" />
                <span>{jurisdiction}</span>
              </div>
              <h2 className="text-2xl lg:text-4xl font-bold tracking-tight">{fileName}</h2>
            </div>

            <div className="flex gap-8 border-b border-white/5">
              <TabButton label="Document" active={activeTab === 'document'} onClick={() => setActiveTab('document')} />
              <TabButton label="Extraction" badge={12} active={activeTab === 'extraction'} onClick={() => setActiveTab('extraction')} />
            </div>
          </div>

          <div className="flex-1 p-6 lg:p-12">
            {activeTab === 'document' ? (
              <div className="max-w-[800px] mx-auto flex flex-col gap-8">
                <div className="stitch-card p-8 lg:p-16 bg-card-alt/30 border-white/[0.03] leading-loose shadow-2xl relative min-h-[400px]">
                  {isAnalyzing ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-background-dark/50 backdrop-blur-sm z-10">
                      <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
                      <span className="text-xs font-bold uppercase tracking-widest text-primary animate-pulse">AI is parsing document...</span>
                    </div>
                  ) : null}
                  
                  <div className="absolute top-6 left-1/2 -translate-x-1/2 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[8px] font-bold uppercase tracking-widest text-muted-foreground">
                    Document Fragment CE-992-B-01
                  </div>
                  
                  <div className="mt-8 text-lg lg:text-2xl font-serif text-foreground/90 leading-[1.8] tracking-tight">
                    {fileName.includes('Estonia') ? (
                      <>
                        <p className="mb-8">
                          The <span className="border-b-2 border-primary/40 pb-0.5 cursor-help hover:bg-primary/10 transition-colors">National Energy and Climate Plan 2030</span> (NECP) represents Estonia's primary strategy for climate neutrality. It mandates that <span className="px-1.5 rounded-sm border font-bold not-italic bg-primary/20 text-primary-foreground border-primary/30">42% of final energy consumption</span> must be renewable by 2030.
                        </p>
                        <p className="mb-8">
                          A critical path involves the <span className="px-1.5 rounded-sm border font-bold not-italic bg-amber-500/20 text-amber-200 border-amber-500/30">phased exit from oil shale</span> electricity production, targeting a complete transition to wind and biomass base-loads. 
                        </p>
                        <p>
                          Total investment needs for the transition are estimated at <span className="border-b-2 border-primary/40 pb-0.5">€2.4 Billion</span>, with a focus on regional development in the Ida-Viru district to ensure a <span className="text-primary font-bold underline decoration-primary/30">just transition</span> for affected labor markets.
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="mb-8">
                          The primary <span className="border-b-2 border-primary/40 pb-0.5 cursor-help hover:bg-primary/10 transition-colors">objective of this legislation</span> is to mandate that at least <span className="px-1.5 rounded-sm border font-bold not-italic bg-primary/20 text-primary-foreground border-primary/30">40% of the state's total energy consumption</span> is derived from certified renewable sources by the fiscal year ending in 2030.
                        </p>
                        <p className="mb-8">
                          This transition model operates under the <span className="px-1.5 rounded-sm border font-bold not-italic bg-amber-500/20 text-amber-200 border-amber-500/30">critical assumption</span> that federal investment tax credits (<span className="border-b-2 border-primary/40 pb-0.5">ITC</span>) for offshore wind and solar storage will remain at current levels or increase through 2028.
                        </p>
                        <p>
                          Furthermore, the simulation assumes that <span className="border-b-2 border-primary/40 pb-0.5">interstate grid infrastructure</span> will undergo planned upgrades to handle variable loads. Primary stakeholders identified include <span className="text-primary font-bold underline decoration-primary/30">Regional Utility Providers</span> and <span className="text-primary font-bold underline decoration-primary/30">Municipal Planning Committees</span>.
                        </p>
                      </>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-white/5 border border-white/5 p-6 rounded-2xl flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Baseline Rate</span>
                    <span className="text-3xl font-bold font-mono text-white">14.2%</span>
                  </div>
                  <div className="bg-primary/10 border border-primary/20 p-6 rounded-2xl flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Target Delta</span>
                    <span className="text-3xl font-bold font-mono text-primary">+25.8%</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="max-w-[800px] mx-auto flex flex-col gap-10">
                {isAnalyzing ? (
                  <div className="flex flex-col items-center justify-center gap-6 py-20">
                    <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
                    <div className="flex flex-col gap-2 text-center">
                      <span className="text-sm font-bold uppercase tracking-widest text-primary animate-pulse">Extracting Policy Data...</span>
                      <span className="text-xs text-muted-foreground">This may take 10-30 seconds</span>
                    </div>
                  </div>
                ) : (
                  <>
                    <ExtractionSection title="Goals" icon="flag" color="text-blue-400">
                      {analysisData?.goals?.length > 0 ? (
                        analysisData.goals.map((g: any) => (
                          <ExtractionCard 
                            key={g.id}
                            title={g.title} 
                            desc={`Metric: ${g.metric}. Target: ${g.target_deadline || 'N/A'}`} 
                            status="success"
                            source={g.source_para}
                          />
                        ))
                      ) : (
                        <div className="stitch-card p-8 bg-white/[0.02] border-white/5 flex items-center justify-center gap-3">
                          <Icon name="info" className="text-muted-foreground text-xl" />
                          <span className="text-sm text-muted-foreground italic">No goals extracted. The AI may not have identified clear policy goals in the document.</span>
                        </div>
                      )}
                    </ExtractionSection>

                    <ExtractionSection title="Levers" icon="tune" color="text-primary">
                      {analysisData?.levers?.length > 0 ? (
                        analysisData.levers.map((l: any) => (
                          <ExtractionCard 
                            key={l.id}
                            title={l.name} 
                            desc={l.description} 
                            status="success"
                          />
                        ))
                      ) : (
                        <div className="stitch-card p-8 bg-white/[0.02] border-white/5 flex items-center justify-center gap-3">
                          <Icon name="info" className="text-muted-foreground text-xl" />
                          <span className="text-sm text-muted-foreground italic">No levers extracted. The AI may not have identified adjustable policy parameters.</span>
                        </div>
                      )}
                    </ExtractionSection>

                    <ExtractionSection title="Constraints" icon="warning" color="text-red-400">
                      {analysisData?.constraints?.length > 0 ? (
                        analysisData.constraints.map((c: any) => (
                          <ExtractionCard 
                            key={c.id}
                            title={c.type.toUpperCase()} 
                            desc={c.description} 
                          />
                        ))
                      ) : (
                        <div className="stitch-card p-8 bg-white/[0.02] border-white/5 flex items-center justify-center gap-3">
                          <Icon name="info" className="text-muted-foreground text-xl" />
                          <span className="text-sm text-muted-foreground italic">No constraints extracted. The AI may not have identified limiting factors.</span>
                        </div>
                      )}
                    </ExtractionSection>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Action Panel (Desktop Sticky) */}
        <div className="p-6 lg:p-12 lg:w-[400px] flex flex-col gap-6 lg:bg-card-alt/10 lg:border-l border-white/5">
          <div className="flex flex-col gap-4 mt-auto">
            <button 
              onClick={handleSaveDraft}
              className="stitch-button-secondary w-full py-4 flex items-center justify-center gap-3 text-base font-bold uppercase tracking-widest hover:bg-white/10 transition-colors"
            >
              <Icon name="save" className="text-xl" />
              <span>Save Draft</span>
            </button>
            <button 
              onClick={() => {
                setIsConfirming(true);
                setTimeout(() => router.push(`/simulator/1?file=${fileName}`), 1500);
              }}
              disabled={isConfirming}
              className={cn(
                "stitch-button-primary w-full py-4 flex items-center justify-center gap-3 text-base font-bold uppercase tracking-widest shadow-2xl shadow-primary/20 transition-all",
                isConfirming && "opacity-80"
              )}
            >
              {isConfirming ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Icon name="play_arrow" className="text-xl" />
              )}
              <span>{isConfirming ? "Processing..." : "Confirm & Simulate"}</span>
            </button>
          </div>
        </div>
      </div>
      <SidebarNav />
    </main>
  );
}

export default function AnalysisPage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center text-white bg-[#0a1118]">Loading Analysis...</div>}>
      <AnalysisContent />
    </Suspense>
  );
}

const TabButton = ({ label, badge, active, onClick }: any) => (
  <button 
    onClick={onClick}
    className={cn(
      "pb-4 text-xs font-bold uppercase tracking-widest transition-all relative flex items-center gap-2",
      active ? "text-white" : "text-muted-foreground hover:text-foreground"
    )}
  >
    {label}
    {badge && (
      <span className={cn(
        "px-1.5 py-0.5 rounded text-[8px] font-mono",
        active ? "bg-primary text-white" : "bg-white/10 text-muted-foreground"
      )}>
        {badge}
      </span>
    )}
    {active && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary shadow-[0_0_10px_rgba(19,127,236,0.8)]" />}
  </button>
);

const ExtractionSection = ({ title, icon, color, children }: any) => (
  <div className="flex flex-col gap-4">
    <div className="flex items-center gap-2 ml-1">
      <Icon name={icon} className={cn("text-lg", color)} />
      <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{title}</h3>
    </div>
    <div className="flex flex-col gap-3">
      {children}
    </div>
  </div>
);

const ExtractionCard = ({ title, desc, status, source, progress, progressColor }: any) => (
  <div className="stitch-card p-5 bg-card-alt/40 border-white/5 hover:border-primary/20 transition-all group">
    <div className="flex items-start justify-between gap-4">
      <div className="flex flex-col gap-1 min-w-0">
        <h4 className="text-base font-bold text-foreground/90 group-hover:text-white transition-colors">{title}</h4>
        <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
      </div>
      {status === 'success' && <Icon name="check_circle" className="text-green-400 text-lg shrink-0" />}
      {source && (
        <span className="text-[8px] font-bold uppercase bg-primary/10 text-primary px-1.5 py-0.5 rounded border border-primary/20 shrink-0">
          {source}
        </span>
      )}
    </div>
    {progress !== undefined && (
      <div className="mt-4 flex flex-col gap-2">
        <div className="flex justify-between items-center text-[8px] font-bold uppercase tracking-tighter text-muted-foreground">
          <span>AI Confidence</span>
          <span>{progress}%</span>
        </div>
        <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
          <div className={cn("h-full rounded-full transition-all duration-1000", progressColor)} style={{ width: `${progress}%` }} />
        </div>
      </div>
    )}
  </div>
);

const Tag = ({ label }: { label: string }) => (
  <span className="px-2 py-1 bg-white/5 border border-white/10 rounded-md text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
    {label}
  </span>
);
