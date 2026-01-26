# 🔧 IMMEDIATE DEBUGGING STEPS

## I've created a diagnostic tool for you!

### Step 1: Open the Diagnostic Tool
Go to: **http://localhost:8000/test-supabase.html**

This will show you:
- ✅ Whether Supabase is configured correctly
- ✅ If the connection works
- ✅ Detailed error messages when you try to sign up
- ✅ Database table status
- ✅ Real-time console logs

### Step 2: Run the Tests

1. **Configuration Check** - Runs automatically when page loads
   - Shows if Supabase library loaded
   - Validates URL and anon key format

2. **Connection Test** - Click "Test Connection"
   - Verifies you can reach Supabase

3. **Sign-Up Test** - Fill in the form and click "Test Sign-Up"
   - Enter any email (it will auto-generate a unique one)
   - Password: test123456 (already filled)
   - This will show you the EXACT error

4. **Database Check** - Click "Check Tables & Policies"
   - Verifies profiles and receipts tables exist

### Step 3: Share the Results

After running the tests, tell me:
1. What errors show up (they'll be in RED)
2. What the console logs say (bottom section)
3. Screenshot or copy the error messages

---

## Most Common Issues & Quick Fixes:

### ❌ "Email confirmation required"
**Fix:** Go to Supabase Dashboard → Auth → Providers → Email → Turn OFF "Confirm email"

### ❌ "Profiles table does not exist" 
**Fix:** Run the SQL from `SUPABASE_SETUP.md` in Supabase SQL Editor

### ❌ "Invalid API key" or "401 Unauthorized"
**Fix:** Double-check the anon key in Supabase Dashboard → Settings → API

### ❌ "Trigger function does not exist"
**Fix:** Run the SQL from `fix_trigger.sql` in Supabase SQL Editor

### ❌ "User already registered"
**Fix:** Use a different email or delete the user from Supabase Dashboard → Auth → Users

---

## Quick Checklist:

Before testing, make sure you've done these:

- [ ] Updated all 4 files with correct anon key (DONE ✅)
- [ ] Disabled email confirmation in Supabase
- [ ] Created database tables (profiles, receipts)
- [ ] Created the trigger function (handle_new_user)
- [ ] Set up RLS policies

---

## 🎯 Action Plan:

1. Open http://localhost:8000/test-supabase.html
2. Click all the test buttons
3. Look for RED error messages
4. Tell me what the error says
5. I'll give you the exact fix!

The diagnostic tool will tell us EXACTLY what's wrong! 🚀
