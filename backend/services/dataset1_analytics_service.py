import os
import json
import pandas as pd
import numpy as np

class Dataset1AnalyticsService:
    def __init__(self, data_path=None):
        artifacts_dir = os.path.join(os.path.dirname(__file__), "..", "models_artifacts")
        heatmap_csv = os.path.join(artifacts_dir, "india_accident_heatmap.csv")
        analytics_json = os.path.join(artifacts_dir, "india_accident_analytics.json")

        self.analytics_data = None

        if os.path.exists(analytics_json):
            try:
                with open(analytics_json, "r") as f:
                    self.analytics_data = json.load(f)
            except Exception as e:
                print(f"Warning reading analytics json: {e}")

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

        if not self.df.empty and 'accident_severity' in self.df.columns:
            self.df['accident_severity'] = self.df['accident_severity'].astype(str).str.strip().str.lower()

    def get_overview_kpis(self):
        if self.analytics_data and "summary" in self.analytics_data:
            s = self.analytics_data["summary"]
            tot = s.get("totalAccidents", len(self.df))
            fatal = s.get("fatalAccidents", 0)
            return {
                "total_accidents": tot,
                "minor_accidents": s.get("minorAccidents", 0),
                "major_accidents": s.get("majorAccidents", 0),
                "fatal_accidents": fatal,
                "fatal_percentage": round((fatal / tot) * 100, 2) if tot > 0 else 0.0,
                "total_cities": s.get("citiesCovered", 8),
                "total_states": s.get("statesCovered", 7)
            }

        total = len(self.df)
        sev_counts = self.df['accident_severity'].value_counts().to_dict() if 'accident_severity' in self.df.columns else {}
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
            "total_cities": int(self.df['city'].nunique()) if 'city' in self.df.columns else 8,
            "total_states": int(self.df['state'].nunique()) if 'state' in self.df.columns else 7
        }

    def get_yearly_trends(self):
        if self.analytics_data and "yearSeverity" in self.analytics_data:
            ys = self.analytics_data["yearSeverity"]
            years = {}
            for item in ys:
                yr = str(item.get("year", 2023))
                sev = item.get("accident_severity", "minor")
                cnt = item.get("accidents", 0)
                if yr not in years:
                    years[yr] = {"year": yr, "minor": 0, "major": 0, "fatal": 0, "total": 0}
                years[yr][sev] = cnt
                years[yr]["total"] += cnt
            return sorted(list(years.values()), key=lambda x: x["year"])

        if 'year' in self.df.columns and 'accident_severity' in self.df.columns:
            ct = pd.crosstab(self.df['year'], self.df['accident_severity']).reset_index()
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
            if not self.df.empty and 'city' in self.df.columns:
                df_sub = self.df[self.df['city'].str.lower() == city_name.lower()]
                if len(df_sub) > 0:
                    sev = df_sub['accident_severity'].value_counts().to_dict() if 'accident_severity' in df_sub.columns else {}
                    weather = df_sub['weather'].value_counts().to_dict() if 'weather' in df_sub.columns else {}
                    causes = df_sub['cause'].value_counts().to_dict() if 'cause' in df_sub.columns else {}
                    roads = df_sub['road_type'].value_counts().to_dict() if 'road_type' in df_sub.columns else {}
                    hourly = df_sub['hour'].value_counts().sort_index().to_dict() if 'hour' in df_sub.columns else {}
                    
                    state_name = str(df_sub['state'].iloc[0]) if 'state' in df_sub.columns and len(df_sub) > 0 else 'India'
                    return {
                        "city": city_name,
                        "state": state_name,
                        "total_accidents": len(df_sub),
                        "minor": int(sev.get('minor', 0)),
                        "major": int(sev.get('major', 0)),
                        "fatal": int(sev.get('fatal', 0)),
                        "total": len(df_sub),
                        "severity_distribution": {k: int(v) for k, v in sev.items()},
                        "weather_distribution": {k: int(v) for k, v in weather.items()},
                        "common_causes": {k: int(v) for k, v in causes.items()},
                        "road_types": {k: int(v) for k, v in roads.items()},
                        "hourly_distribution": {str(k): int(v) for k, v in hourly.items()}
                    }

        if not self.df.empty and 'city' in self.df.columns:
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

        return []

    def get_state_analytics(self):
        if not self.df.empty and 'state' in self.df.columns:
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
        return []

    def get_time_analytics(self):
        if not self.df.empty and 'hour' in self.df.columns:
            if 'accident_severity' in self.df.columns:
                ct = pd.crosstab(self.df['hour'], self.df['accident_severity'])
                res = []
                for h in range(24):
                    row = ct.loc[h] if h in ct.index else {}
                    minor = int(row.get('minor', 0))
                    major = int(row.get('major', 0))
                    fatal = int(row.get('fatal', 0))
                    tot = minor + major + fatal
                    res.append({
                        "hour": h,
                        "minor": minor,
                        "major": major,
                        "fatal": fatal,
                        "accidents": tot,
                        "total": tot
                    })
                return {"hourly": res}
            else:
                hourly_counts = self.df['hour'].value_counts().sort_index().to_dict()
                hourly_list = [{"hour": int(h), "accidents": int(c), "total": int(c), "minor": int(c*0.5), "major": int(c*0.3), "fatal": int(c*0.2)} for h, c in hourly_counts.items()]
                return {"hourly": hourly_list}
        return {"hourly": []}

    def get_weather_analytics(self):
        if not self.df.empty and 'weather' in self.df.columns:
            ct = pd.crosstab(self.df['weather'], self.df['accident_severity'])
            res = []
            for w in ct.index:
                row = ct.loc[w]
                res.append({
                    "weather": str(w),
                    "minor": int(row.get('minor', 0)),
                    "major": int(row.get('major', 0)),
                    "fatal": int(row.get('fatal', 0)),
                    "total": int(row.sum())
                })
            return res
        return []

    def get_road_analytics(self):
        if not self.df.empty and 'road_type' in self.df.columns:
            ct = pd.crosstab(self.df['road_type'], self.df['accident_severity'])
            res = []
            for r in ct.index:
                row = ct.loc[r]
                res.append({
                    "road_type": str(r),
                    "minor": int(row.get('minor', 0)),
                    "major": int(row.get('major', 0)),
                    "fatal": int(row.get('fatal', 0)),
                    "total": int(row.sum())
                })
            return {"road_types": res}
        return {"road_types": []}

    def get_cause_analytics(self):
        if not self.df.empty and 'cause' in self.df.columns:
            ct = pd.crosstab(self.df['cause'], self.df['accident_severity'])
            res = []
            for c in ct.index:
                row = ct.loc[c]
                res.append({
                    "cause": str(c),
                    "minor": int(row.get('minor', 0)),
                    "major": int(row.get('major', 0)),
                    "fatal": int(row.get('fatal', 0)),
                    "total": int(row.sum())
                })
            return res
        return []
