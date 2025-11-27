# Auth UI Implementation Checklist

## Phase 1: Foundation Setup

### Dependencies
- [x] Initialize shadcn/ui with Tailwind CSS v4
- [x] Install react-hook-form
- [x] Install @hookform/resolvers
- [x] Install shadcn components: button, input, label, card
- [x] Install shadcn components: dialog, tabs, dropdown-menu
- [x] Install shadcn components: avatar, separator, toast, form
- [x] Install qrcode.react for 2FA QR codes

### Better Auth Server Configuration
- [x] Update `src/lib/auth.ts` to import all plugins
- [x] Enable emailOTP plugin with sendVerificationOTP stub
- [x] Enable magicLink plugin with sendMagicLink stub
- [x] Enable twoFactor plugin with sendOTP stub
- [x] Enable passkey plugin
- [x] Connect emailAndPassword to feature flag
- [x] Configure email verification with sendVerificationEmail stub
- [x] Configure password reset with sendResetPassword stub
- [x] Set appName for 2FA issuer

### Better Auth Client Configuration
- [x] Update `src/lib/auth-client.ts` to import client plugins
- [x] Add emailOTPClient plugin
- [x] Add magicLinkClient plugin
- [x] Add twoFactorClient with onTwoFactorRedirect
- [x] Add passkeyClient plugin

### Feature Flags Utility
- [x] Create `src/lib/auth-config.ts` with feature flag reader
- [x] Export typed config object for feature flags

---

## Phase 2: Base UI Components

### shadcn Customization
- [x] Update shadcn theme to use CSS variables from globals.css
- [x] Configure glassmorphism variants for card component
- [x] Configure transparent input variant

### Auth Card Component (`src/components/auth/auth-card.tsx`)
- [x] Create component file
- [x] Implement glassmorphism wrapper with blur effect
- [x] Add title and subtitle props
- [x] Add children slot for form content
- [x] Add footer slot for links

### Auth Input Component (`src/components/auth/auth-input.tsx`)
- [x] Create component file
- [x] Wrap shadcn input with label
- [x] Display error message from react-hook-form
- [x] Apply glassmorphism input styling
- [x] Support password visibility toggle

### Social Buttons Component (`src/components/auth/social-buttons.tsx`)
- [x] Create component file
- [x] Implement GitHub button with icon
- [x] Implement Google button with icon
- [x] Add loading state during OAuth redirect
- [x] Handle authClient.signIn.social() calls

### Divider Component (`src/components/auth/divider.tsx`)
- [x] Create component file
- [x] Implement "or continue with" text with lines
- [x] Apply appropriate styling

### OTP Input Component (`src/components/auth/otp-input.tsx`)
- [x] Create component file
- [x] Implement 6 individual digit inputs
- [x] Auto-focus next input on entry
- [x] Handle backspace to previous input
- [x] Handle paste of full code
- [x] Return concatenated value to form

### Password Strength Component (`src/components/auth/password-strength.tsx`)
- [x] Create component file
- [x] Display password requirements list
- [x] Show checkmarks for met requirements
- [x] Indicate strength level (weak/medium/strong)

---

## Phase 3: Feature-Specific Components

### Two-Factor Setup Component (`src/components/auth/two-factor-setup.tsx`)
- [x] Create component file
- [x] Display QR code from totpURI
- [x] Display manual entry secret
- [x] Show backup codes in copyable format
- [x] Add "Copy codes" button
- [x] Add TOTP verification input
- [x] Handle enable/verify flow

### Passkey Button Component (`src/components/auth/passkey-button.tsx`)
- [x] Create component file
- [x] Implement "Sign in with Passkey" button
- [x] Implement "Add Passkey" button variant
- [x] Handle authClient.signIn.passkey() call
- [x] Handle authClient.passkey.addPasskey() call
- [x] Show loading state during WebAuthn
- [x] Handle errors gracefully

### Magic Link Form Component (`src/components/auth/magic-link-form.tsx`)
- [x] Create component file
- [x] Email input with validation
- [x] Submit button
- [x] Success state with "Check your email" message
- [x] Handle authClient.signIn.magicLink() call

---

## Phase 4: User Components

### User Avatar Component (`src/components/user/user-avatar.tsx`)
- [x] Create component file
- [x] Display image if available
- [x] Fallback to initials from name
- [x] Fallback to email first letter
- [x] Support multiple sizes (sm, md, lg)

### User Dropdown Component (`src/components/user/user-dropdown.tsx`)
- [x] Create component file
- [x] Trigger button with UserAvatar
- [x] Display user name and email
- [x] Dashboard link
- [x] Settings link
- [x] Sign out option
- [x] Handle authClient.signOut() call
- [x] Redirect to landing after sign out

---

## Phase 5: Auth Layout

### Auth Layout (`src/app/(auth)/layout.tsx`)
- [x] Create route group folder `(auth)`
- [x] Create layout file
- [x] Centered container with max-width
- [x] Background gradient/color
- [x] Logo/brand at top
- [x] Redirect if already authenticated

---

## Phase 6: Sign In Page

### Sign In Page (`src/app/(auth)/signin/page.tsx`)
- [x] Create page file
- [x] Page metadata (title, description)
- [x] Sign in form with react-hook-form
- [x] Email input field
- [x] Password input field with toggle
- [x] Remember me checkbox
- [x] Submit button with loading state
- [x] Handle authClient.signIn.email() call
- [x] Handle 2FA redirect (twoFactorRedirect)
- [x] Display validation errors
- [x] Display auth errors (toast or inline)

### Sign In - Social Options
- [x] Add SocialButtons component
- [x] Add Divider between form and social

### Sign In - Alternative Methods (conditional)
- [x] Add "Sign in with Magic Link" link (if enabled)
- [x] Add "Sign in with OTP" link (if enabled)
- [x] Add PasskeyButton for passkey sign in (if enabled)

### Sign In - Links
- [x] Add "Forgot password?" link
- [x] Add "Don't have an account? Sign up" link

### Two-Factor Modal
- [x] Create 2FA verification dialog component
- [x] TOTP code input (6 digits)
- [x] "Use backup code" option
- [x] Trust device checkbox
- [x] Handle authClient.twoFactor.verifyTotp()
- [x] Handle authClient.twoFactor.verifyBackupCode()
- [x] Close modal and complete sign in on success

---

## Phase 7: Sign Up Page

### Sign Up Page (`src/app/(auth)/signup/page.tsx`)
- [x] Create page file
- [x] Page metadata
- [x] Sign up form with react-hook-form
- [x] Name input field
- [x] Email input field
- [x] Password input field with strength indicator
- [x] Submit button with loading state
- [x] Handle authClient.signUp.email() call
- [x] Display validation errors
- [x] Display auth errors
- [x] Redirect to dashboard on success (or verify page)

### Sign Up - Social Options
- [x] Add SocialButtons component
- [x] Add Divider between form and social

### Sign Up - Links
- [x] Add "Already have an account? Sign in" link

---

## Phase 8: Password Recovery Pages

### Forgot Password Page (`src/app/(auth)/forgot-password/page.tsx`)
- [x] Create page file
- [x] Page metadata
- [x] Email input form
- [x] Submit button
- [x] Handle authClient.forgetPassword() (email link)
- [x] Optional: OTP method (if email OTP enabled)
- [x] Success state with instructions
- [x] Error handling
- [x] Link back to sign in

### Reset Password Page (`src/app/(auth)/reset-password/page.tsx`)
- [x] Create page file
- [x] Extract token from URL params
- [x] Validate token presence
- [x] Password input with requirements
- [x] Confirm password input
- [x] Submit button
- [x] Handle authClient.resetPassword()
- [x] Success message and redirect to sign in
- [x] Handle invalid/expired token error

---

## Phase 9: Verification Page

### Verify Page (`src/app/(auth)/verify/page.tsx`)
- [x] Create page file
- [x] Support email verification token
- [x] Support magic link token
- [x] Support OTP verification
- [x] Auto-verify on token in URL
- [x] OTP input form (if OTP flow)
- [x] Handle authClient.verifyEmail() or similar
- [x] Success state and redirect
- [x] Error handling for invalid tokens

---

## Phase 10: Landing Page Header

### Landing Page Updates (`src/app/page.tsx`)
- [x] Create Header component
- [x] Add logo/brand
- [x] Use authClient.useSession() for auth state
- [x] Conditional rendering based on auth state
- [x] Unauthenticated: Sign In and Sign Up buttons
- [x] Authenticated: UserDropdown component
- [x] Style buttons with glassmorphism

### Landing Page Content
- [x] Hero section with heading
- [x] Feature highlights
- [x] CTA button to dashboard (if authenticated) or sign up

---

## Phase 11: Protected Layout

### Protected Layout (`src/app/(protected)/layout.tsx`)
- [x] Create route group folder `(protected)`
- [x] Create layout file
- [x] Check session with authClient.useSession()
- [x] Redirect to /signin if not authenticated
- [x] Store intended destination for post-login redirect
- [x] Header with navigation
- [x] UserDropdown in header
- [x] Main content area

---

## Phase 12: Dashboard Page

### Dashboard Page (`src/app/(protected)/dashboard/page.tsx`)
- [x] Create page file
- [x] Page metadata
- [x] Get user from session
- [x] Welcome message with user name
- [x] Basic dashboard content/placeholder
- [x] Link to settings

---

## Phase 13: Settings Page - Profile

### Settings Page Structure (`src/app/(protected)/settings/page.tsx`)
- [x] Create page file
- [x] Page metadata
- [x] Tabs component for sections
- [x] Profile tab (default)
- [x] Security tab
- [x] Connected Accounts tab

### Profile Section
- [x] Display current user info
- [x] Update name form
- [x] Update email form (with verification)
- [x] Update profile image
- [x] Change password form
- [x] Current password input
- [x] New password input with requirements
- [x] Confirm new password input
- [x] Handle authClient.changePassword()
- [x] Success/error feedback

---

## Phase 14: Settings Page - Security

### Two-Factor Authentication Section (conditional)
- [x] Show only if `NEXT_PUBLIC_ENABLE_2FA=true`
- [x] Display current 2FA status
- [x] "Enable 2FA" button (if disabled)
- [x] TwoFactorSetup component flow
- [x] "Disable 2FA" button (if enabled)
- [x] Password confirmation for disable
- [x] "View Backup Codes" button
- [x] Password confirmation for viewing
- [x] "Regenerate Backup Codes" button
- [x] Warning about invalidating old codes

### Passkey Management Section (conditional)
- [x] Show only if `NEXT_PUBLIC_ENABLE_PASSKEY=true`
- [x] List registered passkeys
- [x] Display passkey name and created date
- [x] "Add Passkey" button
- [x] Name input for new passkey
- [x] "Rename" option for each passkey
- [x] "Delete" button with confirmation dialog
- [x] Handle authClient.passkey.listUserPasskeys()
- [x] Handle authClient.passkey.addPasskey()
- [x] Handle authClient.passkey.deletePasskey()
- [x] Handle authClient.passkey.updatePasskey()

### Session Management Section
- [x] List active sessions
- [x] Display device/browser info
- [x] Display last active time
- [x] Highlight current session
- [x] "Revoke" button for each session
- [x] "Revoke all other sessions" button
- [x] Handle authClient.revokeSession()
- [x] Handle authClient.revokeOtherSessions()

---

## Phase 15: Settings Page - Connected Accounts

### Connected Accounts Section
- [x] List available providers (GitHub, Google)
- [x] Show connected status for each
- [x] "Connect" button for unlinked
- [x] "Disconnect" button for linked
- [x] Prevent disconnecting last login method
- [x] Handle authClient.linkSocial()
- [x] Handle authClient.unlinkAccount()
- [x] Refresh list after changes

---

## Phase 16: Documentation

### Update Auth Documentation (`docs/development/auth.md`)
- [x] Document new page structure
- [x] Document component customization
- [x] Show how to override individual components
- [x] Document styling customization
- [x] Document feature flags and their effects
- [x] Document email sending implementation
- [x] Provide code examples for customization
- [x] Document protected route pattern
- [x] Document auth state hooks usage

---

## Phase 17: Testing & Polish

### Testing
- [ ] Test email/password sign up flow
- [ ] Test email/password sign in flow
- [ ] Test social login (GitHub)
- [ ] Test social login (Google)
- [ ] Test magic link flow
- [ ] Test email OTP flow
- [ ] Test 2FA enable/disable flow
- [ ] Test 2FA verification on login
- [ ] Test passkey registration
- [ ] Test passkey sign in
- [ ] Test password reset flow
- [ ] Test profile update
- [ ] Test session management
- [ ] Test connected accounts

### Error Handling
- [ ] Verify all error states display properly
- [ ] Test invalid credentials error
- [ ] Test expired token error
- [ ] Test network error handling
- [x] Add toast notifications for feedback

### Responsive Design
- [ ] Test auth pages on mobile
- [ ] Test settings page on mobile
- [ ] Adjust layouts for smaller screens
- [ ] Test dropdown menus on touch devices

### Accessibility
- [ ] Add proper aria labels
- [ ] Ensure keyboard navigation works
- [ ] Test with screen reader
- [ ] Verify color contrast

---

## Summary

**Total Tasks: ~145**
**Completed: ~125**
**Remaining: ~20 (Testing & Polish)**

- Phase 1 (Foundation): 20 tasks ✅
- Phase 2 (Base Components): 25 tasks ✅
- Phase 3 (Feature Components): 15 tasks ✅
- Phase 4 (User Components): 10 tasks ✅
- Phase 5 (Auth Layout): 5 tasks ✅
- Phase 6 (Sign In): 20 tasks ✅
- Phase 7 (Sign Up): 10 tasks ✅
- Phase 8 (Password Recovery): 10 tasks ✅
- Phase 9 (Verification): 8 tasks ✅
- Phase 10 (Landing): 8 tasks ✅
- Phase 11 (Protected Layout): 8 tasks ✅
- Phase 12 (Dashboard): 5 tasks ✅
- Phase 13 (Settings - Profile): 12 tasks ✅
- Phase 14 (Settings - Security): 25 tasks ✅
- Phase 15 (Settings - Connected): 8 tasks ✅
- Phase 16 (Documentation): 10 tasks ✅
- Phase 17 (Testing): 20 tasks ⏳
