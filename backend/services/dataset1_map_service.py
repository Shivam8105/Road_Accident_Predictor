import os
import pandas as pd
import numpy as np

class Dataset1MapService:
    def __init__(self, data_path="indian_roads_dataset.csv"):
        if not os.path.exists(data_path):
            data_path = os.path.join(os.path.dirname(__file__), "..", "..", "indian_roads_dataset.csv")
            
        self.df = pd.read_csv(data_path)
        self.df['accident_severity'] = self.df['accident_severity'].str.strip().str.lower()
        
        # Parse year if date available
        if 'date' in self.df.columns:
            self.df['year'] = pd.to_datetime(self.df['date'], errors='coerce').dt.year.fillna(2023).astype(int)
        else:
            self.df['year'] = 2023

    def get_filter_options(self):
        return {
            "severities": ["all", "minor", "major", "fatal"],
            "cities": sorted(self.df['city'].unique().tolist()),
            "states": sorted(self.df['state'].unique().tolist()),
            "weathers": sorted(self.df['weather'].unique().tolist()),
            "years": sorted(self.df['year'].unique().tolist()),
            "road_types": sorted(self.df['road_type'].unique().tolist()),
            "causes": sorted(self.df['cause'].unique().tolist())
        }

    def get_accidents(self, severity=None, city=None, state=None, weather=None, year=None, road_type=None, cause=None, limit=2000):
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
        
        # Sample for fast map rendering if dataset is large
        if len(filtered) > limit:
            sample_df = filtered.sample(n=limit, random_state=42)
        else:
            sample_df = filtered

        records = []
        for _, row in sample_df.iterrows():
            records.append({
                "accident_id": int(row.get('accident_id', 0)),
                "city": row.get('city', ''),
                "state": row.get('state', ''),
                "latitude": float(row.get('latitude', 0.0)),
                "longitude": float(row.get('longitude', 0.0)),
                "severity": row.get('accident_severity', 'minor'),
                "date": str(row.get('date', '')),
                "time": str(row.get('time', '')),
                "weather": row.get('weather', ''),
                "road_type": row.get('road_type', ''),
                "cause": row.get('cause', ''),
                "temperature": float(row.get('temperature', 0)),
                "traffic_density": row.get('traffic_density', '')
            })

        # Calculate heatmap points (lat, lng, weight)
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
