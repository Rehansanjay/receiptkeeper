-- Quick check: Is user actually Pro?
SELECT 
    u.email,
    u.id,
    p.subscription_tier,
    p.ocr_engine,
    p.upload_limit,
    p.monthly_upload_count
FROM auth.users u
LEFT JOIN profiles p ON p.id = u.id
WHERE u.email = 'rehansanjay28@gmail.com';

-- If no profile exists, this will show NULL for profile fields
-- If profile exists but not Pro, we'll see the current tier
