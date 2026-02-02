-- ============================================
-- RLS VERIFICATION SCRIPT
-- ============================================
-- Run this to verify RLS is working correctly

-- Step 1: Check RLS is enabled on both tables
SELECT 
    tablename,
    rowsecurity AS rls_enabled
FROM pg_tables
WHERE tablename IN ('profiles', 'receipts')
ORDER BY tablename;

-- Expected output:
-- profiles  | true
-- receipts  | true

-- Step 2: Count policies on each table
SELECT 
    tablename,
    COUNT(*) as policy_count
FROM pg_policies
WHERE tablename IN ('profiles', 'receipts')
GROUP BY tablename
ORDER BY tablename;

-- Expected output:
-- profiles  | 3
-- receipts  | 4

-- Step 3: List all policy names
SELECT 
    tablename,
    policyname
FROM pg_policies
WHERE tablename IN ('profiles', 'receipts')
ORDER BY tablename, policyname;

-- Expected output for profiles:
-- Users can insert own profile
-- Users can update own profile
-- Users can view own profile

-- Expected output for receipts:
-- Users can delete own receipts
-- Users can insert own receipts
-- Users can update own receipts
-- Users can view own receipts

-- Step 4: Test your access (should work)
SELECT COUNT(*) as my_receipts FROM receipts;
SELECT COUNT(*) as my_profile FROM profiles WHERE id = auth.uid();

-- Expected:
-- my_receipts: Your actual receipt count (you got 2, which is correct!)
-- my_profile: 1 (your profile)

-- ============================================
-- SUCCESS INDICATORS
-- ============================================

-- ✅ If you see:
--    - Both tables show rls_enabled = true
--    - profiles has 3 policies
--    - receipts has 4 policies
--    - You can see your own data
-- 
-- Then RLS is working perfectly!

-- ============================================
-- FINAL TEST (Advanced)
-- ============================================

-- This query should return ONLY your user ID, not all user IDs
SELECT id FROM profiles;

-- If you see only 1 row (your ID), RLS is working!
-- If you see multiple rows, RLS might not be enabled properly.
