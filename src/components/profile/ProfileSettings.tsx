import React, { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { LoadingSpinner } from '../ui/LoadingSpinner'
import { User, Mail, Calendar, Heart, Shield, Save } from 'lucide-react'

export function ProfileSettings() {
  const { profile, updateProfile } = useAuth()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
    last_period_date: profile?.last_period_date || '',
    due_date: profile?.due_date || '',
    license_number: profile?.license_number || '',
    specialization: profile?.specialization || '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setSuccess(false)

    try {
      const updates: any = {
        full_name: formData.full_name,
      }

      if (profile?.role === 'patient') {
        if (formData.last_period_date) updates.last_period_date = formData.last_period_date
        if (formData.due_date) updates.due_date = formData.due_date
      } else if (profile?.role === 'doctor') {
        if (formData.license_number) updates.license_number = formData.license_number
        if (formData.specialization) updates.specialization = formData.specialization
      }

      await updateProfile(updates)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (error) {
      console.error('Error updating profile:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!profile) {
    return <LoadingSpinner />
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="card">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-primary-100 rounded-lg">
            {profile.role === 'patient' ? (
              <Heart className="w-6 h-6 text-primary-600" />
            ) : (
              <Shield className="w-6 h-6 text-primary-600" />
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
            <p className="text-gray-600 capitalize">{profile.role} Account</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Basic Information</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <User className="w-4 h-4 inline mr-1" />
                Full Name
              </label>
              <input
                type="text"
                value={formData.full_name}
                onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Mail className="w-4 h-4 inline mr-1" />
                Email
              </label>
              <input
                type="email"
                value={profile.email}
                className="input-field bg-gray-50"
                disabled
              />
              <p className="text-xs text-gray-500 mt-1">
                Email cannot be changed
              </p>
            </div>
          </div>

          {/* Role-specific fields */}
          {profile.role === 'patient' && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">Pregnancy Information</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Last Period Date
                </label>
                <input
                  type="date"
                  value={formData.last_period_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, last_period_date: e.target.value }))}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Due Date
                </label>
                <input
                  type="date"
                  value={formData.due_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, due_date: e.target.value }))}
                  className="input-field"
                />
              </div>
            </div>
          )}

          {profile.role === 'doctor' && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">Professional Information</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Shield className="w-4 h-4 inline mr-1" />
                  License Number
                </label>
                <input
                  type="text"
                  value={formData.license_number}
                  onChange={(e) => setFormData(prev => ({ ...prev, license_number: e.target.value }))}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Heart className="w-4 h-4 inline mr-1" />
                  Specialization
                </label>
                <input
                  type="text"
                  value={formData.specialization}
                  onChange={(e) => setFormData(prev => ({ ...prev, specialization: e.target.value }))}
                  className="input-field"
                  placeholder="e.g., Gynecology, Obstetrics"
                />
              </div>
            </div>
          )}

          {/* Account Information */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Account Information</h2>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Account Created
                </label>
                <p className="text-sm text-gray-600">
                  {new Date(profile.created_at).toLocaleDateString()}
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Updated
                </label>
                <p className="text-sm text-gray-600">
                  {new Date(profile.updated_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          {/* Success Message */}
          {success && (
            <div className="p-3 bg-success-50 border border-success-200 rounded-lg">
              <p className="text-success-600 text-sm">
                Profile updated successfully!
              </p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <LoadingSpinner size="sm" />
                <span>Saving...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <Save className="w-4 h-4" />
                <span>Save Changes</span>
              </div>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}