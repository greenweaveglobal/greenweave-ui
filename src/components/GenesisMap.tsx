import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default leaflet marker icon issue in React
delete (L.Icon.Default.prototype as any)._getIconUrl;

const customMarkerIcon = L.divIcon({
  className: 'custom-div-icon',
  html: '<div class="w-4 h-4 bg-green-500 rounded-full animate-ping shadow-[0_0_15px_rgba(34,197,94,1)]"></div><div class="absolute top-0 left-0 w-4 h-4 bg-green-500 rounded-full"></div>',
  iconSize: [16, 16],
  iconAnchor: [8, 8]
});

const genesisPosition: [number, number] = [11.53, 106.88];

export default function GenesisMap() {
  return (
    <div className="w-full h-full max-w-4xl mx-auto flex flex-col p-4 animate-in fade-in zoom-in-95 duration-500 flex-1">
      <div className="text-sm font-bold tracking-[0.3em] text-[#39FF14] uppercase mb-4 px-4 py-2 border border-[#39FF14]/30 bg-[#39FF14]/10 self-start">
        [ MAP MODULE: ACTIVE ]
      </div>
      <div className="flex-1 w-full relative border border-[#39FF14]/30 rounded-lg overflow-hidden shadow-[0_0_30px_rgba(57,255,20,0.1)]">
        <MapContainer 
          center={genesisPosition} 
          zoom={8} 
          scrollWheelZoom={false} 
          className="w-full h-full"
          style={{ background: '#0a0a0a' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://carto.com/">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />
          <Marker position={genesisPosition} icon={customMarkerIcon}>
            <Popup className="genesis-popup">
              <div className="bg-black border-l-2 border-[#39FF14] p-3 text-[#39FF14] font-mono text-xs uppercase tracking-widest shadow-[0_0_10px_rgba(57,255,20,0.2)]">
                <div className="font-bold mb-1">[ GENESIS NODE: ACTIVE ]</div>
                <div className="text-[#39FF14]/80">Layer 0 Biomass Anchored.</div>
              </div>
            </Popup>
          </Marker>
        </MapContainer>
      </div>
      <style>{`
        /* Overriding default leaflet popup styles to match the dark theme */
        .leaflet-popup-content-wrapper {
          background: transparent !important;
          box-shadow: none !important;
          padding: 0 !important;
          border-radius: 0 !important;
        }
        .leaflet-popup-tip-container {
          display: none !important;
        }
        .leaflet-popup-content {
          margin: 0 !important;
        }
        .leaflet-container a.leaflet-popup-close-button {
          color: #39FF14 !important;
          top: 6px !important;
          right: 6px !important;
        }
      `}</style>
    </div>
  );
}
