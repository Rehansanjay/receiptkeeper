-- ============================================
-- UPGRADE USER TO PRO TIER
-- ============================================
-- This upgrades rehansanjay28@gmail.com to Pro tier for testing

-- Step 1: Find the user ID from auth.users
-- (Email is stored in auth.users, not profiles)

-- Upgrade to Pro tier using a subquery to get the user ID
UPDATE profiles 
SET subscription_tier = 'pro'
WHERE id = (
    SELECT id 
    FROM auth.users 
    WHERE email = 'rehansanjay28@gmail.com'
);

-- Step 2: Verify the upgrade
-- This will show your profile with updated tier
SELECT 
    p.id,
    u.email,
    p.subscription_tier,
    p.upload_limit,
    p.monthly_upload_count,
    p.ocr_engine,
    p.created_at
FROM profiles p
JOIN auth.users u ON p.id = u.id
WHERE u.email = 'rehansanjay28@gmail.com';

-- Expected output:
-- email: rehansanjay28@gmail.com
-- subscription_tier: pro
-- upload_limit: 100 (automatically updated by trigger)
-- monthly_upload_count: 0 (or current count)
-- ocr_engine: ocrspace (automatically updated by trigger)

-- ============================================
-- WHAT THIS DOES
-- ============================================

-- When you upgrade to Pro tier, the database trigger automatically:
-- 1. Sets upload_limit to 100 (from 10)
-- 2. Changes ocr_engine to 'ocrspace' (from 'tesseract')
-- 3. Keeps your existing receipts and upload count

-- Now when you upload a receipt:
-- ✅ You'll use OCR.space API (better accuracy)
-- ✅ You can upload up to 100 receipts per month
-- ✅ You'll see the difference in OCR quality

-- ============================================
-- SUCCESS!
-- ============================================

-- Run this script in Supabase SQL Editor
-- Then try uploading a receipt to test OCR.space!

