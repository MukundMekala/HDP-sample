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
        "hdp_risk_model.pkl",
        "../hdp_risk_model.pkl",
        "model.pkl",
        "../model.pkl"
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
        print("⚠️ No model file found, will use enhanced fallback prediction")
        
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

def enhanced_prediction(input_data: HDPInput) -> HDPResponse:
    """Enhanced clinical rule-based prediction when model is not available"""
    risk_score = 0.0
    factors = []
    
    # Blood pressure risk (most critical factor for HDP)
    if input_data.bp >= 160:
        risk_score += 0.6
        factors.append("Severe hypertension (≥160 mmHg)")
    elif input_data.bp >= 140:
        risk_score += 0.4
        factors.append("Stage 2 hypertension (140-159 mmHg)")
    elif input_data.bp >= 130:
        risk_score += 0.25
        factors.append("Stage 1 hypertension (130-139 mmHg)")
    elif input_data.bp >= 120:
        risk_score += 0.1
        factors.append("Elevated blood pressure (120-129 mmHg)")
    
    # Heart rate analysis (tachycardia can indicate stress/complications)
    if input_data.heart_rate >= 120:
        risk_score += 0.3
        factors.append("Severe tachycardia (≥120 bpm)")
    elif input_data.heart_rate >= 100:
        risk_score += 0.2
        factors.append("Tachycardia (100-119 bpm)")
    elif input_data.heart_rate >= 90:
        risk_score += 0.1
        factors.append("Elevated heart rate (90-99 bpm)")
    
    # Symptom-based risks (key HDP indicators)
    if input_data.swelling == 1:
        risk_score += 0.25
        factors.append("Edema/swelling present")
    
    if input_data.headache == 1:
        risk_score += 0.2
        factors.append("Headache symptoms")
    
    # Age-related risk factors
    if input_data.age >= 40:
        risk_score += 0.2
        factors.append("Advanced maternal age (≥40 years)")
    elif input_data.age >= 35:
        risk_score += 0.15
        factors.append("Maternal age 35-39 years")
    elif input_data.age < 20:
        risk_score += 0.1
        factors.append("Young maternal age (<20 years)")
    
    # Weight-related risk (obesity is a major HDP risk factor)
    if input_data.weight >= 100:
        risk_score += 0.2
        factors.append("Severe obesity (≥100 kg)")
    elif input_data.weight >= 85:
        risk_score += 0.15
        factors.append("Obesity (85-99 kg)")
    elif input_data.weight >= 75:
        risk_score += 0.1
        factors.append("Overweight (75-84 kg)")
    
    # Critical combination factors (multiplicative risk)
    if input_data.bp >= 140 and input_data.headache == 1:
        risk_score += 0.15
        factors.append("Hypertension with headache (high concern)")
    
    if input_data.bp >= 140 and input_data.swelling == 1:
        risk_score += 0.15
        factors.append("Hypertension with edema (preeclampsia risk)")
    
    if input_data.bp >= 160 and input_data.heart_rate >= 100:
        risk_score += 0.2
        factors.append("Severe hypertension with tachycardia")
    
    if input_data.headache == 1 and input_data.swelling == 1:
        risk_score += 0.1
        factors.append("Multiple symptoms present")
    
    # Age and BP interaction
    if input_data.age >= 35 and input_data.bp >= 140:
        risk_score += 0.1
        factors.append("Advanced age with hypertension")
    
    # Normalize and categorize risk
    risk_score = min(risk_score, 0.95)  # Cap at 95%
    
    # More realistic risk categorization
    if risk_score >= 0.7:
        prediction = 1
        risk_level = "HIGH"
    elif risk_score >= 0.4:
        prediction = 1
        risk_level = "MODERATE-HIGH"
    elif risk_score >= 0.25:
        prediction = 0
        risk_level = "MODERATE"
    else:
        prediction = 0
        risk_level = "LOW"
    
    message = f"{risk_level} risk of HDP detected"
    
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
        "model_status": "loaded" if model else "enhanced_fallback_mode"
    }

@app.post("/predict", response_model=HDPResponse)
def predict_hdp_risk(input_data: HDPInput):
    try:
        if model is not None:
            # Use the trained model
            # Expected features: [bp, swelling, headache, age, weight, heart_rate]
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
                if len(probabilities) > 1:
                    probability = probabilities[1]  # Probability of positive class
                else:
                    probability = 0.8 if prediction == 1 else 0.2
            except:
                # If predict_proba not available, use decision function or default
                try:
                    decision_score = model.decision_function(features)[0]
                    # Convert decision score to probability (sigmoid-like)
                    probability = 1 / (1 + np.exp(-decision_score))
                except:
                    probability = 0.8 if prediction == 1 else 0.2
            
            # Determine risk factors based on input (clinical interpretation)
            factors = []
            if input_data.bp >= 140:
                factors.append("Hypertension detected")
            if input_data.bp >= 160:
                factors.append("Severe hypertension")
            if input_data.swelling == 1:
                factors.append("Edema present")
            if input_data.headache == 1:
                factors.append("Headache symptoms")
            if input_data.heart_rate >= 100:
                factors.append("Elevated heart rate")
            if input_data.age >= 35:
                factors.append("Advanced maternal age")
            if input_data.weight >= 85:
                factors.append("Weight-related risk")
            
            message = "High risk of HDP detected" if prediction == 1 else "Low risk of HDP"
            
            return HDPResponse(
                input=input_data,
                risk_prediction=int(prediction),
                risk_probability=float(probability),
                message=message,
                factors=factors
            )
        else:
            # Use enhanced fallback prediction
            return enhanced_prediction(input_data)

    except Exception as e:
        print(f"Prediction error: {e}")
        # Return enhanced fallback prediction on any error
        return enhanced_prediction(input_data)

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    print(f"Starting server on port {port}")
    uvicorn.run(app, host="0.0.0.0", port=port)