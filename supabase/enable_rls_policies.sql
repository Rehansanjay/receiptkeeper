-- ============================================
-- ROW-LEVEL SECURITY (RLS) POLICIES
-- ============================================
-- Run this in Supabase SQL Editor to secure your database
-- This ensures users can only access their own data

-- ============================================
-- PROFILES TABLE SECURITY
-- ============================================

-- Enable RLS on profiles table
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for re-running this script)
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

-- Policy: Users can only SELECT their own profile
CREATE POLICY "Users can view own profile"
ON profiles FOR SELECT
USING (auth.uid() = id);

-- Policy: Users can only UPDATE their own profile
CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
USING (auth.uid() = id);

-- Policy: Users can INSERT their own profile (for new signups)
CREATE POLICY "Users can insert own profile"
ON profiles FOR INSERT
WITH CHECK (auth.uid() = id);

-- ============================================
-- RECEIPTS TABLE SECURITY
-- ============================================

-- Enable RLS on receipts table
ALTER TABLE receipts ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for re-running this script)
DROP POLICY IF EXISTS "Users can view own receipts" ON receipts;
DROP POLICY IF EXISTS "Users can insert own receipts" ON receipts;
DROP POLICY IF EXISTS "Users can update own receipts" ON receipts;
DROP POLICY IF EXISTS "Users can delete own receipts" ON receipts;

-- Policy: Users can only SELECT their own receipts
CREATE POLICY "Users can view own receipts"
ON receipts FOR SELECT
USING (auth.uid() = user_id);

-- Policy: Users can only INSERT receipts for themselves
CREATE POLICY "Users can insert own receipts"
ON receipts FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can only UPDATE their own receipts
CREATE POLICY "Users can update own receipts"
ON receipts FOR UPDATE
USING (auth.uid() = user_id);

-- Policy: Users can only DELETE their own receipts
CREATE POLICY "Users can delete own receipts"
ON receipts FOR DELETE
USING (auth.uid() = user_id);

-- ============================================
-- VERIFICATION
-- ============================================

-- Check that RLS is enabled
SELECT 
    schemaname,
    tablename,
    rowsecurity AS rls_enabled
FROM pg_tables
WHERE tablename IN ('profiles', 'receipts');

-- Expected output:
-- Both tables should show rls_enabled = true

-- List all policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename IN ('profiles', 'receipts')
ORDER BY tablename, policyname;

-- Expected output:
-- Should show 3 policies for profiles (SELECT, UPDATE, INSERT)
-- Should show 4 policies for receipts (SELECT, INSERT, UPDATE, DELETE)

-- ============================================
-- TESTING RLS POLICIES
-- ============================================

-- Test 1: Verify you can only see your own profile
-- This should return only YOUR profile
SELECT * FROM profiles WHERE id = auth.uid();

-- Test 2: Try to see another user's profile (should return 0 rows)
-- Replace 'SOME_OTHER_USER_ID' with an actual different user ID
-- SELECT * FROM profiles WHERE id = 'SOME_OTHER_USER_ID';

-- Test 3: Verify you can only see your own receipts
-- This should return only YOUR receipts
SELECT * FROM receipts WHERE user_id = auth.uid();

-- Test 4: Count total receipts (should only count YOUR receipts)
SELECT COUNT(*) FROM receipts;

-- ============================================
-- SECURITY NOTES
-- ============================================

-- 1. RLS policies are enforced at the database level
-- 2. Even if someone bypasses the frontend, they cannot access other users' data
-- 3. Supabase automatically uses auth.uid() to identify the current user
-- 4. These policies work with Supabase Auth JWT tokens
-- 5. Service role keys bypass RLS (keep them secret!)

-- ============================================
-- TROUBLESHOOTING
-- ============================================

-- If you get "permission denied" errors:
-- 1. Make sure you're authenticated (logged in)
-- 2. Verify the user_id in receipts matches auth.uid()
-- 3. Check that RLS is enabled: SELECT * FROM pg_tables WHERE tablename = 'receipts';
-- 4. Verify policies exist: SELECT * FROM pg_policies WHERE tablename = 'receipts';

-- To temporarily disable RLS for debugging (NOT RECOMMENDED FOR PRODUCTION):
-- ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE receipts DISABLE ROW LEVEL SECURITY;

-- To re-enable:
-- ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE receipts ENABLE ROW LEVEL SECURITY;

-- ============================================
-- SUCCESS!
-- ============================================

-- If all queries above ran successfully, your database is now secure!
-- Users can only access their own data.
