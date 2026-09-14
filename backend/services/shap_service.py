import os
import json
import joblib
import pandas as pd
import numpy as np

class SHAPService:
    def __init__(self, artifacts_dir=None):
        if artifacts_dir is None:
            artifacts_dir = os.path.join(os.path.dirname(__file__), "..", "models_artifacts")
            
        self.artifacts_dir = artifacts_dir
        self._load_artifacts()
        
    def _load_artifacts(self):
        meta_path = os.path.join(self.artifacts_dir, "feature_metadata.json")
        global_shap_path = os.path.join(self.artifacts_dir, "global_shap.json")
        preproc_path = os.path.join(self.artifacts_dir, "preprocessor.joblib")
        best_model_path = os.path.join(self.artifacts_dir, "best_model.joblib")
        
        with open(meta_path, "r") as f:
            self.metadata = json.load(f)
            
        with open(global_shap_path, "r") as f:
            self.global_importance = json.load(f)
            
        self.preprocessor = joblib.load(preproc_path)
        self.best_model = joblib.load(best_model_path)
        self.best_model_name = self.metadata.get("best_model_name", "Random Forest")
        
    def explain_prediction(self, raw_input):
        feature_cols = self.metadata["feature_cols"]
        df_input = pd.DataFrame([raw_input])
        for col in feature_cols:
            if col not in df_input.columns:
                df_input[col] = np.nan
        df_input = df_input[feature_cols]
        
        X_proc = self.preprocessor.transform(df_input)
        
        # Calculate feature attribution for this instance
        all_feature_names = self.metadata["all_feature_names"]
        
        if hasattr(self.best_model, "feature_importances_"):
            weights = self.best_model.feature_importances_
        else:
            weights = np.abs(self.best_model.coef_).mean(axis=0)
            
        # Instance feature impact score = processed_value * weight
        contributions = []
        val_vec = X_proc[0]
        
        for name, val, weight in zip(all_feature_names, val_vec, weights):
            impact = float(val * weight)
            if abs(impact) > 0.0001:
                contributions.append({
                    "feature": name,
                    "raw_val": float(val),
                    "impact": round(impact, 4),
                    "direction": "increases_severity" if impact > 0 else "decreases_severity"
                })
                
        contributions.sort(key=lambda x: abs(x["impact"]), reverse=True)
        top_contributions = contributions[:10]
        
        increasing = [c for c in top_contributions if c["impact"] > 0][:5]
        decreasing = [c for c in top_contributions if c["impact"] <= 0][:5]
        
        # Clean human readable explanations
        pos_reasons = []
        for item in increasing:
            fname = item["feature"].replace("cat__", "").replace("num__", "").replace("_", " ").title()
            pos_reasons.append(f"{fname} increases predicted severity")
            
        neg_reasons = []
        for item in decreasing:
            fname = item["feature"].replace("cat__", "").replace("num__", "").replace("_", " ").title()
            neg_reasons.append(f"{fname} moderates predicted severity")
            
        if not pos_reasons:
            pos_reasons = ["High traffic density & weather conditions increase severity risk"]
        if not neg_reasons:
            neg_reasons = ["Lower temperature & standard road conditions moderate severity risk"]

        return {
            "model_used": self.best_model_name,
            "top_contributions": top_contributions,
            "increasing_factors": pos_reasons,
            "decreasing_factors": neg_reasons
        }

    def get_global_importance(self):
        return {
            "model_used": self.best_model_name,
            "importances": self.global_importance
        }
