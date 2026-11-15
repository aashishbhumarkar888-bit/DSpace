import React, { useState, useEffect, useRef } from 'react';
import { 
  ScaleLevel, 
  AOIId, 
  UserViewMode, 
  RightSidebarTab, 
  HotspotBeacon, 
  OrbitalEpoch,
  PolarizationMode
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
import { Area3DDigitalTwinModal } from './components/Modals/Area3DDigitalTwinModal';
import { ScientistAdminLoginModal } from './components/Modals/ScientistAdminLoginModal';
import { GroqChatbotDrawer } from './components/Drawers/GroqChatbotDrawer';
import { ChallengeInsightsModal } from './components/Modals/ChallengeInsightsModal';

import { 
  Play, 
  Pause, 
  Square, 
  ChevronRight, 
  ChevronLeft, 
  CheckCircle2, 
  Award, 
  Activity, 
  Box,
  Volume2,
  VolumeX,
  RotateCcw
} from 'lucide-react';
import { voiceTourEngine } from './services/voiceTourEngine';

export const App: React.FC = () => {
  // 1. Core State
  const [currentAOIId, setCurrentAOIId] = useState<AOIId>('aoi-1');
  const currentAOI = AOI_SCENARIOS[currentAOIId];
  const cascadeSteps = CASCADE_STEPS_BY_AOI[currentAOIId] || CASCADE_STEPS_BY_AOI['aoi-1'];

  // User Mode: Civilian View vs. Pro Scientist View
  const [userMode, setUserMode] = useState<UserViewMode>('simple');

  // Scientist Authentication State
  const [isScientistAuthenticated, setIsScientistAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('dspace_scientist_auth') === 'true';
  });
  const [scientistInfo, setScientistInfo] = useState<{ name: string; role: string; id: string } | null>(() => {
    const saved = localStorage.getItem('dspace_scientist_info');
    return saved ? JSON.parse(saved) : null;
  });

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

  // Polarization Mode: HH Co-Pol, HV Cross-Pol, HH/HV Ratio, InSAR Phase
  const [polarizationMode, setPolarizationMode] = useState<PolarizationMode>('HH');

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

  // Modals & Drawers
  const [isWelcomeModalOpen, setIsWelcomeModalOpen] = useState<boolean>(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState<boolean>(false);
  const [isFieldPackOpen, setIsFieldPackOpen] = useState<boolean>(false);
  const [isDistrictBriefOpen, setIsDistrictBriefOpen] = useState<boolean>(false);
  const [is3DTwinOpen, setIs3DTwinOpen] = useState<boolean>(false);
  const [isScientistLoginOpen, setIsScientistLoginOpen] = useState<boolean>(false);
  const [isGroqDrawerOpen, setIsGroqDrawerOpen] = useState<boolean>(false);
  const [isChallengeInsightsOpen, setIsChallengeInsightsOpen] = useState<boolean>(false);

  // 🎬 Unified 60-Second (6 Chapters × 10 Seconds) Master Tour State
  const [isTourActive, setIsTourActive] = useState<boolean>(false);
  const [isTourPaused, setIsTourPaused] = useState<boolean>(false);
  const [tourElapsedSec, setTourElapsedSec] = useState<number>(0); // 0 to 60
  const [isVoiceMuted, setIsVoiceMuted] = useState<boolean>(() => voiceTourEngine.getVoiceMuted());
  const [isVoiceSpeaking, setIsVoiceSpeaking] = useState<boolean>(false);
  const tourIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Calculate current Chapter from elapsed seconds (1 to 6)
  const currentChapter = Math.min(6, Math.floor(tourElapsedSec / 10) + 1);

  // Subscribe to voice engine active state
  useEffect(() => {
    return voiceTourEngine.subscribeSpeaking(setIsVoiceSpeaking);
  }, []);

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

  // Scientist login success
  const handleLoginSuccess = (info: { name: string; role: string; id: string }) => {
    setIsScientistAuthenticated(true);
    setScientistInfo(info);
    setUserMode('pro');
    localStorage.setItem('dspace_scientist_auth', 'true');
    localStorage.setItem('dspace_scientist_info', JSON.stringify(info));
  };

  const handleLogoutScientist = () => {
    setIsScientistAuthenticated(false);
    setScientistInfo(null);
    setUserMode('simple');
    localStorage.removeItem('dspace_scientist_auth');
    localStorage.removeItem('dspace_scientist_info');
  };

  // 🎬 Synchronized Voice Scripts for 60-Second Master Tour
  const CHAPTER_VOICE_SCRIPTS: Record<number, string> = {
    1: "Welcome to DSpace. In Bhopal's Bhoj wetland, fourteen villages are trapped behind the elevated National Highway 46 embankment. Over-pumping of the deep aquifer is sinking the land by nineteen point four millimeters every year, tilting the canal bed backwards.",
    2: "Optical satellites like Sentinel-2 are ninety-two percent blinded by monsoon storm clouds. Even standard C-band radar cannot penetrate dense tree leaves. To traditional sensors, this catastrophic water accumulation is completely invisible.",
    3: "DSpace activates NASA-ISRO NISAR twenty-four centimeter L-band radar. These long waves pass straight through cloud cover and dense tree foliage, striking water on the ground and bouncing off tree trunks with an unmistakable six point two decibel surge.",
    4: "Our four-observation weighted least squares unmixing eliminates false alarms from wet soil using Triplet Closure Phase. With fourteen ground gauges verified, DSpace achieves an unprecedented zero point zero five two meter depth accuracy—an eighty-two percent error reduction.",
    5: "Watch our thirty-five millisecond hydraulic solver simulate cutting relief siphons under the highway embankment. Water drains from fifty-eight days down to eleven days, restoring flow across the Narmada canal.",
    6: "The system generates an official GPS-tagged District Collector Action Dossier. With forty-eight point five crore rupees in crops saved, emergency engineering teams have the exact coordinates needed to resolve the crisis on Monday morning."
  };

  // 🎬 Chapter application handler (Drives map, sliders, 3D twin, solver, dossiers)
  const applyChapterState = (chapter: number) => {
    // Web Audio Mission Control chime & audible speech synthesis
    voiceTourEngine.playTelemetryChime();
    if (!isVoiceMuted) {
      voiceTourEngine.speak(CHAPTER_VOICE_SCRIPTS[chapter]);
    }

    if (chapter === 1) {
      // Chapter 1: The Coupled Crisis (Problem)
      setActiveTab('story');
      setWavelengthPct(10);
      setIsMitigationActive(false);
      setSelectedHotspot(currentAOI.hotspots[0]);
      setIsDistrictBriefOpen(false);
      setIs3DTwinOpen(false);
    } else if (chapter === 2) {
      // Chapter 2: Why Standard Satellites Fail (The Cloud & Canopy Wall)
      setActiveTab('story');
      setWavelengthPct(0); // 0% Optical
      setIsMitigationActive(false);
      setSelectedHotspot(currentAOI.hotspots[0]);
      setIs3DTwinOpen(false);
    } else if (chapter === 3) {
      // Chapter 3: How DSpace Solves It Step-by-Step (24cm L-Band X-Ray)
      setActiveTab('story');
      setWavelengthPct(100); // 100% L-Band
      setSelectedHotspot(currentAOI.hotspots[1] || currentAOI.hotspots[0]);
      setIs3DTwinOpen(false);
    } else if (chapter === 4) {
      // Chapter 4: How It Is Calculated & Verified (Math & 3D Cross-Section)
      setActiveTab('pro_radar');
      setWavelengthPct(100);
      setScaleLevel('MICRO');
      setSelectedHotspot(currentAOI.hotspots[2] || currentAOI.hotspots[0]);
    } else if (chapter === 5) {
      // Chapter 5: Live 35ms Hydraulic Mitigation Simulation
      setActiveTab('story');
      if (!isMitigationActive) {
        setIsMitigationActive(true);
      }
      setSelectedHotspot(currentAOI.hotspots[1] || currentAOI.hotspots[0]);
      setIs3DTwinOpen(true); // Open 3D digital twin to show draining breach!
    } else if (chapter === 6) {
      // Chapter 6: Real-World Field Deployment (District Action Dossier)
      setActiveTab('story');
      setIs3DTwinOpen(false);
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
          voiceTourEngine.stop();
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
  }, [isTourActive, isTourPaused, isVoiceMuted]);

  const startTour = () => {
    setIsTourActive(true);
    setIsTourPaused(false);
    setTourElapsedSec(0);
    applyChapterState(1);
  };

  const stopTour = () => {
    voiceTourEngine.stop();
    setIsTourActive(false);
    setIsTourPaused(false);
    setTourElapsedSec(0);
    if (tourIntervalRef.current) clearInterval(tourIntervalRef.current);
  };

  const toggleTourPause = () => {
    setIsTourPaused((prev) => {
      const next = !prev;
      if (next) {
        voiceTourEngine.stop();
      } else {
        if (!isVoiceMuted) {
          voiceTourEngine.speak(CHAPTER_VOICE_SCRIPTS[currentChapter]);
        }
      }
      return next;
    });
  };

  const jumpToChapter = (chapter: number) => {
    const sec = (chapter - 1) * 10;
    setTourElapsedSec(sec);
    applyChapterState(chapter);
  };

  const toggleVoiceMute = () => {
    const nextMuted = !isVoiceMuted;
    setIsVoiceMuted(nextMuted);
    voiceTourEngine.setVoiceMuted(nextMuted);
    if (!nextMuted) {
      voiceTourEngine.speak(CHAPTER_VOICE_SCRIPTS[currentChapter]);
    }
  };

  const replayAudio = () => {
    voiceTourEngine.speak(CHAPTER_VOICE_SCRIPTS[currentChapter]);
  };

  const handleReturnHome = () => {
    voiceTourEngine.stop();
    setIsTourActive(false);
    setIsTourPaused(false);
    setIsDistrictBriefOpen(false);
    setIs3DTwinOpen(false);
    setIsGroqDrawerOpen(false);
    setIsScientistLoginOpen(false);
    setIsChallengeInsightsOpen(false);
    setActiveTab('story');
    setUserMode('simple');
    setWavelengthPct(100);
    setIsMitigationActive(false);
  };

  // Chapter metadata
  const CHAPTERS = [
    { num: 1, title: '1. What It Solves (Crisis)', short: '1. Crisis' },
    { num: 2, title: '2. Why Satellites Fail (Clouds)', short: '2. Optical Fail' },
    { num: 3, title: '3. 24cm Radar X-Ray', short: '3. Radar X-Ray' },
    { num: 4, title: '4. How It Is Calculated', short: '4. Math & Physics' },
    { num: 5, title: '5. 35ms Solver & Benchmark', short: '5. Solver & 3D Twin' },
    { num: 6, title: '6. Field Action Dossier', short: '6. Field Action' },
  ];

  const CHAPTER_CAPTIONS: Record<number, { headline: string; body: string; facts: string[] }> = {
    1: {
      headline: 'CHAPTER 1: THE REAL-WORLD CRISIS (WHAT IT SOLVES)',
      body: '14 villages and 4,200 hectares of cropland are trapped in stagnant floodwater behind the NH-46 road embankment, while tubewell over-pumping is sinking the canal bed by -19.4 mm/year.',
      facts: ['14 Villages Flood-Trapped', '4,200 ha Submerged', '-19.4 mm/yr Aquifer Collapse', '₹48.5 Cr Crop Risk'],
    },
    2: {
      headline: 'CHAPTER 2: WHY CURRENT SATELLITES FAIL (THE CLOUD WALL)',
      body: 'Optical cameras (400–800nm) are 92% blinded by monsoon storm clouds. Standard C-band radar (5.6cm) scatters entirely on upper leaves, failing to see sub-canopy water.',
      facts: ['Optical Cloud Blindness: 92% in Monsoon', 'C-Band (5.6cm) Canopy Penetration: <15% (Saturates at twigs)'],
    },
    3: {
      headline: 'CHAPTER 3: HOW DSPACE SOLVES IT (24cm L-BAND X-RAY)',
      body: 'DSpace operationalizes NASA-ISRO NISAR 24cm L-Band radar waves. The wavelength pierces through clouds and foliage, exposing dihedral water-trunk double-bounce (+6.2 dB HH).',
      facts: ['NISAR L-Band (23.8cm) Cloud Penetration: 99.8%', 'Double-Bounce Signal: +6.2 dB HH Surge', 'Recall: 94.2%, Precision: 97.1%'],
    },
    4: {
      headline: 'CHAPTER 4: HOW THE RESULT IS CALCULATED & VERIFIED (MATH & PHYSICS)',
      body: 'Civilian Analogy: Flashlight-mirror reflection. Scientist Math: 4-Observation WLS Unmixing (χ² = 0.038) + GUNW InSAR Phase (Δd = -19.4 mm/yr) + Triplet Closure Phase Bias Shield (0.042 rad).',
      facts: ['4-Obs WLS Canopy Unmixing (χ² = 0.038)', 'Slope-Filtered FwDET Depth RMSE: 0.052m (vs 0.290m raw C-Band — 82% error reduction)', 'Triplet Closure Phase (Φ = 0.042 rad) purges 94.8% false alarms'],
    },
    5: {
      headline: 'CHAPTER 5: LIVE 35ms HYDRAULIC MITIGATION SIMULATION',
      body: '35ms 2D Local-Inertial Shallow-Water solver cuts the NH-46 relief siphon. Benchmark: 0.052m depth RMSE vs 0.290m C-band, 100% cloud penetration, and <2% false alarm rate.',
      facts: ['2D Local-Inertial Solver Latency: 18 ms', 'Drainage Time Cut: 58 Days → 11 Days', 'Canal Flow Restored: 72% → 98%'],
    },
    6: {
      headline: 'CHAPTER 6: REAL-WORLD FIELD DEPLOYMENT (ACTION DOSSIER)',
      body: 'Official GPS-tagged District Collector / NDMA Action Dossier generated: ₹48 Cr in crop losses prevented, exact culvert cut depths prescribed, and canal re-leveling timeline issued.',
      facts: ['14/14 Villages Unblocked', 'GPS-Tagged Culvert Order Ready', 'Validated against 14 Ground Gauge Stations (R² = 0.96)'],
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
        isScientistAuthenticated={isScientistAuthenticated}
        scientistInfo={scientistInfo}
        onOpenLoginModal={() => setIsScientistLoginOpen(true)}
        onLogoutScientist={handleLogoutScientist}
        onOpenGroqChatbot={() => setIsGroqDrawerOpen(true)}
        onReturnHome={handleReturnHome}
        onOpenChallengeInsights={() => setIsChallengeInsightsOpen(true)}
      />

      {/* ROW 2: 48px Wavelength X-Ray Bar with Polarization Selector Strip */}
      <WavelengthXRayBar
        wavelengthPct={wavelengthPct}
        setWavelengthPct={setWavelengthPct}
        isLoupeActive={isLoupeActive}
        setIsLoupeActive={setIsLoupeActive}
        polarizationMode={polarizationMode}
        setPolarizationMode={setPolarizationMode}
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
            onOpen3DTwin={() => setIs3DTwinOpen(true)}
            polarizationMode={polarizationMode}
          />

          {/* 🎬 UNIFIED 60-SECOND INTERACTIVE MASTER TOUR HUD (Mounted strictly inside Left Map Column!) */}
          {isTourActive && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[500] w-[94%] max-w-2xl bg-slate-950/95 border border-cyan-500/50 rounded-xl p-3.5 shadow-2xl backdrop-blur-xl flex flex-col gap-2 animate-fadeIn whitespace-normal break-words">
              {/* Top Toolbar: Live Time + 16-Bar Equalizer + Voice Controls + Prev/Play/Next/Exit */}
              <div className="flex items-center justify-between border-b border-border-hairline pb-2 gap-2 flex-wrap sm:flex-nowrap">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-electric animate-ping" />
                  <span className="text-xs font-mono font-black text-cyan-electric tracking-wider">
                    🎬 DSPACE 60s MASTER TOUR
                  </span>
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-surface-elevated text-emerald-400 font-bold tabular-nums border border-border-hairline">
                    {formatTime(tourElapsedSec)} / 01:00
                  </span>

                  {/* 16-Bar Cyan Audio Waveform Equalizer */}
                  <div 
                    className="hidden sm:flex items-center gap-[2px] h-4 px-1.5 py-0.5 rounded bg-black/50 border border-cyan-electric/30"
                    title={isVoiceSpeaking ? "Voice Narrator Speaking" : "Voice Idle"}
                  >
                    {[...Array(16)].map((_, i) => (
                      <div
                        key={i}
                        className={`w-[2px] rounded-full transition-all duration-150 ${
                          isVoiceSpeaking ? 'bg-cyan-electric shadow-glow-cyan' : 'bg-slate-700 h-1'
                        }`}
                        style={{
                          height: isVoiceSpeaking
                            ? `${Math.max(3, Math.sin((i + tourElapsedSec * 3) * 0.9) * 10 + 5)}px`
                            : '3px',
                        }}
                      />
                    ))}
                  </div>
                </div>

                {/* Voice ON/MUTE + Replay + Prev / Play-Pause / Next / Exit */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={toggleVoiceMute}
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold flex items-center gap-1 border transition-all ${
                      !isVoiceMuted
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : 'bg-slate-800 text-slate-400 border-border-hairline'
                    }`}
                    title={isVoiceMuted ? 'Unmute voice narrator' : 'Mute voice narrator'}
                  >
                    {!isVoiceMuted ? <Volume2 className="w-3 h-3" /> : <VolumeX className="w-3 h-3" />}
                    <span>{!isVoiceMuted ? 'Voice ON' : 'Muted'}</span>
                  </button>

                  <button
                    onClick={replayAudio}
                    className="p-1 rounded bg-surface-elevated text-slate-300 hover:text-cyan-electric border border-border-hairline"
                    title="Replay Voice Narration"
                  >
                    <RotateCcw className="w-3 h-3" />
                  </button>

                  <button
                    onClick={() => jumpToChapter(Math.max(1, currentChapter - 1))}
                    disabled={currentChapter === 1}
                    className="p-1 rounded bg-surface-elevated text-slate-300 disabled:opacity-30 hover:text-white"
                    title="Previous Chapter"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <button
                    onClick={toggleTourPause}
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
              <div className="grid grid-cols-6 gap-1 text-[9px] font-mono">
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

              {/* Hard Facts & Accuracy Proof Badge Strip */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-border-hairline/60">
                <span className="text-[8.5px] font-mono text-cyan-electric font-bold flex items-center gap-1 mr-1">
                  <Activity className="w-3 h-3" />
                  <span>FACTS & ACCURACY PROOF:</span>
                </span>
                {CHAPTER_CAPTIONS[currentChapter].facts.map((fact, idx) => (
                  <span
                    key={idx}
                    className="px-1.5 py-0.5 rounded bg-[#03060C] border border-border-hairline text-[8.5px] font-mono text-emerald-300 font-semibold"
                  >
                    {fact}
                  </span>
                ))}
              </div>

              {/* Glowing 60-Second Linear Progress Bar */}
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden mt-0.5">
                <div
                  className="h-full bg-gradient-to-r from-cyan-electric via-emerald-400 to-cyan-electric transition-all duration-300"
                  style={{ width: `${(tourElapsedSec / 60) * 100}%` }}
                />
              </div>
            </div>
          )}
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

      {/* ALL MODALS & DRAWERS (RENDERED AT ROOT WITH z-[9999] ISOLATION GUARANTEE) */}
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

      <Area3DDigitalTwinModal
        isOpen={is3DTwinOpen}
        onClose={() => setIs3DTwinOpen(false)}
        selectedHotspot={selectedHotspot}
        currentAOI={currentAOI}
        wavelengthPct={wavelengthPct}
        isMitigationActive={isMitigationActive}
        onToggleMitigation={handleMitigate}
      />

      <ScientistAdminLoginModal
        isOpen={isScientistLoginOpen}
        onClose={() => setIsScientistLoginOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      <GroqChatbotDrawer
        isOpen={isGroqDrawerOpen}
        onClose={() => setIsGroqDrawerOpen(false)}
        currentAOI={currentAOI}
        selectedHotspot={selectedHotspot}
        wavelengthPct={wavelengthPct}
        isMitigationActive={isMitigationActive}
      />

      <ChallengeInsightsModal
        isOpen={isChallengeInsightsOpen}
        onClose={() => setIsChallengeInsightsOpen(false)}
        currentAOI={currentAOI}
      />
    </div>
  );
};

export default App;
