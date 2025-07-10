from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pickle
import numpy as np
import os
from typing import List

# Initialize FastAPI app
app = FastAPI(
    title="HDP Risk Predictor API",
    description="AI-powered Hypertensive Disorder Prediction for Pregnant Women",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load the trained model
try:
    model_path = os.path.join(os.path.dirname(__file__), "..", "model.pkl")
    if not os.path.exists(model_path):
        model_path = "model.pkl"
    
    with open(model_path, "rb") as f:
        model = pickle.load(f)
    print("✅ Model loaded successfully")
except Exception as e:
    print(f"❌ Error loading model: {e}")
    model = None

# Define input schema
class HDPInput(BaseModel):
    bp: int
    swelling: int
    headache: int
    age: int
    weight: float
    heart_rate: int

class HDPResponse(BaseModel):
    input: HDPInput
    risk_prediction: int
    risk_probability: float
    message: str
    factors: List[str]

@app.get("/")
def read_root():
    return {
        "message": "HDP Risk Predictor API",
        "status": "running",
        "model_loaded": model is not None
    }

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "model_status": "loaded" if model else "not_loaded"
    }

@app.post("/predict", response_model=HDPResponse)
def predict_hdp_risk(input_data: HDPInput):
    try:
        # Convert input to numpy array for prediction
        features = np.array([[
            input_data.bp,
            input_data.swelling,
            input_data.headache,
            input_data.age,
            input_data.weight,
            input_data.heart_rate
        ]])

        if model is not None:
            # Use the trained model
            prediction = model.predict(features)[0]
            try:
                probability = model.predict_proba(features)[0][1]
            except:
                # If predict_proba is not available, use a simple mapping
                probability = 0.8 if prediction == 1 else 0.2
        else:
            # Fallback rule-based prediction
            risk_score = 0
            if input_data.bp > 140: risk_score += 0.4
            if input_data.heart_rate > 100: risk_score += 0.2
            if input_data.swelling == 1: risk_score += 0.2
            if input_data.headache == 1: risk_score += 0.2
            if input_data.weight > 80: risk_score += 0.1
            if input_data.age > 35: risk_score += 0.1
            
            prediction = 1 if risk_score > 0.5 else 0
            probability = min(risk_score, 0.95)

        # Determine risk factors
        factors = []
        if input_data.bp > 140:
            factors.append("High blood pressure")
        if input_data.swelling == 1:
            factors.append("Swelling present")
        if input_data.headache == 1:
            factors.append("Headache symptoms")
        if input_data.heart_rate > 100:
            factors.append("Elevated heart rate")
        if input_data.weight > 80:
            factors.append("Weight concerns")
        if input_data.age > 35:
            factors.append("Advanced maternal age")

        message = "High risk of HDP detected" if prediction == 1 else "Low risk of HDP"

        return HDPResponse(
            input=input_data,
            risk_prediction=int(prediction),
            risk_probability=float(probability),
            message=message,
            factors=factors
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)