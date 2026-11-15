import mongoose from 'mongoose';

const cascadeStepSchema = new mongoose.Schema({
  aoiId: { type: String, required: true, index: true },
  stepNumber: { type: Number, required: true },
  phaseCategory: { 
    type: String, 
    enum: ['1. TRIGGER', '2. RADAR SHIFT', '3. SURFACE MOTION', '4. INFRASTRUCTURE RISK'],
    required: true 
  },
  title: { type: String, required: true },
  description: { type: String, required: true },
  satelliteBand: { type: String, required: true },
  equation: { type: String, required: true },
  scale: { type: String, enum: ['MICRO', 'MESO', 'MACRO'], required: true },
  metricBadge: { type: String, required: true },
  layerHighlightKey: { type: String, required: true }
}, { timestamps: true });

cascadeStepSchema.index({ aoiId: 1, stepNumber: 1 }, { unique: true });

export default mongoose.models.CascadeStep || mongoose.model('CascadeStep', cascadeStepSchema);
