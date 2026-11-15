import mongoose from 'mongoose';

const hotspotSchema = new mongoose.Schema({
  id: { type: String, required: true },
  number: { type: Number, required: true },
  name: { type: String, required: true },
  shortName: { type: String, required: true },
  subtitle: { type: String, required: true },
  lat: { type: Number, required: true },
  lng: { type: Number, required: true },
  type: { type: String, enum: ['flood', 'subsidence', 'infrastructure', 'fault', 'glacier', 'critical'], required: true },
  scale: { type: String, enum: ['MICRO', 'MESO', 'MACRO'], required: true },
  telemetryDelta: { type: String, required: true },
  actionPrompt: { type: String, required: true },
  description: { type: String, required: true },
  metricValue: { type: String, required: true }
});

const scenarioAOISchema = new mongoose.Schema({
  aoiId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  tagline: { type: String, required: true },
  region: { type: String, required: true },
  coordinates: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    zoom: { type: Number, default: 13 },
    elevation: { type: Number, required: true }
  },
  granuleId: { type: String, required: true },
  orbitPass: { type: String, required: true },
  hazardType: { type: String, required: true },
  plainEnglishSummary: {
    crisis: { type: String, required: true },
    whyMissed: { type: String, required: true },
    howFound: { type: String, required: true },
    impactBefore: { type: String, required: true },
    impactAfter: { type: String, required: true },
    villagesSaved: { type: Number, required: true },
    hectaresRecovered: { type: Number, required: true },
    economicValueProtected: { type: String, required: true }
  },
  hotspots: [hotspotSchema],
  baselineMetrics: {
    roughnessHV_dB: { type: Number, required: true },
    dielectricHH_dB: { type: Number, required: true },
    phaseMotion_mm: { type: Number, required: true },
    flowVelocityMs: { type: Number, required: true },
    closurePhaseRad: { type: Number, required: true },
    wlsResidualChi2: { type: Number, required: true },
    unmixedDihedral_s_dB: { type: Number, required: true }
  },
  mitigatedMetrics: {
    roughnessHV_dB: { type: Number, required: true },
    dielectricHH_dB: { type: Number, required: true },
    phaseMotion_mm: { type: Number, required: true },
    flowVelocityMs: { type: Number, required: true },
    closurePhaseRad: { type: Number, required: true },
    confidenceScore: { type: Number, required: true }
  },
  mitigationPlan: {
    actionTitle: { type: String, required: true },
    actionDescription: { type: String, required: true },
    predictedRecoveryDays: { type: Number, required: true }
  }
}, { timestamps: true });

export default mongoose.models.ScenarioAOI || mongoose.model('ScenarioAOI', scenarioAOISchema);
