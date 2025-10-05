/**
 * Laravel Sanctum Provider for Better-Auth
 *
 * Custom authentication provider that integrates Better-Auth with Laravel GraphQL API
 */

import { createClient, cacheExchange, fetchExchange } from 'urql'
import {
  LOGIN_MUTATION,
  REGISTER_MUTATION,
  LOGOUT_MUTATION,
} from '@/lib/graphql/operations'
import {
  LoginRequestSchema,
  RegisterRequestSchema,
  type LoginRequest,
  type RegisterRequest,
} from '@/app/contracts/auth'
import type { BetterAuthUser } from '@/lib/schemas/auth'

const GRAPHQL_URL = process.env.NEXT_PUBLIC_LARAVEL_GRAPHQL_URL || 'http://localhost:8000/graphql'

function createGraphQLClient(token?: string) {
  return createClient({
    url: GRAPHQL_URL,
    exchanges: [cacheExchange, fetchExchange],
    fetchOptions: () => {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      }
      if (token) {
        headers.Authorization = `Bearer ${token}`
      }
      return { headers }
    },
  })
}

export interface AuthProvider {
  id: string
  name: string
  signIn(credentials: LoginRequest): Promise<AuthResult>
  signUp(credentials: RegisterRequest): Promise<AuthResult>
  refreshToken(session: { token: string }): Promise<AuthResult>
  signOut(session: { token: string }): Promise<void>
}

export interface AuthResult {
  user: BetterAuthUser
  session: {
    token: string
    expiresAt: number
  }
}

/**
 * Laravel Sanctum authentication provider
 */
export const sanctumProvider: AuthProvider = {
  id: 'sanctum',
  name: 'Laravel Sanctum',

  /**
   * Sign in with email and password
   */
  async signIn(credentials: LoginRequest): Promise<AuthResult> {
    // Validate input
    const validated = LoginRequestSchema.parse(credentials)

    // Map remember to rememberMe for GraphQL
    const input = {
      email: validated.email,
      password: validated.password,
      rememberMe: validated.remember,
    }

    const client = createGraphQLClient()
    const result = await client
      .mutation(LOGIN_MUTATION, {
        input,
      })
      .toPromise()

    if (result.error) {
      throw new Error(result.error.message)
    }

    if (!result.data?.login) {
      throw new Error('Login failed')
    }

    const { login } = result.data

    // Transform to Better-Auth format
    return {
      user: {
        id: login.user.id,
        email: login.user.email,
        name: login.user.name,
        emailVerified: !!login.user.emailVerifiedAt,
        image: null,
      },
      session: {
        token: login.accessToken,
        expiresAt: new Date(login.expiresAt).getTime(),
      },
    }
  },

  /**
   * Sign up with name, email, and password
   */
  async signUp(credentials: RegisterRequest): Promise<AuthResult> {
    // Validate input
    const validated = RegisterRequestSchema.parse(credentials)

    // GraphQL expects passwordConfirmation not password_confirmation
    const input = {
      name: validated.name,
      email: validated.email,
      password: validated.password,
      passwordConfirmation: validated.password_confirmation,
    }

    const client = createGraphQLClient()
    const result = await client
      .mutation(REGISTER_MUTATION, {
        input,
      })
      .toPromise()

    if (result.error) {
      throw new Error(result.error.message)
    }

    if (!result.data?.register) {
      throw new Error('Registration failed')
    }

    const { register } = result.data

    // Return user with token from registration
    return {
      user: {
        id: register.user.id,
        email: register.user.email,
        name: register.user.name,
        emailVerified: !!register.user.emailVerifiedAt,
        image: null,
      },
      session: {
        token: register.accessToken,
        expiresAt: new Date(register.expiresAt).getTime(),
      },
    }
  },

  /**
   * Refresh access token - Not needed for GraphQL as token expiry is managed client-side
   */
  async refreshToken(_session: { token: string }): Promise<AuthResult> {
    // For GraphQL, we don't need to refresh tokens
    // The token should remain valid until expiresAt
    // If expired, user needs to login again
    throw new Error('Token refresh not supported - please login again')
  },

  /**
   * Sign out and revoke token
   */
  async signOut(session: { token: string }): Promise<void> {
    try {
      const client = createGraphQLClient(session.token)
      const result = await client.mutation(LOGOUT_MUTATION, {}).toPromise()

      if (result.error) {
        console.error('[Sanctum Provider] Logout error:', result.error)
      }
    } catch (error) {
      // Logout failures can be ignored (token may already be invalid)
      if (process.env.LOG_LEVEL === 'debug') {
        console.error('[Sanctum Provider] Logout error:', error)
      }
    }
  },
}
