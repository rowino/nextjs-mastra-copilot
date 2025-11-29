# Organization Invitation System Redesign - Specification

## Overview
Redesign the invitation system to require all users to accept invitations, centralize organization management in a single settings tab, and make the accept-invite flow work for both authenticated and unauthenticated users.

## User Stories

### US-1: Admin Invites Any User
**As an** organization admin
**I want to** send invitations to any user (existing or new)
**So that** all team members go through a consistent invitation flow

**Acceptance Criteria:**
- Inviting an existing user creates an invitation (not direct member addition)
- Inviting a non-existent user creates an invitation with email in the link
- Invitation email is customized based on whether user exists
- Duplicate invitations are prevented (same email, same org, pending status)

### US-2: User Manages Organizations in Settings
**As a** user
**I want to** manage all my organizations from a single place
**So that** I can easily view, switch, create, and leave organizations

**Acceptance Criteria:**
- Settings page has "Organizations" tab
- Tab shows all organizations I'm a member of
- Tab shows all pending invitations I've received
- I can create a new organization inline
- I can switch between organizations
- I can leave organizations (if I'm not the only admin)
- Banner appears when I have no organization

### US-3: Accept Invite as New User
**As a** new user who received an invitation
**I want to** create my account and accept the invitation in one flow
**So that** I can quickly join the organization

**Acceptance Criteria:**
- Clicking invite link lands on accept-invite page
- Page shows signup form with email prefilled (read-only)
- User enters name and password
- After signup, user automatically sees accept button
- Accepting the invitation adds user as member
- User is redirected to organization settings

### US-4: Accept Invite as Existing User
**As an** existing user who received an invitation
**I want to** sign in and accept the invitation
**So that** I can join additional organizations

**Acceptance Criteria:**
- Clicking invite link lands on accept-invite page
- If logged in: page shows accept button
- If not logged in: page shows sign-in button
- After signing in, redirected back to accept page
- Accepting the invitation adds user as member
- User is redirected to organization settings

### US-5: New User Without Invites
**As a** new user without any pending invitations
**I want to** be guided to create an organization
**So that** I can start using the application

**Acceptance Criteria:**
- After signup, if no pending invites, redirect to settings
- Settings page shows "no organization" banner
- User can create organization from settings tab
- No separate create-organization page exists

## Current Implementation Issues

1. **Inconsistent Invitation Flow**: Existing users are added directly as members, bypassing invitation acceptance
2. **Scattered UI**: Organization creation, pending invites, and member management are in different places
3. **Protected Accept Page**: Unauthenticated users can't see invitation details or create account inline
4. **Multiple Redirect Paths**: Complex logic for new users (create-org page, pending-invites page, etc.)

## Proposed Changes

### 1. Always Send Invitations
- Remove direct member addition for existing users
- All invitations require explicit acceptance
- Email templates differentiate between new and existing users

### 2. Centralize in Settings → Organizations Tab
- Single tab shows: current memberships + pending invites + create org
- Replace create-organization page with inline form
- Remove separate pending-invites page
- Remove dashboard banner for invites

### 3. Public Accept-Invite Page
- Move from `(protected)` to root layout (public access)
- Handle three states: logged in, new user (with email), existing user (no email)
- Show inline signup form for new users
- Show sign-in button for existing users
- Redirect back to accept page after auth

### 4. Simplified Redirect Logic
- Users without organization → redirect to `/settings?tab=organizations`
- No complex invitation checking in guards
- Settings page handles all onboarding scenarios

## Technical Requirements

### API Endpoints

**Modified:**
- `POST /api/organization/:orgId/members` - Always create invitation (never direct add)

**New:**
- `GET /api/invitations/user` - Fetch user's pending invites by email
- `GET /api/invitations/lookup?token=xxx` - Public endpoint to get invite details
- `POST /api/organization/leave` - Leave organization endpoint
- `DELETE /api/invitations/:id` - Reject invitation (or reuse existing delete)

### Data Flow

**Invitation Creation:**
```
Admin sends invite → Check user exists → Create invitation record →
Send email (with/without email param) → Return invitation details
```

**Invitation Acceptance (New User):**
```
Click link → Accept page (public) → Show signup form →
Create account → Redirect to accept page → Accept → Add as member →
Redirect to org settings
```

**Invitation Acceptance (Existing User):**
```
Click link → Accept page (public) →
If logged in: Show accept button → Accept → Add as member → Redirect
If not logged in: Show signin button → Signin → Redirect to accept page
```

**Organization Management:**
```
User with no org → Protected route → OrgRedirectGuard →
Redirect to /settings?tab=organizations → Show banner →
User creates org or accepts invite
```

### Security Considerations

1. **Email Validation**: Verify logged-in user's email matches invitation email
2. **Token Validation**: Ensure invitation exists, is pending, and not expired
3. **Admin Verification**: Only admins can send invitations
4. **Leave Restrictions**: Prevent leaving if user is the only admin
5. **Public Endpoint**: `/api/invitations/lookup` only returns minimal invite details

### UI/UX Principles

1. **Single Source of Truth**: Settings → Organizations is the hub for all org management
2. **Progressive Disclosure**: Show relevant actions based on user state
3. **Clear Feedback**: Success/error messages for all actions
4. **Consistent Patterns**: Reuse card/list components across tabs
5. **Minimal Redirects**: Keep users in context when possible

## Out of Scope

- Multi-organization support improvements (already exists)
- Invitation analytics or tracking
- Bulk invitation sending
- Custom invitation messages
- Invitation expiration customization
- Email delivery retry logic
- Notification system for accepted invitations

## Success Metrics

1. All users go through invitation acceptance (no direct adds)
2. Zero standalone create-org or pending-invites page loads
3. Accept-invite page accessible to unauthenticated users
4. Settings → Organizations tab shows all relevant information
5. Simplified redirect logic (fewer conditional branches)
