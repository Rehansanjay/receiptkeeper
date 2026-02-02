# 🔍 Next Step: Run QUERY 1

## ✅ What We Know So Far:

From your screenshot (QUERY 7 results):
- ✅ User exists: `fc14ae59-f31d-4774-917d-4bb7d7168a63`
- ✅ Email: `rehansanjay28@gmail.com`
- ✅ NOT banned (`banned_until` is NULL)
- ✅ NOT deleted (`deleted_at` is NULL)
- ✅ Regular user (not SSO)

**This is good! Your auth.users record is fine.**

---

## 🎯 Now Run QUERY 1:

**Copy and paste this into Supabase SQL Editor:**

```sql
SELECT 
    u.id as user_id,
    u.email,
    u.created_at as user_created,
    p.id as profile_id,
    p.subscription_tier,
    p.ocr_engine,
    p.upload_limit,
    p.monthly_upload_count,
    p.created_at as profile_created
FROM auth.users u
LEFT JOIN profiles p ON p.id = u.id
WHERE u.email = 'rehansanjay28@gmail.com';
```

---

## 📊 What to Look For:

### **Scenario 1: Profile Exists**
If you see:
- `profile_id`: `fc14ae59-f31d-4774-917d-4bb7d7168a63`
- `subscription_tier`: `pro`
- `ocr_engine`: `ocrspace`
- `upload_limit`: `100`

**Then:** Database is perfect! Issue is browser token. Clear storage and login again.

### **Scenario 2: Profile Missing**
If you see:
- `profile_id`: NULL
- `subscription_tier`: NULL
- `ocr_engine`: NULL

**Then:** Profile doesn't exist! Run QUERY 3 to create it.

### **Scenario 3: Profile Exists But Wrong Tier**
If you see:
- `profile_id`: `fc14ae59-f31d-4774-917d-4bb7d7168a63`
- `subscription_tier`: `free` (not `pro`)
- `ocr_engine`: `tesseract` (not `ocrspace`)

**Then:** Profile exists but not upgraded. Run QUERY 4 to upgrade.

---

## 🚀 Quick Reference:

**If profile missing (Scenario 2), run:**
```sql
INSERT INTO profiles (
    id, 
    subscription_tier, 
    ocr_engine, 
    upload_limit,
    monthly_upload_count
)
VALUES (
    'fc14ae59-f31d-4774-917d-4bb7d7168a63',
    'pro',
    'ocrspace',
    100,
    0
);
```

**If profile exists but wrong tier (Scenario 3), run:**
```sql
UPDATE profiles 
SET 
    subscription_tier = 'pro',
    ocr_engine = 'ocrspace',
    upload_limit = 100
WHERE id = 'fc14ae59-f31d-4774-917d-4bb7d7168a63';
```

---

## 📸 Share Results:

After running QUERY 1, take a screenshot and share it!

This will tell us EXACTLY what's wrong! 🔍
