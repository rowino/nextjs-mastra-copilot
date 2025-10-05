/**
 * Next.js Middleware
 *
 * Handles authentication checks for protected routes
 */

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if route requires authentication
  const isProtectedRoute = pathname.startsWith('/dashboard') ||
                          pathname.startsWith('/profile') ||
                          pathname.startsWith('/settings')

  if (isProtectedRoute) {
    // Check for auth session cookie
    const sessionCookie = request.cookies.get('auth_session')

    if (!sessionCookie) {
      // No session - redirect to login with return URL
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('returnTo', pathname)
      return NextResponse.redirect(loginUrl)
    }

    // Validate session data
    try {
      const sessionData = JSON.parse(sessionCookie.value)

      // Check if session is expired
      if (sessionData.expiresAt && sessionData.expiresAt < Date.now()) {
        // Session expired - redirect to login
        const loginUrl = new URL('/login', request.url)
        loginUrl.searchParams.set('returnTo', pathname)
        loginUrl.searchParams.set('expired', 'true')

        const response = NextResponse.redirect(loginUrl)
        response.cookies.delete('auth_session')
        return response
      }
    } catch {
      // Invalid session data - redirect to login
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('returnTo', pathname)

      const response = NextResponse.redirect(loginUrl)
      response.cookies.delete('auth_session')
      return response
    }
  }

  // Allow request to proceed
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|public).*)',
  ],
}
