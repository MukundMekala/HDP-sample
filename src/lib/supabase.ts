import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://demo.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'demo-key'

// For demo purposes, we'll use a mock client if no valid Supabase URL is provided
const isValidUrl = (url: string) => {
  try {
    new URL(url)
    return !url.includes('your-project-ref') && !url.includes('demo.supabase.co')
  } catch {
    return false
  }
}

export const supabase = isValidUrl(supabaseUrl) 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createClient('https://demo.supabase.co', 'demo-key')