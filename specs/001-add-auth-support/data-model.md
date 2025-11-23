# Data Model: Authentication System

**Feature**: 001-add-auth-support
**Date**: 2025-10-06
**Storage**: Cloudflare D1 (SQLite via Drizzle ORM)

## Overview

The authentication system uses better-auth's database schema extended with custom audit logging. All tables are generated via better-auth CLI and managed through Drizzle ORM migrations.

## Core Entities

### 1. User
**Source**: better-auth core schema

Primary entity representing an individual with access to the application.

**Attributes**:
- `id` (string, PK): Unique identifier
- `name` (string, nullable): Display name
- `email` (string, unique, indexed): Email address
- `emailVerifiedAt` (timestamp, default: null): Email verification status
- `image` (string, nullable): Profile picture URL
- `password` (string, nullable): Hashed password (nullable for OAuth-only users)
- `role` (string, default: "user"): User role (managed by admin plugin)
- `createdAt` (timestamp): Account creation time
- `updatedAt` (timestamp): Last update time
- `bannedAt` (timestamp, default: null): Account banned status
- `banReason` (string, nullable): Reason for ban
- `banExpires` (timestamp, nullable): Ban expiration time

**Relationships**:
- `has one` Role (via role field)
- `has many` Accounts (OAuth connections)
- `has many` Sessions
- `has many` Verifications
- `has many` SecurityEvents (custom)

**Indexes**:
- Primary: `id`
- Unique: `email`

**Validation Rules**:
- Email: Valid email format (RFC 5322)
- Password: Nullable (OAuth-only users don't need password)
- Role: Must match defined roles in admin plugin

**State Transitions**:
```
[Pending Verification] → [Verified] (via email verification)
[Active] → [Banned] (by admin)
[Banned] → [Active] (ban expires or admin unbans)
```

---

### 2. Account
**Source**: better-auth core schema

Links user accounts to external OAuth providers (Google, GitHub).

**Attributes**:
- `id` (string, PK): Unique identifier
- `userId` (string, FK → User.id): Associated user
- `accountId` (string): Provider-specific user ID
- `providerId` (string): OAuth provider (google, github)
- `accessToken` (string, nullable): OAuth access token
- `refreshToken` (string, nullable): OAuth refresh token
- `idToken` (string, nullable): OpenID Connect ID token
- `accessTokenExpiresAt` (timestamp, nullable): Token expiration
- `refreshTokenExpiresAt` (timestamp, nullable): Refresh token expiration
- `scope` (string, nullable): Granted OAuth scopes
- `password` (string, nullable): Provider-specific password (unused)
- `createdAt` (timestamp): Link creation time
- `updatedAt` (timestamp): Last token refresh

**Relationships**:
- `belongs to` User (via userId)

**Indexes**:
- Primary: `id`
- Composite unique: `(providerId, accountId)` - prevent duplicate provider accounts
- Foreign key: `userId → User.id` (cascade delete)

**Validation Rules**:
- Account linking: Same email auto-links if `allowDifferentEmails: false`
- Multiple providers: User can have one account per provider

**Notes**:
- Google tokens: Access tokens expire, refresh tokens long-lived
- GitHub tokens: Don't expire unless revoked or unused for 1 year
- OAuth accounts are automatically email-verified

---

### 3. Session
**Source**: better-auth core schema

Represents an authenticated user's active session.

**Attributes**:
- `id` (string, PK): Unique session identifier
- `userId` (string, FK → User.id): Associated user
- `token` (string, unique, indexed): Session token (cookie value)
- `expiresAt` (timestamp): Session expiration
- `ipAddress` (string, nullable): IP address of session creation
- `userAgent` (string, nullable): Browser/device information
- `createdAt` (timestamp): Session start time
- `updatedAt` (timestamp): Last session refresh

**Relationships**:
- `belongs to` User (via userId)

**Indexes**:
- Primary: `id`
- Unique: `token`
- Foreign key: `userId → User.id` (cascade delete)

**Validation Rules**:
- Session duration: 7 days (configurable via `expiresIn`)
- Cookie caching: 5 minutes (reduces database lookups)
- Update age: 1 day (session refreshes after this period)

**Lifecycle**:
```
[Created] → [Active] (on login)
[Active] → [Refreshed] (after updateAge threshold)
[Active] → [Expired] (after expiresAt)
[Active] → [Revoked] (on logout or admin action)
```

**Behavior**:
- Sessions remain active after password change (current device stays logged in)
- Multiple concurrent sessions supported per user
- Session revocation: Individual session or all user sessions

---

### 4. Verification
**Source**: better-auth core schema

Tracks email verification tokens and status.

**Attributes**:
- `id` (string, PK): Unique identifier
- `identifier` (string, indexed): Email address being verified
- `value` (string): Verification token
- `expiresAt` (timestamp): Token expiration (default: 24 hours)
- `createdAt` (timestamp): Token generation time
- `updatedAt` (timestamp): Last update

**Relationships**:
- Implicitly linked to User via email identifier

**Indexes**:
- Primary: `id`
- Index: `identifier` (email lookup)

**Validation Rules**:
- Token format: Cryptographically secure random string
- Expiration: 24 hours (configurable)
- Single-use: Token invalidated after successful verification

**Lifecycle**:
```
[Generated] → [Pending] (token sent to email)
[Pending] → [Verified] (user clicks link)
[Pending] → [Expired] (after expiresAt)
[Generated] → [Regenerated] (user requests new token)
```

**Behavior**:
- Email/password accounts: Verification required but non-blocking (can login immediately)
- OAuth accounts: Auto-verified, no token generation
- Email update: New token generated, verification status reset

---

### 5. Password Reset (Implicit)
**Source**: better-auth core schema (uses Verification table)

Manages password reset requests and tokens.

**Attributes** (reuses Verification table):
- `id` (string, PK): Unique identifier
- `identifier` (string): Email address requesting reset
- `value` (string): Reset token
- `expiresAt` (timestamp): Token expiration (1 hour default)
- `createdAt` (timestamp): Request time

**Validation Rules**:
- Token expiration: 1 hour (configurable via `resetPasswordTokenExpiresIn`)
- Single-use: Token invalidated after password reset
- Rate limiting: 3 requests per 10 seconds per IP

**Lifecycle**:
```
[Requested] → [Token Sent] (via email)
[Token Sent] → [Used] (password reset successful)
[Token Sent] → [Expired] (after 1 hour)
```

---

### 6. Role (Conceptual)
**Source**: admin plugin

Defines user permissions and access levels. **Note**: Not a separate table in basic admin plugin, stored as string field in User table.

**Attributes** (in User table):
- `role` (string): Role name (admin, moderator, user)

**Predefined Roles**:
1. **admin**: Full system access
   - Manage users (ban, unban, delete)
   - Assign roles
   - Access all features
   - View security audit logs

2. **moderator**: Content management
   - Moderate content
   - View user reports
   - Limited user management

3. **user** (default): Standard access
   - Access own profile
   - Use core features
   - No administrative capabilities

**Permission Checking**:
```typescript
// Server-side
const hasPermission = await auth.api.admin.hasPermission({
  userId: session.user.id,
  permission: "admin", // or "moderator", "user"
});

// Client-side
const canModerate = await authClient.admin.hasPermission({
  permission: "moderator",
});
```

**Role Assignment**:
- Default: "user" (on signup)
- Assignment: Admin-only via `admin.setUserRole()` API
- Validation: Must match predefined roles

**Future Enhancement**: For granular permissions, use organization plugin instead

---

### 7. SecurityEvent (Custom Table)
**Source**: Custom audit logging plugin (to be implemented)

Audit log for security-relevant actions and authentication events.

**Attributes**:
- `id` (string, PK): Unique identifier
- `userId` (string, FK → User.id, nullable): Associated user (null for failed attempts)
- `eventType` (string, indexed): Event category
- `action` (string): Specific action performed
- `ipAddress` (string): Client IP address
- `userAgent` (string, nullable): Browser/device info
- `success` (boolean): Whether action succeeded
- `metadata` (JSON, nullable): Additional event context
- `createdAt` (timestamp, indexed): Event time

**Relationships**:
- `belongs to` User (via userId, nullable)

**Indexes**:
- Primary: `id`
- Index: `eventType` (filter by type)
- Index: `createdAt` (time-based queries)
- Index: `userId` (user event history)

**Event Types**:
1. **authentication**:
   - `login_success`, `login_failed`
   - `signup_success`, `signup_failed`
   - `oauth_link_success`, `oauth_link_failed`
   - `logout`

2. **account_management**:
   - `password_changed`
   - `email_changed`
   - `email_verified`
   - `account_linked` (OAuth)

3. **security**:
   - `rate_limit_exceeded`
   - `password_reset_requested`
   - `password_reset_completed`
   - `session_revoked`

4. **admin_actions**:
   - `role_changed`
   - `user_banned`
   - `user_unbanned`

**Metadata Examples**:
```json
{
  "provider": "google",
  "previous_email": "old@example.com",
  "new_role": "moderator",
  "ban_reason": "Spam activity",
  "attempts_count": 3
}
```

**Retention Policy**:
- Indefinite storage for compliance and audit
- Indexed by time for efficient querying
- Consider archival strategy for old events (>1 year)

---

## Database Schema (Drizzle)

Generated via better-auth CLI and extended with custom tables:

```typescript
// src/lib/db/schema.ts (generated + custom)

import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core";

// Better-auth core tables
export const user = sqliteTable("user", {
  id: text("id").primaryKey(),
  name: text("name"),
  email: text("email").notNull().unique(),
  emailVerified: integer("emailVerified", { mode: "boolean" }).default(false),
  image: text("image"),
  password: text("password"),
  role: text("role").default("user"),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull(),
  banned: integer("banned", { mode: "boolean" }).default(false),
  banReason: text("banReason"),
  banExpires: integer("banExpires", { mode: "timestamp" }),
});

export const account = sqliteTable("account", {
  id: text("id").primaryKey(),
  userId: text("userId").notNull().references(() => user.id, { onDelete: "cascade" }),
  accountId: text("accountId").notNull(),
  providerId: text("providerId").notNull(),
  accessToken: text("accessToken"),
  refreshToken: text("refreshToken"),
  idToken: text("idToken"),
  accessTokenExpiresAt: integer("accessTokenExpiresAt", { mode: "timestamp" }),
  refreshTokenExpiresAt: integer("refreshTokenExpiresAt", { mode: "timestamp" }),
  scope: text("scope"),
  password: text("password"),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull(),
}, (table) => ({
  providerAccountIdx: index("providerAccountIdx").on(table.providerId, table.accountId).unique(),
}));

export const session = sqliteTable("session", {
  id: text("id").primaryKey(),
  userId: text("userId").notNull().references(() => user.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  expiresAt: integer("expiresAt", { mode: "timestamp" }).notNull(),
  ipAddress: text("ipAddress"),
  userAgent: text("userAgent"),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull(),
});

export const verification = sqliteTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: integer("expiresAt", { mode: "timestamp" }).notNull(),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull(),
}, (table) => ({
  identifierIdx: index("identifierIdx").on(table.identifier),
}));

// Custom audit table
export const securityEvent = sqliteTable("security_event", {
  id: text("id").primaryKey(),
  userId: text("userId").references(() => user.id, { onDelete: "set null" }),
  eventType: text("eventType").notNull(),
  action: text("action").notNull(),
  ipAddress: text("ipAddress").notNull(),
  userAgent: text("userAgent"),
  success: integer("success", { mode: "boolean" }).notNull(),
  metadata: text("metadata", { mode: "json" }),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
}, (table) => ({
  eventTypeIdx: index("eventTypeIdx").on(table.eventType),
  createdAtIdx: index("createdAtIdx").on(table.createdAt),
  userIdIdx: index("userIdIdx").on(table.userId),
}));
```

## Migration Strategy

### 1. Generate Better-auth Schema
```bash
npx @better-auth/cli@latest generate --output src/lib/db/schema.ts
```

### 2. Add Custom Tables
Manually add `securityEvent` table to generated schema

### 3. Generate Drizzle Migration
```bash
npx drizzle-kit generate
```

### 4. Apply to D1
```bash
# Local
wrangler d1 migrations apply mastra-db --local

# Production
wrangler d1 migrations apply mastra-db --remote
```

### 5. Update wrangler.jsonc
```jsonc
{
  "d1_databases": [{
    "binding": "D1Database",
    "database_name": "mastra-db",
    "database_id": "your-db-id",
    "migrations_dir": "drizzle/migrations"
  }]
}
```

## Data Flow Diagrams

### Signup Flow (Email/Password)
```
User → POST /sign-up/email
  → Validate password (custom hook)
  → Create User (emailVerified: false, role: "user")
  → Create Verification token
  → Send verification email (console.log in dev)
  → Create Session
  → Return session cookie
```

### OAuth Flow (Google/GitHub)
```
User → POST /sign-in/social
  → Redirect to provider
  → Provider callback
  → Check existing email:
    - If exists: Link account (auto-link enabled)
    - If not: Create new user (emailVerified: true)
  → Create/Update Account record
  → Create Session
  → Return session cookie
```

### Email Verification Flow
```
User → Click verification link
  → GET /verify-email?token=xxx
  → Verify token (not expired)
  → Update User.emailVerified = true
  → Delete Verification token
  → Redirect to dashboard (full access)
```

### Password Reset Flow
```
User → POST /forget-password
  → Create Verification token (type: password_reset)
  → Send reset email
  → User clicks link
  → GET /reset-password?token=xxx
  → Verify token
  → POST /reset-password (new password)
  → Update User.password
  → Delete Verification token
  → Create SecurityEvent (password_reset_completed)
```

## Query Patterns

### Get User with Accounts
```typescript
const userWithAccounts = await db.query.user.findFirst({
  where: eq(user.id, userId),
  with: {
    accounts: true,
  },
});
```

### Get Active Sessions
```typescript
const activeSessions = await db.query.session.findMany({
  where: and(
    eq(session.userId, userId),
    gt(session.expiresAt, new Date())
  ),
});
```

### Security Audit Log
```typescript
const recentEvents = await db.query.securityEvent.findMany({
  where: and(
    eq(securityEvent.userId, userId),
    gte(securityEvent.createdAt, thirtyDaysAgo)
  ),
  orderBy: desc(securityEvent.createdAt),
  limit: 100,
});
```

---

**Data Model Status**: ✅ Complete
**Next Step**: Generate API contracts and test scenarios
