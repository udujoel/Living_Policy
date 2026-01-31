'use client';

import React, { useState, useEffect, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { Icon, TopNav, BottomAction, SearchBar, SidebarNav } from '@/components/SharedUI';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { SimulationResult as StoredSim } from '@/lib/storage';
import { generatePolicyPDF } from '@/lib/pdf-gen';
import { GeoRegionalImpact } from '@/components/MapVisualization';

// Dynamically import the MapVisualization component with SSR disabled
const MapVisualization = dynamic(() => import('@/components/MapVisualization'), {
  ssr: false,
  loading: () => <div className="w-full h-full flex items-center justify-center bg-[#0d141b] text-muted-foreground text-xs uppercase tracking-widest">Loading Interactive Map...</div>
});

const DEFAULT_REGIONAL_DATA: GeoRegionalImpact[] = [
  { 
    region_name: "Urban Core (Tallinn)", 
    coordinates: { x: "59.4370", y: "24.7536" },
    coords: [59.4370, 24.7536],
    polygon: [
      [59.48, 24.65], [59.48, 24.85], [59.38, 24.85], [59.38, 24.65]
    ],
    impact_score: 8, 
    status: "High Benefit", 
    key_metrics: [
      { label: "Econ Lift", value: "+14%", trend: "up" },
      { label: "Carbon", value: "-8%", trend: "down" }
    ],
    summary: "Strong economic growth driven by green tech adoption, though housing pressure rises." 
  },
  { 
    region_name: "Suburban Ring (Harju)", 
    coordinates: { x: "59.3000", y: "24.9000" },
    coords: [59.3000, 24.9000], 
    polygon: [
      [59.38, 24.60], [59.45, 25.10], [59.20, 25.20], [59.15, 24.50]
    ],
    impact_score: -2, 
    status: "Moderate Risk", 
    key_metrics: [
      { label: "Housing", value: "+5%", trend: "up" },
      { label: "Commute", value: "+2m", trend: "up" }
    ],
    summary: "Housing costs increase due to displacement from urban core; transit upgrades lagging." 
  },
  { 
    region_name: "Industrial District (Ida-Viru)", 
    coordinates: { x: "59.3797", y: "27.4191" },
    coords: [59.3797, 27.4191], 
    polygon: [
      [59.45, 27.00], [59.45, 28.20], [59.00, 28.20], [59.00, 27.00]
    ],
    impact_score: 5, 
    status: "Moderate Benefit", 
    key_metrics: [
      { label: "Jobs", value: "+200", trend: "up" },
      { label: "Energy", value: "-12%", trend: "down" }
    ],
    summary: "Transition to cleaner energy reduces costs, but requires workforce retraining." 
  },
  { 
    region_name: "Rural Outskirts (Tartu/South)", 
    coordinates: { x: "58.3780", y: "26.7290" },
    coords: [58.3780, 26.7290], 
    polygon: [
      [58.50, 26.40], [58.50, 27.00], [58.20, 27.00], [58.20, 26.40]
    ],
    impact_score: 0, 
    status: "Neutral", 
    key_metrics: [
      { label: "Transport", value: "0%", trend: "stable" },
      { label: "Agri-Yield", value: "+1%", trend: "up" }
    ],
    summary: "Minimal direct impact; slight benefit from regional supply chain improvements." 
  }
];

function MapPageContent() {
  const router = useRouter();
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [activeLayer, setActiveLayer] = useState('heatmap');
  const [regionalData, setRegionalData] = useState<GeoRegionalImpact[]>(DEFAULT_REGIONAL_DATA);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [fullSimulation, setFullSimulation] = useState<StoredSim | null>(null);
  const [mapAction, setMapAction] = useState<string | null>(null);

  // Load logic
  useEffect(() => {
    try {
      const stored = localStorage.getItem('lps_simulations');
      if (stored) {
        const allSims: StoredSim[] = JSON.parse(stored);
        if (allSims.length > 0) {
           allSims.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
           const latestSim = allSims[0];
           setFullSimulation(latestSim);
           // Merge loaded data with geo data if possible
           if (latestSim.data && latestSim.data.regional_analysis) {
             const merged = DEFAULT_REGIONAL_DATA.map(geo => {
               const found = latestSim.data.regional_analysis.find((r: any) => r.region_name.includes(geo.region_name.split(' ')[0]));
               return found ? { ...geo, ...found } : geo;
             });
             setRegionalData(merged);
           }
        }
      }
    } catch (e) { console.error(e); }
  }, []);

  const handleGenerateReport = () => {
    setIsGeneratingReport(true);
    if (fullSimulation && fullSimulation.data) {
      try {
        generatePolicyPDF(fullSimulation.data);
        setTimeout(() => setIsGeneratingReport(false), 1000);
      } catch (e) { setIsGeneratingReport(false); }
    } else {
        setTimeout(() => router.push('/report'), 2000);
    }
  };

  const getColor = (status: string) => {
    const s = status.toLowerCase();
    if (s.includes('high benefit')) return '#22c55e'; // green-500
    if (s.includes('moderate benefit')) return '#4ade80'; // green-400
    if (s.includes('risk')) return '#ef4444'; // red-500
    if (s.includes('neutral')) return '#94a3b8'; // slate-400
    return '#f59e0b'; // amber-500
  };

  const [activeFilter, setActiveFilter] = useState('Economic');

  const filteredData = regionalData.filter(r => {
      if (activeFilter === 'Economic') return true; 
      if (activeFilter === 'Eco-Health') return r.key_metrics.some(m => m.label.includes('Carbon') || m.label.includes('Energy'));
      if (activeFilter === 'Infrastructure') return r.key_metrics.some(m => m.label.includes('Commute') || m.label.includes('Transport'));
      if (activeFilter === 'Demographic') return r.key_metrics.some(m => m.label.includes('Jobs') || m.label.includes('Housing'));
      return true;
  });

  return (
    <main className="max-container flex flex-col h-screen overflow-hidden pb-20 lg:pb-0 bg-[#0a1118]">
      <TopNav title="Geospatial Impact Map" />

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative max-w-[1800px] mx-auto w-full">
        {/* Sidebar: Regional Analysis */}
        <aside className="hidden lg:flex w-[400px] border-r border-white/5 bg-background-dark/50 backdrop-blur-xl p-8 flex-col gap-10 z-20 overflow-y-auto">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-1">
              <h2 className="text-[10px] font-bold uppercase tracking-widest text-primary">Spatial Search</h2>
              <SearchBar placeholder="Enter jurisdiction or zip code..." />
            </div>
            
            <div className="flex flex-wrap gap-2">
              <FilterChip label="Economic" active={activeFilter === 'Economic'} onClick={() => setActiveFilter('Economic')} />
              <FilterChip label="Demographic" active={activeFilter === 'Demographic'} onClick={() => setActiveFilter('Demographic')} />
              <FilterChip label="Infrastructure" active={activeFilter === 'Infrastructure'} onClick={() => setActiveFilter('Infrastructure')} />
              <FilterChip label="Eco-Health" active={activeFilter === 'Eco-Health'} onClick={() => setActiveFilter('Eco-Health')} />
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <h2 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Regional Analysis</h2>
              <span className="text-[10px] font-bold text-primary px-2 py-0.5 bg-primary/10 rounded">{filteredData.length} Regions</span>
            </div>

            {/* Aggregate Summary */}
            <div className="p-4 bg-primary/5 border border-primary/10 rounded-xl animate-in fade-in slide-in-from-top-2 duration-500">
                 <h3 className="text-[10px] font-bold uppercase tracking-widest text-primary mb-1">
                    {activeFilter} Impact Overview
                 </h3>
                 <p className="text-xs text-muted-foreground leading-relaxed">
                    {activeFilter === 'Economic' ? "Overall positive growth (avg +12%) concentrated in urban hubs, with rural lag requiring targeted subsidies." :
                     activeFilter === 'Eco-Health' ? "Significant reduction in carbon emissions (-15%) across industrial zones, improving local air quality index by 22 points." :
                     activeFilter === 'Infrastructure' ? "Transit bottlenecks identified in suburban rings require $4B investment to match population inflow." :
                     "Demographic shifts indicate younger workforce migration to tech-centric districts, aging population in outskirts."}
                 </p>
            </div>

            <div className="flex flex-col gap-4">
              {filteredData.map((region, idx) => (
                <RegionalAnalysisCard 
                  key={idx}
                  name={region.region_name}
                  status={region.status}
                  metrics={region.key_metrics}
                  color={getColor(region.status)}
                  isSelected={selectedRegion === region.region_name}
                  expanded={selectedRegion === region.region_name}
                  onClick={() => setSelectedRegion(selectedRegion === region.region_name ? null : region.region_name)}
                />
              ))}
            </div>
          </div>

          <div className="mt-auto pt-6 border-t border-white/5">
            <button 
              onClick={handleGenerateReport}
              disabled={isGeneratingReport}
              className={cn(
                "stitch-button-primary w-full flex items-center justify-center gap-3 py-5 text-sm font-bold uppercase tracking-widest transition-all shadow-2xl shadow-primary/20",
                isGeneratingReport && "opacity-80"
              )}
            >
              {isGeneratingReport ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Icon name="description" className="text-xl" />
              )}
              <span>{isGeneratingReport ? "Finalizing Analysis..." : "Generate Final Report"}</span>
            </button>
          </div>
        </aside>

        {/* Real Map Viewport */}
        <div className="flex-1 relative overflow-hidden bg-[#0d141b] z-10">
          <MapVisualization 
            data={filteredData}
            selectedRegion={selectedRegion}
            setSelectedRegion={setSelectedRegion}
            activeLayer={activeLayer}
            mapAction={mapAction}
            setMapAction={setMapAction}
            getColor={getColor}
          />
          
          {/* Layer Controls */}
          <div className="absolute left-8 bottom-8 z-[1000] flex flex-col gap-2 pointer-events-auto">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-white mb-2 shadow-black drop-shadow-md">Map Layers</h4>
            <div className="bg-background-dark/80 backdrop-blur-xl border border-white/10 p-2 rounded-xl flex gap-2 shadow-2xl">
              <LayerBtn active={activeLayer === 'heatmap'} onClick={() => setActiveLayer('heatmap')} label="Heatmap" />
              <LayerBtn active={activeLayer === 'infrastructure'} onClick={() => setActiveLayer('infrastructure')} label="Infra" />
              <LayerBtn active={activeLayer === 'demographic'} onClick={() => setActiveLayer('demographic')} label="Demo" />
            </div>
          </div>
          
          {/* Zoom Controls */}
          <div className="absolute right-8 top-8 lg:top-12 flex flex-col gap-3 z-[1000] pointer-events-auto">
            <MapActionBtn icon="add" label="Zoom In" onClick={() => setMapAction('zoomIn')} />
            <MapActionBtn icon="remove" label="Zoom Out" onClick={() => setMapAction('zoomOut')} />
            <div className="h-4" />
            <MapActionBtn icon="my_location" label="Re-center" onClick={() => setMapAction('reCenter')} />
          </div>

          {/* Mobile Overlay Search & Legend */}
          <div className="lg:hidden absolute top-6 left-6 right-6 flex flex-col gap-4 z-[1000] pointer-events-none">
            <div className="pointer-events-auto">
                <SearchBar placeholder="Search jurisdiction..." className="shadow-2xl shadow-black/50" />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none pointer-events-auto">
              <FilterChip label="Economic" active={activeFilter === 'Economic'} onClick={() => setActiveFilter('Economic')} />
              <FilterChip label="Eco-Health" active={activeFilter === 'Eco-Health'} onClick={() => setActiveFilter('Eco-Health')} />
              <FilterChip label="Demographic" active={activeFilter === 'Demographic'} onClick={() => setActiveFilter('Demographic')} />
            </div>
          </div>

          <div className="lg:hidden absolute bottom-6 left-6 right-6 z-[1000] pointer-events-none">
            {selectedRegion && (
                <div className="pointer-events-auto">
                    <RegionalAnalysisCard 
                    name={selectedRegion}
                    status={regionalData.find(r => r.region_name === selectedRegion)?.status}
                    metrics={regionalData.find(r => r.region_name === selectedRegion)?.key_metrics}
                    color={getColor(regionalData.find(r => r.region_name === selectedRegion)?.status || 'Neutral')}
                    compact
                    expanded={true}
                    onClick={() => setSelectedRegion(null)}
                    />
                </div>
            )}
          </div>
        </div>

        <div className="lg:hidden">
          <BottomAction 
            label={isGeneratingReport ? "Preparing Report..." : "Generate Final Report"} 
            icon="description" 
            onClick={handleGenerateReport}
          />
        </div>
      </div>
      <SidebarNav />
    </main>
  );
}

// Wrapper for Suspense
export default function MapPage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center bg-[#0a1118] text-white">Loading Map Data...</div>}>
      <MapPageContent />
    </Suspense>
  );
}

const LayerBtn = ({ active, onClick, label }: any) => (
  <button 
    onClick={onClick}
    className={cn(
      "px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all",
      active ? "bg-primary text-white" : "text-muted-foreground hover:text-foreground hover:bg-white/5"
    )}
  >
    {label}
  </button>
);

const RegionalAnalysisCard = ({ name, status, metrics, color, compact = false, isSelected, onClick, expanded = false }: any) => (
  <div 
    onClick={onClick}
    className={cn(
    "stitch-card group hover:border-white/10 transition-all cursor-pointer overflow-hidden",
    compact ? "p-4 bg-background-dark/90 backdrop-blur-md" : "p-6 bg-card-alt/20",
    isSelected && "border-primary/50 bg-primary/5 shadow-[0_0_30px_rgba(19,127,236,0.1)]"
  )}>
    <div className="flex justify-between items-start mb-4">
      <div className="flex flex-col">
        <h4 className="font-bold text-sm lg:text-base">{name}</h4>
        <span className={cn(
          "text-[10px] font-bold uppercase tracking-widest",
          color === '#22c55e' ? "text-green-400" : color === '#f59e0b' ? "text-amber-400" : color === '#ef4444' ? "text-red-400" : "text-muted-foreground"
        )}>
          {status}
        </span>
      </div>
      <div className={cn(
        "w-2 h-2 rounded-full",
        color === '#22c55e' ? "bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.5)]" : 
        color === '#f59e0b' ? "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.5)]" :
        color === '#ef4444' ? "bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.5)]" :
        "bg-white/20"
      )} />
    </div>

    <div className="grid grid-cols-2 gap-4">
      {metrics?.map((m: any, i: number) => (
        <div key={i} className="flex flex-col bg-white/5 p-2 rounded-lg border border-white/5">
          <span className="text-[8px] font-bold text-muted-foreground uppercase">{m.label}</span>
          <span className="text-xs font-bold font-mono text-foreground/90">{m.value}</span>
        </div>
      ))}
    </div>

    {/* Expanded Analysis */}
    <div className={cn("grid transition-all duration-500 ease-in-out", expanded ? "grid-rows-[1fr] opacity-100 mt-6 pt-6 border-t border-white/5" : "grid-rows-[0fr] opacity-0")}>
       <div className="overflow-hidden flex flex-col gap-4">
         <h5 className="text-[10px] font-bold uppercase tracking-widest text-primary">Deep Dive Analysis</h5>
         <p className="text-xs text-muted-foreground leading-relaxed">
           Specific impact assessment for {name} indicates a correlation between the proposed policy and local {metrics?.[0]?.label.toLowerCase() || 'economic'} factors. 
           Projected outcome suggests {status.toLowerCase()} over the next 5 years.
         </p>
         <div className="flex gap-2">
            <span className="px-2 py-1 bg-white/5 rounded text-[8px] font-bold uppercase text-muted-foreground">Demographics</span>
            <span className="px-2 py-1 bg-white/5 rounded text-[8px] font-bold uppercase text-muted-foreground">Infra</span>
         </div>
       </div>
    </div>
  </div>
);

const MapActionBtn = ({ icon, label, active = false, onClick }: any) => (
  <div className="relative group">
    <button 
      onClick={onClick}
      className={cn(
      "w-12 h-12 rounded-xl flex items-center justify-center border transition-all shadow-2xl",
      active ? "bg-primary border-primary text-white" : "bg-card-alt/90 backdrop-blur-xl border-white/10 text-muted-foreground hover:text-foreground"
    )}>
      <Icon name={icon} className="text-xl" />
    </button>
    <div className="absolute right-14 top-1/2 -translate-y-1/2 px-2 py-1 bg-background-dark border border-white/10 rounded text-[8px] font-bold uppercase tracking-widest text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
      {label}
    </div>
  </div>
);

const FilterChip = ({ label, active = false, onClick }: { label: string, active?: boolean, onClick?: () => void }) => (
  <button 
    onClick={onClick}
    className={cn(
    "px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest border transition-all shadow-lg backdrop-blur-md",
    active ? "bg-primary border-primary text-white" : "bg-card-alt/80 border-white/10 text-muted-foreground hover:text-foreground"
  )}>
    {label}
  </button>
);
