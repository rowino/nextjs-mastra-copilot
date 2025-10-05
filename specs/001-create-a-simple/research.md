# Technology Research & Decisions

**Feature**: Modular Starter Kit with Auth, Profile, Settings & Dashboard
**Date**: 2025-10-02
**Status**: Complete

## Research Summary

This document captures technology decisions for implementing authentication, user management, and dashboard features in the Mastra + CopilotKit Next.js starter template.

---

## 1. Authentication Architecture

### Research Question
How do we integrate Better-Auth (frontend) with Laravel Sanctum (backend API) while maintaining modularity and type-safety?

### Architecture Decision: Better-Auth + Custom Laravel Sanctum Provider

**Rationale**:
- **Frontend Auth Framework**: Better-Auth provides excellent DX with React hooks, session management, and token refresh
- **Backend**: Laravel Sanctum API (separate project) handles actual authentication, user storage, and business logic
- **Custom Provider Pattern**: Better-Auth's AuthProvider interface allows seamless integration with any backend
- **Modularity**: Can swap Sanctum for Firebase, Supabase, or other backends by changing provider implementation
- **Type-Safety**: Zod schemas validate all Laravel API responses at the provider boundary
- **No Local Database**: All user data and sessions managed by Laravel backend
- **Best of Both Worlds**: Better-Auth DX + Laravel backend flexibility

### Better-Auth Custom Provider Pattern

Better-Auth supports custom authentication providers through the `AuthProvider` interface. This allows us to integrate with Laravel Sanctum while maintaining all Better-Auth features (hooks, session management, token refresh).

**Provider Interface**:
```typescript
interface AuthProvider {
  id: string
  name: string
  signIn(credentials: SignInCredentials): Promise<AuthResult>
  signUp(credentials: SignUpCredentials): Promise<AuthResult>
  refreshToken(session: Session): Promise<AuthResult>
  signOut(session: Session): Promise<void>
  verifyEmail?(token: string): Promise<void>
}
```

**Laravel Sanctum Provider Implementation**:
```typescript
// src/lib/auth/providers/sanctum.ts
import { AuthProvider } from 'better-auth'
import { z } from 'zod'

// Zod schemas for Laravel API responses
const LoginResponseSchema = z.object({
  accessToken: z.string(),
  expiresIn: z.number(),
  user: z.object({
    id: z.string(),
    email: z.string().email(),
    name: z.string(),
    email_verified_at: z.string().nullable(),
  }),
})

export const sanctumProvider: AuthProvider = {
  id: 'sanctum',
  name: 'Laravel Sanctum',

  async signIn({ email, password }) {
    const response = await fetch(`${process.env.LARAVEL_API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Invalid credentials')
    }

    const data = await response.json()
    const validated = LoginResponseSchema.parse(data) // Runtime validation

    return {
      user: {
        id: validated.user.id,
        email: validated.user.email,
        name: validated.user.name,
        emailVerified: !!validated.user.email_verified_at,
      },
      session: {
        token: validated.accessToken,
        expiresAt: Date.now() + validated.expiresIn * 1000,
      },
    }
  },

  async signUp({ email, password, name }) {
    const response = await fetch(`${process.env.LARAVEL_API_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Registration failed')
    }

    const data = await response.json()
    const validated = LoginResponseSchema.parse(data)

    return {
      user: {
        id: validated.user.id,
        email: validated.user.email,
        name: validated.user.name,
        emailVerified: !!validated.user.email_verified_at,
      },
      session: {
        token: validated.accessToken,
        expiresAt: Date.now() + validated.expiresIn * 1000,
      },
    }
  },

  async refreshToken({ token }) {
    const response = await fetch(`${process.env.LARAVEL_API_URL}/api/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      throw new Error('Token refresh failed')
    }

    const data = await response.json()
    const validated = LoginResponseSchema.parse(data)

    return {
      user: {
        id: validated.user.id,
        email: validated.user.email,
        name: validated.user.name,
        emailVerified: !!validated.user.email_verified_at,
      },
      session: {
        token: validated.accessToken,
        expiresAt: Date.now() + validated.expiresIn * 1000,
      },
    }
  },

  async signOut({ token }) {
    await fetch(`${process.env.LARAVEL_API_URL}/api/auth/logout`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
  },
}
```

**Better-Auth Client Configuration**:
```typescript
// src/lib/auth/client.ts
import { createAuthClient } from 'better-auth/client'
import { sanctumProvider } from './providers/sanctum'

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL,
  provider: sanctumProvider,
  session: {
    cookieName: 'auth-session',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  },
})

// Export hooks for use in components
export const { useSession, useSignIn, useSignUp, useSignOut } = authClient
```

**Next.js API Route Handler**:
```typescript
// src/app/api/auth/[...better-auth]/route.ts
import { betterAuth } from 'better-auth'
import { sanctumProvider } from '@/lib/auth/providers/sanctum'

const auth = betterAuth({
  provider: sanctumProvider,
})

export const { GET, POST } = auth.handler
```

### Alternatives Considered

| Approach | Modularity | Type-Safety | DX | Backend Control |
|----------|-----------|-------------|-----|----------------|
| **Better-Auth + Sanctum Provider** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| MSW Mocking | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ |
| Direct Fetch Calls | ⭐⭐ | ⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐⭐ |
| Full Better-Auth + LibSQL | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐ |

**Why This Approach**:
- Better-Auth provides excellent React hooks (`useSession`, `useSignIn`, etc.)
- Custom provider pattern maintains modularity (can swap backends)
- Zod validation at provider boundary ensures type-safety
- Laravel backend handles all business logic, database, email verification
- No local database needed - simplifies deployment
- Can easily switch to Firebase/Supabase by creating new provider

---

## 2. Email Verification Service

### Research Question
How should email verification be handled with Laravel backend?

### Decision: Laravel Backend Handles All Email

**Rationale**:
- **Backend Responsibility**: Laravel API handles email verification, password resets, magic links
- **No Frontend Email Service Needed**: All email logic in Laravel (Resend, Mailgun, SES, etc.)
- **Frontend Only Displays UI**: Verification pages, reset forms, success messages
- **API Endpoints**: Laravel provides endpoints for verification, resend, reset password

**Laravel API Endpoints** (expected from backend):
```
POST /api/auth/email/verify
POST /api/auth/email/resend
POST /api/auth/password/forgot
POST /api/auth/password/reset
```

**Frontend Implementation**:
```typescript
// src/lib/api/email.ts
import { z } from 'zod'

const VerifyEmailResponseSchema = z.object({
  message: z.string(),
  success: z.boolean(),
})

export async function verifyEmail(token: string) {
  const response = await fetch(`${process.env.LARAVEL_API_URL}/api/auth/email/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token }),
  })

  if (!response.ok) {
    throw new Error('Email verification failed')
  }

  const data = await response.json()
  return VerifyEmailResponseSchema.parse(data)
}

export async function resendVerificationEmail(email: string) {
  const response = await fetch(`${process.env.LARAVEL_API_URL}/api/auth/email/resend`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  })

  if (!response.ok) {
    throw new Error('Failed to resend verification email')
  }

  const data = await response.json()
  return VerifyEmailResponseSchema.parse(data)
}
```

**Frontend Pages**:
- `/verify-email?token=...` - Calls Laravel API to verify email
- `/resend-verification` - Form to resend verification email
- `/forgot-password` - Form to request password reset
- `/reset-password?token=...` - Form to reset password with token

**No additional dependencies needed** - email is handled entirely by Laravel backend

---

## 3. Avatar Storage Solution

### Research Question
How should avatar uploads be handled with Laravel backend?

### Decision: Laravel Backend Handles Avatar Storage

**Rationale**:
- **Backend Responsibility**: Laravel API handles file upload, storage (S3, local, etc.), validation
- **Frontend Uploads to Laravel**: Avatar upload form sends file to Laravel API endpoint
- **Laravel Returns URL**: API returns avatar URL which frontend displays
- **Consistency**: All user data (profile + avatar URL) stored in Laravel database

**Laravel API Endpoints** (expected from backend):
```
POST /api/profile/avatar
DELETE /api/profile/avatar
```

**Frontend Implementation**:
```typescript
// src/lib/api/profile.ts
import { z } from 'zod'

const AvatarUploadResponseSchema = z.object({
  avatarUrl: z.string().url(),
  message: z.string(),
})

export async function uploadAvatar(file: File, token: string) {
  const formData = new FormData()
  formData.append('avatar', file)

  const response = await fetch(`${process.env.LARAVEL_API_URL}/api/profile/avatar`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Avatar upload failed')
  }

  const data = await response.json()
  return AvatarUploadResponseSchema.parse(data)
}

export async function deleteAvatar(token: string) {
  const response = await fetch(`${process.env.LARAVEL_API_URL}/api/profile/avatar`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    throw new Error('Failed to delete avatar')
  }

  return response.json()
}
```

**Frontend Component**:
```typescript
// Avatar upload form component
export function AvatarUploadForm() {
  const { session } = useSession()
  const [uploading, setUploading] = useState(false)

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !session?.token) return

    setUploading(true)
    try {
      const result = await uploadAvatar(file, session.token)
      // Update user state with new avatar URL
    } catch (error) {
      // Handle error
    } finally {
      setUploading(false)
    }
  }

  return (
    <input
      type="file"
      accept="image/*"
      onChange={handleUpload}
      disabled={uploading}
    />
  )
}
```

**No additional dependencies needed** - file upload handled entirely by Laravel backend

---

## 4. Password Hashing Strategy

### Research Question
How should password hashing be handled with Laravel backend?

### Decision: Laravel Backend Handles Password Hashing

**Rationale**:
- **Backend Responsibility**: Laravel API handles all password hashing, validation, and storage
- **Laravel Default**: Uses bcrypt by default (can be configured to Argon2)
- **Frontend Never Sees Passwords**: Passwords sent over HTTPS to Laravel API only
- **Security Best Practice**: Password hashing belongs on backend

**Frontend Implementation**:
- Frontend collects password in form
- Sends password to Laravel API over HTTPS
- Laravel hashes password using bcrypt/Argon2
- Frontend receives auth token response (no password returned)

**Password Validation**:
- Frontend can fetch password policy from Laravel API
- Display requirements to user before submission
- Laravel API performs final validation server-side

```typescript
// src/lib/api/auth.ts
const PasswordPolicySchema = z.object({
  minLength: z.number(),
  requireUppercase: z.boolean(),
  requireLowercase: z.boolean(),
  requireNumber: z.boolean(),
  requireSpecial: z.boolean(),
})

export async function getPasswordPolicy() {
  const response = await fetch(`${process.env.LARAVEL_API_URL}/api/auth/password-policy`)
  const data = await response.json()
  return PasswordPolicySchema.parse(data)
}
```

**No frontend hashing needed** - all password security handled by Laravel

---

## 5. Session Management Approach

### Research Question
How should sessions be managed between Better-Auth frontend and Laravel Sanctum backend?

### Decision: Better-Auth Manages Frontend Sessions, Laravel Sanctum Manages Backend Tokens

**Hybrid Approach**:
- **Laravel Backend**: Issues JWT access tokens via Sanctum
- **Better-Auth Frontend**: Stores tokens in cookies, manages refresh logic
- **Token Flow**: Better-Auth custom provider fetches tokens from Laravel API

**Session Flow**:
1. **Login**: User submits credentials → Better-Auth calls Sanctum provider → Laravel returns access token + expiry → Better-Auth stores in cookie
2. **Authenticated Requests**: Better-Auth includes token in Authorization header → Laravel validates token
3. **Token Refresh**: Better-Auth detects expiry → Calls Sanctum provider refresh → Laravel issues new token → Better-Auth updates cookie
4. **Logout**: Better-Auth calls Sanctum provider signOut → Laravel revokes token → Better-Auth clears cookie

**Better-Auth Session Configuration**:
```typescript
// src/lib/auth/client.ts
export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL,
  provider: sanctumProvider,
  session: {
    cookieName: 'auth-session',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    strategy: 'jwt', // Store JWT in cookie
  },
})
```

**Laravel Sanctum Token Strategy**:
- Access tokens expire in 1 hour (configurable in Laravel)
- Refresh tokens expire in 7 days (configurable in Laravel)
- Laravel stores refresh tokens in database for revocation
- Laravel can revoke all user sessions on password change, account deletion

**Frontend Token Storage**:
- Better-Auth stores access token in httpOnly cookie (secure)
- Frontend never directly accesses token (handled by Better-Auth)
- Better-Auth automatically includes token in requests

**Benefits**:
- **Security**: httpOnly cookies prevent XSS attacks
- **DX**: Better-Auth hooks abstract token management
- **Revocation**: Laravel can revoke sessions server-side
- **Refresh**: Better-Auth handles token refresh automatically

---

## 6. Database Schema Design

### Research Question
What database schema is needed for Next.js frontend with Laravel backend?

### Decision: No Frontend Database - All Data in Laravel

**Rationale**:
- **Single Source of Truth**: All user data stored in Laravel MySQL/PostgreSQL database
- **No Local Database**: Frontend has no LibSQL or database dependency
- **Better-Auth Session Storage**: Uses cookies only (no database sessions)
- **Simplified Deployment**: Frontend is stateless, no database migrations needed

**Laravel Backend Schema** (expected from backend):

```sql
-- Users table (Laravel default with Sanctum)
CREATE TABLE users (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  email_verified_at TIMESTAMP NULL,
  password VARCHAR(255) NOT NULL,
  remember_token VARCHAR(100) NULL,
  created_at TIMESTAMP NULL,
  updated_at TIMESTAMP NULL
);

-- User profiles (1:1 with users)
CREATE TABLE profiles (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED UNIQUE NOT NULL,
  avatar_url VARCHAR(255) NULL,
  bio TEXT NULL,
  created_at TIMESTAMP NULL,
  updated_at TIMESTAMP NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- User settings (1:1 with users)
CREATE TABLE settings (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED UNIQUE NOT NULL,
  theme ENUM('light', 'dark', 'system') DEFAULT 'system',
  language VARCHAR(10) DEFAULT 'en',
  timezone VARCHAR(50) DEFAULT 'UTC',
  notification_preferences JSON NULL,
  created_at TIMESTAMP NULL,
  updated_at TIMESTAMP NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Personal access tokens (Laravel Sanctum)
CREATE TABLE personal_access_tokens (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  tokenable_type VARCHAR(255) NOT NULL,
  tokenable_id BIGINT UNSIGNED NOT NULL,
  name VARCHAR(255) NOT NULL,
  token VARCHAR(64) UNIQUE NOT NULL,
  abilities TEXT NULL,
  last_used_at TIMESTAMP NULL,
  expires_at TIMESTAMP NULL,
  created_at TIMESTAMP NULL,
  updated_at TIMESTAMP NULL,
  INDEX personal_access_tokens_tokenable_type_tokenable_id_index (tokenable_type, tokenable_id)
);
```

**Frontend State Management**:
- **Better-Auth State**: User object cached in React state via `useSession()`
- **API Client Cache**: React Query or SWR for profile/settings data
- **No Persistence**: All data fetched from Laravel API on demand

**Benefits**:
- **Simpler Frontend**: No database setup, migrations, or schema management
- **Consistent Data**: Laravel is single source of truth
- **Easier Testing**: No database seeding needed for frontend tests
- **Scalability**: Frontend can be deployed to edge (Vercel, Cloudflare)

---

## 7. Password Policy Configuration

### Research Question
How should password policy be implemented with Laravel backend?

### Decision: Fetch Policy from Laravel API, Validate Client-Side

**Approach**:
- **Laravel Stores Policy**: Password policy configured in Laravel (database or config)
- **Frontend Fetches Policy**: GET endpoint returns current password requirements
- **Client-Side Validation**: Zod schema built dynamically based on policy
- **Server-Side Final Validation**: Laravel validates on registration/password change

**Frontend Implementation**:
```typescript
// src/lib/api/auth.ts
import { z } from 'zod'

const PasswordPolicySchema = z.object({
  minLength: z.number(),
  requireUppercase: z.boolean(),
  requireLowercase: z.boolean(),
  requireNumber: z.boolean(),
  requireSpecial: z.boolean(),
})

export async function getPasswordPolicy() {
  const response = await fetch(`${process.env.LARAVEL_API_URL}/api/auth/password-policy`)
  const data = await response.json()
  return PasswordPolicySchema.parse(data)
}

// Build Zod schema from policy
export function buildPasswordSchema(policy: z.infer<typeof PasswordPolicySchema>) {
  let schema = z.string().min(policy.minLength, `Password must be at least ${policy.minLength} characters`)

  if (policy.requireUppercase) {
    schema = schema.refine((val) => /[A-Z]/.test(val), 'Password must contain at least one uppercase letter')
  }

  if (policy.requireLowercase) {
    schema = schema.refine((val) => /[a-z]/.test(val), 'Password must contain at least one lowercase letter')
  }

  if (policy.requireNumber) {
    schema = schema.refine((val) => /\d/.test(val), 'Password must contain at least one number')
  }

  if (policy.requireSpecial) {
    schema = schema.refine((val) => /[^A-Za-z0-9]/.test(val), 'Password must contain at least one special character')
  }

  return schema
}

// Usage in form component
const policy = await getPasswordPolicy()
const PasswordSchema = buildPasswordSchema(policy)
```

**Benefits**:
- **Immediate Feedback**: Frontend shows password requirements before submission
- **Centralized Config**: Password policy managed in Laravel admin panel
- **Type-Safe**: Zod validation ensures policy matches expected shape
- **Graceful Degradation**: If policy fetch fails, use sensible defaults

---

## Environment Variables Summary

```env
# Laravel API
LARAVEL_API_URL=http://localhost:8000
# or for production
LARAVEL_API_URL=https://api.yourdomain.com

# Next.js
NEXT_PUBLIC_APP_URL=http://localhost:3000
# or for production
NEXT_PUBLIC_APP_URL=https://yourdomain.com

# Mastra (existing)
OPENAI_API_KEY=sk-...
# or
OPENROUTER_API_KEY=sk-or-...

# Logging
LOG_LEVEL=debug # development
LOG_LEVEL=info  # production
```

**Note**: No database, email, or file storage credentials needed in frontend - all handled by Laravel backend.

---

## Dependencies to Add

```json
{
  "dependencies": {
    "better-auth": "^1.0.0",
    "zod": "^3.22.0",
    "@tanstack/react-query": "^5.0.0"
  }
}
```

**Minimal dependencies**:
- `better-auth`: Frontend auth framework with custom provider support
- `zod`: Runtime validation for Laravel API responses
- `@tanstack/react-query`: Optional but recommended for API data caching

---

## Migration Path (if switching providers)

### From Laravel Sanctum to Firebase Auth
1. Create new Firebase provider implementing `AuthProvider` interface
2. Update `sanctumProvider` import to `firebaseProvider` in `src/lib/auth/client.ts`
3. Update API contracts to match Firebase response format
4. No other code changes needed - Better-Auth abstracts provider details

### From Laravel Sanctum to Supabase Auth
1. Create new Supabase provider implementing `AuthProvider` interface
2. Update `sanctumProvider` import to `supabaseProvider` in `src/lib/auth/client.ts`
3. Update API contracts to match Supabase response format
4. No other code changes needed - Better-Auth abstracts provider details

**All transitions preserve SOLID principles due to Better-Auth's custom provider pattern**

---

## Next Steps

✅ All technology decisions finalized
✅ Implementation approaches documented
✅ No remaining NEEDS CLARIFICATION

**Ready for Phase 1**: Design data models and API contracts
