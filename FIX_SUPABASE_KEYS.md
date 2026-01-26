# Fix Supabase Keys - URGENT

## Problem
Your Supabase anon key is incorrect. You're using:
```
sb_publishable_Nwb-xnPerkXWXPTB_ClrbQ_sFEmqh22
```

This is NOT a valid Supabase anon key format.

## Solution

### Step 1: Get the Correct Anon Key

1. Go to: https://supabase.com/dashboard/project/hiscskqwlgavicihsote/settings/api
2. Look for the section "Project API keys"
3. Copy the **"anon public"** key (NOT the service_role key)
4. It should be a LONG JWT token starting with `eyJ` and be 200+ characters

### Step 2: Update These Files

Replace the `SUPABASE_ANON_KEY` value in ALL these files:

1. **public/js/auth.js** (line 3)
2. **public/js/dashboard.js** (line 3)
3. **public/js/upload.js** (line 3)
4. **public/login.html** (line 54)

### Example of what it should look like:

```javascript
const SUPABASE_URL = 'https://hiscskqwlgavicihsote.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhpc2Nza3F3bGdhdmljaWhzb3RlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDAwMDAwMDAsImV4cCI6MTkwMDAwMDAwMH0.XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX';
```

(This is just an example - use YOUR actual anon key from the dashboard)

### Step 3: Test

After updating all files:
1. Refresh your browser (hard refresh: Ctrl+Shift+R)
2. Try signing up again
3. Check the browser console for any errors

## Why This Matters

Without the correct anon key:
- Supabase client cannot authenticate
- All API calls will fail
- Sign up, login, and all database operations won't work

## Additional Check

While you're in the Supabase dashboard, also verify:
1. **Email confirmation is disabled** (for testing): 
   - Go to Authentication → Settings → Email Auth
   - Disable "Confirm email" for now
2. **Database tables exist**: 
   - Go to Database → Tables
   - Verify `profiles` and `receipts` tables exist
3. **RLS policies are set up**: 
   - Check that Row Level Security policies are in place
