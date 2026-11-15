import React, { useState, useEffect, useRef } from 'react';
import { 
  ScaleLevel, 
  AOIId, 
  UserViewMode, 
  RightSidebarTab, 
  HotspotBeacon, 
  OrbitalEpoch 
} from './types';
import { AOI_SCENARIOS, CASCADE_STEPS_BY_AOI, generateOrbitalTimeline } from './data/aoiScenarios';
import { dataService, StorageStatus } from './services/dataService';

// Grid Layout Components (Zero Overlap!)
import { AppHeader } from './components/Header/AppHeader';
import { WavelengthXRayBar } from './components/Header/WavelengthXRayBar';
import { RealSatelliteMap } from './components/Map/RealSatelliteMap';
import { DockedInspectorSidebar } from './components/Sidebar/DockedInspectorSidebar';
import { AppBottomBar } from './components/Footer/AppBottomBar';

// Modals
import { WelcomeOnboardingModal } from './components/Modals/WelcomeOnboardingModal';
import { ShortcutsModal } from './components/Modals/ShortcutsModal';
import { FieldPackModal } from './components/Modals/FieldPackModal';
import { DistrictActionBriefModal } from './components/Modals/DistrictActionBriefModal';

import { Play, Pause, Square, ChevronRight, ChevronLeft, CheckCircle2, Award, Activity } from 'lucide-react';

export const App: React.FC = () => {
  // 1. Core State
  const [currentAOIId, setCurrentAOIId] = useState<AOIId>('aoi-1');
  const currentAOI = AOI_SCENARIOS[currentAOIId];
  const cascadeSteps = CASCADE_STEPS_BY_AOI[currentAOIId] || CASCADE_STEPS_BY_AOI['aoi-1'];

  // User Mode: Civilian View vs. Pro Scientist View
  const [userMode, setUserMode] = useState<UserViewMode>('simple');

  // Active Tab in Right Docked Sidebar ('story' | 'cascade' | 'pro_radar')
  const [activeTab, setActiveTab] = useState<RightSidebarTab>('story');

  // Selected Numbered Hotspot Beacon (①, ②, ③, ④)
  const [selectedHotspot, setSelectedHotspot] = useState<HotspotBeacon | null>(
    currentAOI.hotspots[0] || null
  );

  // Scale: MICRO (mm Phase), MESO (m Polarimetry), MACRO (km Offset)
  const [scaleLevel, setScaleLevel] = useState<ScaleLevel>('MESO');

  // Wavelength Penetration: 0% (Optical), 50% (C-Band), 100% (L-Band)
  const [wavelengthPct, setWavelengthPct] = useState<number>(100);

  // Split-Screen X-Ray Cursor Lens Toggle
  const [isLoupeActive, setIsLoupeActive] = useState<boolean>(false);

  // 60-Day Physical Mitigation Simulation State
  const [isMitigationActive, setIsMitigationActive] = useState<boolean>(false);

  // Triplet Closure Phase Bias Shield Toggle
  const [closurePhaseShieldActive, setClosurePhaseShieldActive] = useState<boolean>(true);

  // Break-It Test (Fake Moisture Noise Injection)
  const [isBreakItNoiseActive, setIsBreakItNoiseActive] = useState<boolean>(false);

  // 12-Day Orbital Timeline (60 passes)
  const [epochs, setEpochs] = useState<OrbitalEpoch[]>(() => generateOrbitalTimeline('aoi-1'));
  const [currentEpochIndex, setCurrentEpochIndex] = useState<number>(33); // peak anomaly pass
  const [isPlayingTimeline, setIsPlayingTimeline] = useState<boolean>(false);

  // Storage / MongoDB Status
  const [storageStatus, setStorageStatus] = useState<StorageStatus>(() => dataService.getStatus());

  // Modals
  const [isWelcomeModalOpen, setIsWelcomeModalOpen] = useState<boolean>(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState<boolean>(false);
  const [isFieldPackOpen, setIsFieldPackOpen] = useState<boolean>(false);
  const [isDistrictBriefOpen, setIsDistrictBriefOpen] = useState<boolean>(false);

  // 🎬 Unified 60-Second (6 Chapters × 10 Seconds) Master Tour State
  const [isTourActive, setIsTourActive] = useState<boolean>(false);
  const [isTourPaused, setIsTourPaused] = useState<boolean>(false);
  const [tourElapsedSec, setTourElapsedSec] = useState<number>(0); // 0 to 60
  const tourIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Calculate current Chapter from elapsed seconds (1 to 6)
  const currentChapter = Math.min(6, Math.floor(tourElapsedSec / 10) + 1);

  // Subscribe to storage status
  useEffect(() => {
    return dataService.subscribeStatus(setStorageStatus);
  }, []);

  // Show welcome tour on first visit
  useEffect(() => {
    const visited = localStorage.getItem('dspace_visited');
    if (!visited) {
      setIsWelcomeModalOpen(true);
      localStorage.setItem('dspace_visited', 'true');
    }
  }, []);

  // When user switches to Pro Mode, switch tab to pro_radar
  useEffect(() => {
    if (userMode === 'pro') {
      setActiveTab('pro_radar');
    } else {
      setActiveTab('story');
    }
  }, [userMode]);

  // When AOI changes, reset hotspot and timeline
  useEffect(() => {
    setSelectedHotspot(currentAOI.hotspots[0] || null);
    setIsMitigationActive(false);
    setEpochs(generateOrbitalTimeline(currentAOIId));
    setCurrentEpochIndex(33);
  }, [currentAOIId]);

  // Handle mitigation action
  const handleMitigate = () => {
    const nextState = !isMitigationActive;
    setIsMitigationActive(nextState);

    if (nextState) {
      // Log simulation to MongoDB / backend
      dataService.logSimulation({
        aoiId: currentAOI.aoiId,
        interventionType: currentAOI.mitigationPlan.actionTitle,
        villagesSaved: currentAOI.plainEnglishSummary.villagesSaved,
        hectaresRecovered: currentAOI.plainEnglishSummary.hectaresRecovered,
        economicValueProtected: currentAOI.plainEnglishSummary.economicValueProtected,
      });
    }
  };

  // 🎬 Chapter application handler
  const applyChapterState = (chapter: number) => {
    if (chapter === 1) {
      // Chapter 1: The Real-World Crisis
      setActiveTab('story');
      setWavelengthPct(10);
      setIsMitigationActive(false);
      setSelectedHotspot(currentAOI.hotspots[0]);
      setIsDistrictBriefOpen(false);
    } else if (chapter === 2) {
      // Chapter 2: Why Other Satellites Fail (The Cloud & Canopy Wall)
      setActiveTab('story');
      setWavelengthPct(0); // 0% Optical
      setIsMitigationActive(false);
      setSelectedHotspot(currentAOI.hotspots[0]);
    } else if (chapter === 3) {
      // Chapter 3: How DSpace Solves It (24cm L-Band X-Ray)
      setActiveTab('story');
      setWavelengthPct(100); // 100% L-Band
      setSelectedHotspot(currentAOI.hotspots[1] || currentAOI.hotspots[0]);
    } else if (chapter === 4) {
      // Chapter 4: How It Is Calculated (Analogy + Math)
      setActiveTab('pro_radar');
      setWavelengthPct(100);
      setScaleLevel('MICRO');
      setSelectedHotspot(currentAOI.hotspots[2] || currentAOI.hotspots[0]);
    } else if (chapter === 5) {
      // Chapter 5: 35ms Hydraulic Solver & Benchmark
      setActiveTab('story');
      if (!isMitigationActive) {
        setIsMitigationActive(true);
      }
      setSelectedHotspot(currentAOI.hotspots[1] || currentAOI.hotspots[0]);
    } else if (chapter === 6) {
      // Chapter 6: Real-World Action Dossier
      setActiveTab('story');
      setIsDistrictBriefOpen(true);
    }
  };

  // 60-Second Master Tour Timer Loop (1 tick = 1 second)
  useEffect(() => {
    if (!isTourActive || isTourPaused) {
      if (tourIntervalRef.current) clearInterval(tourIntervalRef.current);
      return;
    }

    tourIntervalRef.current = setInterval(() => {
      setTourElapsedSec((prev) => {
        if (prev >= 59) {
          setIsTourActive(false);
          return 0;
        }
        const next = prev + 1;
        // On chapter boundary (every 10s), trigger state changes
        if (next % 10 === 0) {
          const nextChapter = Math.floor(next / 10) + 1;
          applyChapterState(nextChapter);
        }
        return next;
      });
    }, 1000);

    return () => {
      if (tourIntervalRef.current) clearInterval(tourIntervalRef.current);
    };
  }, [isTourActive, isTourPaused]);

  const startTour = () => {
    setIsTourActive(true);
    setIsTourPaused(false);
    setTourElapsedSec(0);
    applyChapterState(1);
  };

  const stopTour = () => {
    setIsTourActive(false);
    setIsTourPaused(false);
    setTourElapsedSec(0);
    if (tourIntervalRef.current) clearInterval(tourIntervalRef.current);
  };

  const jumpToChapter = (chapter: number) => {
    const sec = (chapter - 1) * 10;
    setTourElapsedSec(sec);
    applyChapterState(chapter);
  };

  // Chapter metadata
  const CHAPTERS = [
    { num: 1, title: '1. What It Solves (Crisis)', short: '1. Crisis' },
    { num: 2, title: '2. Why Satellites Fail (Clouds)', short: '2. Optical Fail' },
    { num: 3, title: '3. 24cm Radar X-Ray', short: '3. Radar X-Ray' },
    { num: 4, title: '4. How It Is Calculated', short: '4. Math & Physics' },
    { num: 5, title: '5. 35ms Solver & Benchmark', short: '5. Solver & Benchmark' },
    { num: 6, title: '6. Field Action Dossier', short: '6. Field Action' },
  ];

  const CHAPTER_CAPTIONS: Record<number, { headline: string; body: string }> = {
    1: {
      headline: 'CHAPTER 1: THE REAL-WORLD CRISIS (WHAT IT SOLVES)',
      body: '14 villages and 4,200 hectares of cropland are trapped in stagnant floodwater behind the NH-46 road embankment, while tubewell over-pumping is sinking the canal bed by -19.4 mm/year.',
    },
    2: {
      headline: 'CHAPTER 2: WHY CURRENT SATELLITES FAIL (THE CLOUD WALL)',
      body: 'Optical cameras (400–800nm) are 92% blinded by monsoon storm clouds. Standard C-band radar (5.6cm) scatters entirely on upper leaves, failing to see sub-canopy water.',
    },
    3: {
      headline: 'CHAPTER 3: HOW DSPACE SOLVES IT (24cm L-BAND X-RAY)',
      body: 'DSpace operationalizes NASA-ISRO NISAR 24cm L-Band radar waves. The wavelength pierces through clouds and foliage, exposing dihedral water-trunk double-bounce (+6.2 dB HH).',
    },
    4: {
      headline: 'CHAPTER 4: HOW THE RESULT IS CALCULATED (ANALYSIS & PROOF)',
      body: 'Civilian Analogy: Flashlight-mirror reflection. Scientist Math: 4-Observation WLS Unmixing (χ² = 0.038) + GUNW InSAR Phase (Δd = -19.4 mm/yr) + Triplet Closure Phase Bias Shield (0.042 rad).',
    },
    5: {
      headline: 'CHAPTER 5: 35ms HYDRAULIC SOLVER & BENCHMARK',
      body: '35ms 2D Local-Inertial Shallow-Water solver cuts the NH-46 relief siphon. Benchmark: 0.052m depth RMSE vs 0.290m C-band, 100% cloud penetration, and <2% false alarm rate.',
    },
    6: {
      headline: 'CHAPTER 6: REAL-WORLD FIELD ACTION (DISTRICT DOSSIER)',
      body: 'Official GPS-tagged District Collector / NDMA Action Dossier generated: ₹48 Cr in crop losses prevented, exact culvert cut depths prescribed, and canal re-leveling timeline issued.',
    },
  };

  // Format seconds to mm:ss
  const formatTime = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <div className="h-screen w-screen overflow-hidden grid grid-rows-[56px_48px_1fr_64px] bg-[#03070E] text-slate-100 font-sans select-none relative">
      {/* ROW 1: 56px Single-Line Header */}
      <AppHeader
        currentAOI={currentAOI}
        allAOIs={AOI_SCENARIOS}
        onSelectAOI={(id) => setCurrentAOIId(id)}
        userMode={userMode}
        setUserMode={setUserMode}
        isTourActive={isTourActive}
        onToggleTour={() => (isTourActive ? stopTour() : startTour())}
        onOpenDistrictBrief={() => setIsDistrictBriefOpen(true)}
      />

      {/* ROW 2: 48px Wavelength X-Ray Bar */}
      <WavelengthXRayBar
        wavelengthPct={wavelengthPct}
        setWavelengthPct={setWavelengthPct}
        isLoupeActive={isLoupeActive}
        setIsLoupeActive={setIsLoupeActive}
      />

      {/* ROW 3: 1fr Main Workspace */}
      <main className="grid grid-cols-[1fr_390px] h-full min-h-0 overflow-hidden p-2 gap-2 relative">
        {/* Left Column: Real Satellite & Radar Physics Map with Numbered Beacons (①, ②, ③, ④) */}
        <section className="h-full w-full min-w-0 overflow-hidden relative">
          <RealSatelliteMap
            currentAOI={currentAOI}
            scaleLevel={scaleLevel}
            wavelengthPct={wavelengthPct}
            isLoupeActive={isLoupeActive}
            selectedHotspot={selectedHotspot}
            onSelectHotspot={(hs) => {
              setSelectedHotspot(hs);
              setScaleLevel(hs.scale);
            }}
            isMitigationActive={isMitigationActive}
            closurePhaseShieldActive={closurePhaseShieldActive}
            isBreakItNoiseActive={isBreakItNoiseActive}
            timeEpochIndex={currentEpochIndex}
          />
        </section>

        {/* Right Column: Docked Inspector Panel */}
        <section className="h-full w-full min-w-0 overflow-hidden">
          <DockedInspectorSidebar
            currentAOI={currentAOI}
            cascadeSteps={cascadeSteps}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            userMode={userMode}
            selectedHotspot={selectedHotspot}
            isMitigationActive={isMitigationActive}
            onMitigate={handleMitigate}
            closurePhaseShieldActive={closurePhaseShieldActive}
            setClosurePhaseShieldActive={setClosurePhaseShieldActive}
            isBreakItNoiseActive={isBreakItNoiseActive}
            setIsBreakItNoiseActive={setIsBreakItNoiseActive}
            timeEpochIndex={currentEpochIndex}
            onOpenDistrictBrief={() => setIsDistrictBriefOpen(true)}
          />
        </section>

        {/* 🎬 UNIFIED 60-SECOND INTERACTIVE MASTER TOUR HUD */}
        {isTourActive && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-40 w-11/12 max-w-3xl bg-slate-950/95 backdrop-blur-2xl border-2 border-cyan-electric rounded-2xl p-3.5 shadow-2xl shadow-cyan-500/25 flex flex-col gap-2.5 animate-fadeIn">
            {/* Top Toolbar: Live Time + Chapter Tabs + Controls */}
            <div className="flex items-center justify-between border-b border-border-hairline pb-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-electric animate-ping" />
                <span className="text-xs font-mono font-black text-cyan-electric tracking-wider">
                  🎬 DSPACE 60s MASTER TOUR
                </span>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-surface-elevated text-emerald-400 font-bold tabular-nums border border-border-hairline">
                  {formatTime(tourElapsedSec)} / 01:00
                </span>
              </div>

              {/* Prev / Play-Pause / Next / Exit */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => jumpToChapter(Math.max(1, currentChapter - 1))}
                  disabled={currentChapter === 1}
                  className="p-1 rounded bg-surface-elevated text-slate-300 disabled:opacity-30 hover:text-white"
                  title="Previous Chapter"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setIsTourPaused((prev) => !prev)}
                  className="px-2.5 py-1 rounded bg-cyan-electric text-slate-950 text-xs font-mono font-bold flex items-center gap-1 hover:bg-cyan-400"
                >
                  {isTourPaused ? <Play className="w-3 h-3 fill-current" /> : <Pause className="w-3 h-3 fill-current" />}
                  <span>{isTourPaused ? 'Resume' : 'Pause'}</span>
                </button>

                <button
                  onClick={() => jumpToChapter(Math.min(6, currentChapter + 1))}
                  disabled={currentChapter === 6}
                  className="p-1 rounded bg-surface-elevated text-slate-300 disabled:opacity-30 hover:text-white"
                  title="Next Chapter"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>

                <button
                  onClick={stopTour}
                  className="px-2 py-1 rounded bg-rose-500/20 text-rose-300 text-xs font-mono font-bold hover:bg-rose-500/40 ml-1 border border-rose-500/40"
                >
                  Exit Tour
                </button>
              </div>
            </div>

            {/* 6 Interactive Chapter Tabs */}
            <div className="grid grid-cols-6 gap-1 text-[9.5px] font-mono">
              {CHAPTERS.map((ch) => (
                <button
                  key={ch.num}
                  onClick={() => jumpToChapter(ch.num)}
                  className={`py-1 px-1 rounded truncate text-center font-bold transition-all border ${
                    currentChapter === ch.num
                      ? 'bg-cyan-electric/25 text-cyan-electric border-cyan-electric shadow-glow-cyan'
                      : 'bg-surface-elevated text-slate-400 border-border-hairline hover:text-slate-200'
                  }`}
                >
                  {ch.short}
                </button>
              ))}
            </div>

            {/* Chapter Caption Content */}
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] font-mono font-extrabold text-cyan-electric uppercase tracking-wider">
                {CHAPTER_CAPTIONS[currentChapter].headline}
              </span>
              <p className="text-xs font-sans text-slate-100 font-medium leading-snug">
                {CHAPTER_CAPTIONS[currentChapter].body}
              </p>
            </div>

            {/* Glowing 60-Second Linear Progress Bar */}
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-electric via-emerald-400 to-cyan-electric transition-all duration-300"
                style={{ width: `${(tourElapsedSec / 60) * 100}%` }}
              />
            </div>
          </div>
        )}
      </main>

      {/* ROW 4: 64px Bottom Timeline Player & Storage Status */}
      <AppBottomBar
        epochs={epochs}
        currentEpochIndex={currentEpochIndex}
        setCurrentEpochIndex={setCurrentEpochIndex}
        isPlaying={isPlayingTimeline}
        setIsPlaying={setIsPlayingTimeline}
        scaleLevel={scaleLevel}
        setScaleLevel={setScaleLevel}
        storageStatus={storageStatus}
      />

      {/* MODALS */}
      <WelcomeOnboardingModal
        isOpen={isWelcomeModalOpen}
        onClose={() => setIsWelcomeModalOpen(false)}
      />

      <ShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />

      <FieldPackModal
        isOpen={isFieldPackOpen}
        onClose={() => setIsFieldPackOpen(false)}
        currentAOI={currentAOI as any}
      />

      <DistrictActionBriefModal
        isOpen={isDistrictBriefOpen}
        onClose={() => setIsDistrictBriefOpen(false)}
        currentAOI={currentAOI}
        isMitigationActive={isMitigationActive}
      />
    </div>
  );
};

export default App;
