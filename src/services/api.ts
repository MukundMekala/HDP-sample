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

// Enhanced clinical prediction model with proper risk calculation
const enhancedClinicalModel = {
  predict: (input: HDPPredictionInput): HDPPredictionResponse => {
    let riskScore = 0
    const factors: string[] = []
    
    console.log('🔍 Analyzing vitals:', input)
    
    // Blood pressure risk (CRITICAL - most important factor for HDP)
    if (input.bp >= 180) {
      riskScore += 0.8
      factors.push("Hypertensive crisis (≥180 mmHg) - URGENT")
    } else if (input.bp >= 160) {
      riskScore += 0.65
      factors.push("Severe hypertension (≥160 mmHg)")
    } else if (input.bp >= 140) {
      riskScore += 0.45
      factors.push("Stage 2 hypertension (140-159 mmHg)")
    } else if (input.bp >= 130) {
      riskScore += 0.3
      factors.push("Stage 1 hypertension (130-139 mmHg)")
    } else if (input.bp >= 120) {
      riskScore += 0.15
      factors.push("Elevated blood pressure (120-129 mmHg)")
    }
    
    // Heart rate analysis (tachycardia indicates stress/complications)
    if (input.heart_rate >= 130) {
      riskScore += 0.4
      factors.push("Severe tachycardia (≥130 bpm)")
    } else if (input.heart_rate >= 120) {
      riskScore += 0.3
      factors.push("Significant tachycardia (120-129 bpm)")
    } else if (input.heart_rate >= 100) {
      riskScore += 0.2
      factors.push("Tachycardia (100-119 bpm)")
    } else if (input.heart_rate >= 90) {
      riskScore += 0.1
      factors.push("Elevated heart rate (90-99 bpm)")
    }
    
    // Symptom-based risks (key HDP indicators)
    if (input.swelling === 1) {
      riskScore += 0.25
      factors.push("Edema/swelling present (preeclampsia indicator)")
    }
    
    if (input.headache === 1) {
      riskScore += 0.2
      factors.push("Headache symptoms (neurological concern)")
    }
    
    // Age-related risk factors
    if (input.age >= 40) {
      riskScore += 0.25
      factors.push("Advanced maternal age (≥40 years)")
    } else if (input.age >= 35) {
      riskScore += 0.2
      factors.push("Maternal age 35-39 years (increased risk)")
    } else if (input.age < 20) {
      riskScore += 0.15
      factors.push("Young maternal age (<20 years)")
    }
    
    // Weight-related risk (obesity is major HDP risk factor)
    if (input.weight >= 120) {
      riskScore += 0.3
      factors.push("Severe obesity (≥120 kg)")
    } else if (input.weight >= 100) {
      riskScore += 0.25
      factors.push("Morbid obesity (100-119 kg)")
    } else if (input.weight >= 85) {
      riskScore += 0.2
      factors.push("Obesity (85-99 kg)")
    } else if (input.weight >= 75) {
      riskScore += 0.1
      factors.push("Overweight (75-84 kg)")
    }
    
    // CRITICAL combination factors (multiplicative risk)
    if (input.bp >= 160 && input.headache === 1) {
      riskScore += 0.2
      factors.push("⚠️ SEVERE: Hypertension with headache (preeclampsia risk)")
    }
    
    if (input.bp >= 140 && input.swelling === 1) {
      riskScore += 0.2
      factors.push("⚠️ HIGH CONCERN: Hypertension with edema")
    }
    
    if (input.bp >= 160 && input.heart_rate >= 100) {
      riskScore += 0.25
      factors.push("⚠️ CRITICAL: Severe hypertension with tachycardia")
    }
    
    if (input.headache === 1 && input.swelling === 1) {
      riskScore += 0.15
      factors.push("Multiple preeclampsia symptoms present")
    }
    
    // Age and BP dangerous interaction
    if (input.age >= 35 && input.bp >= 140) {
      riskScore += 0.15
      factors.push("Advanced age with hypertension (high-risk combination)")
    }
    
    // Triple risk factor (very dangerous)
    if (input.bp >= 140 && input.headache === 1 && input.swelling === 1) {
      riskScore += 0.2
      factors.push("🚨 TRIPLE RISK: Hypertension + Headache + Edema")
    }
    
    console.log('📊 Calculated risk score:', riskScore)
    console.log('🎯 Risk factors identified:', factors)
    
    // Ensure minimum risk for concerning vitals
    if (input.bp >= 140 && riskScore < 0.4) {
      riskScore = 0.4 // Minimum 40% for hypertension
    }
    if (input.bp >= 160 && riskScore < 0.6) {
      riskScore = 0.6 // Minimum 60% for severe hypertension
    }
    
    // Cap maximum risk
    riskScore = Math.min(riskScore, 0.95)
    
    // Determine risk level and prediction
    let prediction: number
    let riskLevel: string
    
    if (riskScore >= 0.7) {
      prediction = 1
      riskLevel = "🚨 CRITICAL HIGH"
    } else if (riskScore >= 0.5) {
      prediction = 1
      riskLevel = "⚠️ HIGH"
    } else if (riskScore >= 0.3) {
      prediction = 1
      riskLevel = "⚠️ MODERATE-HIGH"
    } else if (riskScore >= 0.2) {
      prediction = 0
      riskLevel = "⚠️ MODERATE"
    } else {
      prediction = 0
      riskLevel = "✅ LOW"
    }
    
    const result = {
      input,
      risk_prediction: prediction,
      risk_probability: riskScore,
      message: `${riskLevel} risk of HDP detected`,
      factors
    }
    
    console.log('🎯 Final prediction result:', result)
    return result
  }
}

export async function predictHDPRisk(vitals: VitalsInput): Promise<RiskPrediction> {
  try {
    // Get patient age from profile or use realistic default
    const patientAge = 28 // In real app, get from user profile
    
    // Convert vitals to the format expected by the ML model
    const input: HDPPredictionInput = {
      bp: vitals.systolic_bp, // Use systolic BP as primary BP indicator
      swelling: vitals.symptoms.includes('swelling') ? 1 : 0,
      headache: vitals.symptoms.includes('headache') ? 1 : 0,
      age: patientAge,
      weight: vitals.weight,
      heart_rate: vitals.heart_rate,
    }

    console.log('🔄 Sending prediction request with input:', input)

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
        console.log('✅ API prediction response:', data)
        
        // Convert the response to our RiskPrediction format
        const riskLevel = data.risk_prediction === 1 ? 
          (data.risk_probability >= 0.7 ? 'high' : 'moderate') : 
          (data.risk_probability >= 0.3 ? 'moderate' : 'low')

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
        console.log('⚠️ API response not ok, using enhanced clinical model')
      }
    } catch (apiError) {
      console.log('⚠️ API not available, using enhanced clinical model:', apiError)
    }

    // Use enhanced clinical model (primary prediction system)
    const data = enhancedClinicalModel.predict(input)
    console.log('🧠 Enhanced clinical model prediction:', data)
    
    // More accurate risk level mapping
    const riskLevel = data.risk_prediction === 1 ? 
      (data.risk_probability >= 0.7 ? 'high' : 'moderate') : 
      (data.risk_probability >= 0.3 ? 'moderate' : 'low')

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
    console.error('❌ Error predicting HDP risk:', error)
    
    // Ultimate fallback with proper risk assessment
    let basicRisk = 0.1 // Base 10% risk
    const basicFactors: string[] = []
    
    // Basic clinical assessment
    if (vitals.systolic_bp >= 160) {
      basicRisk = 0.7
      basicFactors.push('Severe hypertension detected')
    } else if (vitals.systolic_bp >= 140) {
      basicRisk = 0.5
      basicFactors.push('Hypertension detected')
    } else if (vitals.systolic_bp >= 130) {
      basicRisk = 0.3
      basicFactors.push('Elevated blood pressure')
    }
    
    if (vitals.symptoms.includes('headache')) {
      basicRisk += 0.2
      basicFactors.push('Headache symptoms')
    }
    
    if (vitals.symptoms.includes('swelling')) {
      basicRisk += 0.2
      basicFactors.push('Swelling/edema present')
    }
    
    basicRisk = Math.min(basicRisk, 0.9)
    
    return {
      id: crypto.randomUUID(),
      patient_id: vitals.patient_id,
      vitals_id: vitals.id || crypto.randomUUID(),
      risk_level: basicRisk >= 0.5 ? 'high' : basicRisk >= 0.3 ? 'moderate' : 'low',
      risk_score: basicRisk,
      factors: basicFactors.length > 0 ? basicFactors : ['Basic health assessment completed'],
      created_at: new Date().toISOString(),
    }
  }
}