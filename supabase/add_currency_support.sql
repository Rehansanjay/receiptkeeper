-- Add currency support to Reciptera
-- Run this in Supabase SQL Editor

-- Step 1: Add currency column to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS currency VARCHAR(3) DEFAULT 'USD';

-- Step 2: Add constraint to only allow USD or INR
ALTER TABLE profiles 
DROP CONSTRAINT IF EXISTS profiles_currency_check;

ALTER TABLE profiles 
ADD CONSTRAINT profiles_currency_check 
CHECK (currency IN ('USD', 'INR'));

-- Step 3: Update existing users to USD (default)
UPDATE profiles 
SET currency = 'USD' 
WHERE currency IS NULL;

-- Step 4: Verify the changes
SELECT id, full_name, currency 
FROM profiles 
LIMIT 5;
