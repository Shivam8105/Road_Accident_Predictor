import os
import json
import joblib
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer
from sklearn.metrics import accuracy_score, precision_recall_fscore_support, confusion_matrix

from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier, HistGradientBoostingClassifier

# Try importing XGBoost & LightGBM with safe sklearn fallback
try:
    from xgboost import XGBClassifier
    xgb_inst = XGBClassifier(n_estimators=100, learning_rate=0.1, max_depth=6, random_state=42, eval_metric='mlogloss')
    # Test if native library actually loads
    xgb_inst.get_params()
    USE_NATIVE_XGB = True
except Exception:
    USE_NATIVE_XGB = False

try:
    from lightgbm import LGBMClassifier
    lgb_inst = LGBMClassifier(n_estimators=100, learning_rate=0.1, max_depth=6, class_weight='balanced', random_state=42, verbose=-1)
    lgb_inst.get_params()
    USE_NATIVE_LGB = True
except Exception:
    USE_NATIVE_LGB = False

import shap

def train_and_evaluate():
    print("🚀 Starting Model Training Pipeline for Dataset 1 (indian_roads_dataset.csv)...")
    
    data_path = os.path.join(os.path.dirname(__file__), "..", "..", "indian_roads_dataset.csv")
    if not os.path.exists(data_path):
        data_path = "indian_roads_dataset.csv"
        
    df = pd.read_csv(data_path)
    print(f"Loaded dataset with shape: {df.shape}")
    
    target_col = "accident_severity"
    excluded_cols = ["accident_id", "risk_score", "casualties", "vehicles_involved", "date", "time", target_col]
    feature_cols = [col for col in df.columns if col not in excluded_cols]
    print(f"Selected {len(feature_cols)} features for model training.")
    
    df[target_col] = df[target_col].str.strip().str.lower()
    
    label_mapping = {"minor": 0, "major": 1, "fatal": 2}
    reverse_mapping = {0: "minor", 1: "major", 2: "fatal"}
    
    X = df[feature_cols].copy()
    y = df[target_col].map(label_mapping).astype(int)
    
    num_cols = X.select_dtypes(include=[np.number]).columns.tolist()
    cat_cols = X.select_dtypes(include=['object', 'category']).columns.tolist()
    
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42, stratify=y
    )
    
    num_transformer = Pipeline(steps=[
        ('imputer', SimpleImputer(strategy='median')),
        ('scaler', StandardScaler())
    ])
    
    cat_transformer = Pipeline(steps=[
        ('imputer', SimpleImputer(strategy='most_frequent')),
        ('onehot', OneHotEncoder(handle_unknown='ignore', sparse_output=False))
    ])
    
    preprocessor = ColumnTransformer(
        transformers=[
            ('num', num_transformer, num_cols),
            ('cat', cat_transformer, cat_cols)
        ]
    )
    
    X_train_proc = preprocessor.fit_transform(X_train)
    X_test_proc = preprocessor.transform(X_test)
    
    cat_encoder = preprocessor.named_transformers_['cat'].named_steps['onehot']
    encoded_cat_cols = cat_encoder.get_feature_names_out(cat_cols).tolist()
    all_feature_names = num_cols + encoded_cat_cols
    
    # Instantiate 5 Models
    models = {
        "Logistic Regression": LogisticRegression(max_iter=1000, class_weight='balanced', random_state=42),
        "Decision Tree": DecisionTreeClassifier(max_depth=10, class_weight='balanced', random_state=42),
        "Random Forest": RandomForestClassifier(n_estimators=100, class_weight='balanced', random_state=42, n_jobs=-1)
    }
    
    if USE_NATIVE_XGB:
        models["XGBoost"] = XGBClassifier(n_estimators=100, learning_rate=0.1, max_depth=6, random_state=42, eval_metric='mlogloss')
    else:
        print("Notice: Using sklearn GradientBoostingClassifier for XGBoost benchmark engine.")
        models["XGBoost"] = GradientBoostingClassifier(n_estimators=100, learning_rate=0.1, max_depth=6, random_state=42)
        
    if USE_NATIVE_LGB:
        models["LightGBM"] = LGBMClassifier(n_estimators=100, learning_rate=0.1, max_depth=6, class_weight='balanced', random_state=42, verbose=-1)
    else:
        print("Notice: Using sklearn HistGradientBoostingClassifier for LightGBM benchmark engine.")
        models["LightGBM"] = HistGradientBoostingClassifier(max_iter=100, learning_rate=0.1, max_depth=6, class_weight='balanced', random_state=42)

    results = {}
    best_model_name = None
    best_macro_f1 = -1.0
    trained_model_objs = {}
    class_names = ["minor", "major", "fatal"]
    
    for name, model in models.items():
        print(f"\n--- Training {name} ---")
        model.fit(X_train_proc, y_train)
        y_pred = model.predict(X_test_proc)
        y_prob = model.predict_proba(X_test_proc)
        
        acc = float(accuracy_score(y_test, y_pred))
        macro_p, macro_r, macro_f1, _ = precision_recall_fscore_support(y_test, y_pred, average='macro')
        weight_p, weight_r, weight_f1, _ = precision_recall_fscore_support(y_test, y_pred, average='weighted')
        p_class, r_class, f1_class, supp_class = precision_recall_fscore_support(y_test, y_pred, average=None, labels=[0, 1, 2])
        cm = confusion_matrix(y_test, y_pred, labels=[0, 1, 2]).tolist()
        
        class_metrics = {}
        for idx, cname in enumerate(class_names):
            class_metrics[cname] = {
                "precision": round(float(p_class[idx]), 4),
                "recall": round(float(r_class[idx]), 4),
                "f1_score": round(float(f1_class[idx]), 4),
                "support": int(supp_class[idx])
            }
            
        metrics_dict = {
            "accuracy": round(acc, 4),
            "macro_precision": round(float(macro_p), 4),
            "macro_recall": round(float(macro_r), 4),
            "macro_f1": round(float(macro_f1), 4),
            "weighted_precision": round(float(weight_p), 4),
            "weighted_recall": round(float(weight_r), 4),
            "weighted_f1": round(float(weight_f1), 4),
            "per_class": class_metrics,
            "confusion_matrix": cm
        }
        
        results[name] = metrics_dict
        trained_model_objs[name] = model
        print(f"Results for {name} -> Acc: {acc:.4f}, Macro F1: {macro_f1:.4f}, Fatal Recall: {r_class[2]:.4f}")
        
        if macro_f1 > best_macro_f1:
            best_macro_f1 = macro_f1
            best_model_name = name

    print(f"\n🏆 BEST PERFORMING MODEL: {best_model_name} (Macro F1: {best_macro_f1:.4f})")
    
    output_dir = os.path.join(os.path.dirname(__file__), "..", "models_artifacts")
    os.makedirs(output_dir, exist_ok=True)
    
    joblib.dump(preprocessor, os.path.join(output_dir, "preprocessor.joblib"))
    
    feature_meta = {
        "feature_cols": feature_cols,
        "num_cols": num_cols,
        "cat_cols": cat_cols,
        "all_feature_names": all_feature_names,
        "label_mapping": label_mapping,
        "reverse_mapping": reverse_mapping,
        "class_names": class_names,
        "best_model_name": best_model_name
    }
    with open(os.path.join(output_dir, "feature_metadata.json"), "w") as f:
        json.dump(feature_meta, f, indent=2)
        
    with open(os.path.join(output_dir, "model_metrics.json"), "w") as f:
        json.dump(results, f, indent=2)
        
    for name, model in trained_model_objs.items():
        filename = name.lower().replace(" ", "_") + ".joblib"
        joblib.dump(model, os.path.join(output_dir, filename))
        if name == best_model_name:
            joblib.dump(model, os.path.join(output_dir, "best_model.joblib"))
            
    print("\n⚡ Calculating SHAP / Feature Importances for Best Model...")
    best_model = trained_model_objs[best_model_name]
    bg_sample = X_train_proc[:200]
    test_sample = X_test_proc[:300]
    
    try:
        if hasattr(best_model, "feature_importances_"):
            imps = best_model.feature_importances_
        else:
            imps = np.abs(best_model.coef_).mean(axis=0)
            
        global_importance = [{"feature": fname, "importance": round(float(imp), 5)} for fname, imp in zip(all_feature_names, imps)]
        global_importance.sort(key=lambda x: x["importance"], reverse=True)
        
        with open(os.path.join(output_dir, "global_shap.json"), "w") as f:
            json.dump(global_importance[:25], f, indent=2)
            
        print("Successfully saved global feature importances.")
    except Exception as e:
        print(f"Feature importance calculation notice: {e}")

    joblib.dump(bg_sample, os.path.join(output_dir, "bg_sample.joblib"))
    print("\n✅ Model Training and Artifact Generation Completed Successfully!")

if __name__ == "__main__":
    train_and_evaluate()
