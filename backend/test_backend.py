import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

def test_all_endpoints():
    print("🧪 Running Backend API Endpoint Tests...")
    
    # 1. Health
    res = client.get("/api/health")
    assert res.status_code == 200, f"Health failed: {res.text}"
    print("  ✓ GET /api/health -> 200 OK")
    
    # Root Frontend HTML
    res = client.get("/")
    assert res.status_code == 200, f"Root frontend serving failed: {res.text}"
    assert "TRAFFIC" in res.text or "<div id=\"root\">" in res.text
    print("  ✓ GET / (Frontend Web App) -> 200 OK")
    
    # 2. ML Metrics
    res = client.get("/api/ml/metrics")
    assert res.status_code == 200, f"ML metrics failed: {res.text}"
    print("  ✓ GET /api/ml/metrics -> 200 OK")
    
    # 3. Best Model
    res = client.get("/api/ml/best-model")
    assert res.status_code == 200, f"Best model failed: {res.text}"
    print("  ✓ GET /api/ml/best-model -> 200 OK")
    
    # 4. Predict
    sample_input = {
        "city": "Mumbai", "state": "Maharashtra", "latitude": 19.076, "longitude": 72.877,
        "hour": 22, "day_of_week": "Friday", "is_weekend": 0, "road_type": "highway",
        "lanes": 4, "traffic_signal": 0, "weather": "rain", "visibility": "low",
        "temperature": 26, "traffic_density": "high", "cause": "overspeeding",
        "is_peak_hour": 1, "festival": "None"
    }
    res = client.post("/api/ml/predict", json=sample_input)
    assert res.status_code == 200, f"Predict failed: {res.text}"
    print(f"  ✓ POST /api/ml/predict -> 200 OK (Prediction: {res.json()['predicted_severity']})")
    
    # 5. What-If
    mod_input = sample_input.copy()
    mod_input["weather"] = "clear"
    mod_input["visibility"] = "high"
    res = client.post("/api/ml/what-if", json={"current_scenario": sample_input, "modified_scenario": mod_input})
    assert res.status_code == 200, f"What-If failed: {res.text}"
    print(f"  ✓ POST /api/ml/what-if -> 200 OK (Transition: {res.json()['transition']})")
    
    # 6. Explain
    res = client.post("/api/ml/explain", json=sample_input)
    assert res.status_code == 200, f"Explain failed: {res.text}"
    print("  ✓ POST /api/ml/explain -> 200 OK")
    
    # 7. Global SHAP
    res = client.get("/api/ml/global-shap")
    assert res.status_code == 200, f"Global SHAP failed: {res.text}"
    print("  ✓ GET /api/ml/global-shap -> 200 OK")
    
    # 8. Dataset 1 Analytics
    res = client.get("/api/analytics/overview")
    assert res.status_code == 200
    print("  ✓ GET /api/analytics/overview -> 200 OK")
    
    res = client.get("/api/analytics/cities")
    assert res.status_code == 200
    print("  ✓ GET /api/analytics/cities -> 200 OK")
    
    # 9. Map Accidents
    res = client.get("/api/map/accidents?limit=100")
    assert res.status_code == 200
    print(f"  ✓ GET /api/map/accidents -> 200 OK (Matched: {res.json()['total_matched']})")
    
    # 10. Dataset 2 Analytics
    res = client.get("/api/dataset2/analytics")
    assert res.status_code == 200
    print(f"  ✓ GET /api/dataset2/analytics -> 200 OK (Records: {res.json()['metadata']['total_records']})")
    
    print("\n🎉 ALL BACKEND API ENDPOINTS PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    test_all_endpoints()
