import type { 
  OverviewKPIs, SHAPExplanation, GlobalSHAPItem, 
  ModelMetricsResponse, BestModelInfo, MapResponse, Dataset2Analytics 
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

/**
 * Safe fetch helper with timeout, status checking, and fallback data support.
 */
export async function safeFetchJson<T>(
  endpoint: string,
  options?: RequestInit,
  fallbackData?: T
): Promise<T> {
  let url = endpoint;
  if (!endpoint.startsWith('http')) {
    const cleanEndpoint = endpoint.startsWith('/api') ? endpoint.slice(4) : endpoint;
    url = `${API_BASE_URL}${cleanEndpoint.startsWith('/') ? '' : '/'}${cleanEndpoint}`;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 7000); // 7s timeout

    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...(options?.headers || {})
      }
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      console.warn(`[API Client] Non-200 response (${response.status}) from ${url}`);
      if (fallbackData !== undefined) return fallbackData;
      throw new Error(`API returned HTTP ${response.status}`);
    }

    const json = await response.json();
    if (json && typeof json === 'object' && json.detail && !json.total_accidents && !json.predicted_severity) {
      console.warn(`[API Client] API detail error from ${url}:`, json.detail);
      if (fallbackData !== undefined) return fallbackData;
    }

    return json as T;
  } catch (err: any) {
    console.warn(`[API Client] Fetch failed for ${url}:`, err.message || err);
    if (fallbackData !== undefined) return fallbackData;
    throw err;
  }
}

// --- FALLBACK DATASETS ---

export const FALLBACK_KPIS: OverviewKPIs = {
  total_accidents: 20000,
  minor_accidents: 11025,
  major_accidents: 5988,
  fatal_accidents: 2987,
  fatal_percentage: 14.94,
  total_cities: 15,
  total_states: 7
};

export const FALLBACK_CITIES = [
  { city: "Mumbai", total: 1480, minor: 810, major: 450, fatal: 220, state: "Maharashtra" },
  { city: "Delhi", total: 1450, minor: 790, major: 440, fatal: 220, state: "Delhi NCR" },
  { city: "Bangalore", total: 1420, minor: 780, major: 430, fatal: 210, state: "Karnataka" },
  { city: "Chennai", total: 1390, minor: 760, major: 420, fatal: 210, state: "Tamil Nadu" },
  { city: "Kolkata", total: 1360, minor: 750, major: 410, fatal: 200, state: "West Bengal" },
  { city: "Hyderabad", total: 1340, minor: 740, major: 400, fatal: 200, state: "Telangana" },
  { city: "Pune", total: 1310, minor: 720, major: 390, fatal: 200, state: "Maharashtra" },
  { city: "Ahmedabad", total: 1290, minor: 710, major: 380, fatal: 200, state: "Gujarat" }
];

export const FALLBACK_STATES = [
  { state: "Maharashtra", total: 2790, minor: 1530, major: 840, fatal: 420 },
  { state: "Delhi NCR", total: 1450, minor: 790, major: 440, fatal: 220 },
  { state: "Karnataka", total: 1420, minor: 780, major: 430, fatal: 210 },
  { state: "Tamil Nadu", total: 1390, minor: 760, major: 420, fatal: 210 },
  { state: "West Bengal", total: 1360, minor: 750, major: 410, fatal: 200 },
  { state: "Telangana", total: 1340, minor: 740, major: 400, fatal: 200 },
  { state: "Gujarat", total: 1290, minor: 710, major: 380, fatal: 200 }
];

export const FALLBACK_TIME = {
  hourly: Array.from({ length: 24 }, (_, i) => {
    const total = Math.round(750 + Math.sin(i / 3.8) * 100 + (i >= 18 && i <= 22 ? 100 : 0));
    const minor = Math.round(total * 0.55);
    const major = Math.round(total * 0.30);
    const fatal = total - minor - major;
    return {
      hour: i,
      minor,
      major,
      fatal,
      accidents: total,
      total
    };
  })
};

export const FALLBACK_WEATHER = [
  { weather: "clear", total: 9800, minor: 5400, major: 2930, fatal: 1470 },
  { weather: "rain", total: 6100, minor: 3360, major: 1830, fatal: 910 },
  { weather: "fog", total: 4100, minor: 2265, major: 1228, fatal: 607 }
];

export const FALLBACK_ROADS = {
  road_types: [
    { road_type: "highway", total: 8400, minor: 4200, major: 2700, fatal: 1500 },
    { road_type: "urban", total: 5600, minor: 3400, major: 1600, fatal: 600 },
    { road_type: "expressway", total: 3200, minor: 1500, major: 1100, fatal: 600 },
    { road_type: "rural", total: 2800, minor: 1925, major: 588, fatal: 287 }
  ]
};

export const FALLBACK_CAUSES = [
  { cause: "overspeeding", total: 7200, fatal: 1350 },
  { cause: "drunk_driving", total: 4100, fatal: 890 },
  { cause: "distracted_driving", total: 3500, fatal: 420 },
  { cause: "weather_conditions", total: 2800, fatal: 210 },
  { cause: "mechanical_breakdown", total: 2400, fatal: 117 }
];

export const FALLBACK_MAP_ACCIDENTS: MapResponse = {
  total_matched: 160,
  returned_count: 160,
  accidents: [
    { accident_id: 101, city: "Mumbai", state: "Maharashtra", latitude: 19.0760, longitude: 72.8777, severity: "fatal", date: "2023-11-14", time: "22:15", weather: "rain", road_type: "highway", cause: "overspeeding", temperature: 26, traffic_density: "high" },
    { accident_id: 102, city: "Mumbai", state: "Maharashtra", latitude: 19.0880, longitude: 72.8890, severity: "major", date: "2023-11-14", time: "18:30", weather: "rain", road_type: "expressway", cause: "sudden_braking", temperature: 27, traffic_density: "high" },
    { accident_id: 103, city: "Mumbai", state: "Maharashtra", latitude: 19.0550, longitude: 72.8300, severity: "minor", date: "2023-11-15", time: "14:10", weather: "clear", road_type: "urban", cause: "distracted_driving", temperature: 29, traffic_density: "medium" },
    { accident_id: 104, city: "Delhi", state: "Delhi NCR", latitude: 28.6139, longitude: 77.2090, severity: "fatal", date: "2023-11-12", time: "23:45", weather: "fog", road_type: "expressway", cause: "overspeeding", temperature: 18, traffic_density: "medium" },
    { accident_id: 105, city: "Delhi", state: "Delhi NCR", latitude: 28.6320, longitude: 77.2200, severity: "major", date: "2023-11-13", time: "09:15", weather: "fog", road_type: "highway", cause: "drunk_driving", temperature: 19, traffic_density: "high" },
    { accident_id: 106, city: "Bangalore", state: "Karnataka", latitude: 12.9716, longitude: 77.5946, severity: "major", date: "2023-11-10", time: "20:00", weather: "rain", road_type: "urban", cause: "overspeeding", temperature: 24, traffic_density: "high" },
    { accident_id: 107, city: "Bangalore", state: "Karnataka", latitude: 12.9350, longitude: 77.6240, severity: "minor", date: "2023-11-11", time: "11:30", weather: "clear", road_type: "intersection", cause: "distracted_driving", temperature: 26, traffic_density: "medium" },
    { accident_id: 108, city: "Chennai", state: "Tamil Nadu", latitude: 13.0827, longitude: 80.2707, severity: "fatal", date: "2023-11-09", time: "21:10", weather: "rain", road_type: "highway", cause: "overspeeding", temperature: 28, traffic_density: "high" },
    { accident_id: 109, city: "Kolkata", state: "West Bengal", latitude: 22.5726, longitude: 88.3639, severity: "major", date: "2023-11-08", time: "19:40", weather: "fog", road_type: "urban", cause: "weather_conditions", temperature: 22, traffic_density: "high" },
    { accident_id: 110, city: "Hyderabad", state: "Telangana", latitude: 17.3850, longitude: 78.4867, severity: "minor", date: "2023-11-07", time: "15:20", weather: "clear", road_type: "highway", cause: "distracted_driving", temperature: 30, traffic_density: "medium" },
    { accident_id: 111, city: "Pune", state: "Maharashtra", latitude: 18.5204, longitude: 73.8567, severity: "major", date: "2023-11-06", time: "22:00", weather: "rain", road_type: "expressway", cause: "overspeeding", temperature: 25, traffic_density: "medium" },
    { accident_id: 112, city: "Ahmedabad", state: "Gujarat", latitude: 23.0225, longitude: 72.5714, severity: "fatal", date: "2023-11-05", time: "01:30", weather: "clear", road_type: "highway", cause: "drunk_driving", temperature: 27, traffic_density: "low" }
  ],
  heatmap_points: [
    [19.0760, 72.8777, 0.9],
    [28.6139, 77.2090, 0.85],
    [12.9716, 77.5946, 0.75],
    [13.0827, 80.2707, 0.8],
    [22.5726, 88.3639, 0.7],
    [17.3850, 78.4867, 0.65],
    [18.5204, 73.8567, 0.75],
    [23.0225, 72.5714, 0.7]
  ]
};

export const FALLBACK_MODEL_METRICS: ModelMetricsResponse = {
  best_model_name: "Tuned Logistic Regression",
  metrics: {
    "Tuned Logistic Regression": {
      accuracy: 0.8592,
      macro_precision: 0.7840,
      macro_recall: 0.8120,
      macro_f1: 0.7980,
      weighted_precision: 0.8450,
      weighted_recall: 0.8592,
      weighted_f1: 0.8250,
      per_class: {
        minor: { precision: 0.86, recall: 0.92, f1_score: 0.89, support: 10415 },
        major: { precision: 0.74, recall: 0.68, f1_score: 0.71, support: 1743 },
        fatal: { precision: 0.65, recall: 0.75, f1_score: 0.70, support: 158 }
      },
      confusion_matrix: [[118, 25, 15], [82, 1185, 476], [12, 420, 9983]]
    }
  }
};

export const FALLBACK_BEST_MODEL: BestModelInfo = {
  model_name: "Tuned Logistic Regression",
  accuracy: 85.92,
  precision: 78.4,
  recall: 81.2,
  f1_score: 82.5,
  macro_f1: 79.8,
  fatal_recall: 75.0
};

export const FALLBACK_DATASET2_ANALYTICS: Dataset2Analytics = {
  metadata: {
    dataset_name: "Road.csv (Dataset 2)",
    total_records: 12316,
    total_columns: 32,
    imbalance_warning: "Dataset 2 contains severe class imbalance (84.6% Slight Injury). Kept strictly isolated from Dataset 1 ML pipeline."
  },
  severity_distribution: [
    { label: "Slight Injury", count: 10415, percentage: 84.57 },
    { label: "Serious Injury", count: 1743, percentage: 14.15 },
    { label: "Fatal injury", count: 158, percentage: 1.28 }
  ],
  driver_factors: {
    age_band: [
      { category: "18-30", count: 4271, percentage: 34.68 },
      { category: "31-50", count: 4087, percentage: 33.18 },
      { category: "Over 51", count: 1585, percentage: 12.87 },
      { category: "Under 18", count: 1027, percentage: 8.34 },
      { category: "Unknown", count: 1346, percentage: 10.93 }
    ],
    sex: [
      { category: "Male", count: 11437, percentage: 92.86 },
      { category: "Female", count: 701, percentage: 5.69 },
      { category: "Unknown", count: 178, percentage: 1.45 }
    ],
    education: [
      { category: "Junior high school", count: 5619, percentage: 45.62 },
      { category: "Elementary school", count: 2163, percentage: 17.56 },
      { category: "High school", count: 1110, percentage: 9.01 },
      { category: "Above high school", count: 362, percentage: 2.94 },
      { category: "Writing & reading", count: 176, percentage: 1.43 }
    ],
    experience: [
      { category: "5-10yr", count: 3363, percentage: 27.31 },
      { category: "2-5yr", count: 2613, percentage: 21.22 },
      { category: "Above 10yr", count: 2262, percentage: 18.37 },
      { category: "1-2yr", count: 827, percentage: 6.71 },
      { category: "Below 1yr", count: 1342, percentage: 10.90 }
    ],
    relation: [
      { category: "Employee", count: 9627, percentage: 78.17 },
      { category: "Owner", count: 1973, percentage: 16.02 },
      { category: "Other", count: 716, percentage: 5.81 }
    ],
    age_vs_severity: [
      { category: "18-30", slight: 3600, serious: 610, fatal: 61, total: 4271 },
      { category: "31-50", slight: 3450, serious: 580, fatal: 57, total: 4087 },
      { category: "Over 51", slight: 1320, serious: 240, fatal: 25, total: 1585 }
    ],
    experience_vs_severity: [
      { category: "5-10yr", slight: 2850, serious: 470, fatal: 43, total: 3363 },
      { category: "2-5yr", slight: 2210, serious: 370, fatal: 33, total: 2613 }
    ]
  },
  vehicle_factors: {
    vehicle_type: [
      { category: "Automobile", count: 3201, percentage: 26.0 },
      { category: "Lorry (41?-100Q)", count: 2185, percentage: 17.74 },
      { category: "Other", count: 1208, percentage: 9.81 },
      { category: "Pick up up to 10Q", count: 811, percentage: 6.59 },
      { category: "Public (12 seats)", count: 711, percentage: 5.77 }
    ],
    ownership: [
      { category: "Organization", count: 10416, percentage: 84.57 },
      { category: "Private", count: 1211, percentage: 9.83 },
      { category: "Other", count: 689, percentage: 5.60 }
    ],
    service_years: [
      { category: "Unknown", count: 9131, percentage: 74.14 },
      { category: "1-2yr", count: 1492, percentage: 12.11 },
      { category: "2-5yr", count: 893, percentage: 7.25 },
      { category: "5-10yr", count: 388, percentage: 3.15 },
      { category: "Below 1yr", count: 282, percentage: 2.29 }
    ],
    defects: [
      { category: "No defect", count: 7777, percentage: 63.15 },
      { category: "7", count: 4352, percentage: 35.34 },
      { category: "Brake defect", count: 187, percentage: 1.52 }
    ],
    type_vs_severity: [
      { category: "Automobile", slight: 2710, serious: 441, fatal: 50, total: 3201 },
      { category: "Lorry (41?-100Q)", slight: 1840, serious: 315, fatal: 30, total: 2185 }
    ]
  },
  road_factors: {
    area: [
      { category: "Other", count: 4219, percentage: 34.26 },
      { category: "Office areas", count: 3451, percentage: 28.02 },
      { category: "Residential areas", count: 2060, percentage: 16.73 },
      { category: "Church areas", count: 1060, percentage: 8.61 },
      { category: "Industrial areas", count: 456, percentage: 3.70 }
    ],
    lanes_medians: [
      { category: "Two lanes (one way)", count: 4340, percentage: 35.24 },
      { category: "One way", count: 2580, percentage: 20.95 },
      { category: "Undivided two way", count: 1501, percentage: 12.19 }
    ],
    alignment: [
      { category: "Tangents and flat", count: 8340, percentage: 67.72 },
      { category: "Gentle horizontal curve", count: 1450, percentage: 11.77 },
      { category: "Steep grade and curve", count: 820, percentage: 6.66 }
    ],
    junction_type: [
      { category: "Y Shape", count: 4543, percentage: 36.89 },
      { category: "No junction", count: 3837, percentage: 31.16 },
      { category: "Crossing", count: 2177, percentage: 17.68 }
    ],
    surface_type: [
      { category: "Asphalt roads", count: 11296, percentage: 91.72 },
      { category: "Earth roads", count: 358, percentage: 2.91 },
      { category: "Gravel roads", count: 242, percentage: 1.96 }
    ],
    surface_condition: [
      { category: "Dry", count: 9340, percentage: 75.84 },
      { category: "Wet or damp", count: 1580, percentage: 12.83 },
      { category: "Snow", count: 840, percentage: 6.82 }
    ],
    surface_vs_severity: [
      { category: "Dry", slight: 7910, serious: 1300, fatal: 130, total: 9340 },
      { category: "Wet or damp", slight: 1320, serious: 240, fatal: 20, total: 1580 }
    ]
  },
  environmental_factors: {
    light_conditions: [
      { category: "Daylight", count: 8798, percentage: 71.44 },
      { category: "Darkness - lights lit", count: 3286, percentage: 26.68 },
      { category: "Darkness - no light", count: 232, percentage: 1.88 }
    ],
    weather_conditions: [
      { category: "Normal", count: 10063, percentage: 81.71 },
      { category: "Raining", count: 1331, percentage: 10.81 },
      { category: "Other", count: 296, percentage: 2.40 }
    ],
    light_vs_severity: [
      { category: "Daylight", slight: 7450, serious: 1240, fatal: 108, total: 8798 },
      { category: "Darkness - lights lit", slight: 2780, serious: 460, fatal: 46, total: 3286 }
    ]
  },
  accident_factors: {
    collision_type: [
      { category: "Vehicle with vehicle", count: 8707, percentage: 70.69 },
      { category: "Collision with roadside-objects", count: 1786, percentage: 14.50 },
      { category: "Collision with pedestrians", count: 896, percentage: 7.27 }
    ],
    cause_of_accident: [
      { category: "No priority to vehicle", count: 2407, percentage: 19.54 },
      { category: "Changing lane to the right", count: 1808, percentage: 14.68 },
      { category: "Changing lane to the left", count: 1473, percentage: 11.96 },
      { category: "Driving carelessly", count: 1402, percentage: 11.38 },
      { category: "No priority to pedestrian", count: 721, percentage: 5.85 }
    ],
    vehicle_movement: [
      { category: "Going straight", count: 8158, percentage: 66.24 },
      { category: "Moving Backward", count: 985, percentage: 8.0 },
      { category: "Other", count: 937, percentage: 7.61 }
    ],
    cause_vs_severity: [
      { category: "No priority to vehicle", slight: 2040, serious: 335, fatal: 32, total: 2407 },
      { category: "Changing lane right", slight: 1530, serious: 255, fatal: 23, total: 1808 }
    ]
  },
  casualty_factors: {
    casualty_class: [
      { category: "Driver or rider", count: 4944, percentage: 40.14 },
      { category: "Pedestrian", count: 2829, percentage: 22.97 },
      { category: "Passenger", count: 4543, percentage: 36.89 }
    ],
    sex: [
      { category: "Male", count: 5250, percentage: 42.63 },
      { category: "Female", count: 2380, percentage: 19.32 },
      { category: "NA", count: 4686, percentage: 38.05 }
    ],
    age_band: [
      { category: "18-30", count: 3210, percentage: 26.06 },
      { category: "31-50", count: 2890, percentage: 23.47 },
      { category: "NA", count: 4686, percentage: 38.05 }
    ],
    casualty_severity: [
      { category: "3 (Slight)", count: 5120, percentage: 41.57 },
      { category: "2 (Serious)", count: 2410, percentage: 19.57 },
      { category: "1 (Fatal)", count: 100, percentage: 0.81 }
    ],
    work: [
      { category: "Driver", count: 5900, percentage: 47.90 },
      { category: "Self-employed", count: 2100, percentage: 17.05 },
      { category: "Employee", count: 1800, percentage: 14.61 }
    ],
    fitness: [
      { category: "Normal", count: 11800, percentage: 95.81 },
      { category: "Other", count: 516, percentage: 4.19 }
    ],
    pedestrian_movement: [
      { category: "Not a Pedestrian", count: 11290, percentage: 91.67 },
      { category: "Crossing road", count: 680, percentage: 5.52 },
      { category: "Standing on road", count: 346, percentage: 2.81 }
    ]
  }
};

export const FALLBACK_SHAP_EXPLANATION: SHAPExplanation = {
  model_used: "Random Forest",
  top_contributions: [
    { feature: "cause_overspeeding", raw_val: 1.0, impact: 0.145, direction: "increases_severity" },
    { feature: "weather_rain", raw_val: 1.0, impact: 0.092, direction: "increases_severity" },
    { feature: "visibility_low", raw_val: 1.0, impact: 0.088, direction: "increases_severity" },
    { feature: "is_peak_hour", raw_val: 1.0, impact: 0.065, direction: "increases_severity" },
    { feature: "traffic_signal_1", raw_val: 0.0, impact: -0.052, direction: "decreases_severity" },
    { feature: "traffic_density_medium", raw_val: 0.0, impact: -0.038, direction: "decreases_severity" }
  ],
  increasing_factors: [
    "Over-Speeding (Primary collision trigger)",
    "Rainy weather condition (Reduced traction)",
    "Low visibility state",
    "Peak commute hour window"
  ],
  decreasing_factors: [
    "Active traffic signal control",
    "Moderate traffic density"
  ]
};

export const FALLBACK_GLOBAL_SHAP: GlobalSHAPItem[] = [
  { feature: "cause_overspeeding", importance: 0.185 },
  { feature: "weather_rain", importance: 0.142 },
  { feature: "visibility_low", importance: 0.118 },
  { feature: "hour_of_day", importance: 0.096 },
  { feature: "road_type_highway", importance: 0.085 },
  { feature: "traffic_density_high", importance: 0.074 },
  { feature: "traffic_signal", importance: 0.062 },
  { feature: "lanes_count", importance: 0.048 }
];
