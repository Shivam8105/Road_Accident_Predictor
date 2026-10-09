import os
import json
import pandas as pd
import numpy as np

class Dataset1MapService:
    def __init__(self, data_path=None):
        artifacts_dir = os.path.join(os.path.dirname(__file__), "..", "models_artifacts")
        heatmap_csv = os.path.join(artifacts_dir, "india_accident_heatmap.csv")
        heatmap_json = os.path.join(artifacts_dir, "india_accident_heatmap.json")

        if os.path.exists(heatmap_csv):
            self.df = pd.read_csv(heatmap_csv)
        elif data_path and os.path.exists(data_path):
            self.df = pd.read_csv(data_path)
        else:
            fallback_csv = os.path.join(os.path.dirname(__file__), "..", "..", "indian_roads_dataset.csv")
            if os.path.exists(fallback_csv):
                self.df = pd.read_csv(fallback_csv)
            else:
                self.df = pd.DataFrame()

        if not self.df.empty:
            if 'accident_severity' in self.df.columns:
                self.df['accident_severity'] = self.df['accident_severity'].astype(str).str.strip().str.lower()
            elif 'severity' in self.df.columns:
                self.df['accident_severity'] = self.df['severity'].astype(str).str.strip().str.lower()

            if 'date' in self.df.columns and 'year' not in self.df.columns:
                self.df['year'] = pd.to_datetime(self.df['date'], errors='coerce').dt.year.fillna(2023).astype(int)
            elif 'year' not in self.df.columns:
                self.df['year'] = 2023

    def get_filter_options(self):
        if self.df.empty:
            return {
                "severities": ["all", "minor", "major", "fatal"],
                "cities": ["Mumbai", "Delhi", "Bangalore", "Chennai", "Kolkata", "Hyderabad", "Pune", "Ahmedabad"],
                "states": ["Maharashtra", "Delhi NCR", "Karnataka", "Tamil Nadu", "West Bengal", "Telangana", "Gujarat"],
                "weathers": ["clear", "rain", "fog"],
                "years": [2022, 2023, 2024, 2025],
                "road_types": ["highway", "urban", "expressway", "rural"],
                "causes": ["overspeeding", "distraction", "weather", "drunk"]
            }

        return {
            "severities": ["all", "minor", "major", "fatal"],
            "cities": sorted(self.df['city'].dropna().unique().tolist()) if 'city' in self.df.columns else [],
            "states": sorted(self.df['state'].dropna().unique().tolist()) if 'state' in self.df.columns else [],
            "weathers": sorted(self.df['weather'].dropna().unique().tolist()) if 'weather' in self.df.columns else [],
            "years": sorted(self.df['year'].dropna().unique().tolist()) if 'year' in self.df.columns else [],
            "road_types": sorted(self.df['road_type'].dropna().unique().tolist()) if 'road_type' in self.df.columns else [],
            "causes": sorted(self.df['cause'].dropna().unique().tolist()) if 'cause' in self.df.columns else []
        }

    def get_accidents(self, severity=None, city=None, state=None, weather=None, year=None, road_type=None, cause=None, limit=2000):
        if self.df.empty:
            return {"total_matched": 0, "returned_count": 0, "accidents": [], "heatmap_points": []}

        filtered = self.df.copy()
        
        if severity and severity.lower() != 'all':
            filtered = filtered[filtered['accident_severity'] == severity.lower()]
        if city and city.lower() != 'all':
            filtered = filtered[filtered['city'].str.lower() == city.lower()]
        if state and state.lower() != 'all':
            filtered = filtered[filtered['state'].str.lower() == state.lower()]
        if weather and weather.lower() != 'all':
            filtered = filtered[filtered['weather'].str.lower() == weather.lower()]
        if year and str(year).lower() != 'all':
            try:
                filtered = filtered[filtered['year'] == int(year)]
            except:
                pass
        if road_type and road_type.lower() != 'all':
            filtered = filtered[filtered['road_type'].str.lower() == road_type.lower()]
        if cause and cause.lower() != 'all':
            filtered = filtered[filtered['cause'].str.lower() == cause.lower()]
            
        total_matched = len(filtered)
        
        if len(filtered) > limit:
            sample_df = filtered.sample(n=limit, random_state=42)
        else:
            sample_df = filtered

        records = []
        for _, row in sample_df.iterrows():
            city_str = str(row.get('city', ''))
            state_str = str(row.get('state', ''))
            road_type_str = str(row.get('road_type', row.get('roadType', 'road'))).capitalize()
            lat_val = float(row.get('latitude', row.get('lat', 0.0)))
            lng_val = float(row.get('longitude', row.get('lng', 0.0)))

            location_name_val = f"{road_type_str} Corridor"
            location_addr_val = f"{road_type_str} Corridor, {city_str}, {state_str} ({lat_val:.4f}°N, {lng_val:.4f}°E)"

            records.append({
                "accident_id": int(row.get('accident_id', row.get('id', 0))),
                "city": city_str,
                "state": state_str,
                "latitude": lat_val,
                "longitude": lng_val,
                "severity": str(row.get('accident_severity', row.get('severity', 'minor'))),
                "date": str(row.get('date', '')),
                "time": str(row.get('time', f"{int(row.get('hour', 12)):02d}:00")),
                "weather": str(row.get('weather', '')),
                "road_type": str(row.get('road_type', row.get('roadType', ''))),
                "cause": str(row.get('cause', '')),
                "temperature": float(row.get('temperature', 26)),
                "traffic_density": str(row.get('traffic_density', row.get('trafficDensity', ''))),
                "location_name": location_name_val,
                "location_address": location_addr_val
            })

        weights = {'minor': 0.3, 'major': 0.6, 'fatal': 1.0}
        heatmap_points = [
            [r["latitude"], r["longitude"], weights.get(r["severity"], 0.5)]
            for r in records
        ]

        return {
            "total_matched": total_matched,
            "returned_count": len(records),
            "accidents": records,
            "heatmap_points": heatmap_points
        }
