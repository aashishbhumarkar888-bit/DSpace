import React, { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { AOIScenario, HotspotBeacon, ScaleLevel, PolarizationMode } from '../../types';
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
  Info,
  Box,
  Radar,
  Users,
  Compass,
  Flame,
  Mountain
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
  onOpen3DTwin?: () => void;
  polarizationMode?: PolarizationMode;
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
  onOpen3DTwin,
  polarizationMode = 'HH',
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 300, y: 250 });

  // UPGRADE: Split-Screen Comparison Curtain State
  const [isCompareView, setIsCompareView] = useState<boolean>(false);
  const [curtainXPercent, setCurtainXPercent] = useState<number>(50); // 0 to 100%
  const isDraggingCurtain = useRef<boolean>(false);

  // Live Radar Swath Scanning Line Overlay Toggle
  const [isRadarScanActive, setIsRadarScanActive] = useState<boolean>(true);

  // Interactive Map Layer Filters
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

  // Ancillary GIS & Human vs. Natural Driver Layers (WorldPop, ESA WorldCover, Drivers)
  const [showPopulation, setShowPopulation] = useState<boolean>(true);
  const [showLandCover, setShowLandCover] = useState<boolean>(false);
  const [showDrivers, setShowDrivers] = useState<boolean>(true);

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

  // Initialize particles along hydrological gradient between hotspots
  useEffect(() => {
    const pts = [];
    const count = 1800;
    const centerLat = currentAOI.coordinates.lat;
    const centerLng = currentAOI.coordinates.lng;

    for (let i = 0; i < count; i++) {
      pts.push({
        lat: centerLat + (Math.random() - 0.5) * 0.18,
        lng: centerLng + (Math.random() - 0.5) * 0.24,
        vLat: -0.00015 - Math.random() * 0.0003, // Southward drainage bias
        vLng: 0.0001 + (Math.random() - 0.5) * 0.0002,
        life: Math.random() * 80,
        maxLife: 70 + Math.random() * 70,
        stagnant: false,
      });
    }
    particlesRef.current = pts;
  }, [currentAOI.aoiId]);

  // Fit bounds to guarantee ALL 4 hotspots are immediately visible
  const fitHotspotBounds = useCallback((mapInstance: L.Map) => {
    if (!currentAOI.hotspots || currentAOI.hotspots.length === 0) return;
    const latLngs = currentAOI.hotspots.map((h) => L.latLng(h.lat, h.lng));
    latLngs.push(L.latLng(currentAOI.coordinates.lat, currentAOI.coordinates.lng));
    const bounds = L.latLngBounds(latLngs);
    mapInstance.fitBounds(bounds, {
      padding: [45, 45],
      maxZoom: 12,
    });
  }, [currentAOI]);

  // Initialize Leaflet Map with 100% Free, Zero-API-Key Esri World Imagery + Labels
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [currentAOI.coordinates.lat, currentAOI.coordinates.lng],
      zoom: currentAOI.coordinates.zoom || 11,
      zoomControl: false,
      attributionControl: false,
    });

    // 1. Base Satellite Imagery Layer (100% Free Esri World Imagery - NO API KEY REQUIRED)
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 19,
      className: 'esri-satellite-tiles',
    }).addTo(map);

    // 2. Hybrid Place Names & Administrative Boundaries Overlay
    L.tileLayer('https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 19,
      className: 'esri-labels-tiles',
    }).addTo(map);

    // Zoom controls at bottom-right
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    mapRef.current = map;
    fitHotspotBounds(map);

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Cinematic Map flyTo when AOI changes
  useEffect(() => {
    if (!mapRef.current) return;
    mapRef.current.flyTo(
      [currentAOI.coordinates.lat, currentAOI.coordinates.lng],
      currentAOI.coordinates.zoom || 11,
      { duration: 1.4, easeLinearity: 0.25 }
    );
  }, [currentAOI.aoiId, currentAOI.coordinates.lat, currentAOI.coordinates.lng, currentAOI.coordinates.zoom]);

  // Update Numbered Beacons (①, ②, ③, ④) on map
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    // Clear old markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    currentAOI.hotspots.forEach((hs) => {
      // Check layer filters
      if (hs.number === 1 && !layerFilters.floodwater) return;
      if (hs.number === 2 && !layerFilters.bottleneck) return;
      if (hs.number === 3 && !layerFilters.subsidence) return;
      if (hs.number === 4 && !layerFilters.villages) return;

      const isSelected = selectedHotspot?.id === hs.id;
      const isCritical = hs.type === 'critical' && !isMitigationActive;

      const iconHtml = `
        <div class="relative group cursor-pointer -translate-x-1/2 -translate-y-1/2">
          <!-- Pulse ring -->
          <div class="absolute -inset-1.5 rounded-full ${
            isCritical ? 'bg-rose-500/50 animate-ping' : 'bg-cyan-400/40 animate-pulse'
          }"></div>
          
          <!-- Numbered circle beacon -->
          <div class="relative w-8 h-8 rounded-full flex items-center justify-center font-mono font-black text-xs shadow-2xl transition-all duration-200 border-2 ${
            isSelected
              ? 'bg-cyan-electric text-slate-950 border-white scale-125 shadow-glow-cyan ring-2 ring-cyan-electric'
              : isCritical
              ? 'bg-rose-600 text-white border-rose-300 animate-bounce'
              : 'bg-slate-950/90 text-cyan-electric border-cyan-400 hover:scale-115'
          }">
            ${hs.number === 1 ? '①' : hs.number === 2 ? '②' : hs.number === 3 ? '③' : '④'}
          </div>

          <!-- Short 2-word pill label underneath -->
          <div class="absolute top-9 left-1/2 -translate-x-1/2 whitespace-nowrap px-2 py-0.5 rounded-md font-mono text-[10px] font-bold border backdrop-blur-md shadow-xl ${
            isSelected
              ? 'bg-cyan-electric text-slate-950 border-white shadow-glow-cyan'
              : isCritical
              ? 'bg-rose-950/90 text-rose-200 border-rose-500'
              : 'bg-slate-950/90 text-slate-100 border-cyan-500/50'
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
        if (mapRef.current) {
          mapRef.current.flyTo([hs.lat, hs.lng], 12.6, { duration: 1.0 });
        }
      });

      marker.on('mouseover', () => {
        setHoveredHotspot(hs);
      });

      marker.on('mouseout', () => {
        setHoveredHotspot(null);
      });

      markersRef.current.push(marker);
    });
  }, [currentAOI.aoiId, selectedHotspot, isMitigationActive, layerFilters, onSelectHotspot]);

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

  // 60-FPS Overlay Canvas Renderer: Live Swath, Sub-canopy flood, InSAR fringes, NH-46 barrier, flow particles, loupe & split curtain
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

      // =========================================================================
      // 1. DYNAMIC RADAR PHENOMENA PER AOI & POLARIZATION
      // =========================================================================
      if (currentAOI.aoiId === 'aoi-1') {
        // Bhopal Bhoj Wetland & Narmada Canal
        const hs1 = currentAOI.hotspots[0];
        const hs2 = currentAOI.hotspots[1];
        const hs3 = currentAOI.hotspots[2];
        const hs4 = currentAOI.hotspots[3];

        if (hs1 && layerFilters.floodwater && (lBandOpacity > 0.1 || isLoupeActive || isCompareView)) {
          const pt1 = map.latLngToContainerPoint([hs1.lat, hs1.lng]);
          ctx.beginPath();
          ctx.ellipse(pt1.x, pt1.y, 85, 55, Math.PI / 8, 0, Math.PI * 2);
          ctx.fillStyle = isMitigationActive ? 'rgba(0, 230, 118, 0.20)' : (polarizationMode === 'HV' ? 'rgba(255, 184, 0, 0.25)' : 'rgba(0, 240, 255, 0.28)');
          ctx.fill();
          ctx.strokeStyle = isMitigationActive ? '#00E676' : (polarizationMode === 'HV' ? '#FFB800' : '#00F0FF');
          ctx.lineWidth = 2;
          ctx.stroke();

          ctx.font = 'bold 9px "JetBrains Mono"';
          ctx.fillStyle = isMitigationActive ? '#00E676' : (polarizationMode === 'HV' ? '#FFB800' : '#00F0FF');
          ctx.fillText('SUB-CANOPY FLOOD POOL (+6.2 dB HH)', pt1.x - 70, pt1.y - 45);
        }

        if (hs2 && layerFilters.bottleneck) {
          const pt2 = map.latLngToContainerPoint([hs2.lat, hs2.lng]);
          ctx.beginPath();
          ctx.moveTo(pt2.x - 80, pt2.y - 90);
          ctx.lineTo(pt2.x + 60, pt2.y + 100);
          ctx.strokeStyle = isMitigationActive ? 'rgba(0, 230, 118, 0.6)' : 'rgba(255, 30, 86, 0.85)';
          ctx.lineWidth = 3.5;
          ctx.stroke();

          ctx.font = 'bold 8.5px "JetBrains Mono"';
          ctx.fillStyle = isMitigationActive ? '#00E676' : '#FF1E56';
          ctx.fillText('NH-46 HIGHWAY EMBANKMENT BARRIER', pt2.x + 10, pt2.y - 25);

          ctx.beginPath();
          ctx.arc(pt2.x - 20, pt2.y + 10, 55, 0, Math.PI * 2);
          ctx.fillStyle = isMitigationActive ? 'rgba(0, 230, 118, 0.18)' : 'rgba(255, 30, 86, 0.32)';
          ctx.fill();
          ctx.strokeStyle = isMitigationActive ? '#00E676' : '#FF1E56';
          ctx.lineWidth = 1.8;
          ctx.stroke();
        }

        if (hs3 && layerFilters.subsidence) {
          const pt3 = map.latLngToContainerPoint([hs3.lat, hs3.lng]);
          const rings = 4;
          for (let i = 1; i <= rings; i++) {
            const r = (i * 20 + (frame * 0.35)) % 75;
            ctx.beginPath();
            ctx.ellipse(pt3.x, pt3.y, r * 1.2, r * 0.8, -Math.PI / 6, 0, Math.PI * 2);
            ctx.strokeStyle = isMitigationActive ? 'rgba(0, 230, 118, 0.45)' : 'rgba(255, 42, 133, 0.8)';
            ctx.lineWidth = 1.8;
            ctx.setLineDash([6, 3]);
            ctx.stroke();
            ctx.setLineDash([]);
          }
          ctx.font = 'bold 8.5px "JetBrains Mono"';
          ctx.fillStyle = isMitigationActive ? '#00E676' : '#FF2A85';
          ctx.fillText('InSAR COMPACTION (-19.4 mm/yr)', pt3.x - 65, pt3.y - 45);
        }

        if (hs4) {
          const pt4 = map.latLngToContainerPoint([hs4.lat, hs4.lng]);
          ctx.beginPath();
          ctx.moveTo(pt4.x - 90, pt4.y + 40);
          ctx.quadraticCurveTo(pt4.x, pt4.y, pt4.x + 90, pt4.y - 30);
          ctx.strokeStyle = isMitigationActive ? '#00E676' : '#FFB800';
          ctx.lineWidth = 3;
          ctx.stroke();

          ctx.font = 'bold 8.5px "JetBrains Mono"';
          ctx.fillStyle = isMitigationActive ? '#00E676' : '#FFB800';
          ctx.fillText('NARMADA CANAL AQUEDUCT CORRIDOR', pt4.x - 70, pt4.y + 35);
        }
      } else if (currentAOI.aoiId === 'aoi-2') {
        // Himalayan Wildfire-to-Landslide Cascade (Chamoli, Uttarakhand)
        const hs1 = currentAOI.hotspots[0];
        const hs2 = currentAOI.hotspots[1];
        const hs3 = currentAOI.hotspots[2];
        const hs4 = currentAOI.hotspots[3];

        if (hs2 && (lBandOpacity > 0.1 || isLoupeActive || isCompareView)) {
          const pt2 = map.latLngToContainerPoint([hs2.lat, hs2.lng]);
          ctx.beginPath();
          ctx.ellipse(pt2.x, pt2.y, 90, 60, -Math.PI / 6, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(255, 70, 0, 0.22)';
          ctx.fill();
          ctx.strokeStyle = '#FF4500';
          ctx.lineWidth = 2;
          ctx.stroke();
          ctx.font = 'bold 8.5px "JetBrains Mono"';
          ctx.fillStyle = '#FF4500';
          ctx.fillText('CHIR PINE WILDFIRE SCAR (HV -7.8 dB / ASH GLAZE)', pt2.x - 85, pt2.y - 45);
        }

        if (hs1 && layerFilters.subsidence) {
          const pt1 = map.latLngToContainerPoint([hs1.lat, hs1.lng]);
          for (let i = 1; i <= 3; i++) {
            const r = (i * 22 + (frame * 0.4)) % 70;
            ctx.beginPath();
            ctx.arc(pt1.x, pt1.y, r, 0, Math.PI * 2);
            ctx.strokeStyle = isMitigationActive ? '#00E676' : '#FF2A85';
            ctx.lineWidth = 1.6;
            ctx.stroke();
          }
          ctx.font = 'bold 8.5px "JetBrains Mono"';
          ctx.fillStyle = isMitigationActive ? '#00E676' : '#FF2A85';
          ctx.fillText('BEDROCK SHEAR CREEP (4.8 mm/day)', pt1.x - 70, pt1.y - 35);
        }

        if (hs3) {
          const pt3 = map.latLngToContainerPoint([hs3.lat, hs3.lng]);
          ctx.beginPath();
          ctx.moveTo(pt3.x - 70, pt3.y - 30);
          ctx.lineTo(pt3.x + 70, pt3.y + 40);
          ctx.strokeStyle = isMitigationActive ? '#00E676' : '#FF1E56';
          ctx.lineWidth = 3;
          ctx.stroke();
          ctx.font = 'bold 8.5px "JetBrains Mono"';
          ctx.fillStyle = isMitigationActive ? '#00E676' : '#FF1E56';
          ctx.fillText('NH-07 BADRINATH HIGHWAY CUT (FS = 1.04)', pt3.x - 80, pt3.y + 25);
        }

        if (hs4) {
          const pt4 = map.latLngToContainerPoint([hs4.lat, hs4.lng]);
          ctx.beginPath();
          ctx.arc(pt4.x, pt4.y, 45, 0, Math.PI * 2);
          ctx.strokeStyle = '#00F0FF';
          ctx.lineWidth = 1.5;
          ctx.stroke();
          ctx.font = 'bold 8.5px "JetBrains Mono"';
          ctx.fillStyle = '#00F0FF';
          ctx.fillText('RISHIGANGA HYDRO BARRAGE (1.8M m³ RUNOUT)', pt4.x - 75, pt4.y - 30);
        }
      } else if (currentAOI.aoiId === 'aoi-3') {
        // Kutch Mainland Fault Coseismic Blind Thrust (Gujarat)
        const hs1 = currentAOI.hotspots[0];
        const hs2 = currentAOI.hotspots[1];
        const hs3 = currentAOI.hotspots[2];
        const hs4 = currentAOI.hotspots[3];

        if (hs1) {
          const pt1 = map.latLngToContainerPoint([hs1.lat, hs1.lng]);
          ctx.beginPath();
          ctx.moveTo(pt1.x - 120, pt1.y - 40);
          ctx.lineTo(pt1.x + 120, pt1.y + 40);
          ctx.strokeStyle = '#FF2A85';
          ctx.lineWidth = 3;
          ctx.stroke();

          for (let i = 1; i <= 3; i++) {
            const r = (i * 26 + (frame * 0.3)) % 80;
            ctx.beginPath();
            ctx.ellipse(pt1.x, pt1.y, r * 1.5, r * 0.7, Math.PI / 8, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(255, 42, 133, 0.65)';
            ctx.lineWidth = 1.5;
            ctx.stroke();
          }
          ctx.font = 'bold 8.5px "JetBrains Mono"';
          ctx.fillStyle = '#FF2A85';
          ctx.fillText('KUTCH MAINLAND FAULT (2.4 FRINGES / 28.6 cm SLIP)', pt1.x - 90, pt1.y - 45);
        }

        if (hs2) {
          const pt2 = map.latLngToContainerPoint([hs2.lat, hs2.lng]);
          ctx.beginPath();
          ctx.arc(pt2.x, pt2.y, 40, 0, Math.PI * 2);
          ctx.fillStyle = isMitigationActive ? 'rgba(0, 230, 118, 0.2)' : 'rgba(255, 30, 86, 0.3)';
          ctx.fill();
          ctx.strokeStyle = isMitigationActive ? '#00E676' : '#FF1E56';
          ctx.lineWidth = 2;
          ctx.stroke();
          ctx.font = 'bold 8.5px "JetBrains Mono"';
          ctx.fillStyle = isMitigationActive ? '#00E676' : '#FF1E56';
          ctx.fillText('CANAL CONCRETE SLAB SHEAR BREAK', pt2.x - 70, pt2.y - 25);
        }

        if (hs3) {
          const pt3 = map.latLngToContainerPoint([hs3.lat, hs3.lng]);
          ctx.beginPath();
          ctx.arc(pt3.x, pt3.y, 50, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(0, 240, 255, 0.25)';
          ctx.fill();
          ctx.strokeStyle = '#00F0FF';
          ctx.lineWidth = 1.8;
          ctx.stroke();
          ctx.font = 'bold 8.5px "JetBrains Mono"';
          ctx.fillStyle = '#00F0FF';
          ctx.fillText('SALINE WATER UPWELLING (+11.4 dB HH)', pt3.x - 65, pt3.y - 30);
        }

        if (hs4) {
          const pt4 = map.latLngToContainerPoint([hs4.lat, hs4.lng]);
          ctx.font = 'bold 8.5px "JetBrains Mono"';
          ctx.fillStyle = '#FFB800';
          ctx.fillText('PUMP STATION #4 REVERSE HYDRAULIC GRADIENT', pt4.x - 85, pt4.y + 25);
        }
      } else if (currentAOI.aoiId === 'aoi-4') {
        // Samudra Tapu Glacier Melt & Surge (Himachal Pradesh)
        const hs1 = currentAOI.hotspots[0];
        const hs2 = currentAOI.hotspots[1];
        const hs3 = currentAOI.hotspots[2];
        const hs4 = currentAOI.hotspots[3];

        if (hs1) {
          const pt1 = map.latLngToContainerPoint([hs1.lat, hs1.lng]);
          ctx.beginPath();
          ctx.ellipse(pt1.x, pt1.y, 110, 45, Math.PI / 4, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(0, 240, 255, 0.22)';
          ctx.fill();
          ctx.strokeStyle = '#00F0FF';
          ctx.lineWidth = 2;
          ctx.stroke();
          ctx.font = 'bold 8.5px "JetBrains Mono"';
          ctx.fillStyle = '#00F0FF';
          ctx.fillText('GLACIER SURGE TONGUE (325 m/yr GOFF PIXEL OFFSET)', pt1.x - 85, pt1.y - 35);
        }

        if (hs2) {
          const pt2 = map.latLngToContainerPoint([hs2.lat, hs2.lng]);
          ctx.beginPath();
          ctx.arc(pt2.x, pt2.y, 55, 0, Math.PI * 2);
          ctx.fillStyle = isMitigationActive ? 'rgba(0, 230, 118, 0.22)' : 'rgba(0, 180, 255, 0.35)';
          ctx.fill();
          ctx.strokeStyle = isMitigationActive ? '#00E676' : '#00B4FF';
          ctx.lineWidth = 2;
          ctx.stroke();
          ctx.font = 'bold 8.5px "JetBrains Mono"';
          ctx.fillStyle = isMitigationActive ? '#00E676' : '#00B4FF';
          ctx.fillText('SUPRAGLACIAL MORAINE LAKE (12.4M m³ ABLATION)', pt2.x - 80, pt2.y - 25);
        }

        if (hs3) {
          const pt3 = map.latLngToContainerPoint([hs3.lat, hs3.lng]);
          ctx.beginPath();
          ctx.moveTo(pt3.x - 60, pt3.y - 40);
          ctx.lineTo(pt3.x + 60, pt3.y + 40);
          ctx.strokeStyle = isMitigationActive ? '#00E676' : '#FF1E56';
          ctx.lineWidth = 3.5;
          ctx.stroke();
          ctx.font = 'bold 8.5px "JetBrains Mono"';
          ctx.fillStyle = isMitigationActive ? '#00E676' : '#FF1E56';
          ctx.fillText('TERMINAL MORAINE DAM CREST BULGE (18 mm/wk)', pt3.x - 80, pt3.y + 30);
        }

        if (hs4) {
          const pt4 = map.latLngToContainerPoint([hs4.lat, hs4.lng]);
          ctx.font = 'bold 8.5px "JetBrains Mono"';
          ctx.fillStyle = '#00F0FF';
          ctx.fillText('ATAL TUNNEL / HYDRO RUNOUT PATH (42,500 m³/s)', pt4.x - 80, pt4.y + 25);
        }
      }

      // 5. Render Hydraulic Flow Particles
      if (lBandOpacity > 0.2 || isCompareView) {
        const pts = particlesRef.current;
        const hs2 = currentAOI.hotspots[1];
        const centerPt = hs2 ? map.latLngToContainerPoint([hs2.lat, hs2.lng]) : { x: width / 2, y: height / 2 };

        for (let i = 0; i < pts.length; i++) {
          const p = pts[i];
          p.lat += p.vLat;
          p.lng += p.vLng;
          p.life++;

          if (p.life > p.maxLife) {
            p.lat = currentAOI.coordinates.lat + (Math.random() - 0.5) * 0.16;
            p.lng = currentAOI.coordinates.lng + (Math.random() - 0.5) * 0.22;
            p.life = 0;
          }

          const pt = map.latLngToContainerPoint([p.lat, p.lng]);

          // Stagnation check near bottleneck
          const distToBottleneck = Math.hypot(pt.x - centerPt.x, pt.y - centerPt.y);
          const isStagnant = distToBottleneck < 55 && !isMitigationActive;

          ctx.beginPath();
          ctx.arc(pt.x, pt.y, isStagnant ? 2.5 : 1.5, 0, Math.PI * 2);

          if (isStagnant) {
            ctx.fillStyle = '#FF1E56';
          } else if (isMitigationActive) {
            ctx.fillStyle = 'rgba(0, 230, 118, 0.85)';
          } else {
            ctx.fillStyle = 'rgba(0, 240, 255, 0.8)';
          }
          ctx.fill();
        }
      }

      // =========================================================================
      // 5B. ANCILLARY GIS OVERLAYS (WorldPop, ESA WorldCover, Human vs Natural Drivers)
      // =========================================================================
      if (showPopulation && currentAOI.hotspots.length > 0) {
        currentAOI.hotspots.forEach((hs, idx) => {
          const pt = map.latLngToContainerPoint([hs.lat, hs.lng]);
          const popCount = idx === 1 ? 16800 : idx === 3 ? 14200 : 8400;
          ctx.beginPath();
          ctx.arc(pt.x + 25, pt.y - 15, 34, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(0, 240, 255, 0.10)';
          ctx.fill();
          ctx.strokeStyle = 'rgba(0, 240, 255, 0.45)';
          ctx.lineWidth = 1.2;
          ctx.setLineDash([3, 3]);
          ctx.stroke();
          ctx.setLineDash([]);

          ctx.font = 'bold 8px "JetBrains Mono"';
          ctx.fillStyle = '#00F0FF';
          ctx.fillText(`👥 ${popCount.toLocaleString()} EXPOSED (WorldPop: 480/km²)`, pt.x - 30, pt.y - 42);
        });
      }

      if (showLandCover && currentAOI.hotspots.length >= 4) {
        const pts = currentAOI.hotspots.map((h) => map.latLngToContainerPoint([h.lat, h.lng]));
        ctx.beginPath();
        ctx.moveTo(pts[0].x - 40, pts[0].y - 30);
        ctx.lineTo(pts[1].x + 40, pts[1].y - 20);
        ctx.lineTo(pts[3].x + 30, pts[3].y + 40);
        ctx.lineTo(pts[2].x - 30, pts[2].y + 30);
        ctx.closePath();
        ctx.strokeStyle = 'rgba(0, 230, 118, 0.45)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([6, 4]);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.font = 'bold 8.5px "JetBrains Mono"';
        ctx.fillStyle = '#00E676';
        ctx.fillText(`🌿 ESA WorldCover: ${currentAOI.aoiId === 'aoi-4' ? 'Glacial Ice & Permafrost' : currentAOI.aoiId === 'aoi-2' ? 'Coniferous Pine Forest' : 'Cropland & Wetland Reedbed'} (10m Resolution)`, pts[0].x - 20, pts[0].y - 50);
      }

      if (showDrivers && currentAOI.hotspots.length >= 2) {
        const pt1 = map.latLngToContainerPoint([currentAOI.hotspots[0].lat, currentAOI.hotspots[0].lng]);
        const pt2 = map.latLngToContainerPoint([currentAOI.hotspots[1].lat, currentAOI.hotspots[1].lng]);

        // Human Driver Badge
        ctx.fillStyle = 'rgba(255, 184, 0, 0.18)';
        ctx.fillRect(pt2.x - 85, pt2.y + 45, 170, 18);
        ctx.strokeStyle = '#FFB800';
        ctx.lineWidth = 1;
        ctx.strokeRect(pt2.x - 85, pt2.y + 45, 170, 18);
        ctx.font = 'bold 8px "JetBrains Mono"';
        ctx.fillStyle = '#FFB800';
        ctx.fillText(`🏭 HUMAN DRIVER: ${currentAOI.aoiId === 'aoi-1' ? 'NH-46 Embankment / Well' : currentAOI.aoiId === 'aoi-2' ? 'Road Cut / Deforestation' : currentAOI.aoiId === 'aoi-3' ? 'Concrete Canal Break' : 'Anthropogenic Warming (+3.4°C)'}`, pt2.x - 80, pt2.y + 57);

        // Natural Driver Badge
        ctx.fillStyle = 'rgba(0, 240, 255, 0.18)';
        ctx.fillRect(pt1.x - 85, pt1.y + 45, 170, 18);
        ctx.strokeStyle = '#00F0FF';
        ctx.lineWidth = 1;
        ctx.strokeRect(pt1.x - 85, pt1.y + 45, 170, 18);
        ctx.font = 'bold 8px "JetBrains Mono"';
        ctx.fillStyle = '#00F0FF';
        ctx.fillText(`🌪️ NATURAL DRIVER: ${currentAOI.aoiId === 'aoi-1' ? 'Monsoon Cloudburst (τ > 40)' : currentAOI.aoiId === 'aoi-2' ? 'Phyllite Joint Dip (42°)' : currentAOI.aoiId === 'aoi-3' ? 'Blind Thrust Slip (14km)' : 'Basal Cryo-Lubrication'}`, pt1.x - 80, pt1.y + 57);
      }

      // 6. Live NASA-ISRO NISAR Orbital Swath Scanning Line
      if (isRadarScanActive) {
        const scanY = (frame * 1.8) % height;
        ctx.beginPath();
        ctx.moveTo(0, scanY);
        ctx.lineTo(width, scanY);
        ctx.strokeStyle = 'rgba(0, 240, 255, 0.35)';
        ctx.lineWidth = 2;
        ctx.shadowColor = '#00F0FF';
        ctx.shadowBlur = 8;
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Swath gradient trailing shadow
        const scanGrad = ctx.createLinearGradient(0, scanY - 35, 0, scanY);
        scanGrad.addColorStop(0, 'rgba(0, 240, 255, 0)');
        scanGrad.addColorStop(1, 'rgba(0, 240, 255, 0.08)');
        ctx.fillStyle = scanGrad;
        ctx.fillRect(0, Math.max(0, scanY - 35), width, 35);
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
        ctx.shadowBlur = 12;
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
        ctx.fillRect(mousePos.x + 16, mousePos.y + 16, 144, 24);
        ctx.strokeStyle = 'rgba(0, 240, 255, 0.5)';
        ctx.strokeRect(mousePos.x + 16, mousePos.y + 16, 144, 24);
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
    isRadarScanActive,
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
      className="relative w-full h-full z-0 isolate overflow-hidden select-none bg-[#03070E] rounded-xl border border-cyan-electric/25 shadow-2xl"
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

      {/* Top Map Action Bar: Compare View Toggle + Radar Swath Toggle */}
      <div className="absolute top-3 right-3 z-20 flex items-center gap-2">
        <button
          onClick={() => setIsRadarScanActive((p) => !p)}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold tracking-wide transition-all shadow-lg border ${
            isRadarScanActive
              ? 'bg-cyan-electric/20 text-cyan-electric border-cyan-electric/50'
              : 'bg-slate-950/85 backdrop-blur-md text-slate-400 border-border-hairline'
          }`}
          title="Toggle NASA-ISRO NISAR orbital swath sweep line"
        >
          <Radar className="w-3.5 h-3.5" />
          <span>{isRadarScanActive ? 'SWATH SWEEP [ON]' : 'SWATH [OFF]'}</span>
        </button>

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
          <div className="absolute top-3 right-72 z-20 pointer-events-none px-3 py-1 rounded-md bg-cyan-950/85 backdrop-blur-md border border-cyan-electric/40 text-cyan-electric font-mono text-[10px] font-bold shadow-lg">
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

      {/* Active Hotspot Banner with 3D Twin Trigger (Top-Left of Map) */}
      {selectedHotspot && !isCompareView && (
        <div className="absolute top-3 left-3 z-20 max-w-sm p-3 rounded-xl bg-slate-950/90 backdrop-blur-xl border border-cyan-electric/40 shadow-2xl flex flex-col gap-2 pointer-events-auto">
          <div className="flex items-center justify-between border-b border-border-hairline pb-1.5">
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

          <div className="flex items-center justify-between pt-1 border-t border-border-hairline/60">
            <span className="text-[8.5px] font-mono text-slate-400">
              {selectedHotspot.lat.toFixed(4)}°N, {selectedHotspot.lng.toFixed(4)}°E
            </span>
            
            {onOpen3DTwin && (
              <button
                onClick={onOpen3DTwin}
                className="px-2 py-0.5 rounded-lg bg-cyan-electric/20 text-cyan-electric hover:bg-cyan-electric hover:text-slate-950 border border-cyan-electric/50 text-[10px] font-mono font-bold transition-all flex items-center gap-1 shadow-sm"
              >
                <Box className="w-3 h-3" />
                <span>🧊 Open 3D Area Model</span>
              </button>
            )}
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
            <span className="text-slate-400">Click beacon to inspect & fly</span>
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

      {/* Interactive Ancillary GIS & Human-Driver Context Pills (Bottom-Left) */}
      <div className="absolute bottom-11 left-3 z-20 flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-slate-950/90 backdrop-blur-xl border border-cyan-electric/30 shadow-2xl">
        <span className="text-[9px] font-mono text-cyan-electric font-bold px-1.5 uppercase flex items-center gap-1 border-r border-border-hairline pr-2">
          <span>GIS CONTEXT:</span>
        </span>

        <button
          onClick={() => setShowPopulation((p) => !p)}
          className={`flex items-center gap-1 px-2 py-0.5 rounded text-[9.5px] font-mono font-bold transition-all border ${
            showPopulation
              ? 'bg-cyan-electric/25 text-cyan-electric border-cyan-electric shadow-glow-cyan'
              : 'bg-transparent text-slate-400 border-transparent hover:text-slate-200'
          }`}
          title="Toggle WorldPop Gridded Population Density Overlay"
        >
          <span>👥 Population (WorldPop)</span>
        </button>

        <button
          onClick={() => setShowLandCover((p) => !p)}
          className={`flex items-center gap-1 px-2 py-0.5 rounded text-[9.5px] font-mono font-bold transition-all border ${
            showLandCover
              ? 'bg-emerald-500/25 text-emerald-300 border-emerald-500 shadow-glow-emerald'
              : 'bg-transparent text-slate-400 border-transparent hover:text-slate-200'
          }`}
          title="Toggle ESA WorldCover 10m Land Use & Land Cover Outlines"
        >
          <span>🌿 Land Cover (WorldCover)</span>
        </button>

        <button
          onClick={() => setShowDrivers((p) => !p)}
          className={`flex items-center gap-1 px-2 py-0.5 rounded text-[9.5px] font-mono font-bold transition-all border ${
            showDrivers
              ? 'bg-amber-500/25 text-amber-300 border-amber-500'
              : 'bg-transparent text-slate-400 border-transparent hover:text-slate-200'
          }`}
          title="Toggle Human vs. Natural Driver Classification Callouts"
        >
          <span>🏭 Human vs. Natural Drivers</span>
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
