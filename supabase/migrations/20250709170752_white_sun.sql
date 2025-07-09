/*
  # Create profiles table for user management

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key, references auth.users)
      - `email` (text, unique)
      - `role` (text, either 'patient' or 'doctor')
      - `full_name` (text)
      - `created_at` (timestamp)
      - Patient specific fields:
        - `pregnancy_week` (integer)
        - `due_date` (date)
        - `assigned_doctor_id` (uuid, references profiles)
      - Doctor specific fields:
        - `specialization` (text)
        - `license_number` (text)

  2. Security
    - Enable RLS on `profiles` table
    - Add policies for users to read/update their own profiles
    - Add policy for doctors to read their assigned patients
*/

CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  role text NOT NULL CHECK (role IN ('patient', 'doctor')),
  full_name text NOT NULL,
  created_at timestamptz DEFAULT now(),
  
  -- Patient specific fields
  pregnancy_week integer,
  due_date date,
  assigned_doctor_id uuid REFERENCES profiles(id),
  
  -- Doctor specific fields
  specialization text,
  license_number text
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Users can read and update their own profile
CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Doctors can read profiles of their assigned patients
CREATE POLICY "Doctors can read assigned patients"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles doctor_profile
      WHERE doctor_profile.id = auth.uid()
      AND doctor_profile.role = 'doctor'
      AND profiles.assigned_doctor_id = doctor_profile.id
    )
  );

-- Allow users to insert their own profile during signup
CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);