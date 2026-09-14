import os
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import Dict, Any, Optional

from services.dataset1_ml_service import Dataset1MLService
from services.shap_service import SHAPService
from services.dataset1_analytics_service import Dataset1AnalyticsService
from services.dataset1_map_service import Dataset1MapService
from services.dataset2_analytics_service import Dataset2AnalyticsService

app = FastAPI(
    title="AI-Powered Traffic Accident Severity & Analytics Platform API",
    description="Backend API powering accident severity prediction, XAI, What-If simulator, India map, and dual-dataset analytics.",
    version="1.0.0"
)

# CORS middleware for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Lazy instantiation of services
ml_service: Optional[Dataset1MLService] = None
shap_service: Optional[SHAPService] = None
d1_analytics_service = Dataset1AnalyticsService()
d1_map_service = Dataset1MapService()
d2_analytics_service = Dataset2AnalyticsService()

def get_ml_service():
    global ml_service
    if ml_service is None:
        try:
            ml_service = Dataset1MLService()
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"ML Service initialisation error: {str(e)}")
    return ml_service

def get_shap_service():
    global shap_service
    if shap_service is None:
        try:
            shap_service = SHAPService()
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"SHAP Service initialisation error: {str(e)}")
    return shap_service

# Request Schemas
class PredictRequest(BaseModel):
    city: Optional[str] = "Mumbai"
    state: Optional[str] = "Maharashtra"
    latitude: Optional[float] = 19.076
    longitude: Optional[float] = 72.877
    hour: Optional[int] = 18
    day_of_week: Optional[str] = "Friday"
    is_weekend: Optional[int] = 0
    road_type: Optional[str] = "highway"
    lanes: Optional[int] = 4
    traffic_signal: Optional[int] = 1
    weather: Optional[str] = "rain"
    visibility: Optional[str] = "low"
    temperature: Optional[int] = 28
    traffic_density: Optional[str] = "high"
    cause: Optional[str] = "overspeeding"
    is_peak_hour: Optional[int] = 1
    festival: Optional[str] = "Diwali"
    model_name: Optional[str] = None

class WhatIfRequest(BaseModel):
    current_scenario: Dict[str, Any]
    modified_scenario: Dict[str, Any]
    model_name: Optional[str] = None

# --- HEALTH ---
@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "dataset1": "indian_roads_dataset.csv (Active)",
        "dataset2": "Road.csv (Active)",
        "isolation_status": "Strict - Datasets operating independently"
    }

# --- ML & PREDICTION ENDPOINTS ---
@app.get("/api/ml/metrics")
def get_ml_metrics():
    service = get_ml_service()
    return service.get_metrics()

@app.get("/api/ml/best-model")
def get_best_model():
    service = get_ml_service()
    return service.get_best_model_info()

@app.post("/api/ml/predict")
def predict_severity(payload: PredictRequest):
    service = get_ml_service()
    data = payload.dict(exclude={"model_name"})
    return service.predict(data, model_name=payload.model_name)

@app.post("/api/ml/what-if")
def what_if_simulator(payload: WhatIfRequest):
    service = get_ml_service()
    return service.what_if_simulation(
        payload.current_scenario,
        payload.modified_scenario,
        model_name=payload.model_name
    )

@app.post("/api/ml/explain")
def explain_prediction(payload: PredictRequest):
    service = get_shap_service()
    data = payload.dict(exclude={"model_name"})
    return service.explain_prediction(data)

@app.get("/api/ml/global-shap")
def get_global_shap():
    service = get_shap_service()
    return service.get_global_importance()

# --- DATASET 1 ANALYTICS ENDPOINTS ---
@app.get("/api/analytics/overview")
def get_analytics_overview():
    return d1_analytics_service.get_overview_kpis()

@app.get("/api/analytics/yearly")
def get_analytics_yearly():
    return d1_analytics_service.get_yearly_trends()

@app.get("/api/analytics/cities")
def get_analytics_cities(city: Optional[str] = None):
    return d1_analytics_service.get_city_analytics(city_name=city)

@app.get("/api/analytics/states")
def get_analytics_states():
    return d1_analytics_service.get_state_analytics()

@app.get("/api/analytics/time")
def get_analytics_time():
    return d1_analytics_service.get_time_analytics()

@app.get("/api/analytics/weather")
def get_analytics_weather():
    return d1_analytics_service.get_weather_analytics()

@app.get("/api/analytics/roads")
def get_analytics_roads():
    return d1_analytics_service.get_road_analytics()

@app.get("/api/analytics/causes")
def get_analytics_causes():
    return d1_analytics_service.get_cause_analytics()

# --- MAP ENDPOINTS ---
@app.get("/api/map/options")
def get_map_options():
    return d1_map_service.get_filter_options()

@app.get("/api/map/accidents")
def get_map_accidents(
    severity: Optional[str] = Query('all'),
    city: Optional[str] = Query('all'),
    state: Optional[str] = Query('all'),
    weather: Optional[str] = Query('all'),
    year: Optional[str] = Query('all'),
    road_type: Optional[str] = Query('all'),
    cause: Optional[str] = Query('all'),
    limit: Optional[int] = Query(2000)
):
    return d1_map_service.get_accidents(
        severity=severity,
        city=city,
        state=state,
        weather=weather,
        year=year,
        road_type=road_type,
        cause=cause,
        limit=limit
    )

# --- DATASET 2 ANALYTICS (DETAILED ACCIDENT FACTORS) ---
@app.get("/api/dataset2/analytics")
def get_dataset2_analytics():
    return d2_analytics_service.get_all_analytics()

# --- FRONTEND STATIC SERVING ---
frontend_dist_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "frontend", "dist"))
if os.path.exists(frontend_dist_dir):
    app.mount("/assets", StaticFiles(directory=os.path.join(frontend_dist_dir, "assets")), name="assets")

    @app.get("/{full_path:path}")
    def serve_frontend(full_path: str):
        if full_path.startswith("api/"):
            raise HTTPException(status_code=404, detail="API route not found")
        index_file = os.path.join(frontend_dist_dir, "index.html")
        if os.path.exists(index_file):
            return FileResponse(index_file)
        raise HTTPException(status_code=404, detail="Index file not found")

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
