# 🚀 Supabase Setup Checklist for Reciptera

This document lists **ALL** the tasks you need to complete in your Supabase dashboard and backend to get your OCR subscription system fully working.

---

## ✅ Already Completed

- ✅ **Supabase CLI Installed** (using `npx supabase`)
- ✅ **Project Linked** (`hiscskqwlgavicihsote`)
- ✅ **OCR.space API Key Set** as secret (`OCR_SPACE_API_KEY`)
- ✅ **Edge Function Deployed** (`ocr-google`)

---

## 📋 Tasks You Need to Do in Supabase Dashboard

### **Task 1: Run Database Migrations**

You need to run the SQL migration files to set up your database schema.

**Steps:**

1. **Open Supabase Dashboard**: https://supabase.com/dashboard/project/hiscskqwlgavicihsote
2. **Go to SQL Editor** (left sidebar)
3. **Run these SQL files in order:**

#### **Migration 1: Subscription System** ⭐ MOST IMPORTANT

**File:** `d:\vsc\US Receipt\supabase\add_subscription_system.sql`

**What it does:**
- Adds subscription tier columns to `profiles` table
- Creates upload limit tracking
- Sets up automatic tier-based defaults
- Creates monthly reset function

**How to run:**
1. Open the file in your code editor
2. Copy the entire contents
3. Paste into Supabase SQL Editor
4. Click **"Run"**

**Expected result:** You should see a table with 5 users showing their subscription info.

---

#### **Migration 2: Currency Support** (Optional but recommended)

**File:** `d:\vsc\US Receipt\supabase\add_currency_support.sql`

**What it does:**
- Adds currency column (USD/INR support)
- Sets default to USD

**How to run:**
1. Copy contents of the file
2. Paste into Supabase SQL Editor
3. Click **"Run"**

---

#### **Migration 3: Tax Column** (If needed)

**File:** `d:\vsc\US Receipt\ADD_TAX_COLUMN.sql`

**What it does:**
- Adds tax amount tracking to receipts table

**How to run:**
1. Copy contents of the file
2. Paste into Supabase SQL Editor
3. Click **"Run"**

---

### **Task 2: Set Up Monthly Upload Reset Cron Job** ⭐ IMPORTANT

This automatically resets upload counts on the 1st of every month.

**Steps:**

1. **Go to Supabase Dashboard** → **Database** → **Cron Jobs**
2. **Click "Create a new cron job"**
3. **Configure:**
   - **Name:** `reset_monthly_uploads`
   - **Schedule:** `0 0 1 * *`
     - (Runs at midnight on the 1st of every month)
   - **SQL Command:**
     ```sql
     SELECT reset_monthly_uploads();
     ```
   - **Active:** ✅ Check this box
4. **Click "Create"**

**Verify it worked:**
- You should see the cron job listed as "Active"

---

### **Task 3: Verify Database Schema**

Check that all columns exist in your `profiles` table.

**Steps:**

1. **Go to SQL Editor**
2. **Run this query:**

```sql
SELECT 
  column_name, 
  data_type, 
  column_default
FROM information_schema.columns 
WHERE table_name = 'profiles'
ORDER BY column_name;
```

**Expected columns (you should see these):**
- `id` (uuid)
- `email` (text)
- `full_name` (text)
- `subscription_tier` (varchar) - DEFAULT 'free'
- `upload_limit` (integer) - DEFAULT 10
- `monthly_upload_count` (integer) - DEFAULT 0
- `last_reset_date` (timestamp)
- `ocr_engine` (varchar) - DEFAULT 'tesseract'
- `currency` (varchar) - DEFAULT 'USD'
- `trial_ends_at` (timestamp) - nullable
- `created_at` (timestamp)

**If any columns are missing**, run the corresponding migration file again.

---

### **Task 4: Test the Subscription System**

Verify everything works correctly.

**Test 1: Check Default Values**

```sql
SELECT 
  id,
  email,
  full_name,
  subscription_tier,
  upload_limit,
  monthly_upload_count,
  ocr_engine
FROM profiles
ORDER BY created_at DESC
LIMIT 5;
```

**Expected:** All users should have:
- `subscription_tier` = 'free'
- `upload_limit` = 10
- `monthly_upload_count` = 0
- `ocr_engine` = 'tesseract'

---

**Test 2: Test Tier Upgrade**

```sql
-- Upgrade a test user to Pro
UPDATE profiles 
SET subscription_tier = 'pro'
WHERE email = 'YOUR_TEST_EMAIL@example.com';

-- Check if limits updated automatically
SELECT 
  email,
  subscription_tier,
  upload_limit,
  ocr_engine
FROM profiles
WHERE email = 'YOUR_TEST_EMAIL@example.com';
```

**Expected result:**
- `subscription_tier` = 'pro'
- `upload_limit` = 100 (automatically updated!)
- `ocr_engine` = 'ocrspace' (automatically updated!)

---

**Test 3: Test Upload Counter**

```sql
-- Simulate an upload
UPDATE profiles 
SET monthly_upload_count = monthly_upload_count + 1
WHERE email = 'YOUR_TEST_EMAIL@example.com';

-- Check the count
SELECT 
  email,
  monthly_upload_count,
  upload_limit,
  (upload_limit - monthly_upload_count) AS remaining
FROM profiles
WHERE email = 'YOUR_TEST_EMAIL@example.com';
```

**Expected:** Count should increment by 1.

---

**Test 4: Test Monthly Reset Function**

```sql
-- Manually trigger the reset (for testing)
SELECT reset_monthly_uploads();

-- Verify all counts are now 0
SELECT 
  email,
  monthly_upload_count
FROM profiles
WHERE monthly_upload_count > 0;
```

**Expected:** Query should return 0 rows (all counts reset to 0).

---

### **Task 5: Check Row-Level Security (RLS) Policies**

Ensure users can only access their own data.

**Steps:**

1. **Go to** **Database** → **Tables** → **profiles**
2. **Click "Policies" tab**
3. **Verify these policies exist:**

   - ✅ **SELECT policy**: Users can read their own profile
   - ✅ **UPDATE policy**: Users can update their own profile
   - ✅ **INSERT policy**: New users can create their profile

**If policies are missing**, create them:

```sql
-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own profile
CREATE POLICY "Users can view own profile"
ON profiles FOR SELECT
USING (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
USING (auth.uid() = id);

-- Allow users to insert their own profile
CREATE POLICY "Users can insert own profile"
ON profiles FOR INSERT
WITH CHECK (auth.uid() = id);
```

---

### **Task 6: Verify Edge Function Deployment**

Check that your OCR function is live and accessible.

**Steps:**

1. **Go to** **Edge Functions** (left sidebar)
2. **You should see:** `ocr-google` function listed
3. **Status should be:** "Deployed" or "Active"
4. **Function URL:** `https://hiscskqwlgavicihsote.supabase.co/functions/v1/ocr-google`

**If not deployed**, run:
```powershell
npx supabase functions deploy ocr-google
```

---

### **Task 7: Check Secrets Configuration**

Verify your API key is set correctly.

**Steps:**

1. **Go to** **Project Settings** → **Edge Functions** → **Secrets**
2. **You should see:** `OCR_SPACE_API_KEY` listed

**Or check via CLI:**
```powershell
npx supabase secrets list
```

**Expected output:**
```
NAME              | DIGEST
OCR_SPACE_API_KEY | 0029b3...
```

---

## 🧪 End-to-End Testing

After completing all tasks above, test the complete flow:

### **Test Flow 1: Free User Upload**

1. **Create a test account** (or use existing)
2. **Upload a receipt image**
3. **Expected behavior:**
   - OCR uses Tesseract.js (client-side)
   - Upload count increments
   - After 10 uploads, user sees "upgrade" prompt

### **Test Flow 2: Pro User Upload**

1. **Upgrade test user to Pro:**
   ```sql
   UPDATE profiles 
   SET subscription_tier = 'pro'
   WHERE email = 'test@example.com';
   ```
2. **Upload a receipt image**
3. **Expected behavior:**
   - OCR uses OCR.space API (server-side via Edge Function)
   - Better accuracy than Tesseract
   - Upload count increments
   - Limit is 100 uploads/month

### **Test Flow 3: Limit Enforcement**

1. **Set user to limit:**
   ```sql
   UPDATE profiles 
   SET monthly_upload_count = 100
   WHERE email = 'test@example.com';
   ```
2. **Try to upload**
3. **Expected behavior:**
   - Upload blocked
   - User sees "limit reached" message
   - Prompted to upgrade or wait for monthly reset

---

## 📊 Monitoring & Maintenance

### **Check API Usage**

Monitor your OCR.space API usage:

1. **Check OCR.space dashboard** (if they provide one)
2. **Free tier limit:** 500 requests/day
3. **Monitor in Supabase:**
   ```sql
   SELECT 
     subscription_tier,
     COUNT(*) as user_count,
     SUM(monthly_upload_count) as total_uploads
   FROM profiles
   GROUP BY subscription_tier;
   ```

### **Monthly Tasks**

- ✅ Verify cron job ran successfully (check on 1st of each month)
- ✅ Review API usage and costs
- ✅ Check for any failed uploads or errors

---

## 🔧 Troubleshooting

### **Issue: Columns don't exist**

**Solution:** Run the migration SQL files in Supabase SQL Editor.

### **Issue: Edge Function returns 500 error**

**Solution:** 
1. Check secrets are set: `npx supabase secrets list`
2. Check function logs in Supabase Dashboard → Edge Functions → Logs

### **Issue: Upload counts not resetting**

**Solution:**
1. Verify cron job is active in Database → Cron Jobs
2. Manually run: `SELECT reset_monthly_uploads();`

### **Issue: Users can't upload**

**Solution:**
1. Check RLS policies on `profiles` table
2. Verify user is authenticated
3. Check browser console for errors

---

## ✅ Final Checklist

Before going live, ensure:

- [ ] All SQL migrations run successfully
- [ ] Cron job for monthly reset is active
- [ ] Edge Function is deployed and working
- [ ] OCR.space API key is set as secret
- [ ] RLS policies are configured
- [ ] Test uploads work for all tiers (free, pro, premium)
- [ ] Upload limits are enforced correctly
- [ ] Monthly reset function works

---

## 🎯 Summary

**What you need to do RIGHT NOW:**

1. **Open Supabase Dashboard**: https://supabase.com/dashboard/project/hiscskqwlgavicihsote
2. **Go to SQL Editor**
3. **Run** `add_subscription_system.sql` (copy/paste and click Run)
4. **Go to Database → Cron Jobs**
5. **Create cron job** for `reset_monthly_uploads()`
6. **Test** by running the verification queries

**That's it!** Your backend will be fully configured.

---

**Need help?** If any step fails, check the Troubleshooting section or let me know which specific error you're seeing.
