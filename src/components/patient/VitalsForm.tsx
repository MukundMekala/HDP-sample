import { useState } from 'react'
import { VitalsInput, RiskPrediction } from '../../types'
import { useAuth } from '../../contexts/AuthContext'
import { predictHDPRisk } from '../../services/api'
import { LoadingSpinner } from '../ui/LoadingSpinner'
import { Heart, Activity, Weight, AlertCircle } from 'lucide-react'
import { mockVitalsStorage, mockRiskStorage } from './PatientDashboard'

interface VitalsFormProps {
  onSubmit: (vitals: VitalsInput, riskPrediction: RiskPrediction) => void
}

const SYMPTOM_OPTIONS = [
  'headache',
  'blurred_vision',
  'swelling',
  'nausea',
  'dizziness',
  'chest_pain',
  'shortness_of_breath',
]

export function VitalsForm({ onSubmit }: VitalsFormProps) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    systolic_bp: '',
    diastolic_bp: '',
    heart_rate: '',
    weight: '',
    symptoms: [] as string[],
    medication_taken: false,
    notes: '',
  })

  const handleSymptomChange = (symptom: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      symptoms: checked
        ? [...prev.symptoms, symptom]
        : prev.symptoms.filter(s => s !== symptom)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    console.log('📝 Form data being submitted:', formData)

    setLoading(true)
    try {
      const vitalsData: VitalsInput = {
        id: `vitals-${Date.now()}`,
        patient_id: user.id,
        date: new Date().toISOString().split('T')[0],
        systolic_bp: parseInt(formData.systolic_bp),
        diastolic_bp: parseInt(formData.diastolic_bp),
        heart_rate: parseInt(formData.heart_rate),
        weight: parseFloat(formData.weight),
        symptoms: formData.symptoms,
        medication_taken: formData.medication_taken,
        notes: formData.notes,
        created_at: new Date().toISOString(),
      }

      console.log('📊 Submitting vitals for AI analysis:', vitalsData)

      // Save vitals to mock storage
      mockVitalsStorage.push(vitalsData)

      // Get AI risk prediction
      console.log('🤖 Getting AI risk prediction...')
      const riskPrediction = await predictHDPRisk(vitalsData)
      console.log('🎯 Risk prediction result:', riskPrediction)

      // Save risk prediction to mock storage
      mockRiskStorage.push(riskPrediction)

      // Pass both vitals and risk prediction to parent
      onSubmit(vitalsData, riskPrediction)

      // Reset form
      setFormData({
        systolic_bp: '',
        diastolic_bp: '',
        heart_rate: '',
        weight: '',
        symptoms: [],
        medication_taken: false,
        notes: '',
      })
    } catch (error) {
      console.error('Error submitting vitals:', error)
      alert('Error submitting vitals. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-primary-100 rounded-lg">
          <Activity className="w-6 h-6 text-primary-600" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900">Daily Vitals</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Heart className="w-4 h-4 inline mr-1" />
              Systolic BP (mmHg)
            </label>
            <input
              type="number"
              value={formData.systolic_bp}
              onChange={(e) => setFormData(prev => ({ ...prev, systolic_bp: e.target.value }))}
              className="input-field"
              placeholder="120"
              min="80"
              max="200"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Heart className="w-4 h-4 inline mr-1" />
              Diastolic BP (mmHg)
            </label>
            <input
              type="number"
              value={formData.diastolic_bp}
              onChange={(e) => setFormData(prev => ({ ...prev, diastolic_bp: e.target.value }))}
              className="input-field"
              placeholder="80"
              min="50"
              max="120"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Activity className="w-4 h-4 inline mr-1" />
              Heart Rate (bpm)
            </label>
            <input
              type="number"
              value={formData.heart_rate}
              onChange={(e) => setFormData(prev => ({ ...prev, heart_rate: e.target.value }))}
              className="input-field"
              placeholder="72"
              min="50"
              max="150"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Weight className="w-4 h-4 inline mr-1" />
              Weight (kg)
            </label>
            <input
              type="number"
              step="0.1"
              value={formData.weight}
              onChange={(e) => setFormData(prev => ({ ...prev, weight: e.target.value }))}
              className="input-field"
              placeholder="65.5"
              min="30"
              max="150"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            <AlertCircle className="w-4 h-4 inline mr-1" />
            Symptoms (select all that apply)
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {SYMPTOM_OPTIONS.map((symptom) => (
              <label key={symptom} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.symptoms.includes(symptom)}
                  onChange={(e) => handleSymptomChange(symptom, e.target.checked)}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700 capitalize">
                  {symptom.replace('_', ' ')}
                </span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.medication_taken}
              onChange={(e) => setFormData(prev => ({ ...prev, medication_taken: e.target.checked }))}
              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <span className="text-sm font-medium text-gray-700">
              Medication taken today
            </span>
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notes (optional)
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            className="input-field"
            rows={3}
            placeholder="Any additional notes about how you're feeling today..."
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <div className="flex items-center justify-center gap-2">
              <LoadingSpinner size="sm" />
              <span>Analyzing with AI...</span>
            </div>
          ) : (
            'Submit Vitals & Get AI Risk Assessment'
          )}
        </button>
      </form>
    </div>
  )
}