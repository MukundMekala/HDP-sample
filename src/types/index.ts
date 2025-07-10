export type UserRole = 'patient' | 'doctor'

export interface UserProfile {
  id: string
  email: string
  role: UserRole
  full_name: string
  created_at: string
  updated_at: string
  // Patient-specific fields
  last_period_date?: string
  due_date?: string
  assigned_doctor_id?: string
  // Doctor-specific fields
  license_number?: string
  specialization?: string
}

export interface VitalsInput {
  id?: string
  patient_id: string
  date: string
  systolic_bp: number
  diastolic_bp: number
  heart_rate: number
  weight: number
  symptoms: string[]
  medication_taken: boolean
  notes?: string
  created_at?: string
}

export interface RiskPrediction {
  id: string
  patient_id: string
  vitals_id: string
  risk_level: 'low' | 'moderate' | 'high'
  risk_score: number
  factors: string[]
  created_at: string
}

export interface DoctorNote {
  id: string
  doctor_id: string
  patient_id: string
  note: string
  created_at: string
}

export interface PatientAssignment {
  id: string
  doctor_id: string
  patient_id: string
  assigned_at: string
}

export interface ChartDataPoint {
  date: string
  value: number
}

export interface TrendData {
  systolic: ChartDataPoint[]
  diastolic: ChartDataPoint[]
  heart_rate: ChartDataPoint[]
  weight: ChartDataPoint[]
}