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

import { Play, Square, ChevronRight, ChevronLeft, CheckCircle2 } from 'lucide-react';

export const App: React.FC = () => {
  // 1. Core State
  const [currentAOIId, setCurrentAOIId] = useState<AOIId>('aoi-1');
  const currentAOI = AOI_SCENARIOS[currentAOIId];
  const cascadeSteps = CASCADE_STEPS_BY_AOI[currentAOIId] || CASCADE_STEPS_BY_AOI['aoi-1'];

  // User Mode: Simple Citizen Guide vs. Pro SAR Telemetry
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

  // 🎬 Auto-Guided 25s Story Walkthrough State
  const [isTourActive, setIsTourActive] = useState<boolean>(false);
  const [tourStep, setTourStep] = useState<number>(1);
  const tourTimerRef = useRef<NodeJS.Timeout | null>(null);

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

  // 🎬 25s Auto-Story Progression
  const applyTourStep = (step: number) => {
    setTourStep(step);
    if (step === 1) {
      setWavelengthPct(0); // Show clouds
      setIsLoupeActive(false);
      setActiveTab('story');
      setIsMitigationActive(false);
      setSelectedHotspot(currentAOI.hotspots[0]);
    } else if (step === 2) {
      setWavelengthPct(100); // 24cm Radar pierce
      setActiveTab('story');
      setSelectedHotspot(currentAOI.hotspots[0]);
    } else if (step === 3) {
      setActiveTab('cascade');
      setScaleLevel('MICRO');
      setSelectedHotspot(currentAOI.hotspots[1] || currentAOI.hotspots[0]);
    } else if (step === 4) {
      setActiveTab('story');
      if (!isMitigationActive) {
        setIsMitigationActive(true);
      }
      setIsDistrictBriefOpen(true);
    }
  };

  useEffect(() => {
    if (!isTourActive) {
      if (tourTimerRef.current) clearInterval(tourTimerRef.current);
      return;
    }

    applyTourStep(tourStep);

    tourTimerRef.current = setInterval(() => {
      setTourStep((prev) => {
        if (prev >= 4) {
          setIsTourActive(false);
          return 1;
        }
        const next = prev + 1;
        applyTourStep(next);
        return next;
      });
    }, 6200);

    return () => {
      if (tourTimerRef.current) clearInterval(tourTimerRef.current);
    };
  }, [isTourActive, tourStep]);

  const toggleTour = () => {
    if (isTourActive) {
      setIsTourActive(false);
      if (tourTimerRef.current) clearInterval(tourTimerRef.current);
    } else {
      setIsTourActive(true);
      setTourStep(1);
      applyTourStep(1);
    }
  };

  // Tour captions
  const TOUR_CAPTIONS: Record<number, string> = {
    1: 'Step 1/4: Optical Satellites Blinded ☁️ — Heavy monsoon clouds block 92% of visible light, hiding the flooded basin from ordinary disaster response teams.',
    2: 'Step 2/4: DSpace 24cm Radar Pierces Clouds ⚡ — NISAR L-band wavelength bounces off tree trunks standing in water (+6.2 dB), exposing 4.2M m³ of stagnant flood.',
    3: 'Step 3/4: Causal Cascade Identified 🔗 — NH-46 embankment acts as an artificial dam while over-pumped aquifers sink the canal bed by -19.4 mm/year.',
    4: 'Step 4/4: Solution Applied & Action Dossier Ready 📋 — Sluice gate opened, draining the stagnant trap and protecting 14 villages & 6,200 ha cropland!',
  };

  return (
    <div className="h-screen w-screen overflow-hidden grid grid-rows-[56px_48px_1fr_64px] bg-[#03070E] text-slate-100 font-sans select-none relative">
      {/* ROW 1: 56px Header (Logo, Simple/Pro Switcher, Location Dropdown, Tour CTA) */}
      <AppHeader
        currentAOI={currentAOI}
        allAOIs={AOI_SCENARIOS}
        onSelectAOI={(id) => setCurrentAOIId(id)}
        userMode={userMode}
        setUserMode={setUserMode}
        onOpenHowItWorks={() => setIsWelcomeModalOpen(true)}
        isTourActive={isTourActive}
        onToggleTour={toggleTour}
      />

      {/* ROW 2: 48px Wavelength X-Ray Bar (1. Normal Camera -> 2. Standard Radar -> 3. DSpace Radar) */}
      <WavelengthXRayBar
        wavelengthPct={wavelengthPct}
        setWavelengthPct={setWavelengthPct}
        isLoupeActive={isLoupeActive}
        setIsLoupeActive={setIsLoupeActive}
      />

      {/* ROW 3: 1fr Main Workspace (Locked 2 Columns: 1fr Map on Left + 390px Docked Sidebar on Right) */}
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

        {/* Right Column: Docked Inspector Panel with 3 Clean Tabs (Zero Overlap!) */}
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

        {/* 🎬 Bottom-Center Auto-Story Teleprompter Bar */}
        {isTourActive && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-40 w-11/12 max-w-2xl bg-slate-950/95 backdrop-blur-2xl border-2 border-cyan-electric rounded-2xl p-3 shadow-2xl shadow-cyan-500/20 flex flex-col gap-2 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-border-hairline pb-1.5">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-electric animate-ping" />
                <span className="text-xs font-mono font-black text-cyan-electric tracking-wider">
                  🎬 DSPACE 25s STORY TOUR: STEP {tourStep} OF 4
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => {
                    const prev = Math.max(1, tourStep - 1);
                    applyTourStep(prev);
                  }}
                  disabled={tourStep === 1}
                  className="p-1 rounded bg-surface-elevated text-slate-300 disabled:opacity-30 hover:text-white"
                  title="Previous Step"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    const next = Math.min(4, tourStep + 1);
                    applyTourStep(next);
                  }}
                  disabled={tourStep === 4}
                  className="p-1 rounded bg-surface-elevated text-slate-300 disabled:opacity-30 hover:text-white"
                  title="Next Step"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button
                  onClick={toggleTour}
                  className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 text-[10px] font-mono font-bold hover:bg-rose-500/40 ml-1"
                >
                  Exit Tour
                </button>
              </div>
            </div>

            <p className="text-xs font-sans text-slate-100 font-medium leading-relaxed">
              {TOUR_CAPTIONS[tourStep]}
            </p>

            {/* Glowing progress line */}
            <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-electric to-emerald-400 transition-all duration-500"
                style={{ width: `${(tourStep / 4) * 100}%` }}
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
