-- =============================================
-- SEGMENT 3: Update the handle_new_user function
-- Run this THIRD
-- =============================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    full_name, 
    business_name, 
    subscription_status,
    trial_start_date, 
    trial_end_date,
    created_at
  )
  VALUES (
    NEW.id, 
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'business_name',
    'trial',
    NOW(),
    NOW() + INTERVAL '14 days',
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    business_name = EXCLUDED.business_name;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
