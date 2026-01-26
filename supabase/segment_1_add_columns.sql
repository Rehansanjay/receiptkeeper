-- =============================================
-- SEGMENT 1: Add trial columns to profiles table
-- Run this FIRST
-- =============================================

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS trial_start_date TIMESTAMP DEFAULT NOW();

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS trial_end_date TIMESTAMP DEFAULT (NOW() + INTERVAL '14 days');
