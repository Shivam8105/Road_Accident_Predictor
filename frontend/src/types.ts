export interface OverviewKPIs {
  total_accidents: number;
  minor_accidents: number;
  major_accidents: number;
  fatal_accidents: number;
  fatal_percentage: number;
  total_cities: number;
  total_states: number;
}

export interface PredictionResult {
  predicted_severity: 'MINOR' | 'MAJOR' | 'FATAL';
  probabilities: {
    minor: number;
    major: number;
    fatal: number;
  };
  model_used: string;
}

export interface WhatIfResult {
  current: PredictionResult;
  modified: PredictionResult;
  severity_changed: boolean;
  transition: string;
}

export interface SHAPContribution {
  feature: string;
  raw_val: number;
  impact: number;
  direction: 'increases_severity' | 'decreases_severity';
}

export interface SHAPExplanation {
  model_used: string;
  top_contributions: SHAPContribution[];
  increasing_factors: string[];
  decreasing_factors: string[];
}

export interface GlobalSHAPItem {
  feature: string;
  importance: number;
}

export interface ModelMetric {
  accuracy: number;
  macro_precision: number;
  macro_recall: number;
  macro_f1: number;
  weighted_precision: number;
  weighted_recall: number;
  weighted_f1: number;
  per_class: {
    [key: string]: {
      precision: number;
      recall: number;
      f1_score: number;
      support: number;
    };
  };
  confusion_matrix: number[][];
}

export interface ModelMetricsResponse {
  best_model_name: string;
  metrics: {
    [key: string]: ModelMetric;
  };
}

export interface BestModelInfo {
  model_name: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1_score: number;
  macro_f1: number;
  fatal_recall: number;
}

export interface MapAccidentRecord {
  accident_id: number;
  city: string;
  state: string;
  latitude: number;
  longitude: number;
  severity: string;
  date: string;
  time: string;
  weather: string;
  road_type: string;
  cause: string;
  temperature: number;
  traffic_density: string;
}

export interface MapResponse {
  total_matched: number;
  returned_count: number;
  accidents: MapAccidentRecord[];
  heatmap_points: [number, number, number][];
}

export interface Dataset2FactorItem {
  category: string;
  count: number;
  percentage: number;
}

export interface Dataset2CrossItem {
  category: string;
  slight: number;
  serious: number;
  fatal: number;
  total: number;
}

export interface Dataset2Analytics {
  metadata: {
    dataset_name: string;
    total_records: number;
    total_columns: number;
    imbalance_warning: string;
  };
  severity_distribution: { label: string; count: number; percentage: number }[];
  driver_factors: {
    age_band: Dataset2FactorItem[];
    sex: Dataset2FactorItem[];
    education: Dataset2FactorItem[];
    experience: Dataset2FactorItem[];
    relation: Dataset2FactorItem[];
    age_vs_severity: Dataset2CrossItem[];
    experience_vs_severity: Dataset2CrossItem[];
  };
  vehicle_factors: {
    vehicle_type: Dataset2FactorItem[];
    ownership: Dataset2FactorItem[];
    service_years: Dataset2FactorItem[];
    defects: Dataset2FactorItem[];
    type_vs_severity: Dataset2CrossItem[];
  };
  road_factors: {
    area: Dataset2FactorItem[];
    lanes_medians: Dataset2FactorItem[];
    alignment: Dataset2FactorItem[];
    junction_type: Dataset2FactorItem[];
    surface_type: Dataset2FactorItem[];
    surface_condition: Dataset2FactorItem[];
    surface_vs_severity: Dataset2CrossItem[];
  };
  environmental_factors: {
    light_conditions: Dataset2FactorItem[];
    weather_conditions: Dataset2FactorItem[];
    light_vs_severity: Dataset2CrossItem[];
  };
  accident_factors: {
    collision_type: Dataset2FactorItem[];
    cause_of_accident: Dataset2FactorItem[];
    vehicle_movement: Dataset2FactorItem[];
    cause_vs_severity: Dataset2CrossItem[];
  };
  casualty_factors: {
    casualty_class: Dataset2FactorItem[];
    sex: Dataset2FactorItem[];
    age_band: Dataset2FactorItem[];
    casualty_severity: Dataset2FactorItem[];
    work: Dataset2FactorItem[];
    fitness: Dataset2FactorItem[];
    pedestrian_movement: Dataset2FactorItem[];
  };
}
