# OCR Testing Checklist

## 🧪 Quick Test Guide

### Before You Start
- [ ] Make sure you're logged in to the app
- [ ] Have 3-5 receipt images ready (different stores/formats)
- [ ] Open browser console (F12) to see debug logs

---

## Test 1: Basic OCR Flow
1. [ ] Go to upload page
2. [ ] Click or drag-drop a receipt image
3. [ ] **Watch for:**
   - "Preprocessing image..." message
   - Progress bar moving smoothly
   - "✅ Receipt data extracted!" success message
4. [ ] **Check form fields:**
   - Merchant name filled?
   - Amount filled?
   - Date filled?
5. [ ] **Look for orange borders** (needs-review indicator)

**Expected:** At least 2 out of 3 fields should be correct

---

## Test 2: Confidence Scoring
1. [ ] Upload a **clear, good quality** receipt
2. [ ] **Expected:** No orange borders (high confidence)
3. [ ] Upload a **blurry or crumpled** receipt
4. [ ] **Expected:** Some orange borders (low confidence)

**What this proves:** System knows when it's unsure

---

## Test 3: Different Receipt Types

### Test 3a: Grocery Store Receipt
- [ ] Upload
- [ ] Check if total is correct (not subtotal or tax)
- [ ] Merchant name should be store name

### Test 3b: Restaurant Receipt
- [ ] Upload
- [ ] Check if total includes tip (should be final total)
- [ ] Merchant name should be restaurant name

### Test 3c: Gas Station Receipt
- [ ] Upload
- [ ] Check if amount is correct
- [ ] Date should be purchase date

**Expected:** 80-90% accuracy across all types

---

## Test 4: Edge Cases

### Test 4a: Non-Image File (PDF)
1. [ ] Upload a PDF
2. [ ] **Expected:** Form shows immediately (no OCR)
3. [ ] Can still enter data manually

### Test 4b: OCR Failure
1. [ ] Upload a very poor quality image
2. [ ] **Expected:** Error message appears
3. [ ] Form still shows for manual entry

### Test 4c: No Image
1. [ ] Try to submit form without uploading
2. [ ] **Expected:** Validation error

---

## Test 5: Form Submission
1. [ ] Fill/verify all fields
2. [ ] Click "Save Receipt"
3. [ ] **Expected:**
   - Button shows "Uploading..."
   - Success message appears
   - Redirects to dashboard
4. [ ] **Check dashboard:**
   - Receipt appears in list
   - All data is correct

---

## 🐛 Common Issues & Solutions

### Issue: OCR is slow
**Solution:** Normal! First time loads Tesseract library (~2-3 seconds)

### Issue: All fields are empty
**Check:**
- Is it an image file? (not PDF)
- Is image quality good?
- Check console for errors

### Issue: Amount is wrong
**Check:**
- Is it picking subtotal instead of total?
- Look at console logs to see what OCR extracted
- This is why we have confidence scoring!

### Issue: Orange borders everywhere
**This is GOOD!** It means:
- System knows it's unsure
- User should double-check
- Better than silently being wrong

---

## 📊 Success Criteria

### ✅ Passing Tests:
- [ ] OCR completes without crashing
- [ ] At least 2/3 fields are correct on good receipts
- [ ] Low-confidence fields are highlighted
- [ ] Can still submit manually if OCR fails
- [ ] Form submission works

### 🎯 Excellent Performance:
- [ ] 3/3 fields correct on most receipts
- [ ] Only 0-1 fields need editing
- [ ] Total amount is almost always correct
- [ ] Users trust the system

---

## 🔍 Debug Console Logs

When you upload, you should see:
```
📤 Upload page loading...
✅ User authenticated
🔍 Starting OCR processing...
📄 OCR Text extracted: [full text]
📋 Parsed lines: [array of lines]
✅ Extracted data: {merchant: "...", total: "...", date: "..."}
```

If you see errors, copy them and we can debug!

---

## 📝 Notes Section

Use this space to record your test results:

**Receipt 1:**
- Type: _______________
- Merchant correct? ☐ Yes ☐ No
- Amount correct? ☐ Yes ☐ No
- Date correct? ☐ Yes ☐ No
- Had orange borders? ☐ Yes ☐ No

**Receipt 2:**
- Type: _______________
- Merchant correct? ☐ Yes ☐ No
- Amount correct? ☐ Yes ☐ No
- Date correct? ☐ Yes ☐ No
- Had orange borders? ☐ Yes ☐ No

**Receipt 3:**
- Type: _______________
- Merchant correct? ☐ Yes ☐ No
- Amount correct? ☐ Yes ☐ No
- Date correct? ☐ Yes ☐ No
- Had orange borders? ☐ Yes ☐ No

---

## 🚀 Ready to Test?

1. Save this checklist
2. Open your app in browser
3. Go through each test
4. Mark checkboxes as you go
5. Report any issues you find!

**Remember:** The goal is 80-90% accuracy, not 100%. Some receipts are just hard to read, even for humans! 😊
