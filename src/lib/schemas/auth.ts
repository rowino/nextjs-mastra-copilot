/**
 * Better-Auth Session Schemas
 *
 * Zod schemas for Better-Auth session management
 */

import { z } from 'zod'

/**
 * Better-Auth User Schema
 * Represents the authenticated user stored in session
 */
export const BetterAuthUserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string(),
  emailVerified: z.boolean(),
  image: z.string().url().nullable().optional(),
})

export type BetterAuthUser = z.infer<typeof BetterAuthUserSchema>

/**
 * Better-Auth Session Schema
 * Represents the complete session object with user and token data
 */
export const BetterAuthSessionSchema = z.object({
  user: BetterAuthUserSchema,
  token: z.string(),
  expiresAt: z.number(),
})

export type BetterAuthSession = z.infer<typeof BetterAuthSessionSchema>

/**
 * Session Cookie Data
 * Minimal data stored in httpOnly cookie
 */
export const SessionCookieDataSchema = z.object({
  token: z.string(),
  expiresAt: z.number(),
  userId: z.string(),
})

export type SessionCookieData = z.infer<typeof SessionCookieDataSchema>
