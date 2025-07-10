/*
  # Create risk_predictions table for AI risk assessments

  1. New Tables
    - `risk_predictions`
      - `id` (uuid, primary key)
      - `patient_id` (uuid, references profiles)
      - `vitals_id` (uuid, references vitals)
      - `risk_level` (text, 'low', 'moderate', 'high')
      - `risk_score` (decimal)
      - `factors` (text array)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `risk_predictions` table
    - Add policies for patients to read their own predictions
    - Add policy for doctors to read predictions of assigned patients
*/

CREATE TABLE IF NOT EXISTS risk_predictions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  vitals_id uuid NOT NULL REFERENCES vitals(id) ON DELETE CASCADE,
  risk_level text NOT NULL CHECK (risk_level IN ('low', 'moderate', 'high')),
  risk_score decimal(3,2) NOT NULL,
  factors text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE risk_predictions ENABLE ROW LEVEL SECURITY;

-- Patients can read their own risk predictions
CREATE POLICY "Patients can read own risk predictions"
  ON risk_predictions
  FOR SELECT
  TO authenticated
  USING (patient_id = auth.uid());

-- Doctors can read risk predictions of their assigned patients
CREATE POLICY "Doctors can read assigned patient risk predictions"
  ON risk_predictions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = risk_predictions.patient_id
      AND profiles.assigned_doctor_id = auth.uid()
    )
  );

-- System can insert risk predictions
CREATE POLICY "System can insert risk predictions"
  ON risk_predictions
  FOR INSERT
  TO authenticated
  WITH CHECK (true);