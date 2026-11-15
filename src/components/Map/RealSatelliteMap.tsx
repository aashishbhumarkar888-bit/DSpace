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
  Navigation,
  Sliders,
  Layers,
  Sparkles,
  Info
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

  // UPGRADE 2.1: Split-Screen Comparison Curtain State
  const [isCompareView, setIsCompareView] = useState<boolean>(false);
  const [curtainXPercent, setCurtainXPercent] = useState<number>(50); // 0 to 100%
  const isDraggingCurtain = useRef<boolean>(false);

  // UPGRADE 2.2: Interactive Map Layer Filters
  const [layerFilters, setLayerFilters] = useState<{
    floodwater: boolean;
    subsidence: boolean;
    bottleneck: boolean;
    villages: boolean;
  }>({
    floodwater: true,
    subsidence: true,
    bottleneck: true,
    villages: true,
  });

  // Hovered Hotspot for rich hover tooltips
  const [hoveredHotspot, setHoveredHotspot] = useState<HotspotBeacon | null>(null);

  // 1,800 animated hydraulic particles
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

  // Update Numbered Beacons (①, ②, ③, ④) on map with layer filter support
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    // Clear old markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    currentAOI.hotspots.forEach((hs) => {
      // Check layer filter
      if (hs.number === 1 && !layerFilters.floodwater) return;
      if (hs.number === 2 && !layerFilters.bottleneck) return;
      if (hs.number === 3 && !layerFilters.subsidence) return;
      if (hs.number === 4 && !layerFilters.villages) return;

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

      marker.on('mouseover', () => {
        setHoveredHotspot(hs);
      });

      marker.on('mouseout', () => {
        setHoveredHotspot(null);
      });

      markersRef.current.push(marker);
    });
  }, [currentAOI.aoiId, selectedHotspot, isMitigationActive, layerFilters]);

  // Track mouse movements & drag split curtain
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!mapContainerRef.current) return;
    const rect = mapContainerRef.current.getBoundingClientRect();
    const currentX = e.clientX - rect.left;
    const currentY = e.clientY - rect.top;

    setMousePos({ x: currentX, y: currentY });

    if (isDraggingCurtain.current && isCompareView) {
      const pct = Math.max(5, Math.min(95, (currentX / rect.width) * 100));
      setCurtainXPercent(pct);
    }
  };

  const handleMouseDownCurtain = (e: React.MouseEvent) => {
    e.stopPropagation();
    isDraggingCurtain.current = true;
  };

  const handleMouseUp = () => {
    isDraggingCurtain.current = false;
  };

  // 60-FPS Overlay Canvas Renderer: Clouds, Sub-Canopy Floods, InSAR Fringes, Flow Particles, Loupe & Split Curtain
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

      // In Compare View, curtainX divides the screen vertically
      const curtainPixelX = (curtainXPercent / 100) * width;

      // =========================================================================
      // DRAW RADAR PHENOMENON (Clip to right side if Compare View is active)
      // =========================================================================
      ctx.save();
      if (isCompareView) {
        // Clip to the RIGHT of curtain
        ctx.beginPath();
        ctx.rect(curtainPixelX, 0, width - curtainPixelX, height);
        ctx.clip();
      }

      const lBandOpacity = isCompareView ? 1.0 : (wavelengthPct / 100);

      // 1. Draw Sub-Canopy Radar Inundation Polygons
      if (layerFilters.floodwater && (lBandOpacity > 0.1 || isLoupeActive || isCompareView)) {
        const centerPt = map.latLngToContainerPoint([
          currentAOI.coordinates.lat,
          currentAOI.coordinates.lng,
        ]);

        // Sub-canopy flood basin
        ctx.beginPath();
        const lakeR = 90;
        ctx.arc(centerPt.x - 40, centerPt.y - 30, lakeR, 0, Math.PI * 2);
        ctx.fillStyle = isMitigationActive ? 'rgba(0, 230, 118, 0.16)' : 'rgba(0, 240, 255, 0.24)';
        ctx.fill();
        ctx.strokeStyle = isMitigationActive ? '#00E676' : '#00F0FF';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Stagnant Embankment Trap Polygon
        if (layerFilters.bottleneck) {
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
        }

        // 2. Neon InSAR Subsidence / Creep Rings (MICRO Scale or active filter)
        if (layerFilters.subsidence && (scaleLevel === 'MICRO' || isCompareView)) {
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
      }

      // 3. Render Hydraulic Flow Particles
      if ((scaleLevel === 'MESO' || scaleLevel === 'MACRO' || isCompareView) && (lBandOpacity > 0.2 || isCompareView)) {
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

      ctx.restore(); // Restore from Radar Clip

      // =========================================================================
      // DRAW OPTICAL MONSOON CLOUDS (Clip to left side if Compare View is active)
      // =========================================================================
      const opticalOpacity = isCompareView ? 1.0 : Math.max(0, 1 - (wavelengthPct / 100));

      if (opticalOpacity > 0.05) {
        ctx.save();

        if (isCompareView) {
          // Clip to the LEFT of curtain
          ctx.beginPath();
          ctx.rect(0, 0, curtainPixelX, height);
          ctx.clip();
        } else if (isLoupeActive) {
          // Circular Loupe Mask: cutout circle at mouse pos
          ctx.beginPath();
          ctx.rect(0, 0, width, height);
          ctx.arc(mousePos.x, mousePos.y, 90, 0, Math.PI * 2, true);
          ctx.clip();
        }

        // Cloudy haze
        const grad = ctx.createRadialGradient(width / 2, height / 2, 40, width / 2, height / 2, width * 0.6);
        grad.addColorStop(0, `rgba(240, 248, 255, ${0.75 * opticalOpacity})`);
        grad.addColorStop(0.6, `rgba(195, 215, 235, ${0.6 * opticalOpacity})`);
        grad.addColorStop(1, `rgba(120, 150, 180, ${0.3 * opticalOpacity})`);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);

        // Cumulus puffs
        for (let i = 0; i < 7; i++) {
          const cx = (width / 2 + Math.sin(frame * 0.003 + i * 1.4) * 200 + i * 60) % width;
          const cy = (height / 2 + Math.cos(frame * 0.002 + i * 1.2) * 120 + i * 50) % height;
          ctx.beginPath();
          ctx.arc(cx, cy, 140, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${0.35 * opticalOpacity})`;
          ctx.fill();
        }

        ctx.restore();
      }

      // =========================================================================
      // DRAW SPLIT-SCREEN CURTAIN DIVIDER & LABELS
      // =========================================================================
      if (isCompareView) {
        ctx.save();

        // Vertical glowing divider line
        ctx.beginPath();
        ctx.moveTo(curtainPixelX, 0);
        ctx.lineTo(curtainPixelX, height);
        ctx.strokeStyle = '#00F0FF';
        ctx.lineWidth = 2.5;
        ctx.shadowColor = '#00F0FF';
        ctx.shadowBlur = 10;
        ctx.stroke();

        // Circular Draggable Handle in the middle
        const handleY = height / 2;
        ctx.beginPath();
        ctx.arc(curtainPixelX, handleY, 20, 0, Math.PI * 2);
        ctx.fillStyle = '#060D18';
        ctx.fill();
        ctx.strokeStyle = '#00F0FF';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Handle inner icon arrows ◄ ►
        ctx.font = 'bold 11px "JetBrains Mono"';
        ctx.fillStyle = '#00F0FF';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('◄►', curtainPixelX, handleY);

        ctx.restore();
      }

      // =========================================================================
      // CIRCULAR X-RAY LOUPE (When not in compare view)
      // =========================================================================
      if (isLoupeActive && !isCompareView) {
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
    isCompareView,
    curtainXPercent,
    layerFilters,
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
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      className="relative w-full h-full overflow-hidden select-none bg-[#03070E] rounded-xl border border-cyan-electric/25 shadow-2xl"
    >
      {/* 60 FPS Physics Overlay Canvas (Layered over real Leaflet satellite map) */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none z-10 w-full h-full block"
      />

      {/* Split-Screen Draggable Overlay Grab Area */}
      {isCompareView && (
        <div
          onMouseDown={handleMouseDownCurtain}
          style={{ left: `${curtainXPercent}%` }}
          className="absolute top-0 bottom-0 w-8 -translate-x-1/2 z-25 cursor-ew-resize flex items-center justify-center hover:opacity-100"
          title="Drag to compare Optical vs. 24cm Radar"
        />
      )}

      {/* Top Map Action Bar: Compare View Toggle + Cloud Alert */}
      <div className="absolute top-3 right-3 z-20 flex items-center gap-2">
        <button
          onClick={() => setIsCompareView((prev) => !prev)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold tracking-wide transition-all shadow-lg border ${
            isCompareView
              ? 'bg-cyan-electric text-slate-950 border-cyan-electric shadow-glow-cyan'
              : 'bg-slate-950/85 backdrop-blur-md text-slate-200 border-border-hairline hover:border-cyan-electric/40'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>{isCompareView ? '⚖️ COMPARE CURTAIN [ON]' : '⚖️ COMPARE VIEW'}</span>
        </button>
      </div>

      {/* Compare View Side Banners */}
      {isCompareView && (
        <>
          <div className="absolute top-3 left-3 z-20 pointer-events-none px-3 py-1 rounded-md bg-amber-950/85 backdrop-blur-md border border-amber-500/40 text-amber-300 font-mono text-[10px] font-bold shadow-lg">
            ☁️ WHAT NORMAL SATELLITES SEE (CLOUDS)
          </div>
          <div className="absolute top-3 right-44 z-20 pointer-events-none px-3 py-1 rounded-md bg-cyan-950/85 backdrop-blur-md border border-cyan-electric/40 text-cyan-electric font-mono text-[10px] font-bold shadow-lg">
            ⚡ WHAT DSPACE 24cm RADAR SEES (GROUND TRUTH)
          </div>
        </>
      )}

      {/* Optical Satellite Blinded Banner (When not in compare view and wavelength is low) */}
      {!isCompareView && wavelengthPct < 30 && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 pointer-events-none flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/50 backdrop-blur-md text-amber-300 text-[11px] font-mono font-bold tracking-wider animate-pulse shadow-glow-amber">
          <EyeOff className="w-3.5 h-3.5 text-amber-400" />
          <span>☁️ Normal Camera View: 92% Blocked by Monsoon Storm Clouds</span>
        </div>
      )}

      {/* Active Hotspot Banner (Top-Left of Map - Zero Overlap!) */}
      {selectedHotspot && !isCompareView && (
        <div className="absolute top-3 left-3 z-20 max-w-sm p-2.5 rounded-xl bg-slate-950/90 backdrop-blur-xl border border-cyan-electric/40 shadow-2xl flex flex-col gap-1 pointer-events-auto">
          <div className="flex items-center justify-between border-b border-border-hairline pb-1">
            <span className="text-[10px] font-mono font-bold text-cyan-electric flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full bg-cyan-electric text-slate-950 flex items-center justify-center font-bold text-[9px]">
                {selectedHotspot.number}
              </span>
              <span>HOTSPOT: {selectedHotspot.name}</span>
            </span>
            <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-surface-elevated text-emerald-recovery border border-emerald-recovery/40">
              {selectedHotspot.metricValue}
            </span>
          </div>
          <p className="text-[10.5px] font-sans text-slate-200 leading-tight">
            {selectedHotspot.description}
          </p>
          <div className="flex items-center justify-between text-[8.5px] font-mono text-slate-400 pt-0.5">
            <span>COORDS: {selectedHotspot.lat.toFixed(4)}°N, {selectedHotspot.lng.toFixed(4)}°E</span>
            <span className="text-cyan-electric font-semibold">[{selectedHotspot.scale}]</span>
          </div>
        </div>
      )}

      {/* Rich Hover Glass Card on Map Feature */}
      {hoveredHotspot && (
        <div className="absolute bottom-16 left-3 z-30 p-2.5 rounded-xl bg-slate-900/95 backdrop-blur-xl border border-cyan-electric/50 shadow-2xl flex flex-col gap-1 max-w-xs animate-fadeIn pointer-events-none">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10.5px] font-mono font-bold text-cyan-electric flex items-center gap-1">
              <span className="w-3.5 h-3.5 rounded-full bg-cyan-electric text-slate-950 flex items-center justify-center text-[9px] font-black">
                {hoveredHotspot.number}
              </span>
              <span>{hoveredHotspot.name}</span>
            </span>
            <span className={`text-[8.5px] font-mono font-bold px-1.5 py-0.2 rounded ${
              hoveredHotspot.type === 'critical' && !isMitigationActive
                ? 'bg-rose-500/20 text-rose-300'
                : 'bg-emerald-500/20 text-emerald-400'
            }`}>
              {hoveredHotspot.type === 'critical' && !isMitigationActive ? 'CRITICAL BOTTLENECK' : 'STABILIZED'}
            </span>
          </div>
          <p className="text-[10px] font-sans text-slate-300">
            {hoveredHotspot.description}
          </p>
          <div className="text-[8.5px] font-mono text-emerald-400 flex items-center justify-between border-t border-border-hairline pt-1">
            <span>METRIC: {hoveredHotspot.metricValue}</span>
            <span className="text-slate-400">Click beacon to inspect</span>
          </div>
        </div>
      )}

      {/* Interactive Map Legend Dock with 1-Click Layer Filters (Bottom-Right) */}
      <div className="absolute bottom-3 right-12 z-20 flex items-center gap-1.5 p-1 rounded-xl bg-slate-950/90 backdrop-blur-xl border border-border-hairline shadow-2xl">
        <div className="flex items-center gap-1 px-1.5 text-[9px] font-mono text-slate-400 font-bold border-r border-border-hairline pr-2">
          <Layers className="w-3 h-3 text-cyan-electric" />
          <span>LAYERS:</span>
        </div>

        <button
          onClick={() => setLayerFilters((p) => ({ ...p, floodwater: !p.floodwater }))}
          className={`px-2 py-0.5 rounded text-[9.5px] font-mono font-bold transition-all border ${
            layerFilters.floodwater
              ? 'bg-cyan-electric/20 text-cyan-electric border-cyan-electric/40'
              : 'bg-transparent text-slate-500 border-transparent hover:text-slate-300'
          }`}
        >
          🌊 Water
        </button>

        <button
          onClick={() => setLayerFilters((p) => ({ ...p, subsidence: !p.subsidence }))}
          className={`px-2 py-0.5 rounded text-[9.5px] font-mono font-bold transition-all border ${
            layerFilters.subsidence
              ? 'bg-pink-500/20 text-pink-400 border-pink-500/40'
              : 'bg-transparent text-slate-500 border-transparent hover:text-slate-300'
          }`}
        >
          📉 Sinking
        </button>

        <button
          onClick={() => setLayerFilters((p) => ({ ...p, bottleneck: !p.bottleneck }))}
          className={`px-2 py-0.5 rounded text-[9.5px] font-mono font-bold transition-all border ${
            layerFilters.bottleneck
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
              : 'bg-transparent text-slate-500 border-transparent hover:text-slate-300'
          }`}
        >
          🚧 Barrier
        </button>

        <button
          onClick={() => setLayerFilters((p) => ({ ...p, villages: !p.villages }))}
          className={`px-2 py-0.5 rounded text-[9.5px] font-mono font-bold transition-all border ${
            layerFilters.villages
              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
              : 'bg-transparent text-slate-500 border-transparent hover:text-slate-300'
          }`}
        >
          🏘️ Villages
        </button>
      </div>

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
