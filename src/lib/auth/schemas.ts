/**
 * API Contract Schemas - Authentication System
 *
 * Zod schemas for validating requests/responses at API boundaries.
 * These complement better-auth's built-in validation with custom requirements.
 */

import { z } from "zod";

// ============================================================================
// Password Validation
// ============================================================================

/**
 * Strong password requirements:
 * - Minimum 12 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * - At least one special character (@$!%*?&)
 */
export const PasswordSchema = z
  .string()
  .min(12, "Password must be at least 12 characters")
  .regex(/[a-z]/, "Password must include at least one lowercase letter")
  .regex(/[A-Z]/, "Password must include at least one uppercase letter")
  .regex(/\d/, "Password must include at least one number")
  .regex(/[@$!%*?&]/, "Password must include at least one special character (@$!%*?&)");

// ============================================================================
// User Schemas
// ============================================================================

export const EmailSchema = z.string().email("Invalid email format");

export const UserRoleSchema = z.enum(["admin", "moderator", "user"], {
  errorMap: () => ({ message: "Role must be admin, moderator, or user" }),
});

export const UserProfileSchema = z.object({
  id: z.string(),
  name: z.string().nullable(),
  email: EmailSchema,
  emailVerified: z.boolean(),
  image: z.string().url().nullable(),
  role: UserRoleSchema,
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const UpdateProfileSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  email: EmailSchema.optional(),
  image: z.string().url().optional(),
});

export const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: PasswordSchema,
});

// ============================================================================
// Authentication Request Schemas
// ============================================================================

export const SignUpEmailSchema = z.object({
  email: EmailSchema,
  password: PasswordSchema,
  name: z.string().min(1).max(100).optional(),
  callbackURL: z.string().url().optional(),
});

export const SignInEmailSchema = z.object({
  email: EmailSchema,
  password: z.string().min(1, "Password is required"),
  callbackURL: z.string().url().optional(),
});

export const SignInSocialSchema = z.object({
  provider: z.enum(["google", "github"], {
    errorMap: () => ({ message: "Provider must be google or github" }),
  }),
  callbackURL: z.string().url().optional(),
});

export const LinkSocialSchema = z.object({
  provider: z.enum(["google", "github"]),
});

export const ForgotPasswordSchema = z.object({
  email: EmailSchema,
  callbackURL: z.string().url().optional(),
});

export const ResetPasswordSchema = z.object({
  token: z.string().min(1, "Reset token is required"),
  newPassword: PasswordSchema,
});

export const VerifyEmailSchema = z.object({
  token: z.string().min(1, "Verification token is required"),
});

// ============================================================================
// Session Schemas
// ============================================================================

export const SessionSchema = z.object({
  id: z.string(),
  userId: z.string(),
  token: z.string(),
  expiresAt: z.date(),
  ipAddress: z.string().nullable(),
  userAgent: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const SessionResponseSchema = z.object({
  session: SessionSchema,
  user: UserProfileSchema,
});

// ============================================================================
// OAuth Account Schemas
// ============================================================================

export const OAuthAccountSchema = z.object({
  id: z.string(),
  userId: z.string(),
  providerId: z.enum(["google", "github"]),
  accountId: z.string(),
  createdAt: z.date(),
});

export const LinkedAccountsResponseSchema = z.object({
  accounts: z.array(OAuthAccountSchema),
});

// ============================================================================
// Security Event Schemas
// ============================================================================

export const SecurityEventTypeSchema = z.enum([
  "authentication",
  "account_management",
  "security",
  "admin_actions",
]);

export const SecurityEventActionSchema = z.enum([
  // Authentication
  "login_success",
  "login_failed",
  "signup_success",
  "signup_failed",
  "oauth_link_success",
  "oauth_link_failed",
  "logout",
  // Account management
  "password_changed",
  "email_changed",
  "email_verified",
  "account_linked",
  // Security
  "rate_limit_exceeded",
  "password_reset_requested",
  "password_reset_completed",
  "session_revoked",
  // Admin actions
  "role_changed",
  "user_banned",
  "user_unbanned",
]);

export const SecurityEventSchema = z.object({
  id: z.string(),
  userId: z.string().nullable(),
  eventType: SecurityEventTypeSchema,
  action: SecurityEventActionSchema,
  ipAddress: z.string(),
  userAgent: z.string().nullable(),
  success: z.boolean(),
  metadata: z.record(z.unknown()).nullable(),
  createdAt: z.date(),
});

export const SecurityEventsQuerySchema = z.object({
  userId: z.string().optional(),
  eventType: SecurityEventTypeSchema.optional(),
  limit: z.number().int().min(1).max(100).default(50),
  offset: z.number().int().min(0).default(0),
});

export const SecurityEventsResponseSchema = z.object({
  events: z.array(SecurityEventSchema),
  total: z.number().int(),
  hasMore: z.boolean(),
});

// ============================================================================
// Admin Schemas
// ============================================================================

export const SetUserRoleSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  role: UserRoleSchema,
});

export const BanUserSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  reason: z.string().min(1).max(500),
  expiresAt: z.date().optional(),
});

export const UnbanUserSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
});

// ============================================================================
// Error Response Schema
// ============================================================================

export const ErrorResponseSchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.record(z.unknown()).optional(),
  }),
});

// ============================================================================
// Rate Limiting Schema
// ============================================================================

export const RateLimitResponseSchema = z.object({
  error: z.object({
    code: z.literal("RATE_LIMIT_EXCEEDED"),
    message: z.string(),
    retryAfter: z.number().int(), // Seconds until next request allowed
  }),
});

// ============================================================================
// TypeScript Types (exported for use in application)
// ============================================================================

export type Password = z.infer<typeof PasswordSchema>;
export type Email = z.infer<typeof EmailSchema>;
export type UserRole = z.infer<typeof UserRoleSchema>;
export type UserProfile = z.infer<typeof UserProfileSchema>;
export type UpdateProfile = z.infer<typeof UpdateProfileSchema>;
export type ChangePassword = z.infer<typeof ChangePasswordSchema>;
export type SignUpEmail = z.infer<typeof SignUpEmailSchema>;
export type SignInEmail = z.infer<typeof SignInEmailSchema>;
export type SignInSocial = z.infer<typeof SignInSocialSchema>;
export type LinkSocial = z.infer<typeof LinkSocialSchema>;
export type ForgotPassword = z.infer<typeof ForgotPasswordSchema>;
export type ResetPassword = z.infer<typeof ResetPasswordSchema>;
export type VerifyEmail = z.infer<typeof VerifyEmailSchema>;
export type Session = z.infer<typeof SessionSchema>;
export type SessionResponse = z.infer<typeof SessionResponseSchema>;
export type OAuthAccount = z.infer<typeof OAuthAccountSchema>;
export type LinkedAccountsResponse = z.infer<typeof LinkedAccountsResponseSchema>;
export type SecurityEventType = z.infer<typeof SecurityEventTypeSchema>;
export type SecurityEventAction = z.infer<typeof SecurityEventActionSchema>;
export type SecurityEvent = z.infer<typeof SecurityEventSchema>;
export type SecurityEventsQuery = z.infer<typeof SecurityEventsQuerySchema>;
export type SecurityEventsResponse = z.infer<typeof SecurityEventsResponseSchema>;
export type SetUserRole = z.infer<typeof SetUserRoleSchema>;
export type BanUser = z.infer<typeof BanUserSchema>;
export type UnbanUser = z.infer<typeof UnbanUserSchema>;
export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;
export type RateLimitResponse = z.infer<typeof RateLimitResponseSchema>;
