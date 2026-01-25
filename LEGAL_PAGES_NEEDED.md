# Legal Pages Required Before Launch

## ⚠️ CRITICAL: Must Create Before Any Real Users

### 1. Privacy Policy (`public/privacy.html`)

**Required by:** CCPA (California), GDPR (if any EU users), general US privacy laws

**Must include:**
- What data you collect (email, receipts, usage data)
- How you store it (Supabase, encrypted)
- How long you keep it (7 years for receipts, per IRS requirements)
- Who has access (only the user)
- Your commitment to never sell data
- User rights (delete account, export data)
- Cookie usage (if any analytics added)
- Contact information for privacy questions

**Quick solution:**
1. Go to https://www.termsfeed.com/privacy-policy-generator/
2. Fill in: ReceiptKeeper, receipt storage service, Supabase hosting
3. Download HTML
4. Save as `public/privacy.html`
5. Customize with your actual practices

### 2. Terms of Service (`public/terms.html`)

**Required by:** Liability protection, user agreement

**Must include:**
- Service description (receipt storage and export)
- User responsibilities (accurate data, legal use)
- Your responsibilities (reasonable uptime, data security)
- Limitation of liability (not responsible for tax advice)
- Refund policy (30-day money-back guarantee)
- Account termination conditions
- Dispute resolution (arbitration clause recommended)
- Governing law (your state)

**Quick solution:**
1. Go to https://www.termsfeed.com/terms-conditions-generator/
2. Fill in: ReceiptKeeper, SaaS service, $29/year
3. Add refund policy: "30-day money-back guarantee"
4. Download HTML
5. Save as `public/terms.html`

### 3. Important Disclaimers to Add

**On landing page (add to FAQ or footer):**

> "ReceiptKeeper is a receipt organization tool. We are not tax professionals. Consult a CPA or tax advisor for tax advice. We do not guarantee IRS acceptance of exported documents."

**Why:** Protects you from liability if user's tax filing has issues

### 4. Data Retention Policy

**Add to Privacy Policy:**

> "Receipt images and data are stored for 7 years to comply with IRS record-keeping requirements. Users can delete their account and all data at any time through account settings."

### 5. Acceptable Use Policy

**Add to Terms:**

> "ReceiptKeeper is for personal business expense tracking only. Prohibited uses include: storing illegal content, sharing accounts, automated scraping, or any use that violates US law."

---

## Timeline

**Before Beta Testing (Day 2):**
- [ ] Generate Privacy Policy
- [ ] Generate Terms of Service
- [ ] Create `public/privacy.html`
- [ ] Create `public/terms.html`
- [ ] Add disclaimer to FAQ
- [ ] Test that footer links work

**Estimated time:** 2-3 hours

---

## Templates to Use

**Free generators:**
- TermsFeed: https://www.termsfeed.com (recommended)
- GetTerms: https://getterms.io
- Shopify Generator: https://www.shopify.com/tools/policy-generator

**Paid (if you want lawyer review):**
- Rocket Lawyer: $39.99
- LegalZoom: $99

**Recommendation:** Use TermsFeed free generator for MVP, upgrade to lawyer-reviewed later if you get traction.

---

## What Happens If You Don't Have These?

**Risks:**
- CCPA fines: Up to $7,500 per violation
- User trust issues: "No privacy policy? Sketchy."
- App store rejection: Apple/Google require privacy policies
- Payment processor rejection: Stripe may require legal pages
- Lawsuit vulnerability: No liability protection

**Bottom line:** Don't launch without these. Takes 2 hours, protects you forever.
