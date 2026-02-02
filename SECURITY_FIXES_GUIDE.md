# 🔧 Critical Security Fixes - Implementation Guide

**Priority:** HIGH  
**Time Required:** 15-20 minutes  
**Status:** Ready to implement

---

## 📋 Overview

Based on the security audit, there are **3 critical fixes** that need to be implemented before going to production:

1. ✅ **CORS Configuration** - Already added TODO comment (needs your domain)
2. ✅ **XSS Prevention** - Already fixed in dashboard.js
3. ⚠️ **RLS Policies** - Needs to be run in Supabase

---

## 🚀 Implementation Steps

### ✅ Fix 1: CORS Configuration (COMPLETED with TODO)

**Status:** Code updated, needs your domain before deployment

**File:** `supabase/functions/ocr-google/index.ts`

**What was changed:**
- Added TODO comment to remind you to update CORS before production
- Added security explanation

**What you need to do:**

1. **When you have your production domain**, edit line 8 in `supabase/functions/ocr-google/index.ts`:

```typescript
// BEFORE (current - OK for development)
'Access-Control-Allow-Origin': '*',

// AFTER (for production - replace with YOUR domain)
'Access-Control-Allow-Origin': 'https://reciptera.com',  // Replace with your actual domain
```

2. **Redeploy the Edge Function:**
```powershell
npx supabase functions deploy ocr-google
```

**Why this matters:** Prevents unauthorized websites from calling your OCR API.

---

### ✅ Fix 2: XSS Prevention (COMPLETED)

**Status:** ✅ Fully implemented

**File:** `public/js/dashboard.js`

**What was fixed:**
- Escaped merchant names in receipt cards
- Escaped notes in receipt cards
- Escaped user input in alert dialogs
- Escaped merchant names in delete confirmation
- Escaped merchant names in success toast

**Changes made:**
```javascript
// BEFORE
<h3>${receipt.merchant_name}</h3>

// AFTER
<h3>${SecurityUtils.escapeHtml(receipt.merchant_name)}</h3>
```

**Why this matters:** Prevents malicious scripts from being injected through receipt data.

**Testing:**
1. Create a receipt with merchant name: `<script>alert('XSS')</script>`
2. View it on dashboard
3. Should display as text, not execute as script

---

### ⚠️ Fix 3: Enable Row-Level Security (ACTION REQUIRED)

**Status:** ⚠️ Needs to be run in Supabase

**File:** `supabase/enable_rls_policies.sql`

**Steps:**

1. **Open Supabase Dashboard:**
   - Go to: https://supabase.com/dashboard/project/hiscskqwlgavicihsote

2. **Navigate to SQL Editor:**
   - Click "SQL Editor" in the left sidebar

3. **Open the RLS policy file:**
   - Open `d:\vsc\US Receipt\supabase\enable_rls_policies.sql` in your code editor
   - Copy the entire contents

4. **Paste and run:**
   - Paste into Supabase SQL Editor
   - Click "Run"

5. **Verify success:**
   - Scroll to bottom of results
   - You should see:
     - `rls_enabled = true` for both tables
     - 3 policies for `profiles` table
     - 4 policies for `receipts` table

**What this does:**
- Enables Row-Level Security on `profiles` and `receipts` tables
- Creates policies so users can only access their own data
- Prevents data leaks even if someone bypasses the frontend

**Why this matters:** This is the most critical security fix. Without RLS, users could potentially access other users' data.

---

## ✅ Verification Checklist

After implementing all fixes, verify:

### **1. CORS (when you deploy to production)**
- [ ] Updated CORS origin to your actual domain
- [ ] Redeployed Edge Function
- [ ] Tested OCR upload still works
- [ ] Verified other domains cannot call your API

### **2. XSS Prevention**
- [ ] Created test receipt with HTML in merchant name
- [ ] Verified HTML is escaped (displays as text)
- [ ] Checked alert dialogs don't execute scripts
- [ ] Tested delete confirmation escapes properly

### **3. RLS Policies**
- [ ] Ran `enable_rls_policies.sql` in Supabase
- [ ] Verified RLS is enabled on both tables
- [ ] Confirmed all policies are created
- [ ] Tested: Can only see own receipts
- [ ] Tested: Cannot access other users' data

---

## 🧪 Testing Guide

### **Test 1: XSS Prevention**

1. **Upload a receipt** with this merchant name:
   ```
   <script>alert('XSS Test')</script>
   ```

2. **Go to dashboard**
   - Merchant name should display as text: `<script>alert('XSS Test')</script>`
   - Should NOT show an alert popup
   - ✅ PASS if text is displayed
   - ❌ FAIL if alert popup appears

### **Test 2: RLS Policies**

1. **Create two test accounts:**
   - User A: test1@example.com
   - User B: test2@example.com

2. **As User A:**
   - Upload 2 receipts
   - Note the receipt IDs

3. **As User B:**
   - Upload 1 receipt
   - Go to dashboard
   - Should see ONLY 1 receipt (User B's)
   - Should NOT see User A's receipts

4. **Try to access User A's receipt directly (advanced):**
   - Open browser console
   - Run:
     ```javascript
     const { data, error } = await supabase
       .from('receipts')
       .select('*')
       .eq('id', 'USER_A_RECEIPT_ID');
     console.log(data, error);
     ```
   - ✅ PASS if `data` is empty or null
   - ❌ FAIL if you can see User A's receipt

### **Test 3: Upload Limits**

1. **As a free user:**
   - Upload 10 receipts
   - Try to upload 11th receipt
   - Should see "limit reached" message

2. **Upgrade to Pro:**
   ```sql
   UPDATE profiles 
   SET subscription_tier = 'pro'
   WHERE email = 'your-email@example.com';
   ```

3. **Try uploading again:**
   - Should now work (limit is 100)
   - Should use OCR.space API (better accuracy)

---

## 📊 Security Status

### **Before Fixes:**
- 🔴 CORS: Allows all origins
- 🔴 XSS: User input not escaped
- 🔴 RLS: Not verified

### **After Fixes:**
- 🟡 CORS: TODO added (needs domain)
- 🟢 XSS: All user input escaped
- 🟡 RLS: SQL ready (needs to be run)

### **After Full Implementation:**
- 🟢 CORS: Restricted to your domain
- 🟢 XSS: All user input escaped
- 🟢 RLS: Enabled and tested

---

## 🚨 Important Notes

### **TypeScript Errors in index.ts**

You may see TypeScript errors in `supabase/functions/ocr-google/index.ts`:
- ❌ "Cannot find module 'https://deno.land/std@0.168.0/http/server.ts'"
- ❌ "Cannot find name 'Deno'"

**These are EXPECTED and SAFE to ignore:**
- These are Deno-specific types
- VS Code doesn't recognize Deno modules
- The code will work perfectly when deployed to Supabase Edge Functions
- Supabase uses Deno runtime, which has these types built-in

### **When to Deploy**

**Development/Testing:**
- CORS can stay as `'*'` (allows all origins)
- This makes testing easier

**Production:**
- MUST update CORS to your specific domain
- MUST enable RLS policies
- MUST test all security measures

---

## 📞 Next Steps

1. **Right now:**
   - [ ] Run `enable_rls_policies.sql` in Supabase SQL Editor
   - [ ] Test XSS prevention (create receipt with HTML)
   - [ ] Verify RLS works (try accessing other users' data)

2. **Before production:**
   - [ ] Update CORS origin to your domain
   - [ ] Redeploy Edge Function
   - [ ] Run all security tests
   - [ ] Review security audit report

3. **After deployment:**
   - [ ] Monitor for errors
   - [ ] Check Supabase logs
   - [ ] Verify OCR is working
   - [ ] Test upload limits

---

## ✅ Summary

**Completed:**
- ✅ XSS prevention implemented
- ✅ CORS TODO added
- ✅ RLS SQL script created

**Action Required:**
- ⚠️ Run RLS SQL in Supabase (15 minutes)
- ⚠️ Update CORS when you have domain (5 minutes)

**Total Time:** ~20 minutes to complete all fixes

---

**Questions?** Check the `SECURITY_AUDIT_REPORT.md` for detailed explanations of each fix.
