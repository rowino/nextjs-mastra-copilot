/**
 * Better-Auth Client Configuration
 *
 * Configures Better-Auth with Laravel Sanctum provider for frontend use
 */

'use client'

import { createAuthClient } from 'better-auth/react'
import { sanctumProvider } from './providers/sanctum'

// Get app URL from environment (client-side)
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

/**
 * Better-Auth client instance
 */
export const authClient = createAuthClient({
  baseURL: APP_URL,
  // Note: Better-Auth v1.3+ uses different API than shown in research
  // We'll implement custom hooks that use the sanctum provider directly
})

/**
 * Custom hook for authentication with Sanctum provider
 */
export function useAuth() {
  const [authData, setAuthData] = React.useState<{
    user: {
      id: string
      email: string
      name: string
      emailVerified: boolean
      image?: string | null
    }
    session: {
      token: string
      expiresAt: number
    }
  } | null>(null)

  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  // Sign in
  const signIn = async (credentials: { email: string; password: string; remember?: boolean }) => {
    setIsLoading(true)
    setError(null)

    try {
      const result = await sanctumProvider.signIn(credentials)
      setAuthData(result)

      // Store session in cookie
      if (typeof window !== 'undefined') {
        const sessionData = JSON.stringify(result)
        const maxAge = credentials.remember ? 60 * 60 * 24 * 30 : 60 * 60 * 24 // 30 days or 1 day
        document.cookie = `auth_session=${encodeURIComponent(sessionData)}; path=/; max-age=${maxAge}; SameSite=Lax`
      }

      return result
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Sign in failed'
      setError(message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  // Sign up
  const signUp = async (credentials: {
    name: string
    email: string
    password: string
    password_confirmation: string
  }) => {
    setIsLoading(true)
    setError(null)

    try {
      const result = await sanctumProvider.signUp(credentials)
      // Note: Don't set session until email verified
      return result
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Sign up failed'
      setError(message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  // Sign out
  const signOut = async () => {
    if (!authData) return

    setIsLoading(true)
    setError(null)

    try {
      await sanctumProvider.signOut(authData.session)
      setAuthData(null)

      if (typeof window !== 'undefined') {
        document.cookie = 'auth_session=; path=/; max-age=0'
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Sign out failed'
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

  // Refresh token
  const refreshToken = async () => {
    if (!authData) return

    try {
      const result = await sanctumProvider.refreshToken({ token: authData.session.token })
      setAuthData(result)

      if (typeof window !== 'undefined') {
        const sessionData = JSON.stringify(result)
        document.cookie = `auth_session=${encodeURIComponent(sessionData)}; path=/; max-age=${60 * 60 * 24}; SameSite=Lax`
      }

      return result
    } catch (err) {
      // If refresh fails, clear session
      setAuthData(null)
      if (typeof window !== 'undefined') {
        document.cookie = 'auth_session=; path=/; max-age=0'
      }
      throw err
    }
  }

  // Load session from cookie on mount
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const cookies = document.cookie.split('; ')
      const sessionCookie = cookies.find(c => c.startsWith('auth_session='))

      if (sessionCookie) {
        try {
          const value = decodeURIComponent(sessionCookie.split('=')[1])
          const parsed = JSON.parse(value)
          setAuthData(parsed)

          // Check if token is expired or about to expire
          if (parsed.session?.expiresAt && parsed.session.expiresAt < Date.now() + 5 * 60 * 1000) {
            // Token expires in less than 5 minutes, refresh it
            refreshToken()
          }
        } catch {
          document.cookie = 'auth_session=; path=/; max-age=0'
        }
      }
    }
  }, [refreshToken])

  return {
    session: authData?.session || null,
    user: authData?.user || null,
    isAuthenticated: !!authData?.session?.token,
    isLoading,
    error,
    signIn,
    signUp,
    signOut,
    refreshToken,
  }
}

// Re-export React for the hook
import * as React from 'react'
