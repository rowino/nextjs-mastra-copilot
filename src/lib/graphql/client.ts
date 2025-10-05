/**
 * urql GraphQL Client Configuration
 *
 * Configures urql client with:
 * - Authentication exchange (Bearer token)
 * - Multipart fetch exchange (file uploads)
 * - Cache exchange
 * - Fetch exchange
 */

import { Client, cacheExchange, fetchExchange, createClient } from 'urql'

// Get GraphQL endpoint from environment
const GRAPHQL_URL = process.env.NEXT_PUBLIC_LARAVEL_GRAPHQL_URL || 'http://localhost:8000/graphql'

/**
 * Create urql client instance
 *
 * Note: This is a basic client without auth. For authenticated requests,
 * use createAuthenticatedClient() or wrap components with urql Provider
 * that has auth exchange configured.
 */
export function createUrqlClient(token?: string): Client {
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

/**
 * Default client instance (no auth)
 * Use this for public queries like password policy
 */
export const urqlClient = createUrqlClient()
