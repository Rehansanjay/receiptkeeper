# 🧪 OCR QUICK TEST GUIDE

**Test URL:** http://localhost:8000/upload.html

---

## ✅ Test Scenario 1: Clear Receipt (Best Case)

### **What to Test:**
Upload a clear, printed receipt (Starbucks, McDonald's, Walmart, etc.)

### **Expected Flow:**
```
1. Click "Upload Receipt" or drag & drop
2. Select receipt image
3. See loading indicator:
   "🔍 Reading Receipt..."
   Progress bar: 0% → 100%
4. Wait 3-5 seconds
5. Form appears with auto-filled data:
   ✅ Merchant: "Starbucks" (with 🤖 badge)
   ✅ Amount: "15.50" (with 🤖 badge)
   ✅ Date: "2026-01-28" (with 🤖 badge)
6. Review data (edit if needed)
7. Click "Save Receipt"
```

### **Success Criteria:**
- ✅ Loading indicator shows
- ✅ Progress bar updates smoothly
- ✅ At least 2 out of 3 fields auto-filled
- ✅ Auto-filled fields have 🤖 badge
- ✅ Data is reasonably accurate

---

## ⚠️ Test Scenario 2: Blurry Receipt (Medium Case)

### **What to Test:**
Upload a slightly blurry or low-quality receipt

### **Expected Flow:**
```
1. Upload blurry receipt
2. Loading indicator shows
3. Wait 5-8 seconds (slower)
4. Some fields auto-filled:
   ✅ Merchant: May be partially correct
   ⚠️ Amount: May need correction
   ⚠️ Date: May be incorrect
5. Edit incorrect fields
6. Save receipt
```

### **Success Criteria:**
- ✅ OCR completes without errors
- ✅ At least 1 field auto-filled
- ✅ User can edit all fields
- ✅ No crashes or freezes

---

## ❌ Test Scenario 3: Handwritten Receipt (Worst Case)

### **What to Test:**
Upload a handwritten receipt

### **Expected Flow:**
```
1. Upload handwritten receipt
2. Loading indicator shows
3. Wait 8-10 seconds
4. Low accuracy:
   ⚠️ Merchant: May be gibberish
   ⚠️ Amount: Likely incorrect
   ⚠️ Date: Likely incorrect
5. Clear all fields and enter manually
6. Save receipt
```

### **Success Criteria:**
- ✅ OCR completes (doesn't crash)
- ✅ User can clear and edit fields
- ✅ Manual entry still works
- ✅ Graceful degradation

---

## 🎯 Test Scenario 4: Multiple Receipts

### **What to Test:**
Upload multiple receipt images at once

### **Expected Flow:**
```
1. Select 3 receipt images
2. OCR processes first image only
3. Form shows auto-filled data from first receipt
4. User can see all 3 images in preview
5. Save all receipts with same metadata
```

### **Success Criteria:**
- ✅ First image processed with OCR
- ✅ All images uploaded
- ✅ No errors or crashes

---

## 📱 Test Scenario 5: Mobile Upload

### **What to Test:**
Use phone to take photo and upload

### **Expected Flow:**
```
1. Open upload page on phone
2. Click upload area
3. Choose "Take Photo"
4. Take photo of receipt
5. OCR processes image
6. Review auto-filled data
7. Save receipt
```

### **Success Criteria:**
- ✅ Camera opens on mobile
- ✅ Photo uploads successfully
- ✅ OCR works on mobile
- ✅ UI is mobile-friendly

---

## 🔍 What to Check

### **Visual Indicators:**
- [ ] Loading spinner appears
- [ ] Progress bar animates smoothly
- [ ] Progress percentage updates (10% → 100%)
- [ ] Status text changes:
  - "Initializing OCR engine..."
  - "Reading receipt... 50%"
  - "Extracting data..."
  - "✅ Receipt data extracted!"
- [ ] Auto-filled fields have 🤖 badge
- [ ] Success message is green
- [ ] Error message is red (if OCR fails)

### **Functionality:**
- [ ] OCR starts automatically after upload
- [ ] Form appears after OCR completes
- [ ] Auto-filled data is editable
- [ ] Manual entry still works
- [ ] Can clear auto-filled data
- [ ] Can upload without OCR (if image fails)
- [ ] Save button works
- [ ] Redirects to dashboard after save

### **Performance:**
- [ ] OCR completes in 3-8 seconds
- [ ] No browser freezing
- [ ] Progress bar is smooth
- [ ] No console errors (check F12)

---

## 🐛 Common Issues & Solutions

### **Issue 1: OCR Takes Too Long**
**Symptom:** Loading for 30+ seconds  
**Cause:** Large image file  
**Solution:** Resize image before upload (future enhancement)

### **Issue 2: No Data Extracted**
**Symptom:** All fields empty after OCR  
**Cause:** Poor image quality or non-receipt image  
**Solution:** User enters data manually (fallback works)

### **Issue 3: Wrong Data Extracted**
**Symptom:** Merchant name is gibberish  
**Cause:** OCR misread text  
**Solution:** User edits fields (editable)

### **Issue 4: OCR Doesn't Start**
**Symptom:** No loading indicator  
**Cause:** Uploaded PDF instead of image  
**Solution:** Only images trigger OCR (expected behavior)

### **Issue 5: Console Errors**
**Symptom:** Red errors in browser console  
**Cause:** Tesseract.js failed to load  
**Solution:** Check internet connection, refresh page

---

## 📊 Expected Accuracy

### **For Clear Printed Receipts:**
- **Merchant Name:** 90-95% correct
- **Amount:** 95-98% correct
- **Date:** 85-90% correct

### **For Blurry Receipts:**
- **Merchant Name:** 70-80% correct
- **Amount:** 80-85% correct
- **Date:** 70-75% correct

### **For Handwritten:**
- **Merchant Name:** 30-50% correct
- **Amount:** 40-60% correct
- **Date:** 35-45% correct

---

## ✅ Success Checklist

After testing, verify:
- [ ] OCR works for clear receipts
- [ ] Progress indicator displays correctly
- [ ] Auto-filled fields are marked with 🤖
- [ ] User can edit auto-filled data
- [ ] Manual entry still works (fallback)
- [ ] No browser crashes
- [ ] Mobile upload works
- [ ] Receipt saves successfully
- [ ] Redirects to dashboard
- [ ] No console errors

---

## 🎯 Quick Test Commands

### **Open Upload Page:**
```
http://localhost:8000/upload.html
```

### **Check Browser Console:**
```
Press F12 → Console tab
Look for:
✅ "🔍 Starting OCR processing..."
✅ "📄 OCR Text extracted: ..."
✅ "✅ Extracted data: {merchant, amount, date}"
❌ No red errors
```

### **Test Sample Receipts:**
1. **Starbucks receipt** (best for testing)
2. **McDonald's receipt** (common format)
3. **Walmart receipt** (long format)
4. **Gas station receipt** (simple format)

---

## 🎉 Expected Results

### **Best Case (Clear Receipt):**
```
Merchant: ✅ Starbucks
Amount: ✅ $15.50
Date: ✅ 2026-01-28
Time: 3-5 seconds
Accuracy: 95%+
```

### **Medium Case (Blurry):**
```
Merchant: ⚠️ Starbu cks (needs edit)
Amount: ✅ $15.50
Date: ⚠️ 2026-01-29 (off by 1 day)
Time: 5-8 seconds
Accuracy: 75-85%
```

### **Worst Case (Handwritten):**
```
Merchant: ❌ [gibberish]
Amount: ❌ 1550 (missing decimal)
Date: ❌ [empty]
Time: 8-10 seconds
Accuracy: 30-50%
→ User enters manually ✅
```

---

**All tests should complete without crashes!** 🎊

Even if OCR accuracy is low, the system should gracefully fall back to manual entry.
