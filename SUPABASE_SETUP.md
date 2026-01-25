# Supabase Setup Guide for ReceiptKeeper

Follow these steps to set up your Supabase backend for the ReceiptKeeper application.

## Step 1: Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up or log in
3. Click **"New Project"**
4. Enter the following:
   - **Name**: `receiptkeeper`
   - **Database Password**: Generate a strong password (save this!)
   - **Region**: Choose closest to US (e.g., `us-east-1`)
5. Click **"Create Project"** (takes 2-3 minutes)
6. **Save these credentials** (you'll need them later):
   - Project URL: `https://xxxxx.supabase.co`
   - Anon Key: `eyJhbGc...`
   - Service Role Key: `eyJhbGc...` (keep secret!)

## Step 2: Create Database Schema

1. In Supabase Dashboard, go to **SQL Editor**
2. Copy and paste the following SQL:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  business_name TEXT,
  subscription_status TEXT DEFAULT 'free' CHECK (subscription_status IN ('free', 'active', 'cancelled')),
  subscription_end TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create receipts table
CREATE TABLE receipts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  merchant_name TEXT,
  amount DECIMAL(10,2),
  receipt_date DATE,
  file_path TEXT,
  ocr_text TEXT,
  notes TEXT,
  is_business BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_receipts_user_id ON receipts(user_id);
CREATE INDEX idx_receipts_user_date ON receipts(user_id, receipt_date DESC);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE receipts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- RLS Policies for receipts
CREATE POLICY "Users can view own receipts"
  ON receipts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own receipts"
  ON receipts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own receipts"
  ON receipts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own receipts"
  ON receipts FOR DELETE
  USING (auth.uid() = user_id);

-- Function to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create profile
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

3. Click **"Run"** to execute the SQL

## Step 3: Setup Storage Buckets

### Create Receipts Bucket

1. Go to **Storage** in Supabase Dashboard
2. Click **"New bucket"**
3. Enter:
   - **Name**: `receipts`
   - **Public**: NO (keep private)
4. Click **"Create bucket"**

### Create Tax Packages Bucket

1. Click **"New bucket"** again
2. Enter:
   - **Name**: `tax-packages`
   - **Public**: NO (keep private)
3. Click **"Create bucket"**

## Step 4: Setup Storage Policies

1. Go to **Storage** → **Policies**
2. For the **receipts** bucket, add these policies:

```sql
-- Receipts bucket - users can upload to their own folder
CREATE POLICY "Users can upload own receipts"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'receipts' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can view own receipts"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'receipts' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete own receipts"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'receipts' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Tax packages bucket
CREATE POLICY "Users can view own packages"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'tax-packages' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Service can insert packages"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'tax-packages');
```

## Step 5: Update Application Configuration

Now update your application with the Supabase credentials:

### Files to Update

1. **`public/js/auth.js`** - Lines 2-3
2. **`public/js/upload.js`** - Lines 2-3
3. **`public/js/dashboard.js`** - Lines 2-3
4. **`public/login.html`** - Lines 38-39 (in the script tag)

Replace these placeholders:
```javascript
const SUPABASE_URL = 'YOUR_SUPABASE_URL'; // Replace with https://xxxxx.supabase.co
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY'; // Replace with your anon key
```

With your actual values:
```javascript
const SUPABASE_URL = 'https://xxxxx.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGc...';
```

## Step 6: Test Your Setup

1. Start a local web server:
   ```bash
   npx http-server public -p 8000
   ```

2. Open `http://localhost:8000` in your browser

3. Test the following:
   - Sign up with a new account
   - Log in
   - Upload a receipt
   - View receipts on dashboard
   - Export receipts to CSV

## Troubleshooting

### "Profile missing" error
- Make sure the trigger `on_auth_user_created` was created successfully
- Check that RLS policies allow INSERT on profiles table

### Upload errors
- Verify storage buckets were created
- Check storage policies are correctly set
- Ensure file paths match the expected format: `{user_id}/{filename}`

### Authentication issues
- Confirm email confirmation is disabled in Supabase Auth settings (for development)
- Check that Anon Key is correctly copied

## Next Steps

Once everything is working:
1. Set up email confirmation in Supabase Auth settings
2. Configure custom SMTP for email delivery
3. Add payment integration for subscriptions
4. Deploy to a hosting platform (Netlify, Vercel, etc.)

## Support

If you encounter issues:
- Check Supabase logs in the Dashboard
- Review browser console for errors
- Verify all SQL was executed successfully
