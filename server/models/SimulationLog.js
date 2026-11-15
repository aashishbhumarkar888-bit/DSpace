import mongoose from 'mongoose';

const simulationLogSchema = new mongoose.Schema({
  aoiId: { type: String, required: true },
  interventionType: { type: String, required: true },
  villagesSaved: { type: Number, required: true },
  hectaresRecovered: { type: Number, required: true },
  economicValueProtected: { type: String, required: true },
  solverLatencyMs: { type: Number, default: 28 },
  ipAddress: { type: String, default: '127.0.0.1' },
  timestamp: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.models.SimulationLog || mongoose.model('SimulationLog', simulationLogSchema);
