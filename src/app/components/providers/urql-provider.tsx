'use client'

/**
 * urql Provider Component
 *
 * Wraps app with urql context and handles SSR
 */

import { useMemo } from 'react'
import { UrqlProvider, ssrExchange, cacheExchange, fetchExchange, createClient } from '@urql/next'
import type { ReactNode } from 'react'

const GRAPHQL_URL = process.env.NEXT_PUBLIC_LARAVEL_GRAPHQL_URL || 'http://localhost:8000/graphql'

export function GraphQLProvider({ children }: { children: ReactNode }) {
  const [client, ssr] = useMemo(() => {
    const ssr = ssrExchange()

    const client = createClient({
      url: GRAPHQL_URL,
      exchanges: [cacheExchange, ssr, fetchExchange],
      fetchOptions: () => {
        // TODO: Get token from auth context/cookies
        // For now, return basic headers
        return {
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
        }
      },
    })

    return [client, ssr]
  }, [])

  return (
    <UrqlProvider client={client} ssr={ssr}>
      {children}
    </UrqlProvider>
  )
}
