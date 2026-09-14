import os
import pandas as pd
import numpy as np

class Dataset2AnalyticsService:
    def __init__(self, data_path="Road.csv"):
        if not os.path.exists(data_path):
            data_path = os.path.join(os.path.dirname(__file__), "..", "..", "Road.csv")
            
        self.df = pd.read_csv(data_path)

    def _get_freq(self, col):
        if col not in self.df.columns:
            return []
        s = self.df[col].fillna("Unknown / Not Stated").astype(str).str.strip()
        counts = s.value_counts().head(10)
        total = len(self.df)
        return [{"category": str(k), "count": int(v), "percentage": round((v / total) * 100, 2)} for k, v in counts.items()]

    def _get_cross_severity(self, col):
        if col not in self.df.columns or 'Accident_severity' not in self.df.columns:
            return []
        df_temp = self.df.copy()
        df_temp[col] = df_temp[col].fillna("Unknown").astype(str).str.strip()
        ct = pd.crosstab(df_temp[col], df_temp['Accident_severity'])
        res = []
        for cat in ct.index[:10]:
            row = ct.loc[cat]
            res.append({
                "category": str(cat),
                "slight": int(row.get('Slight Injury', 0)),
                "serious": int(row.get('Serious Injury', 0)),
                "fatal": int(row.get('Fatal injury', 0)),
                "total": int(row.sum())
            })
        res.sort(key=lambda x: x['total'], reverse=True)
        return res

    def get_all_analytics(self):
        total = len(self.df)
        
        # Severity Distribution
        sev_counts = self.df['Accident_severity'].value_counts().to_dict()
        severity_dist = [
            {"label": "Slight Injury", "count": int(sev_counts.get("Slight Injury", 0)), "percentage": round((sev_counts.get("Slight Injury", 0)/total)*100, 2)},
            {"label": "Serious Injury", "count": int(sev_counts.get("Serious Injury", 0)), "percentage": round((sev_counts.get("Serious Injury", 0)/total)*100, 2)},
            {"label": "Fatal injury", "count": int(sev_counts.get("Fatal injury", 0)), "percentage": round((sev_counts.get("Fatal injury", 0)/total)*100, 2)}
        ]
        
        return {
            "metadata": {
                "dataset_name": "Road.csv (Dataset 2)",
                "total_records": total,
                "total_columns": len(self.df.columns),
                "imbalance_warning": "Dataset 2 has a heavily imbalanced severity distribution (84.6% Slight, 14.2% Serious, 1.3% Fatal). It is reserved strictly for detailed factor analytics."
            },
            "severity_distribution": severity_dist,
            "driver_factors": {
                "age_band": self._get_freq("Age_band_of_driver"),
                "sex": self._get_freq("Sex_of_driver"),
                "education": self._get_freq("Educational_level"),
                "experience": self._get_freq("Driving_experience"),
                "relation": self._get_freq("Vehicle_driver_relation"),
                "age_vs_severity": self._get_cross_severity("Age_band_of_driver"),
                "experience_vs_severity": self._get_cross_severity("Driving_experience")
            },
            "vehicle_factors": {
                "vehicle_type": self._get_freq("Type_of_vehicle"),
                "ownership": self._get_freq("Owner_of_vehicle"),
                "service_years": self._get_freq("Service_year_of_vehicle"),
                "defects": self._get_freq("Defect_of_vehicle"),
                "type_vs_severity": self._get_cross_severity("Type_of_vehicle")
            },
            "road_factors": {
                "area": self._get_freq("Area_accident_occured"),
                "lanes_medians": self._get_freq("Lanes_or_Medians"),
                "alignment": self._get_freq("Road_allignment"),
                "junction_type": self._get_freq("Types_of_Junction"),
                "surface_type": self._get_freq("Road_surface_type"),
                "surface_condition": self._get_freq("Road_surface_conditions"),
                "surface_vs_severity": self._get_cross_severity("Road_surface_conditions")
            },
            "environmental_factors": {
                "light_conditions": self._get_freq("Light_conditions"),
                "weather_conditions": self._get_freq("Weather_conditions"),
                "light_vs_severity": self._get_cross_severity("Light_conditions")
            },
            "accident_factors": {
                "collision_type": self._get_freq("Type_of_collision"),
                "cause_of_accident": self._get_freq("Cause_of_accident"),
                "vehicle_movement": self._get_freq("Vehicle_movement"),
                "cause_vs_severity": self._get_cross_severity("Cause_of_accident")
            },
            "casualty_factors": {
                "casualty_class": self._get_freq("Casualty_class"),
                "sex": self._get_freq("Sex_of_casualty"),
                "age_band": self._get_freq("Age_band_of_casualty"),
                "casualty_severity": self._get_freq("Casualty_severity"),
                "work": self._get_freq("Work_of_casuality"),
                "fitness": self._get_freq("Fitness_of_casuality"),
                "pedestrian_movement": self._get_freq("Pedestrian_movement")
            }
        }
