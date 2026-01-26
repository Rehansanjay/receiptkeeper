-- =============================================
-- SEGMENT 2: Update subscription_status constraint
-- Run this SECOND
-- =============================================

-- Drop old constraint (ignore error if doesn't exist)
ALTER TABLE profiles 
DROP CONSTRAINT IF EXISTS profiles_subscription_status_check;

-- Add new constraint with 'trial' option
ALTER TABLE profiles 
ADD CONSTRAINT profiles_subscription_status_check 
CHECK (subscription_status IN ('trial', 'free', 'active', 'expired', 'cancelled'));

-- Set default to 'trial' for new users
ALTER TABLE profiles 
ALTER COLUMN subscription_status SET DEFAULT 'trial';
