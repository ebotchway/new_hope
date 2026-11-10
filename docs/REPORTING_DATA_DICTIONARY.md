# LivingHope Platform — Reporting Data Dictionary

This document provides standardized definitions, computational formulas, data sources, and precision standards for all metrics and fields utilized throughout the LivingHope Reports & Analytics Suite.

---

## 1. Core Financial Metrics & Accounting Definitions

### Realized Cash (USD)
- **Definition:** Cumulative sum of all monetary donations successfully settled via Stripe credit/debit card processing.
- **Formula:** `SUM(amount) WHERE status = 'COMPLETED' AND currency = 'USD' AND paymentMethod != 'MOMO'`
- **Data Source:** `Donation.amount` (stored as integer cents / standard decimal)
- **Unit:** US Dollars (USD `$`)

### Realized Mobile Money (GHS)
- **Definition:** Cumulative sum of verified domestic contributions received through Ghana Mobile Money networks (MTN, Telecel/Vodafone, AirtelTigo).
- **Formula:** `SUM(amount) WHERE status = 'COMPLETED' AND currency = 'GHS'` (or `MobileMoneyPayment.amount` where `status = 'VERIFIED'`)
- **Data Source:** `Donation` & `MobileMoneyPayment`
- **Unit:** Ghanaian Cedi (GHS `GH₵`)

### Pending Commitments
- **Definition:** Pledged or in-flight contributions that have been authorized or declared by a donor but not yet verified or settled into LivingHope bank accounts.
- **Formula:** `SUM(amount) WHERE status = 'PENDING'`
- **Note:** Excluded from realized cash totals to prevent false accounting.

### Estimated Processing Fees
- **Card Processing (Stripe):**
  - **Formula:** `(SUM(amount) * 0.029) + (COUNT(transactions) * 0.30)`
  - **Standard Rate:** Non-profit card transaction rate (2.9% + 30¢ per successful transaction).
- **Mobile Money Processing (Ghanaian Telcos):**
  - **Formula:** `SUM(amount) * 0.010`
  - **Standard Rate:** 1.0% mobile money merchant cash-out / API collection fee.

### Net Realized Revenue
- **Definition:** Gross realized funds minus estimated gateway and merchant deduction fees.
- **Formula:** `Gross Volume - Estimated Processing Fees`
- **Calculated Separately:** Stated as `Net USD` and `Net GHS` independently.

---

## 2. Recurring Giving & Sponsorship Metrics

### Monthly Recurring Contribution Value (MRCV)
- **Definition:** The predictable monthly recurring revenue pledged by active child sponsors and recurring donors.
- **Formula:** `SUM(monthlyAmount) WHERE status = 'ACTIVE'`
- **Data Source:** `ChildSponsorship.monthlyAmount`
- **Unit:** US Dollars (USD `$`) per month

### Beneficiary Sponsorship Coverage Ratio
- **Definition:** The proportion of enrolled vulnerable children who have at least one active sponsor securing their educational and nutritional support.
- **Formula:** `(COUNT(childrenWithActiveSponsorship) / COUNT(totalChildrenInProgram)) * 100%`
- **Format:** Percentage (`0.0%` to `100.0%`)

### Sponsorship Statuses
- **`ACTIVE`:** Currently maintained sponsorship with active payment billing schedule.
- **`PAUSED`:** Temporarily halted at donor request or due to payment retry grace period.
- **`CANCELLED`:** Voluntarily terminated by donor.
- **`COMPLETED`:** Child has graduated from school or achieved program independence.

---

## 3. Donor Analytics & Cohort Definitions

### Donor Lifetime Value (LTV)
- **Definition:** Total historical financial contributions (completed donations) made by an individual donor account across their entire relationship with LivingHope.
- **Formula:** `SUM(Donation.amount) WHERE userId = donor.id AND status = 'COMPLETED'`

### Active Donor (90-Day Rolling Window)
- **Definition:** Any registered or guest donor who has made at least one completed donation within the past 90 days.
- **Formula:** `COUNT(DISTINCT userId) WHERE createdAt >= (NOW() - 90 DAYS) AND status = 'COMPLETED'`

### First-Time vs Repeat Donors
- **First-Time Donor:** A donor with exactly 1 completed donation in their lifetime history.
- **Repeat Donor:** A donor with $\ge 2$ completed donations.

### Giving Tiers
- **Supporter:** Lifetime giving under \$100 USD.
- **Advocate:** Lifetime giving between \$100 and \$499 USD.
- **Champion:** Lifetime giving between \$500 and \$2,499 USD.
- **Visionary / Major Donor:** Lifetime giving of \$2,500 USD or greater.

---

## 4. Mobile Money Reconciliation Dictionary

### MoMo Reference ID (`transactionId`)
- **Definition:** The unique transaction identification code issued via network SMS by MTN, Telecel, or AirtelTigo to the donor upon sending funds.
- **Validation:** Must be cross-referenced by an administrator or automated webhook before marking the payment as `VERIFIED`.

### Verification Statuses
- **`PENDING`:** Donor has declared payment details; awaiting ledger matching by staff.
- **`VERIFIED`:** Staff verified bank/telco statement receipt; funds credited to general fund or assigned child.
- **`REJECTED`:** Invalid SMS reference, mismatched amount, or fraudulent submission.

---

## 5. Security & Export Protocol (CWE-1236)

### CSV Formula Sanitization
- **Vulnerability:** Spreadsheets (Microsoft Excel, LibreOffice, Apple Numbers) interpret cells starting with `=`, `+`, `-`, `@`, `\t`, or `\r` as dynamic formulas or DDE execution commands.
- **Remediation Standard:** Every field in all CSV export routines is passed through `sanitizeCsvField()`. Any value containing these prefix characters has a single apostrophe (`'`) prepended, neutralizing code execution while preserving readability.
- **Header Encodings:** `Content-Type: text/csv; charset=utf-8` and `Content-Disposition: attachment; filename="..."`.

