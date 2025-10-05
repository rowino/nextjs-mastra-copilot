/**
 * API Client Configuration
 *
 * HTTP client for Laravel API with error handling and authentication
 */

import ky, { type KyInstance, HTTPError } from 'ky'
import { AuthErrorResponseSchema } from '@/app/contracts/auth'

// Get Laravel API URL from environment
// Use NEXT_PUBLIC_ prefix for client-side access (needed for MSW)
const API_URL = process.env.NEXT_PUBLIC_LARAVEL_API_URL || process.env.LARAVEL_API_URL || 'http://localhost:8000'

/**
 * Base API client instance
 */
export const apiClient: KyInstance = ky.create({
  prefixUrl: API_URL,
  timeout: 30000, // 30 seconds
  retry: {
    limit: 2,
    methods: ['get'],
    statusCodes: [408, 429, 500, 502, 503, 504],
  },
  hooks: {
    beforeRequest: [
      (request) => {
        // Add default headers
        request.headers.set('Accept', 'application/json')
        request.headers.set('Content-Type', 'application/json')
      },
    ],
    afterResponse: [
      async (_request, _options, response) => {
        // Log responses in debug mode
        if (process.env.LOG_LEVEL === 'debug') {
          console.log('[API Client] Response:', {
            status: response.status,
            url: response.url,
          })
        }
        return response
      },
    ],
  },
})

/**
 * Create authenticated API client with Bearer token
 */
export function createAuthenticatedClient(token: string): KyInstance {
  return apiClient.extend({
    hooks: {
      beforeRequest: [
        (request) => {
          request.headers.set('Authorization', `Bearer ${token}`)
        },
      ],
    },
  })
}

/**
 * API Error class with Laravel validation error support
 */
export class ApiError extends Error {
  constructor(
    public status: number,
    public message: string,
    public errors?: Record<string, string[]>
  ) {
    super(message)
    this.name = 'ApiError'
  }

  /**
   * Get first validation error message for a field
   */
  getFieldError(field: string): string | undefined {
    return this.errors?.[field]?.[0]
  }

  /**
   * Get all validation errors as flat array
   */
  getAllErrors(): string[] {
    if (!this.errors) return [this.message]

    return Object.values(this.errors).flat()
  }
}

/**
 * Handle HTTP errors from ky
 */
export async function handleApiError(error: unknown): Promise<never> {
  if (error instanceof HTTPError) {
    const response = error.response

    try {
      const body = await response.json()
      const parsed = AuthErrorResponseSchema.safeParse(body)

      if (parsed.success) {
        throw new ApiError(response.status, parsed.data.message, parsed.data.errors)
      }
    } catch {
      // If parsing fails, throw generic error
      throw new ApiError(response.status, response.statusText)
    }
  }

  // Non-HTTP errors (network issues, etc.)
  throw new ApiError(0, 'Network error. Please check your connection.')
}

/**
 * Safe API call wrapper with error handling
 */
export async function safeApiCall<T>(
  fn: () => Promise<T>
): Promise<{ data?: T; error?: ApiError }> {
  try {
    const data = await fn()
    return { data }
  } catch (error) {
    const apiError = await handleApiError(error)
    return { error: apiError }
  }
}
