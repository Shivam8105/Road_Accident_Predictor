import os
import json
import joblib
import pandas as pd
import numpy as np

class Dataset1MLService:
    def __init__(self, artifacts_dir=None):
        if artifacts_dir is None:
            artifacts_dir = os.path.join(os.path.dirname(__file__), "..", "models_artifacts")
            
        self.artifacts_dir = artifacts_dir
        self._load_artifacts()
        
    def _load_artifacts(self):
        meta_path = os.path.join(self.artifacts_dir, "feature_metadata.json")
        metrics_path = os.path.join(self.artifacts_dir, "model_metrics.json")
        preproc_path = os.path.join(self.artifacts_dir, "preprocessor.joblib")
        best_model_path = os.path.join(self.artifacts_dir, "best_model.joblib")
        
        if not os.path.exists(meta_path):
            raise FileNotFoundError("Model artifacts not found. Please train models first.")
            
        with open(meta_path, "r") as f:
            self.metadata = json.load(f)
            
        with open(metrics_path, "r") as f:
            self.metrics = json.load(f)
            
        self.preprocessor = joblib.load(preproc_path)
        self.best_model = joblib.load(best_model_path)
        self.best_model_name = self.metadata.get("best_model_name", "Random Forest")
        
        # Load all 5 models for comparison
        self.models = {}
        model_names = ["Logistic Regression", "Decision Tree", "Random Forest", "XGBoost", "LightGBM"]
        for name in model_names:
            fname = name.lower().replace(" ", "_") + ".joblib"
            path = os.path.join(self.artifacts_dir, fname)
            if os.path.exists(path):
                self.models[name] = joblib.load(path)

    def _prepare_input_df(self, raw_input):
        # Convert dictionary input to DataFrame matching feature_cols
        feature_cols = self.metadata["feature_cols"]
        df_input = pd.DataFrame([raw_input])
        
        # Ensure all required features are present
        for col in feature_cols:
            if col not in df_input.columns:
                df_input[col] = np.nan
                
        # Fill defaults or types if needed
        df_input = df_input[feature_cols]
        return df_input

    def predict(self, raw_input, model_name=None):
        df_input = self._prepare_input_df(raw_input)
        X_proc = self.preprocessor.transform(df_input)
        
        target_model = self.best_model
        selected_name = self.best_model_name
        if model_name and model_name in self.models:
            target_model = self.models[model_name]
            selected_name = model_name
            
        probs = target_model.predict_proba(X_proc)[0]
        pred_idx = int(np.argmax(probs))
        
        rev_map = {0: "minor", 1: "major", 2: "fatal"}
        predicted_class = rev_map.get(pred_idx, "minor").upper()
        
        # Format probabilities (minor: 0, major: 1, fatal: 2)
        probabilities = {
            "minor": round(float(probs[0]) * 100, 2),
            "major": round(float(probs[1]) * 100, 2),
            "fatal": round(float(probs[2]) * 100, 2)
        }
        
        return {
            "predicted_severity": predicted_class,
            "probabilities": probabilities,
            "model_used": selected_name
        }

    def what_if_simulation(self, current_scenario, modified_scenario, model_name=None):
        res_current = self.predict(current_scenario, model_name)
        res_modified = self.predict(modified_scenario, model_name)
        
        severity_changed = res_current["predicted_severity"] != res_modified["predicted_severity"]
        
        return {
            "current": res_current,
            "modified": res_modified,
            "severity_changed": severity_changed,
            "transition": f"{res_current['predicted_severity']} ➔ {res_modified['predicted_severity']}"
        }

    def get_metrics(self):
        return {
            "best_model_name": self.best_model_name,
            "metrics": self.metrics
        }

    def get_best_model_info(self):
        best_metrics = self.metrics.get(self.best_model_name, {})
        return {
            "model_name": self.best_model_name,
            "accuracy": round(best_metrics.get("accuracy", 0.0) * 100, 2),
            "precision": round(best_metrics.get("macro_precision", 0.0) * 100, 2),
            "recall": round(best_metrics.get("macro_recall", 0.0) * 100, 2),
            "f1_score": round(best_metrics.get("weighted_f1", 0.0) * 100, 2),
            "macro_f1": round(best_metrics.get("macro_f1", 0.0) * 100, 2),
            "fatal_recall": round(best_metrics.get("per_class", {}).get("fatal", {}).get("recall", 0.0) * 100, 2)
        }
