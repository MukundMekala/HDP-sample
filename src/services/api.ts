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

// Enhanced clinical prediction model
const enhancedClinicalModel = {
  predict: (input: HDPPredictionInput): HDPPredictionResponse => {
    let riskScore = 0
    const factors: string[] = []
    
    // Blood pressure risk (most critical factor for HDP)
    if (input.bp >= 160) {
      riskScore += 0.6
      factors.push("Severe hypertension (≥160 mmHg)")
    } else if (input.bp >= 140) {
      riskScore += 0.4
      factors.push("Stage 2 hypertension (140-159 mmHg)")
    } else if (input.bp >= 130) {
      riskScore += 0.25
      factors.push("Stage 1 hypertension (130-139 mmHg)")
    } else if (input.bp >= 120) {
      riskScore += 0.1
      factors.push("Elevated blood pressure (120-129 mmHg)")
    }
    
    // Heart rate analysis
    if (input.heart_rate >= 120) {
      riskScore += 0.3
      factors.push("Severe tachycardia (≥120 bpm)")
    } else if (input.heart_rate >= 100) {
      riskScore += 0.2
      factors.push("Tachycardia (100-119 bpm)")
    } else if (input.heart_rate >= 90) {
      riskScore += 0.1
      factors.push("Elevated heart rate (90-99 bpm)")
    }
    
    // Symptom-based risks
    if (input.swelling === 1) {
      riskScore += 0.25
      factors.push("Edema/swelling present")
    }
    
    if (input.headache === 1) {
      riskScore += 0.2
      factors.push("Headache symptoms")
    }
    
    // Age-related risk factors
    if (input.age >= 40) {
      riskScore += 0.2
      factors.push("Advanced maternal age (≥40 years)")
    } else if (input.age >= 35) {
      riskScore += 0.15
      factors.push("Maternal age 35-39 years")
    } else if (input.age < 20) {
      riskScore += 0.1
      factors.push("Young maternal age (<20 years)")
    }
    
    // Weight-related risk
    if (input.weight >= 100) {
      riskScore += 0.2
      factors.push("Severe obesity (≥100 kg)")
    } else if (input.weight >= 85) {
      riskScore += 0.15
      factors.push("Obesity (85-99 kg)")
    } else if (input.weight >= 75) {
      riskScore += 0.1
      factors.push("Overweight (75-84 kg)")
    }
    
    // Critical combination factors
    if (input.bp >= 140 && input.headache === 1) {
      riskScore += 0.15
      factors.push("Hypertension with headache (high concern)")
    }
    
    if (input.bp >= 140 && input.swelling === 1) {
      riskScore += 0.15
      factors.push("Hypertension with edema (preeclampsia risk)")
    }
    
    if (input.bp >= 160 && input.heart_rate >= 100) {
      riskScore += 0.2
      factors.push("Severe hypertension with tachycardia")
    }
    
    if (input.headache === 1 && input.swelling === 1) {
      riskScore += 0.1
      factors.push("Multiple symptoms present")
    }
    
    // Age and BP interaction
    if (input.age >= 35 && input.bp >= 140) {
      riskScore += 0.1
      factors.push("Advanced age with hypertension")
    }
    
    // Normalize risk score
    riskScore = Math.min(riskScore, 0.95)
    
    // More realistic risk categorization
    let prediction: number
    let riskLevel: string
    
    if (riskScore >= 0.7) {
      prediction = 1
      riskLevel = "HIGH"
    } else if (riskScore >= 0.4) {
      prediction = 1
      riskLevel = "MODERATE-HIGH"
    } else if (riskScore >= 0.25) {
      prediction = 0
      riskLevel = "MODERATE"
    } else {
      prediction = 0
      riskLevel = "LOW"
    }
    
    return {
      input,
      risk_prediction: prediction,
      risk_probability: riskScore,
      message: `${riskLevel} risk of HDP detected`,
      factors
    }
  }
}

export async function predictHDPRisk(vitals: VitalsInput): Promise<RiskPrediction> {
  try {
    // Get patient age from profile or use default
    const patientAge = 28 // In real app, get from user profile
    
    // Convert vitals to the format expected by the ML model
    const input: HDPPredictionInput = {
      bp: vitals.systolic_bp,
      swelling: vitals.symptoms.includes('swelling') ? 1 : 0,
      headache: vitals.symptoms.includes('headache') ? 1 : 0,
      age: patientAge,
      weight: vitals.weight,
      heart_rate: vitals.heart_rate,
    }

    console.log('Sending prediction request with input:', input)

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
        console.log('API prediction response:', data)
        
        // Convert the response to our RiskPrediction format
        const riskLevel = data.risk_prediction === 1 ? 'high' : 
                         data.risk_probability >= 0.4 ? 'moderate' : 'low'

        return {
          id: crypto.randomUUID(),
          patient_id: vitals.patient_id,
          vitals_id: vitals.id || crypto.randomUUID(),
          risk_level: riskLevel,
          risk_score: data.risk_probability,
          factors: data.factors,
          created_at: new Date().toISOString(),
        }
      } else {
        console.log('API response not ok, using fallback model')
      }
    } catch (apiError) {
      console.log('API not available, using enhanced clinical model:', apiError)
    }

    // Fallback to enhanced clinical model
    const data = enhancedClinicalModel.predict(input)
    console.log('Enhanced clinical model prediction:', data)
    
    const riskLevel = data.risk_prediction === 1 ? 'high' : 
                     data.risk_probability >= 0.4 ? 'moderate' : 'low'

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
    
    // Ultimate fallback with basic risk assessment
    const basicRisk = vitals.systolic_bp >= 140 ? 0.6 : 0.2
    
    return {
      id: crypto.randomUUID(),
      patient_id: vitals.patient_id,
      vitals_id: vitals.id || crypto.randomUUID(),
      risk_level: basicRisk >= 0.4 ? 'high' : 'low',
      risk_score: basicRisk,
      factors: vitals.systolic_bp >= 140 ? ['High blood pressure detected'] : ['Normal assessment'],
      created_at: new Date().toISOString(),
    }
  }
}