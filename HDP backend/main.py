from fastapi import FastAPI, Request
from pydantic import BaseModel
import pickle
import uvicorn

# Load model
with open('hdp_risk_model.pkl', 'rb') as f:
    model = pickle.load(f)

# Define app
app = FastAPI()

# Define input schema
class HDPInput(BaseModel):
    bp: int
    swelling: int
    headache: int
    vision: int
    urine_protein: int
    gestational_age: int

# Define prediction endpoint
@app.post("/predict")
def predict_hdp(data: HDPInput):
    input_data = [[
        data.bp,
        data.swelling,
        data.headache,
        data.vision,
        data.urine_protein,
        data.gestational_age
    ]]
    prediction = model.predict(input_data)[0]
    risk_prob = model.predict_proba(input_data)[0][1]
    
    return {
        "prediction": "High Risk" if risk_prob > 0.7 else "Low Risk",
        "risk_score": round(risk_prob, 3)
    }

# Only for local testing
# if __name__ == "__main__":
#     uvicorn.run(app, host="0.0.0.0", port=8000)
