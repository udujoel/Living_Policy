'use client';

import React, { useState, useEffect, Suspense, useMemo } from 'react';
import { Icon, TopNav, BottomAction, SearchBar, SidebarNav } from '@/components/SharedUI';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { SimulationResult as SimData, RegionalImpact } from '@/lib/types';
import { SimulationResult as StoredSim } from '@/lib/storage';
import { generatePolicyPDF } from '@/lib/pdf-gen';

// Dynamically import map components (prevents SSR issues with Leaflet)
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
);
const CircleMarker = dynamic(
  () => import('react-leaflet').then((mod) => mod.CircleMarker),
  { ssr: false }
);

// Default Estonia coordinates (center of Estonia)
const DEFAULT_CENTER: [number, number] = [58.5953, 25.0136];
const DEFAULT_ZOOM = 7;

// Enhanced default regional data with real Estonian coordinates
const DEFAULT_REGIONAL_DATA: RegionalImpact[] = [
  {
    region_name: "Tallinn (Urban Core)",
    coordinates: { x: "35%", y: "42%", lat: 59.4370, lng: 24.7536 },
    impact_score: 8,
    status: "High Benefit",
    key_metrics: [
      { label: "Econ Lift", value: "+14%", trend: "up", category: "Economic" },
      { label: "Carbon", value: "-8%", trend: "down", category: "Eco-Health" },
      { label: "Jobs", value: "+3,200", trend: "up", category: "Economic" },
      { label: "Transit", value: "+25%", trend: "up", category: "Infrastructure" }
    ],
    summary: "Strong economic growth driven by green tech adoption, though housing pressure rises.",
    detailed_analysis: "Tallinn experiences the most significant positive impact from renewable energy policies. Green technology sector growth creates thousands of high-paying jobs. However, increased demand drives housing costs up by 12%. Public transportation electrification reduces emissions by 8%.",
    population_affected: 434562,
    economic_impact: "+€2.4B GDP",
    timeframe: "2025-2030"
  },
  {
    region_name: "Tartu (University Hub)",
    coordinates: { x: "62%", y: "58%", lat: 58.3780, lng: 26.7290 },
    impact_score: 6,
    status: "Moderate Benefit",
    key_metrics: [
      { label: "R&D Growth", value: "+18%", trend: "up", category: "Economic" },
      { label: "Student Jobs", value: "+450", trend: "up", category: "Demographic" },
      { label: "Energy Cost", value: "-5%", trend: "down", category: "Economic" },
      { label: "Air Quality", value: "+12%", trend: "up", category: "Eco-Health" }
    ],
    summary: "University research partnerships drive clean energy innovation, benefiting local economy.",
    detailed_analysis: "Tartu's university sector receives increased funding for renewable energy research. Student employment in green tech startups rises significantly. Lower energy costs benefit residential areas. Air quality improvements reduce healthcare costs.",
    population_affected: 97124,
    economic_impact: "+€340M GDP",
    timeframe: "2026-2032"
  },
  {
    region_name: "Ida-Viru (Industrial)",
    coordinates: { x: "48%", y: "25%", lat: 59.3550, lng: 27.4239 },
    impact_score: -2,
    status: "Moderate Risk",
    key_metrics: [
      { label: "Job Loss", value: "-1,200", trend: "down", category: "Economic" },
      { label: "Retraining", value: "+800", trend: "up", category: "Demographic" },
      { label: "Emissions", value: "-22%", trend: "down", category: "Eco-Health" },
      { label: "Investment", value: "+€150M", trend: "up", category: "Economic" }
    ],
    summary: "Shale oil phase-out creates short-term job losses but opens paths for green industry transition.",
    detailed_analysis: "The oil shale region faces significant workforce disruption as traditional energy jobs decline. However, €150M in transition funding supports retraining programs. New solar and wind projects begin absorbing displaced workers by 2028. Environmental health improves dramatically.",
    population_affected: 136249,
    economic_impact: "-€420M short-term, +€890M long-term",
    timeframe: "2025-2035"
  },
  {
    region_name: "Pärnu (Coastal)",
    coordinates: { x: "75%", y: "30%", lat: 58.3859, lng: 24.4971 },
    impact_score: 5,
    status: "Moderate Benefit",
    key_metrics: [
      { label: "Tourism", value: "+8%", trend: "up", category: "Economic" },
      { label: "Coastal Jobs", value: "+340", trend: "up", category: "Economic" },
      { label: "Wind Energy", value: "+45MW", trend: "up", category: "Infrastructure" },
      { label: "Sea Health", value: "+15%", trend: "up", category: "Eco-Health" }
    ],
    summary: "Offshore wind development boosts economy while improving coastal environmental health.",
    detailed_analysis: "Pärnu benefits from offshore wind farm development, creating construction and maintenance jobs. Improved water quality attracts more tourists. Local businesses see revenue increases. Renewable energy powers 60% of coastal infrastructure by 2030.",
    population_affected: 85292,
    economic_impact: "+€180M GDP",
    timeframe: "2027-2033"
  },
  {
    region_name: "Viljandi (Rural)",
    coordinates: { x: "55%", y: "65%", lat: 58.3639, lng: 25.5900 },
    impact_score: 3,
    status: "Moderate Benefit",
    key_metrics: [
      { label: "Agri-Tech", value: "+12%", trend: "up", category: "Economic" },
      { label: "Rural Grid", value: "+28%", trend: "up", category: "Infrastructure" },
      { label: "Biomass", value: "+35%", trend: "up", category: "Eco-Health" },
      { label: "Population", value: "-2%", trend: "down", category: "Demographic" }
    ],
    summary: "Rural electrification and biomass projects improve energy access, but youth migration continues.",
    detailed_analysis: "Agricultural technology adoption increases farm productivity. Biomass energy projects provide new income streams for farmers. However, urban job opportunities continue attracting younger residents. Grid modernization enables rural electric vehicle adoption.",
    population_affected: 46957,
    economic_impact: "+€85M GDP",
    timeframe: "2026-2034"
  }
];

function MapPageContent() {
  const router = useRouter();
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [activeLayer, setActiveLayer] = useState('heatmap');
  const [regionalData, setRegionalData] = useState<RegionalImpact[]>(DEFAULT_REGIONAL_DATA);
  const [selectedRegion, setSelectedRegion] = useState<RegionalImpact | null>(null);
  const [fullSimulation, setFullSimulation] = useState<StoredSim | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [mapCenter, setMapCenter] = useState<[number, number]>(DEFAULT_CENTER);
  const [mapZoom, setMapZoom] = useState(DEFAULT_ZOOM);

  useEffect(() => {
    // Load simulation data from local storage if available
    try {
      const stored = localStorage.getItem('lps_simulations');
      if (stored) {
        const allSims: StoredSim[] = JSON.parse(stored);
        if (allSims.length > 0) {
           allSims.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
           const latestSim = allSims[0];
           setFullSimulation(latestSim);
           if (latestSim.data && latestSim.data.regional_analysis && latestSim.data.regional_analysis.length > 0) {
             // Merge with default data to ensure coordinates exist
             const mergedData = latestSim.data.regional_analysis.map((region, idx) => ({
               ...region,
               coordinates: {
                 ...region.coordinates,
                 lat: region.coordinates.lat || DEFAULT_REGIONAL_DATA[idx % DEFAULT_REGIONAL_DATA.length]?.coordinates.lat,
                 lng: region.coordinates.lng || DEFAULT_REGIONAL_DATA[idx % DEFAULT_REGIONAL_DATA.length]?.coordinates.lng,
               }
             }));
             setRegionalData(mergedData);
           }
        }
      } else {
        const saved = localStorage.getItem('simulationResult');
        if (saved) {
            const data: StoredSim = JSON.parse(saved);
            setFullSimulation(data);
            if (data.data && data.data.regional_analysis && data.data.regional_analysis.length > 0) {
                setRegionalData(data.data.regional_analysis);
            }
        }
      }
    } catch (e) {
      console.error("Failed to parse simulation data", e);
    }
  }, []);

  const handleGenerateReport = () => {
    setIsGeneratingReport(true);

    if (fullSimulation && fullSimulation.data) {
      try {
        generatePolicyPDF(fullSimulation.data);
        setTimeout(() => {
             setIsGeneratingReport(false);
        }, 1000);
      } catch (e) {
        console.error("PDF Gen Failed", e);
        setIsGeneratingReport(false);
      }
    } else if (fullSimulation && (fullSimulation as any).outcomes) {
         try {
            generatePolicyPDF(fullSimulation as any);
            setTimeout(() => { setIsGeneratingReport(false); }, 1000);
         } catch (e) { setIsGeneratingReport(false); }
    } else {
        setTimeout(() => {
          router.push('/report');
        }, 2000);
    }
  };

  const getColor = (status: string) => {
    const s = status.toLowerCase();
    if (s.includes('high benefit')) return 'green';
    if (s.includes('moderate benefit')) return 'green';
    if (s.includes('risk')) return 'red';
    if (s.includes('neutral')) return 'gray';
    return 'amber';
  };

  const getMarkerColor = (status: string) => {
    const s = status.toLowerCase();
    if (s.includes('high benefit')) return '#4ade80';
    if (s.includes('moderate benefit')) return '#86efac';
    if (s.includes('risk')) return '#f87171';
    if (s.includes('neutral')) return '#9ca3af';
    return '#fbbf24';
  };

  const getMarkerRadius = (score: number) => {
    return Math.abs(score) * 3 + 10; // Scale marker size based on impact score
  };

  // Working search functionality
  const filteredRegions = useMemo(() => {
    let regions = [...regionalData];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      regions = regions.filter(region =>
        region.region_name.toLowerCase().includes(query) ||
        region.summary.toLowerCase().includes(query) ||
        region.status.toLowerCase().includes(query) ||
        region.key_metrics.some(m => m.label.toLowerCase().includes(query))
      );
    }

    // Apply category filters
    if (activeFilters.length > 0) {
      regions = regions.filter(region => {
        return region.key_metrics.some(metric =>
          metric.category && activeFilters.includes(metric.category)
        );
      });
    }

    return regions;
  }, [regionalData, searchQuery, activeFilters]);

  const toggleFilter = (filter: string) => {
    setActiveFilters(prev =>
      prev.includes(filter)
        ? prev.filter(f => f !== filter)
        : [...prev, filter]
    );
  };

  const handleRegionClick = (region: RegionalImpact) => {
    setSelectedRegion(region);
    setShowDetailModal(true);
    // Center map on selected region
    if (region.coordinates.lat && region.coordinates.lng) {
      setMapCenter([region.coordinates.lat, region.coordinates.lng]);
      setMapZoom(10);
    }
  };

  const getHeatmapOpacity = (layer: string) => {
    return activeLayer === layer ? 1 : 0;
  };

  return (
    <main className="max-container flex flex-col h-screen overflow-hidden pb-20 lg:pb-0 bg-[#0a1118]">
      <TopNav title="Geospatial Impact Map" />

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative max-w-[1800px] mx-auto w-full">
        {/* Sidebar: Regional Analysis */}
        <aside className="hidden lg:flex w-[400px] border-r border-white/5 bg-background-dark/50 backdrop-blur-xl p-8 flex-col gap-10 z-20 overflow-y-auto">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-1">
              <h2 className="text-[10px] font-bold uppercase tracking-widest text-primary">Spatial Search</h2>
              <input
                type="text"
                placeholder="Search regions, metrics, status..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 bg-card-alt/40 border border-white/10 rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
              />
              {searchQuery && (
                <p className="text-[10px] text-muted-foreground mt-1">
                  {filteredRegions.length} region{filteredRegions.length !== 1 ? 's' : ''} found
                </p>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              <FilterChip
                label="Economic"
                active={activeFilters.includes('Economic')}
                onClick={() => toggleFilter('Economic')}
              />
              <FilterChip
                label="Demographic"
                active={activeFilters.includes('Demographic')}
                onClick={() => toggleFilter('Demographic')}
              />
              <FilterChip
                label="Infrastructure"
                active={activeFilters.includes('Infrastructure')}
                onClick={() => toggleFilter('Infrastructure')}
              />
              <FilterChip
                label="Eco-Health"
                active={activeFilters.includes('Eco-Health')}
                onClick={() => toggleFilter('Eco-Health')}
              />
              {activeFilters.length > 0 && (
                <button
                  onClick={() => setActiveFilters([])}
                  className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-red-400 hover:text-red-300 transition-colors"
                >
                  Clear All
                </button>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <h2 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Regional Analysis</h2>
              <span className="text-[10px] font-bold text-primary px-2 py-0.5 bg-primary/10 rounded">
                {filteredRegions.length} Region{filteredRegions.length !== 1 ? 's' : ''}
              </span>
            </div>

            <div className="flex flex-col gap-4">
              {filteredRegions.map((region, idx) => (
                <RegionalAnalysisCard
                  key={idx}
                  region={region}
                  color={getColor(region.status)}
                  isSelected={selectedRegion?.region_name === region.region_name}
                  onClick={() => handleRegionClick(region)}
                  activeFilters={activeFilters}
                />
              ))}
              {filteredRegions.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Icon name="search_off" className="text-4xl mb-2" />
                  <p className="text-sm">No regions match your filters</p>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setActiveFilters([]);
                    }}
                    className="mt-4 text-xs text-primary hover:underline"
                  >
                    Clear all filters
                  </button>
                </div>
              )}
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

        {/* Map Viewport with Real Leaflet Integration */}
        <div className="flex-1 relative overflow-hidden bg-[#0d141b]">
          {typeof window !== 'undefined' && (
            <MapContainer
              center={mapCenter}
              zoom={mapZoom}
              className="w-full h-full z-10"
              zoomControl={false}
            >
              {/* Different tile layers based on active layer */}
              {activeLayer === 'heatmap' && (
                <TileLayer
                  url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                />
              )}
              {activeLayer === 'infrastructure' && (
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  className="grayscale opacity-60"
                />
              )}
              {activeLayer === 'demographic' && (
                <TileLayer
                  url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                />
              )}

              {/* Dynamic markers from regional data */}
              {filteredRegions.map((region, idx) => {
                if (!region.coordinates.lat || !region.coordinates.lng) return null;

                return (
                  <CircleMarker
                    key={idx}
                    center={[region.coordinates.lat, region.coordinates.lng]}
                    radius={getMarkerRadius(region.impact_score)}
                    fillColor={getMarkerColor(region.status)}
                    color="white"
                    weight={2}
                    opacity={0.8}
                    fillOpacity={0.6}
                    eventHandlers={{
                      click: () => handleRegionClick(region)
                    }}
                  >
                    <Popup>
                      <div className="text-sm">
                        <h3 className="font-bold mb-1">{region.region_name}</h3>
                        <p className="text-xs text-gray-600 mb-2">{region.status}</p>
                        <div className="text-xs space-y-1">
                          {region.key_metrics.slice(0, 3).map((m, i) => (
                            <div key={i} className="flex justify-between gap-2">
                              <span className="text-gray-600">{m.label}:</span>
                              <span className="font-semibold">{m.value}</span>
                            </div>
                          ))}
                        </div>
                        <button
                          onClick={() => handleRegionClick(region)}
                          className="mt-2 text-xs text-blue-600 hover:underline"
                        >
                          View Details →
                        </button>
                      </div>
                    </Popup>
                  </CircleMarker>
                );
              })}
            </MapContainer>
          )}

          {/* Layer Control */}
          <div className="absolute left-8 bottom-8 z-[1000] flex flex-col gap-2">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-white mb-2">Map Layers</h4>
            <div className="bg-background-dark/80 backdrop-blur-xl border border-white/10 p-2 rounded-xl flex gap-2">
              <LayerBtn
                active={activeLayer === 'heatmap'}
                onClick={() => setActiveLayer('heatmap')}
                label="Dark"
              />
              <LayerBtn
                active={activeLayer === 'infrastructure'}
                onClick={() => setActiveLayer('infrastructure')}
                label="Infra"
              />
              <LayerBtn
                active={activeLayer === 'demographic'}
                onClick={() => setActiveLayer('demographic')}
                label="Light"
              />
            </div>
          </div>

          {/* Zoom/Map Controls */}
          <div className="absolute right-8 top-8 lg:top-12 flex flex-col gap-3 z-[1000]">
            <MapActionBtn
              icon="my_location"
              label="Reset View"
              onClick={() => {
                setMapCenter(DEFAULT_CENTER);
                setMapZoom(DEFAULT_ZOOM);
              }}
            />
            <div className="h-px bg-white/10" />
            <MapActionBtn
              icon="layers"
              label="Layers"
              active={true}
            />
          </div>

          {/* Mobile Overlay */}
          <div className="lg:hidden absolute top-6 left-6 right-6 flex flex-col gap-4 z-[1000]">
            <input
              type="text"
              placeholder="Search regions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 bg-card-alt/90 backdrop-blur-xl border border-white/10 rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 shadow-2xl shadow-black/50"
            />
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
              <FilterChip
                label="Economic"
                active={activeFilters.includes('Economic')}
                onClick={() => toggleFilter('Economic')}
              />
              <FilterChip
                label="Eco-Health"
                active={activeFilters.includes('Eco-Health')}
                onClick={() => toggleFilter('Eco-Health')}
              />
              <FilterChip
                label="Demographic"
                active={activeFilters.includes('Demographic')}
                onClick={() => toggleFilter('Demographic')}
              />
            </div>
          </div>
        </div>

        {/* Region Detail Modal */}
        {showDetailModal && selectedRegion && (
          <RegionDetailModal
            region={selectedRegion}
            onClose={() => {
              setShowDetailModal(false);
              setSelectedRegion(null);
            }}
          />
        )}

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

const RegionalAnalysisCard = ({ region, color, isSelected, onClick, activeFilters }: any) => {
  // Filter metrics based on active filters
  const displayMetrics = activeFilters.length > 0
    ? region.key_metrics.filter((m: any) => activeFilters.includes(m.category))
    : region.key_metrics.slice(0, 4);

  return (
    <div
      onClick={onClick}
      className={cn(
        "stitch-card group hover:border-white/10 transition-all cursor-pointer p-6 bg-card-alt/20",
        isSelected && "border-primary/50 bg-primary/5"
      )}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex flex-col">
          <h4 className="font-bold text-sm lg:text-base">{region.region_name}</h4>
          <span className={cn(
            "text-[10px] font-bold uppercase tracking-widest",
            color === 'green' ? "text-green-400" :
            color === 'amber' ? "text-amber-400" :
            color === 'red' ? "text-red-400" : "text-muted-foreground"
          )}>
            {region.status}
          </span>
        </div>
        <div className={cn(
          "w-2 h-2 rounded-full",
          color === 'green' ? "bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.5)]" :
          color === 'amber' ? "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.5)]" :
          color === 'red' ? "bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.5)]" :
          "bg-white/20"
        )} />
      </div>

      <div className="grid grid-cols-2 gap-4 mb-3">
        {displayMetrics.map((m: any, i: number) => (
          <div key={i} className="flex flex-col bg-white/5 p-2 rounded-lg border border-white/5">
            <span className="text-[8px] font-bold text-muted-foreground uppercase">{m.label}</span>
            <span className="text-xs font-bold font-mono text-foreground/90">{m.value}</span>
          </div>
        ))}
      </div>

      <p className="text-xs text-muted-foreground line-clamp-2">{region.summary}</p>

      <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-[10px]">
        <span className="text-muted-foreground">Impact Score</span>
        <span className={cn(
          "font-bold font-mono",
          region.impact_score > 5 ? "text-green-400" :
          region.impact_score < 0 ? "text-red-400" : "text-amber-400"
        )}>
          {region.impact_score > 0 ? '+' : ''}{region.impact_score}
        </span>
      </div>
    </div>
  );
};

const MapActionBtn = ({ icon, label, active = false, onClick }: any) => (
  <div className="relative group">
    <button
      onClick={onClick}
      className={cn(
        "w-12 h-12 rounded-xl flex items-center justify-center border transition-all shadow-2xl",
        active ? "bg-primary border-primary text-white" : "bg-card-alt/90 backdrop-blur-xl border-white/10 text-muted-foreground hover:text-foreground"
      )}
    >
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
      "px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest border transition-all shadow-lg backdrop-blur-md whitespace-nowrap",
      active ? "bg-primary border-primary text-white" : "bg-card-alt/80 border-white/10 text-muted-foreground hover:text-foreground"
    )}
  >
    {label}
  </button>
);

// Region Detail Modal Component
const RegionDetailModal = ({ region, onClose }: { region: RegionalImpact, onClose: () => void }) => {
  return (
    <div
      className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-background-dark border border-white/10 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-background-dark/95 backdrop-blur-xl border-b border-white/10 p-6 flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-1">{region.region_name}</h2>
            <span className={cn(
              "text-xs font-bold uppercase tracking-widest",
              region.status.includes('Benefit') ? "text-green-400" :
              region.status.includes('Risk') ? "text-red-400" : "text-amber-400"
            )}>
              {region.status}
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-lg bg-card-alt/40 hover:bg-card-alt/60 border border-white/10 flex items-center justify-center transition-colors"
          >
            <Icon name="close" className="text-xl" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Key Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-card-alt/20 border border-white/5 rounded-xl p-4">
              <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">
                Impact Score
              </div>
              <div className={cn(
                "text-2xl font-bold font-mono",
                region.impact_score > 5 ? "text-green-400" :
                region.impact_score < 0 ? "text-red-400" : "text-amber-400"
              )}>
                {region.impact_score > 0 ? '+' : ''}{region.impact_score}/10
              </div>
            </div>
            {region.population_affected && (
              <div className="bg-card-alt/20 border border-white/5 rounded-xl p-4">
                <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">
                  Population
                </div>
                <div className="text-2xl font-bold font-mono">
                  {region.population_affected.toLocaleString()}
                </div>
              </div>
            )}
            {region.economic_impact && (
              <div className="bg-card-alt/20 border border-white/5 rounded-xl p-4">
                <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">
                  Economic Impact
                </div>
                <div className="text-lg font-bold font-mono">
                  {region.economic_impact}
                </div>
              </div>
            )}
          </div>

          {/* Summary */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-3">
              Summary
            </h3>
            <p className="text-sm text-foreground/90 leading-relaxed">
              {region.summary}
            </p>
          </div>

          {/* Detailed Analysis */}
          {region.detailed_analysis && (
            <div>
              <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-3">
                Detailed Analysis
              </h3>
              <p className="text-sm text-foreground/90 leading-relaxed">
                {region.detailed_analysis}
              </p>
            </div>
          )}

          {/* Key Metrics */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-3">
              Key Metrics
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {region.key_metrics.map((metric, idx) => (
                <div key={idx} className="bg-card-alt/20 border border-white/5 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-xs font-bold text-muted-foreground uppercase">
                      {metric.label}
                    </span>
                    {metric.category && (
                      <span className="text-[8px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold uppercase">
                        {metric.category}
                      </span>
                    )}
                  </div>
                  <div className="flex items-end justify-between">
                    <span className="text-xl font-bold font-mono">{metric.value}</span>
                    <Icon
                      name={metric.trend === 'up' ? 'trending_up' : metric.trend === 'down' ? 'trending_down' : 'trending_flat'}
                      className={cn(
                        "text-lg",
                        metric.trend === 'up' ? "text-green-400" :
                        metric.trend === 'down' ? "text-red-400" : "text-gray-400"
                      )}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Timeframe */}
          {region.timeframe && (
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <Icon name="schedule" className="text-primary text-xl" />
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-primary mb-1">
                    Implementation Timeframe
                  </div>
                  <div className="text-sm font-semibold">{region.timeframe}</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 bg-background-dark/95 backdrop-blur-xl border-t border-white/10 p-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 bg-card-alt/40 hover:bg-card-alt/60 border border-white/10 rounded-xl font-bold text-sm uppercase tracking-widest transition-colors"
          >
            Close
          </button>
          <button
            className="flex-1 px-6 py-3 stitch-button-primary font-bold text-sm uppercase tracking-widest flex items-center justify-center gap-2"
          >
            <Icon name="download" />
            Export Data
          </button>
        </div>
      </div>
    </div>
  );
};
