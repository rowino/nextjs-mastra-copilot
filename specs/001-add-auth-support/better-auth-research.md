# Better-Auth Library Research Report

## Executive Summary

Better-auth is a comprehensive TypeScript-first authentication framework that provides extensive features for building secure authentication systems. It has strong support for Cloudflare D1, Next.js App Router, OAuth providers (Google, GitHub), and includes a rich plugin ecosystem. While it provides many built-in features, some advanced requirements like custom password validation and exponential backoff rate limiting require custom implementation.

---

## 1. Feature Support Matrix

### ✅ Built-in Features

| Feature | Support Level | Notes |
|---------|--------------|-------|
| Email/Password Auth | ✅ Built-in | Configurable min/max password length (default: 8-128 chars) |
| Google OAuth | ✅ Built-in | Full integration via `socialProviders.google` |
| GitHub OAuth | ✅ Built-in | Full integration via `socialProviders.github` |
| Account Linking | ✅ Built-in | Links accounts with same verified email |
| Email Verification | ✅ Built-in | Optional requirement before login |
| Password Reset | ✅ Built-in | Email-based reset with 1-hour token expiry |
| Session Management | ✅ Built-in | Cookie-based, 7-day default expiry with refresh |
| Rate Limiting | ✅ Built-in | IP-based, 3 req/10sec for `/sign-in/email` |
| RBAC | ✅ Via Plugins | Organization & Admin plugins provide role-based access |
| Multi-tenant | ✅ Via Plugins | Organization plugin with owner/admin/member roles |
| 2FA/MFA | ✅ Via Plugins | Two-factor authentication plugin available |

### ⚠️ Requires Custom Implementation

| Feature | Implementation Approach | Complexity |
|---------|------------------------|------------|
| **Custom Password Validation** | Use hooks with regex patterns | Medium |
| **Exponential Backoff Rate Limiting** | Client-side implementation using `X-Retry-After` header | Medium |
| **Advanced Password Requirements** (12+ chars, uppercase, lowercase, number, special char) | Implement via `before` hooks | Low-Medium |

### ❌ Not Supported / Not Built-in

| Feature | Alternative |
|---------|-------------|
| Exponential backoff rate limiting (server-side) | Uses fixed-window rate limiting; implement progressive delay client-side |
| Built-in UI components (core library) | Use `@daveyplate/better-auth-ui` package |

---

## 2. Cloudflare D1 Integration

### Database Adapter Configuration

Better-auth uses **Drizzle ORM** for D1 integration. Configuration must happen within the request context:

```typescript
import { drizzle } from 'drizzle-orm/d1';
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';

export default {
  async fetch(request, env, ctx) {
    // D1 is only accessible through request context
    const db = drizzle(env.DB);

    const auth = betterAuth({
      database: drizzleAdapter(db, {
        provider: "sqlite", // D1 uses SQLite
      }),
      // ... other config
    });

    return auth.handler(request);
  },
};
```

### Migration Workflow

**1. Generate Better Auth Schema**
```bash
npx @better-auth/cli@latest generate --output src/lib/auth/schema.ts
```

**2. Generate Drizzle Migrations**
```bash
npx drizzle-kit generate
```

**3. Configure Wrangler**
```jsonc
// wrangler.jsonc
{
  "d1_databases": [
    {
      "binding": "D1Database",
      "database_name": "mastra-db",
      "database_id": "your-database-id",
      "migrations_dir": "drizzle/migrations"
    }
  ]
}
```

**4. Apply Migrations**
```bash
# Local development
wrangler d1 migrations apply mastra-db --local

# Production
wrangler d1 migrations apply mastra-db --remote
```

### CLI Workaround for Cloudflare Workers

Since Cloudflare Workers require auth initialization inside `fetch()`, create a separate auth file for CLI:

```typescript
// src/lib/auth-cli.ts (for CLI schema generation)
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

// Fake db instance for CLI
export const auth = betterAuth({
  database: drizzleAdapter({} as any, {
    provider: "sqlite",
  }),
  // ... config
});

// src/lib/auth.ts (actual implementation)
export function getAuth(db: D1Database) {
  return betterAuth({
    database: drizzleAdapter(drizzle(db), {
      provider: "sqlite",
    }),
    // ... config
  });
}
```

### Community Package

**better-auth-cloudflare** - Provides CLI tools and automated setup:
```bash
npm install better-auth-cloudflare
```
- Automated D1, KV, R2 resource provisioning
- Next.js template generation
- Simplified migration management

---

## 3. Next.js App Router Integration

### Server Components

```typescript
// app/dashboard/page.tsx
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session) {
    redirect("/sign-in");
  }

  return (
    <div>
      <h1>Welcome {session.user.name}</h1>
    </div>
  );
}
```

### API Route Setup

```typescript
// app/api/auth/[...all]/route.ts
import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

export const { GET, POST } = toNextJsHandler(auth.handler);
```

### Server Actions

```typescript
"use server"
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function updateProfile(formData: FormData) {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session) {
    throw new Error("Unauthorized");
  }

  // Update logic
}
```

### TypeScript Types

Better-auth provides full TypeScript support with automatic type inference from configuration:

```typescript
// The api object contains all endpoints as type-safe functions
const session = await auth.api.getSession(/* ... */);
// session is fully typed based on your config
```

---

## 4. OAuth Provider Setup

### Google OAuth Configuration

**1. Server Configuration**
```typescript
import { betterAuth } from "better-auth";

export const auth = betterAuth({
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      // Optional: custom scopes
      scopes: ["email", "profile"],
    },
  },
});
```

**2. Google Console Setup**
- Navigate to Google Cloud Console > Credentials
- Create OAuth 2.0 Client ID
- Authorized redirect URIs:
  - Local: `http://localhost:3000/api/auth/callback/google`
  - Production: `https://yourdomain.com/api/auth/callback/google`

**3. Client-Side Implementation**
```typescript
import { authClient } from "@/lib/auth-client";

await authClient.signIn.social({
  provider: "google",
  callbackURL: "/dashboard", // optional
});
```

**4. Request Additional Scopes**
```typescript
// Request additional OAuth scopes later
await authClient.linkSocial({
  provider: "google",
  scopes: ["https://www.googleapis.com/auth/drive.readonly"],
});
```

### GitHub OAuth Configuration

**1. Server Configuration**
```typescript
export const auth = betterAuth({
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    },
  },
});
```

**2. GitHub App Setup**
- Go to GitHub Settings > Developer Settings > OAuth Apps
- Create OAuth App
- Authorization callback URL:
  - Local: `http://localhost:3000/api/auth/callback/github`
  - Production: `https://yourdomain.com/api/auth/callback/github`

**3. Client Implementation**
```typescript
await authClient.signIn.social({
  provider: "github",
});
```

**Note**: GitHub access tokens don't expire unless revoked or unused for 1 year.

### Account Linking Configuration

**Enable Account Linking**
```typescript
export const auth = betterAuth({
  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ["google", "github", "email-password"],
      allowDifferentEmails: false, // Only link accounts with same email
    },
  },
});
```

**How it Works**:
- Users can link multiple OAuth providers to one account
- If provider confirms email as verified, auto-linking occurs
- `trustedProviders` allows linking even without email verification confirmation
- `allowDifferentEmails: false` prevents linking accounts with different emails

**Known Issues**:
- ⚠️ GitHub Issue #4610: `allowDifferentEmails: false` may still allow different emails
- ⚠️ GitHub Issue #2062: Duplicate `linkSocial` calls can create duplicate account entries

**Recommendation**: Thoroughly test account linking in your use case before production deployment.

---

## 5. Authentication Features

### Email/Password Authentication

**Basic Configuration**
```typescript
export const auth = betterAuth({
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    maxPasswordLength: 128,
    requireEmailVerification: false, // Set true to require verification
    autoSignIn: true, // Auto sign-in after registration
  },
});
```

### Email Verification Flow

**1. Configure Email Sending**
```typescript
export const auth = betterAuth({
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendVerificationEmail: async ({ user, url, token }) => {
      // Send email with verification link
      await sendEmail({
        to: user.email,
        subject: "Verify your email",
        html: `Click here to verify: <a href="${url}">Verify Email</a>`,
      });
    },
  },
});
```

**2. Verification Endpoint**
- Built-in endpoint: `/api/auth/verify-email?token=<token>`
- User clicks link → email verified → can sign in

**3. Manual Triggering**
```typescript
await authClient.sendVerificationEmail({
  email: "user@example.com",
  callbackURL: "/email-verified",
});
```

### Password Reset Flow

**1. Server Configuration**
```typescript
export const auth = betterAuth({
  emailAndPassword: {
    enabled: true,
    sendResetPassword: async ({ user, url, token }) => {
      await sendEmail({
        to: user.email,
        subject: "Reset your password",
        html: `Click here to reset: <a href="${url}">Reset Password</a>`,
      });
    },
    resetPasswordTokenExpiresIn: 3600, // 1 hour (default)
  },
});
```

**2. Client Implementation**
```typescript
// Request password reset
await authClient.forgetPassword({
  email: "user@example.com",
  callbackURL: "/reset-password",
});

// Reset password with token
await authClient.resetPassword({
  token: "reset-token",
  newPassword: "newSecurePassword123!",
});
```

### Email OTP Alternative

**Configuration**
```typescript
import { emailOTP } from "better-auth/plugins";

export const auth = betterAuth({
  plugins: [emailOTP()],
  emailAndPassword: {
    enabled: true,
  },
});
```

**Usage**
```typescript
// Send OTP for password reset
await authClient.forgetPassword.emailOTP({
  email: "user@example.com",
});

// Verify OTP and reset
await authClient.resetPassword.emailOTP({
  email: "user@example.com",
  otp: "123456",
  newPassword: "newPassword123!",
});
```

---

## 6. Custom Password Validation

Better-auth provides basic length validation, but **custom requirements need hooks**.

### Implementation via Hooks

```typescript
import { betterAuth, createAuthMiddleware, APIError } from "better-auth/api";

export const auth = betterAuth({
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 12, // Base requirement
  },
  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      // Password validation regex: 12+ chars, uppercase, lowercase, number, special char
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{12,}$/;

      const endpoints = ["/sign-up/email", "/change-password", "/reset-password"];

      if (endpoints.includes(ctx.path)) {
        const password = ctx.body?.password || ctx.body?.newPassword;

        if (!password || !passwordRegex.test(password)) {
          throw new APIError("BAD_REQUEST", {
            message: "Password must be at least 12 characters and include uppercase, lowercase, number, and special character (@$!%*?&)",
          });
        }
      }
    }),
  },
});
```

### Regex Pattern Options

**Strong Password (12+ chars, all types)**
```regex
/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{12,}$/
```

**Flexible (8+ chars, 3 of 4 types)**
```regex
/^(?:(?=.*[a-z])(?=.*[A-Z])(?=.*\d)|(?=.*[a-z])(?=.*[A-Z])(?=.*[@$!%*?&])|(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])|(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])).{8,}$/
```

**Ultra-Strong (16+ chars, all types + more special chars)**
```regex
/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&_#^()])[A-Za-z\d@$!%*?&_#^()]{16,}$/
```

### Hook Context Properties

```typescript
ctx.path      // Endpoint path (e.g., "/sign-up/email")
ctx.body      // Parsed request body
ctx.headers   // Request headers
ctx.query     // Query parameters
ctx.context   // Auth-related context
```

---

## 7. Rate Limiting & Security

### Built-in Rate Limiting

Better-auth includes **fixed-window rate limiting** by default:

**Default Limits**:
- `/sign-in/email`: 3 requests per 10 seconds
- `/two-factor/verify`: 3 requests per 10 seconds
- General endpoints: Default limits based on risk profile

**Configuration**
```typescript
export const auth = betterAuth({
  rateLimit: {
    enabled: true, // Disabled in dev mode by default
    window: 10, // Time window in seconds
    max: 3, // Max requests in window
    storage: "database", // or "memory", "secondary"
    customIpHeader: "cf-connecting-ip", // For Cloudflare
  },
});
```

**IP Address Detection**:
- Default header: `x-forwarded-for`
- Cloudflare: `cf-connecting-ip`
- Custom proxies: Configure via `customIpHeader`

**Response Headers**:
- `X-Retry-After`: Seconds until next request allowed

**Database Table**:
```bash
# Create rate limit table
npx @better-auth/cli@latest migrate
```

### Exponential Backoff (Custom Implementation)

Better-auth **does not** provide exponential backoff natively. You must implement it client-side:

**Client-Side Implementation**
```typescript
async function signInWithBackoff(email: string, password: string) {
  let retryDelay = 1000; // Start with 1 second
  let attempt = 0;
  const maxAttempts = 5;

  while (attempt < maxAttempts) {
    try {
      const response = await authClient.signIn.email({
        email,
        password,
      });
      return response; // Success
    } catch (error) {
      if (error.status === 429) {
        // Rate limited
        const retryAfter = error.headers?.['x-retry-after'];

        if (retryAfter) {
          retryDelay = parseInt(retryAfter) * 1000;
        } else {
          // Exponential backoff: 1s → 2s → 4s → 8s → 16s
          retryDelay = Math.min(retryDelay * 2, 32000);
        }

        console.log(`Rate limited. Retrying in ${retryDelay}ms...`);
        await new Promise(resolve => setTimeout(resolve, retryDelay));
        attempt++;
      } else {
        throw error; // Non-rate-limit error
      }
    }
  }

  throw new Error("Max retry attempts reached");
}
```

**Progressive Delay Plugin (Custom)**
```typescript
// Custom plugin for server-side progressive delay
import { BetterAuthPlugin } from "better-auth";

export const progressiveDelay = (): BetterAuthPlugin => ({
  id: "progressive-delay",
  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      if (ctx.path === "/sign-in/email") {
        const ip = ctx.headers.get("x-forwarded-for") || "unknown";
        const attempts = await getFailedAttempts(ip); // Custom DB query

        if (attempts > 0) {
          const delayMs = Math.min(1000 * Math.pow(2, attempts - 1), 32000);
          await new Promise(resolve => setTimeout(resolve, delayMs));
        }
      }
    }),
    after: createAuthMiddleware(async (ctx) => {
      if (ctx.path === "/sign-in/email" && ctx.response.status === 401) {
        const ip = ctx.headers.get("x-forwarded-for") || "unknown";
        await incrementFailedAttempts(ip); // Custom DB write
      }
    }),
  },
});
```

### Security Best Practices

✅ **Implemented by Better-Auth**:
- Password hashing with scrypt (OWASP recommended)
- Secure session cookies (httpOnly, sameSite, secure)
- CSRF protection
- Rate limiting by IP address
- Email verification
- Password reset tokens with expiry

⚠️ **Requires Configuration**:
- Custom password complexity requirements
- Account lockout after X failed attempts
- Progressive delay / exponential backoff
- Advanced brute-force protection

---

## 8. Session Management

### Cookie-Based Sessions

Better-auth uses **traditional cookie-based sessions** (not JWT by default):

**Default Configuration**:
- **Expiry**: 7 days
- **Update Age**: Session refreshes when `updateAge` threshold is reached
- **Storage**: Database-backed (D1, Postgres, MySQL, etc.)

**Configuration**
```typescript
export const auth = betterAuth({
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days (seconds)
    updateAge: 60 * 60 * 24, // Refresh after 1 day (seconds)
    cookieCache: {
      enabled: true, // Store session data in signed cookie
      maxAge: 60 * 5, // 5 minutes
    },
  },
});
```

**How Cookie Caching Works**:
- Session data stored in short-lived, signed cookie (like JWT access token)
- Reduces database lookups for session validation
- Cookie contains: `{ userId, sessionId, expiresAt }` (signed)
- After `maxAge`, cookie is refreshed from database

### JWT Plugin (Optional)

For services requiring JWT tokens:

```typescript
import { jwt } from "better-auth/plugins";

export const auth = betterAuth({
  plugins: [
    jwt({
      expiresIn: 60 * 15, // 15 minutes
      issuer: "https://yourdomain.com",
      audience: "your-service",
    }),
  ],
});
```

**Usage**:
```typescript
// Get JWT token
const { token } = await authClient.getJWTToken();

// JWT can be verified without database call
// Provides JWKS endpoint at /api/auth/.well-known/jwks.json
```

**Important**: JWT plugin is **not a replacement** for sessions. It's for services needing JWT verification without database lookups.

### Session Management in Server Components

```typescript
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export default async function Page() {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session) {
    redirect("/sign-in");
  }

  // Access session data
  const { user, session: sessionData } = session;
}
```

### Session Revocation

```typescript
// Revoke specific session
await auth.api.revokeSession({
  sessionId: "session-id",
});

// Revoke all user sessions
await auth.api.revokeUserSessions({
  userId: "user-id",
});
```

---

## 9. Role-Based Access Control (RBAC)

Better-auth provides RBAC through **plugins**: Organization and Admin.

### Organization Plugin (Multi-Tenant RBAC)

**Installation**
```typescript
import { organization } from "better-auth/plugins";

export const auth = betterAuth({
  plugins: [
    organization({
      dynamicAccessControl: true, // Runtime role creation
    }),
  ],
});
```

**Default Roles**:
- **Owner**: Created organization, full control
- **Admin**: Full control except delete org or change owner
- **Member**: Limited permissions

**Custom Permissions**
```typescript
import { createAccessControl } from "better-auth/plugins";

const ac = createAccessControl({
  post: ["create", "read", "update", "delete"],
  project: ["create", "read", "update", "delete"],
  settings: ["read", "update"],
});

export const auth = betterAuth({
  plugins: [
    organization({
      ac, // Apply access control
      roles: {
        admin: ac.grant({
          post: ["*"], // All post permissions
          project: ["*"],
          settings: ["*"],
        }),
        editor: ac.grant({
          post: ["create", "read", "update"],
          project: ["read"],
          settings: ["read"],
        }),
        viewer: ac.grant({
          post: ["read"],
          project: ["read"],
          settings: ["read"],
        }),
      },
    }),
  ],
});
```

**Dynamic Access Control**:
- Roles created at runtime
- Stored in database
- Enable with `dynamicAccessControl: true`

```typescript
// Create custom role at runtime
await auth.api.organization.createRole({
  organizationId: "org-id",
  name: "content-manager",
  permissions: {
    post: ["create", "read", "update"],
    settings: ["read"],
  },
});
```

**Client Usage**
```typescript
import { createAuthClient } from "better-auth/client";
import { organizationClient } from "better-auth/client/plugins";

const authClient = createAuthClient({
  plugins: [organizationClient()],
});

// Check permissions
const canEdit = await authClient.organization.hasPermission({
  permission: "post:update",
});

// Get user's organizations
const orgs = await authClient.organization.listUserOrganizations();

// Switch active organization
await authClient.organization.setActiveOrganization({
  organizationId: "org-id",
});
```

### Admin Plugin (Simple RBAC)

**Installation**
```typescript
import { admin } from "better-auth/plugins";

export const auth = betterAuth({
  plugins: [
    admin({
      roles: ["admin", "moderator", "user"],
    }),
  ],
});
```

**Permission Checking**
```typescript
// Server-side
const session = await auth.api.getSession({ headers });
const hasPermission = await auth.api.admin.hasPermission({
  userId: session.user.id,
  permission: "admin",
});

// Client-side
const canDelete = await authClient.admin.hasPermission({
  permission: "admin",
});
```

**Assign Roles**
```typescript
await auth.api.admin.setUserRole({
  userId: "user-id",
  role: "moderator",
});
```

### Better Auth UI - RBAC Support

Better Auth UI provides built-in components for organization management:

```tsx
import { OrganizationSwitcher, OrganizationSettingsCards } from "@daveyplate/better-auth-ui";

// Organization switcher dropdown
<OrganizationSwitcher />

// Organization settings with member management
<OrganizationSettingsCards />
```

---

## 10. Better Auth UI Components

Better-auth **does not include UI components** in the core library. Use **@daveyplate/better-auth-ui** for shadcn/ui components.

### Installation

```bash
npm install @daveyplate/better-auth-ui
# or
pnpm add @daveyplate/better-auth-ui
```

**Prerequisites**:
- shadcn/ui installed
- TailwindCSS configured
- Next.js or React project

### Components

#### AuthCard (Main Component)

Unified authentication interface that handles multiple flows:

```tsx
import { AuthCard } from "@daveyplate/better-auth-ui";

export default function AuthPage({ params }: { params: { pathname?: string[] } }) {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <AuthCard pathname={params.pathname} />
    </div>
  );
}
```

**Supported Paths** (via dynamic routing):
- `/login` - Sign-in form
- `/signup` - Sign-up form
- `/forgot-password` - Forgot password form
- `/reset-password` - Reset password form
- `/magic-link` - Magic link sign-in
- `/logout` - Logout confirmation

**Features**:
- Email/password authentication
- Social provider buttons (Google, GitHub, etc.)
- Magic link sign-in
- Passkey (WebAuthn) support
- Fully styled with TailwindCSS & shadcn/ui

**Customization**:
```tsx
<AuthCard
  pathname={params.pathname}
  classNames={{
    card: "border-primary",
    button: "bg-primary hover:bg-primary/90",
  }}
  labels={{
    signIn: "Log In",
    signUp: "Create Account",
    forgotPassword: "Forgot Password?",
  }}
/>
```

#### SettingsCards

Handles all user settings automatically:

```tsx
import { SettingsCards } from "@daveyplate/better-auth-ui";

export default function SettingsPage() {
  return (
    <div className="container mx-auto py-10">
      <SettingsCards />
    </div>
  );
}
```

**Included Settings**:
- Avatar upload
- Email management
- Username (if username plugin enabled)
- Password change
- Linked social providers (link/unlink)
- Session management (view/revoke sessions)
- Delete account
- Custom additional fields (if defined)

#### UserButton

User dropdown with profile actions:

```tsx
import { UserButton } from "@daveyplate/better-auth-ui";

export default function Navbar() {
  return (
    <nav>
      <UserButton />
    </nav>
  );
}
```

**Features**:
- User avatar & name
- Account settings link
- Sign out button
- Customizable dropdown items

#### Organization Components

```tsx
import {
  OrganizationSwitcher,
  OrganizationSettingsCards
} from "@daveyplate/better-auth-ui";

// Dropdown to switch between organizations
<OrganizationSwitcher />

// Organization settings page
<OrganizationSettingsCards />
```

**Organization Settings Include**:
- Organization profile
- Member management (invite, remove, change roles)
- Pending invitations
- Delete organization

### Styling

All components use **shadcn/ui primitives** and **TailwindCSS**:

```tsx
<AuthCard
  classNames={{
    card: "border-2 border-primary",
    input: "border-muted",
    button: "bg-gradient-to-r from-primary to-secondary",
    error: "text-destructive",
  }}
/>
```

### Alternative: Build Your Own

Better Auth provides **headless client methods**, allowing custom UI:

```tsx
import { authClient } from "@/lib/auth-client";

async function handleSignIn(email: string, password: string) {
  try {
    await authClient.signIn.email({ email, password });
  } catch (error) {
    console.error(error);
  }
}

async function handleGoogleSignIn() {
  await authClient.signIn.social({ provider: "google" });
}
```

**Recommendation**: Use `@daveyplate/better-auth-ui` for rapid development, then customize or build your own as needed.

---

## 11. Plugins & Extensibility

Better-auth has a powerful plugin system for extending functionality.

### Built-in Plugins

| Plugin | Purpose |
|--------|---------|
| `organization` | Multi-tenant organizations with RBAC |
| `admin` | Simple role-based access control |
| `jwt` | JWT token generation & JWKS endpoint |
| `emailOTP` | Email-based OTP for sign-in/verification |
| `username` | Username-based authentication |
| `passkey` | WebAuthn/Passkey authentication |
| `twoFactor` | 2FA with TOTP |
| `multiSession` | Multiple concurrent sessions per user |

### Creating Custom Plugins

**Basic Plugin Structure**:
```typescript
import { BetterAuthPlugin } from "better-auth";

export const myPlugin = (): BetterAuthPlugin => ({
  id: "my-plugin",

  // Extend database schema
  schema: {
    user: {
      fields: {
        customField: {
          type: "string",
          required: false,
        },
      },
    },
  },

  // Create custom endpoints
  endpoints: {
    "/custom-endpoint": {
      method: "POST",
      handler: async ({ body, context }) => {
        // Custom logic
        return { success: true };
      },
    },
  },

  // Hooks
  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      // Run before endpoints
    }),
    after: createAuthMiddleware(async (ctx) => {
      // Run after endpoints
    }),
  },

  // Custom rate limits
  rateLimit: [
    {
      pathMatcher: (path) => path === "/custom-endpoint",
      window: 60,
      max: 10,
    },
  ],
});
```

**Using Plugins**:
```typescript
import { betterAuth } from "better-auth";
import { myPlugin } from "./plugins/my-plugin";

export const auth = betterAuth({
  plugins: [myPlugin()],
});
```

**Client Plugin**:
```typescript
import { BetterAuthClientPlugin } from "better-auth/client";

export const myPluginClient = (): BetterAuthClientPlugin => ({
  id: "my-plugin",
  $InferServerPlugin: {} as ReturnType<typeof myPlugin>,

  // Expose client methods
  getActions: ($fetch) => ({
    myAction: async (data) => {
      return $fetch("/custom-endpoint", {
        method: "POST",
        body: data,
      });
    },
  }),
});

// Usage
const authClient = createAuthClient({
  plugins: [myPluginClient()],
});

await authClient.myAction({ /* data */ });
```

### Middleware & Hooks

**Hooks run on specific events**:
- `before`: Before endpoint execution (validation, pre-processing)
- `after`: After endpoint execution (post-processing, logging)
- `onRequest`: All incoming requests
- `onResponse`: All outgoing responses

**Middleware for route groups**:
```typescript
import { createAuthMiddleware } from "better-auth/plugins";

const loggingMiddleware = createAuthMiddleware(async (ctx) => {
  console.log(`${ctx.method} ${ctx.path}`);

  if (ctx.path.startsWith("/admin")) {
    // Admin-specific logic
    const session = await getSessionFromCtx(ctx);
    if (!session?.user.role.includes("admin")) {
      throw new APIError("FORBIDDEN");
    }
  }
});

export const auth = betterAuth({
  hooks: {
    before: loggingMiddleware,
  },
});
```

---

## 12. Configuration Examples

### Complete Server Setup (Cloudflare D1 + Next.js)

```typescript
// src/lib/auth.ts
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { drizzle } from "drizzle-orm/d1";
import { organization, admin, jwt } from "better-auth/plugins";

export function getAuth(d1: D1Database) {
  const db = drizzle(d1);

  return betterAuth({
    database: drizzleAdapter(db, {
      provider: "sqlite",
    }),

    baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",

    emailAndPassword: {
      enabled: true,
      minPasswordLength: 12,
      requireEmailVerification: true,
      sendVerificationEmail: async ({ user, url }) => {
        await sendEmail({
          to: user.email,
          subject: "Verify your email",
          html: `<a href="${url}">Verify Email</a>`,
        });
      },
      sendResetPassword: async ({ user, url }) => {
        await sendEmail({
          to: user.email,
          subject: "Reset your password",
          html: `<a href="${url}">Reset Password</a>`,
        });
      },
    },

    socialProviders: {
      google: {
        clientId: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      },
      github: {
        clientId: process.env.GITHUB_CLIENT_ID!,
        clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      },
    },

    account: {
      accountLinking: {
        enabled: true,
        trustedProviders: ["google", "github"],
        allowDifferentEmails: false,
      },
    },

    session: {
      expiresIn: 60 * 60 * 24 * 7, // 7 days
      updateAge: 60 * 60 * 24, // Update after 1 day
      cookieCache: {
        enabled: true,
        maxAge: 60 * 5, // 5 minutes
      },
    },

    rateLimit: {
      enabled: true,
      customIpHeader: "cf-connecting-ip", // Cloudflare
    },

    plugins: [
      organization(),
      admin({
        roles: ["admin", "moderator", "user"],
      }),
      jwt(),
    ],

    hooks: {
      before: createAuthMiddleware(async (ctx) => {
        // Custom password validation
        if (ctx.path === "/sign-up/email") {
          const password = ctx.body?.password;
          const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{12,}$/;

          if (!passwordRegex.test(password)) {
            throw new APIError("BAD_REQUEST", {
              message: "Password must be 12+ characters with uppercase, lowercase, number, and special character",
            });
          }
        }
      }),
    },
  });
}
```

### API Route (Next.js App Router)

```typescript
// app/api/auth/[...all]/route.ts
import { getAuth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";
import { getCloudflareContext } from "@opennextjs/cloudflare";

const handler = async (req: Request) => {
  const { env } = await getCloudflareContext();
  const auth = getAuth(env.D1Database);

  return auth.handler(req);
};

export const { GET, POST } = toNextJsHandler(handler);
```

### Client Setup

```typescript
// src/lib/auth-client.ts
import { createAuthClient } from "better-auth/client";
import { organizationClient, adminClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  plugins: [
    organizationClient(),
    adminClient(),
  ],
});
```

### Environment Variables

```bash
# .env
BETTER_AUTH_SECRET="your-secret-key-min-32-chars"
BETTER_AUTH_URL="https://yourdomain.com"

# OAuth Providers
GOOGLE_CLIENT_ID="google-client-id"
GOOGLE_CLIENT_SECRET="google-client-secret"
GITHUB_CLIENT_ID="github-client-id"
GITHUB_CLIENT_SECRET="github-client-secret"

# Email (example: Resend)
RESEND_API_KEY="re_xxx"

# Cloudflare (for local development with Wrangler)
CLOUDFLARE_ACCOUNT_ID="your-account-id"
CLOUDFLARE_DATABASE_ID="your-database-id"
```

---

## 13. Gaps & Custom Code Requirements

### What Needs Custom Implementation

| Requirement | Approach | Complexity |
|------------|----------|------------|
| **12+ char password with complexity rules** | Use `before` hooks with regex validation | Low |
| **Exponential backoff rate limiting** | Client-side implementation with `X-Retry-After` header | Medium |
| **Account lockout after N attempts** | Custom plugin tracking failed attempts in DB | Medium |
| **IP geolocation-based restrictions** | Custom middleware with Cloudflare geolocation | Medium |
| **Advanced audit logging** | Custom `after` hooks logging to separate table | Low |
| **Multi-factor authentication (SMS)** | Custom plugin or use community plugins | High |
| **Custom OAuth providers** | Use `genericOAuth` plugin | Low |
| **User approval workflow** | Custom hooks + admin approval table | Medium |
| **Progressive password strength meter** | Client-side only (use zxcvbn library) | Low |

### Recommended Custom Plugins

**1. Password Complexity Plugin**
```typescript
export const passwordComplexity = (options = {}) => ({
  id: "password-complexity",
  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      // Regex validation for password endpoints
    }),
  },
});
```

**2. Account Lockout Plugin**
```typescript
export const accountLockout = ({ maxAttempts = 5, lockoutDuration = 900 }) => ({
  id: "account-lockout",
  schema: {
    user: {
      fields: {
        failedLoginAttempts: { type: "number", default: 0 },
        lockedUntil: { type: "date", required: false },
      },
    },
  },
  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      // Check if account is locked
    }),
    after: createAuthMiddleware(async (ctx) => {
      // Increment failed attempts or reset on success
    }),
  },
});
```

**3. Audit Logging Plugin**
```typescript
export const auditLog = () => ({
  id: "audit-log",
  schema: {
    auditLog: {
      fields: {
        userId: { type: "string", required: true },
        action: { type: "string", required: true },
        ip: { type: "string", required: true },
        timestamp: { type: "date", required: true },
      },
    },
  },
  hooks: {
    after: createAuthMiddleware(async (ctx) => {
      // Log all auth actions
    }),
  },
});
```

---

## 14. Migration from Other Libraries

### From Auth.js / NextAuth.js

Better-auth is **not compatible** with Auth.js session data, but migration is straightforward:

**Key Differences**:
- Better-auth uses different database schema
- Session format is different
- Configuration API is different

**Migration Steps**:
1. Install better-auth
2. Run schema generation: `npx @better-auth/cli generate`
3. Migrate user data from Auth.js tables to Better-auth tables
4. Update authentication code to use better-auth client
5. Test thoroughly before production deployment

**Data Migration Script Example**:
```typescript
// migrate-authjs-to-better-auth.ts
import { authJsDb } from "./old-db";
import { betterAuthDb } from "./new-db";

async function migrateUsers() {
  const authJsUsers = await authJsDb.select().from(usersTable);

  for (const user of authJsUsers) {
    await betterAuthDb.insert(usersTable).values({
      id: user.id,
      email: user.email,
      emailVerified: user.emailVerified,
      name: user.name,
      image: user.image,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  }
}
```

### From Supabase Auth

Similar migration process, but Supabase uses different schema:

1. Export user data from Supabase
2. Generate better-auth schema
3. Map Supabase fields to better-auth fields
4. Update auth calls in application code

---

## 15. Best Practices & Recommendations

### ✅ Do's

1. **Use TypeScript**: Better-auth has excellent TypeScript support
2. **Enable email verification**: Prevents spam accounts
3. **Configure rate limiting**: Protect against brute-force attacks
4. **Use account linking carefully**: Test with `allowDifferentEmails: false`
5. **Implement custom password validation**: Use hooks for complex requirements
6. **Use cookie caching**: Reduces database load for session checks
7. **Enable audit logging**: Track authentication events for security
8. **Test OAuth flows thoroughly**: Each provider has quirks
9. **Use better-auth-ui**: Saves development time
10. **Monitor rate limit tables**: Track abuse attempts

### ⚠️ Don'ts

1. **Don't rely on exponential backoff being built-in**: Implement client-side
2. **Don't skip database migrations**: Always run `migrate` command
3. **Don't use JWT as primary session**: Use cookie sessions; JWT for specific services
4. **Don't expose sensitive config**: Use environment variables
5. **Don't ignore account linking bugs**: Test thoroughly before production
6. **Don't hardcode redirect URLs**: Use environment-based configuration
7. **Don't skip security headers**: Configure CORS, CSP properly
8. **Don't forget session revocation**: Implement logout from all devices
9. **Don't use weak password requirements**: Enforce strong passwords
10. **Don't store secrets in Git**: Use .env and .gitignore

### Production Checklist

- [ ] Environment variables configured (`.env.production`)
- [ ] Database migrations applied to production D1
- [ ] OAuth redirect URLs updated for production domain
- [ ] Rate limiting enabled and configured
- [ ] Email sending configured (Resend, SendGrid, etc.)
- [ ] Session expiry appropriate for use case
- [ ] Account linking tested with production providers
- [ ] Password reset flow tested end-to-end
- [ ] Email verification flow tested end-to-end
- [ ] Security headers configured (CSP, CORS)
- [ ] Audit logging enabled
- [ ] Error monitoring configured (Sentry, etc.)
- [ ] HTTPS enforced
- [ ] Cookie settings secure (`httpOnly`, `secure`, `sameSite`)

---

## 16. Resources & Documentation

### Official Documentation
- **Main Docs**: https://www.better-auth.com/docs
- **GitHub Repo**: https://github.com/better-auth/better-auth (21k+ stars)
- **Better Auth UI**: https://better-auth-ui.com/
- **Examples**: https://github.com/better-auth/awesome

### Community Resources
- **better-auth-cloudflare**: https://github.com/zpg6/better-auth-cloudflare
- **Full-stack Template**: https://github.com/ifindev/fullstack-next-cloudflare
- **Discord**: https://discord.gg/better-auth (community support)

### Related Packages
- **@daveyplate/better-auth-ui**: shadcn/ui components
- **better-auth-cloudflare**: Cloudflare Workers integration
- **Drizzle ORM**: https://orm.drizzle.team/

### Key Documentation Pages
- OAuth Setup: https://www.better-auth.com/docs/concepts/oauth
- Database Config: https://www.better-auth.com/docs/concepts/database
- Plugins: https://www.better-auth.com/docs/concepts/plugins
- Hooks: https://www.better-auth.com/docs/concepts/hooks
- Next.js Integration: https://www.better-auth.com/docs/integrations/next
- D1 Adapter: https://www.better-auth.com/docs/adapters/drizzle

---

## 17. Conclusion

### Summary

Better-auth is a **comprehensive, production-ready authentication framework** for TypeScript with excellent support for:

✅ **Strengths**:
- Modern TypeScript-first design
- Excellent Cloudflare D1 integration via Drizzle ORM
- Comprehensive OAuth support (Google, GitHub, 50+ providers)
- Flexible plugin system for extensibility
- Built-in rate limiting and security features
- Strong Next.js App Router support
- Ready-made UI components via better-auth-ui
- Active development and community support

⚠️ **Limitations**:
- Custom password validation requires hooks (not built-in)
- Exponential backoff not built-in (client-side implementation needed)
- Account linking has some edge-case bugs
- CLI workflow requires workarounds for Cloudflare Workers

### Recommendation for Your Project

Better-auth is a **strong fit** for your Mastra + CopilotKit + Cloudflare D1 stack:

1. **D1 Integration**: Seamless via Drizzle adapter
2. **Next.js App Router**: First-class support
3. **TypeScript + Zod**: Full type safety (Zod used internally)
4. **OAuth**: Google & GitHub work out-of-box
5. **UI Components**: better-auth-ui provides shadcn components
6. **Extensibility**: Plugin system allows custom requirements

### Implementation Roadmap

**Phase 1: Core Setup** (1-2 days)
- [ ] Install better-auth + drizzle adapter
- [ ] Configure D1 database and migrations
- [ ] Set up API routes in Next.js
- [ ] Configure email/password auth

**Phase 2: OAuth & Account Linking** (1-2 days)
- [ ] Set up Google OAuth
- [ ] Set up GitHub OAuth
- [ ] Configure account linking
- [ ] Test OAuth flows thoroughly

**Phase 3: Custom Requirements** (2-3 days)
- [ ] Implement password validation hook (12+ chars, complexity)
- [ ] Configure rate limiting (consider custom plugin for backoff)
- [ ] Add email verification flow
- [ ] Add password reset flow

**Phase 4: UI Integration** (1-2 days)
- [ ] Install @daveyplate/better-auth-ui
- [ ] Add AuthCard to sign-in/sign-up pages
- [ ] Add SettingsCards for user profile
- [ ] Customize components to match design system

**Phase 5: RBAC (if needed)** (1-2 days)
- [ ] Add organization or admin plugin
- [ ] Define roles and permissions
- [ ] Implement permission checks in routes
- [ ] Add organization UI components

**Phase 6: Production Hardening** (1-2 days)
- [ ] Security audit (CSP, CORS, etc.)
- [ ] Test account lockout scenarios
- [ ] Configure production environment variables
- [ ] Set up monitoring and error tracking

**Total Estimated Time**: 7-12 days for full implementation

### Alternative Considerations

If better-auth doesn't meet your needs, consider:

1. **Clerk** - Fully managed auth with beautiful UI (paid service)
2. **Auth.js (NextAuth v5)** - Similar to better-auth, more mature
3. **Supabase Auth** - If using Supabase ecosystem
4. **Custom Implementation** - Full control but high development cost

For your use case, **better-auth is recommended** due to its Cloudflare D1 support, TypeScript-first design, and extensibility.
