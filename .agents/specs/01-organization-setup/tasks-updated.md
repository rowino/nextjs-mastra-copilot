# Tasks: Multi-Tenant Organization Setup with UI Management

## Phase 1: Backend Infrastructure (COMPLETED)

**Status**: ✅ All tasks completed in feature/organization-setup branch

- [x] **Task 1.1**: Enable organization plugin in `src/lib/auth.ts`
- [x] **Task 1.2**: Run Better Auth migration
- [x] **Task 2.1**: Create auth context module
- [x] **Task 2.2**: Update CopilotKit route for auth extraction
- [x] **Task 2.3**: Create org-scoped DB utilities
- [x] **Task 3.1**: Add type definitions
- [x] **Task 3.2**: Add domain tables to schema
- [x] **Task 3.3**: Generate and apply migrations
- [x] **Task 3.4**: Verify schema with queries

---

## Phase 2: Role-Based Access Control (2-3 hours)

**Cluster: Backend RBAC Infrastructure**

- [ ] **Task 2.1**: Update member table schema with role enum
  - Open `src/db/schema.ts`
  - Update member table role column: `role: text("role", { enum: ["admin", "user"] }).notNull()`
  - Generate migration: `npx drizzle-kit generate`
  - Review migration SQL (should be ALTER TABLE if possible, or data migration)
  - Apply migration: `npx wrangler d1 migrations apply mastra-db --local`

- [ ] **Task 2.2**: Add role validation utility
  - Open `src/mastra/tools/shared/org-scoped-db.ts`
  - Add `hasAdminRole(): boolean` function
  - Add `requireAdminRole(): void` function (throws if not admin)
  - Export both functions

- [ ] **Task 2.3**: Update auth context types
  - Open `src/lib/auth-context.ts`
  - Ensure `AuthContext.roles` is typed as `("admin" | "user")[]`
  - Update documentation comments

- [ ] **Task 2.4**: Test role validation
  - Create test user with admin role
  - Create test user with user role
  - Verify hasAdminRole() returns correct values
  - Verify requireAdminRole() throws for non-admin

**Definition of Done:**
- Member table has role enum constraint
- Role validation utilities available
- Tests confirm role checks work correctly

---

## Phase 3: Organization API Routes (4-5 hours)

**Cluster: Backend API Endpoints**

- [ ] **Task 3.1**: Create organization API route
  - Create `src/app/api/organization/route.ts`
  - Implement GET handler:
    - Get auth context
    - Query all organizations where user is member
    - Return array of { id, name, slug, logo, role, createdAt }
  - Implement POST handler:
    - Validate request body (name, slug optional)
    - Require authentication
    - Generate organization ID
    - Insert organization record
    - Insert member record with role="admin"
    - Return created organization
  - Add Zod schemas for validation

- [ ] **Task 3.2**: Create organization detail API route
  - Create `src/app/api/organization/[orgId]/route.ts`
  - Implement GET handler:
    - Validate user is member of organization
    - Return organization details
  - Implement PATCH handler:
    - Require admin role (requireAdminRole())
    - Validate ownership (validateOrgOwnership())
    - Update organization fields (name, slug, logo)
    - Return updated organization
  - Implement DELETE handler:
    - Require admin role
    - Validate ownership
    - Check if user is last admin (prevent if true)
    - Delete organization (cascades to all data)
    - Return success

- [ ] **Task 3.3**: Create organization switch API route
  - Create `src/app/api/organization/switch/route.ts`
  - Implement POST handler:
    - Get orgId from request body
    - Verify user is member of target organization
    - Update session/cookie with new active orgId
    - Return success with new orgId

- [ ] **Task 3.4**: Create member management API route
  - Create `src/app/api/organization/[orgId]/members/route.ts`
  - Implement GET handler:
    - Require membership in organization
    - Query all members with user details
    - Return array of { id, userId, name, email, role, createdAt }
  - Implement POST handler (invite member):
    - Require admin role
    - Validate email and role in request
    - Create invitation token (use Better Auth if available)
    - Insert pending member record or invitation
    - Send invitation email
    - Return invitation details
  - Implement PATCH handler (update role):
    - Require admin role
    - Validate member exists and belongs to org
    - Prevent changing own role
    - Update member role
    - Return updated member
  - Implement DELETE handler (remove member):
    - Require admin role OR self-removal
    - Validate member belongs to org
    - Check last admin protection
    - Delete member record
    - Return success

- [ ] **Task 3.5**: Test all API routes
  - Test organization CRUD with admin user
  - Test organization CRUD with non-admin user (should fail)
  - Test member management with admin
  - Test member management with non-admin (should fail)
  - Test organization switching
  - Test last admin protection

**Definition of Done:**
- All API routes implemented and tested
- Role-based access control enforced
- Proper error handling and validation
- Last admin protection works

---

## Phase 4: Frontend Components (5-6 hours)

**Cluster: UI Components for Organization Management**

**IMPORTANT**: Use the frontend-developer agent for all frontend tasks. This agent specializes in React, UI/UX, and component development.

- [ ] **Task 4.1**: Create auth context hook
  - Create `src/hooks/use-auth-context.tsx`
  - Create React Context for auth state
  - Fetch current user and active organization from API
  - Provide: userId, email, orgId, roles, organizations[]
  - Export useAuthContext() hook

- [ ] **Task 4.2**: Create organization switcher component
  - Create `src/components/organization/org-switcher.tsx`
  - Use shadcn/ui dropdown menu component
  - Show current organization name and logo
  - List all user's organizations in dropdown
  - Add "Create Organization" button at bottom
  - Implement switch organization handler (POST to /api/organization/switch)
  - Show loading state during switch
  - Refresh page after successful switch

- [ ] **Task 4.3**: Create organization settings component
  - Create `src/components/organization/org-settings.tsx`
  - Form fields: name, slug, logo (file upload)
  - Save button (admin only)
  - Delete organization button with confirmation modal (admin only)
  - Use react-hook-form with Zod validation
  - Show success/error toasts
  - Implement PATCH to `/api/organization/[orgId]`
  - Implement DELETE to `/api/organization/[orgId]`

- [ ] **Task 4.4**: Create member list component
  - Create `src/components/organization/member-list.tsx`
  - Use shadcn/ui table component
  - Columns: Name, Email, Role, Joined Date, Actions
  - Highlight current user row
  - Role dropdown for each member (admin only)
  - Remove member button (admin only, disabled for self)
  - Implement PATCH to `/api/organization/[orgId]/members` for role change
  - Implement DELETE to `/api/organization/[orgId]/members` for removal
  - Confirmation modal for member removal

- [ ] **Task 4.5**: Create invite member component
  - Create `src/components/organization/invite-member.tsx`
  - Email input field with validation
  - Role selector (admin/user) using shadcn/ui select
  - Send invite button (admin only)
  - Show list of pending invitations below
  - Implement POST to `/api/organization/[orgId]/members`
  - Show success message after invite sent
  - Clear form after successful invite

- [ ] **Task 4.6**: Create organization settings page
  - Create `src/app/(dashboard)/settings/organization/page.tsx`
  - Add admin-only access guard (redirect if not admin)
  - Use tabs: General, Members
  - General tab: render OrgSettings component
  - Members tab: render MemberList and InviteMember components
  - Fetch organization data on mount
  - Show loading skeleton while fetching

- [ ] **Task 4.7**: Update dashboard layout with org switcher
  - Open `src/app/(dashboard)/layout.tsx`
  - Add OrgSwitcher component to header or sidebar
  - Wrap layout with AuthContext provider
  - Show current organization name in header
  - Ensure org switcher visible on all dashboard pages

- [ ] **Task 4.8**: Create organization creation modal
  - Create `src/components/organization/create-org-modal.tsx`
  - Modal with form fields: name, slug (auto-generated from name)
  - Validation: name required, slug must be unique
  - Create button triggers POST to `/api/organization`
  - On success: switch to new organization automatically
  - Close modal and show success toast

- [ ] **Task 4.9**: Style all components
  - Ensure consistent design with existing UI
  - Use shadcn/ui components throughout
  - Match CopilotKit theme colors
  - Responsive design for mobile/tablet/desktop
  - Add proper loading states and skeletons
  - Add empty states (no members, no organizations)

- [ ] **Task 4.10**: Test all UI flows
  - Test organization creation flow
  - Test organization switcher
  - Test member invitation (admin)
  - Test member role change (admin)
  - Test member removal (admin)
  - Test non-admin user sees read-only views
  - Test organization deletion with confirmation
  - Test responsive design on different screen sizes

**Definition of Done:**
- All UI components implemented and styled
- Organization switcher works seamlessly
- Admin can manage members and settings
- Non-admin sees read-only views
- Responsive and accessible UI
- All flows tested end-to-end

---

## Phase 5: Integration & Testing (2-3 hours)

**Cluster: End-to-End Validation**

- [ ] **Task 5.1**: Test complete user journey
  - Sign up new user (auto-creates organization)
  - Verify user is admin of new organization
  - Create second organization
  - Switch between organizations
  - Verify data is scoped correctly

- [ ] **Task 5.2**: Test admin workflows
  - Invite member as admin
  - Accept invitation as new user
  - Change member role
  - Remove member
  - Update organization settings
  - Attempt to delete organization (verify confirmation)

- [ ] **Task 5.3**: Test user (non-admin) restrictions
  - Log in as non-admin user
  - Verify cannot access organization settings
  - Verify cannot invite members
  - Verify cannot change roles
  - Verify cannot remove members
  - Verify can still create datasets/dashboards

- [ ] **Task 5.4**: Test edge cases
  - Last admin protection (cannot remove/leave)
  - Organization deletion cascades all data
  - Switching to non-existent organization
  - Invalid role assignments
  - Duplicate organization slugs

- [ ] **Task 5.5**: Test production deployment
  - Apply migrations to production D1: `npx wrangler d1 migrations apply mastra-db --remote`
  - Deploy to Cloudflare: `pnpm deploy`
  - Test all flows in production environment
  - Verify no console errors or warnings

**Definition of Done:**
- All user journeys tested successfully
- Edge cases handled gracefully
- Production deployment works correctly
- No security vulnerabilities identified

---

## Estimated Timeline

- **Phase 1**: Completed ✅
- **Phase 2**: 2-3 hours (RBAC infrastructure)
- **Phase 3**: 4-5 hours (API routes)
- **Phase 4**: 5-6 hours (Frontend components)
- **Phase 5**: 2-3 hours (Testing)

**Total New Work**: 13-17 hours (2-3 days)

---

## Code Examples

### Updated Member Schema
```typescript
export const member = sqliteTable("member", {
  id: text("id").primaryKey(),
  organizationId: text("organizationId").notNull().references(() => organization.id, { onDelete: "cascade" }),
  userId: text("userId").notNull().references(() => user.id, { onDelete: "cascade" }),
  role: text("role", { enum: ["admin", "user"] }).notNull(),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
});
```

### Role Validation Utilities
```typescript
// src/mastra/tools/shared/org-scoped-db.ts
export function hasAdminRole(): boolean {
  const context = getAuthContext();
  return context.roles.includes('admin');
}

export function requireAdminRole(): void {
  if (!hasAdminRole()) {
    throw new OrgPermissionError("Admin role required");
  }
}
```

### Organization API Route Example
```typescript
// src/app/api/organization/route.ts
import { getAuthContext } from "@/lib/auth-context";
import { getOrgScopedDb, generateId } from "@/mastra/tools/shared/org-scoped-db";
import { organization, member } from "@/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

const createOrgSchema = z.object({
  name: z.string().min(1),
  slug: z.string().optional(),
});

export async function POST(req: Request) {
  const context = getAuthContext();
  const body = await req.json();
  const { name, slug } = createOrgSchema.parse(body);

  const db = getOrgScopedDb();
  const orgId = generateId("org");

  // Insert organization
  await db.insert(organization).values({
    id: orgId,
    name,
    slug: slug || name.toLowerCase().replace(/\s+/g, '-'),
    createdAt: new Date(),
  });

  // Add user as admin member
  await db.insert(member).values({
    id: generateId("mem"),
    organizationId: orgId,
    userId: context.userId,
    role: "admin",
    createdAt: new Date(),
  });

  return Response.json({ id: orgId, name, slug });
}
```

### Auth Context Hook Example
```typescript
// src/hooks/use-auth-context.tsx
"use client";

import { createContext, useContext, useEffect, useState } from "react";

type AuthContextType = {
  userId: string;
  email: string;
  orgId: string;
  roles: ("admin" | "user")[];
  organizations: Array<{ id: string; name: string; role: string }>;
  isAdmin: boolean;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<AuthContextType | null>(null);

  useEffect(() => {
    // Fetch current auth context from API
    fetch("/api/auth/context")
      .then((res) => res.json())
      .then((data) => {
        setAuthState({
          ...data,
          isAdmin: data.roles.includes("admin"),
        });
      });
  }, []);

  if (!authState) return <div>Loading...</div>;

  return <AuthContext.Provider value={authState}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuthContext must be used within AuthProvider");
  return context;
}
```

### Organization Switcher Component Example
```typescript
// src/components/organization/org-switcher.tsx
"use client";

import { useAuthContext } from "@/hooks/use-auth-context";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function OrgSwitcher() {
  const { organizations, orgId } = useAuthContext();
  const currentOrg = organizations.find((org) => org.id === orgId);

  const handleSwitch = async (newOrgId: string) => {
    await fetch("/api/organization/switch", {
      method: "POST",
      body: JSON.stringify({ orgId: newOrgId }),
    });
    window.location.reload();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">{currentOrg?.name || "Select Organization"}</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {organizations.map((org) => (
          <DropdownMenuItem key={org.id} onClick={() => handleSwitch(org.id)}>
            {org.name} {org.id === orgId && "(current)"}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```
