-- =============================================
-- SEGMENT 5: Update existing users (OPTIONAL)
-- Run this LAST - only if you have existing users
-- =============================================

UPDATE profiles 
SET 
  trial_start_date = COALESCE(trial_start_date, created_at, NOW()),
  trial_end_date = COALESCE(trial_end_date, created_at + INTERVAL '14 days', NOW() + INTERVAL '14 days'),
  subscription_status = COALESCE(subscription_status, 'trial')
WHERE trial_start_date IS NULL OR trial_end_date IS NULL;
