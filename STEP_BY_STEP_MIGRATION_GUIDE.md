# 🎯 Step-by-Step Database Migration Guide

Follow these exact steps to set up your database. I'll walk you through everything!

---

## 📝 **Step 1: Copy the SQL Migration Code**

First, let's copy the SQL code you need to run.

**Action:** Copy the entire code block below (click the copy button or select all and Ctrl+C):

```sql
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
CHECK (ocr_engine IN ('tesseract', 'ocrspace'));

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
```

✅ **Code copied!** Now let's go to Supabase.

---

## 🌐 **Step 2: Open Supabase Dashboard**

**Action:** Click this link or copy it to your browser:

👉 **https://supabase.com/dashboard/project/hiscskqwlgavicihsote**

**What you should see:**
- Your project name: **"reciptera"**
- Left sidebar with menu options
- Main dashboard area

---

## 🗄️ **Step 3: Navigate to SQL Editor**

**Action:** In the left sidebar, find and click on:

📝 **"SQL Editor"**

**What you should see:**
- A large text area for writing SQL
- A "Run" button (usually green or blue)
- Possibly some example queries or templates

---

## 📋 **Step 4: Paste the SQL Code**

**Action:** 

1. **Click inside the SQL text area** (the big empty box)
2. **Paste the code** you copied in Step 1 (Ctrl+V or right-click → Paste)
3. **Verify** you see all the SQL code (should be about 100+ lines)

**What you should see:**
- The SQL code starting with `-- ============================================`
- Multiple sections with comments like "Step 1:", "Step 2:", etc.
- Code ending with `LIMIT 5;`

---

## ▶️ **Step 5: Run the Migration**

**Action:** 

1. **Find the "Run" button** (usually in the top-right corner of the SQL editor)
2. **Click "Run"**
3. **Wait** for the query to execute (usually takes 2-5 seconds)

**What you should see:**
- A loading indicator or spinner
- Then a "Success" message or green checkmark

---

## ✅ **Step 6: Verify the Results**

After running, you should see a **results table** at the bottom showing your users:

**Expected output:**

| id | full_name | subscription_tier | upload_limit | monthly_upload_count | ocr_engine |
|----|-----------|-------------------|--------------|----------------------|------------|
| ... | User 1 | free | 10 | 0 | tesseract |
| ... | User 2 | free | 10 | 0 | tesseract |

**What this means:**
- ✅ All users now have subscription tiers
- ✅ Upload limits are set (10 for free users)
- ✅ Upload counters are initialized to 0
- ✅ OCR engine is set to Tesseract for free users

---

## 🎉 **Step 7: Celebrate!**

**If you see the table above, you're done with the database migration!** 🎊

The database now has:
- ✅ Subscription tier tracking
- ✅ Upload limit enforcement
- ✅ Monthly reset function
- ✅ Automatic tier-based defaults

---

## ⚠️ **Troubleshooting**

### **Error: "relation 'profiles' does not exist"**

**Solution:** Your profiles table doesn't exist yet. You need to create it first.

Run this SQL first:
```sql
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

Then run the main migration again.

---

### **Error: "column already exists"**

**Solution:** The migration has already been run! This is fine. The columns already exist.

To verify, run this query:
```sql
SELECT 
  id, 
  full_name, 
  subscription_tier, 
  upload_limit, 
  monthly_upload_count,
  ocr_engine
FROM profiles 
LIMIT 5;
```

If you see results, you're all set!

---

### **Error: "permission denied"**

**Solution:** You might not have admin access to the database.

1. Make sure you're logged in to the correct Supabase account
2. Verify you have owner/admin access to the project
3. Try refreshing the page and running again

---

## 📸 **Visual Guide**

Here's what each step should look like:

### **Step 3: SQL Editor Location**

Look for this in the left sidebar:
```
📊 Table Editor
📝 SQL Editor      ← Click here!
🔧 Database
📡 API
⚙️ Settings
```

### **Step 4: SQL Editor Interface**

```
┌─────────────────────────────────────────────┐
│  SQL Editor                    [Run] [Save] │
├─────────────────────────────────────────────┤
│                                             │
│  -- Paste your SQL code here               │
│                                             │
│                                             │
│                                             │
│                                             │
└─────────────────────────────────────────────┘
```

### **Step 6: Results Table**

After running, scroll down to see:
```
┌─────────────────────────────────────────────┐
│  Results (5 rows)                           │
├─────────────────────────────────────────────┤
│  id  | full_name | subscription_tier | ... │
│  ... | ...       | free              | ... │
└─────────────────────────────────────────────┘
```

---

## 🚀 **Next Step After This**

Once you've successfully run the migration, the next task is:

**Set up the Monthly Reset Cron Job**

I'll guide you through that next! But first, let me know:

**Did the migration run successfully? What did you see in the results?**

---

## 📞 **Need Help?**

If you get stuck at any step:

1. **Take a screenshot** of what you see
2. **Copy any error messages** exactly as they appear
3. **Tell me which step number** you're on

I'll help you troubleshoot!
