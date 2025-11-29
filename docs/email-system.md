# Email System Documentation

## Overview

This project includes a flexible email system built with [React Email](https://react.email) for templates and a multi-provider architecture that supports runtime provider switching. The system is designed for Better Auth integration and provides all necessary authentication flow emails.

## Features

- **Multi-Provider Architecture**: Runtime switching between Resend, Nodemailer (custom SMTP), or console logging
- **Type-Safe**: Zod validation at all boundaries for runtime safety
- **React Email Templates**: Professional, responsive email templates with dark/light mode support
- **Better Auth Integration**: Pre-configured email senders for all auth flows
- **Development Tools**: Email preview route for testing templates
- **Extensible**: Easy to add new providers or templates

## Architecture

### Provider System

The email system uses a provider pattern with three layers:

1. **Base Interface** (`src/lib/email/providers/base.ts`)
   - Defines `EmailProvider` interface
   - Zod schemas for type-safe email parameters
   - Common types and validation

2. **Provider Implementations**
   - `ResendEmailProvider` - Production email delivery via Resend API
   - `NodemailerEmailProvider` - Custom SMTP servers
   - `ConsoleEmailProvider` - Development mode logging (no actual sending)

3. **Provider Factory** (`src/lib/email/providers/factory.ts`)
   - Runtime selection based on `EMAIL_PROVIDER` env variable
   - Singleton pattern for performance
   - Automatic fallback to console in development

### Email Templates

All templates are located in `src/emails/` and built with React Email:

| Template | File | Use Case |
|----------|------|----------|
| Email OTP | `email-otp.tsx` | One-time password for sign-in/sign-up |
| Magic Link | `magic-link.tsx` | Passwordless authentication |
| Password Reset | `password-reset.tsx` | Password recovery flow |
| Email Verification | `email-verification.tsx` | Verify email ownership |
| Two-Factor OTP | `two-factor-otp.tsx` | 2FA authentication code |
| Organization Invitation | `invitation-email.tsx` | Team member invitations |

**Shared Styles**: All templates use common styles from `src/emails/shared/styles.ts` with CSS variables for theming.

### Email Utility Layer

High-level functions in `src/lib/email/templates/` provide type-safe APIs for each email type:

```typescript
// Example: Send Email OTP
import { sendEmailOTP } from "@/lib/email";

await sendEmailOTP({
  to: "user@example.com",
  otp: "123456",
  type: "sign-in",
  expiresInMinutes: 10, // optional, defaults to 10
});
```

Each sender function:
- Validates input with Zod schemas
- Renders React template to HTML
- Sends via configured provider
- Throws on validation or send failure

## Configuration

### Environment Variables

Add these to your `.env` file:

```bash
# Required for all providers
EMAIL_FROM=noreply@yourdomain.com
APP_URL=http://localhost:3000

# Provider Selection (optional, defaults to "resend")
EMAIL_PROVIDER=resend  # Options: "resend", "nodemailer"

# Resend Configuration (if EMAIL_PROVIDER=resend)
RESEND_API_KEY=re_xxxxx

# Nodemailer Configuration (if EMAIL_PROVIDER=nodemailer)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURE=false  # true for port 465, false for other ports
SMTP_USER=your-username@example.com
SMTP_PASS=your-smtp-password
```

### Development Mode

In development (`NODE_ENV=development`) without `EMAIL_PROVIDER` set, emails are logged to console instead of being sent. This allows local testing without SMTP setup.

## Usage

### Sending Emails

Import and use the template-specific sender functions:

```typescript
import {
  sendEmailOTP,
  sendMagicLink,
  sendPasswordReset,
  sendEmailVerification,
  sendTwoFactorOTP,
  sendInvitationEmail,
} from "@/lib/email";

// Email OTP
await sendEmailOTP({
  to: "user@example.com",
  otp: "123456",
  type: "sign-in", // or "sign-up"
  expiresInMinutes: 10,
});

// Magic Link
await sendMagicLink({
  to: "user@example.com",
  magicLink: "https://yourapp.com/magic?token=xyz",
  expiresInMinutes: 10,
});

// Password Reset
await sendPasswordReset({
  to: "user@example.com",
  resetLink: "https://yourapp.com/reset?token=abc",
  userName: "John Doe", // optional
  expiresInMinutes: 30,
});

// Email Verification
await sendEmailVerification({
  to: "user@example.com",
  verificationLink: "https://yourapp.com/verify?token=def",
  userName: "Jane Smith", // optional
});

// Two-Factor OTP
await sendTwoFactorOTP({
  to: "user@example.com",
  otp: "654321",
  userName: "Alice", // optional
  expiresInMinutes: 5,
});

// Organization Invitation
await sendInvitationEmail({
  to: "newmember@example.com",
  organizationName: "Acme Corp",
  inviterName: "John Doe",
  role: "admin",
  inviteLink: "https://yourapp.com/accept-invite?token=ghi",
  expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
});
```

### Generic Email Sending

For custom emails not covered by templates:

```typescript
import { sendEmail } from "@/lib/email";
import { MyCustomEmail } from "@/emails/my-custom-email";

await sendEmail({
  to: "recipient@example.com",
  subject: "Custom Subject",
  react: MyCustomEmail({ prop1: "value1" }),
});
```

### Preview Emails (Development Only)

Access the preview route to view rendered templates in your browser:

**Base URL**: `http://localhost:3000/api/email/preview`

**Examples**:

```bash
# Invitation Email
http://localhost:3000/api/email/preview?template=invitation&organizationName=Acme&inviterName=John&role=admin

# Email OTP
http://localhost:3000/api/email/preview?template=email-otp&otp=123456&type=sign-in

# Magic Link
http://localhost:3000/api/email/preview?template=magic-link&magicLink=https://example.com/magic

# Password Reset
http://localhost:3000/api/email/preview?template=password-reset&resetLink=https://example.com/reset&userName=John

# Email Verification
http://localhost:3000/api/email/preview?template=email-verification&verificationLink=https://example.com/verify

# Two-Factor OTP
http://localhost:3000/api/email/preview?template=two-factor-otp&otp=654321&userName=Alice
```

**Query Parameters**:
- `template` - Template name (required)
- Template-specific params (e.g., `otp`, `userName`, `magicLink`)

**Security**: This route returns 403 in production mode.

## Adding a New Email Provider

### Step 1: Create Provider Implementation

Create `src/lib/email/providers/your-provider.ts`:

```typescript
import { z } from "zod";
import type { EmailProvider, EmailSendParams } from "./base";

// Define provider-specific config schema
const YourProviderConfigSchema = z.object({
  apiKey: z.string().min(1, "YOUR_PROVIDER_API_KEY is required"),
  // Add other required config
});

export class YourProviderEmailProvider implements EmailProvider {
  private config: z.infer<typeof YourProviderConfigSchema>;

  constructor() {
    this.config = YourProviderConfigSchema.parse({
      apiKey: process.env.YOUR_PROVIDER_API_KEY,
    });
    this.validateConfig();
  }

  validateConfig(): void {
    // Additional validation beyond Zod if needed
    if (!this.config.apiKey.startsWith("yp_")) {
      throw new Error("YOUR_PROVIDER_API_KEY must start with 'yp_'");
    }
  }

  async send(params: EmailSendParams): Promise<void> {
    // Implement sending logic using provider SDK
    const yourProviderClient = createClient(this.config.apiKey);

    await yourProviderClient.send({
      from: params.from,
      to: params.to,
      subject: params.subject,
      html: params.html,
    });
  }
}
```

### Step 2: Register in Factory

Update `src/lib/email/providers/factory.ts`:

```typescript
import { YourProviderEmailProvider } from "./your-provider";

export function getEmailProvider(): EmailProvider {
  // ... existing singleton check ...

  const providerType = process.env.EMAIL_PROVIDER || "resend";

  switch (providerType) {
    case "resend":
      providerInstance = new ResendEmailProvider();
      break;
    case "nodemailer":
      providerInstance = new NodemailerEmailProvider();
      break;
    case "your-provider": // Add this case
      providerInstance = new YourProviderEmailProvider();
      break;
    default:
      throw new Error(`Unknown email provider: ${providerType}`);
  }

  return providerInstance;
}
```

### Step 3: Update Environment Variables

Add to `.env.example`:

```bash
# Your Provider (if EMAIL_PROVIDER=your-provider)
YOUR_PROVIDER_API_KEY=yp_xxxxx
```

### Step 4: Install Dependencies (if needed)

```bash
pnpm add your-provider-sdk
```

### Step 5: Update Documentation

Add provider details to this file and `README.md`.

## Adding a New Email Template

### Step 1: Create React Email Template

Create `src/emails/your-template.tsx`:

```typescript
import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Button,
} from "@react-email/components";
import { styles } from "./shared/styles";

export interface YourTemplateProps {
  userName?: string;
  actionLink: string;
}

export function YourTemplate({ userName, actionLink }: YourTemplateProps) {
  return (
    <Html>
      <Head />
      <Body style={styles.main}>
        <Container style={styles.container}>
          <Section>
            <Text style={styles.h1}>
              {userName ? `Hello ${userName}!` : "Hello!"}
            </Text>
            <Text style={styles.text}>
              Custom message here.
            </Text>
            <Button href={actionLink} style={styles.button}>
              Take Action
            </Button>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

export default YourTemplate;
```

**Tips**:
- Use `styles` from `src/emails/shared/styles.ts` for consistency
- Test with preview route before integration
- Support optional `userName` for personalization
- Always include plain text fallback for links

### Step 2: Create Template Sender Function

Create `src/lib/email/templates/your-template.ts`:

```typescript
import { z } from "zod";
import { sendEmail } from "../index";
import { YourTemplate } from "@/emails/your-template";

const SendYourTemplateParamsSchema = z.object({
  to: z.string().email(),
  actionLink: z.string().url(),
  userName: z.string().optional(),
});

type SendYourTemplateParams = z.infer<typeof SendYourTemplateParamsSchema>;

export async function sendYourTemplate(params: SendYourTemplateParams) {
  const validated = SendYourTemplateParamsSchema.parse(params);

  await sendEmail({
    to: validated.to,
    subject: "Your Custom Subject",
    react: YourTemplate({
      actionLink: validated.actionLink,
      userName: validated.userName,
    }),
  });
}
```

### Step 3: Export from Index

Update `src/lib/email/index.ts`:

```typescript
export { sendYourTemplate } from "./templates/your-template";
```

### Step 4: Add to Preview Route

Update `src/app/api/email/preview/route.ts`:

```typescript
import { YourTemplate } from "@/emails/your-template";

// In GET handler switch statement
case "your-template":
  html = await render(
    YourTemplate({
      actionLink: searchParams.get("actionLink") || "https://example.com/action",
      userName: searchParams.get("userName") || undefined,
    })
  );
  break;

// Update available templates list
available: [
  "invitation",
  "email-otp",
  "magic-link",
  "password-reset",
  "email-verification",
  "two-factor-otp",
  "your-template", // Add here
]
```

### Step 5: Test

```bash
# Preview in browser
http://localhost:3000/api/email/preview?template=your-template&userName=Test&actionLink=https://example.com
```

## Better Auth Integration

All auth flows are pre-configured in `src/lib/auth.ts`:

| Auth Flow | Plugin | Sender Function | Line Reference |
|-----------|--------|-----------------|----------------|
| Email OTP | `emailOTP` | `sendEmailOTP()` | auth.ts:28-33 |
| Magic Link | `magicLink` | `sendMagicLink()` | auth.ts:42-46 |
| Two-Factor | `twoFactor` | `sendTwoFactorOTP()` | auth.ts:56-61 |
| Password Reset | `emailAndPassword` | `sendPasswordReset()` | auth.ts:103-108 |
| Email Verification | `emailVerification` | `sendEmailVerification()` | auth.ts:112-117 |

**Feature Flags**: Auth methods are controlled via environment variables:
- `NEXT_PUBLIC_ENABLE_EMAIL_OTP`
- `NEXT_PUBLIC_ENABLE_MAGIC_LINK`
- `NEXT_PUBLIC_ENABLE_2FA`
- `NEXT_PUBLIC_ENABLE_EMAIL_PASSWORD`

See `.env.example` for complete configuration.

## Error Handling

The system uses a **fail-fast** approach:

- **Validation errors**: Zod throws `ZodError` with detailed messages
- **Provider errors**: Thrown by provider implementations (e.g., invalid API key)
- **Send errors**: Network failures, API errors bubble up to caller

**Recommendation**: Wrap email calls in try-catch blocks in production:

```typescript
try {
  await sendEmailOTP({
    to: user.email,
    otp: generatedOTP,
    type: "sign-in",
  });
} catch (error) {
  console.error("Failed to send OTP:", error);
  // Handle error (e.g., show user-friendly message, retry, fallback)
  throw new Error("Failed to send verification code. Please try again.");
}
```

## Testing

### Unit Testing Email Templates

```typescript
import { render } from "@react-email/render";
import { EmailOTPEmail } from "@/emails/email-otp";

describe("EmailOTPEmail", () => {
  it("renders OTP correctly", async () => {
    const html = await render(
      EmailOTPEmail({
        otp: "123456",
        type: "sign-in",
        expiresInMinutes: 10,
      })
    );

    expect(html).toContain("123456");
    expect(html).toContain("10 minutes");
  });
});
```

### Integration Testing Senders

Mock the provider in tests:

```typescript
import { sendEmailOTP } from "@/lib/email";
import * as factory from "@/lib/email/providers/factory";

describe("sendEmailOTP", () => {
  it("calls provider with correct params", async () => {
    const mockSend = jest.fn();
    jest.spyOn(factory, "getEmailProvider").mockReturnValue({
      send: mockSend,
      validateConfig: jest.fn(),
    });

    await sendEmailOTP({
      to: "test@example.com",
      otp: "123456",
      type: "sign-in",
    });

    expect(mockSend).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "test@example.com",
        subject: expect.stringContaining("123456"),
      })
    );
  });
});
```

### Manual Testing with Preview Route

Use the preview route during development to visually inspect templates before sending real emails.

## Troubleshooting

### Emails Not Sending in Development

**Problem**: No emails in inbox during local testing.

**Solution**: Check if `EMAIL_PROVIDER` is set in `.env`. Without it, development mode logs to console instead of sending.

```bash
# To actually send in development
EMAIL_PROVIDER=resend
RESEND_API_KEY=your_key
```

### SMTP Connection Errors

**Problem**: `ECONNREFUSED` or authentication errors with nodemailer.

**Solutions**:
1. Verify `SMTP_HOST` and `SMTP_PORT` are correct
2. Check `SMTP_SECURE`: use `true` for port 465, `false` for 587/25
3. Enable "less secure app access" or generate app-specific password (Gmail)
4. Check firewall rules blocking SMTP ports
5. Test SMTP credentials with a tool like `telnet` or `openssl s_client`

### Provider Validation Errors

**Problem**: `Provider configuration error: RESEND_API_KEY must start with 're_'`

**Solution**: Check your API key format. Resend keys start with `re_`, ensure you're using the correct key.

### Zod Validation Errors

**Problem**: `Invalid email format` or `URL must be valid`

**Solution**: Validate input before calling sender functions:

```typescript
const email = userInput.trim().toLowerCase();
if (!z.string().email().safeParse(email).success) {
  throw new Error("Invalid email address");
}
```

### Preview Route 403 Error

**Problem**: Email preview returns 403 Forbidden.

**Solution**: Preview route only works in development. Check `NODE_ENV=development` is set.

## Security Best Practices

1. **Environment Variables**: Never commit `.env` files. Use `.env.example` for templates.
2. **Email Validation**: Always validate email addresses with Zod schemas before sending.
3. **Rate Limiting**: Implement rate limits on auth endpoints to prevent abuse.
4. **Link Expiration**: Use short expiration times for magic links and reset tokens (10-30 minutes).
5. **HTTPS Only**: Ensure `APP_URL` uses HTTPS in production.
6. **Preview Route**: The preview route automatically blocks in production, but verify this before deploying.

## Performance

- **Provider Singleton**: The factory creates one provider instance per runtime, avoiding reconnection overhead.
- **HTML Caching**: React Email templates are rendered on-demand (no caching). For high-volume apps, consider caching rendered HTML with template variable placeholders.
- **Async Sending**: All `send*` functions are async. Use `Promise.allSettled()` for batch sends:

```typescript
const results = await Promise.allSettled([
  sendEmailOTP({ to: "user1@example.com", otp: "123456", type: "sign-in" }),
  sendEmailOTP({ to: "user2@example.com", otp: "654321", type: "sign-in" }),
]);

// Handle individual failures
results.forEach((result, index) => {
  if (result.status === "rejected") {
    console.error(`Failed to send email ${index}:`, result.reason);
  }
});
```

## Migration from Old System

If migrating from a previous email implementation:

1. **Search for old imports**: `grep -r "from \"@/lib/email\"" src/` (excluding `src/lib/email/`)
2. **Replace sender calls**: Old `sendInvitationEmail()` remains backward compatible
3. **Update env vars**: Add `EMAIL_PROVIDER` and SMTP vars if using nodemailer
4. **Test all flows**: Verify invitation, auth emails work end-to-end
5. **Remove old files**: Delete deprecated email utility files after migration

## Resources

- [React Email Documentation](https://react.email/docs/introduction)
- [Better Auth Email Plugin](https://www.better-auth.com/docs/plugins/email-otp)
- [Resend API Documentation](https://resend.com/docs)
- [Nodemailer Documentation](https://nodemailer.com/about/)

## Support

For issues or questions:
1. Check this documentation
2. Review preview route for template rendering issues
3. Check Better Auth logs for integration problems
4. Verify environment variables are set correctly
5. Test with `ConsoleEmailProvider` to isolate provider issues
