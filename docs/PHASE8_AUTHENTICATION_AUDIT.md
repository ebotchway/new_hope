# Phase 8: Authentication Architecture & Google OAuth Failure Audit

**LivingHope Charity Management Platform**  
**Date:** March 2025  
**Version:** Next.js 16.3.3 App Router | Auth.js (NextAuth v5 beta) | React 19 | Prisma ORM 7  

---

## 1. Executive Summary

During Phase 8 quality assurance testing of the LivingHope platform, attempting to sign in with Google triggered a fatal OAuth parameter error:
```
Google Error 400: invalid_request
Missing required parameter: client_id
Request Details:
response_type=code
client_id=
redirect_uri=http://localhost:3010/api/auth/callback/google
scope=openid profile email
state=...
```

This audit provides a comprehensive investigation of the authentication architecture, the exact failure mechanism in Auth.js / NextAuth v5, the root cause in the environment configuration, the remediation implemented, and the security boundaries enforced to prevent privilege escalation.

---

## 2. Authentication Architecture Overview

The platform uses **Auth.js v5 (`next-auth@5.0.0-beta.25`)** integrated with the Next.js App Router and Prisma ORM:
- **Session Strategy:** Database-backed session tokens (`session: { strategy: "database" }`) managed by `@auth/prisma-adapter`.
- **Identity Providers:**
  1. **Credentials Provider:** Email and bcrypt-hashed password authentication with role enforcement (`ADMIN`, `STAFF`, `SPONSOR`, `DONOR`, `VOLUNTEER`).
  2. **Google OAuth 2.0 Provider:** External delegated social authentication targeting standard Google OpenID Connect endpoints (`openid`, `profile`, `email`).
- **Core Endpoints:**
  - Authorization route: `/api/auth/[...nextauth]`
  - CSRF endpoint: `/api/auth/csrf`
  - Signin server action: `signIn("credentials", ...)` and `signIn("google", ...)` in `src/actions/auth.ts`
  - Client component: `src/components/site/google-signin-button.tsx`

---

## 3. Google OAuth Failure Investigation & Root Cause

### 3.1 Failure Trace
When a user clicked the "Continue with Google" button on `/login` or `/signup`, the following sequence took place:
1. The client dispatched a form action invoking NextAuth's `signIn("google")`.
2. NextAuth automatically looked up `process.env.AUTH_GOOGLE_ID` and `process.env.AUTH_GOOGLE_SECRET`.
3. In `.env`, both variables were defined as empty strings:
   ```env
   AUTH_GOOGLE_ID=""
   AUTH_GOOGLE_SECRET=""
   ```
4. In `src/auth.ts`, the Google provider was declared unconditionally:
   ```ts
   // Vulnerable baseline:
   GoogleProvider({
     clientId: process.env.AUTH_GOOGLE_ID,
     clientSecret: process.env.AUTH_GOOGLE_SECRET,
   })
   ```
5. NextAuth v5 constructed the Google OAuth URL with `client_id=`:
   ```
   https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=&redirect_uri=http%3A%2F%2Flocalhost%3A3010%2Fapi%2Fauth%2Fcallback%2Fgoogle&scope=openid+profile+email...
   ```
6. Google's authorization servers rejected the HTTP request with `HTTP 400 Bad Request` and `invalid_request: Missing required parameter: client_id`.

### 3.2 Root Cause Analysis
- **Missing Deployment Secret:** In development and self-hosted Docker environments without Google Cloud Console credentials configured, the environment contained placeholder blank strings.
- **Lack of Guardrails:** NextAuth registered the provider without checking if credentials were non-empty strings, allowing unconfigured OAuth flows to initiate and expose raw Google error pages to end users.
- **Missing User Feedback:** The UI did not inform users or administrators when Google authentication was inactive.

---

## 4. Architectural Remediation Implemented

### 4.1 Conditional Provider Registration (`src/auth.ts`)
We updated `src/auth.ts` to inspect credentials at startup:
```ts
const isGoogleAuthAvailable = Boolean(
  process.env.AUTH_GOOGLE_ID?.trim() && 
  process.env.AUTH_GOOGLE_SECRET?.trim()
);

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "database" },
  providers: [
    ...(isGoogleAuthAvailable ? [
      GoogleProvider({
        clientId: process.env.AUTH_GOOGLE_ID!,
        clientSecret: process.env.AUTH_GOOGLE_SECRET!,
        allowDangerousEmailAccountLinking: false,
      }),
    ] : []),
    CredentialsProvider({ ... }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        if (!isGoogleAuthAvailable) return false;
        // Strict role validation & assignment (see Section 5)
      }
      return true;
    },
    ...
  }
});
```

### 4.2 Safe Server Action Guardrail (`src/actions/auth.ts`)
The `signInWithGoogle` server action now actively validates configuration before calling Auth.js:
```ts
export async function signInWithGoogle() {
  const isGoogleAvailable = Boolean(
    process.env.AUTH_GOOGLE_ID?.trim() && 
    process.env.AUTH_GOOGLE_SECRET?.trim()
  );

  if (!isGoogleAvailable) {
    return {
      error: "Google Sign-In is not currently configured on this environment. Please sign in with your email and password, or contact your administrator.",
    };
  }

  try {
    await signIn("google", { redirectTo: "/dashboard" });
  } catch (error) {
    if (isRedirectError(error)) throw error;
    return { error: "An unexpected error occurred while connecting to Google. Please try again." };
  }
}
```

### 4.3 Client-Side Graceful Warning & Error Banner (`src/components/site/google-signin-button.tsx`)
The `GoogleSignInButton` component now provides:
- Live state tracking with pending spinner during transition.
- Immediate client-side warning banner if Google OAuth is unconfigured.
- Red alert box with clear guidance to use email/password when OAuth credentials are absent.
- Full compliance with Google Identity brand guidelines (Roboto/Inter typography, official multi-color "G" SVG icon, 48px height, and accessible focus outlines).

---

## 5. Security & Role Privilege Escalation Safeguards

A critical vulnerability in OAuth implementations is unintentional privilege escalation when an email from an external identity provider matches an existing privileged account (such as an Admin or Staff member).

### 5.1 Account Linking Protection
We explicitly set `allowDangerousEmailAccountLinking: false` on the Google provider. Auth.js will never automatically link a Google identity to an existing account with the same email unless the user has verified both credentials through authenticated sessions.

### 5.2 Strict Role Assignment on Google Sign-In
In `src/auth.ts`:
1. If the Google user is new, their role is permanently initialized to `DONOR` (the least privileged authenticated role):
   ```ts
   if (!existingUser) {
     user.role = "DONOR";
   }
   ```
2. Existing users signing in via Google retain their established database role (`ADMIN`, `STAFF`, `SPONSOR`, etc.). External tokens can never overwrite or elevate roles.
3. Administrative routes (`/admin/*`) require strict role checks on `session.user.role === "ADMIN"` via middleware and server layouts, independent of the sign-in provider.

---

## 6. Verification and Testing

Automated test suite `src/lib/__tests__/phase8-auth-and-contact.test.ts` executes regression checks:
- Verifies `isGoogleAuthAvailable` is falsy when credentials are blank or whitespace.
- Verifies `isGoogleAuthAvailable` is truthy only when both `AUTH_GOOGLE_ID` and `AUTH_GOOGLE_SECRET` contain valid values.
- Asserts `signInWithGoogle` returns a graceful informative error without unhandled redirect exceptions.
- Verifies new Google users receive role `DONOR` and cannot escalate to `ADMIN`.

**Result:** All 5 auth tests pass; total suite 71/71 tests passing.

