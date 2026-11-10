# LivingHope Platform — Financial Reconciliation & Accounting Evidence

This document provides mathematical proofs, database query definitions, currency partition standards, and empirical verification results for the LivingHope financial accounting subsystem.

---

## 1. Accounting Principles & Currency Segregation

In compliance with non-profit cross-border accounting standards, LivingHope enforces a **strict dual-currency partition**:
- **USD (United States Dollar):** Settled funds processed via Stripe credit and debit cards.
- **GHS (Ghanaian Cedi):** Domestic contributions received through Ghana Mobile Money networks (MTN, Telecel/Vodafone, AirtelTigo).
- **Rule of Non-Blending:** USD and GHS totals are never combined into a single scalar value. Each currency maintains independent Gross, Fee Deductions, Net, and Pending balances.

---

## 2. Core Mathematical Formulas & SQL Implementations

### 2.1 Realized Gross Volume
Only transactions with `status = 'SUCCEEDED'` represent settled legal tender.
- **USD Gross Formula:**
  $$\text{Gross USD} = \sum_{\text{status} = \text{'SUCCEEDED'}, \text{currency} = \text{'usd'}} \text{amountCents}$$
- **SQL Implementation:**
  ```sql
  SELECT SUM("amountCents") 
  FROM "donations" 
  WHERE "status" = 'SUCCEEDED' AND "currency" = 'usd';
  ```

- **GHS Gross Formula:**
  $$\text{Gross GHS} = \sum_{\text{status} = \text{'SUCCEEDED'}, \text{amountGhsCents} \neq \text{null}} \text{amountGhsCents}$$
- **SQL Implementation:**
  ```sql
  SELECT SUM("amountGhsCents") 
  FROM "donations" 
  WHERE "status" = 'SUCCEEDED' AND "amountGhsCents" IS NOT NULL;
  ```

### 2.2 Refund Handling & Net Volume
- **Refund Deduction Formula:**
  $$\text{Net USD} = \max\left(0, \text{Gross USD} - \sum_{\text{status} = \text{'REFUNDED'}} \text{amountCents}\right)$$
- **SQL Implementation:**
  ```sql
  SELECT 
    COALESCE(SUM(CASE WHEN "status" = 'SUCCEEDED' AND "currency" = 'usd' THEN "amountCents" ELSE 0 END), 0) -
    COALESCE(SUM(CASE WHEN "status" = 'REFUNDED' THEN "amountCents" ELSE 0 END), 0) AS "netUsdCents"
  FROM "donations";
  ```

### 2.3 Provider Fee Modeling (Explicitly Labeled Estimates)
- **Stripe Card Deduction (Estimate):**
  $$\text{Est. Stripe Fees} = (\text{Card Gross} \times 0.029) + (\text{Card Count} \times \$0.30)$$
- **Mobile Money Merchant Deduction (Estimate):**
  $$\text{Est. MoMo Fees} = \text{MoMo Gross} \times 0.010$$
- **Net After Fees:**
  $$\text{Est. Net USD} = \max(0, \text{Net USD} - \text{Est. Stripe Fees})$$
  $$\text{Est. Net GHS} = \max(0, \text{Gross GHS} - \text{Est. MoMo Fees})$$

---

## 3. Realized Cash vs Future Pledged Commitments

To prevent fraudulent or premature revenue recognition, pending pledges are strictly isolated from bank balances:

| Transaction State | Accounting Category | Recognized as Realized Cash? |
|---|---|---|
| `status = 'SUCCEEDED'` | Settled Cash | **YES** |
| `status = 'PENDING'` | Pledged Commitment | **NO** |
| `status = 'FAILED'` | Abandoned / Failed Checkout | **NO** |
| `status = 'REFUNDED'` | Reversal Deduction | **NO** (Subtracted from Net) |

---

## 4. Recurring Giving & Subscription MRCV Reconciliation

- **Monthly Recurring Contribution Value (MRCV):**
  $$\text{MRCV} = \sum_{\text{status} = \text{'ACTIVE'}} \text{monthlyAmountCents}$$
- **SQL Implementation:**
  ```sql
  SELECT SUM("monthlyAmountCents") 
  FROM "sponsorships" 
  WHERE "status" = 'ACTIVE';
  ```
- **Renewal Verification:**
  Each recurring billing cycle creates a new `Donation` row with `frequency = 'MONTHLY'`, referencing the parent `stripeSubscriptionId` and a unique `stripeInvoiceId`.

---

## 5. Webhook Idempotency Verification Evidence

### Test Scenario: Duplicate Webhook Event Ingestion
1. **Initial Event:** Stripe sends `invoice.payment_succeeded` for invoice `in_audit_test_001`.
   - Result: `Donation` row inserted with `stripeInvoiceId = 'in_audit_test_001'`.
2. **Duplicate Event (Network Retry):** Stripe re-transmits the identical payload.
   - Result: Database unique constraint on `donations(stripeInvoiceId)` rejects insertion with PostgreSQL error `23505` (`Unique constraint failed on the fields: ('stripeInvoiceId')`).
   - Outcome: Zero duplicate fulfillments; zero duplicate donor receipts.

---

## 6. Verification Status

- **Dual-Currency Math:** PASS (Independently verified in `system-verification.test.ts`)
- **Refund Deduction Math:** PASS (Independently verified in `system-verification.test.ts`)
- **Stripe Idempotency:** PASS (Independently verified in `financial-regression.test.ts`)
- **Fee Model Accuracy:** PASS (Independently verified in `reporting.test.ts`)
