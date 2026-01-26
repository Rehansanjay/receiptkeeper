# Sign-Up Testing Checklist

## ✅ Keys Updated Successfully!

All files now have the correct Supabase anon key:
- ✅ `public/js/auth.js`
- ✅ `public/js/dashboard.js`
- ✅ `public/js/upload.js`
- ✅ `public/login.html`

## 🔍 What to Check in Supabase Dashboard

Before testing sign-up, verify these settings in your Supabase dashboard:

### 1. Email Confirmation (CRITICAL for testing)
**Location:** https://supabase.com/dashboard/project/hiscskqwlgavicihsote/auth/providers

- Go to **Authentication** → **Providers** → **Email**
- Find **"Confirm email"** setting
- **Turn it OFF** for testing (you can enable it later)
- This allows users to sign up without email verification

### 2. Database Tables
**Location:** https://supabase.com/dashboard/project/hiscskqwlgavicihsote/editor

Check that these tables exist:
- ✅ `profiles` table
- ✅ `receipts` table

### 3. Database Trigger (VERY IMPORTANT)
**Location:** https://supabase.com/dashboard/project/hiscskqwlgavicihsote/database/functions

Check that this function exists:
- ✅ `handle_new_user()` function

And this trigger exists:
- ✅ `on_auth_user_created` trigger

**If the trigger is missing, the profile won't be created automatically and sign-up will fail!**

To check/create the trigger, go to **SQL Editor** and run:
```sql
-- Check if trigger exists
SELECT * FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';

-- If it doesn't exist, create it:
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, business_name)
  VALUES (
    NEW.id, 
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'business_name'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### 4. Row Level Security (RLS) Policies
**Location:** https://supabase.com/dashboard/project/hiscskqwlgavicihsote/auth/policies

Check that the `profiles` table has these policies:
- ✅ "Users can view own profile" (SELECT)
- ✅ "Users can update own profile" (UPDATE)
- ✅ "Users can insert own profile" (INSERT)

## 🧪 Testing Sign-Up

### Step 1: Clear Browser Cache
1. Open your browser
2. Press **Ctrl + Shift + Delete**
3. Clear cache and cookies
4. Or use **Incognito/Private mode**

### Step 2: Test Sign-Up
1. Go to: http://localhost:8000/signup.html
2. Fill in the form:
   - Full Name: Test User
   - Email: test@example.com (use a unique email each time)
   - Password: test123456
   - Business Name: Test Business
3. Click "Create Account"

### Step 3: Check for Errors
Open browser console (F12) and look for:
- ✅ No red errors
- ✅ Success message appears
- ✅ Redirects to dashboard after 2 seconds

### Common Errors and Solutions

#### Error: "Email not confirmed"
**Solution:** Disable email confirmation in Supabase Auth settings

#### Error: "Profile missing" or 401 Unauthorized
**Solution:** The trigger isn't working. Check that `handle_new_user()` function and trigger exist

#### Error: "duplicate key value violates unique constraint"
**Solution:** You're trying to sign up with an email that already exists. Use a different email

#### Error: "Invalid API key"
**Solution:** Double-check the anon key is correct and starts with `eyJ`

#### Nothing happens / Form doesn't submit
**Solution:** 
1. Check browser console for JavaScript errors
2. Make sure Supabase JS library is loaded (check Network tab)
3. Verify the form ID is `signup-form`

## 🎯 Quick Test Command

To verify your Supabase connection is working, open browser console on the signup page and run:

```javascript
// Test connection
console.log('Supabase URL:', SUPABASE_URL);
console.log('Supabase Key (first 20 chars):', SUPABASE_ANON_KEY.substring(0, 20));

// Test auth
supabase.auth.getSession().then(({data, error}) => {
  console.log('Session check:', data, error);
});
```

## 📝 Next Steps After Successful Sign-Up

1. ✅ User should be redirected to `/dashboard.html`
2. ✅ Dashboard should show welcome message
3. ✅ User should be able to upload receipts
4. ✅ User should be able to log out and log back in

## 🆘 If Still Not Working

1. Check Supabase logs:
   - Go to: https://supabase.com/dashboard/project/hiscskqwlgavicihsote/logs/explorer
   - Look for auth errors or database errors

2. Share the exact error message from:
   - Browser console (F12)
   - Network tab (check the failed request)
   - Supabase logs

3. Verify the trigger is working by checking if a profile is created:
   - Go to: https://supabase.com/dashboard/project/hiscskqwlgavicihsote/editor
   - Open `profiles` table
   - Check if a new row appears after sign-up
