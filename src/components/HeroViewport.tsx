import React, { useRef, useEffect, useState, useCallback } from 'react';
import { 
  ScaleLevel, 
  ProjectionMode, 
  AOIScenario, 
  CellInspectionData,
  TerrainLandmarkPin
} from '../types';
import { 
  Layers, 
  Rotate3d, 
  ShieldCheck, 
  ShieldAlert, 
  RefreshCw,
  Zap,
  MapPin,
  AlertTriangle,
  Radio,
  EyeOff,
  Crosshair,
  Compass
} from 'lucide-react';

interface HeroViewportProps {
  currentAOI: AOIScenario;
  scaleLevel: ScaleLevel;
  wavelengthPct: number;
  isLoupeActive: boolean;
  projectionMode: ProjectionMode;
  setProjectionMode: (mode: ProjectionMode) => void;
  closurePhaseShieldActive: boolean;
  setClosurePhaseShieldActive: (active: boolean | ((prev: boolean) => boolean)) => void;
  isMitigationActive: boolean;
  onMitigate: () => void;
  selectedCell: CellInspectionData | null;
  onSelectCell: (cell: CellInspectionData) => void;
  isBreakItNoiseActive: boolean;
  timeEpochIndex: number;
  activeLayerHighlight?: string | null;
}

export const HeroViewport: React.FC<HeroViewportProps> = ({
  currentAOI,
  scaleLevel,
  wavelengthPct,
  isLoupeActive,
  projectionMode,
  setProjectionMode,
  closurePhaseShieldActive,
  setClosurePhaseShieldActive,
  isMitigationActive,
  onMitigate,
  selectedCell,
  onSelectCell,
  isBreakItNoiseActive,
  timeEpochIndex,
  activeLayerHighlight,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Camera angles (target vs current for smooth lerp transitions)
  const [rotationAngle, setRotationAngle] = useState(35);
  const [tiltAngle, setTiltAngle] = useState(55);
  const [zoomLevel, setZoomLevel] = useState(1.05);

  const curRot = useRef(35);
  const curTilt = useRef(55);
  const curZoom = useRef(1.05);

  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 400, y: 300 });

  // Projected screen positions for floating 3D landmark pins
  const [projectedPins, setProjectedPins] = useState<Array<{
    pin: TerrainLandmarkPin;
    screenX: number;
    screenY: number;
    isVisible: boolean;
  }>>([]);

  // 2,500 Hydrodynamic Flow Particles (MESO) & Glacier Velocity Particles (MACRO)
  const particlesRef = useRef<Array<{
    x: number;
    y: number;
    vx: number;
    vy: number;
    life: number;
    maxLife: number;
    stagnant: boolean;
  }>>([]);

  // Initialize 2,500 particles
  useEffect(() => {
    const pts = [];
    const count = 2500;
    for (let i = 0; i < count; i++) {
      pts.push({
        x: (Math.random() - 0.5) * 28,
        y: (Math.random() - 0.5) * 28,
        vx: (Math.random() - 0.5) * 0.15,
        vy: (Math.random() - 0.5) * 0.15,
        life: Math.random() * 100,
        maxLife: 80 + Math.random() * 100,
        stagnant: false,
      });
    }
    particlesRef.current = pts;
  }, [currentAOI.id]);

  // Smooth camera target according to projection mode
  useEffect(() => {
    if (projectionMode === 'ortho') {
      setRotationAngle(0);
      setTiltAngle(0);
    } else {
      setRotationAngle(35);
      setTiltAngle(55);
    }
  }, [projectionMode]);

  // Handle canvas click to inspect
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const lat = currentAOI.coordinates.lat + ((clickY / rect.height) - 0.5) * 0.05;
    const lng = currentAOI.coordinates.lng + ((clickX / rect.width) - 0.5) * 0.05;
    const elev = currentAOI.coordinates.elevation + (Math.sin(clickX * 0.02) + Math.cos(clickY * 0.02)) * 18;

    const isStagnant = Math.hypot(clickX - rect.width * 0.52, clickY - rect.height * 0.48) < 90;
    const hhVal = currentAOI.physicsParameters.dielectricHH_dB + (isStagnant ? 5.2 : -1.8);
    const hvVal = currentAOI.physicsParameters.roughnessHV_dB + (Math.random() * 1.2 - 0.6);
    const disp = isMitigationActive 
      ? currentAOI.mitigationPlan.mitigatedPhase_mm 
      : (currentAOI.physicsParameters.phaseMotion_mm + (isStagnant ? -5.5 : 0));

    const cellData: CellInspectionData = {
      x: Math.round(clickX),
      y: Math.round(clickY),
      lat: Number(lat.toFixed(5)),
      lng: Number(lng.toFixed(5)),
      elevationM: Number(elev.toFixed(1)),
      hh_L_dB: Number(hhVal.toFixed(1)),
      hv_L_dB: Number(hvVal.toFixed(1)),
      delta_phi_rad: Number(((disp / 119.2) * 2 * Math.PI).toFixed(3)),
      displacementMm: Number(disp.toFixed(1)),
      closurePhaseRad: Number((currentAOI.physicsParameters.closurePhaseRad + (isBreakItNoiseActive && !closurePhaseShieldActive ? 0.38 : 0)).toFixed(3)),
      soilMoistureVolPct: Number((Math.max(12, Math.min(68, (hhVal + 22) * 2.8))).toFixed(1)),
      doubleBounceIntensity: Number((Math.max(0.1, (hhVal + 18) * 0.14)).toFixed(2)),
      flowVelocityMs: isStagnant && !isMitigationActive ? 0.04 : (isMitigationActive ? 0.78 : currentAOI.physicsParameters.manningsFlowVelocity),
      stagnantRisk: isStagnant && !isMitigationActive,
      granuleId: currentAOI.granuleId,
    };

    onSelectCell(cellData);
  };

  // Drag controls for rotating 3D terrain
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    setMousePos({ x: mx, y: my });

    if (isDragging && projectionMode === 'isometric') {
      const dx = e.clientX - dragStart.x;
      const dy = e.clientY - dragStart.y;
      setRotationAngle((prev) => (prev + dx * 0.35) % 360);
      setTiltAngle((prev) => Math.max(10, Math.min(80, prev - dy * 0.3)));
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Click on a 3D pin focuses that spot
  const handlePinClick = (pin: TerrainLandmarkPin, screenX: number, screenY: number) => {
    const lat = currentAOI.coordinates.lat + (pin.gridY / 30) * 0.04;
    const lng = currentAOI.coordinates.lng + (pin.gridX / 30) * 0.04;

    const cellData: CellInspectionData = {
      x: Math.round(screenX),
      y: Math.round(screenY),
      lat: Number(lat.toFixed(5)),
      lng: Number(lng.toFixed(5)),
      elevationM: Number((currentAOI.coordinates.elevation + pin.elevationOffsetM).toFixed(1)),
      hh_L_dB: currentAOI.physicsParameters.dielectricHH_dB,
      hv_L_dB: currentAOI.physicsParameters.roughnessHV_dB,
      delta_phi_rad: Number(((currentAOI.physicsParameters.phaseMotion_mm / 119.2) * 2 * Math.PI).toFixed(3)),
      displacementMm: isMitigationActive ? currentAOI.mitigationPlan.mitigatedPhase_mm : currentAOI.physicsParameters.phaseMotion_mm,
      closurePhaseRad: currentAOI.physicsParameters.closurePhaseRad,
      soilMoistureVolPct: 44.5,
      doubleBounceIntensity: 3.8,
      flowVelocityMs: isMitigationActive ? 0.78 : (pin.type === 'critical' ? 0.04 : currentAOI.physicsParameters.manningsFlowVelocity),
      stagnantRisk: pin.type === 'critical' && !isMitigationActive,
      granuleId: currentAOI.granuleId,
      zoneName: pin.name,
    };
    onSelectCell(cellData);
  };

  // High-Resolution Shaded Terrain & Hydrology 60-FPS Renderer
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let frame = 0;

    // High density mesh: 52 x 52 grid
    const GRID_COLS = 52;
    const GRID_ROWS = 52;

    const render = () => {
      frame++;
      const width = canvas.width;
      const height = canvas.height;

      // Smooth camera lerp
      curRot.current += (rotationAngle - curRot.current) * 0.08;
      curTilt.current += (tiltAngle - curTilt.current) * 0.08;
      curZoom.current += (zoomLevel - curZoom.current) * 0.08;

      const cRot = (curRot.current * Math.PI) / 180;
      const cTilt = (curTilt.current * Math.PI) / 180;
      const zoom = curZoom.current;

      const centerX = width / 2;
      const centerY = height / 2 + (curTilt.current > 10 ? 30 : 0);

      const cellSpacing = (Math.min(width, height) / 44) * zoom;

      // Clear with deepest obsidian space
      ctx.fillStyle = '#03070E';
      ctx.fillRect(0, 0, width, height);

      // Light vector for directional hillshading (sun azimuth = 45 deg, elevation = 50 deg)
      const sunAzimuth = Math.PI / 4;
      const sunElev = Math.PI / 3.2;
      const lx = Math.cos(sunAzimuth) * Math.cos(sunElev);
      const ly = Math.sin(sunAzimuth) * Math.cos(sunElev);
      const lz = Math.sin(sunElev);

      // 3D to 2D projection function
      const project = (gx: number, gy: number, gz: number) => {
        if (curTilt.current < 2) {
          // Pure 2D Ortho Top-Down
          return {
            px: centerX + gx * cellSpacing,
            py: centerY + gy * cellSpacing,
          };
        } else {
          // 2.5D / 3D Isometric with full rotation & tilt
          const rx = gx * Math.cos(cRot) - gy * Math.sin(cRot);
          const ry = gx * Math.sin(cRot) + gy * Math.cos(cRot);

          const px = centerX + rx * cellSpacing;
          const py = centerY + (ry * Math.cos(cTilt) - gz * Math.sin(cTilt) * 1.5) * cellSpacing * 0.62;
          return { px, py };
        }
      };

      // Elevation field generator function for specific AOI
      const getElevation = (c: number, r: number) => {
        const nx = (c - GRID_COLS / 2) / 6.5;
        const ny = (r - GRID_ROWS / 2) / 6.5;

        if (currentAOI.id === 'aoi-1') {
          // Bhopal wetland valley + lake basin + NH-46 embankment ridge + subsidence bowl
          const lakeBasin = Math.hypot(nx + 1.2, ny + 1.0) < 2.2 ? -3.4 : 0;
          const valley = -Math.sin(nx * 0.6) * 1.6;
          const embankment = Math.abs(ny - 0.2) < 0.6 && nx > -2 && nx < 4 ? 3.8 : 0;
          const subsidence = Math.hypot(nx - 1.5, ny - 2.0) < 1.8 
            ? (isMitigationActive ? -0.4 : -2.8) 
            : 0;
          return lakeBasin + valley + embankment + subsidence;
        } else if (currentAOI.id === 'aoi-2') {
          // Himalayan steep gorge + scorched pine ravine + highway cut
          const gorge = (ny * 1.8 + nx * 0.7);
          const ravine = Math.cos(nx * 1.2) * 3.4;
          const creepToe = Math.hypot(nx, ny - 1.8) < 1.6 ? (isMitigationActive ? 0.6 : 4.2) : 0;
          return gorge + ravine + creepToe;
        } else if (currentAOI.id === 'aoi-3') {
          // Kutch blind thrust fault scarp + uplift block
          const faultStep = nx > 0 ? 4.2 : -2.2;
          const canalTrench = Math.abs(ny) < 0.7 ? -1.8 : 0;
          return faultStep + canalTrench;
        } else {
          // Samudra Tapu Glacier tongue & moraine lake dam
          const glacier = Math.sin(ny * 0.8) * 3.6 - Math.hypot(nx, ny) * 0.9;
          const moraineRidge = Math.abs(ny - 1.4) < 0.9 ? 4.6 : 0;
          return glacier + moraineRidge;
        }
      };

      // Optical vs Radar penetration weights
      const opticalFactor = Math.max(0, 1 - (wavelengthPct / 100)); // 1.0 at 0% (optical), 0 at 100%
      const lBandFactor = wavelengthPct / 100;

      // Project all terrain landmark pins
      const pinScreenPositions: Array<{
        pin: TerrainLandmarkPin;
        screenX: number;
        screenY: number;
        isVisible: boolean;
      }> = [];

      currentAOI.pins.forEach((pin) => {
        const pinElev = getElevation(pin.gridX + GRID_COLS / 2, pin.gridY + GRID_ROWS / 2);
        const p = project(pin.gridX, pin.gridY, pinElev + 0.8);
        pinScreenPositions.push({
          pin,
          screenX: p.px,
          screenY: p.py,
          isVisible: p.px > 30 && p.px < width - 30 && p.py > 40 && p.py < height - 40,
        });
      });
      setProjectedPins(pinScreenPositions);

      // Pre-compute elevation matrix
      const elevMatrix: number[][] = [];
      for (let r = 0; r < GRID_ROWS; r++) {
        elevMatrix[r] = [];
        for (let c = 0; c < GRID_COLS; c++) {
          elevMatrix[r][c] = getElevation(c, r);
        }
      }

      // 1. Render Shaded Topographic Relief & Hypsometric Tint
      for (let r = 0; r < GRID_ROWS - 1; r++) {
        for (let c = 0; c < GRID_COLS - 1; c++) {
          const gx0 = c - GRID_COLS / 2;
          const gy0 = r - GRID_ROWS / 2;

          const z0 = elevMatrix[r][c];
          const z1 = elevMatrix[r][c + 1];
          const z2 = elevMatrix[r + 1][c + 1];
          const z3 = elevMatrix[r + 1][c];

          const p0 = project(gx0, gy0, z0);
          const p1 = project(gx0 + 1, gy0, z1);
          const p2 = project(gx0 + 1, gy0 + 1, z2);
          const p3 = project(gx0, gy0 + 1, z3);

          // Calculate surface normal for hillshading
          const dzdx = (z1 - z0 + z2 - z3) * 0.5;
          const dzdy = (z3 - z0 + z2 - z1) * 0.5;
          const len = Math.hypot(dzdx, dzdy, 1.0);
          const nx = -dzdx / len;
          const ny = -dzdy / len;
          const nz = 1.0 / len;

          // Lambertian diffuse hillshade factor
          const hillshade = Math.max(0.18, Math.min(1.0, nx * lx + ny * ly + nz * lz));

          // Base hypsometric coloring based on elevation z
          const avgZ = (z0 + z1 + z2 + z3) / 4;
          let rBase = 22, gBase = 58, bBase = 42; // default alluvial lush green

          if (currentAOI.id === 'aoi-4') {
            // Glacial terrain (ice whites, cyan crevasses, rock grays)
            if (avgZ < -1.5) {
              rBase = 20; gBase = 45; bBase = 75; // melt lake
            } else if (avgZ > 2.0) {
              rBase = 180; gBase = 210; bBase = 235; // snow crest
            } else {
              rBase = 110; gBase = 150; bBase = 185; // glacier ice
            }
          } else if (currentAOI.id === 'aoi-2') {
            // Himalayan gorge & fire scar
            if (avgZ > 2.5) {
              rBase = 70; gBase = 65; bBase = 60; // mountain rock
            } else if (avgZ < 0) {
              rBase = 18; gBase = 48; bBase = 68; // Alaknanda river gorge
            } else {
              rBase = 45; gBase = 38; bBase = 28; // scorched pine soil
            }
          } else if (currentAOI.id === 'aoi-3') {
            // Kutch arid saline scarp
            if (avgZ > 2.0) {
              rBase = 90; gBase = 80; bBase = 65; // uplift sandstone
            } else if (avgZ < -0.5) {
              rBase = 35; gBase = 65; bBase = 80; // saline upwelling pool
            } else {
              rBase = 70; gBase = 65; bBase = 48; // alluvial desert
            }
          } else {
            // AOI 1: Bhopal Bhoj wetland & agricultural valley
            if (avgZ < -2.2) {
              rBase = 14; gBase = 38; bBase = 65; // Bhojtal lake body
            } else if (avgZ > 2.2) {
              rBase = 52; gBase = 48; bBase = 38; // NH-46 embankment ridge
            } else {
              rBase = 24; gBase = 62; bBase = 40; // agricultural parcels
            }
          }

          // Shaded RGB
          let red = Math.round(rBase * hillshade);
          let green = Math.round(gBase * hillshade);
          let blue = Math.round(bBase * hillshade);

          // 2. Physical Layer Overlays (Scale-Responsive)
          const cellDist = Math.hypot(gx0 - 1.2, gy0 + 0.8);
          const isAnomalyZone = cellDist < 4.8;

          if (scaleLevel === 'MICRO') {
            // Interferometric Phase Fringes (11.9 cm per fringe wrap)
            const phaseVal = ((avgZ * 3.8) + frame * 0.02) % (Math.PI * 2);
            const fringeIntensity = (Math.sin(phaseVal) + 1) * 0.5;

            // Soil Moisture Noise Injection check
            const fakeNoise = isBreakItNoiseActive && !closurePhaseShieldActive
              ? Math.sin(gx0 * 3.2 + gy0 * 3.2) * 0.5
              : 0;

            if (fringeIntensity + fakeNoise > 0.45) {
              if (isAnomalyZone && !isMitigationActive) {
                // Subsidence / creep fringe: neon phase magenta & crimson
                red = Math.min(255, red + 175);
                green = Math.round(green * 0.4);
                blue = Math.min(255, blue + 110);
              } else {
                // Verified baseline fringe: cyan-magenta contour
                red = Math.round(red * 0.3);
                green = Math.min(255, green + 140);
                blue = Math.min(255, blue + 210);
              }
            }
          } else if (scaleLevel === 'MESO') {
            // Polarimetric sub-canopy flood & double bounce
            if (isAnomalyZone && !isMitigationActive) {
              // Sub-canopy water-trunk double bounce (amber/crimson dielectric glow)
              red = Math.min(255, red + 155);
              green = Math.min(255, Math.round(green * 0.7 + 60));
              blue = Math.round(blue * 0.2);
            } else if (isMitigationActive) {
              // Mitigated recovery emerald
              green = Math.min(255, green + 110);
            }
          } else {
            // MACRO: Velocity streamlines & ice drift
            const vel = Math.sin(gx0 * 0.4 + gy0 * 0.3);
            if (vel > 0.3) {
              blue = Math.min(255, blue + 140);
              green = Math.min(255, green + 90);
            }
          }

          // Loupe effect check
          const cellScreenX = (p0.px + p2.px) * 0.5;
          const cellScreenY = (p0.py + p2.py) * 0.5;
          const distToMouse = Math.hypot(cellScreenX - mousePos.x, cellScreenY - mousePos.y);
          const isInsideLoupe = isLoupeActive && distToMouse < 90;

          // If optical mode and not inside loupe, fade out radar details into cloudy haze
          if (opticalFactor > 0.5 && !isInsideLoupe) {
            red = Math.round(red * 0.5 + 40 * opticalFactor);
            green = Math.round(green * 0.6 + 60 * opticalFactor);
            blue = Math.round(blue * 0.6 + 70 * opticalFactor);
          }

          // Draw polygon cell
          ctx.beginPath();
          ctx.moveTo(p0.px, p0.py);
          ctx.lineTo(p1.px, p1.py);
          ctx.lineTo(p2.px, p2.py);
          ctx.lineTo(p3.px, p3.py);
          ctx.closePath();

          ctx.fillStyle = `rgb(${red}, ${green}, ${blue})`;
          ctx.fill();

          // 10m Elevation Contour Lines (Subtle vector borders)
          if (Math.round(avgZ * 10) % 8 === 0) {
            ctx.strokeStyle = 'rgba(0, 240, 255, 0.22)';
            ctx.lineWidth = 0.8;
            ctx.stroke();
          } else {
            ctx.strokeStyle = 'rgba(0, 0, 0, 0.15)';
            ctx.lineWidth = 0.4;
            ctx.stroke();
          }
        }
      }

      // 3. Render 2,500 Hydraulic Flow Particles (MESO) / Glacier Velocity (MACRO)
      if (scaleLevel === 'MESO' || scaleLevel === 'MACRO') {
        const pts = particlesRef.current;
        for (let i = 0; i < pts.length; i++) {
          const p = pts[i];

          const cIdx = Math.max(0, Math.min(GRID_COLS - 2, Math.floor(p.x + GRID_COLS / 2)));
          const rIdx = Math.max(0, Math.min(GRID_ROWS - 2, Math.floor(p.y + GRID_ROWS / 2)));

          const zCur = elevMatrix[rIdx][cIdx];
          const zNextX = elevMatrix[rIdx][Math.min(GRID_COLS - 1, cIdx + 1)];
          const zNextY = elevMatrix[Math.min(GRID_ROWS - 1, rIdx + 1)][cIdx];

          const gradX = (zNextX - zCur) * -0.06;
          const gradY = (zNextY - zCur) * -0.06;

          // Stagnant trap near NH-46 embankment bottleneck
          const distToBottleneck = Math.hypot(p.x - 1.2, p.y + 0.8);
          if (distToBottleneck < 4.2 && !isMitigationActive) {
            p.vx *= 0.78;
            p.vy *= 0.78;
            p.stagnant = true;
          } else {
            p.vx += gradX * 0.35;
            p.vy += gradY * 0.35;
            p.vx *= 0.93;
            p.vy *= 0.93;
            p.stagnant = false;
          }

          p.x += p.vx;
          p.y += p.vy;
          p.life++;

          if (p.life > p.maxLife || Math.abs(p.x) > 23 || Math.abs(p.y) > 23) {
            p.x = (Math.random() - 0.5) * 22;
            p.y = (Math.random() - 0.5) * 22;
            p.vx = 0;
            p.vy = 0;
            p.life = 0;
          }

          const projected = project(p.x, p.y, zCur + 0.4);

          ctx.beginPath();
          ctx.arc(projected.px, projected.py, p.stagnant ? 2.6 : 1.4, 0, Math.PI * 2);

          if (p.stagnant) {
            ctx.fillStyle = 'rgba(255, 30, 86, 0.95)';
            ctx.shadowColor = '#FF1E56';
            ctx.shadowBlur = 8;
          } else if (scaleLevel === 'MACRO') {
            ctx.fillStyle = 'rgba(0, 240, 255, 0.85)';
            ctx.shadowColor = '#00F0FF';
            ctx.shadowBlur = 4;
          } else {
            ctx.fillStyle = isMitigationActive ? 'rgba(0, 230, 118, 0.85)' : 'rgba(0, 240, 255, 0.75)';
            ctx.shadowBlur = 0;
          }
          ctx.fill();
        }
        ctx.shadowBlur = 0;
      }

      // 4. Volumetric Cloud Deck & Forest Canopy (at Optical Wavelength or outside Loupe)
      if (opticalFactor > 0.05) {
        ctx.save();
        if (isLoupeActive) {
          ctx.beginPath();
          ctx.rect(0, 0, width, height);
          ctx.arc(mousePos.x, mousePos.y, 90, 0, Math.PI * 2, true);
          ctx.clip();
        }

        // Swirling monsoon clouds
        const grad = ctx.createRadialGradient(centerX, centerY, 60, centerX, centerY, width * 0.65);
        grad.addColorStop(0, `rgba(235, 245, 255, ${0.72 * opticalFactor})`);
        grad.addColorStop(0.6, `rgba(185, 215, 235, ${0.55 * opticalFactor})`);
        grad.addColorStop(1, `rgba(110, 145, 175, ${0.25 * opticalFactor})`);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);

        // Animated cumulus cloud puffs
        for (let i = 0; i < 9; i++) {
          const cx = (centerX + Math.sin(frame * 0.003 + i * 1.2) * 220 + i * 50) % width;
          const cy = (centerY + Math.cos(frame * 0.002 + i * 1.5) * 120 + i * 40) % height;
          ctx.beginPath();
          ctx.arc(cx, cy, 150, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(250, 252, 255, ${0.28 * opticalFactor})`;
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
        ctx.lineWidth = 2;
        ctx.shadowColor = '#00F0FF';
        ctx.shadowBlur = 14;
        ctx.stroke();

        // Crosshairs in Loupe
        ctx.beginPath();
        ctx.moveTo(mousePos.x - 14, mousePos.y);
        ctx.lineTo(mousePos.x + 14, mousePos.y);
        ctx.moveTo(mousePos.x, mousePos.y - 14);
        ctx.lineTo(mousePos.x, mousePos.y + 14);
        ctx.strokeStyle = 'rgba(0, 240, 255, 0.8)';
        ctx.lineWidth = 1.2;
        ctx.stroke();

        // Loupe Badge
        ctx.fillStyle = 'rgba(4, 7, 12, 0.9)';
        ctx.fillRect(mousePos.x + 16, mousePos.y + 16, 130, 24);
        ctx.strokeStyle = 'rgba(0, 240, 255, 0.45)';
        ctx.strokeRect(mousePos.x + 16, mousePos.y + 16, 130, 24);
        ctx.font = '10px "JetBrains Mono"';
        ctx.fillStyle = '#00F0FF';
        ctx.fillText('NISAR 24cm L-BAND', mousePos.x + 22, mousePos.y + 32);

        ctx.restore();
      }

      // 6. Selected Cell Targeting Reticle
      if (selectedCell) {
        ctx.save();
        const rx = selectedCell.x;
        const ry = selectedCell.y;

        const reticleSize = 20;
        const angle = frame * 0.02;

        ctx.translate(rx, ry);
        ctx.rotate(angle);

        ctx.strokeStyle = selectedCell.stagnantRisk ? '#FF1E56' : '#00F0FF';
        ctx.lineWidth = 1.8;
        ctx.shadowColor = selectedCell.stagnantRisk ? '#FF1E56' : '#00F0FF';
        ctx.shadowBlur = 12;

        ctx.strokeRect(-reticleSize, -reticleSize, reticleSize * 2, reticleSize * 2);
        ctx.restore();

        // Floating Target Data Box
        ctx.save();
        const boxW = 220;
        const boxH = 68;
        const boxX = Math.min(width - boxW - 24, Math.max(24, rx + 24));
        const boxY = Math.min(height - boxH - 24, Math.max(24, ry - 35));

        ctx.fillStyle = 'rgba(8, 14, 24, 0.92)';
        ctx.fillRect(boxX, boxY, boxW, boxH);
        ctx.strokeStyle = selectedCell.stagnantRisk ? 'rgba(255, 30, 86, 0.7)' : 'rgba(0, 240, 255, 0.6)';
        ctx.lineWidth = 1.2;
        ctx.strokeRect(boxX, boxY, boxW, boxH);

        ctx.font = '10px "Space Grotesk", sans-serif';
        ctx.fillStyle = '#94A3B8';
        ctx.fillText(`TARGET: ${selectedCell.zoneName || 'GROUND CELL'} [${selectedCell.lat}°N, ${selectedCell.lng}°E]`, boxX + 8, boxY + 15);

        ctx.font = '10px "JetBrains Mono", monospace';
        ctx.fillStyle = selectedCell.stagnantRisk ? '#FF1E56' : '#00F0FF';
        ctx.fillText(`Δd LOS: ${selectedCell.displacementMm} mm | ΔHH: ${selectedCell.hh_L_dB} dB`, boxX + 8, boxY + 32);
        ctx.fillText(`Closure |Φ|: ${selectedCell.closurePhaseRad} rad | Mv: ${selectedCell.soilMoistureVolPct}%`, boxX + 8, boxY + 47);
        ctx.fillText(`Flow: ${selectedCell.flowVelocityMs} m/s ${selectedCell.stagnantRisk ? '⚠ STAGNANT TRAP' : '✓ CLEAR'}`, boxX + 8, boxY + 62);

        ctx.restore();
      }

      // 7. North Compass Indicator
      ctx.save();
      const compX = 48;
      const compY = 52;
      ctx.beginPath();
      ctx.arc(compX, compY, 22, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.3)';
      ctx.lineWidth = 1.2;
      ctx.stroke();

      const northRad = curTilt.current > 5 ? (-(curRot.current - 35) * Math.PI) / 180 : 0;
      ctx.beginPath();
      ctx.moveTo(compX, compY);
      ctx.lineTo(compX + Math.sin(northRad) * 18, compY - Math.cos(northRad) * 18);
      ctx.strokeStyle = '#00F0FF';
      ctx.lineWidth = 2.2;
      ctx.stroke();

      ctx.font = '9px "JetBrains Mono"';
      ctx.fillStyle = '#00F0FF';
      ctx.fillText('N', compX - 3.5 + Math.sin(northRad) * 21, compY - Math.cos(northRad) * 21);
      ctx.restore();

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [
    currentAOI,
    scaleLevel,
    wavelengthPct,
    isLoupeActive,
    projectionMode,
    rotationAngle,
    tiltAngle,
    zoomLevel,
    selectedCell,
    isMitigationActive,
    closurePhaseShieldActive,
    isBreakItNoiseActive,
    mousePos,
  ]);

  // Handle Resize
  useEffect(() => {
    const handleResize = () => {
      if (!canvasRef.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      canvasRef.current.width = rect.width;
      canvasRef.current.height = rect.height;
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div 
      ref={containerRef}
      className="absolute inset-0 w-full h-full overflow-hidden select-none bg-[#03070E]"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      {/* 60 FPS Shaded Topographic Canvas */}
      <canvas
        ref={canvasRef}
        onClick={handleCanvasClick}
        className="w-full h-full cursor-crosshair block"
      />

      {/* Optical Satellite Blinded Warning Banner (when wavelength near 0%) */}
      {wavelengthPct < 30 && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-20 pointer-events-none flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/20 border border-amber-500/50 backdrop-blur-md text-amber-300 text-xs font-mono font-bold tracking-wider animate-pulse shadow-glow-amber">
          <EyeOff className="w-4 h-4 text-amber-400" />
          <span>OPTICAL SATELLITE BLINDED BY 92% MONSOON CLOUD & CANOPY COVER (DRAG SLIDER TO 100% FOR NISAR RADAR X-RAY)</span>
        </div>
      )}

      {/* Floating 3D Landmark & Crisis Pins projected onto terrain coordinates */}
      {projectedPins.map(({ pin, screenX, screenY, isVisible }) => {
        if (!isVisible) return null;
        const isCritical = pin.type === 'critical' && !isMitigationActive;

        return (
          <div
            key={pin.id}
            onClick={(e) => {
              e.stopPropagation();
              handlePinClick(pin, screenX, screenY);
            }}
            className="absolute z-20 -translate-x-1/2 -translate-y-full cursor-pointer pointer-events-auto group transition-transform duration-200 hover:scale-105"
            style={{ left: screenX, top: screenY }}
          >
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border backdrop-blur-xl shadow-xl transition-all ${
                isCritical
                  ? 'bg-crimson-anomaly/30 border-crimson-anomaly text-white shadow-glow-crimson animate-pulse'
                  : 'bg-slate-950/80 border-cyan-electric/40 text-slate-200 hover:border-cyan-electric hover:shadow-glow-cyan'
              }`}
            >
              <div
                className={`w-2 h-2 rounded-full ${
                  isCritical ? 'bg-crimson-anomaly animate-ping' : 'bg-cyan-electric'
                }`}
              />
              <div className="flex flex-col text-left">
                <span className="text-[10px] font-mono font-bold leading-tight flex items-center gap-1">
                  {pin.name}
                </span>
                <span className="text-[8.5px] font-mono text-slate-400">
                  {pin.subtitle} • <span className={isCritical ? 'text-crimson-anomaly font-bold' : 'text-cyan-electric'}>{pin.telemetryDelta}</span>
                </span>
              </div>
            </div>

            {/* Pin pointer tick */}
            <div
              className={`w-1.5 h-2 mx-auto ${
                isCritical ? 'bg-crimson-anomaly' : 'bg-cyan-electric'
              }`}
              style={{ clipPath: 'polygon(50% 100%, 0 0, 100% 0)' }}
            />
          </div>
        );
      })}

      {/* Floating Bottom Left Telemetry Badge */}
      <div className="absolute bottom-28 left-4 z-20 pointer-events-none flex flex-col gap-1">
        <div className="bg-slate-950/85 backdrop-blur-xl border border-cyan-electric/25 px-3 py-1.5 rounded-lg text-[10px] font-mono text-slate-300 flex items-center gap-3 shadow-lg">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-cyan-electric animate-ping" />
            <span className="text-cyan-electric font-bold">{scaleLevel} PHYSICS MODE</span>
          </div>
          <span className="text-slate-600">|</span>
          <span className="text-slate-400">{currentAOI.orbitPass}</span>
          <span className="text-slate-600">|</span>
          <span className="text-emerald-recovery font-medium">
            LAT: {currentAOI.coordinates.lat.toFixed(4)}°N, LON: {currentAOI.coordinates.lng.toFixed(4)}°E
          </span>
        </div>
      </div>
    </div>
  );
};
