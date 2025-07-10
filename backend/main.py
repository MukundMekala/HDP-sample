from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pickle
import numpy as np
import os
from typing import List
import joblib

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
model = None
try:
    # Try different possible locations for the model
    model_paths = [
        "model.pkl",
        "../model.pkl", 
        "hdp_risk_model.pkl",
        "../hdp_risk_model.pkl"
    ]
    
    for model_path in model_paths:
        if os.path.exists(model_path):
            try:
                model = joblib.load(model_path)
                print(f"✅ Model loaded successfully from {model_path}")
                break
            except:
                try:
                    with open(model_path, "rb") as f:
                        model = pickle.load(f)
                    print(f"✅ Model loaded successfully from {model_path}")
                    break
                except Exception as e:
                    print(f"❌ Failed to load model from {model_path}: {e}")
                    continue
    
    if model is None:
        print("⚠️ No model file found, will use fallback prediction")
        
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

def fallback_prediction(input_data: HDPInput) -> HDPResponse:
    """Fallback rule-based prediction when model is not available"""
    risk_score = 0.0
    factors = []
    
    # Blood pressure risk (most important factor)
    if input_data.bp > 160:
        risk_score += 0.5
        factors.append("Severe hypertension")
    elif input_data.bp > 140:
        risk_score += 0.3
        factors.append("High blood pressure")
    elif input_data.bp > 130:
        risk_score += 0.1
        factors.append("Elevated blood pressure")
    
    # Heart rate risk
    if input_data.heart_rate > 110:
        risk_score += 0.2
        factors.append("Significantly elevated heart rate")
    elif input_data.heart_rate > 100:
        risk_score += 0.15
        factors.append("Elevated heart rate")
    
    # Symptom-based risks
    if input_data.swelling == 1:
        risk_score += 0.2
        factors.append("Swelling present")
    
    if input_data.headache == 1:
        risk_score += 0.15
        factors.append("Headache symptoms")
    
    # Age-related risk
    if input_data.age > 40:
        risk_score += 0.15
        factors.append("Advanced maternal age")
    elif input_data.age > 35:
        risk_score += 0.1
        factors.append("Maternal age over 35")
    
    # Weight-related risk
    if input_data.weight > 90:
        risk_score += 0.1
        factors.append("High weight")
    
    # Interaction effects
    if input_data.bp > 140 and input_data.headache == 1:
        risk_score += 0.1
    
    if input_data.bp > 140 and input_data.swelling == 1:
        risk_score += 0.1
    
    # Normalize risk score
    risk_score = min(risk_score, 0.95)
    prediction = 1 if risk_score > 0.4 else 0
    
    message = "High risk of HDP detected" if prediction == 1 else "Low risk of HDP"
    
    return HDPResponse(
        input=input_data,
        risk_prediction=prediction,
        risk_probability=risk_score,
        message=message,
        factors=factors
    )

@app.get("/")
def read_root():
    return {
        "message": "HDP Risk Predictor API",
        "status": "running",
        "model_loaded": model is not None,
        "version": "1.0.0"
    }

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "model_status": "loaded" if model else "fallback_mode"
    }

@app.post("/predict", response_model=HDPResponse)
def predict_hdp_risk(input_data: HDPInput):
    try:
        if model is not None:
            # Use the trained model
            features = np.array([[
                input_data.bp,
                input_data.swelling,
                input_data.headache,
                input_data.age,
                input_data.weight,
                input_data.heart_rate
            ]])
            
            prediction = model.predict(features)[0]
            
            # Try to get probability
            try:
                probabilities = model.predict_proba(features)[0]
                probability = probabilities[1] if len(probabilities) > 1 else (0.8 if prediction == 1 else 0.2)
            except:
                probability = 0.8 if prediction == 1 else 0.2
            
            # Determine risk factors based on input
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
        else:
            # Use fallback prediction
            return fallback_prediction(input_data)

    except Exception as e:
        print(f"Prediction error: {e}")
        # Return fallback prediction on any error
        return fallback_prediction(input_data)

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    print(f"Starting server on port {port}")
    uvicorn.run(app, host="0.0.0.0", port=port)