/*
  # Create vitals table for patient health data

  1. New Tables
    - `vitals`
      - `id` (uuid, primary key)
      - `patient_id` (uuid, references profiles)
      - `date` (date)
      - `systolic_bp` (integer)
      - `diastolic_bp` (integer)
      - `heart_rate` (integer)
      - `weight` (decimal)
      - `symptoms` (text array)
      - `medication_taken` (boolean)
      - `notes` (text)
      - `risk_prediction` (decimal)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `vitals` table
    - Add policies for patients to manage their own vitals
    - Add policy for doctors to read vitals of assigned patients
*/

CREATE TABLE IF NOT EXISTS vitals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  date date NOT NULL DEFAULT CURRENT_DATE,
  systolic_bp integer NOT NULL,
  diastolic_bp integer NOT NULL,
  heart_rate integer NOT NULL,
  weight decimal(5,2) NOT NULL,
  symptoms text[] DEFAULT '{}',
  medication_taken boolean DEFAULT false,
  notes text,
  risk_prediction decimal(3,2),
  created_at timestamptz DEFAULT now(),
  
  UNIQUE(patient_id, date)
);

ALTER TABLE vitals ENABLE ROW LEVEL SECURITY;

-- Patients can manage their own vitals
CREATE POLICY "Patients can read own vitals"
  ON vitals
  FOR SELECT
  TO authenticated
  USING (patient_id = auth.uid());

CREATE POLICY "Patients can insert own vitals"
  ON vitals
  FOR INSERT
  TO authenticated
  WITH CHECK (patient_id = auth.uid());

CREATE POLICY "Patients can update own vitals"
  ON vitals
  FOR UPDATE
  TO authenticated
  USING (patient_id = auth.uid());

-- Doctors can read vitals of their assigned patients
CREATE POLICY "Doctors can read assigned patient vitals"
  ON vitals
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = vitals.patient_id
      AND profiles.assigned_doctor_id = auth.uid()
    )
  );