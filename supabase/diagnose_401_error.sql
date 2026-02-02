-- ============================================
-- DIAGNOSTIC QUERIES FOR 401 AUTH ERROR
-- ============================================
-- Run these in Supabase SQL Editor to diagnose the issue

-- ============================================
-- QUERY 1: Check if user profile exists
-- ============================================
SELECT 
    u.id as user_id,
    u.email,
    u.created_at as user_created,
    p.id as profile_id,
    p.subscription_tier,
    p.ocr_engine,
    p.upload_limit,
    p.monthly_upload_count,
    p.created_at as profile_created
FROM auth.users u
LEFT JOIN profiles p ON p.id = u.id
WHERE u.email = 'rehansanjay28@gmail.com';

-- Expected: Should show your user with profile data
-- If profile_id is NULL: Profile doesn't exist (run QUERY 3)
-- If subscription_tier is NOT 'pro': Run QUERY 4


-- ============================================
-- QUERY 2: Check RLS status
-- ============================================
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables
WHERE tablename IN ('profiles', 'receipts');

-- Expected: rls_enabled should be 'false' (you disabled it)
-- If 'true': RLS is still enabled


-- ============================================
-- QUERY 3: Create profile if missing
-- ============================================
-- Only run this if QUERY 1 shows NULL for profile_id

INSERT INTO profiles (
    id, 
    subscription_tier, 
    ocr_engine, 
    upload_limit,
    monthly_upload_count
)
SELECT 
    id,
    'pro',
    'ocrspace',
    100,
    0
FROM auth.users
WHERE email = 'rehansanjay28@gmail.com'
ON CONFLICT (id) DO NOTHING;

-- Verify it worked:
SELECT * FROM profiles WHERE id = (
    SELECT id FROM auth.users WHERE email = 'rehansanjay28@gmail.com'
);


-- ============================================
-- QUERY 4: Upgrade to Pro tier
-- ============================================
-- Run this if user exists but not Pro

UPDATE profiles 
SET 
    subscription_tier = 'pro',
    ocr_engine = 'ocrspace',
    upload_limit = 100
WHERE id = (
    SELECT id FROM auth.users WHERE email = 'rehansanjay28@gmail.com'
);

-- Verify:
SELECT subscription_tier, ocr_engine, upload_limit
FROM profiles 
WHERE id = (SELECT id FROM auth.users WHERE email = 'rehansanjay28@gmail.com');


-- ============================================
-- QUERY 5: Check auth.users table
-- ============================================
-- Verify user exists and check auth details

SELECT 
    id,
    email,
    email_confirmed_at,
    created_at,
    updated_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data
FROM auth.users
WHERE email = 'rehansanjay28@gmail.com';

-- Check if:
-- - email_confirmed_at is NOT NULL (email verified)
-- - last_sign_in_at is recent


-- ============================================
-- QUERY 6: Test profile access (simulates Edge Function)
-- ============================================
-- This tests if the Edge Function can read your profile

SELECT 
    subscription_tier,
    ocr_engine,
    monthly_upload_count,
    upload_limit
FROM profiles
WHERE id = (SELECT id FROM auth.users WHERE email = 'rehansanjay28@gmail.com');

-- If this returns data: Database is fine
-- If this returns nothing: Profile doesn't exist
-- If this gives permission error: RLS is blocking


-- ============================================
-- QUERY 7: Check for any auth issues
-- ============================================
-- Look for banned or deleted users

SELECT 
    id,
    email,
    banned_until,
    deleted_at,
    is_sso_user,
    is_super_admin
FROM auth.users
WHERE email = 'rehansanjay28@gmail.com';

-- Check if:
-- - banned_until is NULL (not banned)
-- - deleted_at is NULL (not deleted)


-- ============================================
-- QUERY 8: Reset upload count (optional)
-- ============================================
-- If you want to reset your upload count for testing

UPDATE profiles
SET monthly_upload_count = 0
WHERE id = (SELECT id FROM auth.users WHERE email = 'rehansanjay28@gmail.com');


-- ============================================
-- RESULTS TO SHARE
-- ============================================
-- After running these queries, share:
-- 1. Result of QUERY 1 (user and profile info)
-- 2. Result of QUERY 2 (RLS status)
-- 3. Result of QUERY 5 (auth details)
-- 4. Any errors you see

-- This will tell us exactly what's wrong!


-- ============================================
-- QUICK FIX (if everything looks good)
-- ============================================
-- If all queries show correct data but still 401,
-- the issue is the browser's auth token, not the database.
-- Solution: Clear browser storage and login again.
