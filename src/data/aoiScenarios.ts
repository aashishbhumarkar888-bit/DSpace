import { AOIScenario, CompactCascadeStep, OrbitalEpoch, AOIId } from '../types';
import seedJson from './mongoSeedData.json';

export const AOI_SCENARIOS: Record<AOIId, AOIScenario> = {
  'aoi-1': seedJson.aois[0] as unknown as AOIScenario,
  'aoi-2': seedJson.aois[1] as unknown as AOIScenario,
  'aoi-3': seedJson.aois[2] as unknown as AOIScenario,
  'aoi-4': seedJson.aois[3] as unknown as AOIScenario,
};

export const CASCADE_STEPS_BY_AOI: Record<AOIId, CompactCascadeStep[]> = {
  'aoi-1': [
    {
      stepNumber: 1,
      phaseCategory: '1. TRIGGER',
      title: 'Monsoon Cloud Cover (94% Blind)',
      description: 'Optical satellites blinded by dense monsoonal cloud deck (τcloud > 40). Ground status unknown to optical sensors.',
      satelliteBand: 'Optical 400-800nm (Blocked)',
      equation: 'I(z) = I_0 \\cdot e^{-\\tau / \\cos\\theta}',
      scale: 'MACRO',
      metricBadge: 'Optical Blind: 94%',
      layerHighlightKey: 'optical'
    },
    {
      stepNumber: 2,
      phaseCategory: '2. RADAR SHIFT',
      title: 'Sub-Canopy Double Bounce (+6.2 dB)',
      description: '24cm L-Band penetrates crop and forest canopy, producing strong dihedral corner reflections between water and tree stalks.',
      satelliteBand: 'L-Band (23.84cm) Polarimetry',
      equation: '\\sigma^0_{HH} = f_s \\cdot s + f_d \\cdot d + f_v \\cdot v',
      scale: 'MESO',
      metricBadge: 'Double-Bounce: +6.2 dB',
      layerHighlightKey: 'polarimetry'
    },
    {
      stepNumber: 3,
      phaseCategory: '3. SURFACE MOTION',
      title: 'Deep Inelastic Compaction (-19.4 mm)',
      description: 'Intense tubewell extraction drops groundwater head by 140m, collapsing aquifer pore spaces and sinking ground surface.',
      satelliteBand: 'GUNW InSAR (λ = 23.84cm)',
      equation: '\\Delta d = \\frac{\\lambda \\cdot \\Delta \\phi}{4\\pi} = -19.4\\text{ mm}',
      scale: 'MICRO',
      metricBadge: 'InSAR Subsidence: -19.4 mm',
      layerHighlightKey: 'phase'
    },
    {
      stepNumber: 4,
      phaseCategory: '4. INFRASTRUCTURE RISK',
      title: 'Canal Gradient Reverse & Stagnation',
      description: 'Canal bed tilts backward by 28%, choking flow velocity to 0.04 m/s and trapping 14 villages in silty backflow behind NH-46.',
      satelliteBand: 'Hydrodynamic Gradient Model',
      equation: 'Q = \\frac{1}{n} A R_h^{2/3} S^{1/2} \\quad (S \\downarrow 28\\%)',
      scale: 'MESO',
      metricBadge: 'Velocity: 0.04 m/s (Trap)',
      layerHighlightKey: 'flow'
    }
  ],
  'aoi-2': [
    {
      stepNumber: 1,
      phaseCategory: '1. TRIGGER',
      title: 'Chir Pine Crown Fire (-7.8 dB HV)',
      description: 'Intense crown fire strips 3,400 ha of pine forest, collapsing volumetric backscatter and creating a hydrophobic ash seal.',
      satelliteBand: 'L-Band Cross-Pol (HV)',
      equation: 'dNBR = \\frac{NIR - SWIR}{NIR + SWIR} \\equiv 0.78',
      scale: 'MESO',
      metricBadge: 'HV Loss: -7.8 dB',
      layerHighlightKey: 'polarimetry'
    },
    {
      stepNumber: 2,
      phaseCategory: '2. RADAR SHIFT',
      title: 'Pore Pressure Spike (ε = 41)',
      description: 'Monsoon cloudburst cannot infiltrate ash glaze; water channels directly onto slip plane, driving dielectric to 41.',
      satelliteBand: 'Dielectric Sounding (1.25 GHz)',
      equation: 'u = \\gamma_w \\cdot z_w \\cdot \\cos^2\\beta \\quad (u \\uparrow 320\\%)',
      scale: 'MESO',
      metricBadge: 'Dielectric ε: 41',
      layerHighlightKey: 'polarimetry'
    },
    {
      stepNumber: 3,
      phaseCategory: '3. SURFACE MOTION',
      title: 'Deep Bedrock Creep (4.8 mm/day)',
      description: 'Factor of safety collapses to 1.04; NISAR 12-day interferogram shows rapid phase fringe compression along highway flank.',
      satelliteBand: 'GUNW Phase Fringes (11.9cm)',
      equation: 'FS = \\frac{c\' + (\\sigma_n - u)\\tan\\phi\'}{\\tau_d} < 1.05',
      scale: 'MICRO',
      metricBadge: 'Creep: 4.8 mm/day',
      layerHighlightKey: 'phase'
    },
    {
      stepNumber: 4,
      phaseCategory: '4. INFRASTRUCTURE RISK',
      title: 'Impending 1.8M m³ Debris Inundation',
      description: 'Failure threatens to bury NH-07 pilgrimage highway and silt the Rishiganga hydro intake tunnel downstream.',
      satelliteBand: 'GOFF Velocity Streamlines',
      equation: 'v_{debris} = \\sqrt{2 g H (1 - \\mu \\cot\\theta)} \\approx 18.4\\text{ m/s}',
      scale: 'MACRO',
      metricBadge: 'Runout Volume: 1.8M m³',
      layerHighlightKey: 'flow'
    }
  ],
  'aoi-3': [
    {
      stepNumber: 1,
      phaseCategory: '1. TRIGGER',
      title: 'Mw 6.4 Thrust Rupture Nucleation',
      description: 'Compressional tectonic loading ruptures the Kutch Mainland Fault at 14km hypocentral depth.',
      satelliteBand: 'Global Seismographic Network',
      equation: 'M_0 = \\mu A \\bar{D} = 3.2 \\times 10^{18}\\text{ N}\\cdot\\text{m}',
      scale: 'MACRO',
      metricBadge: 'Magnitude: Mw 6.4',
      layerHighlightKey: 'optical'
    },
    {
      stepNumber: 2,
      phaseCategory: '2. RADAR SHIFT',
      title: 'Saline Ground Upwelling (+11.4 dB)',
      description: 'Coseismic pore pressure pulse forces hyper-saline groundwater from deep Jurassic sandstone to surface.',
      satelliteBand: 'L-Band Dielectric Backscatter',
      equation: '\\varepsilon\'\' = \\frac{\\sigma_{saline}}{2\\pi f \\varepsilon_0} \\quad (\\varepsilon\'\' > 65)',
      scale: 'MESO',
      metricBadge: 'HH Jump: +11.4 dB',
      layerHighlightKey: 'polarimetry'
    },
    {
      stepNumber: 3,
      phaseCategory: '3. SURFACE MOTION',
      title: '2.4 Fringes Differential Slip (28.6 cm)',
      description: 'NISAR L-band interferogram maps asymmetric deformation field with 11.92cm displacement per fringe.',
      satelliteBand: 'GUNW InSAR (λ = 23.84cm)',
      equation: 'u_z(x,y) = \\iint G_{33}(x-\\xi, y-\\eta) \\Delta u d\\xi d\\eta',
      scale: 'MICRO',
      metricBadge: 'Offset: 28.6 cm (2.4 Fringes)',
      layerHighlightKey: 'phase'
    },
    {
      stepNumber: 4,
      phaseCategory: '4. INFRASTRUCTURE RISK',
      title: 'Canal Reverse Gradient Backflow',
      description: 'Uplift on northern block reverses bed slope to -0.008%, driving 400 m³/s canal discharge backward into pump station.',
      satelliteBand: 'DEM Hydraulic Inversion',
      equation: 'S_{bed} = \\frac{z_2 - z_1}{L} < 0 \\quad (\\text{Negative Slope})',
      scale: 'MESO',
      metricBadge: 'Slope: -0.008% (Reverse)',
      layerHighlightKey: 'flow'
    }
  ],
  'aoi-4': [
    {
      stepNumber: 1,
      phaseCategory: '1. TRIGGER',
      title: 'Thermal Ablation Acceleration',
      description: 'Sustained +3.4°C regional summer temperature anomaly drives 4.2M m³ supraglacial meltwater into basal conduits.',
      satelliteBand: 'Thermal Infrared (MODIS/VIIRS)',
      equation: 'M = TF \\cdot \\max(0, T_{air} - T_0)',
      scale: 'MACRO',
      metricBadge: 'Lake Volume: +38%',
      layerHighlightKey: 'optical'
    },
    {
      stepNumber: 2,
      phaseCategory: '2. RADAR SHIFT',
      title: 'Basal Hydrostatic Decoupling',
      description: 'High-pressure subglacial water channels lubricate bedrock contact, dropping basal shear friction to near zero.',
      satelliteBand: 'L-Band Phase Decorrelation',
      equation: '\\tau_b = \\tau_d - k \\cdot N^q \\quad (N \\to 0)',
      scale: 'MESO',
      metricBadge: 'Basal Friction: -82%',
      layerHighlightKey: 'polarimetry'
    },
    {
      stepNumber: 3,
      phaseCategory: '3. SURFACE MOTION',
      title: 'GOFF Glacier Surge Jump (325 m/yr)',
      description: 'NISAR L2 GOFF pixel offset tracking reveals crevasse patterns surging from 140 m/yr to 325 m/yr down-valley.',
      satelliteBand: 'GOFF Pixel Offset (Cross-Corr)',
      equation: 'v(x,y) = \\frac{\\Delta x_{peak} \\cdot \\text{GSD}}{\\Delta t_{pass}} \\approx 325\\text{ m/yr}',
      scale: 'MACRO',
      metricBadge: 'Surge: 325 m/yr',
      layerHighlightKey: 'flow'
    },
    {
      stepNumber: 4,
      phaseCategory: '4. INFRASTRUCTURE RISK',
      title: 'Moraine Breach & 42,500 m³/s GLOF',
      description: 'Surge snout rams into ice-cored moraine dam, threatening an outburst flood wave reaching downstream hydro plants in 34 minutes.',
      satelliteBand: 'Hydrodynamic Breach Model',
      equation: 'Q_p = 0.00013 (V_w)^{0.6} (h_w)^{1.2} \\approx 42,500\\text{ m}^3/\\text{s}',
      scale: 'MACRO',
      metricBadge: 'GLOF Peak: 42,500 m³/s',
      layerHighlightKey: 'flow'
    }
  ]
};

export function generateOrbitalTimeline(aoiId: string): OrbitalEpoch[] {
  const epochs: OrbitalEpoch[] = [];
  const startDate = new Date('2025-01-01');

  for (let i = 0; i < 60; i++) {
    const epochDate = new Date(startDate.getTime() + i * 12 * 86400000);
    const dayNumber = i * 12;

    let season: OrbitalEpoch['season'] = 'Pre-Monsoon';
    if (dayNumber >= 180 && dayNumber < 300) season = 'Peak Monsoon';
    else if (dayNumber >= 300 && dayNumber < 450) season = 'Rabi Harvest';
    else if (dayNumber >= 450 && dayNumber < 600) season = 'Post-Harvest / Winter';
    else if (dayNumber >= 600) season = 'Surge Event';

    let anomalyIntensity = 0.05;
    if (i >= 24 && i <= 44) {
      const peak = 34;
      const dist = Math.abs(i - peak);
      anomalyIntensity = Math.max(0.1, 1.0 - (dist / 12) * 0.9);
    }

    const angle = (i / 60) * Math.PI * 4;
    const baseHH = -14 + Math.sin(angle) * 4;
    const baseHV = -20 + Math.cos(angle) * 3;
    const basePhase = Math.sin(angle) * 2;

    const hhDrift = anomalyIntensity > 0.4 ? baseHH + anomalyIntensity * 8.5 : baseHH;
    const hvDrift = anomalyIntensity > 0.4 ? baseHV - anomalyIntensity * 6.2 : baseHV;
    const phaseDrift = anomalyIntensity > 0.4 ? basePhase - anomalyIntensity * 24.0 : basePhase;

    epochs.push({
      epochIndex: i,
      passDate: epochDate.toISOString().slice(0, 10),
      dayNumber,
      season,
      anomalyIntensity,
      hhDrift,
      hvDrift,
      phaseDrift,
    });
  }

  return epochs;
}
