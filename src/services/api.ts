import { VitalsInput, RiskPrediction } from '../types'

// Mock ML model for demo purposes
const mockMLModel = {
  predict: (input: HDPPredictionInput): HDPPredictionResponse => {
    // Simple rule-based prediction for demo
    let riskScore = 0
    
    if (input.bp > 140) riskScore += 0.4
    if (input.heart_rate > 100) riskScore += 0.2
    if (input.swelling === 1) riskScore += 0.2
    if (input.headache === 1) riskScore += 0.2
    if (input.weight > 80) riskScore += 0.1
    if (input.age > 35) riskScore += 0.1
    
    const prediction = riskScore > 0.5 ? 1 : 0
    
    return {
      input,
      risk_prediction: prediction,
      message: prediction === 1 ? "High risk of HDP" : "Low risk of HDP"
    }
  }
}

export interface HDPPredictionInput {
  bp: number
  swelling: number
  headache: number
  age: number
  weight: number
  heart_rate: number
}

export interface HDPPredictionResponse {
  input: HDPPredictionInput
  risk_prediction: number
  message: string
}

export async function predictHDPRisk(vitals: VitalsInput): Promise<RiskPrediction> {
  // Convert vitals to the format expected by the ML model
  const input: HDPPredictionInput = {
    bp: vitals.systolic_bp,
    swelling: vitals.symptoms.includes('swelling') ? 1 : 0,
    headache: vitals.symptoms.includes('headache') ? 1 : 0,
    age: 28, // Default age - in a real app, this would come from user profile
    weight: vitals.weight,
    heart_rate: vitals.heart_rate,
  }

  // Use mock ML model for demo
  const data = mockMLModel.predict(input)

  // Convert the response to our RiskPrediction format
  const riskLevel = data.risk_prediction === 1 ? 'high' : 'low'
  const riskScore = data.risk_prediction === 1 ? 0.8 : 0.2

  return {
    id: crypto.randomUUID(),
    patient_id: vitals.patient_id,
    vitals_id: vitals.id || crypto.randomUUID(),
    risk_level: riskLevel,
    risk_score: riskScore,
    factors: determineRiskFactors(input, data.risk_prediction),
    created_at: new Date().toISOString(),
  }
}

function determineRiskFactors(input: HDPPredictionInput, prediction: number): string[] {
  const factors: string[] = []
  
  if (input.bp > 140) factors.push('High blood pressure')
  if (input.swelling === 1) factors.push('Swelling present')
  if (input.headache === 1) factors.push('Headache symptoms')
  if (input.heart_rate > 100) factors.push('Elevated heart rate')
  if (input.weight > 80) factors.push('Weight concerns')
  
  if (factors.length === 0 && prediction === 1) {
    factors.push('Multiple risk indicators detected')
  }
  
  return factors
}