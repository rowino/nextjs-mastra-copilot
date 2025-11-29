# Implementation Tasks - Organization Invitation System Redesign

## Phase 1: Backend APIs (Foundation)

### 1.1 User Invitations API
- [ ] Create `src/app/api/invitations/user/route.ts`
  - [ ] Implement GET endpoint to fetch user's pending invites by email
  - [ ] Authenticate request and get user email from session
  - [ ] Query invitations table WHERE email = user.email AND status = 'pending'
  - [ ] Join with organization table to get org names and details
  - [ ] Return array with invitation + org details

### 1.2 Invitation Lookup API (Public)
- [ ] Create `src/app/api/invitations/lookup/route.ts`
  - [ ] Implement public GET endpoint with token query param
  - [ ] Validate token exists in request
  - [ ] Query invitation by token
  - [ ] Check invitation is pending and not expired
  - [ ] Return minimal invite details (email, org name, role, expires)

### 1.3 Leave Organization API
- [ ] Create `src/app/api/organization/leave/route.ts`
  - [ ] Implement POST endpoint to leave organization
  - [ ] Authenticate request
  - [ ] Verify user is member of the organization
  - [ ] Check if user is admin and verify not the only admin
  - [ ] Delete member record
  - [ ] Return success response

### 1.4 Routes Configuration
- [ ] Update `src/lib/routes.ts`
  - [ ] Add `api.invitations.user: "/api/invitations/user"`
  - [ ] Add `api.invitations.lookup: "/api/invitations/lookup"`
  - [ ] Add `api.organization.leave: "/api/organization/leave"`
  - [ ] Update `organization.acceptInvite` to be at root (not in protected)

---

## Phase 2: Core Invitation Logic Changes

### 2.1 Email Template Updates
- [ ] Update `src/lib/email/templates/invitation.ts`
  - [ ] Add `userExists?: boolean` parameter to function signature
  - [ ] Update invite link generation to include email param for new users
  - [ ] Pass userExists flag to email component

- [ ] Update `src/emails/invitation-email.tsx`
  - [ ] Add `userExists?: boolean` prop to component
  - [ ] Add conditional messaging based on userExists
  - [ ] "Sign in to accept" for existing users
  - [ ] "Create account to accept" for new users

### 2.2 Modify Member Addition API
- [ ] Update `src/app/api/organization/[orgId]/members/route.ts`
  - [ ] Remove direct member addition logic (lines 188-248)
  - [ ] Always create invitation for all users (existing or new)
  - [ ] Keep user lookup to determine userExists flag
  - [ ] Pass userExists to email template
  - [ ] Return invitation details instead of member details
  - [ ] Update success response structure

---

## Phase 3: Organization Settings UI Reorganization

### 3.1 Update Invite Member Component
- [ ] Update `src/components/organization/invite-member.tsx`
  - [ ] Change success toast message to "Invitation sent successfully"
  - [ ] Update button text if needed to reflect invitation (not direct add)

### 3.2 Reorganize Organization Settings Page
- [ ] Update `src/app/(protected)/settings/organization/page.tsx`
  - [ ] Remove "Invitations" tab from TabsList
  - [ ] Remove Invitations TabsContent section
  - [ ] Move InvitationList component into Members TabsContent
  - [ ] Position InvitationList above MemberList (before Team Roster section)
  - [ ] Keep only 2 tabs: General and Members

---

## Phase 4: Settings → Organizations Tab

### 4.1 Create Organizations Manager Component
- [ ] Create `src/components/user/organizations-manager.tsx`
  - [ ] Implement state management for orgs and invites
  - [ ] Fetch organizations from existing API
  - [ ] Fetch pending invites from new API
  - [ ] Implement "No organization" banner when orgs.length === 0
  - [ ] Create "Current Organizations" section
    - [ ] Card-based layout for each organization
    - [ ] Show org name, role, and current badge
    - [ ] Switch organization button
    - [ ] Leave organization button (with canLeave logic)
  - [ ] Create "Pending Invitations" section
    - [ ] Card-based layout for each invitation
    - [ ] Show org name, role, inviter, and expiration
    - [ ] Accept button (navigate to accept-invite page)
    - [ ] Reject button (call delete invitation API)
  - [ ] Create "Create Organization" section
    - [ ] Inline form with org name, slug, logo fields
    - [ ] Submit handler to create org
    - [ ] Success handling and org list refresh

### 4.2 Add Organizations Tab to Settings
- [ ] Update `src/app/(protected)/settings/page.tsx`
  - [ ] Add "Organizations" tab trigger (with Building2 icon)
  - [ ] Add Organizations TabsContent section
  - [ ] Import and render OrganizationsManager component
  - [ ] Handle tab query parameter for deep linking

---

## Phase 5: Public Accept-Invite Page

### 5.1 Move Accept-Invite to Public Route
- [ ] Move `src/app/(protected)/accept-invite/page.tsx` → `src/app/accept-invite/page.tsx`
  - [ ] Remove from protected layout
  - [ ] Update imports if needed

### 5.2 Update Accept-Invite Page Logic
- [ ] Update `src/app/accept-invite/page.tsx`
  - [ ] Get token and email from URL params
  - [ ] Use authClient.useSession() to check auth state
  - [ ] Fetch invitation details using lookup API (show org name, role)
  - [ ] Implement three rendering states:
    1. **Logged in**: Show accept button and invitation details
    2. **Not logged in + email in URL**: Show inline signup form
    3. **Not logged in + no email**: Show sign-in button with returnUrl
  - [ ] Add email validation (logged-in user email must match invite email)
  - [ ] Handle accept action (POST to accept API)
  - [ ] Redirect to org settings after successful accept

### 5.3 Create Inline Signup Form Component
- [ ] Create signup form within accept-invite page
  - [ ] Email field (prefilled, read-only)
  - [ ] Name field (required)
  - [ ] Password field (required, with validation)
  - [ ] Submit button: "Create Account & Accept Invitation"
  - [ ] Handle signup using authClient.signUp.email()
  - [ ] After signup, redirect back to accept-invite?token=xxx
  - [ ] Show loading and error states

### 5.4 Update Auth Pages for Return URL
- [ ] Update `src/app/(auth)/signup/page.tsx`
  - [ ] Accept returnUrl query parameter
  - [ ] Redirect to returnUrl after successful signup (if provided)
  - [ ] Otherwise use existing redirect logic

- [ ] Update `src/app/(auth)/signin/page.tsx`
  - [ ] Verify returnUrl handling exists
  - [ ] If not, add returnUrl query parameter support
  - [ ] Redirect to returnUrl after successful signin

---

## Phase 6: Cleanup & Redirect Logic

### 6.1 Update OrgRedirectGuard
- [ ] Update `src/app/(protected)/layout.tsx`
  - [ ] Modify OrgRedirectGuard to redirect to `/settings?tab=organizations`
  - [ ] Remove pending invites check (no longer needed)
  - [ ] Simplify allowed paths logic
  - [ ] Keep dashboard accessible even without org

### 6.2 Delete Obsolete Pages
- [ ] Delete `src/app/(protected)/create-organization/page.tsx`
- [ ] Check for and delete `src/app/(protected)/pending-invites/page.tsx` (if exists)

### 6.3 Update Route References
- [ ] Search codebase for references to `/create-organization`
- [ ] Update any hardcoded links or router.push() calls
- [ ] Update any references to pending-invites page

---

## Testing Checklist

### Invitation Flow Testing
- [ ] Admin can invite existing user (creates invitation, not direct member)
- [ ] Admin can invite new user (creates invitation with email in link)
- [ ] Duplicate invitations are prevented (same email + org + pending)
- [ ] Invitation emails are sent with correct messaging

### Accept Flow Testing (New User)
- [ ] New user clicks invite link → lands on public accept page
- [ ] Signup form shows with email prefilled
- [ ] After signup, redirected back to accept page
- [ ] Accept button appears after authentication
- [ ] Accepting adds user as member
- [ ] Redirected to organization settings

### Accept Flow Testing (Existing User - Logged In)
- [ ] Existing user (logged in) clicks link → sees accept button
- [ ] Accepting adds user as member
- [ ] Redirected to organization settings

### Accept Flow Testing (Existing User - Not Logged In)
- [ ] Existing user (not logged in) clicks link → sees sign-in button
- [ ] After signing in, redirected back to accept page
- [ ] Accept button appears
- [ ] Accepting adds user as member

### Settings → Organizations Tab Testing
- [ ] User with no org sees banner in Organizations tab
- [ ] User can create organization from settings
- [ ] User sees all organizations they're a member of
- [ ] Current organization is indicated with badge
- [ ] User can switch between organizations
- [ ] User can leave organization (if not only admin)
- [ ] User cannot leave if they're the only admin (error shown)
- [ ] User sees all pending invitations
- [ ] User can accept invitation from settings
- [ ] User can reject invitation from settings

### UI Verification
- [ ] Organization settings shows 2 tabs only (General, Members)
- [ ] Members tab shows: Pending Invitations → Team Roster → Add Member
- [ ] Personal settings shows Organizations tab
- [ ] No dashboard banner for invites
- [ ] No /create-organization route exists
- [ ] Accept-invite page is publicly accessible

### Edge Cases
- [ ] Wrong email tries to accept invitation → error message
- [ ] Expired invitation → error on accept
- [ ] Invalid token → error on accept
- [ ] User already member → error when accepting
- [ ] User with no org accesses protected route → redirect to settings
