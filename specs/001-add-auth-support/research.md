# Research: Authentication System

**Feature**: 001-add-auth-support
**Date**: 2025-10-06
**Status**: Complete

## Executive Summary

Research confirms better-auth is an excellent fit for implementing authentication in a Mastra + CopilotKit + Cloudflare D1 stack. The library provides comprehensive built-in support for most requirements, with clear patterns for implementing custom password validation and progressive rate limiting.

## Research Questions & Findings

### 1. Authentication Library Selection

**Question**: Which authentication library best supports our requirements (email/password, OAuth, D1 storage, TypeScript)?

**Decision**: better-auth
**Rationale**:
- First-class TypeScript support with automatic type inference
- Native Cloudflare D1 integration via Drizzle ORM adapter
- Built-in support for Google & GitHub OAuth
- Account linking with same-email auto-merge
- Comprehensive RBAC via plugins
- Active development and growing community

**Alternatives Considered**:
1. **Auth.js (NextAuth v5)**: More mature but lacks D1 adapter, requires custom implementation
2. **Clerk**: Fully managed solution but paid service, vendor lock-in
3. **Supabase Auth**: Requires Supabase ecosystem, not ideal for standalone D1
4. **Custom Implementation**: Full control but 4-6 weeks development time

### 2. Cloudflare D1 Integration

**Question**: How does better-auth integrate with Cloudflare D1 in a Workers environment?

**Findings**:
- Uses Drizzle ORM adapter with D1 binding
- Auth instance must be created inside request handler (D1 is request-scoped)
- Factory pattern recommended: `getAuth(d1Database: D1Database)`
- Migration workflow: better-auth CLI → Drizzle migrations → wrangler D1 migrations

**Implementation Pattern**:
```typescript
// src/lib/auth/index.ts
export function getAuth(d1: D1Database) {
  const db = drizzle(d1);
  return betterAuth({
    database: drizzleAdapter(db, { provider: "sqlite" }),
    // ... config
  });
}

// src/app/api/auth/[...all]/route.ts
export const POST = async (req: Request) => {
  const { env } = await getCloudflareContext();
  const auth = getAuth(env.D1Database);
  return auth.handler(req);
};
```

**Known Issues**:
- CLI tools require workaround (create separate auth file for schema generation)
- Community package `better-auth-cloudflare` provides automated setup

### 3. Password Requirements Implementation

**Question**: How to enforce strong password requirements (12+ chars, uppercase, lowercase, number, special char)?

**Decision**: Custom `before` hooks with regex validation

**Implementation**:
```typescript
export const auth = betterAuth({
  emailAndPassword: {
    minPasswordLength: 12, // Base requirement
  },
  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{12,}$/;

      if (ctx.path === "/sign-up/email" || ctx.path === "/reset-password") {
        const password = ctx.body?.password || ctx.body?.newPassword;
        if (!passwordRegex.test(password)) {
          throw new APIError("BAD_REQUEST", {
            message: "Password must be 12+ characters with uppercase, lowercase, number, and special character"
          });
        }
      }
    }),
  },
});
```

**Alternatives Rejected**:
- Client-side validation only: Insecure, can be bypassed
- Custom endpoint: Duplicates built-in logic, harder to maintain

### 4. OAuth Provider Setup

**Question**: What's required to configure Google and GitHub OAuth?

**Findings - Google OAuth**:
```typescript
socialProviders: {
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    scopes: ["email", "profile"], // default
  },
}
```
- Redirect URI: `https://yourdomain.com/api/auth/callback/google`
- Google Cloud Console setup required
- Auto-verified emails from Google

**Findings - GitHub OAuth**:
```typescript
socialProviders: {
  github: {
    clientId: process.env.GITHUB_CLIENT_ID!,
    clientSecret: process.env.GITHUB_CLIENT_SECRET!,
  },
}
```
- Redirect URI: `https://yourdomain.com/api/auth/callback/github`
- GitHub OAuth App setup required
- Tokens don't expire (unless revoked or unused for 1 year)

### 5. Account Linking Strategy

**Question**: How to handle same email across different authentication providers?

**Decision**: Auto-link on signup with same verified email

**Configuration**:
```typescript
account: {
  accountLinking: {
    enabled: true,
    trustedProviders: ["google", "github", "email-password"],
    allowDifferentEmails: false, // Only link same email
  },
}
```

**Behavior**:
- User signs up with email/password: user@example.com
- Later signs in with Google using user@example.com → auto-links to existing account
- Multiple OAuth providers can link to same account
- OAuth accounts auto-verified, email/password accounts require verification

**Known Issues**:
- GitHub Issue #4610: `allowDifferentEmails: false` may allow different emails (test thoroughly)
- GitHub Issue #2062: Duplicate `linkSocial` calls can create duplicate entries

### 6. Email Verification Flow

**Question**: How to implement non-blocking email verification?

**Decision**: Use built-in email verification with `requireEmailVerification: true`

**Configuration**:
```typescript
emailAndPassword: {
  requireEmailVerification: true,
  sendVerificationEmail: async ({ user, url, token }) => {
    console.log(`[DEV] Verification link: ${url}`);
    // TODO: Integrate with Resend in future
  },
}
```

**Behavior**:
- Users can login immediately after signup
- Limited feature access until verified (implemented in app logic)
- OAuth accounts automatically verified
- Verification token in email link
- Endpoint: `/api/auth/verify-email?token=...`

### 7. Progressive Rate Limiting

**Question**: How to implement exponential backoff for failed login attempts?

**Finding**: Better-auth provides fixed-window rate limiting (3 req/10sec), NOT exponential backoff

**Decision**: Client-side progressive delay implementation

**Built-in Rate Limiting**:
```typescript
rateLimit: {
  enabled: true,
  window: 10, // seconds
  max: 3, // attempts
  customIpHeader: "cf-connecting-ip", // Cloudflare
}
```

**Client-side Exponential Backoff**:
```typescript
async function signInWithBackoff(email: string, password: string) {
  let retryDelay = 1000; // 1s
  let attempt = 0;

  while (attempt < 5) {
    try {
      return await authClient.signIn.email({ email, password });
    } catch (error) {
      if (error.status === 429) {
        const retryAfter = error.headers?.['x-retry-after'];
        retryDelay = retryAfter ? parseInt(retryAfter) * 1000 : retryDelay * 2;
        await new Promise(resolve => setTimeout(resolve, retryDelay));
        attempt++;
      } else {
        throw error;
      }
    }
  }
}
```

**Alternative**: Custom server-side plugin with delay implementation (deferred to later phase)

### 8. Role-Based Access Control (RBAC)

**Question**: How to implement multiple custom roles with granular permissions?

**Decision**: Use admin plugin with custom role definitions

**Configuration**:
```typescript
import { admin } from "better-auth/plugins";

plugins: [
  admin({
    roles: ["admin", "moderator", "user"], // Initial roles
  }),
]
```

**Permission Checking**:
```typescript
// Server-side
const session = await auth.api.getSession({ headers });
const isAdmin = await auth.api.admin.hasPermission({
  userId: session.user.id,
  permission: "admin",
});

// Client-side
const canModerate = await authClient.admin.hasPermission({
  permission: "moderator",
});
```

**Role Assignment**:
```typescript
await auth.api.admin.setUserRole({
  userId: "user-id",
  role: "moderator",
});
```

**Note**: For more complex RBAC with granular permissions, use organization plugin instead

### 9. UI Component Strategy

**Question**: Should we build custom UI or use existing components?

**Decision**: Use @daveyplate/better-auth-ui (shadcn-based)

**Rationale**:
- Built on shadcn/ui primitives
- Provides AuthCard (unified auth interface)
- SettingsCards for profile management
- UserButton for navigation dropdown
- Fully customizable with TailwindCSS
- Saves 1-2 weeks development time

**Components**:
```tsx
import { AuthCard, SettingsCards, UserButton } from "@daveyplate/better-auth-ui";

// Login/Signup pages
<AuthCard pathname={["login"]} />

// Profile page
<SettingsCards />

// Navigation
<UserButton />
```

### 10. Session Management

**Question**: What session strategy should be used?

**Decision**: Cookie-based sessions with cookie caching (default)

**Configuration**:
```typescript
session: {
  expiresIn: 60 * 60 * 24 * 7, // 7 days
  updateAge: 60 * 60 * 24, // Refresh after 1 day
  cookieCache: {
    enabled: true,
    maxAge: 60 * 5, // 5 minutes
  },
}
```

**Benefits**:
- Reduced database lookups (signed cookie cache)
- Standard cookie-based flow
- JWT plugin available for services needing JWT

**Session Validation** (Server Components):
```typescript
import { headers } from "next/headers";
import { getAuth } from "@/lib/auth";

const { env } = await getCloudflareContext();
const auth = getAuth(env.D1Database);

const session = await auth.api.getSession({
  headers: await headers()
});
```

## Technology Stack Decisions

### Core Dependencies

| Package | Version | Purpose | Decision Rationale |
|---------|---------|---------|-------------------|
| better-auth | latest | Authentication framework | Comprehensive feature set, D1 support, TypeScript-first |
| drizzle-orm | latest | D1 ORM adapter | Required for better-auth D1 integration |
| @daveyplate/better-auth-ui | latest | UI components | shadcn-based, saves development time |
| zod | ^3.x | Schema validation | Already in project, used by better-auth |

### Development Tools

| Tool | Purpose |
|------|---------|
| @better-auth/cli | Schema generation, migrations |
| drizzle-kit | Drizzle migration generation |
| wrangler | D1 migrations, local development |

## Implementation Risks & Mitigations

### Risk 1: Account Linking Edge Cases
**Risk**: Known GitHub issues with account linking
**Mitigation**: Thorough testing of linking scenarios before production
**Severity**: Medium

### Risk 2: D1 Request-Scoped Access
**Risk**: Auth instance recreation per request may impact performance
**Mitigation**: Use cookie caching to reduce database lookups
**Severity**: Low

### Risk 3: Email Delivery
**Risk**: Resend integration deferred, using console logging
**Mitigation**: Document placeholder, add Resend in Phase 2
**Severity**: Low (development only)

### Risk 4: Progressive Delay Client-Side
**Risk**: Client-side implementation can be bypassed
**Mitigation**: Built-in rate limiting provides base protection
**Severity**: Medium (consider server-side plugin in future)

## Best Practices & Recommendations

### Security
1. ✅ Use HTTPS in production (automatic with Cloudflare Workers)
2. ✅ Configure CORS and CSP headers
3. ✅ Enable rate limiting with Cloudflare IP header
4. ✅ Use strong password requirements (12+ chars, complexity)
5. ✅ Implement security audit logging

### Development
1. ✅ Use TypeScript strict mode
2. ✅ Leverage Zod for all validation boundaries
3. ✅ Follow TDD approach (contract tests → implementation)
4. ✅ Document all environment variables
5. ✅ Use better-auth-ui for rapid prototyping

### Deployment
1. ✅ Apply migrations to production D1 before deploying
2. ✅ Configure OAuth redirect URLs for production domain
3. ✅ Test email flows end-to-end
4. ✅ Monitor rate limit tables for abuse patterns
5. ✅ Set up error tracking (Sentry, etc.)

## Next Steps

### Phase 1: Design & Contracts (Current)
- Generate data-model.md with better-auth schema
- Create API contracts for custom endpoints
- Map user stories to integration tests
- Update CLAUDE.md with auth patterns

### Phase 2: Implementation (Future)
- Install dependencies
- Configure better-auth with D1
- Implement custom password validation
- Set up OAuth providers
- Build UI with better-auth-ui
- Write comprehensive tests

### Phase 3: Production Hardening (Future)
- Integrate Resend for email delivery
- Add server-side progressive delay plugin
- Security audit
- Performance testing
- Documentation updates

## References

- **Better-auth Docs**: https://www.better-auth.com/docs
- **Better-auth UI**: https://better-auth-ui.com/
- **D1 Adapter Guide**: https://www.better-auth.com/docs/adapters/drizzle
- **Better-auth GitHub**: https://github.com/better-auth/better-auth
- **Community Package**: https://github.com/zpg6/better-auth-cloudflare
- **Full Research**: `/better-auth-research.md` (17 sections, comprehensive analysis)

---
**Research Status**: ✅ Complete
**Recommendation**: Proceed to Phase 1 (Design & Contracts)
