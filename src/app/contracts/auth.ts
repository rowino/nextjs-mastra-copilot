/**
 * Authentication API Contracts (Laravel Sanctum)
 *
 * Zod schemas for all authentication endpoints.
 * These contracts define the request/response shapes for Laravel Sanctum API:
 * - User registration
 * - Email verification
 * - Login
 * - Token refresh
 * - Logout
 * - Password policy
 */

import { z } from 'zod'

//=============================================================================
// Shared Schemas
//=============================================================================

/**
 * User entity from Laravel API
 */
export const UserSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string().email(),
  email_verified_at: z.string().nullable(), // ISO 8601 timestamp or null
  created_at: z.string(), // ISO 8601 timestamp
  updated_at: z.string(), // ISO 8601 timestamp
})

export type User = z.infer<typeof UserSchema>

//=============================================================================
// POST /api/auth/register
//=============================================================================

export const RegisterRequestSchema = z.object({
  name: z.string().min(1, {
    message: 'Name is required'
  }).max(255, {
    message: 'Name must be 255 characters or less'
  }),
  email: z.string().email({
    message: 'Please enter a valid email address'
  }).max(255),
  password: z.string().min(1, {
    message: 'Password is required'
  }),
  password_confirmation: z.string().min(1, {
    message: 'Password confirmation is required'
  }),
}).refine(data => data.password === data.password_confirmation, {
  message: 'Passwords must match',
  path: ['password_confirmation'],
})

export const RegisterResponseSchema = z.object({
  message: z.string(),
  user: UserSchema,
})

export type RegisterRequest = z.infer<typeof RegisterRequestSchema>
export type RegisterResponse = z.infer<typeof RegisterResponseSchema>

//=============================================================================
// POST /api/auth/email/verify
//=============================================================================

export const VerifyEmailRequestSchema = z.object({
  token: z.string().min(1, {
    message: 'Verification token is required'
  }),
})

export const VerifyEmailResponseSchema = z.object({
  message: z.string(),
  success: z.boolean(),
})

export type VerifyEmailRequest = z.infer<typeof VerifyEmailRequestSchema>
export type VerifyEmailResponse = z.infer<typeof VerifyEmailResponseSchema>

//=============================================================================
// POST /api/auth/email/resend
//=============================================================================

export const ResendVerificationRequestSchema = z.object({
  email: z.string().email({
    message: 'Please enter a valid email address'
  }),
})

export const ResendVerificationResponseSchema = z.object({
  message: z.string(),
  success: z.boolean(),
})

export type ResendVerificationRequest = z.infer<typeof ResendVerificationRequestSchema>
export type ResendVerificationResponse = z.infer<typeof ResendVerificationResponseSchema>

//=============================================================================
// POST /api/auth/login
//=============================================================================

export const LoginRequestSchema = z.object({
  email: z.string().email({
    message: 'Please enter a valid email address'
  }),
  password: z.string().min(1, {
    message: 'Password is required'
  }),
  remember: z.boolean().optional(), // Remember me option
})

export const LoginResponseSchema = z.object({
  accessToken: z.string(),
  expiresIn: z.number(), // Seconds until expiration
  tokenType: z.literal('Bearer'),
  user: UserSchema,
})

export type LoginRequest = z.infer<typeof LoginRequestSchema>
export type LoginResponse = z.infer<typeof LoginResponseSchema>

//=============================================================================
// POST /api/auth/refresh
//=============================================================================

// Refresh uses Authorization header with existing token
export const RefreshResponseSchema = z.object({
  accessToken: z.string(),
  expiresIn: z.number(),
  tokenType: z.literal('Bearer'),
  user: UserSchema,
})

export type RefreshResponse = z.infer<typeof RefreshResponseSchema>

//=============================================================================
// POST /api/auth/logout
//=============================================================================

// Logout uses Authorization header with token to revoke
export const LogoutResponseSchema = z.object({
  message: z.string(),
})

export type LogoutResponse = z.infer<typeof LogoutResponseSchema>

//=============================================================================
// GET /api/auth/user (get authenticated user)
//=============================================================================

export const GetAuthenticatedUserResponseSchema = UserSchema

export type GetAuthenticatedUserResponse = z.infer<typeof GetAuthenticatedUserResponseSchema>

//=============================================================================
// DELETE /api/auth/user (delete account)
//=============================================================================

export const DeleteAccountRequestSchema = z.object({
  password: z.string().min(1, {
    message: 'Password is required to delete account'
  }),
})

export const DeleteAccountResponseSchema = z.object({
  message: z.string(),
})

export type DeleteAccountRequest = z.infer<typeof DeleteAccountRequestSchema>
export type DeleteAccountResponse = z.infer<typeof DeleteAccountResponseSchema>

//=============================================================================
// GET /api/auth/password-policy
//=============================================================================

export const PasswordPolicySchema = z.object({
  minLength: z.number().int().min(8).max(32),
  requireUppercase: z.boolean(),
  requireLowercase: z.boolean(),
  requireNumber: z.boolean(),
  requireSpecial: z.boolean(),
})

export type PasswordPolicy = z.infer<typeof PasswordPolicySchema>

//=============================================================================
// POST /api/auth/password/forgot
//=============================================================================

export const ForgotPasswordRequestSchema = z.object({
  email: z.string().email({
    message: 'Please enter a valid email address'
  }),
})

export const ForgotPasswordResponseSchema = z.object({
  message: z.string(),
})

export type ForgotPasswordRequest = z.infer<typeof ForgotPasswordRequestSchema>
export type ForgotPasswordResponse = z.infer<typeof ForgotPasswordResponseSchema>

//=============================================================================
// POST /api/auth/password/reset
//=============================================================================

export const ResetPasswordRequestSchema = z.object({
  token: z.string().min(1, {
    message: 'Reset token is required'
  }),
  email: z.string().email({
    message: 'Please enter a valid email address'
  }),
  password: z.string().min(1, {
    message: 'Password is required'
  }),
  password_confirmation: z.string().min(1, {
    message: 'Password confirmation is required'
  }),
}).refine(data => data.password === data.password_confirmation, {
  message: 'Passwords must match',
  path: ['password_confirmation'],
})

export const ResetPasswordResponseSchema = z.object({
  message: z.string(),
})

export type ResetPasswordRequest = z.infer<typeof ResetPasswordRequestSchema>
export type ResetPasswordResponse = z.infer<typeof ResetPasswordResponseSchema>

//=============================================================================
// Error Response (all endpoints) - Laravel standard error format
//=============================================================================

export const AuthErrorResponseSchema = z.object({
  message: z.string(),
  errors: z.record(z.array(z.string())).optional(), // Laravel validation errors
})

export type AuthErrorResponse = z.infer<typeof AuthErrorResponseSchema>
