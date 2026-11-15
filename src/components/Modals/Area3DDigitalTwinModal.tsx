import React, { useRef, useEffect, useState } from 'react';
import { 
  X, 
  Layers, 
  RotateCw, 
  Zap, 
  Eye, 
  Maximize2, 
  TrendingDown, 
  CheckCircle2, 
  Box,
  Compass,
  Sliders,
  Move,
  Volume2,
  Home
} from 'lucide-react';
import { HotspotBeacon, AOIScenario } from '../../types';
import { voiceTourEngine } from '../../services/voiceTourEngine';

interface Area3DDigitalTwinModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedHotspot: HotspotBeacon | null;
  currentAOI: AOIScenario;
  wavelengthPct: number;
  isMitigationActive: boolean;
  onToggleMitigation: () => void;
}

export const Area3DDigitalTwinModal: React.FC<Area3DDigitalTwinModalProps> = ({
  isOpen,
  onClose,
  selectedHotspot,
  currentAOI,
  wavelengthPct,
  isMitigationActive,
  onToggleMitigation,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // 3D Viewport Controls
  const [yaw, setYaw] = useState<number>(35); // rotation in degrees
  const [pitch, setPitch] = useState<number>(32); // elevation angle in degrees
  const [isAutoRotate, setIsAutoRotate] = useState<boolean>(true);
  const [isExploded, setIsExploded] = useState<boolean>(false);
  const [localMitigation, setLocalMitigation] = useState<boolean>(isMitigationActive);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  const isDragging = useRef<boolean>(false);
  const lastMousePos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  useEffect(() => {
    setLocalMitigation(isMitigationActive);
  }, [isMitigationActive]);

  useEffect(() => {
    return () => {
      voiceTourEngine.stop();
    };
  }, []);

  const handleClose = () => {
    voiceTourEngine.stop();
    onClose();
  };

  const handleNarrate3D = () => {
    if (isSpeaking) {
      voiceTourEngine.stop();
      setIsSpeaking(false);
      return;
    }

    setIsSpeaking(true);
    setIsAutoRotate(true);
    setIsExploded(true);

    const script = `Now inspecting the 3D Digital Twin of the sector. On the top stratum, 24 centimeter radar pierces through the foliage canopy. In the middle stratum, 4.2 million cubic meters of floodwater are trapped behind the highway embankment wall. On the bottom stratum, deep groundwater extraction has dropped the aquifer head, causing 19.4 millimeters per year of skeletal ground subsidence.`;

    voiceTourEngine.speak(script, () => {
      setIsSpeaking(false);
    });
  };

  // Handle Mouse Drag Rotation
  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    lastMousePos.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return;
    const dx = e.clientX - lastMousePos.current.x;
    const dy = e.clientY - lastMousePos.current.y;
    lastMousePos.current = { x: e.clientX, y: e.clientY };

    setYaw((prev) => (prev + dx * 0.6) % 360);
    setPitch((prev) => Math.max(15, Math.min(65, prev - dy * 0.4)));
    setIsAutoRotate(false); // user manual override
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  // High-FPS 3D Canvas Isometric/Perspective Projection Engine
  useEffect(() => {
    if (!isOpen) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let frame = 0;

    const render = () => {
      frame++;
      if (isAutoRotate && !isDragging.current) {
        setYaw((prev) => (prev + 0.35) % 360);
      }

      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      const radYaw = (yaw * Math.PI) / 180;
      const radPitch = (pitch * Math.PI) / 180;

      // Project 3D (x, y, z) point to 2D screen coordinates
      const project = (x: number, y: number, z: number) => {
        // Rotate around Y axis (yaw)
        const cosY = Math.cos(radYaw);
        const sinY = Math.sin(radYaw);
        const x1 = x * cosY - z * sinY;
        const z1 = x * sinY + z * cosY;

        // Rotate around X axis (pitch)
        const cosP = Math.cos(radPitch);
        const sinP = Math.sin(radPitch);
        const y2 = y * cosP - z1 * sinP;
        const z2 = y * sinP + z1 * cosP;

        const scale = 360 / (360 + z2 * 0.6);
        return {
          x: w / 2 + x1 * scale,
          y: h / 2 + y2 * scale,
          depth: z2,
        };
      };

      // Draw helper: isometric polygon
      const drawIsoPoly = (
        pts: Array<{ x: number; y: number; z: number }>,
        fill: string,
        stroke?: string
      ) => {
        const p0 = project(pts[0].x, pts[0].y, pts[0].z);
        ctx.beginPath();
        ctx.moveTo(p0.x, p0.y);
        for (let i = 1; i < pts.length; i++) {
          const pi = project(pts[i].x, pts[i].y, pts[i].z);
          ctx.lineTo(pi.x, pi.y);
        }
        ctx.closePath();
        ctx.fillStyle = fill;
        ctx.fill();
        if (stroke) {
          ctx.strokeStyle = stroke;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      };

      const blockSize = 140; // half width
      const explodeOffset = isExploded ? 65 : 0;

      // =========================================================================
      // STRATUM 3: SUB-SURFACE AQUIFER & FAULT ZONE (BOTTOM LAYER)
      // =========================================================================
      const bY = 40 + explodeOffset; // Lower block base
      const bH = 50; // Thickness

      // Draw Underground 3D Geological Box
      // Bottom face
      drawIsoPoly([
        { x: -blockSize, y: bY + bH, z: -blockSize },
        { x: blockSize, y: bY + bH, z: -blockSize },
        { x: blockSize, y: bY + bH, z: blockSize },
        { x: -blockSize, y: bY + bH, z: blockSize },
      ], 'rgba(10, 16, 26, 0.95)', '#1e293b');

      // Front & Left underground cuts showing geological strata
      drawIsoPoly([
        { x: -blockSize, y: bY, z: blockSize },
        { x: blockSize, y: bY, z: blockSize },
        { x: blockSize, y: bY + bH, z: blockSize },
        { x: -blockSize, y: bY + bH, z: blockSize },
      ], 'rgba(15, 23, 42, 0.9)', '#334155');

      drawIsoPoly([
        { x: -blockSize, y: bY, z: -blockSize },
        { x: -blockSize, y: bY, z: blockSize },
        { x: -blockSize, y: bY + bH, z: blockSize },
        { x: -blockSize, y: bY + bH, z: -blockSize },
      ], 'rgba(12, 19, 34, 0.9)', '#334155');

      // Aquifer drawdown water table layer inside underground cut
      const waterTableY = localMitigation ? bY + 18 : bY + 36; // Lowered aquifer head during crisis
      drawIsoPoly([
        { x: -blockSize, y: waterTableY, z: blockSize },
        { x: blockSize, y: waterTableY, z: blockSize },
        { x: blockSize, y: bY + bH, z: blockSize },
        { x: -blockSize, y: bY + bH, z: blockSize },
      ], 'rgba(0, 180, 216, 0.25)', '#00F0FF');

      // Underground subsidence arrows
      const pArrow1 = project(-40, bY + 12, 20);
      ctx.fillStyle = localMitigation ? '#00E676' : '#FF2A85';
      ctx.font = 'bold 9.5px "JetBrains Mono"';
      ctx.fillText(localMitigation ? 'STABILIZED: -0.8 mm/yr' : 'AQUIFER COLLAPSE: -19.4 mm/yr', pArrow1.x - 30, pArrow1.y + 16);

      // =========================================================================
      // STRATUM 2: SURFACE HYDROLOGY & EMBANKMENT WALL (MIDDLE LAYER)
      // =========================================================================
      const sY = 0; // Surface layer

      // Base terrain top plate
      drawIsoPoly([
        { x: -blockSize, y: sY, z: -blockSize },
        { x: blockSize, y: sY, z: -blockSize },
        { x: blockSize, y: sY, z: blockSize },
        { x: -blockSize, y: sY, z: blockSize },
      ], 'rgba(16, 28, 48, 0.95)', 'rgba(0, 240, 255, 0.25)');

      // Raised NH-46 Highway Embankment Wall across center
      const embH = localMitigation ? 10 : 22;
      drawIsoPoly([
        { x: -blockSize, y: sY - embH, z: -10 },
        { x: blockSize, y: sY - embH, z: -10 },
        { x: blockSize, y: sY - embH, z: 15 },
        { x: -blockSize, y: sY - embH, z: 15 },
      ], 'rgba(30, 41, 59, 0.98)', '#475569');

      drawIsoPoly([
        { x: -blockSize, y: sY, z: 15 },
        { x: blockSize, y: sY, z: 15 },
        { x: blockSize, y: sY - embH, z: 15 },
        { x: -blockSize, y: sY - embH, z: 15 },
      ], 'rgba(51, 65, 85, 0.98)', '#64748b');

      // If mitigation applied: render cut relief siphon culvert in the wall!
      if (localMitigation) {
        drawIsoPoly([
          { x: -20, y: sY, z: 16 },
          { x: 20, y: sY, z: 16 },
          { x: 20, y: sY - 14, z: 16 },
          { x: -20, y: sY - 14, z: 16 },
        ], 'rgba(0, 230, 118, 0.7)', '#00E676');

        const pCulvert = project(0, sY - 22, 16);
        ctx.fillStyle = '#00E676';
        ctx.font = 'bold 9px "JetBrains Mono"';
        ctx.fillText('1,200mm RELIEF CULVERT CUT', pCulvert.x - 65, pCulvert.y);
      }

      // Upstream Flooded Basin Water Body
      const waterDepth = localMitigation ? 3 : 16;
      drawIsoPoly([
        { x: -blockSize + 15, y: sY - waterDepth, z: -blockSize + 15 },
        { x: blockSize - 15, y: sY - waterDepth, z: -blockSize + 15 },
        { x: blockSize - 15, y: sY - waterDepth, z: -12 },
        { x: -blockSize + 15, y: sY - waterDepth, z: -12 },
      ], localMitigation ? 'rgba(0, 230, 118, 0.28)' : 'rgba(0, 240, 255, 0.42)', localMitigation ? '#00E676' : '#00F0FF');

      // 3D Animated Drainage Velocity Vectors
      for (let i = 0; i < 5; i++) {
        const offsetZ = -50 + ((frame * 0.8 + i * 20) % 40);
        const pFlow1 = project(-30 + i * 16, sY - waterDepth - 2, offsetZ);
        const pFlow2 = project(-30 + i * 16, sY - waterDepth - 2, offsetZ + 12);
        ctx.beginPath();
        ctx.moveTo(pFlow1.x, pFlow1.y);
        ctx.lineTo(pFlow2.x, pFlow2.y);
        ctx.strokeStyle = localMitigation ? '#00E676' : '#00F0FF';
        ctx.lineWidth = 1.8;
        ctx.stroke();
      }

      // =========================================================================
      // STRATUM 1: ATMOSPHERE & CANOPY LAYER (TOP LAYER)
      // =========================================================================
      const cY = -40 - explodeOffset;
      const canopyOpacity = Math.max(0.08, 1 - (wavelengthPct / 100));

      const treeCoords = [
        { x: -70, z: -55 },
        { x: -35, z: -70 },
        { x: 0, z: -45 },
        { x: 45, z: -60 },
        { x: 80, z: -40 },
        { x: -50, z: -30 },
        { x: 30, z: -25 },
      ];

      treeCoords.forEach((tc) => {
        const pBase = project(tc.x, sY - waterDepth, tc.z);
        const pTop = project(tc.x, sY - 32, tc.z);

        ctx.beginPath();
        ctx.moveTo(pBase.x, pBase.y);
        ctx.lineTo(pTop.x, pTop.y);
        ctx.strokeStyle = `rgba(148, 163, 184, ${0.4 + (1 - canopyOpacity) * 0.5})`;
        ctx.lineWidth = 2.4;
        ctx.stroke();

        // Dihedral double-bounce reflection ray at water line
        if (wavelengthPct > 50) {
          ctx.beginPath();
          const pRayIn = project(tc.x - 22, sY - 50, tc.z);
          ctx.moveTo(pRayIn.x, pRayIn.y);
          ctx.lineTo(pBase.x, pBase.y);
          ctx.lineTo(pTop.x + 18, sY - 45);
          ctx.strokeStyle = 'rgba(255, 42, 133, 0.85)';
          ctx.lineWidth = 1.6;
          ctx.stroke();
        }

        // Foliage Crown Sphere
        ctx.beginPath();
        ctx.arc(pTop.x, pTop.y, 14, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(34, 197, 94, ${canopyOpacity * 0.75})`;
        ctx.fill();
        ctx.strokeStyle = `rgba(74, 222, 128, ${canopyOpacity})`;
        ctx.stroke();
      });

      // Monsoon Cloud Deck (at 0% wavelength)
      if (canopyOpacity > 0.4) {
        drawIsoPoly([
          { x: -blockSize - 20, y: cY - 20, z: -blockSize - 20 },
          { x: blockSize + 20, y: cY - 20, z: -blockSize - 20 },
          { x: blockSize + 20, y: cY - 20, z: blockSize + 20 },
          { x: -blockSize - 20, y: cY - 20, z: blockSize + 20 },
        ], `rgba(226, 232, 240, ${canopyOpacity * 0.45})`, 'rgba(255, 255, 255, 0.4)');
      }

      // Exploded Layer Callout Labels
      if (isExploded) {
        ctx.font = 'bold 10px "JetBrains Mono"';

        const pL1 = project(blockSize + 15, cY - 10, 0);
        ctx.fillStyle = '#00F0FF';
        ctx.fillText('1. CANOPY & CLOUD STRATUM (24cm Piercing)', pL1.x, pL1.y);

        const pL2 = project(blockSize + 15, sY, 0);
        ctx.fillStyle = '#00E676';
        ctx.fillText('2. SURFACE HYDROLOGY & NH-46 EMBANKMENT', pL2.x, pL2.y);

        const pL3 = project(blockSize + 15, bY + 20, 0);
        ctx.fillStyle = '#FF2A85';
        ctx.fillText('3. SUB-SURFACE AQUIFER & -19.4mm SINKING BOWL', pL3.x, pL3.y);
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animId);
  }, [isOpen, yaw, pitch, isAutoRotate, isExploded, localMitigation, wavelengthPct]);

  if (!isOpen) return null;

  const beacon = selectedHotspot || currentAOI.hotspots[1] || currentAOI.hotspots[0];

  return (
    <div className="fixed inset-0 z-[9999] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 md:p-8 overflow-y-auto select-none animate-fadeIn">
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-slate-900 border border-cyan-electric/40 rounded-2xl p-5 shadow-2xl text-slate-100 flex flex-col gap-4 my-auto">
        {/* Sticky Top Navigation Bar */}
        <div className="flex items-center justify-between border-b border-border-hairline pb-3">
          <button
            onClick={handleClose}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 text-cyan-electric hover:bg-slate-700 hover:text-white font-mono text-xs font-bold transition-all border border-border-hairline shadow-sm"
          >
            <Home className="w-3.5 h-3.5" />
            <span>🏠 ← Return to Home Dashboard</span>
          </button>

          <button
            onClick={handleClose}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-surface-elevated text-slate-400 hover:text-white hover:bg-slate-800 transition-colors text-xs font-mono"
            title="Close [Esc]"
          >
            <span>✕ Close [Esc]</span>
          </button>
        </div>

        {/* Sector Identity Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-electric/15 border border-cyan-electric/40 text-cyan-electric">
              <Box className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded font-bold bg-cyan-electric/20 text-cyan-electric border border-cyan-electric/40">
                  2km × 2km SECTOR DIGITAL TWIN
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  COORDS: {beacon.lat.toFixed(4)}°N, {beacon.lng.toFixed(4)}°E
                </span>
              </div>
              <h2 className="text-base font-mono font-black text-white tracking-wider mt-1">
                3D ROTATABLE TERRAIN & SUB-SURFACE STRATA MODEL
              </h2>
            </div>
          </div>

          {/* Voice Narration Button */}
          <button
            onClick={handleNarrate3D}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 border transition-all ${
              isSpeaking
                ? 'bg-rose-500/25 text-rose-300 border-rose-500 animate-pulse'
                : 'bg-cyan-electric/20 text-cyan-electric border-cyan-electric/50 hover:bg-cyan-electric/30'
            }`}
          >
            <Volume2 className="w-4 h-4" />
            <span>{isSpeaking ? 'Mute Voice' : '🔊 Narrate 3D Model'}</span>
          </button>
        </div>

        {/* 3D Canvas Viewport */}
        <div 
          className="relative w-full h-[380px] bg-[#02050A] rounded-xl border border-cyan-electric/30 overflow-hidden cursor-grab active:cursor-grabbing flex items-center justify-center"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
        >
          <canvas
            ref={canvasRef}
            width={760}
            height={380}
            className="w-full h-full block"
          />

          {/* Compass & Rotation Overlay (Top-Left) */}
          <div className="absolute top-3 left-3 flex flex-col gap-1 p-2 rounded-lg bg-slate-950/85 backdrop-blur-md border border-border-hairline text-[10px] font-mono text-slate-300 pointer-events-none">
            <div className="flex items-center gap-1.5 text-cyan-electric font-bold">
              <Compass className="w-3.5 h-3.5" />
              <span>YAW: {Math.round(yaw)}° | PITCH: {Math.round(pitch)}°</span>
            </div>
            <span className="text-[8.5px] text-slate-400">Drag mouse anywhere to rotate 360°</span>
          </div>

          {/* Quick Toolbar (Top-Right) */}
          <div className="absolute top-3 right-3 flex items-center gap-2">
            <button
              onClick={() => setIsAutoRotate((p) => !p)}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold flex items-center gap-1 border transition-all ${
                isAutoRotate
                  ? 'bg-cyan-electric/25 text-cyan-electric border-cyan-electric shadow-glow-cyan'
                  : 'bg-slate-900 text-slate-400 border-border-hairline hover:text-white'
              }`}
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>{isAutoRotate ? 'Auto-Rotating' : 'Rotate Paused'}</span>
            </button>

            <button
              onClick={() => setIsExploded((p) => !p)}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold flex items-center gap-1 border transition-all ${
                isExploded
                  ? 'bg-emerald-500/25 text-emerald-300 border-emerald-500 shadow-glow-emerald'
                  : 'bg-slate-900 text-slate-400 border-border-hairline hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{isExploded ? 'Exploded View [ON]' : 'Explode 3 Layers'}</span>
            </button>
          </div>

          {/* Bottom Live Telemetry Overlay */}
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between p-2 rounded-lg bg-slate-950/90 backdrop-blur-md border border-border-hairline text-xs font-mono">
            <span className="text-slate-300">
              SECTOR: <strong>{beacon.name}</strong> ({beacon.shortName})
            </span>
            <span className="text-cyan-electric font-bold">
              RADAR PENETRATION: {wavelengthPct}% (L-Band 23.84cm)
            </span>
          </div>
        </div>

        {/* Sector Engineering Controls & Fix Simulation */}
        <div className="p-3.5 rounded-xl bg-[#060D18] border border-cyan-electric/30 flex items-center justify-between gap-4">
          <div className="flex flex-col gap-0.5">
            <span className="text-xs font-mono font-bold text-white flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-cyan-electric" />
              <span>PHYSICAL INTERVENTION SOLVER</span>
            </span>
            <p className="text-[11px] font-sans text-slate-300">
              Simulate cutting a 1,200mm pressurized relief culvert through the NH-46 embankment to drain the 4.2M m³ sub-canopy flood basin.
            </p>
          </div>

          <button
            onClick={() => {
              setLocalMitigation((p) => !p);
              onToggleMitigation();
            }}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold tracking-wider uppercase transition-all shadow-xl flex items-center gap-2 flex-shrink-0 border ${
              localMitigation
                ? 'bg-emerald-500/25 text-emerald-300 border-emerald-500 shadow-glow-emerald hover:bg-emerald-500/35'
                : 'bg-cyan-electric text-slate-950 border-cyan-electric hover:bg-cyan-400 shadow-glow-cyan'
            }`}
          >
            {localMitigation ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>CULVERT CUT ACTIVE (DRAINING)</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 fill-current" />
                <span>⚡ TEST CULVERT CUT IN 3D</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
