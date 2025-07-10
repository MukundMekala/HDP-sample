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
  risk_probability: number
  message: string
  factors: string[]
}

// Enhanced mock ML model that simulates your trained model
const mockMLModel = {
  predict: (input: HDPPredictionInput): HDPPredictionResponse => {
    // More sophisticated rule-based prediction that mimics ML behavior
    let riskScore = 0
    const factors: string[] = []
    
    // Blood pressure risk (most important factor)
    if (input.bp > 160) {
      riskScore += 0.5
      factors.push("Severe hypertension")
    } else if (input.bp > 140) {
      riskScore += 0.3
      factors.push("High blood pressure")
    } else if (input.bp > 130) {
      riskScore += 0.1
      factors.push("Elevated blood pressure")
    }
    
    // Heart rate risk
    if (input.heart_rate > 110) {
      riskScore += 0.2
      factors.push("Significantly elevated heart rate")
    } else if (input.heart_rate > 100) {
      riskScore += 0.15
      factors.push("Elevated heart rate")
    }
    
    // Symptom-based risks
    if (input.swelling === 1) {
      riskScore += 0.2
      factors.push("Swelling present")
    }
    
    if (input.headache === 1) {
      riskScore += 0.15
      factors.push("Headache symptoms")
    }
    
    // Age-related risk
    if (input.age > 40) {
      riskScore += 0.15
      factors.push("Advanced maternal age")
    } else if (input.age > 35) {
      riskScore += 0.1
      factors.push("Maternal age over 35")
    }
    
    // Weight-related risk
    if (input.weight > 90) {
      riskScore += 0.1
      factors.push("High weight")
    }
    
    // Interaction effects (combinations that increase risk)
    if (input.bp > 140 && input.headache === 1) {
      riskScore += 0.1 // Additional risk for BP + headache
    }
    
    if (input.bp > 140 && input.swelling === 1) {
      riskScore += 0.1 // Additional risk for BP + swelling
    }
    
    // Normalize risk score
    riskScore = Math.min(riskScore, 0.95)
    
    const prediction = riskScore > 0.4 ? 1 : 0
    
    return {
      input,
      risk_prediction: prediction,
      risk_probability: riskScore,
      message: prediction === 1 ? "High risk of HDP detected" : "Low risk of HDP",
      factors
    }
  }
}

export async function predictHDPRisk(vitals: VitalsInput): Promise<RiskPrediction> {
  try {
    // Convert vitals to the format expected by the ML model
    const input: HDPPredictionInput = {
      bp: vitals.systolic_bp,
      swelling: vitals.symptoms.includes('swelling') ? 1 : 0,
      headache: vitals.symptoms.includes('headache') ? 1 : 0,
      age: 28, // Default age - in a real app, this would come from user profile
      weight: vitals.weight,
      heart_rate: vitals.heart_rate,
    }

    // Try to call the actual API first
    try {
      const response = await fetch(`${API_BASE_URL}/predict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(input),
      })

      if (response.ok) {
        const data: HDPPredictionResponse = await response.json()
        
        // Convert the response to our RiskPrediction format
        const riskLevel = data.risk_prediction === 1 ? 'high' : 
                         data.risk_probability > 0.3 ? 'moderate' : 'low'

        return {
          id: crypto.randomUUID(),
          patient_id: vitals.patient_id,
          vitals_id: vitals.id || crypto.randomUUID(),
          risk_level: riskLevel,
          risk_score: data.risk_probability,
          factors: data.factors,
          created_at: new Date().toISOString(),
        }
      }
    } catch (apiError) {
      console.log('API not available, using mock model')
    }

    // Fallback to mock model
    const data = mockMLModel.predict(input)
    
    const riskLevel = data.risk_prediction === 1 ? 'high' : 
                     data.risk_probability > 0.3 ? 'moderate' : 'low'

    return {
      id: crypto.randomUUID(),
      patient_id: vitals.patient_id,
      vitals_id: vitals.id || crypto.randomUUID(),
      risk_level: riskLevel,
      risk_score: data.risk_probability,
      factors: data.factors,
      created_at: new Date().toISOString(),
    }
  } catch (error) {
    console.error('Error predicting HDP risk:', error)
    
    // Ultimate fallback
    return {
      id: crypto.randomUUID(),
      patient_id: vitals.patient_id,
      vitals_id: vitals.id || crypto.randomUUID(),
      risk_level: 'low',
      risk_score: 0.2,
      factors: ['Prediction service unavailable'],
      created_at: new Date().toISOString(),
    }
  }
}