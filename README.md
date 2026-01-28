# Reciptera

A web application for managing business receipts and generating tax-ready packages.

## Features

- **Receipt Storage**: Upload receipts via photo or email forwarding
- **Automatic Organization**: Receipts organized by date and amount
- **Tax Export**: One-click export to PDF, CSV, and images
- **Secure Storage**: 7-year secure cloud storage
- **User Authentication**: Secure signup and login with Supabase

## Project Structure

```
reciptera/
├── public/
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   ├── auth.js
│   │   ├── upload.js
│   │   └── dashboard.js
│   ├── images/
│   ├── index.html
│   ├── signup.html
│   ├── login.html
│   ├── upload.html
│   └── dashboard.html
├── supabase/
│   └── functions/
├── .gitignore
└── README.md
```

## Setup Instructions

### 1. Install Dependencies

Make sure you have the following installed:
- Node.js (https://nodejs.org/)
- Git (https://git-scm.com/)
- Supabase CLI: `npm install -g supabase`

### 2. Create Supabase Project

1. Go to https://supabase.com
2. Sign up/log in and create a new project
3. Name it "reciptera"
4. Choose a database password and region (US-East recommended)
5. Save your Project URL and Anon Key

### 3. Configure Database

In your Supabase Dashboard → SQL Editor, run the database schema SQL to create:
- `profiles` table
- `receipts` table
- Row Level Security policies
- Storage buckets and policies

### 4. Update Configuration

Replace the placeholders in the following files with your Supabase credentials:
- `public/js/auth.js`: Update `SUPABASE_URL` and `SUPABASE_ANON_KEY`
- `public/login.html`: Update `SUPABASE_URL` and `SUPABASE_ANON_KEY`

### 5. Run Locally

You can use any local web server. For example:

```bash
# Using Python
python -m http.server 8000 --directory public

# Using Node.js http-server
npx http-server public -p 8000
```

Then open http://localhost:8000 in your browser.

## Usage

1. **Sign Up**: Create an account on the signup page
2. **Upload Receipts**: Use the upload page to add receipt photos
3. **View Dashboard**: See all your receipts organized by date
4. **Export**: Generate tax packages when needed

## Technology Stack

- **Frontend**: HTML, CSS, JavaScript
- **Backend**: Supabase (PostgreSQL, Authentication, Storage)
- **Hosting**: Can be deployed to Netlify, Vercel, or any static host

## Pricing

$99/year for unlimited receipt storage and tax package generation.

## License

All rights reserved © 2026 Reciptera
