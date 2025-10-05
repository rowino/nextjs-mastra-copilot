# Quickstart Guide

**Feature**: Modular Starter Kit with Auth, Profile, Settings & Dashboard
**Architecture**: Next.js + Better-Auth ↔ Laravel Sanctum API
**Purpose**: Manual testing scenarios to validate all features work end-to-end
**Date**: 2025-10-02

## Prerequisites

This project requires **two separate services** running:

### 1. Laravel Backend API (separate project)

The Laravel API must be running first. Refer to the Laravel project's README for setup instructions.

Expected Laravel API URL: `http://localhost:8000`

### 2. Next.js Frontend (this project)

```bash
# 1. Install dependencies
pnpm install

# 2. Set up environment variables
cp .env.example .env
# Edit .env with your credentials:
# - LARAVEL_API_URL=http://localhost:8000
# - NEXT_PUBLIC_APP_URL=http://localhost:3000
# - OPENAI_API_KEY=sk-... (for Mastra agents)

# 3. Start development server
pnpm dev
```

The app should now be running at `http://localhost:3000`

**Note**: No database setup needed for frontend - all data stored in Laravel API.

---

## Test Scenarios

### Scenario 1: New User Registration & Email Verification

**Goal**: Verify complete registration flow with email verification via Laravel API

**Steps**:
1. Navigate to `http://localhost:3000/register`
2. Fill in registration form:
   - **Name**: John Doe
   - **Email**: john.doe@example.com
   - **Password**: SecurePass123!
   - **Confirm Password**: SecurePass123!
3. Click "Sign Up"
4. **Expected**: POST /api/auth/register sent to Laravel
5. **Expected**: "Please check your email to verify your account" message displayed
6. Check email inbox (Laravel sends verification email via configured mail driver)
7. Click verification link in email (links to Laravel API endpoint)
8. **Expected**: Redirected back to Next.js app at `/login?verified=true`
9. Log in with credentials
10. **Expected**: Redirected to dashboard at `/dashboard`

**Success Criteria**:
- ✅ Registration form validates password
- ✅ Laravel API creates user record
- ✅ Email sent from Laravel
- ✅ Verification link works
- ✅ email_verified_at set in Laravel database
- ✅ Better-Auth stores session in cookie

**Failure Scenarios**:
- Weak password → Laravel returns validation errors
- Duplicate email → "The email has already been taken" error from Laravel
- Expired token → Laravel returns 404 with message

---

### Scenario 2: Login Flow

**Goal**: Verify existing user can log in via Laravel Sanctum

**Steps**:
1. Navigate to `http://localhost:3000/login`
2. Enter credentials:
   - **Email**: test@example.com (seeded in Laravel)
   - **Password**: Test123!
3. Click "Log In"
4. **Expected**: POST /api/auth/login sent to Laravel
5. **Expected**: Laravel returns { accessToken, expiresIn, tokenType, user }
6. **Expected**: Better-Auth stores token in httpOnly cookie
7. **Expected**: Redirected to `/dashboard`
8. **Expected**: User profile data displayed correctly

**Success Criteria**:
- ✅ Valid credentials grant access
- ✅ Laravel Sanctum token created
- ✅ Better-Auth stores token in cookie
- ✅ User data cached in frontend
- ✅ Authorization header includes Bearer token in subsequent requests

**Failure Scenarios**:
- Wrong password → "Invalid credentials" from Laravel
- Unverified email → "Please verify your email address" from Laravel
- Account doesn't exist → "Invalid credentials" (security: don't reveal if email exists)

---

### Scenario 3: Protected Route Access (Unauthenticated)

**Goal**: Verify authentication guards work on frontend

**Steps**:
1. Open incognito/private window
2. Navigate directly to `http://localhost:3000/dashboard`
3. **Expected**: Better-Auth detects no session
4. **Expected**: Redirected to `/login?returnTo=/dashboard`
5. Log in successfully
6. **Expected**: Redirected back to `/dashboard`

**Success Criteria**:
- ✅ Better-Auth middleware protects routes
- ✅ returnTo parameter preserved
- ✅ Post-login redirect works

---

### Scenario 4: Profile Management

**Goal**: Test profile viewing and editing via Laravel API

**Steps**:
1. Log in and navigate to `/profile`
2. **Expected**: GET /api/profile sent to Laravel with Authorization header
3. **Expected**: Current profile data displayed:
   - Name
   - Email
   - Avatar (or placeholder)
   - Bio
4. Click "Edit Profile"
5. Update fields:
   - **Name**: Jane Doe
   - **Bio**: Full-stack developer passionate about AI
6. Click "Save"
7. **Expected**: PUT /api/profile sent to Laravel
8. **Expected**: Toast notification "Profile updated"
9. **Expected**: Changes reflected immediately (React Query cache updated)
10. Navigate to `/dashboard`
11. **Expected**: Updated name displayed in dashboard header

**Success Criteria**:
- ✅ Profile data fetched from Laravel
- ✅ Form pre-filled with current values
- ✅ Validation works (name required, bio max 500 chars)
- ✅ Updates sent to Laravel API
- ✅ Changes persist in Laravel database
- ✅ React Query invalidates cache and refetches

**Unsaved Changes Warning**:
1. Edit profile but don't save
2. Try to navigate away (click dashboard link)
3. **Expected**: Alert: "You have unsaved changes. Discard changes?"
4. Click "Cancel" → Stays on profile page
5. Click "Discard" → Navigates to dashboard

---

### Scenario 5: Avatar Upload

**Goal**: Test file upload to Laravel API

**Steps**:
1. Navigate to `/profile`
2. Click avatar placeholder or "Change Avatar"
3. Select image file (JPEG/PNG, <4MB)
4. **Expected**: Upload progress shown
5. **Expected**: POST /api/profile/avatar sent as multipart/form-data
6. **Expected**: Laravel processes upload (stores in S3 or local storage)
7. **Expected**: Laravel returns { avatar_url }
8. **Expected**: Avatar updated across app (profile, dashboard, navbar)

**Success Criteria**:
- ✅ File upload works with FormData
- ✅ Laravel handles file storage
- ✅ URL returned and stored in Laravel database
- ✅ Avatar displayed in all locations

**Failure Scenarios**:
- File too large → Laravel returns "The avatar must not be greater than 4096 kilobytes"
- Wrong file type → Laravel returns "The avatar must be a file of type: jpg, jpeg, png, gif"
- Upload fails → Laravel returns 500 error

---

### Scenario 6: Change Password

**Goal**: Verify password change via Laravel API

**Steps**:
1. Navigate to `/profile` (security section)
2. Fill in password change form:
   - **Current Password**: Test123!
   - **New Password**: NewSecure456!
   - **Confirm Password**: NewSecure456!
3. Click "Change Password"
4. **Expected**: PUT /api/profile/password sent to Laravel
5. **Expected**: Laravel verifies current password
6. **Expected**: Laravel validates new password against policy
7. **Expected**: Laravel revokes all other Sanctum tokens
8. **Expected**: Toast "Password changed successfully"
9. **Expected**: Current session remains active
10. Log out
11. Try logging in with old password
12. **Expected**: "Invalid credentials" from Laravel
13. Log in with new password
14. **Expected**: Success

**Success Criteria**:
- ✅ Current password verified by Laravel
- ✅ New password validated against Laravel password policy
- ✅ Password hash updated in Laravel database
- ✅ Old Sanctum tokens revoked
- ✅ Current session remains active

---

### Scenario 7: Settings - Theme Change

**Goal**: Verify settings persistence via Laravel API

**Steps**:
1. Navigate to `/settings`
2. **Expected**: GET /api/settings sent to Laravel
3. Current theme displayed (default: system)
4. Select "Dark" theme
5. **Expected**: App immediately switches to dark mode (client-side)
6. Click "Save"
7. **Expected**: PUT /api/settings sent to Laravel
8. **Expected**: Laravel updates settings in database
9. Refresh page
10. **Expected**: Dark mode persists (fetched from Laravel)
11. Open new tab to `/dashboard`
12. **Expected**: Dark mode applied
13. Close browser completely
14. Reopen and log in
15. **Expected**: Dark mode still applied (from Laravel)

**Success Criteria**:
- ✅ Theme changes immediately (client-side)
- ✅ Setting persisted to Laravel database
- ✅ Fetched on page load
- ✅ Applied across all sessions/tabs
- ✅ Survives browser restart

---

### Scenario 8: Settings - Notifications

**Goal**: Test notification preferences via Laravel API

**Steps**:
1. Navigate to `/settings`
2. Toggle notification preferences:
   - Email: ON
   - Push: OFF
   - SMS: OFF
3. Click "Save"
4. **Expected**: PUT /api/settings sent to Laravel
5. **Expected**: Laravel saves to JSON field in database
6. **Expected**: Toast "Settings saved"
7. Refresh page
8. **Expected**: GET /api/settings returns saved preferences
9. **Expected**: Preferences displayed correctly

**Success Criteria**:
- ✅ Preferences saved to Laravel database (JSON field)
- ✅ Changes persist
- ✅ Fetched correctly on page load

---

### Scenario 9: Settings - Reset to Defaults

**Goal**: Test settings reset via Laravel API

**Steps**:
1. Make several setting changes (theme, language, timezone)
2. Navigate to `/settings`
3. Click "Reset to Defaults"
4. **Expected**: Confirmation dialog
5. Click "Confirm"
6. **Expected**: POST /api/settings/reset sent to Laravel
7. **Expected**: Laravel resets all settings:
   - Theme: system
   - Language: en
   - Timezone: UTC
   - Notifications: All ON
8. **Expected**: UI updates immediately

**Success Criteria**:
- ✅ Confirmation required
- ✅ All settings reset in Laravel database
- ✅ Frontend reflects changes

---

### Scenario 10: Token Expiration & Refresh

**Goal**: Verify Better-Auth token refresh with Laravel Sanctum

**Steps**:
1. Log in
2. Navigate to `/dashboard`
3. Wait for access token to approach expiration (configurable in Laravel)
4. Make any API request (e.g., navigate to profile)
5. **Expected**: Better-Auth detects token near expiry
6. **Expected**: POST /api/auth/refresh sent with current token
7. **Expected**: Laravel returns new { accessToken, expiresIn }
8. **Expected**: Better-Auth updates cookie with new token
9. **Expected**: Request succeeds transparently
10. Manually revoke token in Laravel database (personal_access_tokens table)
11. Try to make request
12. **Expected**: Laravel returns 401 Unauthorized
13. **Expected**: Better-Auth toast "Your session expired. Please log in again."
14. **Expected**: Redirect to `/login?returnTo=/current-page`

**Success Criteria**:
- ✅ Better-Auth handles token refresh automatically
- ✅ Laravel issues new token
- ✅ Failed refresh shows toast notification
- ✅ Redirect preserves current page

---

### Scenario 11: Account Deletion

**Goal**: Verify complete account deletion via Laravel API

**Steps**:
1. Log in as test user
2. Navigate to `/settings` (account section)
3. Click "Delete Account"
4. **Expected**: Warning modal with consequences
5. Enter password: Test123!
6. Click "Delete My Account"
7. **Expected**: DELETE /api/auth/user sent to Laravel with password
8. **Expected**: Laravel verifies password
9. **Expected**: Laravel deletes all user data (cascade):
   - User record
   - Profile
   - Settings
   - Personal access tokens
10. **Expected**: Better-Auth clears session
11. **Expected**: Redirected to `/` (landing page)
12. Try to log in with deleted account
13. **Expected**: "Invalid credentials" from Laravel

**Success Criteria**:
- ✅ Confirmation required (password)
- ✅ All related data cascades deleted in Laravel
- ✅ Sanctum tokens revoked
- ✅ Better-Auth session cleared
- ✅ Account cannot be recovered

---

### Scenario 12: Dashboard Widgets

**Goal**: Test dashboard data from Laravel API

**Steps**:
1. Navigate to `/dashboard`
2. **Expected**: GET /api/dashboard sent to Laravel
3. **Expected**: Laravel returns dummy/placeholder data:
   - Login count stat
   - Last login timestamp
   - Profile completion percentage
   - Placeholder chart data
   - Recent activity list
4. **Expected**: All widgets render without errors
5. **Expected**: Theme settings applied to widgets

**Success Criteria**:
- ✅ Dashboard loads <3 seconds
- ✅ Laravel API responds quickly
- ✅ All widgets render
- ✅ Dummy data displays correctly
- ✅ Theme affects widget styling

---

### Scenario 13: Logout

**Goal**: Verify logout via Laravel Sanctum

**Steps**:
1. Log in
2. Click "Log Out" in navbar
3. **Expected**: POST /api/auth/logout sent to Laravel
4. **Expected**: Laravel revokes current Sanctum token
5. **Expected**: Better-Auth clears session cookie
6. **Expected**: Redirected to `/login`
7. Try to navigate to `/dashboard`
8. **Expected**: Redirected to `/login` (no session)
9. Click browser back button
10. **Expected**: Still on `/login` (cannot access dashboard)

**Success Criteria**:
- ✅ Sanctum token revoked in Laravel
- ✅ Better-Auth session cleared
- ✅ Redirect to login
- ✅ Protected routes inaccessible

---

## Performance Validation

After completing scenarios, verify:

1. **Dashboard Load Time**: Open devtools Network tab, navigate to dashboard
   - **Target**: <3 seconds on broadband
   - **Check**: Total load time, TTFB, FCP, LCP
   - **Laravel API Response Time**: <500ms for /api/dashboard

2. **API Response Times**: Check Network tab for API requests
   - **Target**: <500ms for Laravel API endpoints
   - **Check**: `/api/profile`, `/api/settings`, `/api/dashboard` response times

3. **Concurrent Users**: Use load testing tool (optional)
   - **Target**: 1,000 concurrent authenticated users
   - **Tool**: k6 or Apache Bench (test Laravel API)

---

## Mastra Agent Testing

### Test Mastra Integration

**CopilotKit Conversational UI**:
1. Navigate to any page with CopilotKit enabled
2. Open chat interface (bottom-right)
3. Ask: "Help me update my profile"
4. **Expected**: Profile Assistant agent responds with guidance
5. **Expected**: Agent can call Laravel API on your behalf

**Dashboard Agent**:
1. On dashboard, ask: "What insights can you provide?"
2. **Expected**: Dashboard Agent analyzes activity from Laravel API
3. **Expected**: Agent provides recommendations

**Success Criteria**:
- ✅ Mastra agents accessible via CopilotKit
- ✅ Tools can call Laravel API with user's token
- ✅ Agent responses logged (LOG_LEVEL=debug)

---

## Debugging Checklist

If scenarios fail:

1. **Check Laravel API is Running**:
   ```bash
   # In Laravel project
   php artisan serve
   # Should be at http://localhost:8000
   ```

2. **Check Frontend Logs**:
   ```bash
   LOG_LEVEL=debug pnpm dev
   ```

3. **Check Laravel Logs**:
   ```bash
   # In Laravel project
   tail -f storage/logs/laravel.log
   ```

4. **Inspect Laravel Database**:
   ```bash
   # In Laravel project
   php artisan tinker
   # Or use database GUI tool (TablePlus, DBeaver)
   ```

5. **Check Environment Variables**:
   ```bash
   # Frontend
   cat .env
   # Verify LARAVEL_API_URL is correct

   # Laravel
   cat .env
   # Verify database, mail, storage configs
   ```

6. **Clear Browser State**:
   - Clear cookies (Better-Auth session)
   - Clear localStorage
   - Use incognito mode

7. **Check Email Delivery** (for registration):
   - Check Laravel mail driver configuration
   - For development: `MAIL_MAILER=log` (check storage/logs)
   - For production: Check configured mail service

8. **Check API Connectivity**:
   ```bash
   # Test Laravel API is accessible
   curl http://localhost:8000/api/auth/password-policy
   ```

---

## Next Steps

After completing all scenarios:

1. ✅ All features working end-to-end
2. ✅ Laravel API responding correctly
3. ✅ Better-Auth session management working
4. ✅ Performance targets met
5. ✅ Error handling verified

**Ready for**: Automated test implementation (contract tests, integration tests, E2E tests)
