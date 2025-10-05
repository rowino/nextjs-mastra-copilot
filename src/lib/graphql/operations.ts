/**
 * GraphQL Operations
 *
 * Contains all GraphQL queries and mutations used in the application.
 * Uses the generated `graphql` function for type-safe operations.
 */

import { graphql } from './generated'

// ============================================================================
// Auth Operations
// ============================================================================

export const LOGIN_MUTATION = graphql(`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      user {
        id
        name
        email
        emailVerifiedAt
        createdAt
        updatedAt
      }
      accessToken
      refreshToken
      expiresAt
    }
  }
`)

export const REGISTER_MUTATION = graphql(`
  mutation Register($input: RegisterInput!) {
    register(input: $input) {
      user {
        id
        name
        email
        emailVerifiedAt
        createdAt
        updatedAt
      }
      accessToken
      refreshToken
      expiresAt
    }
  }
`)

export const LOGOUT_MUTATION = graphql(`
  mutation Logout {
    logout
  }
`)

export const ME_QUERY = graphql(`
  query Me {
    me {
      id
      name
      email
      emailVerifiedAt
      createdAt
      updatedAt
    }
  }
`)

export const VERIFY_EMAIL_MUTATION = graphql(`
  mutation VerifyEmail($input: VerifyEmailInput!) {
    verifyEmail(input: $input)
  }
`)

export const RESEND_VERIFICATION_MUTATION = graphql(`
  mutation ResendVerification {
    resendVerification
  }
`)

export const REQUEST_PASSWORD_RESET_MUTATION = graphql(`
  mutation RequestPasswordReset($input: RequestPasswordResetInput!) {
    requestPasswordReset(input: $input)
  }
`)

export const RESET_PASSWORD_MUTATION = graphql(`
  mutation ResetPassword($input: ResetPasswordInput!) {
    resetPassword(input: $input)
  }
`)

export const PASSWORD_POLICY_QUERY = graphql(`
  query PasswordPolicy {
    passwordPolicy {
      minLength
      requiresUppercase
      requiresLowercase
      requiresNumbers
      requiresSpecialCharacters
    }
  }
`)

// ============================================================================
// Profile Operations
// ============================================================================

export const PROFILE_QUERY = graphql(`
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
`)

export const UPDATE_PROFILE_MUTATION = graphql(`
  mutation UpdateProfile($input: UpdateProfileInput!) {
    updateProfile(input: $input) {
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
`)

export const UPLOAD_AVATAR_MUTATION = graphql(`
  mutation UploadAvatar($avatar: Upload!) {
    uploadAvatar(avatar: $avatar) {
      id
      name
      email
      avatarUrl
      bio
      createdAt
      updatedAt
    }
  }
`)

export const DELETE_AVATAR_MUTATION = graphql(`
  mutation DeleteAvatar {
    deleteAvatar {
      id
      name
      email
      avatarUrl
      bio
      createdAt
      updatedAt
    }
  }
`)

export const CHANGE_PASSWORD_MUTATION = graphql(`
  mutation ChangePassword($input: ChangePasswordInput!) {
    changePassword(input: $input)
  }
`)

export const DELETE_ACCOUNT_MUTATION = graphql(`
  mutation DeleteAccount($input: DeleteAccountInput!) {
    deleteAccount(input: $input)
  }
`)

// ============================================================================
// Settings Operations
// ============================================================================

export const SETTINGS_QUERY = graphql(`
  query Settings {
    settings {
      id
      userId
      theme
      language
      timezone
      notificationsEmail
      notificationsPush
      notificationsSms
      createdAt
      updatedAt
    }
  }
`)

export const UPDATE_SETTINGS_MUTATION = graphql(`
  mutation UpdateSettings($input: UpdateSettingsInput!) {
    updateSettings(input: $input) {
      id
      userId
      theme
      language
      timezone
      notificationsEmail
      notificationsPush
      notificationsSms
      createdAt
      updatedAt
    }
  }
`)

export const RESET_SETTINGS_MUTATION = graphql(`
  mutation ResetSettings {
    resetSettings {
      id
      userId
      theme
      language
      timezone
      notificationsEmail
      notificationsPush
      notificationsSms
      createdAt
      updatedAt
    }
  }
`)

// ============================================================================
// Dashboard Operations
// ============================================================================

export const DASHBOARD_QUERY = graphql(`
  query Dashboard {
    dashboard {
      user {
        id
        name
        email
      }
      stats {
        totalLogins
        lastLoginAt
        accountAgeInDays
      }
      widgets {
        id
        type
        title
        data
        order
      }
      recentActivities {
        id
        type
        description
        ipAddress
        userAgent
        createdAt
      }
    }
  }
`)

export const DASHBOARD_STATS_QUERY = graphql(`
  query DashboardStats {
    dashboardStats {
      totalLogins
      lastLoginAt
      accountAgeInDays
    }
  }
`)
