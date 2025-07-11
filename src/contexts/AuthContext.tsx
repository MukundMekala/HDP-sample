import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { UserProfile, UserRole } from '../types'

// Mock User type for demo
interface User {
  id: string
  email: string
  created_at: string
  updated_at: string
}

interface AuthContextType {
  user: User | null
  profile: UserProfile | null
  loading: boolean
  signUp: (email: string, password: string, fullName: string, role: UserRole, additionalData?: any) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Mock storage for demo
const mockUsers: any[] = []
const mockProfiles: UserProfile[] = []

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for existing session in localStorage
    const savedUser = localStorage.getItem('mockUser')
    const savedProfile = localStorage.getItem('mockProfile')
    
    if (savedUser && savedProfile) {
      setUser(JSON.parse(savedUser))
      setProfile(JSON.parse(savedProfile))
    }
    
    setLoading(false)
  }, [])

  const signUp = async (
    email: string,
    password: string,
    fullName: string,
    role: UserRole,
    additionalData?: any
  ) => {
    // Check if user already exists
    if (mockUsers.find(u => u.email === email)) {
      throw new Error('User already exists')
    }

    const mockUser = {
      id: `user-${Date.now()}`,
      email,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    const mockProfile: UserProfile = {
      id: mockUser.id,
      email,
      role,
      full_name: fullName,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...additionalData
    }

    mockUsers.push(mockUser)
    mockProfiles.push(mockProfile)

    // Auto sign in after signup
    setUser(mockUser as User)
    setProfile(mockProfile)
    
    // Save to localStorage
    localStorage.setItem('mockUser', JSON.stringify(mockUser))
    localStorage.setItem('mockProfile', JSON.stringify(mockProfile))
  }

  const signIn = async (email: string, password: string) => {
    const existingUser = mockUsers.find(u => u.email === email)
    const existingProfile = mockProfiles.find(p => p.email === email)

    if (!existingUser || !existingProfile) {
      throw new Error('Invalid credentials')
    }

    setUser(existingUser as User)
    setProfile(existingProfile)
    
    // Save to localStorage
    localStorage.setItem('mockUser', JSON.stringify(existingUser))
    localStorage.setItem('mockProfile', JSON.stringify(existingProfile))
  }

  const signOut = async () => {
    setUser(null)
    setProfile(null)
    localStorage.removeItem('mockUser')
    localStorage.removeItem('mockProfile')
  }

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user || !profile) throw new Error('No user logged in')

    const updatedProfile = { ...profile, ...updates, updated_at: new Date().toISOString() }
    
    // Update in mock storage
    const profileIndex = mockProfiles.findIndex(p => p.id === profile.id)
    if (profileIndex !== -1) {
      mockProfiles[profileIndex] = updatedProfile
    }

    setProfile(updatedProfile)
    localStorage.setItem('mockProfile', JSON.stringify(updatedProfile))
  }

  const value = {
    user,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}