/**
 * Better-Auth Server Utilities
 *
 * Server-side session validation and authentication helpers
 */

import { cookies } from 'next/headers'
import { BetterAuthSessionSchema, type BetterAuthSession } from '@/lib/schemas/auth'
import { createAuthenticatedClient } from '@/lib/api/client'
import { GetAuthenticatedUserResponseSchema } from '@/app/contracts/auth'

/**
 * Get current session from cookies (server-side)
 */
export async function getSession(): Promise<BetterAuthSession | null> {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get('auth_session')

    if (!sessionCookie?.value) {
      return null
    }

    // Parse and validate session data
    const sessionData = JSON.parse(sessionCookie.value)
    const validated = BetterAuthSessionSchema.safeParse(sessionData)

    if (!validated.success) {
      return null
    }

    // Check if token is expired
    if (validated.data.expiresAt < Date.now()) {
      return null
    }

    return validated.data
  } catch (error) {
    if (process.env.LOG_LEVEL === 'debug') {
      console.error('[Server Auth] Session validation error:', error)
    }
    return null
  }
}

/**
 * Validate session with Laravel backend (server-side)
 */
export async function validateSession(token: string): Promise<boolean> {
  try {
    const client = createAuthenticatedClient(token)

    // Call Laravel API to validate token
    const response = await client.get('api/auth/user').json()

    // Parse response
    const user = GetAuthenticatedUserResponseSchema.safeParse(response)

    return user.success
  } catch (error) {
    if (process.env.LOG_LEVEL === 'debug') {
      console.error('[Server Auth] Token validation error:', error)
    }
    return false
  }
}

/**
 * Get authenticated user from session (server-side)
 */
export async function getAuthenticatedUser() {
  const session = await getSession()

  if (!session) {
    return null
  }

  // Validate token with Laravel backend
  const isValid = await validateSession(session.token)

  if (!isValid) {
    return null
  }

  return session.user
}

/**
 * Require authentication (server-side)
 * Throws if user is not authenticated
 */
export async function requireAuth() {
  const user = await getAuthenticatedUser()

  if (!user) {
    throw new Error('Authentication required')
  }

  return user
}

/**
 * Set session cookie (server-side)
 */
export async function setSessionCookie(session: BetterAuthSession) {
  const cookieStore = await cookies()

  cookieStore.set('auth_session', JSON.stringify(session), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  })
}

/**
 * Clear session cookie (server-side)
 */
export async function clearSessionCookie() {
  const cookieStore = await cookies()
  cookieStore.delete('auth_session')
}
