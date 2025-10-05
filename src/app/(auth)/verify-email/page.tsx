'use client'

/**
 * Email Verification Page
 *
 * Handles email verification token from URL parameter
 */

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { apiClient, handleApiError } from '@/lib/api/client'
import { VerifyEmailResponseSchema } from '@/app/contracts/auth'
import { Button } from '@/app/components/ui/button'

function VerifyEmailContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams?.get('token')

  const [status, setStatus] = useState<'pending' | 'success' | 'error'>('pending')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!token) {
      setStatus('error')
      setMessage('No verification token provided')
      return
    }

    // Verify email
    async function verifyEmail() {
      try {
        const response = await apiClient
          .post('api/auth/email/verify', {
            json: { token },
          })
          .json()

        const data = VerifyEmailResponseSchema.parse(response)

        if (data.success) {
          setStatus('success')
          setMessage(data.message)

          // Redirect to login after 3 seconds
          setTimeout(() => {
            router.push('/login?verified=true')
          }, 3000)
        } else {
          setStatus('error')
          setMessage(data.message)
        }
      } catch (error) {
        await handleApiError(error)
        setStatus('error')
        setMessage('Email verification failed')
      }
    }

    verifyEmail()
  }, [token, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="text-center">
            {status === 'pending' && (
              <>
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
                <h2 className="text-xl font-semibold mb-2">Verifying your email...</h2>
                <p className="text-gray-600">Please wait while we verify your email address.</p>
              </>
            )}

            {status === 'success' && (
              <>
                <div className="text-green-600 text-5xl mb-4">✓</div>
                <h2 className="text-xl font-semibold mb-2 text-green-700">Email verified!</h2>
                <p className="text-gray-600 mb-4">{message}</p>
                <p className="text-sm text-gray-500">Redirecting to login...</p>
              </>
            )}

            {status === 'error' && (
              <>
                <div className="text-red-600 text-5xl mb-4">✗</div>
                <h2 className="text-xl font-semibold mb-2 text-red-700">Verification failed</h2>
                <p className="text-gray-600 mb-4">{message}</p>
                <Button onClick={() => router.push('/login')} className="mt-4">
                  Go to Login
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
        <div className="max-w-md w-full">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Loading...</h2>
            </div>
          </div>
        </div>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  )
}
