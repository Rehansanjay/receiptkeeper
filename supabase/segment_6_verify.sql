-- =============================================
-- SEGMENT 6: Verify everything worked
-- Run this to check your setup
-- =============================================

SELECT 
  id, 
  full_name, 
  subscription_status, 
  trial_start_date, 
  trial_end_date,
  created_at
FROM profiles 
ORDER BY created_at DESC 
LIMIT 10;
