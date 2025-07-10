import { createClient } from '@supabase/supabase-js'

// For demo purposes, we'll create a working mock client
const supabaseUrl = 'https://demo.supabase.co'
const supabaseAnonKey = 'demo-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)