# Quickstart: Authentication System

**Feature**: 001-add-auth-support
**Date**: 2025-10-06
**Purpose**: Manual testing scenarios for validating authentication implementation

## Prerequisites

Before running these scenarios:

1. ✅ Dependencies installed (`better-auth`, `@daveyplate/better-auth-ui`, `drizzle-orm`)
2. ✅ D1 database created and migrations applied
3. ✅ Environment variables configured:
   ```bash
   BETTER_AUTH_SECRET="your-secret-key-32-chars"
   GOOGLE_CLIENT_ID="google-client-id"
   GOOGLE_CLIENT_SECRET="google-client-secret"
   GITHUB_CLIENT_ID="github-client-id"
   GITHUB_CLIENT_SECRET="github-client-secret"
   ```
4. ✅ Development server running (`pnpm dev`)

## Testing Scenarios

### Scenario 1: Email/Password Signup

**Objective**: Verify email/password signup creates account with email verification

**Steps**:
1. Navigate to `/signup`
2. Enter email: `test@example.com`
3. Enter password: `Test1234!@#$` (meets requirements)
4. Enter name: `Test User`
5. Click "Sign Up"

**Expected Results**:
- ✅ Account created successfully
- ✅ User logged in automatically
- ✅ Redirected to dashboard or home page
- ✅ Console shows verification email (dev mode):
  ```
  [DEV] Verification link: http://localhost:3000/api/auth/verify-email?token=...
  ```
- ✅ User can access app but sees "Verify your email" banner
- ✅ Limited feature access (as defined in app logic)

**Test Cases**:
- [ ] Weak password rejected (< 12 chars)
- [ ] Password without uppercase rejected
- [ ] Password without lowercase rejected
- [ ] Password without number rejected
- [ ] Password without special char rejected
- [ ] Duplicate email shows error: "Account with this email already exists"
- [ ] Invalid email format rejected

---

### Scenario 2: Email Verification

**Objective**: Verify email verification flow completes successfully

**Steps**:
1. Complete Scenario 1 (create account)
2. Copy verification link from console
3. Open verification link in browser

**Expected Results**:
- ✅ Email verified successfully
- ✅ Verification banner removed
- ✅ Full feature access granted
- ✅ Database updated: `emailVerifiedAt` set to current timestamp

**Test Cases**:
- [ ] Invalid token shows error
- [ ] Expired token shows error (simulate by setting `expiresAt` in past)
- [ ] Already verified account shows appropriate message

---

### Scenario 3: Email/Password Login

**Objective**: Verify existing users can login with email/password

**Steps**:
1. Navigate to `/login`
2. Enter email: `test@example.com` (from Scenario 1)
3. Enter password: `Test1234!@#$`
4. Click "Sign In"

**Expected Results**:
- ✅ Login successful
- ✅ Session created
- ✅ Redirected to dashboard
- ✅ User profile displayed correctly

**Test Cases**:
- [ ] Wrong password shows error: "Invalid credentials"
- [ ] Non-existent email shows error: "Invalid credentials" (same message for security)
- [ ] Session persists across page refreshes
- [ ] Session cookie has correct attributes (httpOnly, secure, sameSite)

---

### Scenario 4: Google OAuth Signup

**Objective**: Verify Google OAuth signup flow

**Steps**:
1. Navigate to `/signup`
2. Click "Sign up with Google"
3. Authorize application in Google popup
4. Return to application

**Expected Results**:
- ✅ Account created with Google email
- ✅ Email automatically verified (`emailVerifiedAt` set)
- ✅ User logged in
- ✅ Profile populated from Google (name, email, image)
- ✅ No "Verify email" banner (OAuth accounts auto-verified)
- ✅ Full feature access immediately

**Test Cases**:
- [ ] OAuth authorization denied returns to signup with message
- [ ] Google popup blocked shows error
- [ ] Account created with correct role (default: "user")

---

### Scenario 5: Account Linking (Same Email)

**Objective**: Verify auto-linking when same email used across auth methods

**Steps**:
1. Create account with email/password: `link@example.com` / `Link1234!@#$`
2. Log out
3. Click "Sign in with Google"
4. Authorize Google with same email: `link@example.com`

**Expected Results**:
- ✅ Google account linked to existing account (auto-link)
- ✅ User logged in to original account
- ✅ Both auth methods now work for same account
- ✅ Account record created with `providerId: "google"`
- ✅ Can login with email/password OR Google

**Test Cases**:
- [ ] Linked accounts shown in profile page
- [ ] Can unlink OAuth provider (if feature implemented)
- [ ] Linking preserves existing user data (name, role, etc.)

---

### Scenario 6: Profile Management

**Objective**: Verify users can update profile information

**Steps**:
1. Login as test user
2. Navigate to `/profile`
3. Update name to `Updated Name`
4. Click "Save"

**Expected Results**:
- ✅ Name updated in database
- ✅ Success message displayed
- ✅ Updated name reflected immediately
- ✅ Name persists across logout/login

**Test Cases**:
- [ ] Name validation (min/max length)
- [ ] Empty name rejected
- [ ] Profile displays all fields: name, email, role, email verification status, linked providers

---

### Scenario 7: Email Update with Re-verification

**Objective**: Verify email change resets verification status

**Steps**:
1. Login as verified user
2. Navigate to `/profile`
3. Update email to `newemail@example.com`
4. Click "Save"

**Expected Results**:
- ✅ Email updated in database
- ✅ `emailVerifiedAt` reset to `null`
- ✅ New verification email sent (console log)
- ✅ "Verify email" banner appears
- ✅ Feature access becomes limited
- ✅ Can verify new email with link

**Test Cases**:
- [ ] Duplicate email shows error: "This email is already associated with another account"
- [ ] Invalid email format rejected
- [ ] Previous email no longer works for login
- [ ] New email works for login immediately (even before verification)

---

### Scenario 8: Password Change

**Objective**: Verify password change flow

**Steps**:
1. Login as test user
2. Navigate to `/profile` → Settings
3. Enter current password: `Test1234!@#$`
4. Enter new password: `NewPass123!@#`
5. Confirm new password
6. Click "Change Password"

**Expected Results**:
- ✅ Password updated in database
- ✅ Success message displayed
- ✅ User remains logged in (current session not terminated)
- ✅ Can login with new password
- ✅ Old password no longer works

**Test Cases**:
- [ ] Wrong current password rejected
- [ ] New password not meeting requirements rejected
- [ ] Password mismatch shows error
- [ ] Security event logged: `password_changed`

---

### Scenario 9: OAuth User Sets Password

**Objective**: Verify OAuth-only users can set password

**Steps**:
1. Create account via Google OAuth (no password)
2. Navigate to `/profile` → Settings
3. Click "Set Password" (for OAuth users)
4. Enter new password: `OAuthPass123!@#`
5. Confirm password
6. Click "Set Password"

**Expected Results**:
- ✅ Password field updated in database (was null)
- ✅ Success message displayed
- ✅ Can now login with email/password
- ✅ OAuth login still works
- ✅ Account has two authentication methods

**Test Cases**:
- [ ] Password requirements enforced
- [ ] Profile shows both Google and email/password as available methods

---

### Scenario 10: Forgot Password Flow

**Objective**: Verify password reset via email

**Steps**:
1. Navigate to `/login`
2. Click "Forgot Password?"
3. Enter email: `test@example.com`
4. Click "Send Reset Link"
5. Copy reset link from console
6. Open reset link
7. Enter new password: `ResetPass123!@#`
8. Click "Reset Password"

**Expected Results**:
- ✅ Reset email sent (console log)
- ✅ Reset link valid for 1 hour
- ✅ Password updated successfully
- ✅ Redirect to login page
- ✅ Can login with new password
- ✅ Security event logged: `password_reset_completed`

**Test Cases**:
- [ ] Invalid token shows error
- [ ] Expired token (>1 hour) shows error
- [ ] Token single-use (cannot reuse)
- [ ] Non-existent email shows generic message (security)

---

### Scenario 11: Rate Limiting

**Objective**: Verify progressive delay rate limiting on failed login attempts

**Steps**:
1. Navigate to `/login`
2. Enter email: `test@example.com`
3. Enter wrong password 3 times rapidly
4. Observe delays

**Expected Results**:
- ✅ Attempt 1: Fails immediately, error shown
- ✅ Attempt 2: Fails after 1 second delay
- ✅ Attempt 3: Fails after 2 second delay
- ✅ Attempt 4: Fails after 4 second delay
- ✅ Attempt 5: Fails after 8 second delay
- ✅ Client shows countdown: "Too many attempts. Please wait X seconds"
- ✅ After successful login, delay resets

**Test Cases**:
- [ ] Server rate limit: 3 requests per 10 seconds (built-in)
- [ ] Client exponential backoff: 1s → 2s → 4s → 8s → 16s
- [ ] Rate limit status code: 429
- [ ] Response header: `X-Retry-After` (seconds)

---

### Scenario 12: Session Management

**Objective**: Verify session lifecycle and expiration

**Steps**:
1. Login as test user
2. Check session cookie in DevTools
3. Refresh page (session persists)
4. Close browser and reopen (session persists if within 7 days)
5. Click "Sign Out"

**Expected Results**:
- ✅ Session cookie created on login
- ✅ Cookie attributes: `httpOnly`, `secure` (production), `sameSite: lax`
- ✅ Session expires after 7 days
- ✅ Session refreshes after 1 day of activity
- ✅ Cookie cache reduces database lookups (5 min cache)
- ✅ Logout deletes session from database
- ✅ Logout clears session cookie

**Test Cases**:
- [ ] Multiple concurrent sessions work (different devices)
- [ ] Session validation < 50ms (with cookie caching)
- [ ] Expired sessions redirect to login

---

### Scenario 13: Role-Based Access Control

**Objective**: Verify role assignment and permission checking

**Steps**:
1. Login as admin user
2. Navigate to `/admin/users`
3. Find test user
4. Change role to "moderator"
5. Logout and login as test user
6. Verify moderator features accessible

**Expected Results**:
- ✅ Admin can view user list
- ✅ Admin can change user roles
- ✅ Role updated in database
- ✅ User role reflected in session immediately
- ✅ Moderator features accessible
- ✅ Admin-only features not accessible
- ✅ Security event logged: `role_changed`

**Test Cases**:
- [ ] Default role: "user" (on signup)
- [ ] Role validation: must be admin, moderator, or user
- [ ] Non-admin cannot change roles (403 Forbidden)
- [ ] Role displayed in profile page

---

### Scenario 14: Security Audit Log

**Objective**: Verify security events are logged correctly

**Steps**:
1. Perform various auth actions (login, logout, password change, etc.)
2. Navigate to `/admin/security-events` (admin only)
3. View security audit log

**Expected Results**:
- ✅ All authentication events logged:
  - `login_success`, `login_failed`
  - `signup_success`
  - `password_changed`
  - `email_changed`
  - `role_changed`
- ✅ Events include: userId, eventType, action, ipAddress, timestamp
- ✅ Metadata populated correctly (e.g., `provider: "google"`)
- ✅ Failed attempts show `success: false`
- ✅ Events sortable by time, filterable by type

**Test Cases**:
- [ ] Non-admin cannot access audit log (403)
- [ ] Events retained indefinitely
- [ ] Pagination works correctly
- [ ] Export functionality (if implemented)

---

### Scenario 15: GitHub OAuth Signup

**Objective**: Verify GitHub OAuth signup flow

**Steps**:
1. Navigate to `/signup`
2. Click "Sign up with GitHub"
3. Authorize application in GitHub popup
4. Return to application

**Expected Results**:
- ✅ Account created with GitHub email
- ✅ Email automatically verified
- ✅ User logged in
- ✅ Profile populated from GitHub (name, email, image)
- ✅ No verification required

**Test Cases**:
- [ ] GitHub tokens don't expire (unless revoked)
- [ ] Account linking works with GitHub (same email auto-links)
- [ ] Can link both Google AND GitHub to same account

---

## Validation Checklist

After completing all scenarios, verify:

### ✅ Core Authentication
- [ ] Email/password signup works
- [ ] Email/password login works
- [ ] Google OAuth works
- [ ] GitHub OAuth works
- [ ] Logout works
- [ ] Sessions persist correctly

### ✅ Email Verification
- [ ] Verification emails sent (console in dev)
- [ ] Verification links work
- [ ] Email verified status updated
- [ ] Non-blocking (users can login before verifying)
- [ ] OAuth accounts auto-verified

### ✅ Account Management
- [ ] Profile updates work (name, email, image)
- [ ] Password changes work
- [ ] Email changes reset verification
- [ ] OAuth users can set password
- [ ] Account linking works (same email)

### ✅ Password Requirements
- [ ] 12+ characters enforced
- [ ] Uppercase required
- [ ] Lowercase required
- [ ] Number required
- [ ] Special character required
- [ ] Clear error messages

### ✅ Security
- [ ] Rate limiting works (3 req/10sec server-side)
- [ ] Progressive delays work (exponential backoff client-side)
- [ ] Password reset flow secure
- [ ] Sessions secure (httpOnly, secure, sameSite)
- [ ] Security events logged

### ✅ RBAC
- [ ] Default role assigned on signup
- [ ] Admin can change roles
- [ ] Permissions enforced correctly
- [ ] Role displayed in profile

### ✅ UI/UX
- [ ] AuthCard components render correctly
- [ ] SettingsCards work for profile management
- [ ] UserButton displays in navigation
- [ ] Error messages clear and helpful
- [ ] Loading states work
- [ ] Redirects work correctly

### ✅ Performance
- [ ] Authentication < 200ms p95
- [ ] OAuth callback < 500ms p95
- [ ] Session validation < 50ms (cookie caching)

---

## Troubleshooting

### Issue: OAuth popup blocked
**Solution**: Allow popups for localhost in browser settings

### Issue: Verification email not sending
**Solution**: Check console logs in dev mode; Resend integration pending

### Issue: Rate limiting not working
**Solution**: Ensure Cloudflare IP header configured: `customIpHeader: "cf-connecting-ip"`

### Issue: D1 database errors
**Solution**: Ensure migrations applied: `wrangler d1 migrations apply mastra-db --local`

### Issue: Session not persisting
**Solution**: Check cookie settings, ensure HTTPS in production

---

## Next Steps

After validating all scenarios:

1. ✅ Run automated tests: `pnpm test`
2. ✅ Check test coverage: `pnpm test:coverage`
3. ✅ Performance test with 100+ concurrent users
4. ✅ Security audit with OWASP checklist
5. ✅ Deploy to staging environment
6. ✅ Production deployment checklist

---

**Status**: Ready for manual testing after implementation
**Last Updated**: 2025-10-06
