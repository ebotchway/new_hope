# Google OAuth 2.0 Administrator Configuration Guide

**LivingHope Charity Management Platform**  
**Audience:** Platform Administrators & DevOps Engineers  
**Prerequisites:** Google Cloud Platform account with administrative billing access.  

---

## 1. Overview

LivingHope supports Google Sign-In as an OAuth 2.0 identity provider using Auth.js (NextAuth v5). This guide details the step-by-step instructions for obtaining production credentials from Google Cloud Console, configuring environment variables, and validating the integration.

When credentials are not configured, the platform safely suppresses broken OAuth redirects and presents users with a clean email/password sign-in option and informative notification.

---

## 2. Step-by-Step Google Cloud Console Setup

### Step 2.1 — Create or Select a Google Cloud Project
1. Navigate to the [Google Cloud Console](https://console.cloud.google.com/).
2. Click the project dropdown in the top bar and select **New Project**.
3. Enter Project Name: `livinghope-platform` (or your organization name).
4. Click **Create** and ensure the new project is active.

### Step 2.2 — Configure OAuth Consent Screen
1. In the left navigation, open **APIs & Services** > **OAuth consent screen**.
2. Select **External** (allows any Google account holder to sign in as a donor or sponsor) and click **Create**.
3. Enter Application Information:
   - **App name:** `LivingHope Charity Platform`
   - **User support email:** Select your support email (e.g., `support@livinghope.org` or your admin email).
   - **App logo:** Upload the official LivingHope mark (`public/brand/logo.png`).
4. Enter Developer Contact Information:
   - **Email addresses:** `devops@livinghope.org` (or administrator email).
5. Scopes:
   - Click **Add or Remove Scopes**.
   - Select:
     - `.../auth/userinfo.email`
     - `.../auth/userinfo.profile`
     - `openid`
   - Click **Update**.
6. Test Users (if in "Testing" mode):
   - Add testing Google email accounts.
   - *Note:* Switch status to **In Production** when launching publicly.
7. Click **Save and Continue**.

### Step 2.3 — Create OAuth 2.0 Client ID Credentials
1. In the left navigation, open **APIs & Services** > **Credentials**.
2. Click **+ Create Credentials** at the top and select **OAuth client ID**.
3. Set **Application type:** `Web application`.
4. Set **Name:** `LivingHope Web Client`.
5. Configure **Authorized JavaScript origins**:
   - For local development:
     ```
     http://localhost:3010
     ```
   - For production:
     ```
     https://livinghope.org
     https://www.livinghope.org
     ```
6. Configure **Authorized redirect URIs**:
   - For local development:
     ```
     http://localhost:3010/api/auth/callback/google
     ```
   - For production:
     ```
     https://livinghope.org/api/auth/callback/google
     https://www.livinghope.org/api/auth/callback/google
     ```
   *(Note: Auth.js v5 standard callback route is `/api/auth/callback/google`).*
7. Click **Create**.
8. A modal will appear showing:
   - **Your Client ID** (e.g., `1029384756-xxxxxxxxxxxx.apps.googleusercontent.com`)
   - **Your Client Secret** (e.g., `GOCSPX-xxxxxxxxxxxxxxxxxxxxxxxx`)
9. Copy both values securely.

---

## 3. Environment Variable Configuration

### 3.1 Local Development (`.env`)
Update your `.env` file in the project root:
```env
# Google OAuth 2.0 Credentials
AUTH_GOOGLE_ID="1029384756-xxxxxxxxxxxx.apps.googleusercontent.com"
AUTH_GOOGLE_SECRET="GOCSPX-xxxxxxxxxxxxxxxxxxxxxxxx"
```

### 3.2 Docker Production (`docker-compose.yml` or production environment)
Ensure both variables are forwarded into the `app` container:
```yaml
services:
  app:
    environment:
      - AUTH_GOOGLE_ID=${AUTH_GOOGLE_ID}
      - AUTH_GOOGLE_SECRET=${AUTH_GOOGLE_SECRET}
      - NEXTAUTH_URL=https://livinghope.org
      - AUTH_SECRET=${AUTH_SECRET}
```

Restart the Docker containers to load the environment:
```bash
docker compose down && docker compose up -d
```

---

## 4. Verification & Testing Checklist

Once credentials are set, perform the following verification:

1. **Verify Provider Activation:**
   - Navigate to `http://localhost:3010/login`.
   - The warning banner stating "Google Sign-In is not currently configured" should disappear.
   - Click **Continue with Google**.
2. **Verify Google Consent Screen:**
   - The browser should navigate to `https://accounts.google.com/o/oauth2/v2/auth`.
   - The prompt should display "LivingHope Charity Platform", asking to share email and profile.
   - No `Error 400: invalid_request Missing required parameter: client_id` should appear.
3. **Verify Successful Sign-In Callback:**
   - Complete Google login.
   - The browser should redirect back to `http://localhost:3010/dashboard`.
   - In the database, check that a user record was created in the `User` table with `role = 'DONOR'`.
4. **Verify Role Isolation:**
   - Google authentication will never elevate a user's role to `ADMIN` or `STAFF`.
   - Existing staff/admin accounts signing in with an identical Google email address will not automatically link unless verified, preventing account takeover.

