# 🛰️ DSpace — Deep-Space Radar Surface Intelligence
> **Turning NASA-ISRO NISAR's 24cm radar physics into plain-English Earth surface insights—from 1-millimeter ground sinking to 100-kilometer glacier surges.**

[![Stack](https://img.shields.io/badge/Stack-React%2018%20%7C%20TypeScript%20%7C%20Tailwind-00F0FF?style=flat-square)](#)
[![Database](https://img.shields.io/badge/Database-MongoDB%20%2B%20Mongoose-00E676?style=flat-square)](#)
[![Physics](https://img.shields.io/badge/SAR%20Engine-NISAR%20GCOV%20%7C%20GUNW%20%7C%20GOFF-FF2A85?style=flat-square)](#)
[![Live UI](https://img.shields.io/badge/UI-Zero--Overlap%20CSS%20Grid-FFB800?style=flat-square)](#)

---

## 🌍 What is DSpace? (For Everyone)

Standard optical satellites act like phone cameras—they are **blinded by monsoon storm clouds, wildfire smoke, and dense tree canopies**, and they cannot measure millimeter-scale underground sinking.

**DSpace** uses NASA-ISRO's **NISAR L-Band (24 cm)** and **S-Band (9.3 cm)** radar waves like a medical X-Ray for Earth:

1. **✨ Simple Citizen Mode:** Understand any surface crisis in 3 clicks:
   - **🎬 25s Auto-Story Demo:** Click one button to watch an automated 4-step walkthrough of cloud blindness, radar X-ray reveal, causal cascade attribution, and solution delivery.
   - **⚖️ Split-Screen Comparison Curtain:** Drag a vertical slider (`◄ | ►`) across the map to see *"What Normal Satellites See (Clouds)"* on the left vs. *"What DSpace 24cm Radar Sees (Ground Truth)"* on the right.
   - **🟢 Plain-English Translators:** Every complex number (`-19.4 mm/yr`, `+6.2 dB`) is paired with a plain-English translation and color-coded severity meter (`🟢 SAFE`, `🟡 WATCH`, `🔴 CRITICAL`).
   - **📋 Official District Collector Action Dossier:** Generate a one-click printable NDMA brief with GPS coordinates, engineering prescriptions, and economic impact metrics.
2. **🔬 Pro Scientist Mode:** Inspect the 3-Vector Microwave Physics Fingerprint (**Roughness $\Delta HV$**, **Dielectric Moisture $\varepsilon$**, and **InSAR Phase Motion $\Delta \phi$**), Triplet Closure Phase ($\Phi = \phi_{12} + \phi_{23} - \phi_{13}$) bias shielding, and real-time Web Audio surface sonification.

---

## ⚡ Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/aashishbhumarkar888-bit/DSpace.git
cd DSpace

# 2. Install dependencies
npm install

# 3. (Optional) Seed MongoDB with 60-pass orbital telemetry & AOI scenarios
# Note: App automatically falls back to built-in MongoDB seed JSON if local mongod is offline
npm run seed

# 4. Start the development server
npm run dev
```

Visit **`http://localhost:5173/`** to view the live DSpace Mission Control.

---

## 🧭 Core Features & Breakthroughs

| Feature | What It Does |
|:---|:---|
| **🎬 25s Auto-Play Story Demo** | Guided 4-step automated walkthrough with a bottom teleprompter bar demonstrating cloud penetration, radar discovery, causal cascade, and solution impact. |
| **⚖️ Interactive Split-Screen Curtain** | Draggable vertical divider across the satellite map showing optical clouds on the left and 24cm radar sub-canopy water & ground sinking on the right. |
| **🟢 Plain-English Metric Translators** | Self-explanatory cards with severity meters (`🟢 SAFE`, `🟡 WATCH`, `🔴 CRITICAL`) and plain-English translations for all radar telemetry. |
| **💡 Tap-to-Learn Micro-Glossary** | Friendly 2-line real-world analogies for technical terms (`Double-Bounce`, `InSAR Phase`, `Closure Phase`, `Manning's Slope`). |
| **📋 District Collector Action Dossier** | Printable NDMA-compliant executive decision brief with GPS coordinates, SLA, engineering prescriptions, and before/after comparisons. |
| **Locked CSS Grid Layout** | Zero-overlap viewport shell (`56px` header $\rightarrow$ `48px` X-ray bar $\rightarrow$ `1fr` map/sidebar $\rightarrow$ `64px` timeline). Panels physically cannot collide. |
| **Real Dark Satellite Map** | Real high-resolution satellite basemap of Bhopal, Uttarakhand, Kutch, and Himachal with custom radar canvas overlays and numbered beacons (`①`–`④`). |
| **Interactive Map Layer Filters** | 1-click bottom-dock filters to isolate `🌊 Water`, `📉 Sinking`, `🚧 Barrier`, or `🏘️ Villages` dynamically on the canvas. |
| **3-Scale Switcher (`MICRO` / `MESO` / `MACRO`)** | Tracks millimeter ground subsidence (GUNW), meter-scale sub-canopy floods & crops (GCOV), and kilometer-scale glacier surges (GOFF). |
| **MongoDB Telemetry Store & Hybrid Adapter** | Stores multi-epoch NISAR telemetry, hotspot coordinates, and simulation logs, with automatic zero-latency fallback to bundled seed JSON. |

---

## 📘 Full Technical & Physics Documentation

For complete mathematical formulations (4-Observation WLS Canopy Unmixing, Triplet Closure Phase, Emergent-Stem Manning's $n$, Local-Inertial 2D Solver), Million-User System Architecture, and MongoDB Schemas, read the full documentation:

👉 **[Read Full Documentation (DOCUMENTATION.md)](./DOCUMENTATION.md)**
