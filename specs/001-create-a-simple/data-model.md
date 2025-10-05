# Data Model

**Feature**: Modular Starter Kit with Auth, Profile, Settings & Dashboard
**Date**: 2025-10-02
**Architecture**: Frontend (Next.js + Better-Auth) ↔ Backend (Laravel Sanctum API)

## Architecture Overview

This project uses a **backend-first** data model where all data resides in Laravel's database (MySQL/PostgreSQL). The Next.js frontend is **stateless** and fetches data via Laravel API endpoints.

```
┌──────────────────────────────────────┐
│  Next.js Frontend (Stateless)       │
│  - Better-Auth (session cookies)    │
│  - React Query (API cache)          │
│  - No database                       │
└──────────────┬───────────────────────┘
               │ HTTPS + JWT Bearer Token
               │
               ▼
┌──────────────────────────────────────┐
│  Laravel Backend API                 │
│  - Sanctum (token auth)              │
│  - MySQL/PostgreSQL database         │
│  - Email, file storage, business     │
└──────────────────────────────────────┘
```

---

## Laravel API Data Model

The following entities are **stored in Laravel** and exposed via API endpoints.

### Entity Relationship Diagram

```
┌─────────────┐
│    User     │
│─────────────│
│ id (PK)     │
│ name        │
│ email (UK)  │
│ emailVer... │
│ password    │
│ createdAt   │
│ updatedAt   │
└──────┬──────┘
       │
       ├─────────────────────┬──────────────────┬──────────────────┐
       │                     │                  │                  │
       │ 1:1                 │ 1:1              │ 1:N              │
       │                     │                  │                  │
┌──────▼──────┐      ┌───────▼────────┐  ┌─────▼──────────────┐
│   Profile   │      │   Settings     │  │ PersonalAccessToken│
│─────────────│      │────────────────│  │────────────────────│
│ id (PK)     │      │ id (PK)        │  │ id (PK)            │
│ userId (FK) │      │ userId (FK)    │  │ tokenable_id (FK)  │
│ avatarUrl   │      │ theme          │  │ token (UK)         │
│ bio         │      │ language       │  │ expiresAt          │
└─────────────┘      │ timezone       │  │ lastUsedAt         │
                     │ notif...       │  └────────────────────┘
                     └────────────────┘
```

---

## Entity Definitions

### User
Core user identity and authentication credentials (Laravel default `users` table).

**Fields**:
- `id` (BIGINT, PK): Auto-increment ID
- `name` (VARCHAR(255), NOT NULL): User's display name
- `email` (VARCHAR(255), UNIQUE, NOT NULL): User's email address
- `email_verified_at` (TIMESTAMP, NULL): Email verification timestamp
- `password` (VARCHAR(255), NOT NULL): Bcrypt/Argon2 hashed password
- `remember_token` (VARCHAR(100), NULL): Laravel remember token
- `created_at` (TIMESTAMP, NULL): Record creation time
- `updated_at` (TIMESTAMP, NULL): Record last update time

**Relationships**:
- → Profile (1:1)
- → Settings (1:1)
- → PersonalAccessToken (1:N) - Sanctum tokens

**Laravel API Endpoints**:
```
POST   /api/auth/register       - Create user
POST   /api/auth/login          - Authenticate user
POST   /api/auth/logout         - Revoke token
POST   /api/auth/refresh        - Refresh access token
GET    /api/auth/user           - Get authenticated user
DELETE /api/auth/user           - Delete account
```

**Validation Rules** (Laravel):
- Email: valid format, unique, max 255 characters
- Password: must meet password policy (see PasswordPolicy section)
- Name: required, min 1 character, max 255 characters

**Sample Response**:
```json
{
  "id": 1,
  "name": "John Doe",
  "email": "user@example.com",
  "email_verified_at": "2025-01-01T12:00:00Z",
  "created_at": "2025-01-01T12:00:00Z",
  "updated_at": "2025-01-01T12:00:00Z"
}
```

---

### Profile
User profile information (avatar, bio).

**Fields**:
- `id` (BIGINT, PK): Auto-increment ID
- `user_id` (BIGINT, UNIQUE, NOT NULL, FK → users.id): Owner
- `avatar_url` (VARCHAR(255), NULL): URL to uploaded avatar
- `bio` (TEXT, NULL): User biography/description
- `created_at` (TIMESTAMP, NULL)
- `updated_at` (TIMESTAMP, NULL)

**Relationships**:
- ← User (1:1)

**Laravel API Endpoints**:
```
GET    /api/profile            - Get current user's profile
PUT    /api/profile            - Update profile (name, bio)
POST   /api/profile/avatar     - Upload avatar
DELETE /api/profile/avatar     - Delete avatar
```

**Validation Rules** (Laravel):
- Avatar: Image file (jpg, png, gif), max 4MB
- Bio: Max 500 characters

**Sample Response**:
```json
{
  "id": 1,
  "user_id": 1,
  "avatar_url": "https://storage.example.com/avatars/user1.jpg",
  "bio": "Full-stack developer",
  "created_at": "2025-01-01T12:00:00Z",
  "updated_at": "2025-01-01T12:00:00Z"
}
```

---

### Settings
User preferences and configuration.

**Fields**:
- `id` (BIGINT, PK): Auto-increment ID
- `user_id` (BIGINT, UNIQUE, NOT NULL, FK → users.id): Owner
- `theme` (ENUM): 'light', 'dark', or 'system' (default: 'system')
- `language` (VARCHAR(10)): ISO 639-1 code (default: 'en')
- `timezone` (VARCHAR(50)): IANA timezone (default: 'UTC')
- `notification_preferences` (JSON): Notification settings
- `created_at` (TIMESTAMP, NULL)
- `updated_at` (TIMESTAMP, NULL)

**Relationships**:
- ← User (1:1)

**Laravel API Endpoints**:
```
GET    /api/settings           - Get current user's settings
PUT    /api/settings           - Update settings
POST   /api/settings/reset     - Reset to defaults
```

**Validation Rules** (Laravel):
- Theme: Enum ['light', 'dark', 'system']
- Language: Valid ISO 639-1 code
- Timezone: Valid IANA timezone identifier
- notification_preferences schema:
  ```json
  {
    "email": true,
    "push": false,
    "sms": false
  }
  ```

**Sample Response**:
```json
{
  "id": 1,
  "user_id": 1,
  "theme": "dark",
  "language": "en",
  "timezone": "America/New_York",
  "notification_preferences": {
    "email": true,
    "push": false,
    "sms": false
  },
  "created_at": "2025-01-01T12:00:00Z",
  "updated_at": "2025-01-01T12:00:00Z"
}
```

---

### PersonalAccessToken (Laravel Sanctum)
API tokens issued to users for authentication.

**Fields**:
- `id` (BIGINT, PK): Auto-increment ID
- `tokenable_type` (VARCHAR(255)): Polymorphic type (e.g., 'App\Models\User')
- `tokenable_id` (BIGINT): User ID
- `name` (VARCHAR(255)): Token name/identifier
- `token` (VARCHAR(64), UNIQUE): Hashed token value
- `abilities` (TEXT, NULL): JSON array of token permissions
- `last_used_at` (TIMESTAMP, NULL): Last token usage timestamp
- `expires_at` (TIMESTAMP, NULL): Token expiration timestamp
- `created_at` (TIMESTAMP, NULL)
- `updated_at` (TIMESTAMP, NULL)

**Relationships**:
- ← User (1:N) via polymorphic relation

**Lifecycle**:
- Created on login (POST /api/auth/login)
- Validated on each authenticated request (Authorization: Bearer {token})
- Refreshed via POST /api/auth/refresh
- Revoked on logout (POST /api/auth/logout)
- Revoked on password change
- Revoked on account deletion

**Security Notes**:
- Token is hashed before storage (Laravel Sanctum default)
- Plain token only returned once on creation
- Frontend stores plain token in httpOnly cookie via Better-Auth

---

### Password Policy
System-wide password requirements (configurable via Laravel config or admin panel).

**Configuration** (Laravel):
```php
// config/auth.php or database table
[
  'min_length' => 8,
  'require_uppercase' => true,
  'require_lowercase' => true,
  'require_number' => true,
  'require_special' => false,
]
```

**Laravel API Endpoints**:
```
GET    /api/auth/password-policy    - Get current policy
PUT    /api/admin/password-policy   - Update policy (admin only)
```

**Sample Response**:
```json
{
  "minLength": 12,
  "requireUppercase": true,
  "requireLowercase": true,
  "requireNumber": true,
  "requireSpecial": true
}
```

---

## Frontend Data Model

The Next.js frontend **does not have a database**. All data is fetched from Laravel API and cached in-memory.

### Better-Auth Session State

Better-Auth stores minimal session data in **httpOnly cookies**:

```typescript
// Cookie: auth-session
{
  user: {
    id: string,
    email: string,
    name: string,
    emailVerified: boolean
  },
  session: {
    token: string,        // JWT access token from Laravel
    expiresAt: number     // Token expiration timestamp
  }
}
```

### React Query Cache (Optional)

For profile and settings data, use React Query to cache API responses:

```typescript
// src/lib/api/client.ts
import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      cacheTime: 1000 * 60 * 30, // 30 minutes
    },
  },
})
```

---

## Zod Schema Mappings

All Laravel API responses are validated using Zod schemas on the frontend:

```typescript
// src/lib/schemas/user.ts
import { z } from 'zod'

export const UserSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string().email(),
  email_verified_at: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
})

export const ProfileSchema = z.object({
  id: z.number(),
  user_id: z.number(),
  avatar_url: z.string().url().nullable(),
  bio: z.string().max(500).nullable(),
  created_at: z.string(),
  updated_at: z.string(),
})

export const SettingsSchema = z.object({
  id: z.number(),
  user_id: z.number(),
  theme: z.enum(['light', 'dark', 'system']),
  language: z.string(),
  timezone: z.string(),
  notification_preferences: z.object({
    email: z.boolean(),
    push: z.boolean(),
    sms: z.boolean(),
  }),
  created_at: z.string(),
  updated_at: z.string(),
})

export const LoginResponseSchema = z.object({
  accessToken: z.string(),
  expiresIn: z.number(),
  user: UserSchema,
})

export const PasswordPolicySchema = z.object({
  minLength: z.number(),
  requireUppercase: z.boolean(),
  requireLowercase: z.boolean(),
  requireNumber: z.boolean(),
  requireSpecial: z.boolean(),
})
```

---

## State Transitions

### User Registration Flow (Laravel Backend)

```
┌──────────────┐
│ New Visitor  │
└──────┬───────┘
       │ POST /api/auth/register
       │ { email, password, name }
       │
       ▼
┌──────────────────────────────────┐
│ Laravel Creates:                 │
│ - User (email_verified_at = null)│
│ - Profile (default)              │
│ - Settings (defaults)            │
│ - Email verification sent        │
└──────┬───────────────────────────┘
       │
       │ User clicks verification link
       │ POST /api/auth/email/verify { token }
       │
       ▼
┌──────────────────────┐
│ Laravel Updates:     │
│ - email_verified_at  │
│ - Returns token      │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────────────┐
│ Better-Auth Stores:          │
│ - User in cookie             │
│ - Token in httpOnly cookie   │
└──────┬───────────────────────┘
       │
       ▼
┌──────────────────┐
│ Dashboard Access │
└──────────────────┘
```

### Session Lifecycle (Better-Auth + Sanctum)

```
┌──────────┐
│  Login   │ POST /api/auth/login
└────┬─────┘
     │ Laravel returns { accessToken, expiresIn, user }
     │ Better-Auth stores in cookie
     │
     ▼
┌──────────────────┐
│ Active Session   │
└────┬─────────────┘
     │
     │ Every Request
     │ Authorization: Bearer {token}
     │
     ├──────────┬────────────────┐
     │ Valid    │ Expired        │
     ▼          ▼                │
┌────────┐  ┌──────────────┐    │
│ Success│  │ Auto Refresh │    │
└────────┘  │ POST /refresh│    │
            └───────┬──────┘    │
                    │           │ Refresh Failed
                    ▼           ▼
               ┌────────┐  ┌────────────┐
               │Success │  │Toast Login │
               └────────┘  │+ Redirect  │
                           └────────────┘
```

---

## Performance Considerations

### Frontend Caching Strategy

**React Query Cache Keys**:
```typescript
['user']                    // Current authenticated user
['profile']                 // User profile
['settings']                // User settings
['password-policy']         // Password policy (rarely changes)
```

**Optimization**:
- User data fetched once on login, cached for session duration
- Profile/settings fetched on demand, cached for 5 minutes
- Password policy fetched once, cached for 1 hour
- All mutations invalidate relevant cache keys

### Expected API Call Patterns (per session)

**Login Flow**:
1. POST /api/auth/login (once)
2. GET /api/profile (once, on profile page visit)
3. GET /api/settings (once, on settings page visit)

**Dashboard**:
- No additional API calls (uses cached user data)

**Profile Page**:
- GET /api/profile (cached, 5min)
- POST /api/profile (on save)
- POST /api/profile/avatar (on avatar upload)

**Settings Page**:
- GET /api/settings (cached, 5min)
- PUT /api/settings (on save)

---

## Next Steps

✅ Data model defined for Laravel backend
✅ Frontend caching strategy designed
✅ Zod schemas specified for all entities
✅ API endpoints documented
✅ State transitions mapped

**Ready for**: API contract definitions and implementation
