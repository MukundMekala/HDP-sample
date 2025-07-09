/*
  # Create alerts table for doctor-patient communication

  1. New Tables
    - `alerts`
      - `id` (uuid, primary key)
      - `patient_id` (uuid, references profiles)
      - `doctor_id` (uuid, references profiles)
      - `type` (text, 'critical', 'warning', 'info')
      - `message` (text)
      - `is_read` (boolean)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `alerts` table
    - Add policies for patients and doctors to read relevant alerts
    - Add policy for doctors to create alerts
*/

CREATE TABLE IF NOT EXISTS alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  doctor_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('critical', 'warning', 'info')),
  message text NOT NULL,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;

-- Patients can read alerts sent to them
CREATE POLICY "Patients can read own alerts"
  ON alerts
  FOR SELECT
  TO authenticated
  USING (patient_id = auth.uid());

-- Doctors can read alerts they created
CREATE POLICY "Doctors can read own alerts"
  ON alerts
  FOR SELECT
  TO authenticated
  USING (doctor_id = auth.uid());

-- Doctors can create alerts for their assigned patients
CREATE POLICY "Doctors can create alerts"
  ON alerts
  FOR INSERT
  TO authenticated
  WITH CHECK (
    doctor_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = patient_id
      AND profiles.assigned_doctor_id = auth.uid()
    )
  );

-- Users can update read status of their alerts
CREATE POLICY "Users can update alert read status"
  ON alerts
  FOR UPDATE
  TO authenticated
  USING (patient_id = auth.uid() OR doctor_id = auth.uid());