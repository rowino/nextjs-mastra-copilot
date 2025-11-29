# Route Centralization Implementation Plan

## Problem Statement

**Immediate Issue**: Forgot password page links to `/sign-in` but the actual route is `/signin`

**Broader Issue**: 47+ hardcoded route strings across 18 files create maintenance burden and inconsistency risks

## Discovered Routes

**Auth Routes** (6):
- `/` - Home
- `/signin` - Sign in (correct)
- `/sign-in` - WRONG (used in forgot-password page)
- `/signup` - Sign up
- `/forgot-password`, `/reset-password`, `/verify`

**Protected Routes** (4):
- `/dashboard`, `/settings`, `/settings/organization`, `/create-organization`, `/accept-invite`

**API Routes** (9):
- `/api/organization`, `/api/organization/current`, `/api/organization/switch`
- `/api/organization/{orgId}`, `/api/organization/{orgId}/members`, `/api/organization/{orgId}/invitations`
- `/api/invitations/accept`, `/api/auth/*`, `/api/copilotkit`

**Other**: `/terms`, `/privacy`

## Recommended Solution

**Type-Safe Route Namespace System** in `src/lib/routes.ts`

### Architecture

```typescript
// src/lib/routes.ts

export const routes = {
  home: "/",
  terms: "/terms",
  privacy: "/privacy",

  auth: {
    signIn: "/signin",
    signUp: "/signup",
    forgotPassword: "/forgot-password",
    resetPassword: "/reset-password",
    verify: "/verify",
  },

  dashboard: "/dashboard",
  settings: "/settings",

  organization: {
    create: "/create-organization",
    acceptInvite: "/accept-invite",
    settings: "/settings/organization",
  },

  api: {
    organization: {
      root: "/api/organization",
      current: "/api/organization/current",
      switch: "/api/organization/switch",
      byId: "/api/organization/:orgId",
      members: "/api/organization/:orgId/members",
      invitations: "/api/organization/:orgId/invitations",
    },
    invitations: {
      accept: "/api/invitations/accept",
    },
    copilotKit: "/api/copilotkit",
  },
} as const;

type RouteParams = {
  [key: string]: string | number | boolean;
};

export function getRoute(
  path: string,
  params?: RouteParams,
  absolute: boolean = false
): string {
  let url = path;

  // Replace dynamic params like :orgId
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (typeof value === 'string' || typeof value === 'number') {
        url = url.replace(`:${key}`, String(value));
      }
    });

    // Add query params (non-path params)
    const usedParams = new Set(
      (path.match(/:\w+/g) || []).map(p => p.slice(1))
    );
    const queryParams = Object.entries(params)
      .filter(([key]) => !usedParams.has(key))
      .map(([key, value]) => `${key}=${encodeURIComponent(String(value))}`)
      .join('&');

    if (queryParams) {
      url += `?${queryParams}`;
    }
  }

  return absolute ? `${process.env.APP_URL || "http://localhost:3000"}${url}` : url;
}
```

### Benefits

1. **Type Safety**: `as const` + TypeScript autocomplete
2. **Single Source of Truth**: All routes in one file
3. **Dynamic Routes**: Builder functions for `orgId`, query params
4. **Refactor-Safe**: Rename once, updates everywhere
5. **Developer Experience**: IDE autocomplete, compile-time checks

## Implementation Steps (All-at-Once Migration)

### Step 1: Create Route Definitions
**Goal**: Create `src/lib/routes.ts` with all route definitions

1. Create `src/lib/routes.ts` with route definitions object
2. Implement `getRoute(name, params, absolute)` function
3. Verify TypeScript compilation

**Key Features**:
- Nested routes object for organization: `routes.auth.signIn`, `routes.api.organization.members`
- Each route is a path string (static or with `:paramName` placeholders)
- `getRoute()` accepts the path and params to build final URL
- Dynamic path params using `:paramName` syntax (e.g., `/api/organization/:orgId`)
- Automatic query param handling for non-path params
- Absolute URL support via `absolute: true` flag
- Full TypeScript autocomplete for route paths

**Commit**: "feat: add centralized route definitions"

### Step 2: Migrate All Files
**Goal**: Replace all hardcoded route strings across 18 files

**Migration Patterns**:

**Pattern 1: Static Routes**
```typescript
// Before
<Link href="/signin">Sign in</Link>

// After
import { routes, getRoute } from "@/lib/routes";
<Link href={getRoute(routes.auth.signIn)}>Sign in</Link>
```

**Pattern 2: Router Navigation**
```typescript
// Before
router.push("/dashboard")

// After
import { routes, getRoute } from "@/lib/routes";
router.push(getRoute(routes.dashboard))
```

**Pattern 3: Dynamic Organization Routes with Path Params**
```typescript
// Before
await fetch(`/api/organization/${orgId}/members`, { method: "POST" })

// After
import { routes, getRoute } from "@/lib/routes";
await fetch(getRoute(routes.api.organization.members, { orgId }), { method: "POST" })
```

**Pattern 4: Routes with Query Params**
```typescript
// Before
router.push(`/settings/organization?orgId=${orgId}`)

// After
import { routes, getRoute } from "@/lib/routes";
router.push(getRoute(routes.organization.settings, { orgId }))
```

**Pattern 5: Routes with Multiple Params (2FA)**
```typescript
// Before
window.location.href = "/signin?2fa=true";

// After
import { routes, getRoute } from "@/lib/routes";
window.location.href = getRoute(routes.auth.signIn, { "2fa": true });
```

**Pattern 6: Email Template Links (Absolute URLs)**
```typescript
// Before
const link = `${process.env.APP_URL}/accept-invite?token=${token}`;

// After
import { routes, getRoute } from "@/lib/routes";
const link = getRoute(routes.organization.acceptInvite, { token }, true);
```

**Files to Update (18 total)**:

**Auth Pages (4)**:
- `src/app/(auth)/forgot-password/page.tsx:66,107` - Fix `/sign-in` → `routes.auth.signIn`
- `src/app/(auth)/signin/page.tsx` - Update redirect routes
- `src/app/(auth)/signup/page.tsx` - Update redirect routes
- `src/app/(auth)/reset-password/page.tsx:94,122,176` - Update links
- `src/app/(auth)/verify/page.tsx:40,79,106,123,137,156` - Update all redirects

**Protected Pages (3)**:
- `src/app/(protected)/create-organization/page.tsx:45,70,86` - Update API calls and redirects
- `src/app/(protected)/accept-invite/page.tsx:28,48,70,140` - Update API calls and navigation
- `src/app/(protected)/settings/organization/page.tsx:42,57,78` - Update API calls

**Layouts & Landing (2)**:
- `src/app/(protected)/layout.tsx:17-23,92` - Update navigation and guards
- `src/app/page.tsx:22,30,36,70,140` - Update all links

**Components (6)**:
- `src/components/user/user-dropdown.tsx:27,53,58` - Update links
- `src/components/organization/org-switcher.tsx:29` - Update API call
- `src/components/organization/org-settings.tsx:73,109,119` - Update API calls
- `src/components/organization/invite-member.tsx:61` - Update API call
- `src/components/organization/member-list.tsx:62,97` - Update API calls
- `src/components/organization/invitation-list.tsx:30,54` - Update API calls

**Email Templates (2)**:
- `src/lib/email/templates/invitation.ts:19` - Update invite link
- Review password-reset template for hardcoded routes

**Auth Library (1)**:
- `src/lib/auth-client.ts:19` - Update 2FA redirect with `getRoute(routes.auth.signIn, { "2fa": true })`

**Hooks (1)**:
- `src/hooks/use-auth-context.tsx:41-42` - Update API fetch calls

**Commit**: "refactor: centralize all routes to src/lib/routes.ts"

### Step 3: Verification
**Goal**: Ensure migration is complete and functional

1. Run: `grep -r '"/signin"' src/ --include="*.ts" --include="*.tsx" | grep -v routes.ts` → should return nothing
2. Run: `grep -r '"/dashboard"' src/ --include="*.ts" --include="*.tsx" | grep -v routes.ts` → should return nothing
3. Run: `grep -r '"/api/organization' src/ --include="*.ts" --include="*.tsx" | grep -v routes.ts` → should return nothing
4. Run TypeScript check: `pnpm tsc --noEmit`
5. Test all user flows (see Testing Strategy below)
6. Run build just before commit: `pnpm run build`

**Commit**: If all tests pass, amend previous commit or create verification commit

## Critical Files to Modify

1. **`src/lib/routes.ts`** - [NEW] Route definitions
2. **`src/app/(auth)/forgot-password/page.tsx`** - [CRITICAL] Fix `/sign-in` typo
3. **`src/lib/auth-client.ts`** - [CRITICAL] 2FA redirect
4. **`src/app/(protected)/layout.tsx`** - Navigation links
5. **`src/hooks/use-auth-context.tsx`** - API fetch calls

## Testing Strategy

**Manual Testing (Required)**:
- Run dev server: `pnpm dev`
- Check browser console for 404 errors
- Verify TypeScript compiles: `pnpm tsc --noEmit`

**Critical End-to-End Flows**:
1. **Auth Flow**: Sign up → verify email → dashboard
2. **Sign In**: Sign in → 2FA (if enabled) → dashboard
3. **Password Reset**: Forgot password → reset → sign in (CRITICAL: verify `/sign-in` fix)
4. **Organization**: Create org → invite member → accept invite
5. **Settings**: Organization settings → update → verify changes
6. **Navigation**: Test all nav links in header, dropdown, protected layout

## Migration Strategy (User Selected)

**All-at-Once Migration**:
- ✅ Fewer commits (2 total: create routes.ts, migrate all files)
- ✅ Faster implementation
- ✅ One large cohesive change
- ⚠️ Higher risk: Test thoroughly before committing
- ⚠️ Recommended: Test on dev branch first

## Risk Mitigation

| Risk | Severity | Mitigation |
|------|----------|-----------|
| Break existing links | HIGH | Test each phase thoroughly |
| Miss route references | MEDIUM | Final grep scan in Phase 7 |
| Email links fail | MEDIUM | Manual test all email flows |
| Type errors | LOW | TypeScript will catch at build time |

## Files Affected Summary

**Total**: 18 files to modify
- Auth pages: 4 files
- Organization components: 5 files
- Layout/navigation: 2 files
- Hooks: 1 file
- Email templates: 2 files
- API routes: 0 files (consumers updated)
- New files: 1 file (`src/lib/routes.ts`)

## Success Criteria

1. ✅ No `/sign-in` references exist (only `/signin`)
2. ✅ All routes defined in single source (`routes.ts`)
3. ✅ TypeScript autocomplete works for all routes
4. ✅ All user flows tested and working
5. ✅ Build succeeds without errors
6. ✅ No hardcoded route strings in source (except routes.ts)
