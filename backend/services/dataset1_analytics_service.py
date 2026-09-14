import os
import pandas as pd
import numpy as np

class Dataset1AnalyticsService:
    def __init__(self, data_path="indian_roads_dataset.csv"):
        if not os.path.exists(data_path):
            data_path = os.path.join(os.path.dirname(__file__), "..", "..", "indian_roads_dataset.csv")
        
        self.df = pd.read_csv(data_path)
        self.df['accident_severity'] = self.df['accident_severity'].str.strip().str.lower()
        
    def get_overview_kpis(self):
        total = len(self.df)
        sev_counts = self.df['accident_severity'].value_counts().to_dict()
        minor = int(sev_counts.get('minor', 0))
        major = int(sev_counts.get('major', 0))
        fatal = int(sev_counts.get('fatal', 0))
        fatal_pct = round((fatal / total) * 100, 2) if total > 0 else 0.0
        
        return {
            "total_accidents": total,
            "minor_accidents": minor,
            "major_accidents": major,
            "fatal_accidents": fatal,
            "fatal_percentage": fatal_pct,
            "total_cities": int(self.df['city'].nunique()),
            "total_states": int(self.df['state'].nunique())
        }

    def get_yearly_trends(self):
        if 'date' in self.df.columns:
            df_temp = self.df.copy()
            df_temp['year'] = pd.to_datetime(df_temp['date'], errors='coerce').dt.year
            df_temp['year'] = df_temp['year'].fillna(2023).astype(int)
            
            ct = pd.crosstab(df_temp['year'], df_temp['accident_severity']).reset_index()
            result = []
            for _, row in ct.iterrows():
                result.append({
                    "year": str(int(row['year'])),
                    "minor": int(row.get('minor', 0)),
                    "major": int(row.get('major', 0)),
                    "fatal": int(row.get('fatal', 0)),
                    "total": int(row.get('minor', 0) + row.get('major', 0) + row.get('fatal', 0))
                })
            return result
        return []

    def get_city_analytics(self, city_name=None):
        if city_name:
            df_sub = self.df[self.df['city'].str.lower() == city_name.lower()]
            if len(df_sub) == 0:
                return {"error": "City not found"}
            
            sev = df_sub['accident_severity'].value_counts().to_dict()
            weather = df_sub['weather'].value_counts().to_dict()
            causes = df_sub['cause'].value_counts().to_dict()
            roads = df_sub['road_type'].value_counts().to_dict()
            hourly = df_sub['hour'].value_counts().sort_index().to_dict()
            
            return {
                "city": city_name,
                "total_accidents": len(df_sub),
                "severity_distribution": {k: int(v) for k, v in sev.items()},
                "weather_distribution": {k: int(v) for k, v in weather.items()},
                "common_causes": {k: int(v) for k, v in causes.items()},
                "road_types": {k: int(v) for k, v in roads.items()},
                "hourly_distribution": {str(k): int(v) for k, v in hourly.items()}
            }
            
        # Top Cities Breakdown
        city_counts = self.df['city'].value_counts().head(15).reset_index()
        city_counts.columns = ['city', 'total']
        
        ct = pd.crosstab(self.df['city'], self.df['accident_severity'])
        res = []
        for _, row in city_counts.iterrows():
            c = row['city']
            sev_row = ct.loc[c] if c in ct.index else {}
            res.append({
                "city": c,
                "total": int(row['total']),
                "minor": int(sev_row.get('minor', 0)),
                "major": int(sev_row.get('major', 0)),
                "fatal": int(sev_row.get('fatal', 0))
            })
        return res

    def get_state_analytics(self):
        state_counts = self.df['state'].value_counts().reset_index()
        state_counts.columns = ['state', 'total']
        
        ct = pd.crosstab(self.df['state'], self.df['accident_severity'])
        res = []
        for rank, row in state_counts.iterrows():
            s = row['state']
            sev_row = ct.loc[s] if s in ct.index else {}
            res.append({
                "rank": rank + 1,
                "state": s,
                "total": int(row['total']),
                "minor": int(sev_row.get('minor', 0)),
                "major": int(sev_row.get('major', 0)),
                "fatal": int(sev_row.get('fatal', 0))
            })
        return res

    def get_time_analytics(self):
        hourly_ct = pd.crosstab(self.df['hour'], self.df['accident_severity']).reset_index()
        hourly_res = []
        for _, row in hourly_ct.iterrows():
            hourly_res.append({
                "hour": int(row['hour']),
                "hour_label": f"{int(row['hour']):02d}:00",
                "minor": int(row.get('minor', 0)),
                "major": int(row.get('major', 0)),
                "fatal": int(row.get('fatal', 0)),
                "total": int(row.get('minor', 0) + row.get('major', 0) + row.get('fatal', 0))
            })
            
        day_ct = pd.crosstab(self.df['day_of_week'], self.df['accident_severity']).reset_index()
        day_order = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
        day_res = []
        for d in day_order:
            if d in day_ct['day_of_week'].values:
                row = day_ct[day_ct['day_of_week'] == d].iloc[0]
                day_res.append({
                    "day": d,
                    "minor": int(row.get('minor', 0)),
                    "major": int(row.get('major', 0)),
                    "fatal": int(row.get('fatal', 0)),
                    "total": int(row.get('minor', 0) + row.get('major', 0) + row.get('fatal', 0))
                })

        peak_ct = self.df.groupby('is_peak_hour')['accident_severity'].value_counts().unstack(fill_value=0).reset_index()
        peak_res = []
        for _, row in peak_ct.iterrows():
            is_peak = "Peak Hour" if row['is_peak_hour'] == 1 else "Non-Peak Hour"
            peak_res.append({
                "category": is_peak,
                "minor": int(row.get('minor', 0)),
                "major": int(row.get('major', 0)),
                "fatal": int(row.get('fatal', 0))
            })
            
        return {
            "hourly": hourly_res,
            "day_of_week": day_res,
            "peak_vs_non_peak": peak_res
        }

    def get_weather_analytics(self):
        ct = pd.crosstab(self.df['weather'], self.df['accident_severity']).reset_index()
        res = []
        for _, row in ct.iterrows():
            w = row['weather']
            res.append({
                "weather": w,
                "minor": int(row.get('minor', 0)),
                "major": int(row.get('major', 0)),
                "fatal": int(row.get('fatal', 0)),
                "total": int(row.get('minor', 0) + row.get('major', 0) + row.get('fatal', 0))
            })
        return res

    def get_road_analytics(self):
        road_ct = pd.crosstab(self.df['road_type'], self.df['accident_severity']).reset_index()
        road_res = []
        for _, row in road_ct.iterrows():
            road_res.append({
                "road_type": row['road_type'],
                "minor": int(row.get('minor', 0)),
                "major": int(row.get('major', 0)),
                "fatal": int(row.get('fatal', 0)),
                "total": int(row.get('minor', 0) + row.get('major', 0) + row.get('fatal', 0))
            })

        density_ct = pd.crosstab(self.df['traffic_density'], self.df['accident_severity']).reset_index()
        density_res = []
        for _, row in density_ct.iterrows():
            density_res.append({
                "traffic_density": row['traffic_density'],
                "minor": int(row.get('minor', 0)),
                "major": int(row.get('major', 0)),
                "fatal": int(row.get('fatal', 0)),
                "total": int(row.get('minor', 0) + row.get('major', 0) + row.get('fatal', 0))
            })

        return {
            "road_type": road_res,
            "traffic_density": density_res
        }

    def get_cause_analytics(self):
        ct = pd.crosstab(self.df['cause'], self.df['accident_severity']).reset_index()
        res = []
        for _, row in ct.iterrows():
            res.append({
                "cause": row['cause'],
                "minor": int(row.get('minor', 0)),
                "major": int(row.get('major', 0)),
                "fatal": int(row.get('fatal', 0)),
                "total": int(row.get('minor', 0) + row.get('major', 0) + row.get('fatal', 0))
            })
        res.sort(key=lambda x: x['total'], reverse=True)
        return res
