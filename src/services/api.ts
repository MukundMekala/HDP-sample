import { VitalsInput, RiskPrediction } from '../types'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

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
  try {
    // Convert vitals to the format expected by the FastAPI backend
    const input: HDPPredictionInput = {
      bp: vitals.systolic_bp,
      swelling: vitals.symptoms.includes('swelling') ? 1 : 0,
      headache: vitals.symptoms.includes('headache') ? 1 : 0,
      age: 28, // Default age - in a real app, this would come from user profile
      weight: vitals.weight,
      heart_rate: vitals.heart_rate,
    }

    const response = await fetch(`${API_BASE_URL}/predict`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data: HDPPredictionResponse = await response.json()

    // Convert the response to our RiskPrediction format
    const riskLevel = data.risk_prediction === 1 ? 'high' : 'low'
    const riskScore = data.risk_prediction

    return {
      id: crypto.randomUUID(),
      patient_id: vitals.patient_id,
      vitals_id: vitals.id || crypto.randomUUID(),
      risk_level: riskLevel,
      risk_score: riskScore,
      factors: determineRiskFactors(input, data.risk_prediction),
      created_at: new Date().toISOString(),
    }
  } catch (error) {
    console.error('Error predicting HDP risk:', error)
    
    // Fallback to mock prediction if API is unavailable
    return {
      id: crypto.randomUUID(),
      patient_id: vitals.patient_id,
      vitals_id: vitals.id || crypto.randomUUID(),
      risk_level: 'low',
      risk_score: 0.3,
      factors: ['API unavailable - using fallback'],
      created_at: new Date().toISOString(),
    }
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