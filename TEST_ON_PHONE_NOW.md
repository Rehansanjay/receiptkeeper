# 📱 Test Camera on Your Phone RIGHT NOW!

## 🎯 Your PC's IP Address: `192.168.1.5`

---

## ✅ Quick Steps (2 Minutes)

### **Step 1: On Your Phone**
1. Make sure your phone is connected to the **SAME WiFi** as your PC
2. Open your phone's browser (Chrome or Safari)
3. Type this URL:
   ```
   http://192.168.1.5:8000/upload.html
   ```

### **Step 2: Login**
- Email: `rehansanjay28@gmail.com`
- Password: (your password)

### **Step 3: Test Camera**
1. Tap "📷 Take Photo" button
2. Your phone's camera app should open!
3. Take a photo of a receipt
4. Watch the OCR process it

---

## 📸 What You'll See

### **On Desktop (PC):**
- "📷 Take Photo" → Opens file explorer ✅ (This is normal!)

### **On Mobile (Phone):**
- "📷 Take Photo" → Opens camera app ✅ (This is what you want!)

**The SAME button works differently on different devices!**

---

## 🔧 If It Doesn't Work

### **Can't access from phone?**

**Option 1: Allow firewall (Run as Administrator):**
```powershell
New-NetFirewallRule -DisplayName "HTTP Server 8000" -Direction Inbound -LocalPort 8000 -Protocol TCP -Action Allow
```

**Option 2: Temporarily disable Windows Firewall:**
1. Windows Security → Firewall & network protection
2. Turn off for Private network (temporarily)
3. Test on phone
4. Turn back on after testing

---

## 🚀 For Production Deployment

Once you're ready to make it live for everyone:

### **Easiest: Vercel (Free)**
```powershell
npm install -g vercel
cd "d:\vsc\US Receipt"
vercel
```

You'll get a URL like: `https://reciptera.vercel.app`

Then update CORS in your Edge Function and redeploy.

---

## 🎉 Try It Now!

**On your phone, go to:**
```
http://192.168.1.5:8000/upload.html
```

**Tap "📷 Take Photo" and watch the magic happen!** ✨
