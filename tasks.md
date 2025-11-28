# Email System Implementation Tasks

## Phase 1: Provider Infrastructure ✅
- [x] 1. Create `src/lib/email/providers/base.ts` - Interface + Zod schemas
- [x] 2. Create `src/lib/email/providers/resend.ts` - Wrap existing Resend
- [x] 3. Install: `pnpm add nodemailer @types/nodemailer`
- [x] 4. Create `src/lib/email/providers/nodemailer.ts` - SMTP implementation
- [x] 5. Create `src/lib/email/providers/factory.ts` - Runtime provider selection

## Phase 2: Email Templates ✅
- [x] 6. Create `src/emails/shared/styles.ts` - Extract from invitation-email.tsx
- [x] 7. Create `src/emails/email-otp.tsx`
- [x] 8. Create `src/emails/magic-link.tsx`
- [x] 9. Create `src/emails/password-reset.tsx`
- [x] 10. Create `src/emails/email-verification.tsx`
- [x] 11. Create `src/emails/two-factor-otp.tsx`

## Phase 3: Email Utility Integration ✅
- [x] 12. Create `src/lib/email/index.ts` - Generic sendEmail()
- [x] 13. Create `src/lib/email/templates/invitation.ts` - Migrate existing
- [x] 14. Create `src/lib/email/templates/email-otp.ts`
- [x] 15. Create `src/lib/email/templates/magic-link.ts`
- [x] 16. Create `src/lib/email/templates/password-reset.ts`
- [x] 17. Create `src/lib/email/templates/email-verification.ts`
- [x] 18. Create `src/lib/email/templates/two-factor-otp.ts`

## Phase 4: Better Auth Integration ✅
- [x] 19. Update `src/lib/auth.ts`:
  - [x] Add imports for email senders
  - [x] Line 22: Replace @claude-todo with `sendEmailOTP()`
  - [x] Line 35: Replace @claude-todo with `sendMagicLink()`
  - [x] Line 49: Replace @claude-todo with `sendTwoFactorOTP()`
  - [x] Line 95: Replace @claude-todo with `sendPasswordReset()`
  - [x] Line 103: Replace @claude-todo with `sendEmailVerification()`

## Phase 5: Developer Experience ✅
- [x] 20. Create `src/app/api/email/preview/route.ts` - Preview all templates
- [x] 21. Update `.env.example` - Add EMAIL_PROVIDER, SMTP_* vars
- [x] 22. Create `docs/email-system.md` - Comprehensive guide

## Phase 6: Migration & Cleanup
- [ ] 23. Verify `src/app/api/organization/[orgId]/members/route.ts` import still works
- [ ] 24. Delete `src/lib/email.ts`
- [ ] 25. Search for other imports of old email.ts
- [ ] 26. Test all flows: invitations + 5 auth emails
