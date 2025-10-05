/**
 * Better-Auth API Route Handler
 *
 * Handles Better-Auth callbacks and session management
 * Route: /api/auth/[...better-auth]
 */

import { NextRequest, NextResponse } from 'next/server'
import { sanctumProvider } from '@/lib/auth/providers/sanctum'

/**
 * Handle POST requests for authentication actions
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, ...data } = body

    switch (action) {
      case 'signIn': {
        const result = await sanctumProvider.signIn(data)
        return NextResponse.json(result)
      }

      case 'signUp': {
        const result = await sanctumProvider.signUp(data)
        return NextResponse.json(result)
      }

      case 'refreshToken': {
        const result = await sanctumProvider.refreshToken(data)
        return NextResponse.json(result)
      }

      case 'signOut': {
        await sanctumProvider.signOut(data)
        return NextResponse.json({ success: true })
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('[Better-Auth Route] Error:', error)

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Authentication failed',
      },
      { status: 500 }
    )
  }
}

/**
 * Handle GET requests (session validation, etc.)
 */
export async function GET(_request: NextRequest) {
  // For now, just return a 404 for GET requests
  // In a full implementation, this could handle session validation
  return NextResponse.json({ error: 'Not found' }, { status: 404 })
}
