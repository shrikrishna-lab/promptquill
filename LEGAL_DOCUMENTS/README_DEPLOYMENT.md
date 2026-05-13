# LEGAL DOCUMENTS - DEPLOYMENT GUIDE

**Prompt Quill Inc.**
**Version:** 1.0
**Created:** April 9, 2026
**Status:** Ready for Legal Review

---

## ⚠️ CRITICAL: LEGAL REVIEW REQUIRED

**BEFORE PUBLISHING ANY OF THESE DOCUMENTS:**

1. ✅ Have a qualified attorney review all documents
2. ✅ Ensure compliance with your specific jurisdiction
3. ✅ Verify all business model specifics are accurately reflected
4. ✅ Customize for your specific third-party providers
5. ✅ Update company information (address, phone, email)
6. ✅ Ensure GDPR/CCPA/other compliance for your users
7. ✅ Get signed approval from legal counsel
8. ✅ Maintain attorney-client privilege for review

---

## 📦 WHAT'S INCLUDED

This legal document package includes 7 comprehensive documents:

### Core Legal Documents (3 files)
1. **TERMS_OF_SERVICE.md** - Primary usage agreement (~3,500 words)
2. **PRIVACY_POLICY.md** - Data handling and privacy rights (~4,000 words)
3. **DISCLAIMER_AND_LIMITATIONS.md** - Liability disclaimers (~2,500 words)

### Additional Policies (4 files)
4. **ACCEPTABLE_USE_POLICY.md** - Content and conduct rules (~2,500 words)
5. **COOKIE_POLICY.md** - Cookie and tracking details (~2,000 words)
6. **REFUND_AND_PAYMENT_POLICY.md** - Payment and refund terms (~3,000 words)
7. **DATA_PROCESSING_AGREEMENT.md** - GDPR compliance for EU users (~3,500 words)

### Reference Documents (2 files)
8. **INDEX.md** - Navigation and document guide
9. **README_DEPLOYMENT.md** - This file

**Total:** ~24,000 words of comprehensive legal documentation

---

## 🚀 DEPLOYMENT CHECKLIST

### Phase 1: Legal Review (1-2 weeks)
- [ ] Engage qualified attorney
- [ ] Upload documents for review
- [ ] Provide attorney with:
  - Company information (legal entity, jurisdiction)
  - Business model details (AI providers, payment processor)
  - User demographics (EU users? California users?)
  - Technical architecture overview
  - List of third-party services
- [ ] Incorporate attorney feedback
- [ ] Get written approval from attorney
- [ ] Document changes made per legal advice

### Phase 2: Customization (1 week)
- [ ] Update company information:
  - [ ] Physical address (currently 123 Business Street, San Francisco, CA 94105)
  - [ ] Email addresses (support@, privacy@, billing@, legal@, dpo@)
  - [ ] Phone numbers
  - [ ] Website URL (currently https://promptquill.dev)
- [ ] Update AI provider list (verify all providers listed)
- [ ] Update payment processor details (Razorpay specifics)
- [ ] Update email service details (Resend confirmation)
- [ ] Update database provider (Supabase)
- [ ] Review all pricing ($9.99/month, credit amounts)
- [ ] Review all credit allocations (50/300 per day)
- [ ] Verify refund policy matches your business reality
- [ ] Verify tax handling matches your setup

### Phase 3: Testing (1 week)
- [ ] Verify all links work
- [ ] Test internal document references
- [ ] Verify table formatting
- [ ] Check for inconsistencies between documents
- [ ] Verify phone numbers and emails
- [ ] Test that URLs are correct and clickable
- [ ] Proof-read all documents
- [ ] Check grammar and spelling

### Phase 4: Publishing (1 day)
- [ ] Create `/legal` folder in web root
- [ ] Convert Markdown to HTML or PDF
- [ ] Add to website structure
- [ ] Create navigation links (footer, cookie banner, etc.)
- [ ] Update sitemap.xml
- [ ] Publish documents live
- [ ] Test links work after publishing
- [ ] Verify documents are accessible

### Phase 5: Post-Launch (ongoing)
- [ ] Update Terms/Privacy links on all pages
- [ ] Add cookie consent banner
- [ ] Add cookie settings link
- [ ] Add newsletter unsubscribe footer
- [ ] Add privacy/contact links in footer
- [ ] Implement GDPR data export API
- [ ] Implement GDPR account deletion API
- [ ] Set up legal document monitoring
- [ ] Plan annual legal review

---

## 🌐 WEBSITE PUBLICATION STRUCTURE

### Suggested URL Structure
```
https://promptquill.dev/legal/
├── terms/                          (Redirect to /legal/terms-of-service)
├── privacy/                        (Redirect to /legal/privacy-policy)
├── cookies/                        (Redirect to /legal/cookie-policy)
├── terms-of-service/              (Full Terms)
├── privacy-policy/                (Full Privacy Policy)
├── cookie-policy/                 (Full Cookie Policy)
├── acceptable-use-policy/         (Full AUP)
├── refund-policy/                 (Full Refund Policy)
├── data-processing-agreement/     (Full DPA - for GDPR)
├── disclaimer/                    (Full Disclaimer)
└── legal-index/                   (Navigation page)
```

### Suggested Footer Links
```
Legal
├── Terms of Service
├── Privacy Policy
├── Cookie Settings
├── Acceptable Use Policy
├── Refund Policy
└── Contact Legal Team

Other
├── Sitemap
├── Security
└── Contact Us
```

### Required Integration Points

**1. Terms Link (ALL pages)**
```html
<footer>
  <a href="/legal/terms-of-service">Terms of Service</a>
</footer>
```

**2. Privacy Link (ALL pages)**
```html
<footer>
  <a href="/legal/privacy-policy">Privacy Policy</a>
</footer>
```

**3. Cookie Consent Banner (Homepage)**
```html
<div id="cookie-banner">
  We use cookies for analytics and functionality.
  <a href="/legal/cookie-policy">Learn more</a>
  <a href="/legal/cookie-settings">Cookie Settings</a>
</div>
```

**4. Account Settings Link**
```html
<a href="/legal/privacy-policy#your-privacy-rights">
  Download Your Data
</a>
```

**5. Support Pages**
```html
<p>See our <a href="/legal/acceptable-use-policy">
  Acceptable Use Policy</a> for community guidelines.
</p>
```

---

## 📋 CRITICAL CUSTOMIZATION POINTS

### Email Addresses (Replace Throughout)
- `support@promptquill.dev` → Your actual support email
- `privacy@promptquill.dev` → Your privacy team email
- `legal@promptquill.dev` → Your legal team email
- `billing@promptquill.dev` → Your billing team email
- `dpo@promptquill.dev` → Your DPO (GDPR) email
- `abuse@promptquill.dev` → Your abuse reporting email
- `security@promptquill.dev` → Your security team email

**Search & Replace:**
```
support@promptquill.dev → support@YOURDOMAIN.dev
privacy@promptquill.dev → privacy@YOURDOMAIN.dev
...etc
```

### Company Information
- **Name:** Prompt Quill Inc. → Your company name
- **Address:** 123 Business Street, San Francisco, CA 94105 → Your address
- **Website:** https://promptquill.dev → Your website
- **Currency:** USD/INR → Your supported currencies
- **Jurisdiction:** California/San Francisco → Your jurisdiction

### Pricing Information
- **Pro Subscription:** $9.99/month → Your actual price
- **Free Daily Credits:** 50 → Your actual number
- **Pro Daily Credits:** 300 → Your actual number
- **INR Pricing:** ₹799/month → Your actual INR price

### Third-Party Services (Update Links)
- **Payment Processor:** Razorpay → Your processor
- **Email Service:** Resend → Your email service
- **Database:** Supabase → Your database provider
- **AI Providers:** Groq, Gemini, OpenRouter → Your providers

### Timezone
- **Current:** UTC → Your operating timezone
- **Recurring:** "Midnight UTC" → Your actual timezone reference

---

## 🏛️ JURISDICTION CONSIDERATIONS

### United States
- **Key Laws:**
  - CCPA (California)
  - CAN-SPAM Act (Email)
  - COPPA (Children)
  - Accessibility requirements
- **Compliance:** ✅ All documents include US compliance
- **Attorney Location:** Consider California-based lawyer

### European Union
- **Key Laws:**
  - GDPR (primary)
  - EDPB guidelines
  - Local privacy laws
  - Digital Services Act
- **Compliance:** ✅ Full GDPR compliance included
- **Required:** Data Processing Agreement (included)
- **DPO:** Required if processing data of EU users
- **Attorney Location:** Consider EU-based lawyer

### India
- **Key Laws:**
  - Digital Personal Data Protection Act (DPDP)
  - Information Technology Act, 2000
  - RBI guidelines (if payments)
- **Compliance:** ⚠️ Partially included (check DPDP)
- **Attorney Location:** Consider India-based lawyer for full compliance

### Other Regions
- **Australia:** OPAL, APPs
- **Canada:** PIPEDA
- **Brazil:** LGPD
- **Japan:** APPI
- **South Korea:** PIMS
- **China:** CAC regulations

**Recommendation:** If you have users in other jurisdictions, engage local counsel for additional compliance.

---

## 🔒 DATA PROTECTION SETUP

### Required Implementations for GDPR Compliance

**1. Data Export (Per GDPR Article 20)**
Location: Privacy Policy Section 10.1, DPA Section 5.1

Implementation needed:
```
GET /api/user/data-export [Authenticated]
Response: User's personal data in JSON/CSV format
Purpose: Fulfill data portability rights
Timeline: 30 days response required
```

**2. Account Deletion (Per GDPR Article 17)**
Location: Privacy Policy Section 10.2, DPA Section 9.2

Implementation needed:
```
DELETE /api/user/account [Authenticated]
Action: Mark account for deletion
Delay: 90 days before permanent deletion
Purpose: Right to be forgotten
Timeline: 30 days response required
```

**3. Consent Recording (Per GDPR Article 7)**
Location: DPA Section 4.1

Implementation needed:
- Record timestamp of any consent grant
- Record how consent was obtained
- Record what was consented to
- Maintain for 2 years

**4. Breach Notification (Per GDPR Article 34)**
Location: Privacy Policy Section 9.3, DPA Section 8

Implementation needed:
- 72-hour breach notification process
- Identify affected users
- Send notification emails
- Report to data protection authority

---

## 🎯 IMPLEMENTATION PRIORITIES

### Tier 1: Essential (Day 1)
- [ ] Publish Terms of Service
- [ ] Publish Privacy Policy
- [ ] Publish Cookie Policy
- [ ] Add footer links
- [ ] Test all links work

### Tier 2: Important (Week 1)
- [ ] Publish Acceptable Use Policy
- [ ] Publish Refund & Payment Policy
- [ ] Publish Disclaimer
- [ ] Implement cookie settings
- [ ] Implement newsletter unsubscribe

### Tier 3: GDPR Compliance (Month 1)
- [ ] Publish Data Processing Agreement
- [ ] Implement data export API
- [ ] Implement account deletion
- [ ] Implement consent recording
- [ ] Designate Data Protection Officer (if EU users > minimal)
- [ ] Set up data breach response procedures

### Tier 4: Enhancement (Ongoing)
- [ ] Add cookie consent banner optimization
- [ ] Implement advanced analytics consent tracking
- [ ] Create compliance dashboard
- [ ] Regular policy reviews
- [ ] Employee privacy training

---

## 📊 COMPLIANCE CHECKLIST BY USER CATEGORY

### All Users (Minimum)
- [ ] Terms of Service
- [ ] Privacy Policy
- [ ] Cookie Policy
- [ ] Acceptable Use Policy
- [ ] Disclaimer

### Paying Users (Add)
- [ ] Refund Policy (prominently linked)
- [ ] Payment terms clarity
- [ ] Subscription cancellation (easy to find/use)

### EU Users (Add)
- [ ] Data Processing Agreement
- [ ] GDPR-specific privacy sections
- [ ] Data export implementation
- [ ] Account deletion implementation
- [ ] DPO contact information

### California Users (Add)
- [ ] CCPA-specific sections (included in Privacy Policy)
- [ ] "Do Not Sell My Personal Info" link
- [ ] CCPA data deletion rights

---

## 🔗 INTEGRATION POINTS

### Before Publishing - Add These Features:

**1. Cookie Settings Page**
- Allow users to manage cookie preferences
- Show detailed cookie inventory
- Provide opt-out options
- Remember user preferences
- Reference: Cookie Policy Section 4

**2. Email Unsubscribe Footer**
- Add to all marketing emails
- Make unsubscribe easy (one-click)
- Implement per CAN-SPAM Act requirements
- Include business address
- Reference: Privacy Policy Section 1

**3. Account Settings - Data Management**
- Download my data (export)
- Delete my account
- Manage email preferences
- View login history
- References: Privacy Policy Section 12, DPA Section 5.1-5.2

**4. Error Pages - Legal References**
- 404 page link to Terms
- 500 page link to Status page and Privacy
- Security error page link to Security contact

---

## 📞 SUPPORT WORKFLOW

### When Users Ask Legal Questions:

**"Can I get a refund?"**
→ Direct to: Refund Policy (Section 5)
→ Email: billing@promptquill.dev
→ Timeframe: 5-10 business days

**"How do you use my data?"**
→ Direct to: Privacy Policy (Section 3)
→ Email: privacy@promptquill.dev
→ Timeframe: Immediate (FAQ)

**"What's prohibited?"**
→ Direct to: Acceptable Use Policy (Section 2)
→ Support: Automatic policy enforcement

**"I'm EU/GDPR resident"**
→ Direct to: DPA + Privacy Policy Section 10.2
→ Email: dpo@promptquill.dev
→ Timeframe: 30-45 days for requests

**"I want my data deleted"**
→ Direct to: Account Settings > Delete Account
→ Timeframe: 90-day deletion window
→ Backup: Email: privacy@promptquill.dev

---

## 🎓 TRAINING NEEDED

### For Support Team
- Review all documents (2-3 hours)
- Understand common legal questions
- Know when to escalate to legal
- Understand refund policy thoroughly
- Know GDPR/CCPA procedures

### For Engineering Team
- API endpoints for data export/deletion
- Cookie implementation requirements
- Data retention procedures
- Breach notification process
- GDPR encryption standards

### For Management/Marketing
- Know what's restricted (AUP)
- Understand data use limitations
- Know GDPR/CCPA implications
- Understand liability limits
- Know what requires legal review

---

## ✅ FINAL CHECKLIST

Before going live:
- [ ] All documents reviewed by qualified attorney
- [ ] All company information updated
- [ ] All pricing verified
- [ ] All third-party services verified
- [ ] All email addresses tested
- [ ] All website links work
- [ ] All phone numbers correct
- [ ] Grammar and spelling checked
- [ ] No broken links in documents
- [ ] Consistent formatting throughout
- [ ] All tables render correctly
- [ ] All compliance requirements understood
- [ ] APIs planned or implemented for data access/deletion
- [ ] Cookie consent implementation planned
- [ ] Support team trained
- [ ] Legal counsel approval obtained

---

## 📮 VERSION HISTORY

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 4/9/2026 | Initial creation of 7 documents |

---

## ⚠️ FINAL DISCLAIMERS

**IMPORTANT - READ BEFORE PUBLISHING:**

1. **Template Status:** These are templates. Customize for your business.

2. **Not Legal Advice:** This is not a substitute for legal counsel.

3. **Variable by Jurisdiction:** Laws differ significantly by location.

4. **Attorney Required:** Have a qualified attorney review before publishing.

5. **Liability:** Use at your own risk. Update as laws change.

6. **Specific Industries:** Some industries have additional requirements not covered here.

7. **Data Protection Officer:** EU may require a DPO - consult counsel.

8. **Regular Updates:** Policy reviews should happen annually.

---

**For questions about these documents or implementation:**

📧 Contact: legal@promptquill.dev
📞 Internal: Legal Department
📅 Scheduled Review: April 2027

---

**Document Status:** ✅ Ready for Attorney Review
**Last Updated:** April 9, 2026
**Created By:** Legal Document Generator for Prompt Quill
