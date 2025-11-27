# Authentication

This project uses [Better Auth](https://www.better-auth.com/) for authentication, integrated with Cloudflare D1 via Drizzle ORM.

## Features

The following authentication methods are supported and can be toggled via environment variables:

- **Email & Password**: Standard email/password login.
- **Social Authentication**: GitHub and Google (extensible to others).
- **Email OTP**: One-Time Password sent via email.
- **Two-Factor Authentication (2FA)**: TOTP (Authenticator App) and Backup Codes.
- **Magic Link**: Passwordless login via email link.
- **Passkeys**: WebAuthn/FIDO2 passwordless login (Biometrics, Security Keys).

## Configuration

### Environment Variables

Create a `.env` file based on `.env.example`.

#### Core

- `BETTER_AUTH_SECRET`: A secure random string (generate with `openssl rand -base64 32`).
- `BETTER_AUTH_URL`: The base URL of your application (e.g., `http://localhost:3000`).

#### Social Providers

Social providers are automatically enabled when their credentials are set:

- `GITHUB_CLIENT_ID` & `GITHUB_CLIENT_SECRET`
- `GOOGLE_CLIENT_ID` & `GOOGLE_CLIENT_SECRET`

#### Feature Flags

Enable or disable specific authentication features using these flags:

```env
NEXT_PUBLIC_ENABLE_EMAIL_PASSWORD=true
NEXT_PUBLIC_ENABLE_EMAIL_OTP=true
NEXT_PUBLIC_ENABLE_2FA=true
NEXT_PUBLIC_ENABLE_MAGIC_LINK=true
NEXT_PUBLIC_ENABLE_PASSKEY=true
```

## Page Structure

The auth UI is organized into route groups:

```
src/app/
├── (auth)/                    # Public auth pages
│   ├── layout.tsx             # Centered layout with auth redirect
│   ├── signin/page.tsx        # Sign in with all methods
│   ├── signup/page.tsx        # User registration
│   ├── forgot-password/page.tsx
│   ├── reset-password/page.tsx
│   └── verify/page.tsx        # Email/OTP verification
├── (protected)/               # Auth-guarded pages
│   ├── layout.tsx             # Auth guard + header
│   ├── dashboard/page.tsx
│   └── settings/page.tsx      # Profile & security settings
└── page.tsx                   # Landing page with auth header
```

## Components

Auth components are located in `src/components/auth/`:

| Component | Description |
|-----------|-------------|
| `auth-card.tsx` | Glassmorphism card wrapper for forms |
| `auth-input.tsx` | Form input with label and error state |
| `social-buttons.tsx` | GitHub/Google OAuth buttons |
| `divider.tsx` | "or continue with" separator |
| `otp-input.tsx` | 6-digit OTP input field |
| `password-strength.tsx` | Password requirements indicator |
| `two-factor-setup.tsx` | QR code + backup codes for 2FA |
| `passkey-button.tsx` | WebAuthn sign-in/register buttons |
| `magic-link-form.tsx` | Email input for magic link |

User components in `src/components/user/`:

| Component | Description |
|-----------|-------------|
| `user-avatar.tsx` | Avatar with initials fallback |
| `user-dropdown.tsx` | Profile menu with sign out |

## Customization

### Styling

All auth components use glassmorphism styling. To customize, modify these patterns:

**Card background:**
```tsx
// src/components/auth/auth-card.tsx
className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl"
```

**Input fields:**
```tsx
// src/components/auth/auth-input.tsx
className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
```

**Buttons:**
```tsx
// Primary: bg-white text-gray-900
// Secondary: bg-white/10 text-white border-white/20
```

### Replacing Components

To use custom components, create your own and update the imports in the page files:

```tsx
// src/app/(auth)/signin/page.tsx
import { MyCustomInput } from "@/components/my-custom-input";

// Replace AuthInput usage with your component
```

### Adding Auth Methods

To add a new authentication method:

1. Enable the plugin in `src/lib/auth.ts`
2. Add the client plugin in `src/lib/auth-client.ts`
3. Update the feature flag in `src/lib/auth-config.ts`
4. Add UI controls in the sign-in page

### Modifying Routes

Routes follow Next.js App Router conventions. To change paths:

1. Rename the folder (e.g., `signin` → `login`)
2. Update all `Link` components and redirects
3. Update the 2FA redirect in `src/lib/auth-client.ts`

## Database

The authentication schema is defined in `src/db/schema.ts`. It includes tables for:

- `user`: Stores user profile and settings (including `twoFactorEnabled`).
- `session`: Active sessions.
- `account`: Linked social accounts.
- `verification`: OTPs and verification tokens.
- `twoFactor`: 2FA secrets and backup codes.
- `passkey`: Registered passkeys.

### Managing Migrations

After modifying the schema, generate a new migration:

```bash
pnpm db:generate
```

Apply migrations to the local D1 database:

```bash
pnpm db:migrate
```

## Email Sending

Email sending functions are currently stubs that log to console. For production, implement these in `src/lib/auth.ts`:

### Password Reset

```typescript
emailAndPassword: {
  async sendResetPassword({ user, url }) {
    await sendEmail({
      to: user.email,
      subject: "Reset your password",
      html: `<a href="${url}">Reset password</a>`,
    });
  },
},
```

### Email Verification

```typescript
emailVerification: {
  sendVerificationEmail: async ({ user, url }) => {
    await sendEmail({
      to: user.email,
      subject: "Verify your email",
      html: `<a href="${url}">Verify email</a>`,
    });
  },
},
```

### Email OTP

```typescript
emailOTP({
  async sendVerificationOTP({ email, otp, type }) {
    await sendEmail({
      to: email,
      subject: `Your ${type} code: ${otp}`,
      html: `Your code is: <strong>${otp}</strong>`,
    });
  },
}),
```

### Magic Link

```typescript
magicLink({
  async sendMagicLink({ email, url }) {
    await sendEmail({
      to: email,
      subject: "Sign in to your account",
      html: `<a href="${url}">Sign in</a>`,
    });
  },
}),
```

### 2FA OTP

```typescript
twoFactor({
  otpOptions: {
    async sendOTP({ user, otp }) {
      await sendEmail({
        to: user.email,
        subject: "Your 2FA code",
        html: `Your code is: <strong>${otp}</strong>`,
      });
    },
  },
}),
```

## Usage

### Client-Side

Import `authClient` from `@/lib/auth-client`.

#### Get Session

```typescript
const { data: session, isPending } = authClient.useSession();

if (session) {
  console.log(session.user.email);
}
```

#### Sign In (Email/Password)

```typescript
const { data, error } = await authClient.signIn.email({
  email: "user@example.com",
  password: "password123",
  callbackURL: "/dashboard",
});
```

#### Sign Up

```typescript
const { data, error } = await authClient.signUp.email({
  name: "John Doe",
  email: "user@example.com",
  password: "password123",
  callbackURL: "/dashboard",
});
```

#### Sign Out

```typescript
await authClient.signOut({
  fetchOptions: {
    onSuccess: () => {
      window.location.href = "/";
    },
  },
});
```

#### Social Login

```typescript
await authClient.signIn.social({
  provider: "github", // or "google"
  callbackURL: "/dashboard",
});
```

#### Magic Link

```typescript
await authClient.signIn.magicLink({
  email: "user@example.com",
  callbackURL: "/dashboard",
});
```

#### Passkey

```typescript
// Register a passkey
await authClient.passkey.addPasskey({
  name: "My MacBook",
});

// Sign in with passkey
await authClient.signIn.passkey();
```

#### Two-Factor Authentication

```typescript
// Enable 2FA
const { data } = await authClient.twoFactor.enable({
  password: "current-password",
});
// data.totpURI can be used to generate a QR code
// data.backupCodes contains recovery codes

// Verify TOTP
await authClient.twoFactor.verifyTotp({
  code: "123456",
  trustDevice: true,
});
```

### Server-Side

Import `getAuth` from `@/lib/auth` and pass the D1 database instance.

```typescript
import { getAuth } from "@/lib/auth";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { headers } from "next/headers";

export async function someServerAction() {
  const { env } = await getCloudflareContext();
  const auth = getAuth(env.D1Database);

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("Unauthorized");
  }

  return session.user;
}
```

## Protected Routes

The `(protected)` route group includes an auth guard in its layout. To protect additional routes:

1. Place them inside the `(protected)` folder, or
2. Use the session check pattern:

```typescript
"use client";

import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ProtectedPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  useEffect(() => {
    if (!isPending && !session) {
      router.replace("/signin");
    }
  }, [session, isPending, router]);

  if (isPending) return <div>Loading...</div>;
  if (!session) return null;

  return <div>Protected content</div>;
}
```

## Toasts

The project uses [Sonner](https://sonner.emilkowal.ski/) for toast notifications. Add the `Toaster` component to your layout:

```typescript
import { Toaster } from "@/components/ui/sonner";

export default function Layout({ children }) {
  return (
    <>
      {children}
      <Toaster />
    </>
  );
}
```

Use toasts in your components:

```typescript
import { toast } from "sonner";

toast.success("Profile updated");
toast.error("Failed to save", { description: "Please try again" });
```
