# Inquiry Workflow Separation & Dedicated Contact Architecture

## 1. Context & Business Rationale

Previously, the platform lacked an independent public contact desk. Visitors wishing to ask general questions, request directions to the Accra centre, inquire about tax deductibility, or submit press inquiries were routed to the Brightener partnership form. This mixed prospective committed partners with casual inquiries, cluttering the pipeline.

---

## 2. Implemented Architecture

### 2.1 Dedicated Public Route: `/contact`
- Fully compiled App Router page (`src/app/(public)/contact/page.tsx`).
- Clear visual hierarchy with direct communication channels:
  - Email: `info@livinghope.org.gh` (1–2 business days turnaround)
  - Phone / WhatsApp: `+233 24 123 4567` (Mon–Fri 8:30am–5:00pm GMT)
  - Location: Ring Road Central, Accra, Ghana
  - Centre Visiting Safeguarding Policy notice
- Direct cross-link to `/become-a-brightener` for long-term partners.

### 2.2 Client-Side Form: `GeneralInquiryForm`
- Managed via React Hook Form and Zod validation (`generalInquirySchema`).
- Fields:
  - Full Name (`name`)
  - Email Address (`email`)
  - Phone Number (`phone`, optional)
  - Inquiry Topic (`inquiryType`: General, Sponsorship, Donation, Volunteer, Visit, Media, Other)
  - Subject Line (`subject`, min 3 characters)
  - Detailed Message (`message`, min 10 characters)
  - Hidden honeypot (`companyHoneypot`)
- Inline validation and accessible error announcements.
- Instant success feedback with option to submit another query.

### 2.3 Backend Server Action & Database Classification
- Action: `submitGeneralInquiry` in `src/actions/inquiries.ts`.
- Persisted to `PartnershipInquiry` table with:
  - `category = "GENERAL_INQUIRY"`
  - `subject = data.subject`
  - `metadata = { inquiryType: data.inquiryType }`
- Bot honeypot triggers silent drops without generating database pollution.

---

## 3. Administrative Differentiation

### Admin Inquiries Desk (`/admin/inquiries`)
- Added filter tabs:
  - **All Submissions (Total)**
  - **Brightener Registrations (Count)**
  - **General Inquiries (Count)**
- Differentiated table columns:
  - Shows organization name and representative role for corporate inquiries.
  - Shows volunteer skills and availability for volunteer brighteners.
  - Shows subject line for general contact messages.
- Real-time status toggle (`NEW` -> `CONTACTED` -> `CLOSED`).

### Inquiries Pipeline Report (`/admin/reports/inquiries`)
- Segregated analytical metrics tracking Brightener registrations vs general contact desk inquiries.
- Breakdown by engagement category (Individual, Volunteer, Corporate, Church, Legacy, General).

