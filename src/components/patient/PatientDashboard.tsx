import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { VitalsInput, RiskPrediction, TrendData, UserProfile } from '../../types'
import { predictHDPRisk } from '../../services/api'
import { VitalsForm } from './VitalsForm'
import { Chart } from '../ui/Chart'
import { RiskBadge } from '../ui/RiskBadge'
import { LoadingSpinner } from '../ui/LoadingSpinner'
import { calculateWeeksPregnant } from '../../lib/utils'
import { Heart, MessageCircle, TrendingUp, Calendar, Baby } from 'lucide-react'

// Mock data for demo
const mockVitals: VitalsInput[] = []
let mockRisk: RiskPrediction | null = null

export function PatientDashboard() {
  const { profile } = useAuth()
  const [vitals, setVitals] = useState<VitalsInput[]>([])
  const [latestRisk, setLatestRisk] = useState<RiskPrediction | null>(null)
  const [trendData, setTrendData] = useState<TrendData>({
    systolic: [],
    diastolic: [],
    heart_rate: [],
    weight: [],
  })
  const [loading, setLoading] = useState(true)
  const [showVitalsForm, setShowVitalsForm] = useState(false)

  useEffect(() => {
    if (profile) {
      fetchVitals()
    }
  }, [profile])

  const fetchVitals = async () => {
    if (!profile) return

    // Use mock data for demo - start with empty array
    setVitals(mockVitals)
    generateTrendData(mockVitals)
    
    // Get latest risk if vitals exist
    if (mockVitals.length > 0) {
      await fetchLatestRisk()
    }
    
    setLoading(false)
  }

  const fetchLatestRisk = async () => {
    if (!profile) return

    // Get the latest risk from mock storage or calculate it
    if (mockRisk) {
      setLatestRisk(mockRisk)
    } else if (vitals.length > 0) {
      // Calculate risk for the latest vitals
      try {
        const latestVitals = vitals[0]
        const riskPrediction = await predictHDPRisk(latestVitals)
        mockRisk = riskPrediction
        setLatestRisk(riskPrediction)
      } catch (error) {
        console.error('Error calculating risk:', error)
      }
    }
  }

  const generateTrendData = (vitalsData: VitalsInput[]) => {
    const trends: TrendData = {
      systolic: [],
      diastolic: [],
      heart_rate: [],
      weight: [],
    }

    vitalsData.reverse().forEach((vital) => {
      const date = vital.date
      trends.systolic.push({ date, value: vital.systolic_bp })
      trends.diastolic.push({ date, value: vital.diastolic_bp })
      trends.heart_rate.push({ date, value: vital.heart_rate })
      trends.weight.push({ date, value: vital.weight })
    })

    setTrendData(trends)
  }

  const handleVitalsSubmit = async (newVitals: VitalsInput, riskPrediction: RiskPrediction) => {
    console.log('📊 Dashboard received new vitals:', newVitals)
    console.log('🎯 Dashboard received risk prediction:', riskPrediction)
    
    // Update vitals
    const updatedVitals = [newVitals, ...vitals]
    setVitals(updatedVitals)
    generateTrendData(updatedVitals)
    
    // Update risk prediction
    mockRisk = riskPrediction
    setLatestRisk(riskPrediction)
    
    // Update mock storage
    mockVitals.unshift(newVitals)
    
    setShowVitalsForm(false)
  }

  const getWeeksPregnant = () => {
    if (!profile?.last_period_date) return null
    return calculateWeeksPregnant(new Date(profile.last_period_date))
  }

  const handleContactDoctor = () => {
    // In a real app, this would open a chat or email modal
    alert('Contact doctor feature would be implemented here')
  }

  if (loading) {
    return <LoadingSpinner />
  }

  const weeksPregnant = getWeeksPregnant()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="gradient-bg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Welcome back, {profile?.full_name?.split(' ')[0]}!
              </h1>
              {weeksPregnant && (
                <div className="flex items-center gap-2 mt-2 text-gray-600">
                  <Baby className="w-4 h-4" />
                  <span>Week {weeksPregnant} of pregnancy</span>
                </div>
              )}
            </div>
            <button
              onClick={handleContactDoctor}
              className="btn-primary flex items-center gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              Contact Doctor
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="card">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary-100 rounded-lg">
                    <Heart className="w-6 h-6 text-primary-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Latest BP</p>
                    <p className="text-xl font-semibold">
                      {vitals[0] ? `${vitals[0].systolic_bp}/${vitals[0].diastolic_bp}` : '--/--'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-success-100 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-success-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Heart Rate</p>
                    <p className="text-xl font-semibold">
                      {vitals[0] ? `${vitals[0].heart_rate} bpm` : '-- bpm'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-secondary-100 rounded-lg">
                    <Calendar className="w-6 h-6 text-secondary-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Entries</p>
                    <p className="text-xl font-semibold">{vitals.length}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Vitals Input */}
            {showVitalsForm ? (
              <VitalsForm onSubmit={handleVitalsSubmit} />
            ) : (
              <div className="card">
                <div className="text-center py-8">
                  <Heart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Ready to log your vitals?
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Track your daily health metrics to monitor your pregnancy
                  </p>
                  <button
                    onClick={() => setShowVitalsForm(true)}
                    className="btn-primary"
                  >
                    Log Today's Vitals
                  </button>
                </div>
              </div>
            )}

            {/* Trends Charts */}
            {vitals.length > 0 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900">Health Trends</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="card">
                    <Chart
                      data={trendData.systolic}
                      title="Systolic Blood Pressure"
                      color="#dc2626"
                      unit=" mmHg"
                      height={250}
                    />
                  </div>
                  
                  <div className="card">
                    <Chart
                      data={trendData.diastolic}
                      title="Diastolic Blood Pressure"
                      color="#ea580c"
                      unit=" mmHg"
                      height={250}
                    />
                  </div>
                  
                  <div className="card">
                    <Chart
                      data={trendData.heart_rate}
                      title="Heart Rate"
                      color="#0ea5e9"
                      unit=" bpm"
                      height={250}
                    />
                  </div>
                  
                  <div className="card">
                    <Chart
                      data={trendData.weight}
                      title="Weight"
                      color="#8b5cf6"
                      unit=" kg"
                      height={250}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* AI Risk Assessment */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                AI Risk Assessment
              </h3>
              {latestRisk ? (
                <div className="space-y-4">
                  <RiskBadge 
                    risk={latestRisk.risk_level} 
                    score={latestRisk.risk_score}
                  />
                  {latestRisk.factors.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">
                        Risk Factors:
                      </p>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {latestRisk.factors.map((factor, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="w-1 h-1 bg-gray-400 rounded-full mt-2 flex-shrink-0" />
                            {factor}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <p className="text-xs text-gray-500">
                    Last updated: {new Date(latestRisk.created_at).toLocaleDateString()}
                  </p>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-500">No risk assessment available</p>
                  <p className="text-sm text-gray-400 mt-1">
                    Log your vitals to get a risk assessment
                  </p>
                </div>
              )}
            </div>

            {/* Recent Activity */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Recent Activity
              </h3>
              {vitals.length > 0 ? (
                <div className="space-y-3">
                  {vitals.slice(0, 5).map((vital, index) => (
                    <div key={vital.id || index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          Vitals logged
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(vital.date).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">
                          {vital.systolic_bp}/{vital.diastolic_bp}
                        </p>
                        <p className="text-xs text-gray-500">
                          {vital.heart_rate} bpm
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">
                  No activity yet
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}