import { useState } from 'react'
import { BrowserRouter as Router } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { AuthForm } from './components/auth/AuthForm'
import { PatientDashboard } from './components/patient/PatientDashboard'
import { DoctorDashboard } from './components/doctor/DoctorDashboard'
import { ProfileSettings } from './components/profile/ProfileSettings'
import { BottomNavigation } from './components/layout/BottomNavigation'
import { Sidebar } from './components/layout/Sidebar'
import { LoadingScreen } from './components/ui/LoadingSpinner'
import { VitalsForm } from './components/patient/VitalsForm'

function AppContent() {
  const { user, profile, loading } = useAuth()
  const [activeTab, setActiveTab] = useState('home')

  if (loading) {
    return <LoadingScreen />
  }

  if (!user || !profile) {
    return <AuthForm />
  }

  const renderPatientContent = () => {
    switch (activeTab) {
      case 'home':
        return <PatientDashboard />
      case 'input':
        return (
          <div className="min-h-screen bg-gray-50 p-4 pb-20 md:pb-4">
            <div className="max-w-2xl mx-auto pt-8">
              <VitalsForm onSubmit={() => setActiveTab('home')} />
            </div>
          </div>
        )
      case 'insights':
        return <PatientDashboard />
      case 'profile':
        return (
          <div className="min-h-screen bg-gray-50 pb-20 md:pb-4">
            <ProfileSettings />
          </div>
        )
      default:
        return <PatientDashboard />
    }
  }

  const renderDoctorContent = () => {
    switch (activeTab) {
      case 'dashboard':
      case 'patients':
      case 'alerts':
        return <DoctorDashboard />
      case 'profile':
        return <ProfileSettings />
      default:
        return <DoctorDashboard />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {profile.role === 'doctor' && (
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      )}
      
      <div className={profile.role === 'doctor' ? 'md:ml-64' : ''}>
        {profile.role === 'patient' ? renderPatientContent() : renderDoctorContent()}
      </div>

      {profile.role === 'patient' && (
        <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
      )}
    </div>
  )
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  )
}

export default App