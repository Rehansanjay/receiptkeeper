-- ============================================
-- SUBSCRIPTION SYSTEM DATABASE MIGRATION
-- ============================================
-- Run this in Supabase SQL Editor
-- This adds subscription tiers and upload tracking to your app

-- Step 1: Add subscription columns to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS subscription_tier VARCHAR(20) DEFAULT 'free',
ADD COLUMN IF NOT EXISTS monthly_upload_count INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS upload_limit INT DEFAULT 10,
ADD COLUMN IF NOT EXISTS last_reset_date TIMESTAMP DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS ocr_engine VARCHAR(20) DEFAULT 'tesseract';

-- Step 2: Add constraints to ensure valid values
ALTER TABLE profiles 
DROP CONSTRAINT IF EXISTS profiles_tier_check;

ALTER TABLE profiles 
ADD CONSTRAINT profiles_tier_check 
CHECK (subscription_tier IN ('free', 'pro', 'premium'));

ALTER TABLE profiles 
DROP CONSTRAINT IF EXISTS profiles_ocr_engine_check;

ALTER TABLE profiles 
ADD CONSTRAINT profiles_ocr_engine_check 
CHECK (ocr_engine IN ('tesseract', 'google-vision'));

-- Step 3: Create function to reset monthly upload counts
CREATE OR REPLACE FUNCTION reset_monthly_uploads()
RETURNS void AS $$
BEGIN
  UPDATE profiles
  SET 
    monthly_upload_count = 0,
    last_reset_date = NOW()
  WHERE 
    last_reset_date < DATE_TRUNC('month', NOW());
END;
$$ LANGUAGE plpgsql;

-- Step 4: Create function to set tier-based defaults
CREATE OR REPLACE FUNCTION set_subscription_defaults()
RETURNS TRIGGER AS $$
BEGIN
  -- Set upload limits and OCR engine based on tier
  IF NEW.subscription_tier = 'free' THEN
    NEW.upload_limit := 10;
    NEW.ocr_engine := 'tesseract';
  ELSIF NEW.subscription_tier = 'pro' THEN
    NEW.upload_limit := 100;
    NEW.ocr_engine := 'ocrspace';
  ELSIF NEW.subscription_tier = 'premium' THEN
    NEW.upload_limit := 300;
    NEW.ocr_engine := 'ocrspace';
  END IF;
  
  -- Reset monthly count if it's a new month
  IF NEW.last_reset_date IS NULL OR 
     DATE_TRUNC('month', NEW.last_reset_date) < DATE_TRUNC('month', CURRENT_DATE) THEN
    NEW.monthly_upload_count := 0;
    NEW.last_reset_date := CURRENT_DATE;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 5: Create trigger to apply defaults when tier changes
DROP TRIGGER IF EXISTS set_tier_defaults_trigger ON profiles;

CREATE TRIGGER set_tier_defaults_trigger
BEFORE INSERT OR UPDATE OF subscription_tier ON profiles
FOR EACH ROW
EXECUTE FUNCTION set_subscription_defaults();

-- Step 6: Update existing users to have proper defaults
UPDATE profiles 
SET 
  subscription_tier = 'free',
  monthly_upload_count = 0,
  upload_limit = 10,
  last_reset_date = NOW(),
  ocr_engine = 'tesseract'
WHERE subscription_tier IS NULL;

-- Step 7: Create index for faster tier lookups
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_tier 
ON profiles(subscription_tier);

-- Step 8: Verify the migration
SELECT 
  id, 
  full_name, 
  subscription_tier, 
  upload_limit, 
  monthly_upload_count,
  ocr_engine
FROM profiles 
LIMIT 5;

-- ============================================
-- EXPECTED OUTPUT:
-- All users should have:
-- - subscription_tier: 'free'
-- - upload_limit: 10
-- - monthly_upload_count: 0
-- - ocr_engine: 'tesseract'
-- ============================================

-- NOTES:
-- 1. This migration is safe to run multiple times (uses IF NOT EXISTS)
-- 2. All existing users default to free tier
-- 3. Monthly reset function needs to be called via cron job (see API_KEYS_SETUP.md)
-- 4. When users upgrade, the trigger automatically sets correct limits
