export type ScaleLevel = 'MICRO' | 'MESO' | 'MACRO';

export type AOIId = 'aoi-1' | 'aoi-2' | 'aoi-3' | 'aoi-4';

export type UserViewMode = 'simple' | 'pro';

export type RightSidebarTab = 'story' | 'cascade' | 'pro_radar';

export interface HotspotBeacon {
  id: string;
  number: 1 | 2 | 3 | 4;
  name: string;
  shortName: string;
  subtitle: string;
  lat: number;
  lng: number;
  type: 'flood' | 'subsidence' | 'infrastructure' | 'fault' | 'glacier' | 'critical';
  scale: ScaleLevel;
  telemetryDelta: string;
  actionPrompt: string;
  description: string;
  metricValue: string;
}

export interface AOIScenario {
  aoiId: AOIId;
  name: string;
  tagline: string;
  region: string;
  coordinates: {
    lat: number;
    lng: number;
    zoom: number;
    elevation: number;
  };
  granuleId: string;
  orbitPass: string;
  hazardType: string;
  plainEnglishSummary: {
    crisis: string;
    whyMissed: string;
    howFound: string;
    impactBefore: string;
    impactAfter: string;
    villagesSaved: number;
    hectaresRecovered: number;
    economicValueProtected: string;
  };
  hotspots: HotspotBeacon[];
  baselineMetrics: {
    roughnessHV_dB: number;
    dielectricHH_dB: number;
    phaseMotion_mm: number;
    flowVelocityMs: number;
    closurePhaseRad: number;
    wlsResidualChi2: number;
    unmixedDihedral_s_dB: number;
  };
  mitigatedMetrics: {
    roughnessHV_dB: number;
    dielectricHH_dB: number;
    phaseMotion_mm: number;
    flowVelocityMs: number;
    closurePhaseRad: number;
    confidenceScore: number;
  };
  mitigationPlan: {
    actionTitle: string;
    actionDescription: string;
    predictedRecoveryDays: number;
  };
}

export interface CompactCascadeStep {
  stepNumber: 1 | 2 | 3 | 4;
  title: string;
  phaseCategory: '1. TRIGGER' | '2. RADAR SHIFT' | '3. SURFACE MOTION' | '4. INFRASTRUCTURE RISK';
  description: string;
  satelliteBand: string;
  equation: string;
  scale: ScaleLevel;
  metricBadge: string;
  layerHighlightKey: 'optical' | 'polarimetry' | 'phase' | 'flow';
}

export interface OrbitalEpoch {
  epochIndex: number;
  passDate: string;
  dayNumber: number;
  season: 'Pre-Monsoon' | 'Peak Monsoon' | 'Rabi Harvest' | 'Post-Harvest / Winter' | 'Surge Event';
  anomalyIntensity: number;
  hhDrift: number;
  hvDrift: number;
  phaseDrift: number;
}
