# Spec: Multi-Tenant Organization Setup with UI Management

## Overview

Implement complete multi-tenant organization infrastructure with role-based access control (RBAC) and comprehensive UI for organization management. Users can create/join organizations, manage members, switch between organizations, and perform role-based actions.

## Requirements

### Core Features

1. **Multi-Tenant Authentication**
   - Better Auth organization plugin integration
   - Auto-create organization on user signup
   - Organization and member tables in database

2. **Role-Based Access Control (RBAC)**
   - Two roles: `admin` and `user`
   - Role permissions:
     - **Admin**: Full access (create/update/delete resources, manage members, invite users, change roles, delete organization)
     - **User**: Read-only + create resources (cannot manage members, change roles, or delete organization)
   - Role enforcement at API and UI levels

3. **Auth Context Infrastructure**
   - AsyncLocalStorage-based context propagation
   - Automatic orgId injection in all tool calls
   - Auth context includes: userId, email, orgId, roles

4. **Database Schema**
   - Organization-scoped tables: dataset, dashboard, widget, automation, automationRun
   - Indexes for org-scoped queries
   - Foreign key cascades for cleanup

5. **Organization Management UI**
   - Organization switcher in header/sidebar
   - Organization settings page (admin only)
   - Member management interface (admin only)
   - Invite system with role selection (admin only)
   - Leave organization functionality
   - Delete organization (admin only, with confirmation)

### Updated Member Table Schema

```typescript
export const member = sqliteTable("member", {
  id: text("id").primaryKey(),
  organizationId: text("organizationId").notNull().references(() => organization.id, { onDelete: "cascade" }),
  userId: text("userId").notNull().references(() => user.id, { onDelete: "cascade" }),
  role: text("role", { enum: ["admin", "user"] }).notNull(), // Updated with enum
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
});
```

## Architecture

### Backend Components

1. **src/lib/auth.ts**
   - Better Auth configuration with organization plugin

2. **src/lib/auth-context.ts**
   - AuthContext type with userId, email, orgId, roles
   - AsyncLocalStorage for context propagation
   - setAuthContext() and getAuthContext() functions

3. **src/app/api/copilotkit/route.ts**
   - Session validation
   - Active organization membership retrieval
   - Auth context initialization

4. **src/mastra/tools/shared/org-scoped-db.ts**
   - getOrgScopedDb() - Drizzle instance
   - getAuthenticatedContext() - auth context wrapper
   - validateOrgOwnership() - record ownership validation
   - hasAdminRole() - role permission check
   - generateId() - ID generation utility

5. **src/db/schema.ts**
   - Organization and member tables (with role enum)
   - Domain tables: dataset, dashboard, widget, automation, automationRun
   - Org-scoped indexes

### Frontend Components (NEW)

1. **src/components/organization/org-switcher.tsx**
   - Dropdown showing current organization
   - List of user's organizations
   - "Create Organization" button
   - Switch organization action

2. **src/components/organization/org-settings.tsx**
   - Organization details form (name, slug, logo)
   - Save changes (admin only)
   - Delete organization button (admin only)
   - Role-based UI visibility

3. **src/components/organization/member-list.tsx**
   - Table of organization members
   - Shows: name, email, role, joined date
   - Actions: change role, remove member (admin only)
   - Current user highlighted

4. **src/components/organization/invite-member.tsx**
   - Email input field
   - Role selector (admin/user)
   - Send invite button (admin only)
   - Invite list with pending invites

5. **src/app/(dashboard)/settings/organization/page.tsx**
   - Organization settings page
   - Uses OrgSettings, MemberList, InviteMember components
   - Admin-only access guard

6. **src/app/(dashboard)/layout.tsx**
   - Add OrgSwitcher to header/sidebar
   - Show current organization context

### API Routes (NEW)

1. **src/app/api/organization/route.ts**
   - GET: List user's organizations
   - POST: Create new organization
   - PATCH: Update organization (admin only)
   - DELETE: Delete organization (admin only)

2. **src/app/api/organization/[orgId]/members/route.ts**
   - GET: List organization members
   - POST: Invite member (admin only)
   - PATCH: Update member role (admin only)
   - DELETE: Remove member (admin only)

3. **src/app/api/organization/switch/route.ts**
   - POST: Switch active organization
   - Updates session/context with new orgId

## User Flows

### 1. New User Signup
1. User signs up via Better Auth
2. Organization auto-created with user as admin
3. Member record created with role="admin"
4. User redirected to dashboard

### 2. Create Organization
1. User clicks "Create Organization" in org switcher
2. Modal opens with name/slug input
3. POST to `/api/organization`
4. New organization created with user as admin
5. Automatically switch to new organization

### 3. Invite Member (Admin Only)
1. Admin navigates to Settings → Organization
2. Enters email and selects role (admin/user)
3. POST to `/api/organization/[orgId]/members`
4. Invitation email sent with join link
5. Member added to list when they accept

### 4. Switch Organization
1. User clicks org switcher dropdown
2. Selects different organization
3. POST to `/api/organization/switch`
4. Page refreshes with new org context
5. All data scoped to new organization

### 5. Manage Members (Admin Only)
1. Admin opens organization settings
2. Views member list with roles
3. Can change roles (admin ↔ user)
4. Can remove members (except self)
5. Changes reflected immediately

### 6. Leave Organization
1. User clicks "Leave Organization" in settings
2. Confirmation modal appears
3. DELETE to `/api/organization/[orgId]/members` (self)
4. If last admin, warned to transfer ownership first
5. User removed from organization

### 7. Delete Organization (Admin Only)
1. Admin clicks "Delete Organization"
2. Confirmation modal with organization name verification
3. DELETE to `/api/organization/[orgId]`
4. All org data cascade deleted (members, datasets, dashboards, etc.)
5. User switched to another organization or prompted to create one

## Permission Matrix

| Action | Admin | User |
|--------|-------|------|
| View organization data | ✅ | ✅ |
| Create datasets/dashboards | ✅ | ✅ |
| Update own resources | ✅ | ✅ |
| Delete own resources | ✅ | ✅ |
| Update organization settings | ✅ | ❌ |
| Invite members | ✅ | ❌ |
| Change member roles | ✅ | ❌ |
| Remove members | ✅ | ❌ |
| Delete organization | ✅ | ❌ |
| Leave organization | ✅ | ✅ |

## Technical Specifications

### Role Enforcement

**Backend (API Routes)**:
```typescript
const context = getAuthContext();
if (!context.roles.includes('admin')) {
  return new Response(JSON.stringify({ error: "Admin access required" }), { status: 403 });
}
```

**Frontend (UI Components)**:
```typescript
const { roles } = useAuthContext(); // Custom hook
const isAdmin = roles.includes('admin');

return (
  <>
    {isAdmin && <AdminOnlyButton />}
  </>
);
```

**Utility Function**:
```typescript
// src/mastra/tools/shared/org-scoped-db.ts
export function hasAdminRole(): boolean {
  const context = getAuthContext();
  return context.roles.includes('admin');
}
```

### Organization Switching

Store active orgId in:
1. **Session cookie** (server-side)
2. **Auth context** (request-scoped)
3. **React context** (client-side)

When switching:
1. Update session cookie with new orgId
2. Refresh page to reinitialize auth context
3. All subsequent requests use new orgId

### Invitation System

**Option 1: Simple Invite Links**
- Generate unique token for organization invite
- Email contains link: `/invite/[token]`
- Token validates and adds user to organization

**Option 2: Better Auth Invitation Plugin**
- Use Better Auth invitation plugin if available
- Handles token generation, expiry, role assignment

## UI/UX Requirements

### Organization Switcher
- Fixed in header or sidebar
- Shows current org name and logo
- Dropdown with all user's organizations
- Visual indicator for active organization
- "Create Organization" at bottom of list

### Organization Settings Page
- Tabs: General, Members, Billing (future)
- General tab: name, slug, logo upload, delete button
- Members tab: member list, invite form, role management
- Access restricted to admin role
- Clear permission error messages for non-admins

### Visual Design
- Use existing design system (shadcn/ui)
- Match CopilotKit theme
- Consistent with Better Auth UI components
- Responsive for mobile and desktop

## Security Considerations

1. **Role Validation**: Always validate roles server-side, never trust client
2. **Org Ownership**: All queries must include `WHERE orgId = context.orgId`
3. **Cascading Deletes**: Ensure all org data deleted when org deleted
4. **Last Admin Protection**: Prevent removing last admin from organization
5. **Audit Logging**: Log all member changes (future enhancement)

## Testing Requirements

1. **Unit Tests**:
   - Role validation functions
   - Auth context getters/setters
   - ID generation

2. **Integration Tests**:
   - Organization CRUD operations
   - Member management flows
   - Role-based access control
   - Organization switching

3. **E2E Tests**:
   - Complete user journey: signup → create org → invite member → switch org
   - Admin permissions (can manage members)
   - User permissions (cannot manage members)

## Success Criteria

1. ✅ Users can create and manage multiple organizations
2. ✅ Role-based permissions enforced at API and UI levels
3. ✅ Organization switcher works seamlessly
4. ✅ Admins can invite/manage members with role selection
5. ✅ Users can leave organizations (with last admin protection)
6. ✅ All data properly scoped to organization context
7. ✅ Clean, intuitive UI matching project design system
8. ✅ No cross-organization data leakage

## Future Enhancements

1. **Organization Billing**: Subscription plans, usage limits
2. **Team Invitations**: Bulk invite via CSV, email domains
3. **Audit Logging**: Track all member and permission changes
4. **Advanced Roles**: Custom roles with granular permissions
5. **Organization Transfer**: Transfer ownership to another admin
6. **SSO Integration**: SAML/OAuth for enterprise organizations
