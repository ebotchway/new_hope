# Become a Brightener Registration Redesign

## 1. Problem Formulation

In earlier platform versions, the `/become-a-brightener` page displayed six identical-looking cards that each anchored down to a single generic contact form. This resulted in several UX problems:
1. Users registering to volunteer in Accra saw fields identical to corporate CFOs offering CSR sponsorship.
2. The user experience failed to capture critical category-specific data: volunteer skills and availability, corporate organization names and representative roles, or donor giving frequency preferences.
3. Prospective Brighteners were not required to affirm the Child Protection Code of Conduct.

---

## 2. Redesigned Multi-Step Registration Journey (`BrightenerRegistrationFlow`)

The page now utilizes an interactive, two-step guided registration workflow:

### Step 1: Category Selection Roster
Users are presented with an overview of six distinct engagement pathways:
1. **Individual Brightener:** Personal monthly academic sponsorship and termly mentorship updates.
2. **Volunteer Brightener:** Active volunteering in Accra (teaching, health screening, trades, mentorship).
3. **Corporate Partner:** Corporate social responsibility (CSR) programs, staff matching grants, vocational apprenticeship sponsorships.
4. **Church / Ministry Partner:** Congregational child sponsorships, harvest mission partnerships, community prayer circles.
5. **Group / School Partner:** Student-led campaigns, civic group projects, sports fundraisers.
6. **Will & Legacy Benefactor:** Fiduciary bequests, testamentary trusts, and enduring endowment gifts.

### Step 2: Tailored Dynamic Registration Form
Upon selecting a pathway, the form dynamically morphs to present tailored fields:
- **Volunteer:** Exposes `skills` (Remedial Tutoring, Nursing Screening, Vocational Trades, IT/Coding, Music/Sports) and `availability` (Weekends, After-school, Holidays, Remote).
- **Corporate & Church:** Exposes `organization` and `role` (e.g. CSR Director, Lead Pastor).
- **Individual:** Exposes `preferredFrequency` (Monthly, Termly, Annual) and `priorityArea`.
- **Legacy:** Displays fiduciary confidentiality confirmation and board trust assurances.
- **Universal Required Fields:** Full Name, Valid Email, Phone (optional), Notes/Aspirations.
- **Safeguarding Agreement Checkbox:** Explicit confirmation to abide by LivingHope Child Protection Code of Conduct.
- **Anti-Bot Protection:** Invisible `companyHoneypot` field catching spam bots silently.

---

## 3. Data Flow & Integration

1. Validated client-side with Zod `brightenerRegistrationSchema`.
2. Handled server-side by `submitBrightenerRegistration` action in `src/actions/inquiries.ts`.
3. Stored in `PartnershipInquiry` table with:
   - `category = "BRIGHTENER_REGISTRATION"`
   - `status = "NEW"`
   - Tailored metadata, skills, and organization details recorded for administrator follow-up.
