# 🔍 Debug: Check Auth Token in Browser

## Run this in Browser Console (F12):

```javascript
// Check if auth token exists and is being sent
const { data: { session } } = await supabase.auth.getSession();

console.log('=== AUTH DEBUG ===');
console.log('Session exists:', !!session);
console.log('Access token:', session?.access_token?.substring(0, 50) + '...');
console.log('Token expires:', new Date(session?.expires_at * 1000));
console.log('User ID:', session?.user?.id);
console.log('User email:', session?.user?.email);

// Check if token is expired
const now = new Date();
const expiresAt = new Date(session?.expires_at * 1000);
console.log('Token expired?', now > expiresAt);

// Try to manually call the Edge Function
const formData = new FormData();
formData.append('image', new Blob(['test'], { type: 'image/png' }));

const response = await fetch('https://hiscskqwlgavicihsote.supabase.co/functions/v1/ocr-google', {
    method: 'POST',
    headers: {
        'Authorization': `Bearer ${session?.access_token}`
    },
    body: formData
});

console.log('Edge Function response:', response.status);
const result = await response.json();
console.log('Edge Function result:', result);
```

---

## 📊 What to Look For:

### **If "Session exists: false"**
- No session in browser
- Need to login again

### **If "Token expired? true"**
- Token is expired
- Run this to refresh:
```javascript
const { data, error } = await supabase.auth.refreshSession();
console.log('Refresh result:', data, error);
```

### **If Edge Function returns 401 with details:**
- Check `result.details` for exact error message
- This tells us WHY the Edge Function rejects it

---

## 🎯 Most Likely Issues:

1. **SUPABASE_ANON_KEY mismatch** - Edge Function has wrong anon key
2. **SUPABASE_URL mismatch** - Edge Function pointing to wrong project
3. **JWT secret mismatch** - Token signed with different secret

---

## ✅ Next Step:

**Run the JavaScript above in browser console and share:**
1. Session exists? (true/false)
2. Token expired? (true/false)
3. Edge Function response status
4. Edge Function result (especially `details` field)

This will tell us EXACTLY what's wrong! 🔍
