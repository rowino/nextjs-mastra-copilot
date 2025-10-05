'use client'

/**
 * GraphQL Integration Test Page
 *
 * Simple test page to verify GraphQL connection to Laravel backend
 */

import { useQuery, useMutation } from 'urql'
import { PASSWORD_POLICY_QUERY, REGISTER_MUTATION } from '@/lib/graphql/operations'
import { useState } from 'react'

export default function TestGraphQLPage() {
  const [result, setResult] = useState<string>('')

  // Test query
  const [passwordPolicyResult] = useQuery({
    query: PASSWORD_POLICY_QUERY,
  })

  // Test mutation (won't actually submit)
  const [, registerMutation] = useMutation(REGISTER_MUTATION)

  const testMutation = async () => {
    const result = await registerMutation({
      input: {
        name: 'Test User',
        email: 'test@example.com',
        password: 'Test123!@#',
        passwordConfirmation: 'Test123!@#',
      },
    })

    if (result.error) {
      setResult(`Mutation Error: ${result.error.message}`)
    } else {
      setResult(`Mutation Success: ${JSON.stringify(result.data, null, 2)}`)
    }
  }

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold">GraphQL Integration Test</h1>

        {/* Connection Status */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Connection Status</h2>
          <div className="space-y-2">
            <p>
              <strong>GraphQL URL:</strong>{' '}
              {process.env.NEXT_PUBLIC_LARAVEL_GRAPHQL_URL || 'http://localhost:8000/graphql'}
            </p>
            <p>
              <strong>Status:</strong>{' '}
              <span
                className={
                  passwordPolicyResult.fetching
                    ? 'text-yellow-600'
                    : passwordPolicyResult.error
                      ? 'text-red-600'
                      : 'text-green-600'
                }
              >
                {passwordPolicyResult.fetching
                  ? 'Connecting...'
                  : passwordPolicyResult.error
                    ? 'Error'
                    : 'Connected'}
              </span>
            </p>
          </div>
        </div>

        {/* Query Test */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Query Test: passwordPolicy</h2>

          {passwordPolicyResult.fetching && (
            <p className="text-gray-600">Loading password policy...</p>
          )}

          {passwordPolicyResult.error && (
            <div className="bg-red-50 border border-red-200 rounded p-4">
              <p className="text-red-800 font-semibold">Error:</p>
              <pre className="text-sm text-red-600 mt-2 whitespace-pre-wrap">
                {passwordPolicyResult.error.message}
              </pre>
              {passwordPolicyResult.error.networkError && (
                <p className="text-xs text-red-500 mt-2">
                  Network Error: Check that Laravel backend is running at{' '}
                  {process.env.NEXT_PUBLIC_LARAVEL_GRAPHQL_URL || 'http://localhost:8000/graphql'}
                </p>
              )}
            </div>
          )}

          {passwordPolicyResult.data && (
            <div className="bg-green-50 border border-green-200 rounded p-4">
              <p className="text-green-800 font-semibold">Success! Response:</p>
              <pre className="text-sm text-green-700 mt-2 bg-white p-3 rounded overflow-auto">
                {JSON.stringify(passwordPolicyResult.data, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Mutation Test */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Mutation Test: register</h2>
          <p className="text-sm text-gray-600 mb-4">
            This will attempt to register a test user. Click the button to test the mutation.
          </p>

          <button
            onClick={testMutation}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          >
            Test Register Mutation
          </button>

          {result && (
            <div className="mt-4 bg-gray-50 border border-gray-200 rounded p-4">
              <pre className="text-sm whitespace-pre-wrap">{result}</pre>
            </div>
          )}
        </div>

        {/* Type Safety Demo */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Type Safety Demo</h2>
          <p className="text-sm text-gray-600">
            All GraphQL operations are fully typed. Try this in your IDE:
          </p>
          <pre className="text-sm bg-gray-100 p-3 rounded mt-2 overflow-auto">
            {`import { useQuery } from 'urql'
import { PASSWORD_POLICY_QUERY } from '@/lib/graphql/operations'

const [result] = useQuery({ query: PASSWORD_POLICY_QUERY })

// TypeScript knows the exact shape:
result.data?.passwordPolicy.minLength // ✓ number
result.data?.passwordPolicy.requireUppercase // ✓ boolean
result.data?.passwordPolicy.invalidField // ✗ Type error!`}
          </pre>
        </div>

        {/* Next Steps */}
        <div className="bg-blue-50 border border-blue-200 rounded p-6">
          <h2 className="text-xl font-semibold mb-2 text-blue-900">Next Steps</h2>
          <ul className="list-disc list-inside text-sm text-blue-800 space-y-1">
            <li>Ensure Laravel backend is running at http://localhost:8000</li>
            <li>Verify GraphQL endpoint is accessible at http://localhost:8000/graphql</li>
            <li>Check that CORS is configured to allow requests from http://localhost:3000</li>
            <li>
              All GraphQL operations are defined in <code>src/lib/graphql/operations.ts</code>
            </li>
            <li>
              Use <code>pnpm codegen</code> to regenerate types after schema changes
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
