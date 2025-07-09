import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.')
}

// Check if the URL is still a placeholder
if (supabaseUrl === 'your_supabase_project_url' || supabaseAnonKey === 'your_supabase_anon_key') {
  throw new Error(
    'Please update your .env file with actual Supabase credentials:\n' +
    '1. Go to https://supabase.com/dashboard\n' +
    '2. Select your project\n' +
    '3. Go to Settings > API\n' +
    '4. Copy your Project URL and anon/public key\n' +
    '5. Update VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file'
  )
}

// Validate URL format
try {
  new URL(supabaseUrl)
} catch {
  throw new Error(`Invalid Supabase URL format: ${supabaseUrl}. Please ensure it's a valid URL like https://your-project-ref.supabase.co`)
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)