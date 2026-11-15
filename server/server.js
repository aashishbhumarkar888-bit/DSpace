import express from 'express';
import cors from 'cors';
import { connectDB, getConnectionStatus } from './db.js';
import ScenarioAOI from './models/ScenarioAOI.js';
import OrbitalTelemetry from './models/OrbitalTelemetry.js';
import CascadeStep from './models/CascadeStep.js';
import SimulationLog from './models/SimulationLog.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const seedJsonPath = path.resolve(__dirname, '../src/data/mongoSeedData.json');
const seedData = JSON.parse(fs.readFileSync(seedJsonPath, 'utf-8'));

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Initialize DB connection
connectDB();

// 1. Health & Connection Status
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    engine: 'DSpace Microwave Radar Analytics',
    mongoConnected: getConnectionStatus(),
    storageMode: getConnectionStatus() ? 'MongoDB Active' : 'Static Seed Cache Fallback',
    timestamp: new Date().toISOString()
  });
});

// 2. Get All AOIs
app.get('/api/aois', async (req, res) => {
  try {
    if (getConnectionStatus()) {
      const aois = await ScenarioAOI.find({}).lean();
      if (aois && aois.length > 0) {
        return res.json({ source: 'mongodb', data: aois });
      }
    }
  } catch (err) {
    console.warn('[API /api/aois] MongoDB read error, falling back to JSON:', err.message);
  }
  res.json({ source: 'static_seed_fallback', data: seedData.aois });
});

// 3. Get Single AOI by ID
app.get('/api/aois/:id', async (req, res) => {
  const { id } = req.params;
  try {
    if (getConnectionStatus()) {
      const aoi = await ScenarioAOI.findOne({ aoiId: id }).lean();
      if (aoi) return res.json({ source: 'mongodb', data: aoi });
    }
  } catch (err) {
    console.warn(`[API /api/aois/${id}] MongoDB error:`, err.message);
  }
  const fallback = seedData.aois.find((a) => a.aoiId === id) || seedData.aois[0];
  res.json({ source: 'static_seed_fallback', data: fallback });
});

// 4. Get 60-Pass Orbital Telemetry for AOI
app.get('/api/telemetry/:aoiId', async (req, res) => {
  const { aoiId } = req.params;
  try {
    if (getConnectionStatus()) {
      const telemetry = await OrbitalTelemetry.find({ aoiId }).sort({ passNumber: 1 }).lean();
      if (telemetry && telemetry.length > 0) {
        return res.json({ source: 'mongodb', data: telemetry });
      }
    }
  } catch (err) {
    console.warn(`[API /api/telemetry/${aoiId}] MongoDB error:`, err.message);
  }

  const passes = [];
  const baseDate = new Date('2025-01-01');
  for (let i = 0; i < 60; i++) {
    const d = new Date(baseDate.getTime() + i * 12 * 86400000);
    const day = i * 12;
    let season = 'Pre-Monsoon';
    if (day >= 180 && day < 300) season = 'Peak Monsoon';
    else if (day >= 300 && day < 450) season = 'Rabi Harvest';
    else if (day >= 450 && day < 600) season = 'Post-Harvest / Winter';
    else if (day >= 600) season = 'Surge Event';

    const angle = (i / 60) * Math.PI * 4;
    let anomaly = 0.05;
    if (i >= 24 && i <= 44) {
      anomaly = Math.max(0.1, 1.0 - (Math.abs(i - 34) / 12) * 0.9);
    }

    passes.push({
      aoiId,
      passNumber: i + 1,
      passDate: d.toISOString().slice(0, 10),
      dayNumber: day,
      season,
      anomalyIntensity: Number(anomaly.toFixed(2)),
      hhDb: Number((-14 + Math.sin(angle) * 4 + (anomaly > 0.4 ? anomaly * 8.5 : 0)).toFixed(1)),
      hvDb: Number((-20 + Math.cos(angle) * 3 - (anomaly > 0.4 ? anomaly * 6.2 : 0)).toFixed(1)),
      cBandHvDb: Number((-18 + Math.cos(angle) * 2).toFixed(1)),
      dihedralS: Number((anomaly > 0.4 ? 6.2 : 1.2).toFixed(1)),
      wlsChi2: 0.038,
      gunwDisplacementMm: Number((-2 + Math.sin(angle) * 2 - (anomaly > 0.4 ? anomaly * 22 : 0)).toFixed(1)),
      closurePhaseRad: Number((0.04 + (anomaly > 0.4 ? 0.02 : 0)).toFixed(3)),
      confidencePct: Number((94.8 - (anomaly > 0.5 ? 2.4 : 0)).toFixed(1))
    });
  }

  res.json({ source: 'computed_fallback', data: passes });
});

// 5. Post Simulation Log
app.post('/api/simulate', async (req, res) => {
  const { aoiId, interventionType, villagesSaved, hectaresRecovered, economicValueProtected } = req.body;
  const logData = {
    aoiId: aoiId || 'aoi-1',
    interventionType: interventionType || 'Emergency Relief Siphon',
    villagesSaved: Number(villagesSaved) || 14,
    hectaresRecovered: Number(hectaresRecovered) || 4200,
    economicValueProtected: economicValueProtected || '₹48 Cr',
    solverLatencyMs: Math.floor(Math.random() * 12) + 22,
    timestamp: new Date()
  };

  try {
    if (getConnectionStatus()) {
      const saved = await SimulationLog.create(logData);
      return res.status(201).json({ success: true, loggedTo: 'mongodb', log: saved });
    }
  } catch (err) {
    console.warn('[API /api/simulate] DB save error:', err.message);
  }

  res.status(201).json({ success: true, loggedTo: 'in_memory_fallback', log: logData });
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`[DSpace API Server] Running on http://localhost:${PORT}`);
  });
}

export default app;
