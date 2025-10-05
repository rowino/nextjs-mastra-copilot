/**
 * Profile API Contracts (Laravel API)
 *
 * Zod schemas for user profile management endpoints:
 * - Get profile
 * - Update profile
 * - Upload/delete avatar
 * - Change password
 */

import { z } from 'zod'

//=============================================================================
// Shared Schemas
//=============================================================================

export const ProfileSchema = z.object({
  id: z.number(),
  user_id: z.number(),
  avatar_url: z.string().url().nullable(),
  bio: z.string().max(500).nullable(),
  created_at: z.string(), // ISO 8601 timestamp
  updated_at: z.string(), // ISO 8601 timestamp
})

export type Profile = z.infer<typeof ProfileSchema>

//=============================================================================
// GET /api/profile
//=============================================================================

/**
 * Returns profile with user data merged
 */
export const GetProfileResponseSchema = z.object({
  id: z.number(),
  user_id: z.number(),
  name: z.string(), // From user table
  email: z.string().email(), // From user table
  avatar_url: z.string().url().nullable(),
  bio: z.string().max(500).nullable(),
  created_at: z.string(),
  updated_at: z.string(),
})

export type GetProfileResponse = z.infer<typeof GetProfileResponseSchema>

//=============================================================================
// PUT /api/profile
//=============================================================================

export const UpdateProfileRequestSchema = z.object({
  name: z.string().min(1, {
    message: 'Name is required'
  }).max(255, {
    message: 'Name must be 255 characters or less'
  }).optional(),
  bio: z.string().max(500, {
    message: 'Bio must be 500 characters or less'
  }).nullable().optional(),
})

export const UpdateProfileResponseSchema = GetProfileResponseSchema

export type UpdateProfileRequest = z.infer<typeof UpdateProfileRequestSchema>
export type UpdateProfileResponse = z.infer<typeof UpdateProfileResponseSchema>

//=============================================================================
// POST /api/profile/avatar
//=============================================================================

/**
 * Multipart form data upload
 * Field name: "avatar"
 * Max size: 4MB
 * Allowed types: jpg, jpeg, png, gif
 */
export const UploadAvatarResponseSchema = z.object({
  message: z.string(),
  avatar_url: z.string().url(),
})

export type UploadAvatarResponse = z.infer<typeof UploadAvatarResponseSchema>

//=============================================================================
// DELETE /api/profile/avatar
//=============================================================================

export const DeleteAvatarResponseSchema = z.object({
  message: z.string(),
})

export type DeleteAvatarResponse = z.infer<typeof DeleteAvatarResponseSchema>

//=============================================================================
// PUT /api/profile/password
//=============================================================================

export const ChangePasswordRequestSchema = z.object({
  current_password: z.string().min(1, {
    message: 'Current password is required'
  }),
  password: z.string().min(1, {
    message: 'New password is required'
  }),
  password_confirmation: z.string().min(1, {
    message: 'Password confirmation is required'
  }),
}).refine(data => data.password === data.password_confirmation, {
  message: 'Passwords must match',
  path: ['password_confirmation'],
})

export const ChangePasswordResponseSchema = z.object({
  message: z.string(),
})

export type ChangePasswordRequest = z.infer<typeof ChangePasswordRequestSchema>
export type ChangePasswordResponse = z.infer<typeof ChangePasswordResponseSchema>

//=============================================================================
// Error Response (all endpoints) - Laravel standard error format
//=============================================================================

export const ProfileErrorResponseSchema = z.object({
  message: z.string(),
  errors: z.record(z.array(z.string())).optional(), // Laravel validation errors
})

export type ProfileErrorResponse = z.infer<typeof ProfileErrorResponseSchema>
