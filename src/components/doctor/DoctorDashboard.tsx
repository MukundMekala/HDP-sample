import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { UserProfile, VitalsInput, RiskPrediction } from '../../types'
import { Chart } from '../ui/Chart'
import { RiskBadge } from '../ui/RiskBadge'
import { LoadingSpinner } from '../ui/LoadingSpinner'
import { Users, AlertTriangle, Search } from 'lucide-react'

// Mock data for demo
const mockPatients: PatientWithLatestVitals[] = [
  {
    id: 'patient-1',
    email: 'patient1@example.com',
    role: 'patient',
    full_name: 'Sarah Johnson',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    latest_vitals: {
      id: '1',
      patient_id: 'patient-1',
      date: new Date().toISOString().split('T')[0],
      systolic_bp: 140,
      diastolic_bp: 90,
      heart_rate: 85,
      weight: 70,
      symptoms: ['headache'],
      medication_taken: true,
      created_at: new Date().toISOString()
    },
    latest_risk: {
      id: '1',
      patient_id: 'patient-1',
      vitals_id: '1',
      risk_level: 'high',
      risk_score: 0.8,
      factors: ['High blood pressure', 'Headache symptoms'],
      created_at: new Date().toISOString()
    },
    vitals_count: 15
  },
  {
    id: 'patient-2',
    email: 'patient2@example.com',
    role: 'patient',
    full_name: 'Emily Davis',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    latest_vitals: {
      id: '2',
      patient_id: 'patient-2',
      date: new Date().toISOString().split('T')[0],
      systolic_bp: 115,
      diastolic_bp: 75,
      heart_rate: 68,
      weight: 62,
      symptoms: [],
      medication_taken: false,
      created_at: new Date().toISOString()
    },
    latest_risk: {
      id: '2',
      patient_id: 'patient-2',
      vitals_id: '2',
      risk_level: 'low',
      risk_score: 0.2,
      factors: [],
      created_at: new Date().toISOString()
    },
    vitals_count: 8
  }
]

interface PatientWithLatestVitals extends UserProfile {
  latest_vitals?: VitalsInput
  latest_risk?: RiskPrediction
  vitals_count?: number
}

export function DoctorDashboard() {
  const { profile } = useAuth()
  const [patients, setPatients] = useState<PatientWithLatestVitals[]>([])
  const [selectedPatient, setSelectedPatient] = useState<PatientWithLatestVitals | null>(null)
  const [patientVitals, setPatientVitals] = useState<VitalsInput[]>([])
  const [patientRisks, setPatientRisks] = useState<RiskPrediction[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    if (profile) {
      fetchPatients()
    }
  }, [profile])

  const fetchPatients = async () => {
    if (!profile) return

    // Use mock data for demo
    setPatients(mockPatients)
    setLoading(false)
  }

  const fetchPatientDetails = async (patient: PatientWithLatestVitals) => {
    // Use mock data for demo
    const mockPatientVitals = patient.latest_vitals ? [patient.latest_vitals] : []
    const mockPatientRisks = patient.latest_risk ? [patient.latest_risk] : []
    
    setPatientVitals(mockPatientVitals)
    setPatientRisks(mockPatientRisks)
    setSelectedPatient(patient)
  }

  const getHighRiskPatients = () => {
    return patients.filter(p => p.latest_risk?.risk_level === 'high')
  }

  const filteredPatients = patients.filter(patient =>
    patient.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="gradient-bg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Doctor Dashboard
              </h1>
              <p className="text-gray-600 mt-1">
                Welcome back, Dr. {profile?.full_name}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-white rounded-lg px-4 py-2 shadow-sm">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary-600" />
                  <span className="font-medium">{patients.length} Patients</span>
                </div>
              </div>
              {getHighRiskPatients().length > 0 && (
                <div className="bg-danger-50 border border-danger-200 rounded-lg px-4 py-2">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-danger-600" />
                    <span className="font-medium text-danger-700">
                      {getHighRiskPatients().length} High Risk
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {selectedPatient ? (
          /* Patient Detail View */
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setSelectedPatient(null)}
                className="btn-secondary"
              >
                ← Back to Patients
              </button>
              <div className="flex items-center gap-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  {selectedPatient.full_name}
                </h2>
                {selectedPatient.latest_risk && (
                  <RiskBadge 
                    risk={selectedPatient.latest_risk.risk_level}
                    score={selectedPatient.latest_risk.risk_score}
                  />
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Patient Info */}
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Patient Information
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium">{selectedPatient.email}</p>
                  </div>
                  {selectedPatient.last_period_date && (
                    <div>
                      <p className="text-sm text-gray-600">Last Period</p>
                      <p className="font-medium">
                        {new Date(selectedPatient.last_period_date).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                  {selectedPatient.due_date && (
                    <div>
                      <p className="text-sm text-gray-600">Due Date</p>
                      <p className="font-medium">
                        {new Date(selectedPatient.due_date).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-gray-600">Total Entries</p>
                    <p className="font-medium">{selectedPatient.vitals_count}</p>
                  </div>
                </div>
              </div>

              {/* Latest Vitals */}
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Latest Vitals
                </h3>
                {selectedPatient.latest_vitals ? (
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Blood Pressure</span>
                      <span className="font-medium">
                        {selectedPatient.latest_vitals.systolic_bp}/{selectedPatient.latest_vitals.diastolic_bp}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Heart Rate</span>
                      <span className="font-medium">
                        {selectedPatient.latest_vitals.heart_rate} bpm
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Weight</span>
                      <span className="font-medium">
                        {selectedPatient.latest_vitals.weight} kg
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Date</span>
                      <span className="font-medium">
                        {new Date(selectedPatient.latest_vitals.date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500">No vitals recorded</p>
                )}
              </div>

              {/* Risk Assessment */}
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Risk Assessment
                </h3>
                {selectedPatient.latest_risk ? (
                  <div className="space-y-4">
                    <RiskBadge 
                      risk={selectedPatient.latest_risk.risk_level}
                      score={selectedPatient.latest_risk.risk_score}
                    />
                    {selectedPatient.latest_risk.factors.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-2">
                          Risk Factors:
                        </p>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {selectedPatient.latest_risk.factors.map((factor, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <span className="w-1 h-1 bg-gray-400 rounded-full mt-2 flex-shrink-0" />
                              {factor}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-500">No risk assessment available</p>
                )}
              </div>
            </div>

            {/* Charts */}
            {patientVitals.length > 0 && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Health Trends</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="card">
                    <Chart
                      data={patientVitals.reverse().map(v => ({ date: v.date, value: v.systolic_bp }))}
                      title="Systolic Blood Pressure"
                      color="#dc2626"
                      unit=" mmHg"
                      height={250}
                    />
                  </div>
                  <div className="card">
                    <Chart
                      data={patientVitals.map(v => ({ date: v.date, value: v.heart_rate }))}
                      title="Heart Rate"
                      color="#0ea5e9"
                      unit=" bpm"
                      height={250}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Recent Entries */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Recent Entries
              </h3>
              {patientVitals.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-2">Date</th>
                        <th className="text-left py-2">BP</th>
                        <th className="text-left py-2">HR</th>
                        <th className="text-left py-2">Weight</th>
                        <th className="text-left py-2">Symptoms</th>
                      </tr>
                    </thead>
                    <tbody>
                      {patientVitals.slice(0, 10).map((vital, index) => (
                        <tr key={vital.id || index} className="border-b border-gray-100">
                          <td className="py-2">
                            {new Date(vital.date).toLocaleDateString()}
                          </td>
                          <td className="py-2">
                            {vital.systolic_bp}/{vital.diastolic_bp}
                          </td>
                          <td className="py-2">{vital.heart_rate}</td>
                          <td className="py-2">{vital.weight} kg</td>
                          <td className="py-2">
                            {vital.symptoms.length > 0 ? vital.symptoms.join(', ') : 'None'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500">No entries found</p>
              )}
            </div>
          </div>
        ) : (
          /* Patients List View */
          <div className="space-y-6">
            {/* Search */}
            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search patients..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input-field pl-10"
                />
              </div>
            </div>

            {/* High Risk Alerts */}
            {getHighRiskPatients().length > 0 && (
              <div className="card border-l-4 border-l-danger-500">
                <div className="flex items-center gap-3 mb-4">
                  <AlertTriangle className="w-6 h-6 text-danger-600" />
                  <h3 className="text-lg font-semibold text-danger-700">
                    High Risk Patients
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {getHighRiskPatients().map((patient) => (
                    <div
                      key={patient.id}
                      className="p-4 bg-danger-50 border border-danger-200 rounded-lg cursor-pointer hover:bg-danger-100 transition-colors"
                      onClick={() => fetchPatientDetails(patient)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-danger-900">
                          {patient.full_name}
                        </h4>
                        <RiskBadge risk="high" />
                      </div>
                      <p className="text-sm text-danger-700">
                        Last entry: {patient.latest_vitals ? 
                          new Date(patient.latest_vitals.date).toLocaleDateString() : 
                          'No data'
                        }
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* All Patients */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                All Patients ({filteredPatients.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredPatients.map((patient) => (
                  <div
                    key={patient.id}
                    className="p-4 border border-gray-200 rounded-lg cursor-pointer hover:border-primary-300 hover:bg-primary-50 transition-all"
                    onClick={() => fetchPatientDetails(patient)}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-gray-900">
                        {patient.full_name}
                      </h4>
                      {patient.latest_risk && (
                        <RiskBadge risk={patient.latest_risk.risk_level} />
                      )}
                    </div>
                    
                    <div className="space-y-2 text-sm text-gray-600">
                      <p>{patient.email}</p>
                      <div className="flex items-center justify-between">
                        <span>Entries: {patient.vitals_count}</span>
                        {patient.latest_vitals && (
                          <span>
                            Last: {new Date(patient.latest_vitals.date).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      {patient.latest_vitals && (
                        <div className="flex items-center gap-4 text-xs">
                          <span>BP: {patient.latest_vitals.systolic_bp}/{patient.latest_vitals.diastolic_bp}</span>
                          <span>HR: {patient.latest_vitals.heart_rate}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {filteredPatients.length === 0 && (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">
                    {selectedPatient.due_date ? new Date(selectedPatient.due_date).toLocaleDateString() : 'Not provided'}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}