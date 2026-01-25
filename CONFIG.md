# Configuration Instructions

## Quick Setup Checklist

Follow these steps to get ReceiptKeeper running:

### 1. Supabase Setup
- [ ] Create Supabase project at https://supabase.com
- [ ] Run database schema SQL (see SUPABASE_SETUP.md)
- [ ] Create storage buckets: `receipts` and `tax-packages`
- [ ] Add storage policies (see SUPABASE_SETUP.md)
- [ ] Save your Project URL and Anon Key

### 2. Update Configuration

Replace `YOUR_SUPABASE_URL` and `YOUR_SUPABASE_ANON_KEY` in these files:

- `public/js/auth.js` (lines 2-3)
- `public/js/upload.js` (lines 2-3)
- `public/js/dashboard.js` (lines 2-3)
- `public/login.html` (lines 38-39 in script tag)

### 3. Run the Application

```bash
# Install http-server globally (one-time)
npm install -g http-server

# Start the development server
npm run dev

# Or manually:
npx http-server public -p 8000
```

### 4. Test the Application

1. Open http://localhost:8000 in your browser
2. Sign up for a new account
3. Upload a test receipt
4. View the dashboard
5. Export receipts to CSV

## Important Notes

- **Email Confirmation**: By default, Supabase requires email confirmation. For development, disable this in Supabase Dashboard → Authentication → Settings → "Enable email confirmations" (turn OFF)
  
- **CORS Issues**: If you encounter CORS issues, make sure you're accessing via `localhost` not `127.0.0.1`

- **File Upload Limits**: Default Supabase storage limit is 50MB per file

## Production Deployment

For production deployment:

1. Deploy to Netlify, Vercel, or similar static hosting
2. Enable email confirmations in Supabase
3. Set up custom domain
4. Configure SMTP for email delivery
5. Add payment integration (Stripe) for subscriptions

## Environment Variables (Optional)

For better security in production, consider using environment variables:

```javascript
// Instead of hardcoding, use:
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
```

This requires using a build tool like Vite.
