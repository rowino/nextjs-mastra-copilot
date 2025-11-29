# Organization Management

This guide covers the complete organization management system, including creating organizations, managing members, sending invitations, and handling permissions.

## Overview

The organization system provides multi-tenant functionality with role-based access control (RBAC). Each user can belong to multiple organizations with different roles.

### Key Features

- **Organization Creation**: Automatically created for new users on first login
- **Member Management**: Add, update, and remove organization members
- **Role-Based Access Control**: Admin and User roles with different permissions
- **Email Invitations**: Invite non-registered users via email
- **Invitation Tracking**: Monitor pending, accepted, and expired invitations
- **Last Admin Protection**: Prevents removing the last admin from an organization

## Architecture

### Database Schema

#### Organizations Table
- `id`: Unique organization identifier
- `name`: Display name
- `slug`: URL-friendly identifier
- `logo`: Optional logo URL
- `createdAt`: Timestamp

#### Members Table
- `id`: Unique membership identifier
- `organizationId`: Foreign key to organization
- `userId`: Foreign key to user
- `role`: `admin` or `user`
- `createdAt`: Timestamp

#### Invitations Table
- `id`: Unique invitation identifier
- `organizationId`: Foreign key to organization
- `email`: Invitee email address
- `role`: Role to assign upon acceptance
- `invitedBy`: Foreign key to user who sent invitation
- `token`: Unique token for invitation link
- `status`: `pending`, `accepted`, or `expired`
- `expiresAt`: Expiration timestamp (default: 7 days)
- `createdAt`: Timestamp
- `acceptedAt`: Timestamp (null until accepted)

### API Endpoints

#### Organization Endpoints

**GET /api/organization/[orgId]**
- **Auth**: Required (any member)
- **Response**: Organization details

**PATCH /api/organization/[orgId]**
- **Auth**: Required (admin only)
- **Body**: `{ name, slug, logo }`
- **Response**: Updated organization

**DELETE /api/organization/[orgId]**
- **Auth**: Required (admin only)
- **Response**: Success message
- **Notes**: Cannot delete if last admin

#### Member Endpoints

**GET /api/organization/[orgId]/members**
- **Auth**: Required (any member)
- **Response**: Array of members with user details

**POST /api/organization/[orgId]/members**
- **Auth**: Required (admin only)
- **Body**: `{ email, role }`
- **Response**:
  - If user exists: Adds as member immediately
  - If user doesn't exist: Sends email invitation
- **Notes**: Prevents duplicate invitations

**PATCH /api/organization/[orgId]/members**
- **Auth**: Required (admin only)
- **Body**: `{ memberId, role }`
- **Response**: Updated member details
- **Notes**: Cannot change own role or remove last admin

**DELETE /api/organization/[orgId]/members?memberId={id}**
- **Auth**: Required (admin or self)
- **Response**: Success message
- **Notes**: Users can remove themselves, admins can remove others

#### Invitation Endpoints

**GET /api/organization/[orgId]/invitations**
- **Auth**: Required (admin only)
- **Response**: Array of pending invitations

**DELETE /api/organization/[orgId]/invitations?invitationId={id}**
- **Auth**: Required (admin only)
- **Response**: Success message
- **Notes**: Marks invitation as expired (soft delete)

**POST /api/invitations/accept**
- **Auth**: Required
- **Body**: `{ token }`
- **Response**: Organization details
- **Validation**:
  - Token must be valid and not expired
  - Email must match authenticated user
  - User must not already be a member

## User Flows

### Creating an Organization

Organizations are automatically created when a user first logs in:

1. User completes authentication
2. System checks if user belongs to any organization
3. If not, creates a new organization with:
   - Name: "{User's name}'s Organization"
   - Slug: Auto-generated from name
   - User as admin member

### Inviting Members

**For Existing Users:**
1. Admin navigates to Settings > Organization > Members
2. Enters email and selects role
3. System checks if user exists
4. If yes, adds immediately as member
5. User sees new organization in their list

**For Non-Registered Users:**
1. Admin enters email and selects role
2. System creates invitation record
3. Sends email with invitation link
4. Invitee receives email with:
   - Organization name
   - Inviter name
   - Role they'll receive
   - Expiration date (7 days default)
5. Invitee clicks link and signs up/logs in
6. System validates email matches invitation
7. User accepts and joins organization

### Accepting Invitations

1. User receives invitation email
2. Clicks invitation link with token
3. If not logged in, redirected to sign up/login
4. Lands on `/accept-invite?token={token}` page
5. Clicks "Accept Invitation"
6. System validates:
   - Token is valid and not expired
   - Email matches invitation
   - Not already a member
7. Adds user as member with specified role
8. Marks invitation as accepted
9. Redirects to organization settings

### Managing Members

**Changing Roles:**
1. Admin navigates to Members tab
2. Uses dropdown to change member role
3. System validates:
   - Requester is admin
   - Not changing own role
   - Not downgrading last admin
4. Updates member role

**Removing Members:**
1. Admin clicks remove button on member row
2. Confirms in dialog
3. System validates:
   - Requester is admin (or removing self)
   - Not removing last admin
4. Removes member
5. If self-removal, user loses access to organization

### Tracking Invitations

1. Admin navigates to Invitations tab
2. Views list of pending invitations showing:
   - Invitee email
   - Role
   - Inviter details
   - Sent date
   - Expiration date
   - Warning if expiring soon (< 24 hours)
3. Can cancel pending invitations

## Permissions

### Admin Role

- View organization details
- Update organization settings (name, slug, logo)
- Delete organization
- View all members
- Invite new members
- Change member roles
- Remove members
- View pending invitations
- Cancel invitations

### User Role

- View organization details
- View all members
- Leave organization (remove self)

### Special Rules

- Cannot remove the last admin from an organization
- Cannot change your own role
- Cannot delete an organization without being an admin
- Invitations are admin-only
- Users can always remove themselves

## Email Configuration

### Required Environment Variables

```env
# Resend API key
RESEND_API_KEY=re_xxxxx

# From address for emails
EMAIL_FROM=noreply@yourdomain.com

# Invitation expiration (days)
INVITE_EXPIRATION_DAYS=7

# Application URL for invitation links
APP_URL=https://yourdomain.com
```

### Email Template

The invitation email includes:
- Organization name
- Inviter name
- Role to be assigned
- Call-to-action button with invitation link
- Expiration date
- Terminal theme styling for brand consistency

## Frontend Components

### Organization Settings Page
**Location**: `/app/(protected)/settings/organization/page.tsx`

Three tabs:
1. **General**: Organization details (name, slug, logo)
2. **Members**: Team roster with role management
3. **Invitations**: Pending invitations tracking

### Key Components

**OrgSettings** (`/components/organization/org-settings.tsx`)
- Form for updating organization details
- Delete organization button
- Admin-only editing

**MemberList** (`/components/organization/member-list.tsx`)
- Table view of all members
- Inline role selector for admins
- Remove member button
- Highlights current user

**InviteMember** (`/components/organization/invite-member.tsx`)
- Form to invite new members
- Email and role inputs
- Admin-only visibility

**InvitationList** (`/components/organization/invitation-list.tsx`)
- Grid view of pending invitations
- Shows expiration warnings
- Cancel invitation button
- Admin-only visibility

**Accept Invitation Page** (`/app/(protected)/accept-invite/page.tsx`)
- Validates invitation token
- Shows organization details
- Accept/decline actions
- Handles expired/invalid invitations

## Security Considerations

### Token Security
- Invitation tokens use `crypto.randomUUID()` for cryptographic randomness
- Tokens are single-use (marked accepted after use)
- Tokens expire after configurable period (default 7 days)
- Tokens are validated on every use

### Email Verification
- System ensures invitation email matches authenticated user
- Prevents token hijacking by other users

### Permission Checks
- Every API endpoint validates user role
- Admin-only actions double-checked
- Last admin protection prevents lockout

### SQL Injection Prevention
- All database queries use Drizzle ORM with parameterized queries
- No raw SQL with user input

## Customization

### Changing Invitation Expiration

Update `.env`:
```env
INVITE_EXPIRATION_DAYS=14  # 2 weeks instead of 7 days
```

### Customizing Email Template

Edit `src/emails/invitation-email.tsx`:
- Modify styling to match brand
- Update copy and messaging
- Add additional information

### Adding More Roles

1. Update `src/db/schema.ts`:
   ```typescript
   role: text("role", { enum: ["admin", "user", "viewer"] })
   ```

2. Update validation schemas in API routes

3. Update frontend dropdowns

4. Add permission checks for new role

## Troubleshooting

### Invitation Email Not Received

1. Check `RESEND_API_KEY` is valid
2. Verify `EMAIL_FROM` domain is verified in Resend
3. Check spam/junk folders
4. Verify invitation hasn't expired
5. Check API logs for errors

### Cannot Remove Last Admin

This is intentional protection. To remove the last admin:
1. First promote another user to admin
2. Then remove the original admin

### Invitation Link Invalid

Possible causes:
- Token expired (check `expiresAt`)
- Already accepted (check `status`)
- Email mismatch (check logged in user email)

### Email Mismatch on Accept

The invitation email must match the currently authenticated user. If different:
1. Log out
2. Sign in with the email that received the invitation
3. Try accepting again

## Best Practices

1. **Always have multiple admins** to prevent lockout
2. **Set reasonable expiration times** for invitations (7-14 days)
3. **Monitor pending invitations** and resend if needed
4. **Use descriptive organization names** for clarity
5. **Regularly audit member list** to remove inactive users
6. **Test invitation flow** in staging before production
7. **Configure email domain properly** in Resend

## Migration from Other Systems

If migrating from existing organization systems:

1. **Export existing data**: Organizations, members, roles
2. **Map user emails** to new user IDs
3. **Create organizations** via API or database import
4. **Import members** with correct roles
5. **Notify users** of new organization structure
6. **Provide transition period** for users to adjust

## API Integration Examples

### Creating Organization Programmatically

```typescript
const response = await fetch('/api/organization', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'My Company',
    slug: 'my-company',
  }),
});
```

### Inviting Multiple Users

```typescript
const users = ['user1@example.com', 'user2@example.com'];

for (const email of users) {
  await fetch(`/api/organization/${orgId}/members`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, role: 'user' }),
  });
}
```

### Bulk Role Updates

```typescript
const updates = [
  { memberId: 'mem_1', role: 'admin' },
  { memberId: 'mem_2', role: 'user' },
];

for (const update of updates) {
  await fetch(`/api/organization/${orgId}/members`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(update),
  });
}
```
