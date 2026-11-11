# Public Form Validation & Anti-Bot Protection Matrix

## 1. Overview

This document specifies the validation rules, security controls, and anti-spam defenses implemented across all public form entry points in the LivingHope platform.

---

## 2. Validation Matrix

| Form Name | Component | Schema | Key Fields & Constraints | Anti-Bot Defense | Success State |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Brightener Registration** | `BrightenerRegistrationFlow` | `brightenerRegistrationSchema` | • `name`: string 2–100 chars<br>• `email`: valid email string<br>• `type`: enum (6 types)<br>• `agreementAccepted`: boolean (must be true)<br>• `organization`, `role`, `skills`, `availability`: conditional strings | Hidden `companyHoneypot` field; silent drop on fill | Multi-step completion card with reference ID |
| **General Inquiry Desk** | `GeneralInquiryForm` | `generalInquirySchema` | • `name`: string 2–100 chars<br>• `email`: valid email string<br>• `subject`: string 3–150 chars<br>• `inquiryType`: enum (7 topics)<br>• `message`: string 10–3000 chars | Hidden `companyHoneypot` field; silent drop on fill | Inline green alert badge with "Send Another Message" button |
| **Online Donation** | `DonationForm` | `donationSchema` | • `donorName`: string 2–100 chars<br>• `donorEmail`: valid email<br>• `amountCents`: integer min 500 ($5.00)<br>• `frequency`: ONE_TIME \| MONTHLY<br>• `paymentMethod`: CARD \| MOBILE_MONEY | Hidden `companyHoneypot` field | Stripe Checkout redirect or MoMo prompt |
| **Child Sponsorship** | `SponsorshipForm` | `sponsorshipSchema` | • `childId`: valid child UUID<br>• `donorEmail`: valid email<br>• `tier`: FULL \| PARTIAL | Server-side authentication / verified checkout | Sponsor portal access / confirmation |

---

## 3. Honeypot Anti-Spam Architecture

Automated spam crawlers blindly fill all inputs in form DOM trees. LivingHope uses a non-intrusive honeypot mechanism:
```tsx
{/* Honeypot field for bot protection */}
<div className="hidden" aria-hidden="true">
  <label htmlFor="companyHoneypot">Leave this field blank</label>
  <input
    id="companyHoneypot"
    type="text"
    tabIndex={-1}
    autoComplete="off"
    {...register("companyHoneypot")}
  />
</div>
```
When submitted, server actions verify `companyHoneypot`:
- If filled: Immediately returns `{ success: true }` without writing to PostgreSQL or sending outbound staff email alerts.
- If empty: Proceeds with standard database persistence.

Verified via automated test `silently drops spam honeypot submissions without writing to database` in `src/lib/__tests__/inquiries-and-branding.test.ts`.

