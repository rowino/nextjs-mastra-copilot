# Auth UI Feature Specification

## Overview

Build a complete authentication UI for the Mastra starter pack using Better Auth, shadcn/ui, and React Hook Form. The UI supports multiple authentication methods controlled by feature flags.

## Supported Authentication Methods

| Method | Feature Flag | Description |
|--------|-------------|-------------|
| Email/Password | `NEXT_PUBLIC_ENABLE_EMAIL_PASSWORD` | Standard email/password login with verification |
| Email OTP | `NEXT_PUBLIC_ENABLE_EMAIL_OTP` | One-time password sent via email |
| Magic Link | `NEXT_PUBLIC_ENABLE_MAGIC_LINK` | Passwordless login via email link |
| Two-Factor Auth | `NEXT_PUBLIC_ENABLE_2FA` | TOTP authenticator app + backup codes |
| Passkey | `NEXT_PUBLIC_ENABLE_PASSKEY` | WebAuthn/FIDO2 biometrics and security keys |
| Social Login | Always enabled | GitHub and Google OAuth |

---

## User Stories

### US-1: User Registration

**As a** new user
**I want to** create an account using email/password or social login
**So that** I can access the application

**Acceptance Criteria:**
- [ ] User can enter name, email, and password
- [ ] Password validation: min 8 characters, max 128 characters
- [ ] Form shows inline validation errors
- [ ] User can sign up with GitHub OAuth
- [ ] User can sign up with Google OAuth
- [ ] After signup, user receives verification email (when email verification enabled)
- [ ] User is redirected to dashboard after successful signup
- [ ] Error messages displayed for duplicate email, invalid input

---

### US-2: User Sign In (Email/Password)

**As a** registered user
**I want to** sign in with my email and password
**So that** I can access my account

**Acceptance Criteria:**
- [ ] User can enter email and password
- [ ] "Remember me" checkbox option
- [ ] Link to forgot password page
- [ ] Link to signup page
- [ ] Invalid credentials show error message
- [ ] User is redirected to dashboard after successful login
- [ ] If 2FA enabled, user is prompted for verification code

---

### US-3: Social Sign In

**As a** user
**I want to** sign in with GitHub or Google
**So that** I can access my account without remembering a password

**Acceptance Criteria:**
- [ ] GitHub login button initiates OAuth flow
- [ ] Google login button initiates OAuth flow
- [ ] New users are automatically registered
- [ ] Existing users are logged in
- [ ] Redirect to dashboard after success

---

### US-4: Magic Link Sign In

**As a** user
**I want to** sign in via a link sent to my email
**So that** I can access my account without a password

**Acceptance Criteria:**
- [ ] Feature only visible when `NEXT_PUBLIC_ENABLE_MAGIC_LINK=true`
- [ ] User enters email address
- [ ] Success message: "Check your email for the magic link"
- [ ] Clicking magic link logs user in
- [ ] Link expires after 5 minutes
- [ ] Invalid/expired link shows error page

---

### US-5: Email OTP Sign In

**As a** user
**I want to** sign in using a one-time password sent to my email
**So that** I can access my account securely

**Acceptance Criteria:**
- [ ] Feature only visible when `NEXT_PUBLIC_ENABLE_EMAIL_OTP=true`
- [ ] User enters email address
- [ ] OTP sent to email
- [ ] User enters 6-digit OTP
- [ ] Invalid OTP shows error
- [ ] OTP expires after 5 minutes
- [ ] Max 3 attempts before OTP invalidated

---

### US-6: Passkey Sign In

**As a** user
**I want to** sign in using biometrics or a security key
**So that** I can access my account quickly and securely

**Acceptance Criteria:**
- [ ] Feature only visible when `NEXT_PUBLIC_ENABLE_PASSKEY=true`
- [ ] "Sign in with Passkey" button triggers WebAuthn
- [ ] Browser prompts for biometric/security key
- [ ] Conditional UI (autofill) supported
- [ ] User logged in after successful verification

---

### US-7: Password Reset

**As a** user who forgot their password
**I want to** reset my password via email
**So that** I can regain access to my account

**Acceptance Criteria:**
- [ ] Forgot password link on sign in page
- [ ] User enters email address
- [ ] Reset email sent with link
- [ ] Reset page validates token from URL
- [ ] User enters new password (with confirmation)
- [ ] Password requirements displayed
- [ ] Success message and redirect to sign in
- [ ] Invalid/expired token shows error

---

### US-8: Password Reset via OTP

**As a** user
**I want to** reset my password using an OTP
**So that** I have an alternative to link-based reset

**Acceptance Criteria:**
- [ ] Feature only available when `NEXT_PUBLIC_ENABLE_EMAIL_OTP=true`
- [ ] Option to receive OTP instead of reset link
- [ ] User enters OTP + new password
- [ ] Password updated on success

---

### US-9: Two-Factor Authentication Setup

**As a** security-conscious user
**I want to** enable 2FA on my account
**So that** my account is protected even if my password is compromised

**Acceptance Criteria:**
- [ ] Feature only available when `NEXT_PUBLIC_ENABLE_2FA=true`
- [ ] Enable 2FA button in settings
- [ ] User must enter current password to enable
- [ ] QR code displayed for authenticator app
- [ ] TOTP URI displayed for manual entry
- [ ] User must verify TOTP code to complete setup
- [ ] Backup codes generated and displayed (10 codes)
- [ ] User warned to save backup codes securely
- [ ] 2FA can be disabled (requires password)

---

### US-10: Two-Factor Verification on Login

**As a** user with 2FA enabled
**I want to** enter my verification code after password
**So that** my account remains secure

**Acceptance Criteria:**
- [ ] After password login, 2FA modal/page appears
- [ ] User can enter TOTP code from authenticator app
- [ ] User can use backup code as alternative
- [ ] "Trust this device" checkbox (30 days)
- [ ] Invalid code shows error
- [ ] User logged in after successful verification

---

### US-11: Passkey Management

**As a** user
**I want to** manage my passkeys
**So that** I can add new devices or remove old ones

**Acceptance Criteria:**
- [ ] Feature only available when `NEXT_PUBLIC_ENABLE_PASSKEY=true`
- [ ] List all registered passkeys with names
- [ ] "Add passkey" button triggers WebAuthn registration
- [ ] User can name their passkey
- [ ] "Remove" button deletes passkey (with confirmation)
- [ ] At least one login method must remain

---

### US-12: Profile Management

**As a** logged-in user
**I want to** update my profile information
**So that** my account details are current

**Acceptance Criteria:**
- [ ] User can update display name
- [ ] User can update profile image
- [ ] User can change email (requires verification)
- [ ] User can change password (requires current password)
- [ ] Success/error feedback on save

---

### US-13: Session Management

**As a** security-conscious user
**I want to** view and manage my active sessions
**So that** I can revoke access from unknown devices

**Acceptance Criteria:**
- [ ] List active sessions with device info
- [ ] Current session highlighted
- [ ] "Revoke" button for other sessions
- [ ] "Revoke all other sessions" option

---

### US-14: Connected Accounts

**As a** user
**I want to** manage my linked social accounts
**So that** I can add or remove login methods

**Acceptance Criteria:**
- [ ] List connected providers (GitHub, Google)
- [ ] "Connect" button for unlinked providers
- [ ] "Disconnect" button for linked providers
- [ ] Cannot disconnect if it's the only login method

---

### US-15: Landing Page Header

**As a** visitor
**I want to** see login/signup links or my profile
**So that** I can easily access authentication

**Acceptance Criteria:**
- [ ] Unauthenticated: Show "Sign In" and "Sign Up" buttons
- [ ] Authenticated: Show user avatar dropdown
- [ ] Dropdown contains: Dashboard, Settings, Sign Out
- [ ] Sign out clears session and redirects to landing

---

### US-16: Protected Routes

**As a** developer
**I want** protected pages to require authentication
**So that** sensitive content is secure

**Acceptance Criteria:**
- [ ] Dashboard and settings require authentication
- [ ] Unauthenticated users redirected to sign in
- [ ] After sign in, user returns to intended page
- [ ] Auth state checked on initial load

---

## Component Architecture

```
src/components/
├── auth/
│   ├── auth-card.tsx           # Glassmorphism card wrapper
│   ├── auth-input.tsx          # Input with label and error
│   ├── social-buttons.tsx      # GitHub/Google OAuth
│   ├── divider.tsx             # "or continue with" separator
│   ├── otp-input.tsx           # 6-digit OTP field
│   ├── two-factor-setup.tsx    # QR code + backup codes
│   ├── passkey-button.tsx      # WebAuthn buttons
│   ├── magic-link-form.tsx     # Email input for magic link
│   └── password-strength.tsx   # Password requirements indicator
├── user/
│   ├── user-avatar.tsx         # Avatar with fallback
│   └── user-dropdown.tsx       # Profile menu
└── ui/                         # shadcn components
    ├── button.tsx
    ├── input.tsx
    ├── card.tsx
    ├── dialog.tsx
    ├── tabs.tsx
    ├── dropdown-menu.tsx
    ├── avatar.tsx
    └── ...
```

---

## Page Structure

```
src/app/
├── (auth)/
│   ├── layout.tsx              # Centered auth layout
│   ├── signin/page.tsx
│   ├── signup/page.tsx
│   ├── forgot-password/page.tsx
│   ├── reset-password/page.tsx
│   └── verify/page.tsx
├── (protected)/
│   ├── layout.tsx              # Auth guard + header
│   ├── dashboard/page.tsx
│   └── settings/
│       └── page.tsx
├── layout.tsx                  # Root layout
└── page.tsx                    # Landing page
```

---

## Data Flow

### Authentication Flow
```
1. User submits credentials
2. authClient.signIn.email() called
3. Better Auth validates + creates session
4. Cookie set with session token
5. authClient.useSession() returns user data
6. UI updates to authenticated state
```

### 2FA Flow
```
1. User signs in with password
2. Response contains twoFactorRedirect: true
3. Show 2FA verification modal
4. User enters TOTP code
5. authClient.twoFactor.verifyTotp() called
6. Session fully activated
```

### Feature Flag Handling
```tsx
const config = {
  emailPassword: process.env.NEXT_PUBLIC_ENABLE_EMAIL_PASSWORD === 'true',
  emailOTP: process.env.NEXT_PUBLIC_ENABLE_EMAIL_OTP === 'true',
  magicLink: process.env.NEXT_PUBLIC_ENABLE_MAGIC_LINK === 'true',
  twoFactor: process.env.NEXT_PUBLIC_ENABLE_2FA === 'true',
  passkey: process.env.NEXT_PUBLIC_ENABLE_PASSKEY === 'true',
};

// Use to conditionally render UI
{config.passkey && <PasskeyButton />}
```

---

## Styling Guidelines

### Glassmorphism Base
```tsx
className="bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl shadow-xl"
```

### Form Input
```tsx
className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-white/50"
```

### Primary Button
```tsx
className="bg-white text-gray-900 hover:bg-white/90"
```

### Secondary Button
```tsx
className="bg-white/10 text-white border border-white/20 hover:bg-white/20"
```

---

## Validation Schemas (Zod)

```typescript
const signInSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
});

const signUpSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must be at most 128 characters'),
});

const resetPasswordSchema = z.object({
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must be at most 128 characters'),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});
```

---

## Error Handling

| Error Code | User Message |
|------------|-------------|
| `INVALID_CREDENTIALS` | Invalid email or password |
| `USER_NOT_FOUND` | No account found with this email |
| `EMAIL_NOT_VERIFIED` | Please verify your email first |
| `INVALID_TOKEN` | This link has expired or is invalid |
| `TOO_MANY_ATTEMPTS` | Too many attempts. Please try again later. |
| `INVALID_OTP` | Invalid verification code |
| `TWO_FACTOR_REQUIRED` | (Redirect to 2FA verification) |

---

## Security Considerations

1. **CSRF Protection**: Better Auth handles this automatically
2. **Rate Limiting**: Implement on email sending endpoints
3. **Password Hashing**: Better Auth uses scrypt by default
4. **Session Security**: HttpOnly cookies with secure flag
5. **2FA Backup Codes**: Displayed once, stored encrypted
6. **Passkey Storage**: Public keys only, private keys on device
