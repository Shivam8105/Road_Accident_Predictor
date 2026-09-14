# AI-Powered Traffic Accident Severity Prediction & Explainable Analytics Platform

An end-to-end Machine Learning and Analytics platform developed for traffic accident severity prediction, SHAP Explainable AI (XAI), What-If scenario simulation, interactive spatial accident risk mapping across India, and multi-dimensional exploratory analytics using two strictly independent datasets.

---

## 1. Project Objective

The platform solves a 3-class multiclass accident severity classification problem:
- **Minor Severity**
- **Major Severity**
- **Fatal Severity**

It evaluates 5 machine learning classifiers on the same stratified test set, automatically selects the optimal inference model based on Macro F1-score and Fatal accident recall, provides individual prediction explanations using SHAP, simulates real-time What-If scenario modifications, and displays spatial risk heatmaps across India.

---

## 2. Dataset 1: `indian_roads_dataset.csv` (Primary ML & Geographic Analytics)
- **Size**: 20,000 records, 24 columns.
- **Missing Values**: 0 (Clean dataset).
- **Target Variable**: `accident_severity` (`minor`: 55.12%, `major`: 29.94%, `fatal`: 14.94%).
- **Scope**: Powers 5 ML models, SHAP XAI, What-If simulator, severity prediction engine, India Leaflet map & heatmaps, and city/state/time/weather/road/cause analytics.

---

## 3. Dataset 2: `Road.csv` (Independent Detailed Accident Factors)
- **Size**: 12,316 records, 32 columns.
- **Target Distribution**: `Slight Injury` (84.56%), `Serious Injury` (14.15%), `Fatal injury` (1.28%).
- **Scope**: Powers the **Detailed Accident Factors** exploratory analytics section (Driver characteristics, vehicle service age, road surface conditions, light conditions, collision types, casualty metrics).

---

## 4. Absolute Dataset Rule & Strict Independence Rationale

The two datasets are **never merged, joined, concatenated, or matched**.
- **Reason**: They represent distinct data sources, schema structures, and geographic contexts.
- Dataset 1 contains spatial coordinates for India mapping and balanced target classes suited for primary ML modeling.
- Dataset 2 contains detailed driver/vehicle/casualty metrics but exhibits severe target class imbalance (84.6% Slight Injury).
- Keeping them strictly separate prevents synthetic leakage and ensures domain-accurate analytical insights.

---

## 5. Data Preprocessing Pipeline

- **Imputation**: Median imputer for numerical features; Most Frequent imputer for categorical features.
- **Scaling**: `StandardScaler` applied to numerical features for Logistic Regression.
- **Categorical Encoding**: `OneHotEncoder` with `handle_unknown='ignore'`.
- **Leakage Prevention Rule**: All preprocessor objects are fitted **strictly on the 80% training split** and transformed on the 20% test split.

---

## 6. Feature Selection Strategy

### Features Included:
- `city`, `state`, `latitude`, `longitude`
- `hour`, `day_of_week`, `is_weekend`, `is_peak_hour`, `festival`
- `road_type`, `lanes`, `traffic_signal`, `traffic_density`
- `weather`, `visibility`, `temperature`, `cause`

---

## 7. Data Leakage Prevention

The following columns were **explicitly excluded** from the ML feature set:
1. `accident_id`: Non-predictive database primary key.
2. `risk_score`: Synthetic risk index directly derived from accident outcome/severity — **Data Leakage**.
3. `casualties`: Post-accident outcome metric known only after accident occurrence — **Data Leakage**.
4. `vehicles_involved`: Post-accident detail known after accident occurrence — **Data Leakage**.
5. `date`, `time`: Raw datetime strings (engineered into clean temporal features).

---

## 8. Five Machine Learning Models Evaluated

1. **Logistic Regression** (Interpretable linear baseline)
2. **Decision Tree Classifier** (Non-linear decision tree)
3. **Random Forest Classifier** (Bagging ensemble of decision trees)
4. **XGBoost Classifier / Gradient Boosting** (Gradient boosting algorithm)
5. **LightGBM Classifier / HistGradientBoosting** (Efficient histogram-based boosting)

All 5 models are evaluated on the exact same 20% stratified test split (`random_state=42`).

---

## 9. Evaluation Metrics Reported

- **Overall**: Accuracy, Macro Precision, Macro Recall, Macro F1-Score, Weighted Precision, Weighted Recall, Weighted F1-Score.
- **Per-Class Metrics**: Precision, Recall, F1-Score, and Support for `Minor`, `Major`, and `Fatal` classes.
- **Confusion Matrices**: Visual 3x3 heatmap matrices for each model.

---

## 10. Model Selection Methodology

The optimal model is selected automatically using **Macro F1-Score** as the primary criterion, alongside high recall for **Fatal accidents** (due to the safety-critical cost of misclassifying fatal accidents).

- **🏆 Selected Best Model**: **Random Forest Classifier** (Macro F1: 31.98%, Accuracy: 46.25%).

---

## 11. SHAP Explainable AI (XAI)

Computes individual feature attributions (`explain_prediction`) and dataset-wide global feature importances (`global_shap`).
- Highlights positive contributing factors that increase predicted severity risk.
- Highlights negative contributing factors that moderate predicted severity risk.

---

## 12. What-If Scenario Simulator

Allows interactive parameter modifications (e.g. Weather: Rain → Clear, Visibility: Low → High, Traffic: High → Medium).
- Re-evaluates the trained model pipeline.
- Displays Before vs After class probability distributions (`model.predict_proba()`) and predicted severity shift (`MAJOR ➔ MINOR`).

---

## 13. India Accident Map & Heatmap

- Built with **Leaflet / React-Leaflet**.
- Interactive markers showing City, State, Severity, Weather, Temperature, Cause, Date, and Time.
- Density heatmap & severity heatmap visualization.
- Dynamic multi-parameter filters (Severity, City, State, Weather, Year, Road Type, Cause).

---

## 14. Multi-Dimensional Analytics Modules

- **City Analysis**: Top cities rankings & hourly distribution.
- **State Analysis**: State rankings and state-wise severity.
- **Time Analysis**: 24-hour hourly profile, day of week distribution, peak vs non-peak.
- **Weather Analysis**: Weather condition vs accident count & severity.
- **Road Infrastructure**: Highway/urban/rural road types & traffic density impacts.
- **Detailed Accident Factors (Dataset 2)**: Driver experience, vehicle defects, road surface, light conditions, casualty class.

---

## 15. Technology Stack

- **Backend**: Python 3.13, FastAPI, Uvicorn, Pydantic, Scikit-Learn, pandas, numpy, joblib, SHAP.
- **Frontend**: React 19, TypeScript, Vite 5, Tailwind CSS, Recharts, Leaflet, Lucide-React.

---

## 16. Installation Instructions

```bash
# 1. Clone repository & enter workspace
cd /Users/shivamkumar/Desktop/Road_Accident

# 2. Activate Python Virtual Environment
source venv/bin/activate

# 3. Install Backend Dependencies
pip install pandas numpy scikit-learn xgboost lightgbm shap fastapi uvicorn pydantic python-multipart httpx

# 4. Install Frontend Dependencies
cd frontend
npm install
```

---

## 17. How to Train Models

To run the model training pipeline, execute:

```bash
./venv/bin/python backend/training/train_models.py
```

This trains all 5 models, computes evaluation metrics, extracts SHAP global feature importances, and saves artifacts to `backend/models_artifacts/`.

---

## 18. How to Run the Platform

### Option A: Complete Unified Production Server (Backend + Frontend)

```bash
# Build Frontend Bundle
cd frontend
npm run build
cd ..

# Start FastAPI Unified Server
./venv/bin/python backend/main.py
```
Open **`http://localhost:8000`** in your web browser.

### Option B: Development Mode (Hot Reload)

```bash
# Terminal 1: Backend
./venv/bin/python backend/main.py

# Terminal 2: Frontend
cd frontend
npm run dev
```
Open **`http://localhost:3000`** in your web browser.

---

## 19. Backend API Test Suite

To verify all REST API endpoints:

```bash
./venv/bin/python backend/test_backend.py
```

---

## 20. Project Limitations

1. **Map Disclaimer**: The map displays historical accident coordinates from Dataset 1. It represents historical accident concentration and does NOT predict future accident occurrences.
2. **What-If Disclaimer**: The What-If simulator estimates severity probability shifts based on patterns learned by the trained model from Dataset 1. It estimates statistical probability shifts rather than guaranteeing accident prevention.
