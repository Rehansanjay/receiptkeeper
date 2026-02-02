# 🔍 OCR Debugging Checklist

## 🚨 Common Reasons for OCR Failure

### **1. API Key Not Set**
- Check if `OCR_SPACE_API_KEY` secret exists in Supabase
- Verify the key is correct: `K82237350488957`

### **2. Edge Function Not Deployed**
- Edge function might not be deployed
- Or deployed with errors

### **3. CORS Issues**
- Frontend can't reach Edge Function
- CORS headers blocking request

### **4. User Not Upgraded to Pro**
- User still on Free tier
- Database trigger didn't fire

### **5. Network/Timeout Issues**
- OCR.space API timeout
- Supabase Edge Function timeout

---

## 🔧 Step-by-Step Debug Process

### **Step 1: Check User's Subscription Tier**

Run this in Supabase SQL Editor:
```sql
SELECT 
    u.email,
    p.subscription_tier,
    p.ocr_engine,
    p.upload_limit,
    p.monthly_upload_count
FROM profiles p
JOIN auth.users u ON p.id = u.id
WHERE u.email = 'rehansanjay28@gmail.com';
```

**Expected:**
- `subscription_tier`: `pro`
- `ocr_engine`: `ocrspace`
- `upload_limit`: `100`

**If NOT pro:** Run the upgrade script again!

---

### **Step 2: Check Edge Function Deployment**

```powershell
npx supabase functions list
```

**Expected:** Should show `ocr-google` function

**If not deployed:**
```powershell
npx supabase functions deploy ocr-google
```

---

### **Step 3: Check Edge Function Logs**

1. Go to Supabase Dashboard
2. Edge Functions → ocr-google → Logs
3. Look for errors when you try to upload

**Common errors:**
- `OCR_SPACE_API_KEY not configured` → Secret not set
- `Unauthorized` → User not authenticated
- `Timeout` → API taking too long

---

### **Step 4: Check API Key Secret**

```powershell
npx supabase secrets list
```

**Expected:** Should show `OCR_SPACE_API_KEY`

**If missing:**
```powershell
npx supabase secrets set OCR_SPACE_API_KEY=K82237350488957
```

---

### **Step 5: Test Edge Function Directly**

Open browser console and run:
```javascript
// Get your session token
const { data: { session } } = await supabase.auth.getSession();

// Test Edge Function
const response = await fetch(
    'https://hiscskqwlgavicihsote.supabase.co/functions/v1/ocr-google',
    {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${session.access_token}`,
        },
        body: formData // Your image file
    }
);

const result = await response.json();
console.log('Edge Function Response:', result);
```

---

### **Step 6: Check Browser Console**

When upload fails, open browser console (F12) and look for:
- Red error messages
- Network tab → Failed requests
- Console tab → Error logs

**Common issues:**
- `Failed to fetch` → CORS or network issue
- `401 Unauthorized` → Not logged in
- `403 Forbidden` → Not Pro tier
- `500 Internal Server Error` → Edge Function error

---

## 🛠️ Quick Fixes

### **Fix 1: Redeploy Edge Function**
```powershell
cd "d:\vsc\US Receipt"
npx supabase functions deploy ocr-google
```

### **Fix 2: Reset API Key**
```powershell
npx supabase secrets set OCR_SPACE_API_KEY=K82237350488957
npx supabase functions deploy ocr-google
```

### **Fix 3: Upgrade User Again**
```sql
UPDATE profiles 
SET subscription_tier = 'pro'
WHERE id = (SELECT id FROM auth.users WHERE email = 'rehansanjay28@gmail.com');
```

### **Fix 4: Clear Browser Cache**
- Hard refresh: Ctrl + Shift + R
- Or clear cache and reload

---

## 🎯 Most Likely Issues (In Order)

1. **Edge Function not deployed** (90% chance)
2. **API key secret not set** (5% chance)
3. **User not upgraded to Pro** (3% chance)
4. **CORS issue** (1% chance)
5. **OCR.space API down** (1% chance)

---

## 📊 Next Steps

1. ✅ Run Step 1 (Check user tier)
2. ✅ Run Step 2 (Check Edge Function)
3. ✅ Run Step 4 (Check API key)
4. ✅ Try upload again
5. ✅ Check browser console for errors

**Let's start with Step 1!**
