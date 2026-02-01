# API Keys & Configuration Setup Guide

This comprehensive guide provides step-by-step instructions for configuring all required API keys and services for the tiered subscription system with OCR functionality.

---

## 📋 Prerequisites

Before you begin, ensure you have:

- ✅ **Google Account** with access to Google Cloud Platform
- ✅ **Credit/Debit Card** for Google Cloud billing (required, but 1,000 free requests/month)
- ✅ **Supabase Project** (Project ID: `hiscskqwlgavicihsote`)
- ✅ **Administrative Access** to your Supabase project
- ✅ **Command Line Access** (PowerShell on Windows)
- ✅ **~15-20 minutes** to complete all steps

---

## 🔑 Part 1: OCR.space API Setup

### Step 1.1: Sign Up for Free OCR.space API Key

> [!TIP]
> OCR.space provides **25,000 free requests per month** with **no credit card required**. This is 25x more than Google Vision's free tier!

1. Navigate to [OCR.space API Registration](https://ocr.space/ocrapi)
2. Scroll down to the **"Free OCR API"** section
3. Enter your **email address**
4. Click **"Register"** button
5. Check your email inbox for the API key
6. **Copy your API key** - it looks like: `K12345678901234`

> [!IMPORTANT]
> Keep your API key secure. Never commit it to version control or share it publicly.

### Step 1.2: Verify API Key (Optional but Recommended)

Test your API key to ensure it's working:

1. Open PowerShell
2. Run this test command (replace `YOUR_API_KEY` with your actual key):

```powershell
$headers = @{
    "apikey" = "YOUR_API_KEY"
}

Invoke-RestMethod -Uri "https://api.ocr.space/parse/imageurl?url=https://ocr.space/Content/Images/receipt-ocr-original.jpg" `
    -Method Get `
    -Headers $headers
```

**Expected output:**
```json
{
  "ParsedResults": [
    {
      "ParsedText": "...",
      "ErrorMessage": "",
      "FileParseExitCode": 1
    }
  ],
  "IsErroredOnProcessing": false
}
```

If you see `"IsErroredOnProcessing": false`, your API key is working correctly!

### Step 1.3: Understanding OCR.space Features

**What You Get (FREE):**
- ✅ **25,000 requests/month** (vs Google's 1,000)
- ✅ **No credit card required**
- ✅ **No billing setup needed**
- ✅ **Excellent accuracy** for printed receipts (90-95%)
- ✅ **Multiple image formats** (JPG, PNG, PDF, GIF)
- ✅ **Fast processing** (~2-3 seconds per receipt)

**API Limits:**
- Maximum file size: 1MB (perfect for receipts)
- Rate limit: 10 requests per second
- Supported languages: 24+ languages

**Comparison with Google Vision:**

| Feature | OCR.space (FREE) | Google Vision (FREE) |
|---------|------------------|----------------------|
| **Monthly Requests** | 25,000 | 1,000 |
| **Billing Required** | ❌ No | ✅ Yes |
| **Receipt Accuracy** | 90-95% | 95-98% |
| **Setup Time** | 2 minutes | 15-20 minutes |
| **Cost After Free Tier** | $0.0006/request | $0.0015/request |

---

## 🚀 Part 2: Supabase Configuration

### Step 2.1: Install Supabase CLI

**Option A: Using Scoop (Windows Package Manager)**
```powershell
scoop install supabase
```

**Option B: Direct Download**
1. Visit [Supabase CLI Releases](https://github.com/supabase/cli/releases)
2. Download the latest Windows installer
3. Run the installer and follow prompts
4. Restart your terminal after installation

**Verify Installation:**
```powershell
supabase --version
```
Expected output: `supabase version X.X.X`

### Step 2.2: Authenticate Supabase CLI

1. Run the login command:
```powershell
supabase login
```

2. Your default browser will open automatically
3. Click **"Authorize"** to grant CLI access
4. Return to your terminal - you should see: `Logged in successfully`

**Troubleshooting:** If browser doesn't open, copy the URL from terminal and paste it manually.

### Step 2.3: Link to Your Supabase Project

1. Navigate to your project directory:
```powershell
cd "d:\vsc\US Receipt"
```

2. Link to your Supabase project:
```powershell
supabase link --project-ref hiscskqwlgavicihsote
```

3. When prompted, enter your **database password** (from Supabase project settings)

**Expected output:**
```
Linked to project hiscskqwlgavicihsote
```

**Verify the link:**
```powershell
supabase projects list
```
You should see your project listed.

### Step 2.4: Create Edge Function Directory Structure

Run this command to create the necessary directory:
```powershell
New-Item -ItemType Directory -Force -Path "supabase\functions\ocr-google"
```

**Expected output:**
```
Directory: d:\vsc\US Receipt\supabase\functions

Mode                 LastWriteTime         Length Name
----                 -------------         ------ ----
d-----                                            ocr-google
```

### Step 2.5: Set OCR.space API Key as Supabase Secret

1. Set the secret (replace `YOUR_API_KEY` with your actual key from Step 1.1):
```powershell
supabase secrets set OCR_SPACE_API_KEY=K12345678901234
```

**Expected output:**
```
Setting secret OCR_SPACE_API_KEY...
Secret OCR_SPACE_API_KEY set successfully.
```

> [!TIP]
> Supabase secrets are encrypted and only accessible to your Edge Functions. They are never exposed to the frontend.

### Step 2.6: Verify Secret Configuration

```powershell
supabase secrets list
```

**Expected output:**
```
┌──────────────────────────┬────────────────────────────┐
│ NAME                     │ VALUE                      │
├──────────────────────────┼────────────────────────────┤
│ OCR_SPACE_API_KEY        │ ************************** │
└──────────────────────────┴────────────────────────────┘
```

---

## 📁 Part 3: Deploy Edge Function

### Step 3.1: Deploy the OCR Edge Function

1. Ensure you're in the project root directory:
```powershell
cd "d:\vsc\US Receipt"
```

2. Deploy the function:
```powershell
supabase functions deploy ocr-google
```

**Expected output:**
```
Deploying function ocr-google...
✓ Function ocr-google deployed successfully
Function URL: https://hiscskqwlgavicihsote.supabase.co/functions/v1/ocr-google
```

3. **Copy the Function URL** - you'll need it for testing

### Step 3.2: Test the Edge Function

**Method 1: Using PowerShell (Recommended)**

1. First, get your user authentication token:
   - Open your application in a browser
   - Open **Developer Tools** (F12)
   - Go to **Console** tab
   - Run this command:
   ```javascript
   const session = JSON.parse(localStorage.getItem('sb-hiscskqwlgavicihsote-auth-token'));
   console.log(session.access_token);
   ```
   - Copy the token that appears

2. Create a test PowerShell script `test-ocr.ps1`:
```powershell
# Replace with your actual JWT token
$token = "YOUR_JWT_TOKEN_HERE"

# Replace with path to a test receipt image
$imagePath = "path\to\test-receipt.jpg"

# Test the Edge Function
$headers = @{
    "Authorization" = "Bearer $token"
}

Invoke-RestMethod -Uri "https://hiscskqwlgavicihsote.supabase.co/functions/v1/ocr-google" `
    -Method Post `
    -Headers $headers `
    -Form @{
        image = Get-Item -Path $imagePath
    }
```

3. Run the test:
```powershell
.\test-ocr.ps1
```

**Expected successful response:**
```json
{
  "success": true,
  "merchant": "Example Store",
  "amount": "25.99",
  "date": "2026-01-31",
  "rawText": "Full OCR text..."
}
```

**Method 2: Using cURL (Alternative)**
```powershell
curl -X POST `
  "https://hiscskqwlgavicihsote.supabase.co/functions/v1/ocr-google" `
  -H "Authorization: Bearer YOUR_JWT_TOKEN" `
  -F "image=@test-receipt.jpg"
```

---

## 🔄 Part 4: Configure Monthly Upload Reset

### Step 4.1: Set Up Automated Cron Job (Recommended)

1. Open your **Supabase Dashboard**: https://supabase.com/dashboard/project/hiscskqwlgavicihsote
2. Navigate to **Database** → **Cron Jobs** (in left sidebar)
3. Click **"Create a new cron job"** button
4. Configure the cron job:
   - **Name:** `reset_monthly_uploads`
   - **Schedule:** `0 0 1 * *`
     - This runs at **00:00 (midnight) on the 1st day of every month**
   - **SQL Command:**
     ```sql
     SELECT reset_monthly_uploads();
     ```
   - **Active:** Ensure checkbox is checked
5. Click **"Create"** or **"Save"**

**Verify Cron Job:**
- You should see it listed in the Cron Jobs table
- Status should show as "Active"

### Step 4.2: Manual Reset (For Testing)

To manually reset upload counts (useful for testing):

1. Go to **Supabase Dashboard** → **SQL Editor**
2. Run this query:
```sql
SELECT reset_monthly_uploads();
```

3. Expected output:
```
reset_monthly_uploads
---------------------
(1 row)
```

4. Verify the reset worked:
```sql
SELECT email, monthly_upload_count 
FROM profiles 
WHERE monthly_upload_count > 0;
```

All counts should now be `0`.

---

## ✅ Part 5: Verification & Testing

### Step 5.1: Verify Database Schema

Run this query in **Supabase SQL Editor**:
```sql
SELECT 
  id, 
  email,
  full_name, 
  subscription_tier, 
  upload_limit, 
  monthly_upload_count,
  ocr_engine,
  trial_ends_at
FROM profiles 
ORDER BY created_at DESC
LIMIT 5;
```

**Expected output for new users:**
| email | subscription_tier | upload_limit | monthly_upload_count | ocr_engine | trial_ends_at |
|-------|-------------------|--------------|----------------------|------------|---------------|
| user@example.com | free | 10 | 0 | tesseract | NULL |

### Step 5.2: Test Subscription Tier Upgrade

1. **Upgrade a test user to Pro tier:**
```sql
UPDATE profiles 
SET subscription_tier = 'pro'
WHERE email = 'your-test-email@example.com';
```

2. **Verify automatic limit updates:**
```sql
SELECT 
  email,
  subscription_tier, 
  upload_limit, 
  ocr_engine,
  trial_ends_at
FROM profiles 
WHERE email = 'your-test-email@example.com';
```

**Expected output:**
| email | subscription_tier | upload_limit | ocr_engine | trial_ends_at |
|-------|-------------------|--------------|------------|---------------|
| your-test-email@example.com | pro | 100 | google-vision | NULL |

3. **Test Premium tier:**
```sql
UPDATE profiles 
SET subscription_tier = 'premium'
WHERE email = 'your-test-email@example.com';

SELECT subscription_tier, upload_limit, ocr_engine
FROM profiles 
WHERE email = 'your-test-email@example.com';
```

**Expected output:**
| subscription_tier | upload_limit | ocr_engine |
|-------------------|--------------|------------|
| premium | 300 | google-vision |

### Step 5.3: Test Upload Counter Increment

1. **Simulate an upload:**
```sql
UPDATE profiles 
SET monthly_upload_count = monthly_upload_count + 1
WHERE email = 'your-test-email@example.com';
```

2. **Verify the count increased:**
```sql
SELECT 
  email,
  monthly_upload_count,
  upload_limit,
  (upload_limit - monthly_upload_count) AS remaining_uploads
FROM profiles 
WHERE email = 'your-test-email@example.com';
```

**Expected output:**
| email | monthly_upload_count | upload_limit | remaining_uploads |
|-------|----------------------|--------------|-------------------|
| your-test-email@example.com | 1 | 100 | 99 |

### Step 5.4: Test Upload Limit Enforcement

1. **Set upload count to limit:**
```sql
UPDATE profiles 
SET monthly_upload_count = upload_limit
WHERE email = 'your-test-email@example.com';
```

2. **Verify limit is reached:**
```sql
SELECT 
  email,
  monthly_upload_count,
  upload_limit,
  CASE 
    WHEN monthly_upload_count >= upload_limit THEN 'LIMIT REACHED'
    ELSE 'OK'
  END AS status
FROM profiles 
WHERE email = 'your-test-email@example.com';
```

**Expected output:**
| email | monthly_upload_count | upload_limit | status |
|-------|----------------------|--------------|--------|
| your-test-email@example.com | 100 | 100 | LIMIT REACHED |

---

## 🎯 Configuration Checklist

After completing all steps, verify you have:

- ✅ **OCR.space Account** created (free tier)
- ✅ **OCR.space API Key** obtained via email
- ✅ **API Key** tested and verified working
- ✅ **Supabase CLI** installed and authenticated
- ✅ **Project Linked** to Supabase (`hiscskqwlgavicihsote`)
- ✅ **Secret Set** (`OCR_SPACE_API_KEY`)
- ✅ **Edge Function** deployed (`ocr-google`)
- ✅ **Edge Function** tested successfully
- ✅ **Database Migration** completed (subscription columns exist)
- ✅ **Cron Job** configured for monthly resets
- ✅ **Tier Upgrades** tested and working
- ✅ **Upload Counters** incrementing correctly

---

## 🚨 Troubleshooting Guide

### Issue: "API key not valid" Error

**Symptoms:** Edge function returns 403 or "Invalid API key" error

**Solutions:**
1. Verify API key is correct:
   - Check your email for the OCR.space API key
   - Ensure you copied the entire key (no extra spaces)
2. Confirm secret is set correctly:
   ```powershell
   supabase secrets list
   ```
3. Redeploy the Edge Function:
   ```powershell
   supabase functions deploy ocr-google
   ```

### Issue: "Rate limit exceeded" Error

**Symptoms:** API calls fail with rate limit error messages

**Solutions:**
1. OCR.space free tier has a limit of 10 requests per second
2. Check if you've exceeded the 25,000 monthly requests
3. Implement request throttling in your application
4. Consider upgrading to OCR.space paid tier if needed

### Issue: Edge Function Deployment Fails

**Symptoms:** `supabase functions deploy` command errors

**Solutions:**
1. Verify you're in the correct directory:
   ```powershell
   cd "d:\vsc\US Receipt"
   pwd  # Should show: d:\vsc\US Receipt
   ```
2. Check project is linked:
   ```powershell
   supabase projects list
   ```
3. Verify function directory exists:
   ```powershell
   Test-Path "supabase\functions\ocr-google"  # Should return True
   ```
4. Try deploying with no JWT verification (for testing):
   ```powershell
   supabase functions deploy ocr-google --no-verify-jwt
   ```
5. Check function code for syntax errors in `supabase/functions/ocr-google/index.ts`

### Issue: Database Migration Errors

**Symptoms:** Columns don't exist or migration SQL fails

**Solutions:**
1. Check if columns already exist:
   ```sql
   SELECT column_name, data_type 
   FROM information_schema.columns 
   WHERE table_name = 'profiles';
   ```
2. If columns exist, skip the `ALTER TABLE ADD COLUMN` statements
3. Run migration statements individually in SQL Editor
4. Check for typos in column names or data types

### Issue: Secrets Not Accessible in Edge Function

**Symptoms:** Edge function can't read `OCR_SPACE_API_KEY`

**Solutions:**
1. Verify secret is set:
   ```powershell
   supabase secrets list
   ```
2. In your Edge Function code, access it correctly:
   ```typescript
   const apiKey = Deno.env.get('OCR_SPACE_API_KEY');
   if (!apiKey) {
     throw new Error('OCR_SPACE_API_KEY not set');
   }
   ```
3. Redeploy after setting secrets:
   ```powershell
   supabase functions deploy ocr-google
   ```

### Issue: Cron Job Not Running

**Symptoms:** Upload counts don't reset on the 1st of the month

**Solutions:**
1. Verify cron job exists and is active in Supabase Dashboard
2. Check cron job schedule syntax: `0 0 1 * *`
3. Test the function manually:
   ```sql
   SELECT reset_monthly_uploads();
   ```
4. Check Supabase logs for cron execution errors

### Issue: JWT Token Expired or Invalid

**Symptoms:** API calls return 401 Unauthorized

**Solutions:**
1. Get a fresh JWT token from browser console
2. Ensure user is logged in before testing
3. Check token format (should be a long string starting with `eyJ`)
4. Verify token hasn't expired (default: 1 hour)

---

## 💰 Cost Monitoring & Optimization

### Setting Up Comprehensive Billing Alerts

1. **Google Cloud Console** → **Billing** → **Budgets & alerts**
2. Create a detailed budget:
   - **Budget name:** `Receipt OCR API Costs`
   - **Time range:** Monthly
   - **Projects:** `reciptera-ocr`
   - **Services:** Cloud Vision API (specific)
   - **Budget amount:** $10.00
3. Configure multiple alert thresholds:
   - **50%** ($5.00) - Warning
   - **75%** ($7.50) - Review usage
   - **90%** ($9.00) - Urgent review
   - **100%** ($10.00) - Limit reached
4. Add notification channels:
   - Your email address
   - (Optional) SMS alerts
   - (Optional) Slack webhook

### Monitoring API Usage

**View Real-Time Usage:**
1. Google Cloud Console → **APIs & Services** → **Dashboard**
2. Click **"Cloud Vision API"**
3. View metrics:
   - **Traffic** (requests per day)
   - **Errors** (failed requests)
   - **Latency** (response times)

**Set Up Usage Quotas (Optional):**
1. Go to **APIs & Services** → **Cloud Vision API** → **Quotas**
2. Set daily request limit (e.g., 5,000 requests/day)
3. This prevents unexpected cost spikes

### Cost Projections

**Scenario 1: Small User Base (50 users)**
- 10 Free users × 10 uploads = 100 requests (Tesseract, $0)
- 30 Pro users × 100 uploads = 3,000 requests
- 10 Premium users × 300 uploads = 3,000 requests
- **Total Google Vision requests:** 6,000/month
- **Cost:** (6,000 - 1,000 free) × $0.0015 = **$7.50/month**
- **Revenue:** (30 × $19) + (10 × $35) = **$920/month**
- **Profit margin:** 99.2%

**Scenario 2: Medium User Base (200 users)**
- 100 Free users × 10 uploads = 1,000 requests (Tesseract, $0)
- 80 Pro users × 100 uploads = 8,000 requests
- 20 Premium users × 300 uploads = 6,000 requests
- **Total Google Vision requests:** 14,000/month
- **Cost:** (14,000 - 1,000 free) × $0.0015 = **$19.50/month**
- **Revenue:** (80 × $19) + (20 × $35) = **$2,220/month**
- **Profit margin:** 99.1%

**Scenario 3: Large User Base (1,000 users)**
- 600 Free users × 10 uploads = 6,000 requests (Tesseract, $0)
- 300 Pro users × 100 uploads = 30,000 requests
- 100 Premium users × 300 uploads = 30,000 requests
- **Total Google Vision requests:** 60,000/month
- **Cost:** (60,000 - 1,000 free) × $0.0015 = **$88.50/month**
- **Revenue:** (300 × $19) + (100 × $35) = **$9,200/month**
- **Profit margin:** 99.0%

> [!TIP]
> The free tier (1,000 requests/month) effectively covers ~10 Pro users or ~3 Premium users at full usage, making your first paid users extremely profitable.

---

## 🔐 Security Best Practices

### 1. API Key Protection

- ✅ **DO:** Store API keys as Supabase secrets (encrypted at rest)
- ✅ **DO:** Restrict API keys to specific APIs (Cloud Vision only)
- ✅ **DO:** Use environment-specific keys (dev, staging, production)
- ❌ **DON'T:** Commit API keys to Git repositories
- ❌ **DON'T:** Expose API keys in frontend code
- ❌ **DON'T:** Share API keys via email or messaging apps

### 2. Access Control

- ✅ **DO:** Use Row-Level Security (RLS) policies on `profiles` table
- ✅ **DO:** Validate user authentication in Edge Functions
- ✅ **DO:** Implement rate limiting per user
- ❌ **DON'T:** Allow unauthenticated access to OCR endpoints
- ❌ **DON'T:** Trust client-side upload count validation

### 3. Additional Security Measures

**Add HTTP Referrer Restrictions (Optional):**
1. Google Cloud Console → APIs & Services → Credentials
2. Edit your API key
3. Under "Application restrictions":
   - Select "HTTP referrers"
   - Add: `https://yourdomain.com/*`
   - Add: `https://*.supabase.co/*` (for Edge Functions)

**Implement IP-Based Rate Limiting:**
```sql
-- Example: Track API calls per IP
CREATE TABLE IF NOT EXISTS api_rate_limits (
  ip_address TEXT PRIMARY KEY,
  request_count INTEGER DEFAULT 0,
  window_start TIMESTAMP DEFAULT NOW()
);
```

**Enable Audit Logging:**
```sql
-- Log all OCR requests for security auditing
CREATE TABLE IF NOT EXISTS ocr_audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  ocr_engine TEXT,
  timestamp TIMESTAMP DEFAULT NOW(),
  success BOOLEAN,
  error_message TEXT
);
```

### 4. Regular Security Reviews

- 📅 **Weekly:** Review API usage for anomalies
- 📅 **Monthly:** Audit user subscription tiers and upload counts
- 📅 **Quarterly:** Rotate API keys
- 📅 **Annually:** Review and update security policies

---

## 📞 Additional Resources

### Official Documentation
- **Google Vision API:** https://cloud.google.com/vision/docs
- **Supabase Edge Functions:** https://supabase.com/docs/guides/functions
- **Supabase Secrets Management:** https://supabase.com/docs/guides/functions/secrets
- **Supabase Cron Jobs:** https://supabase.com/docs/guides/database/extensions/pg_cron

### Pricing Information
- **Google Vision API Pricing:** https://cloud.google.com/vision/pricing
- **Supabase Pricing:** https://supabase.com/pricing

### Community Support
- **Supabase Discord:** https://discord.supabase.com
- **Google Cloud Community:** https://www.googlecloudcommunity.com

### Useful Tools
- **Test Receipt Images:** https://github.com/tesseract-ocr/tessdata (sample images)
- **JWT Decoder:** https://jwt.io (decode and inspect JWT tokens)
- **API Testing:** https://www.postman.com (alternative to cURL)

---

## 🎉 Next Steps

You've successfully configured all API keys and services! Here's what to do next:

1. **✅ Implement Frontend Integration**
   - Update `upload.js` to call the OCR Edge Function
   - Display upload limits and usage to users
   - Add upgrade prompts when limits are reached

2. **✅ Test End-to-End Flow**
   - Upload a receipt as a free user (Tesseract)
   - Upgrade to Pro and upload (Google Vision)
   - Verify upload counter increments
   - Test limit enforcement

3. **✅ Deploy to Production**
   - Test in staging environment first
   - Monitor initial API usage closely
   - Gather user feedback on OCR accuracy

4. **✅ Set Up Monitoring**
   - Configure Google Cloud alerts
   - Set up Supabase monitoring dashboards
   - Create error notification system

**You're all set! 🚀 Your tiered subscription system with OCR is ready to go.**
