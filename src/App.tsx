import React, { useState, useEffect } from 'react';
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

  return (
    <div className="h-screen w-screen overflow-hidden grid grid-rows-[56px_48px_1fr_64px] bg-[#03070E] text-slate-100 font-sans select-none">
      {/* ROW 1: 56px Header (Logo, Simple/Pro Switcher, Location Dropdown, Tour CTA) */}
      <AppHeader
        currentAOI={currentAOI}
        allAOIs={AOI_SCENARIOS}
        onSelectAOI={(id) => setCurrentAOIId(id)}
        userMode={userMode}
        setUserMode={setUserMode}
        onOpenHowItWorks={() => setIsWelcomeModalOpen(true)}
      />

      {/* ROW 2: 48px Wavelength X-Ray Bar (1. Normal Camera -> 2. Standard Radar -> 3. DSpace Radar) */}
      <WavelengthXRayBar
        wavelengthPct={wavelengthPct}
        setWavelengthPct={setWavelengthPct}
        isLoupeActive={isLoupeActive}
        setIsLoupeActive={setIsLoupeActive}
      />

      {/* ROW 3: 1fr Main Workspace (Locked 2 Columns: 1fr Map on Left + 390px Docked Sidebar on Right) */}
      <main className="grid grid-cols-[1fr_390px] h-full min-h-0 overflow-hidden p-2 gap-2">
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
          />
        </section>
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
    </div>
  );
};

export default App;
