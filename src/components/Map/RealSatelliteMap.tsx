import React, { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { AOIScenario, HotspotBeacon, ScaleLevel } from '../../types';
import { 
  Scan, 
  EyeOff, 
  AlertTriangle, 
  CheckCircle2, 
  Waves, 
  TrendingDown, 
  Maximize2,
  Navigation
} from 'lucide-react';

interface RealSatelliteMapProps {
  currentAOI: AOIScenario;
  scaleLevel: ScaleLevel;
  wavelengthPct: number;
  isLoupeActive: boolean;
  selectedHotspot: HotspotBeacon | null;
  onSelectHotspot: (hotspot: HotspotBeacon) => void;
  isMitigationActive: boolean;
  closurePhaseShieldActive: boolean;
  isBreakItNoiseActive: boolean;
  timeEpochIndex: number;
}

export const RealSatelliteMap: React.FC<RealSatelliteMapProps> = ({
  currentAOI,
  scaleLevel,
  wavelengthPct,
  isLoupeActive,
  selectedHotspot,
  onSelectHotspot,
  isMitigationActive,
  closurePhaseShieldActive,
  isBreakItNoiseActive,
  timeEpochIndex,
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 300, y: 250 });

  // 2,500 animated hydraulic particles
  const particlesRef = useRef<Array<{
    lat: number;
    lng: number;
    vLat: number;
    vLng: number;
    life: number;
    maxLife: number;
    stagnant: boolean;
  }>>([]);

  // Initialize particles around AOI center
  useEffect(() => {
    const pts = [];
    const count = 1800;
    const centerLat = currentAOI.coordinates.lat;
    const centerLng = currentAOI.coordinates.lng;

    for (let i = 0; i < count; i++) {
      pts.push({
        lat: centerLat + (Math.random() - 0.5) * 0.16,
        lng: centerLng + (Math.random() - 0.5) * 0.22,
        vLat: (Math.random() - 0.5) * 0.0004,
        vLng: (Math.random() - 0.5) * 0.0004,
        life: Math.random() * 80,
        maxLife: 70 + Math.random() * 70,
        stagnant: false,
      });
    }
    particlesRef.current = pts;
  }, [currentAOI.aoiId]);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [currentAOI.coordinates.lat, currentAOI.coordinates.lng],
      zoom: currentAOI.coordinates.zoom || 12,
      zoomControl: false,
      attributionControl: false,
    });

    // Dark-mode satellite & cartographic basemap tiles
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      className: 'dark-satellite-filter',
    }).addTo(map);

    // Zoom controls at bottom-right
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update map view when AOI changes
  useEffect(() => {
    if (!mapRef.current) return;
    mapRef.current.flyTo(
      [currentAOI.coordinates.lat, currentAOI.coordinates.lng],
      currentAOI.coordinates.zoom || 12,
      { duration: 1.2 }
    );
  }, [currentAOI.aoiId]);

  // Update Numbered Beacons (①, ②, ③, ④) on map
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    // Clear old markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    currentAOI.hotspots.forEach((hs) => {
      const isSelected = selectedHotspot?.id === hs.id;
      const isCritical = hs.type === 'critical' && !isMitigationActive;

      const iconHtml = `
        <div class="relative group cursor-pointer -translate-x-1/2 -translate-y-1/2">
          <!-- Pulse ring -->
          <div class="absolute inset-0 rounded-full ${
            isCritical ? 'bg-rose-500/40 animate-ping' : 'bg-cyan-400/30 animate-pulse'
          }"></div>
          
          <!-- Numbered circle beacon -->
          <div class="relative w-8 h-8 rounded-full flex items-center justify-center font-mono font-black text-xs shadow-2xl transition-all duration-200 border-2 ${
            isSelected
              ? 'bg-cyan-electric text-slate-950 border-white scale-125 shadow-glow-cyan'
              : isCritical
              ? 'bg-rose-600 text-white border-rose-300 animate-bounce'
              : 'bg-slate-900/90 text-cyan-electric border-cyan-400 hover:scale-110'
          }">
            ${hs.number === 1 ? '①' : hs.number === 2 ? '②' : hs.number === 3 ? '③' : '④'}
          </div>

          <!-- Short 2-word pill label underneath -->
          <div class="absolute top-9 left-1/2 -translate-x-1/2 whitespace-nowrap px-2 py-0.5 rounded-md font-mono text-[10px] font-bold border backdrop-blur-md shadow-lg ${
            isSelected
              ? 'bg-cyan-electric/90 text-slate-950 border-white'
              : isCritical
              ? 'bg-rose-950/80 text-rose-200 border-rose-500'
              : 'bg-slate-950/80 text-slate-200 border-cyan-500/40'
          }">
            ${hs.shortName}
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        html: iconHtml,
        className: 'custom-beacon-icon',
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const marker = L.marker([hs.lat, hs.lng], { icon: customIcon }).addTo(map);

      marker.on('click', () => {
        onSelectHotspot(hs);
      });

      markersRef.current.push(marker);
    });
  }, [currentAOI.aoiId, selectedHotspot, isMitigationActive]);

  // Track mouse position over canvas for X-Ray Loupe
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!mapContainerRef.current) return;
    const rect = mapContainerRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  // 60-FPS Overlay Canvas Renderer: Clouds, Sub-Canopy Floods, InSAR Fringes, Flow Particles & Loupe
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !mapRef.current) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let frame = 0;

    const render = () => {
      frame++;
      const map = mapRef.current;
      if (!map) return;

      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      const opticalOpacity = Math.max(0, 1 - (wavelengthPct / 100)); // 1.0 at 0%
      const lBandOpacity = wavelengthPct / 100; // 1.0 at 100%

      // 1. Draw Glowing Sub-Canopy Radar Inundation Polygons (at 100% L-Band or inside Loupe)
      if (lBandOpacity > 0.1 || isLoupeActive) {
        ctx.save();

        // Project center of AOI
        const centerPt = map.latLngToContainerPoint([
          currentAOI.coordinates.lat,
          currentAOI.coordinates.lng,
        ]);

        // Draw sub-canopy flood lake basin
        ctx.beginPath();
        const lakeR = 90;
        ctx.arc(centerPt.x - 40, centerPt.y - 30, lakeR, 0, Math.PI * 2);
        ctx.fillStyle = isMitigationActive ? 'rgba(0, 230, 118, 0.16)' : 'rgba(0, 240, 255, 0.24)';
        ctx.fill();
        ctx.strokeStyle = isMitigationActive ? '#00E676' : '#00F0FF';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Stagnant Embankment Trap Polygon
        const trapPt = map.latLngToContainerPoint([
          currentAOI.hotspots[1]?.lat || currentAOI.coordinates.lat,
          currentAOI.hotspots[1]?.lng || currentAOI.coordinates.lng,
        ]);
        ctx.beginPath();
        ctx.arc(trapPt.x, trapPt.y, 65, 0, Math.PI * 2);
        ctx.fillStyle = isMitigationActive ? 'rgba(0, 230, 118, 0.18)' : 'rgba(255, 30, 86, 0.3)';
        ctx.fill();
        ctx.strokeStyle = isMitigationActive ? '#00E676' : '#FF1E56';
        ctx.lineWidth = 2;
        ctx.stroke();

        // 2. Neon InSAR Subsidence / Creep Rings (MICRO Scale)
        if (scaleLevel === 'MICRO') {
          const subPt = map.latLngToContainerPoint([
            currentAOI.hotspots[2]?.lat || currentAOI.coordinates.lat,
            currentAOI.hotspots[2]?.lng || currentAOI.coordinates.lng,
          ]);

          const rings = 4;
          for (let i = 1; i <= rings; i++) {
            const r = (i * 22 + (frame * 0.4)) % 90;
            ctx.beginPath();
            ctx.arc(subPt.x, subPt.y, r, 0, Math.PI * 2);
            ctx.strokeStyle = isMitigationActive ? 'rgba(0, 230, 118, 0.4)' : 'rgba(255, 42, 133, 0.7)';
            ctx.lineWidth = 1.6;
            ctx.setLineDash([6, 4]);
            ctx.stroke();
            ctx.setLineDash([]);
          }
        }

        ctx.restore();
      }

      // 3. Render 1,800 Flow Particles moving along river / topography (MESO / MACRO)
      if (scaleLevel === 'MESO' || scaleLevel === 'MACRO') {
        const pts = particlesRef.current;
        const centerPt = map.latLngToContainerPoint([
          currentAOI.coordinates.lat,
          currentAOI.coordinates.lng,
        ]);

        for (let i = 0; i < pts.length; i++) {
          const p = pts[i];
          p.lat += p.vLat;
          p.lng += p.vLng;
          p.life++;

          if (p.life > p.maxLife) {
            p.lat = currentAOI.coordinates.lat + (Math.random() - 0.5) * 0.14;
            p.lng = currentAOI.coordinates.lng + (Math.random() - 0.5) * 0.18;
            p.life = 0;
          }

          const pt = map.latLngToContainerPoint([p.lat, p.lng]);

          // Stagnation check
          const distToBottleneck = Math.hypot(pt.x - centerPt.x, pt.y - centerPt.y);
          const isStagnant = distToBottleneck < 60 && !isMitigationActive;

          ctx.beginPath();
          ctx.arc(pt.x, pt.y, isStagnant ? 2.4 : 1.4, 0, Math.PI * 2);

          if (isStagnant) {
            ctx.fillStyle = '#FF1E56';
          } else if (isMitigationActive) {
            ctx.fillStyle = 'rgba(0, 230, 118, 0.8)';
          } else {
            ctx.fillStyle = 'rgba(0, 240, 255, 0.75)';
          }
          ctx.fill();
        }
      }

      // 4. Draw Optical Volumetric Monsoon Clouds & Smoke (Near 0% Wavelength)
      if (opticalFactor > 0.05) {
        ctx.save();

        if (isLoupeActive) {
          // Circular Loupe Mask: cutout circle at mouse pos
          ctx.beginPath();
          ctx.rect(0, 0, width, height);
          ctx.arc(mousePos.x, mousePos.y, 90, 0, Math.PI * 2, true);
          ctx.clip();
        }

        // Cloudy haze
        const grad = ctx.createRadialGradient(width / 2, height / 2, 40, width / 2, height / 2, width * 0.6);
        grad.addColorStop(0, `rgba(240, 248, 255, ${0.75 * opticalFactor})`);
        grad.addColorStop(0.6, `rgba(195, 215, 235, ${0.6 * opticalFactor})`);
        grad.addColorStop(1, `rgba(120, 150, 180, ${0.3 * opticalFactor})`);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);

        // Cumulus puffs
        for (let i = 0; i < 7; i++) {
          const cx = (width / 2 + Math.sin(frame * 0.003 + i * 1.4) * 200 + i * 60) % width;
          const cy = (height / 2 + Math.cos(frame * 0.002 + i * 1.2) * 120 + i * 50) % height;
          ctx.beginPath();
          ctx.arc(cx, cy, 140, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${0.32 * opticalFactor})`;
          ctx.fill();
        }

        ctx.restore();
      }

      // 5. Split-Screen X-Ray Loupe Reticle
      if (isLoupeActive) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(mousePos.x, mousePos.y, 90, 0, Math.PI * 2);
        ctx.strokeStyle = '#00F0FF';
        ctx.lineWidth = 2.4;
        ctx.shadowColor = '#00F0FF';
        ctx.shadowBlur = 14;
        ctx.stroke();

        // Crosshairs
        ctx.beginPath();
        ctx.moveTo(mousePos.x - 14, mousePos.y);
        ctx.lineTo(mousePos.x + 14, mousePos.y);
        ctx.moveTo(mousePos.x, mousePos.y - 14);
        ctx.lineTo(mousePos.x, mousePos.y + 14);
        ctx.strokeStyle = 'rgba(0, 240, 255, 0.85)';
        ctx.lineWidth = 1.2;
        ctx.stroke();

        // Badge
        ctx.fillStyle = 'rgba(3, 7, 14, 0.9)';
        ctx.fillRect(mousePos.x + 16, mousePos.y + 16, 134, 24);
        ctx.strokeStyle = 'rgba(0, 240, 255, 0.5)';
        ctx.strokeRect(mousePos.x + 16, mousePos.y + 16, 134, 24);
        ctx.font = '10px "JetBrains Mono"';
        ctx.fillStyle = '#00F0FF';
        ctx.fillText('24cm RADAR X-RAY', mousePos.x + 22, mousePos.y + 32);

        ctx.restore();
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [
    currentAOI.aoiId,
    scaleLevel,
    wavelengthPct,
    isLoupeActive,
    isMitigationActive,
    closurePhaseShieldActive,
    isBreakItNoiseActive,
    mousePos,
  ]);

  // Handle Canvas Resize
  useEffect(() => {
    const handleResize = () => {
      if (!canvasRef.current || !mapContainerRef.current) return;
      const rect = mapContainerRef.current.getBoundingClientRect();
      canvasRef.current.width = rect.width;
      canvasRef.current.height = rect.height;
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div 
      ref={mapContainerRef}
      onMouseMove={handleMouseMove}
      className="relative w-full h-full overflow-hidden select-none bg-[#03070E] rounded-xl border border-cyan-electric/25 shadow-2xl"
    >
      {/* 60 FPS Physics Overlay Canvas (Layered over real Leaflet satellite map) */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none z-10 w-full h-full block"
      />

      {/* Optical Satellite Blinded Banner (Top-Center) */}
      {wavelengthPct < 30 && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 pointer-events-none flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/50 backdrop-blur-md text-amber-300 text-[11px] font-mono font-bold tracking-wider animate-pulse shadow-glow-amber">
          <EyeOff className="w-3.5 h-3.5 text-amber-400" />
          <span>☁️ Normal Camera View: 92% Blocked by Monsoon Storm Clouds</span>
        </div>
      )}

      {/* Active Hotspot Banner (Top-Left of Map - Zero Overlap!) */}
      {selectedHotspot && (
        <div className="absolute top-3 left-3 z-20 max-w-sm p-2.5 rounded-xl bg-slate-950/90 backdrop-blur-xl border border-cyan-electric/40 shadow-2xl flex flex-col gap-1 pointer-events-auto">
          <div className="flex items-center justify-between border-b border-border-hairline pb-1">
            <span className="text-[10px] font-mono font-bold text-cyan-electric flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full bg-cyan-electric text-slate-950 flex items-center justify-center font-bold text-[9px]">
                {selectedHotspot.number}
              </span>
              <span>HOTSPOT: {selectedHotspot.name}</span>
            </span>
            <span className="text-[8.5px] font-mono font-bold px-1.5 py-0.2 rounded bg-surface-elevated text-emerald-recovery border border-emerald-recovery/40">
              {selectedHotspot.metricValue}
            </span>
          </div>
          <p className="text-[10px] font-sans text-slate-300 leading-tight">
            {selectedHotspot.description}
          </p>
          <div className="flex items-center justify-between text-[8px] font-mono text-slate-400 pt-0.5">
            <span>COORDS: {selectedHotspot.lat.toFixed(4)}°N, {selectedHotspot.lng.toFixed(4)}°E</span>
            <span className="text-cyan-electric font-semibold">[{selectedHotspot.scale}]</span>
          </div>
        </div>
      )}

      {/* Scale Mode & Region Badge (Bottom-Left) */}
      <div className="absolute bottom-3 left-3 z-20 pointer-events-none flex items-center gap-2 px-3 py-1 rounded-lg bg-slate-950/85 backdrop-blur-md border border-cyan-electric/25 text-[10px] font-mono text-slate-300 shadow-lg">
        <span className="w-2 h-2 rounded-full bg-cyan-electric animate-ping" />
        <span className="text-cyan-electric font-bold">{scaleLevel} PHYSICS MODE</span>
        <span className="text-slate-600">|</span>
        <span className="text-slate-200">{currentAOI.region}</span>
      </div>
    </div>
  );
};
