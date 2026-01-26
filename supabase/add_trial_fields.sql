-- ReceiptKeeper - Trial Flow Database Migration
-- Run this SQL in your Supabase SQL Editor to add trial functionality

-- ============================================
-- STEP 1: Add trial fields to profiles table
-- ============================================

-- Add trial columns if they don't exist
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS trial_start_date TIMESTAMP DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS trial_end_date TIMESTAMP DEFAULT (NOW() + INTERVAL '14 days');

-- Update subscription_status to include 'trial' option if not already
-- First, drop the constraint if it exists
ALTER TABLE profiles 
DROP CONSTRAINT IF EXISTS profiles_subscription_status_check;

-- Add the updated constraint
ALTER TABLE profiles 
ADD CONSTRAINT profiles_subscription_status_check 
CHECK (subscription_status IN ('trial', 'free', 'active', 'expired', 'cancelled'));

-- Set default to 'trial' for new users
ALTER TABLE profiles 
ALTER COLUMN subscription_status SET DEFAULT 'trial';

-- ============================================
-- STEP 2: Update the handle_new_user function
-- ============================================

-- Update the trigger function to include trial dates
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    full_name, 
    business_name, 
    subscription_status,
    trial_start_date, 
    trial_end_date,
    created_at
  )
  VALUES (
    NEW.id, 
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'business_name',
    'trial',
    NOW(),
    NOW() + INTERVAL '14 days',
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    business_name = EXCLUDED.business_name,
    trial_start_date = COALESCE(profiles.trial_start_date, NOW()),
    trial_end_date = COALESCE(profiles.trial_end_date, NOW() + INTERVAL '14 days');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- STEP 3: Recreate the trigger (if needed)
-- ============================================

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger to auto-create profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- STEP 4: Update existing users to have trial dates
-- ============================================

-- Set trial dates for existing users who don't have them
UPDATE profiles 
SET 
  trial_start_date = COALESCE(trial_start_date, created_at, NOW()),
  trial_end_date = COALESCE(trial_end_date, created_at + INTERVAL '14 days', NOW() + INTERVAL '14 days'),
  subscription_status = COALESCE(subscription_status, 'trial')
WHERE trial_start_date IS NULL OR trial_end_date IS NULL;

-- ============================================
-- DONE! Verify with this query:
-- ============================================

-- SELECT id, full_name, subscription_status, trial_start_date, trial_end_date 
-- FROM profiles 
-- ORDER BY created_at DESC 
-- LIMIT 10;
