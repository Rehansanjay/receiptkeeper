# 🔧 SQL Fix - Explanation

## ❌ What Was Wrong

The original SQL tried to find the user by email in the `profiles` table:
```sql
UPDATE profiles 
SET subscription_tier = 'pro'
WHERE email = 'rehansanjay28@gmail.com';  -- ❌ profiles table has no email column
```

**Problem:** The `profiles` table doesn't have an `email` column!

---

## ✅ How It Works Now

### **Supabase Auth Structure:**

1. **`auth.users` table** - Managed by Supabase Auth
   - Contains: `id`, `email`, `encrypted_password`, etc.
   - You can't directly modify this table

2. **`profiles` table** - Your custom table
   - Contains: `id`, `subscription_tier`, `upload_limit`, `ocr_engine`, etc.
   - Links to `auth.users` via `id` column

### **The Fix:**

```sql
-- Step 1: Find user ID from auth.users by email
-- Step 2: Update profiles table using that ID

UPDATE profiles 
SET subscription_tier = 'pro'
WHERE id = (
    SELECT id 
    FROM auth.users 
    WHERE email = 'rehansanjay28@gmail.com'
);
```

**How it works:**
1. Subquery finds the user ID from `auth.users` table by email
2. Main query updates `profiles` table using that ID
3. Trigger automatically sets `upload_limit = 100` and `ocr_engine = 'ocrspace'`

---

## 📊 Verification Query

After the update, this query shows your upgraded profile:

```sql
SELECT 
    p.id,
    u.email,
    p.subscription_tier,
    p.upload_limit,
    p.monthly_upload_count,
    p.ocr_engine,
    p.created_at
FROM profiles p
JOIN auth.users u ON p.id = u.id
WHERE u.email = 'rehansanjay28@gmail.com';
```

**Expected output:**
```
email: rehansanjay28@gmail.com
subscription_tier: pro
upload_limit: 100
ocr_engine: ocrspace
```

---

## 🚀 Ready to Run!

The SQL script is now fixed. Just run it in Supabase SQL Editor and you'll be upgraded to Pro!
