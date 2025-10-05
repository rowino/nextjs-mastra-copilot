/**
 * Settings API Contracts (Laravel API)
 *
 * Zod schemas for user settings endpoints:
 * - Get settings
 * - Update settings
 * - Reset settings to defaults
 */

import { z } from 'zod'

//=============================================================================
// Shared Schemas
//=============================================================================

export const NotificationPreferencesSchema = z.object({
  email: z.boolean(),
  push: z.boolean(),
  sms: z.boolean(),
})

export type NotificationPreferences = z.infer<typeof NotificationPreferencesSchema>

export const SettingsSchema = z.object({
  id: z.number(),
  user_id: z.number(),
  theme: z.enum(['light', 'dark', 'system']),
  language: z.string(),
  timezone: z.string(),
  notification_preferences: NotificationPreferencesSchema,
  created_at: z.string(), // ISO 8601 timestamp
  updated_at: z.string(), // ISO 8601 timestamp
})

export type Settings = z.infer<typeof SettingsSchema>

//=============================================================================
// GET /api/settings
//=============================================================================

export const GetSettingsResponseSchema = SettingsSchema

export type GetSettingsResponse = z.infer<typeof GetSettingsResponseSchema>

//=============================================================================
// PUT /api/settings
//=============================================================================

export const UpdateSettingsRequestSchema = z.object({
  theme: z.enum(['light', 'dark', 'system'], {
    errorMap: () => ({ message: 'Theme must be light, dark, or system' })
  }).optional(),
  language: z.string().min(2).max(10).optional(), // ISO 639-1
  timezone: z.string().optional(), // IANA timezone
  notification_preferences: NotificationPreferencesSchema.optional(),
})

export const UpdateSettingsResponseSchema = SettingsSchema

export type UpdateSettingsRequest = z.infer<typeof UpdateSettingsRequestSchema>
export type UpdateSettingsResponse = z.infer<typeof UpdateSettingsResponseSchema>

//=============================================================================
// POST /api/settings/reset
//=============================================================================

/**
 * Resets all settings to default values
 */
export const ResetSettingsResponseSchema = z.object({
  message: z.string(),
  settings: SettingsSchema,
})

export type ResetSettingsResponse = z.infer<typeof ResetSettingsResponseSchema>

//=============================================================================
// Error Response (all endpoints) - Laravel standard error format
//=============================================================================

export const SettingsErrorResponseSchema = z.object({
  message: z.string(),
  errors: z.record(z.array(z.string())).optional(), // Laravel validation errors
})

export type SettingsErrorResponse = z.infer<typeof SettingsErrorResponseSchema>
