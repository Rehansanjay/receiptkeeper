# Trial Flow Implementation Guide

## Overview
This document explains how the 14-day free trial flow works in ReceiptKeeper.

## User Flow

1. **Landing Page** → User clicks "Start Free 14-Day Trial"
2. **Signup Page** → User creates account
3. **Immediate Access** → User is redirected to dashboard (no email confirmation required)
4. **Trial Banner** → Dashboard shows "X days left in your trial"
5. **After 14 Days** → Show upgrade prompt (user can still access, just sees upgrade CTA)

## Database Schema Changes

Run this SQL in Supabase SQL Editor to add trial fields:

```sql
-- Add trial fields to profiles table (if not already present)
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS trial_start_date TIMESTAMP DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS trial_end_date TIMESTAMP DEFAULT (NOW() + INTERVAL '14 days'),
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'trial' 
  CHECK (subscription_status IN ('trial', 'active', 'expired', 'cancelled'));

-- Update the handle_new_user function to include trial dates
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, business_name, trial_start_date, trial_end_date, subscription_status)
  VALUES (
    NEW.id, 
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'business_name',
    NOW(),
    NOW() + INTERVAL '14 days',
    'trial'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## Supabase Auth Settings

To enable instant signup without email confirmation:

1. Go to Supabase Dashboard → Authentication → Providers → Email
2. Turn OFF "Confirm email" for testing
3. For production, you can enable it later with a custom flow

## Key Files

- `/public/signup.html` - Main signup page with trial flow
- `/public/dashboard-new.html` - Dashboard with trial banner
- `/public/js/config.js` - Shared Supabase configuration

## Trial Status Logic

```javascript
function getTrialStatus(profile) {
  const now = new Date();
  const trialEnd = new Date(profile.trial_end_date);
  const daysLeft = Math.ceil((trialEnd - now) / (1000 * 60 * 60 * 24));
  
  if (profile.subscription_status === 'active') {
    return { status: 'active', message: 'You have an active subscription' };
  }
  
  if (daysLeft > 0) {
    return { status: 'trial', message: `${daysLeft} days left in your trial`, daysLeft };
  }
  
  return { status: 'expired', message: 'Your trial has expired' };
}
```

## Testing the Flow

1. Start the dev server: `npm run dev`
2. Go to the landing page
3. Click "Start Free 14-Day Trial"
4. Fill in signup form
5. Should immediately redirect to dashboard
6. Dashboard should show trial banner with 14 days remaining
