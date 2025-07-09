from fastapi import FastAPI
from pydantic import BaseModel
import pickle
import numpy as np
import os

# Initialize FastAPI app
app = FastAPI(
    title="HDP Risk Predictor",
    description="Predict Hypertensive Disorder Risk in Pregnant Women using 6 health parameters.",
    version="1.0.0"
)

# Load the trained model
model_path = os.path.join(os.path.dirname(__file__), "model.pkl")
with open(model_path, "rb") as f:
    model = pickle.load(f)

# Define input schema using Pydantic
class HDPInput(BaseModel):
    bp: int
    swelling: int
    headache: int
    age: int
    weight: int
    heart_rate: int

# Define prediction endpoint
@app.post("/predict")
def predict(input: HDPInput):
    try:
        # Convert input to NumPy array
        input_data = np.array([[
            input.bp,
            input.swelling,
            input.headache,
            input.age,
            input.weight,
            input.heart_rate
        ]])

        # Make prediction
        prediction = model.predict(input_data)[0]

        # Return result
        return {
            "input": input.dict(),
            "risk_prediction": int(prediction),
            "message": "High risk of HDP" if prediction == 1 else "Low risk of HDP"
        }

    except Exception as e:
        return {"error": str(e)}

