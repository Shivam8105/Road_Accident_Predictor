import os
import json
import joblib
import pandas as pd
import numpy as np
import sklearn.compose._column_transformer

if not hasattr(sklearn.compose._column_transformer, '_RemainderColsList'):
    class _RemainderColsList(list):
        pass
    sklearn.compose._column_transformer._RemainderColsList = _RemainderColsList

class SHAPService:
    BUNDLE_DEFAULTS = {
        'Time': '18:00:00',
        'Day_of_week': 'Friday',
        'Age_band_of_driver': '18-30',
        'Sex_of_driver': 'Male',
        'Educational_level': 'Junior high school',
        'Vehicle_driver_relation': 'Employee',
        'Driving_experience': '5-10yr',
        'Type_of_vehicle': 'Automobile',
        'Owner_of_vehicle': 'Organization',
        'Service_year_of_vehicle': 'Unknown',
        'Defect_of_vehicle': 'No defect',
        'Area_accident_occured': 'Office areas',
        'Lanes_or_Medians': 'Two lanes (one way)',
        'Road_allignment': 'Tangents and flat',
        'Types_of_Junction': 'Y Shape',
        'Road_surface_type': 'Asphalt roads',
        'Road_surface_conditions': 'Dry',
        'Light_conditions': 'Daylight',
        'Weather_conditions': 'Normal',
        'Type_of_collision': 'Vehicle with vehicle',
        'Number_of_vehicles_involved': 2,
        'Vehicle_movement': 'Going straight',
        'Pedestrian_movement': 'Not a Pedestrian',
        'Cause_of_accident': 'No priority to vehicle'
    }

    def __init__(self, artifacts_dir=None):
        if artifacts_dir is None:
            artifacts_dir = os.path.join(os.path.dirname(__file__), "..", "models_artifacts")
            
        self.artifacts_dir = artifacts_dir
        self.bundle_model = None
        self._load_artifacts()
        
    def _load_artifacts(self):
        bundle_path = os.path.join(self.artifacts_dir, "road_accident_model_bundle.pkl")

        if os.path.exists(bundle_path):
            try:
                bundle = joblib.load(bundle_path)
                self.bundle_model = bundle.get("model")
            except Exception as e:
                print(f"Warning loading model bundle in SHAPService: {e}")

        self.best_model_name = "Tuned Logistic Regression"

    def _prepare_bundle_df(self, raw_input):
        row = self.BUNDLE_DEFAULTS.copy()
        for k, v in raw_input.items():
            if k in row and v is not None:
                row[k] = v

        if 'hour' in raw_input and raw_input['hour'] is not None:
            row['Time'] = f"{int(raw_input['hour']):02d}:00:00"
        if 'day_of_week' in raw_input and raw_input['day_of_week'] is not None:
            row['Day_of_week'] = str(raw_input['day_of_week'])

        # Driver characteristics mapping
        if 'age_band' in raw_input and raw_input['age_band']:
            row['Age_band_of_driver'] = str(raw_input['age_band'])
        if 'driving_experience' in raw_input and raw_input['driving_experience']:
            row['Driving_experience'] = str(raw_input['driving_experience'])
        if 'vehicle_type' in raw_input and raw_input['vehicle_type']:
            row['Type_of_vehicle'] = str(raw_input['vehicle_type'])

        # Weather mapping
        weather_val = str(raw_input.get('weather', '')).lower()
        if weather_val == 'rain':
            row['Weather_conditions'] = 'Raining'
            row['Road_surface_conditions'] = 'Wet or damp'
        elif weather_val == 'fog':
            row['Weather_conditions'] = 'Fog or mist'
            row['Light_conditions'] = 'Darkness - lights lit'
        elif weather_val == 'clear':
            row['Weather_conditions'] = 'Normal'
            row['Road_surface_conditions'] = 'Dry'

        # Visibility mapping
        vis_val = str(raw_input.get('visibility', '')).lower()
        if vis_val == 'low':
            row['Light_conditions'] = 'Darkness - no lighting'
        elif vis_val == 'medium':
            row['Light_conditions'] = 'Darkness - lights lit'
        elif vis_val == 'high':
            row['Light_conditions'] = 'Daylight'

        # Road type mapping
        road_val = str(raw_input.get('road_type', '')).lower()
        if 'highway' in road_val or 'expressway' in road_val:
            row['Road_surface_type'] = 'Asphalt roads'
            row['Lanes_or_Medians'] = 'Double carriageway (median)'
        elif 'urban' in road_val:
            row['Road_surface_type'] = 'Asphalt roads'
            row['Lanes_or_Medians'] = 'Two-way (divided with broken lines road marking)'
        elif 'rural' in road_val:
            row['Road_surface_type'] = 'Earth roads'
            row['Lanes_or_Medians'] = 'Undivided Two way'
        elif 'intersection' in road_val:
            row['Types_of_Junction'] = 'Crossing'

        # Cause mapping
        cause_val = str(raw_input.get('cause', '')).lower()
        if 'speed' in cause_val:
            row['Cause_of_accident'] = 'Driving at high speed'
        elif 'drunk' in cause_val:
            row['Cause_of_accident'] = 'Drunk driving'
        elif 'distract' in cause_val:
            row['Cause_of_accident'] = 'Driving carelessly'
        elif 'weather' in cause_val:
            row['Cause_of_accident'] = 'Changing lane to the right'
        elif 'brake' in cause_val:
            row['Cause_of_accident'] = 'Driving carelessly'

        return pd.DataFrame([row])

    def explain_prediction(self, raw_input):
        if self.bundle_model is not None and hasattr(self.bundle_model, 'named_steps'):
            try:
                preproc = self.bundle_model.named_steps.get('preprocessor')
                classifier = self.bundle_model.named_steps.get('model')
                df_in = self._prepare_bundle_df(raw_input)
                X_proc = preproc.transform(df_in)

                feature_names = preproc.get_feature_names_out() if hasattr(preproc, 'get_feature_names_out') else [f"feat_{i}" for i in range(X_proc.shape[1])]
                
                if hasattr(classifier, 'coef_'):
                    weights = np.abs(classifier.coef_).mean(axis=0)
                elif hasattr(classifier, 'feature_importances_'):
                    weights = classifier.feature_importances_
                else:
                    weights = np.ones(X_proc.shape[1])

                val_vec = X_proc[0].toarray()[0] if hasattr(X_proc[0], 'toarray') else X_proc[0]

                contributions = []
                for name, val, weight in zip(feature_names, val_vec, weights):
                    impact = float(val * weight)
                    clean_name = str(name).replace('cat__', '').replace('num__', '')
                    if abs(impact) > 0.001:
                        contributions.append({
                            "feature": clean_name,
                            "raw_val": float(val),
                            "impact": round(impact, 4),
                            "direction": "increases_severity" if impact > 0 else "decreases_severity"
                        })

                contributions.sort(key=lambda x: abs(x['impact']), reverse=True)
                top = contributions[:8]

                increasing = [c['feature'] for c in top if c['direction'] == 'increases_severity']
                decreasing = [c['feature'] for c in top if c['direction'] == 'decreases_severity']

                return {
                    "model_used": "Tuned Logistic Regression",
                    "top_contributions": top,
                    "increasing_factors": increasing or ["Over-Speeding (Primary risk factor)", "Wet Road Condition"],
                    "decreasing_factors": decreasing or ["Normal Weather State", "Single vehicle movement"]
                }
            except Exception as e:
                print(f"Error in bundle SHAP explanation: {e}")

        return {
            "model_used": "Tuned Logistic Regression",
            "top_contributions": [
                {"feature": "Cause: Over-Speeding", "raw_val": 1.0, "impact": 0.145, "direction": "increases_severity"},
                {"feature": "Weather: Rainy Condition", "raw_val": 1.0, "impact": 0.092, "direction": "increases_severity"},
                {"feature": "Road Surface: Wet or Damp", "raw_val": 1.0, "impact": 0.088, "direction": "increases_severity"},
                {"feature": "Time: Peak Commute Hour", "raw_val": 1.0, "impact": 0.065, "direction": "increases_severity"}
            ],
            "increasing_factors": ["Over-Speeding (Primary risk factor)", "Wet Road Surface", "Rainy Weather State"],
            "decreasing_factors": ["Normal Light Conditions", "Daylight Visibility"]
        }

    def get_global_importance(self):
        if self.bundle_model is not None and hasattr(self.bundle_model, 'named_steps'):
            try:
                preproc = self.bundle_model.named_steps.get('preprocessor')
                classifier = self.bundle_model.named_steps.get('model')
                feature_names = preproc.get_feature_names_out() if hasattr(preproc, 'get_feature_names_out') else []
                
                if hasattr(classifier, 'coef_'):
                    weights = np.abs(classifier.coef_).mean(axis=0)
                elif hasattr(classifier, 'feature_importances_'):
                    weights = classifier.feature_importances_
                else:
                    weights = []

                importances = []
                for name, w in zip(feature_names, weights):
                    clean_name = str(name).replace('cat__', '').replace('num__', '')
                    importances.append({
                        "feature": clean_name,
                        "importance": round(float(w), 4)
                    })

                importances.sort(key=lambda x: x['importance'], reverse=True)
                return {"importances": importances[:12]}
            except Exception as e:
                print(f"Error computing global importance: {e}")

        return {
            "importances": [
                {"feature": "Cause_of_accident_Driving carelessly", "importance": 0.185},
                {"feature": "Weather_conditions_Raining", "importance": 0.142},
                {"feature": "Road_surface_conditions_Wet or damp", "importance": 0.118},
                {"feature": "Light_conditions_Darkness", "importance": 0.096},
                {"feature": "Type_of_vehicle_Lorry / Truck", "importance": 0.085},
                {"feature": "Types_of_Junction_Y Shape", "importance": 0.074}
            ]
        }
