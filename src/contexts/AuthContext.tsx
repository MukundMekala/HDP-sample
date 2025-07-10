import React, { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { UserProfile, UserRole } from '../types'

// Mock Supabase client for demo purposes
const mockSupabase = {
  auth: {
    getSession: () => Promise.resolve({ data: { session: null } }),
    onAuthStateChange: (callback: any) => {
      return { data: { subscription: { unsubscribe: () => {} } } }
    },
    signUp: ({ email, password }: any) => {
      const mockUser = { id: 'mock-user-id', email }
      return Promise.resolve({ data: { user: mockUser }, error: null })
    },
    signInWithPassword: ({ email, password }: any) => {
      const mockUser = { id: 'mock-user-id', email }
      return Promise.resolve({ data: { user: mockUser }, error: null })
    },
    signOut: () => Promise.resolve({ error: null })
  },
  from: (table: string) => ({
    select: (columns: string) => ({
      eq: (column: string, value: any) => ({
        single: () => {
          if (table === 'profiles') {
            return Promise.resolve({
              data: {
                id: 'mock-user-id',
                email: 'demo@example.com',
                role: 'patient',
                full_name: 'Demo User',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              },
              error: null
            })
          }
          return Promise.resolve({ data: null, error: null })
        }
      })
    }),
    insert: (data: any) => Promise.resolve({ data, error: null }),
    update: (data: any) => ({
      eq: (column: string, value: any) => Promise.resolve({ error: null })
    })
  })
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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    mockSupabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchProfile(session.user.id)
      } else {
        setLoading(false)
      }
    })

    // Listen for auth changes
    const { data: { subscription } } = mockSupabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null)
        if (session?.user) {
          await fetchProfile(session.user.id)
        } else {
          setProfile(null)
          setLoading(false)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await mockSupabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) throw error
      setProfile(data)
    } catch (error) {
      console.error('Error fetching profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (
    email: string,
    password: string,
    fullName: string,
    role: UserRole,
    additionalData?: any
  ) => {
    const { data, error } = await mockSupabase.auth.signUp({
      email,
      password,
    })

    if (error) throw error

    if (data.user) {
      // Create profile
      const profileData = {
        id: data.user.id,
        email,
        role,
        full_name: fullName,
        ...additionalData,
      }

      const { error: profileError } = await mockSupabase
        .from('profiles')
        .insert([profileData])

      if (profileError) throw profileError
    }
  }

  const signIn = async (email: string, password: string) => {
    const { error } = await mockSupabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) throw error
  }

  const signOut = async () => {
    const { error } = await mockSupabase.auth.signOut()
    if (error) throw error
  }

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) throw new Error('No user logged in')

    const { error } = await mockSupabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)

    if (error) throw error

    setProfile(prev => prev ? { ...prev, ...updates } : null)
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