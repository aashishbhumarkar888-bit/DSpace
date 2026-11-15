import mongoose from 'mongoose';

const orbitalTelemetrySchema = new mongoose.Schema({
  aoiId: { type: String, required: true, index: true },
  passNumber: { type: Number, required: true },
  passDate: { type: String, required: true },
  dayNumber: { type: Number, required: true },
  season: { 
    type: String, 
    enum: ['Pre-Monsoon', 'Peak Monsoon', 'Rabi Harvest', 'Post-Harvest / Winter', 'Surge Event'],
    required: true 
  },
  anomalyIntensity: { type: Number, required: true },
  hhDb: { type: Number, required: true },
  hvDb: { type: Number, required: true },
  cBandHvDb: { type: Number, required: true },
  dihedralS: { type: Number, required: true },
  wlsChi2: { type: Number, required: true },
  gunwDisplacementMm: { type: Number, required: true },
  closurePhaseRad: { type: Number, required: true },
  confidencePct: { type: Number, required: true }
}, { timestamps: true });

orbitalTelemetrySchema.index({ aoiId: 1, passNumber: 1 }, { unique: true });

export default mongoose.models.OrbitalTelemetry || mongoose.model('OrbitalTelemetry', orbitalTelemetrySchema);
