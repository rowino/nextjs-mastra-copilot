# Laravel GraphQL API Specification

## Overview

This document specifies the GraphQL API for the Laravel backend. The API uses Laravel Lighthouse for GraphQL implementation and Laravel Sanctum for authentication.

**GraphQL Endpoint:** `http://localhost:8000/graphql`
**Authentication:** Bearer token in `Authorization` header (for authenticated queries/mutations)
**Playground:** `http://localhost:8000/graphql-playground` (dev only)

---

## GraphQL Schema

### Scalar Types

```graphql
scalar DateTime  # ISO 8601 timestamp string
scalar JSON      # JSON object
```

---

### Object Types

```graphql
type User {
  id: ID!
  name: String!
  email: String!
  emailVerifiedAt: DateTime
  createdAt: DateTime!
  updatedAt: DateTime!
}

type Profile {
  id: ID!
  userId: ID!
  name: String!        # Denormalized from User
  email: String!       # Denormalized from User
  avatarUrl: String
  bio: String
  createdAt: DateTime!
  updatedAt: DateTime!
}

type Settings {
  id: ID!
  userId: ID!
  theme: Theme!
  language: String!
  timezone: String!
  notificationPreferences: NotificationPreferences!
  createdAt: DateTime!
  updatedAt: DateTime!
}

type NotificationPreferences {
  email: Boolean!
  push: Boolean!
  sms: Boolean!
}

type UserStats {
  totalLogins: Int!
  lastLoginAt: DateTime
  accountAgeDays: Int!
  profileCompletion: Int!
}

type Activity {
  id: ID!
  type: ActivityType!
  description: String!
  createdAt: DateTime!
}

type Widget {
  id: String!
  type: WidgetType!
  title: String!
  description: String
  data: JSON!
}

type Dashboard {
  user: DashboardUser!
  stats: UserStats!
  widgets: [Widget!]!
  recentActivity: [Activity!]!
}

type DashboardUser {
  id: ID!
  name: String!
  email: String!
  avatarUrl: String
}

type AuthPayload {
  accessToken: String!
  expiresIn: Int!
  tokenType: String!
  user: User!
}

type PasswordPolicy {
  minLength: Int!
  requireUppercase: Boolean!
  requireLowercase: Boolean!
  requireNumber: Boolean!
  requireSpecial: Boolean!
}

type MessageResponse {
  message: String!
}

type VerifyEmailResponse {
  message: String!
  success: Boolean!
}

type ResetSettingsResponse {
  message: String!
  settings: Settings!
}

type UploadAvatarResponse {
  message: String!
  avatarUrl: String!
}
```

---

### Enum Types

```graphql
enum Theme {
  LIGHT
  DARK
  SYSTEM
}

enum WidgetType {
  STAT
  CHART
  LIST
}

enum ActivityType {
  LOGIN
  PROFILE_UPDATE
  SETTINGS_CHANGE
  PASSWORD_CHANGE
}
```

---

### Input Types

```graphql
input RegisterInput {
  name: String!
  email: String!
  password: String!
  passwordConfirmation: String!
}

input LoginInput {
  email: String!
  password: String!
  remember: Boolean
}

input VerifyEmailInput {
  token: String!
}

input ResendVerificationInput {
  email: String!
}

input ForgotPasswordInput {
  email: String!
}

input ResetPasswordInput {
  token: String!
  email: String!
  password: String!
  passwordConfirmation: String!
}

input UpdateProfileInput {
  name: String
  bio: String
}

input ChangePasswordInput {
  currentPassword: String!
  password: String!
  passwordConfirmation: String!
}

input DeleteAccountInput {
  password: String!
}

input UpdateSettingsInput {
  theme: Theme
  language: String
  timezone: String
  notificationPreferences: NotificationPreferencesInput
}

input NotificationPreferencesInput {
  email: Boolean
  push: Boolean
  sms: Boolean
}
```

---

### Queries

```graphql
type Query {
  # Auth
  me: User! @guard
  passwordPolicy: PasswordPolicy!

  # Profile
  profile: Profile! @guard

  # Settings
  settings: Settings! @guard

  # Dashboard
  dashboard: Dashboard! @guard
  dashboardStats: UserStats! @guard
}
```

---

### Mutations

```graphql
type Mutation {
  # Auth
  register(input: RegisterInput!): MessageResponse!
  login(input: LoginInput!): AuthPayload!
  logout: MessageResponse! @guard
  refreshToken: AuthPayload! @guard
  verifyEmail(input: VerifyEmailInput!): VerifyEmailResponse!
  resendVerification(input: ResendVerificationInput!): VerifyEmailResponse!
  forgotPassword(input: ForgotPasswordInput!): MessageResponse!
  resetPassword(input: ResetPasswordInput!): MessageResponse!
  deleteAccount(input: DeleteAccountInput!): MessageResponse! @guard

  # Profile
  updateProfile(input: UpdateProfileInput!): Profile! @guard
  uploadAvatar(avatar: Upload!): UploadAvatarResponse! @guard
  deleteAvatar: MessageResponse! @guard
  changePassword(input: ChangePasswordInput!): MessageResponse! @guard

  # Settings
  updateSettings(input: UpdateSettingsInput!): Settings! @guard
  resetSettings: ResetSettingsResponse! @guard
}
```

---

## Example Queries & Mutations

### Authentication

#### Register
```graphql
mutation Register($input: RegisterInput!) {
  register(input: $input) {
    message
  }
}

# Variables
{
  "input": {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "passwordConfirmation": "password123"
  }
}

# Response
{
  "data": {
    "register": {
      "message": "Registration successful. Please check your email to verify your account."
    }
  }
}
```

#### Login
```graphql
mutation Login($input: LoginInput!) {
  login(input: $input) {
    accessToken
    expiresIn
    tokenType
    user {
      id
      name
      email
      emailVerifiedAt
    }
  }
}

# Variables
{
  "input": {
    "email": "john@example.com",
    "password": "password123",
    "remember": true
  }
}

# Response
{
  "data": {
    "login": {
      "accessToken": "1|abc123xyz...",
      "expiresIn": 3600,
      "tokenType": "Bearer",
      "user": {
        "id": "1",
        "name": "John Doe",
        "email": "john@example.com",
        "emailVerifiedAt": "2025-10-02T10:35:00Z"
      }
    }
  }
}
```

#### Get Current User
```graphql
query Me {
  me {
    id
    name
    email
    emailVerifiedAt
    createdAt
  }
}

# Headers: Authorization: Bearer {token}

# Response
{
  "data": {
    "me": {
      "id": "1",
      "name": "John Doe",
      "email": "john@example.com",
      "emailVerifiedAt": "2025-10-02T10:35:00Z",
      "createdAt": "2025-10-02T10:30:00Z"
    }
  }
}
```

#### Logout
```graphql
mutation Logout {
  logout {
    message
  }
}

# Headers: Authorization: Bearer {token}

# Response
{
  "data": {
    "logout": {
      "message": "Logged out successfully"
    }
  }
}
```

#### Refresh Token
```graphql
mutation RefreshToken {
  refreshToken {
    accessToken
    expiresIn
    tokenType
    user {
      id
      name
      email
    }
  }
}

# Headers: Authorization: Bearer {token}

# Response
{
  "data": {
    "refreshToken": {
      "accessToken": "2|def456uvw...",
      "expiresIn": 3600,
      "tokenType": "Bearer",
      "user": {
        "id": "1",
        "name": "John Doe",
        "email": "john@example.com"
      }
    }
  }
}
```

#### Verify Email
```graphql
mutation VerifyEmail($input: VerifyEmailInput!) {
  verifyEmail(input: $input) {
    message
    success
  }
}

# Variables
{
  "input": {
    "token": "verification-token-from-email"
  }
}

# Response
{
  "data": {
    "verifyEmail": {
      "message": "Email verified successfully",
      "success": true
    }
  }
}
```

#### Forgot Password
```graphql
mutation ForgotPassword($input: ForgotPasswordInput!) {
  forgotPassword(input: $input) {
    message
  }
}

# Variables
{
  "input": {
    "email": "john@example.com"
  }
}

# Response
{
  "data": {
    "forgotPassword": {
      "message": "Password reset link sent to your email"
    }
  }
}
```

#### Reset Password
```graphql
mutation ResetPassword($input: ResetPasswordInput!) {
  resetPassword(input: $input) {
    message
  }
}

# Variables
{
  "input": {
    "token": "reset-token-from-email",
    "email": "john@example.com",
    "password": "newpassword123",
    "passwordConfirmation": "newpassword123"
  }
}

# Response
{
  "data": {
    "resetPassword": {
      "message": "Password reset successfully"
    }
  }
}
```

#### Get Password Policy
```graphql
query PasswordPolicy {
  passwordPolicy {
    minLength
    requireUppercase
    requireLowercase
    requireNumber
    requireSpecial
  }
}

# Response
{
  "data": {
    "passwordPolicy": {
      "minLength": 8,
      "requireUppercase": false,
      "requireLowercase": false,
      "requireNumber": false,
      "requireSpecial": false
    }
  }
}
```

#### Delete Account
```graphql
mutation DeleteAccount($input: DeleteAccountInput!) {
  deleteAccount(input: $input) {
    message
  }
}

# Headers: Authorization: Bearer {token}

# Variables
{
  "input": {
    "password": "current-password"
  }
}

# Response
{
  "data": {
    "deleteAccount": {
      "message": "Account deleted successfully"
    }
  }
}
```

---

### Profile

#### Get Profile
```graphql
query Profile {
  profile {
    id
    userId
    name
    email
    avatarUrl
    bio
    createdAt
    updatedAt
  }
}

# Headers: Authorization: Bearer {token}

# Response
{
  "data": {
    "profile": {
      "id": "1",
      "userId": "1",
      "name": "John Doe",
      "email": "john@example.com",
      "avatarUrl": "https://example.com/avatars/user1.jpg",
      "bio": "Software developer",
      "createdAt": "2025-10-02T10:30:00Z",
      "updatedAt": "2025-10-02T12:00:00Z"
    }
  }
}
```

#### Update Profile
```graphql
mutation UpdateProfile($input: UpdateProfileInput!) {
  updateProfile(input: $input) {
    id
    name
    bio
    updatedAt
  }
}

# Headers: Authorization: Bearer {token}

# Variables
{
  "input": {
    "name": "John Updated Doe",
    "bio": "Updated bio text"
  }
}

# Response
{
  "data": {
    "updateProfile": {
      "id": "1",
      "name": "John Updated Doe",
      "bio": "Updated bio text",
      "updatedAt": "2025-10-02T12:15:00Z"
    }
  }
}
```

#### Upload Avatar
```graphql
mutation UploadAvatar($avatar: Upload!) {
  uploadAvatar(avatar: $avatar) {
    message
    avatarUrl
  }
}

# Headers:
# - Authorization: Bearer {token}
# - Content-Type: multipart/form-data

# Variables (multipart)
{
  "operations": "{\"query\":\"mutation UploadAvatar($avatar: Upload!) { uploadAvatar(avatar: $avatar) { message avatarUrl } }\",\"variables\":{\"avatar\":null}}",
  "map": "{\"0\":[\"variables.avatar\"]}",
  "0": [File object]
}

# Response
{
  "data": {
    "uploadAvatar": {
      "message": "Avatar uploaded successfully",
      "avatarUrl": "https://example.com/avatars/user1-new.jpg"
    }
  }
}
```

#### Delete Avatar
```graphql
mutation DeleteAvatar {
  deleteAvatar {
    message
  }
}

# Headers: Authorization: Bearer {token}

# Response
{
  "data": {
    "deleteAvatar": {
      "message": "Avatar deleted successfully"
    }
  }
}
```

#### Change Password
```graphql
mutation ChangePassword($input: ChangePasswordInput!) {
  changePassword(input: $input) {
    message
  }
}

# Headers: Authorization: Bearer {token}

# Variables
{
  "input": {
    "currentPassword": "oldpassword",
    "password": "newpassword123",
    "passwordConfirmation": "newpassword123"
  }
}

# Response
{
  "data": {
    "changePassword": {
      "message": "Password changed successfully"
    }
  }
}
```

---

### Settings

#### Get Settings
```graphql
query Settings {
  settings {
    id
    userId
    theme
    language
    timezone
    notificationPreferences {
      email
      push
      sms
    }
    createdAt
    updatedAt
  }
}

# Headers: Authorization: Bearer {token}

# Response
{
  "data": {
    "settings": {
      "id": "1",
      "userId": "1",
      "theme": "DARK",
      "language": "en",
      "timezone": "America/New_York",
      "notificationPreferences": {
        "email": true,
        "push": false,
        "sms": false
      },
      "createdAt": "2025-10-02T10:30:00Z",
      "updatedAt": "2025-10-02T14:00:00Z"
    }
  }
}
```

#### Update Settings
```graphql
mutation UpdateSettings($input: UpdateSettingsInput!) {
  updateSettings(input: $input) {
    id
    theme
    notificationPreferences {
      email
      push
      sms
    }
    updatedAt
  }
}

# Headers: Authorization: Bearer {token}

# Variables
{
  "input": {
    "theme": "LIGHT",
    "notificationPreferences": {
      "email": true,
      "push": true,
      "sms": false
    }
  }
}

# Response
{
  "data": {
    "updateSettings": {
      "id": "1",
      "theme": "LIGHT",
      "notificationPreferences": {
        "email": true,
        "push": true,
        "sms": false
      },
      "updatedAt": "2025-10-02T14:30:00Z"
    }
  }
}
```

#### Reset Settings
```graphql
mutation ResetSettings {
  resetSettings {
    message
    settings {
      theme
      language
      timezone
      notificationPreferences {
        email
        push
        sms
      }
    }
  }
}

# Headers: Authorization: Bearer {token}

# Response
{
  "data": {
    "resetSettings": {
      "message": "Settings reset successfully",
      "settings": {
        "theme": "SYSTEM",
        "language": "en",
        "timezone": "UTC",
        "notificationPreferences": {
          "email": true,
          "push": false,
          "sms": false
        }
      }
    }
  }
}
```

---

### Dashboard

#### Get Dashboard
```graphql
query Dashboard {
  dashboard {
    user {
      id
      name
      email
      avatarUrl
    }
    stats {
      totalLogins
      lastLoginAt
      accountAgeDays
      profileCompletion
    }
    widgets {
      id
      type
      title
      data
    }
    recentActivity {
      id
      type
      description
      createdAt
    }
  }
}

# Headers: Authorization: Bearer {token}

# Response
{
  "data": {
    "dashboard": {
      "user": {
        "id": "1",
        "name": "John Doe",
        "email": "john@example.com",
        "avatarUrl": "https://example.com/avatars/user1.jpg"
      },
      "stats": {
        "totalLogins": 42,
        "lastLoginAt": "2025-10-02T15:30:00Z",
        "accountAgeDays": 30,
        "profileCompletion": 85
      },
      "widgets": [
        {
          "id": "activity-chart",
          "type": "CHART",
          "title": "Activity Over Time",
          "data": {
            "labels": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
            "datasets": [
              {
                "label": "Logins",
                "data": [5, 8, 3, 7, 4, 2, 6],
                "backgroundColor": "#3B82F6"
              }
            ]
          }
        }
      ],
      "recentActivity": [
        {
          "id": "1",
          "type": "LOGIN",
          "description": "Logged in from new device",
          "createdAt": "2025-10-02T15:30:00Z"
        },
        {
          "id": "2",
          "type": "PROFILE_UPDATE",
          "description": "Updated profile information",
          "createdAt": "2025-10-01T12:00:00Z"
        }
      ]
    }
  }
}
```

#### Get Dashboard Stats Only
```graphql
query DashboardStats {
  dashboardStats {
    totalLogins
    lastLoginAt
    accountAgeDays
    profileCompletion
  }
}

# Headers: Authorization: Bearer {token}

# Response
{
  "data": {
    "dashboardStats": {
      "totalLogins": 42,
      "lastLoginAt": "2025-10-02T15:30:00Z",
      "accountAgeDays": 30,
      "profileCompletion": 85
    }
  }
}
```

---

## Error Handling

GraphQL errors follow standard GraphQL error format:

### Validation Error
```json
{
  "errors": [
    {
      "message": "Validation failed",
      "extensions": {
        "category": "validation",
        "validation": {
          "input.email": ["The email has already been taken."],
          "input.password": ["The password must be at least 8 characters."]
        }
      }
    }
  ]
}
```

### Authentication Error
```json
{
  "errors": [
    {
      "message": "Unauthenticated.",
      "extensions": {
        "category": "authentication"
      }
    }
  ]
}
```

### Authorization Error
```json
{
  "errors": [
    {
      "message": "This action is unauthorized.",
      "extensions": {
        "category": "authorization"
      }
    }
  ]
}
```

---

## Database Schema Requirements

Same as REST API version:

### users table
- `id` - bigint, primary key
- `name` - varchar(255)
- `email` - varchar(255), unique
- `password` - varchar(255)
- `email_verified_at` - timestamp, nullable
- `created_at` - timestamp
- `updated_at` - timestamp

### profiles table
- `id` - bigint, primary key
- `user_id` - bigint, foreign key to users.id
- `avatar_url` - varchar(500), nullable
- `bio` - text, nullable
- `created_at` - timestamp
- `updated_at` - timestamp

### settings table
- `id` - bigint, primary key
- `user_id` - bigint, foreign key to users.id, unique
- `theme` - enum('light', 'dark', 'system'), default 'system'
- `language` - varchar(10), default 'en'
- `timezone` - varchar(50), default 'UTC'
- `notification_preferences` - json
- `created_at` - timestamp
- `updated_at` - timestamp

### activities table
- `id` - bigint, primary key
- `user_id` - bigint, foreign key to users.id
- `type` - enum('login', 'profile_update', 'settings_change', 'password_change')
- `description` - varchar(500)
- `created_at` - timestamp
- `updated_at` - timestamp

### personal_access_tokens table (Laravel Sanctum)
- Standard Sanctum table structure

---

## Laravel Implementation Notes

### 1. Install Lighthouse
```bash
composer require nuwave/lighthouse
php artisan vendor:publish --tag=lighthouse-schema
php artisan vendor:publish --tag=lighthouse-config
```

### 2. Schema Location
Place schema at `graphql/schema.graphql`

### 3. Directives Used
- `@guard` - Protect queries/mutations (requires auth)
- `@field(resolver: "...")` - Custom resolvers
- `@validator` - Input validation rules

### 4. File Upload Configuration
Enable multipart requests in `config/lighthouse.php`:
```php
'route' => [
    'uri' => '/graphql',
    'middleware' => [
        \Nuwave\Lighthouse\Support\Http\Middleware\AcceptJson::class,
    ],
],
```

### 5. CORS Configuration
Update `config/cors.php`:
```php
'paths' => ['api/*', 'graphql', 'graphql-playground'],
'allowed_origins' => [env('FRONTEND_URL', 'http://localhost:3000')],
```

---

## Environment Variables

Laravel `.env`:

```env
APP_URL=http://localhost:8000
FRONTEND_URL=http://localhost:3000

# GraphQL
LIGHTHOUSE_CACHE_ENABLE=false  # Set to true in production

# Database (same as REST)
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=your_database
DB_USERNAME=your_username
DB_PASSWORD=your_password

# Mail (same as REST)
MAIL_MAILER=smtp
MAIL_HOST=mailhog
MAIL_PORT=1025
MAIL_USERNAME=null
MAIL_PASSWORD=null
MAIL_ENCRYPTION=null
MAIL_FROM_ADDRESS=noreply@example.com
MAIL_FROM_NAME="${APP_NAME}"

# Sanctum (same as REST)
SANCTUM_STATEFUL_DOMAINS=localhost,localhost:3000
SESSION_DRIVER=cookie
SESSION_DOMAIN=localhost
```

---

## Frontend Integration Notes

1. **urql Client Setup**: Use `@urql/next` for Next.js SSR support
2. **File Uploads**: Use `@urql/exchange-multipart-fetch` for avatar uploads
3. **Auth Exchange**: Custom exchange to add Bearer token to requests
4. **Code Generation**: Use `graphql-codegen` to generate TypeScript types from schema
5. **Zod Integration**: Keep existing Zod schemas, validate GraphQL responses at runtime
