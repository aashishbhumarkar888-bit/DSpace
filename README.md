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

1. **✨ Simple Citizen Mode:** Understand any surface crisis in 3 clicks—drag the **Wavelength X-Ray Slider** to peel away clouds and tree leaves, click numbered hotspots (`①`–`④`) on the real satellite map, and click **`⚡ Simulate Solution`** to see how many villages and hectares of cropland are protected.
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

## 🧭 Core Features

| Feature | What It Does |
|:---|:---|
| **Locked CSS Grid Layout** | Zero-overlap viewport shell (`56px` header $\rightarrow$ `48px` X-ray bar $\rightarrow$ `1fr` map/sidebar $\rightarrow$ `64px` timeline). Panels physically cannot collide. |
| **Real Dark Satellite Map** | Replaces blocky cubes with real high-resolution satellite imagery of Bhopal, Uttarakhand, Kutch, and Himachal with custom radar canvas overlays. |
| **Spaced Numbered Beacons (`①`, `②`, `③`, `④`)** | Spaced circular pulse beacons placed at least 120px apart over real landmarks with short 2-word pills; clicking reveals rich telemetry in docked cards. |
| **3-Scale Switcher (`MICRO` / `MESO` / `MACRO`)** | Tracks millimeter ground subsidence (GUNW), meter-scale sub-canopy floods & crops (GCOV), and kilometer-scale glacier surges (GOFF). |
| **Wavelength X-Ray Slider & Lens** | Smoothly transitions from `☁️ 1. Normal Camera` (0%) $\rightarrow$ `🌿 2. Standard Radar` (50%) $\rightarrow$ `⚡ 3. DSpace NASA Radar` (100%), with a circular cursor magnifying loupe. |
| **4 Coupled Real-World Case Studies** | 1. Bhopal Bhoj Wetland & Narmada Agro-Valley • 2. Uttarakhand Wildfire-to-Landslide • 3. Kutch Fault & Canal Stress • 4. Himachal Glacier Surge. |
| **MongoDB Telemetry Store & Hybrid Adapter** | Stores multi-epoch NISAR telemetry, hotspot coordinates, and simulation logs, with automatic zero-latency fallback to bundled seed JSON. |
| **First-Time User Onboarding** | 3-card plain-English guided modal explaining the problem, the radar solution, and how to try it in 10 seconds. |

---

## 📘 Full Technical & Physics Documentation

For complete mathematical formulations (4-Observation WLS Canopy Unmixing, Triplet Closure Phase, Emergent-Stem Manning's $n$, Local-Inertial 2D Solver), Million-User System Architecture, and MongoDB Schemas, read the full documentation:

👉 **[Read Full Documentation (DOCUMENTATION.md)](./DOCUMENTATION.md)**
