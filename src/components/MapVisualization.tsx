'use client';

import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Polygon, Popup, CircleMarker, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { RegionalImpact } from '@/lib/types';

// Fix Leaflet icon issue in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export interface GeoRegionalImpact extends RegionalImpact {
  coords: [number, number];
  polygon: [number, number][];
}

interface MapVisualizationProps {
  data: GeoRegionalImpact[];
  selectedRegion: string | null;
  setSelectedRegion: (region: string | null) => void;
  activeLayer: string;
  mapAction: string | null;
  setMapAction: (action: string | null) => void;
  getColor: (status: string) => string;
}

function MapController({ action, onComplete }: { action: string | null, onComplete: () => void }) {
  const map = useMap();
  
  useEffect(() => {
    if (!action) return;
    if (action === 'zoomIn') map.zoomIn();
    if (action === 'zoomOut') map.zoomOut();
    if (action === 'reCenter') map.setView([58.8, 25.5], 7);
    onComplete();
  }, [action, map, onComplete]);

  return null;
}

const MapVisualization = ({ 
  data, 
  selectedRegion, 
  setSelectedRegion, 
  activeLayer, 
  mapAction, 
  setMapAction, 
  getColor 
}: MapVisualizationProps) => {
  return (
    <MapContainer 
      center={[58.8, 25.5]} 
      zoom={7} 
      className="w-full h-full"
      style={{ background: '#0d141b' }}
      zoomControl={false}
    >
      <MapController action={mapAction} onComplete={() => setMapAction(null)} />
      
      {/* Dark Mode Tile Layer */}
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      />

      {/* Regions Polygons */}
      {data.map((region, idx) => {
        const color = getColor(region.status);
        const isSelected = selectedRegion === region.region_name;
        
        return (
          <React.Fragment key={idx}>
            {/* The Region Shape */}
            <Polygon 
              positions={region.polygon}
              pathOptions={{ 
                color: color, 
                fillColor: color, 
                fillOpacity: isSelected ? 0.4 : 0.2, 
                weight: isSelected ? 2 : 1 
              }}
              eventHandlers={{
                click: () => setSelectedRegion(region.region_name)
              }}
            >
               {/* Always show tooltip if selected, or on hover via default behavior (title not supported on polygon, using Popup) */}
               {isSelected && (
                 <Popup closeButton={false} autoClose={false}>
                    <div className="p-2 min-w-[150px]">
                      <h4 className="font-bold text-sm mb-1 text-black">{region.region_name}</h4>
                      <span className="text-xs font-bold px-2 py-0.5 rounded bg-gray-200 text-black">{region.status}</span>
                      <div className="mt-2 text-xs text-gray-600">
                         {region.key_metrics.map((m, i) => (
                           <div key={i}>{m.label}: <b>{m.value}</b></div>
                         ))}
                      </div>
                    </div>
                 </Popup>
               )}
            </Polygon>

            {/* Heatmap Layer - Circles */}
            {activeLayer === 'heatmap' && (
              <CircleMarker 
                center={region.coords} 
                pathOptions={{ color: color, fillColor: color, fillOpacity: 0.3, weight: 0 }}
                radius={isSelected ? 60 : 40}
                eventHandlers={{ click: () => setSelectedRegion(region.region_name) }}
              />
            )}
          </React.Fragment>
        );
      })}

      {/* Infrastructure Layer - Connecting Lines */}
      {activeLayer === 'infrastructure' && (
        <Polyline 
          positions={data.map(r => r.coords)} 
          pathOptions={{ color: '#137fec', weight: 2, dashArray: '5, 10', opacity: 0.5 }} 
        />
      )}

    </MapContainer>
  );
};

export default MapVisualization;
