# Email System Implementation Plan

## Overview

Implement a comprehensive email system for Better Auth with React Email templates, supporting multiple providers (Resend, Nodemailer) with runtime switching via environment variables. This extends the existing organization invitation email setup to support 5 auth flows.

## User Requirements

- ✅ Runtime provider switching via `EMAIL_PROVIDER` env variable
- ✅ Custom SMTP config for Nodemailer (no Ethereal auto-config)
- ✅ Email template preview route at `/api/email/preview`
- ✅ Single provider, fail fast (no fallback logic)
- ✅ Documentation for adding providers and sending emails

## Current State

**Working:**
- React Email v5.0.5 + Resend for organization invitations
- Template: `src/emails/invitation-email.tsx`
- Sender: `src/lib/email.ts` with `sendInvitationEmail()`

**Needs Implementation:**
- 5 @claude-todo comments in `src/lib/auth.ts` (lines 22, 35, 49, 95, 103)
- Email OTP, Magic Link, Password Reset, Email Verification, 2FA templates
- Multi-provider architecture with runtime switching

## Architecture

### Provider System

**Interface** (`src/lib/email/providers/base.ts`):
```typescript
interface EmailProvider {
  send(params: EmailSendParams): Promise<void>;
  validateConfig(): void;
}

const EmailSendParamsSchema = z.object({
  from: z.string().email(),
  to: z.string().email(),
  subject: z.string().min(1),
  html: z.string().min(1),
});
```

**Factory** (`src/lib/email/providers/factory.ts`):
- Runtime switching based on `EMAIL_PROVIDER` env var
- Returns console logger in development mode
- Singleton pattern for provider reuse

**Implementations:**
- `ResendProvider` - Wraps existing Resend client
- `NodemailerProvider` - Custom SMTP support (requires `nodemailer` install)

### Email Templates

Create 5 new React Email templates following `invitation-email.tsx` pattern:

1. **email-otp.tsx** - 6-digit OTP for sign-in/sign-up
2. **magic-link.tsx** - Passwordless login link
3. **password-reset.tsx** - Secure reset link
4. **email-verification.tsx** - Confirm email address
5. **two-factor-otp.tsx** - 2FA authentication code

**Shared Styling:**
- Extract common styles to `src/emails/shared/styles.ts`
- Maintain CSS variable pattern for dark/light mode
- Consistent layout structure

### Email Utility Refactoring

**New Structure:**
```
src/lib/email/
├── index.ts                    # Generic sendEmail()
├── providers/                  # Provider implementations
└── templates/                  # Template-specific senders
    ├── invitation.ts           # Migrated from old email.ts
    ├── email-otp.ts
    ├── magic-link.ts
    ├── password-reset.ts
    ├── email-verification.ts
    └── two-factor-otp.ts
```

**Old file to delete:** `src/lib/email.ts` (replaced by new structure)

## Implementation Steps (26 Tasks)

### Phase 1: Provider Infrastructure
1. Create `src/lib/email/providers/base.ts` - Interface + Zod schemas
2. Create `src/lib/email/providers/resend.ts` - Wrap existing Resend
3. Install: `pnpm add nodemailer @types/nodemailer`
4. Create `src/lib/email/providers/nodemailer.ts` - SMTP implementation
5. Create `src/lib/email/providers/factory.ts` - Runtime provider selection

### Phase 2: Email Templates
6. Create `src/emails/shared/styles.ts` - Extract from invitation-email.tsx
7. Create `src/emails/email-otp.tsx`
8. Create `src/emails/magic-link.tsx`
9. Create `src/emails/password-reset.tsx`
10. Create `src/emails/email-verification.tsx`
11. Create `src/emails/two-factor-otp.tsx`

### Phase 3: Email Utility Integration
12. Create `src/lib/email/index.ts` - Generic sendEmail()
13. Create `src/lib/email/templates/invitation.ts` - Migrate existing
14. Create `src/lib/email/templates/email-otp.ts`
15. Create `src/lib/email/templates/magic-link.ts`
16. Create `src/lib/email/templates/password-reset.ts`
17. Create `src/lib/email/templates/email-verification.ts`
18. Create `src/lib/email/templates/two-factor-otp.ts`

### Phase 4: Better Auth Integration
19. Update `src/lib/auth.ts`:
    - Add imports for email senders
    - Line 22: Replace @claude-todo with `sendEmailOTP()`
    - Line 35: Replace @claude-todo with `sendMagicLink()`
    - Line 49: Replace @claude-todo with `sendTwoFactorOTP()`
    - Line 95: Replace @claude-todo with `sendPasswordReset()`
    - Line 103: Replace @claude-todo with `sendEmailVerification()`

### Phase 5: Developer Experience
20. Create `src/app/api/email/preview/route.ts` - Preview all templates
21. Update `.env.example` - Add EMAIL_PROVIDER, SMTP_* vars
22. Create `docs/email-system.md` - Comprehensive guide

### Phase 6: Migration & Cleanup
23. Verify `src/app/api/organization/[orgId]/members/route.ts` import still works
24. Delete `src/lib/email.ts`
25. Search for other imports of old email.ts
26. Test all flows: invitations + 5 auth emails

## Environment Variables

Add to `.env.example`:
```bash
# Email Provider: "resend" or "nodemailer"
EMAIL_PROVIDER=resend

# Common
EMAIL_FROM=noreply@yourdomain.com
APP_URL=http://localhost:3000

# Resend (if EMAIL_PROVIDER=resend)
RESEND_API_KEY=re_xxxxx

# Nodemailer (if EMAIL_PROVIDER=nodemailer)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-username@example.com
SMTP_PASS=your-smtp-password
```

## File Structure

**New Files (25):**
```
src/lib/email/
  index.ts, providers/{base,resend,nodemailer,factory}.ts
  templates/{invitation,email-otp,magic-link,password-reset,email-verification,two-factor-otp}.ts
src/emails/
  shared/styles.ts
  {email-otp,magic-link,password-reset,email-verification,two-factor-otp}.tsx
src/app/api/email/preview/route.ts
docs/email-system.md
```

**Modified Files (3):**
```
src/lib/auth.ts - Implement 5 callbacks
src/app/api/organization/[orgId]/members/route.ts - Verify import
.env.example - Add email env vars
```

**Deleted Files (1):**
```
src/lib/email.ts - Replaced by new structure
```

## Documentation Structure

Create `docs/email-system.md` with:
1. **Quick Start** - Setup in 5 minutes
2. **Architecture** - How the system works
3. **Sending Emails** - API reference with examples
4. **Adding Providers** - Step-by-step guide
5. **Creating Templates** - Template development guide
6. **Provider Guides** - Resend, Gmail, SendGrid, custom SMTP
7. **Troubleshooting** - Common issues
8. **Testing** - Manual and automated strategies
9. **Security** - Best practices

## Testing Checklist

**Provider Switching:**
- [ ] EMAIL_PROVIDER=resend → ResendProvider used
- [ ] EMAIL_PROVIDER=nodemailer → NodemailerProvider used
- [ ] EMAIL_PROVIDER=invalid → Error thrown
- [ ] Missing credentials → Clear error messages

**Auth Flows:**
- [ ] Email OTP sign-in/sign-up
- [ ] Magic link login
- [ ] Password reset
- [ ] Email verification
- [ ] 2FA OTP

**Organization:**
- [ ] Invitation emails still work

**Preview Route:**
- [ ] All 6 templates render correctly
- [ ] Query params customize props
- [ ] Production mode throws error

## Critical Files to Read

Before implementation:
1. `src/lib/email.ts:1-51` - Current Resend pattern
2. `src/emails/invitation-email.tsx:1-137` - Template structure
3. `src/lib/auth.ts:18-108` - Callback signatures
4. `src/app/api/organization/[orgId]/members/route.ts:12,170-177` - Usage pattern
5. `.env.example:1-27` - Env var documentation style

## Success Criteria

1. ✅ All 5 Better Auth callbacks implemented
2. ✅ Runtime provider switching works
3. ✅ Organization invitations unchanged
4. ✅ Preview route renders all templates
5. ✅ Development logs to console only
6. ✅ Production sends via provider
7. ✅ Complete documentation
8. ✅ Zero @claude-todo comments
9. ✅ Type safety with Zod validation
