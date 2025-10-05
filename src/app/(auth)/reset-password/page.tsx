'use client'

/**
 * Reset Password Page
 *
 * Allows user to set new password using reset token
 */

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ResetPasswordRequestSchema, type ResetPasswordRequest } from '@/app/contracts/auth'
import { apiClient, handleApiError } from '@/lib/api/client'
import { Button } from '@/app/components/ui/button'
import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'

function ResetPasswordContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams?.get('token')
  const email = searchParams?.get('email')

  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ResetPasswordRequest>({
    resolver: zodResolver(ResetPasswordRequestSchema),
  })

  useEffect(() => {
    if (token && email) {
      setValue('token', token)
      setValue('email', email)
    }
  }, [token, email, setValue])

  if (!token || !email) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
        <div className="max-w-md w-full">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            Invalid reset link
          </div>
        </div>
      </div>
    )
  }

  const onSubmit = async (data: ResetPasswordRequest) => {
    setError(null)
    setSuccess(false)
    setIsLoading(true)

    try {
      await apiClient
        .post('api/auth/password/reset', {
          json: data,
        })
        .json()

      setSuccess(true)

      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push('/login')
      }, 2000)
    } catch (err) {
      await handleApiError(err)
      setError('Failed to reset password')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-gray-900">Reset your password</h2>
          <p className="mt-2 text-sm text-gray-600">Enter your new password below.</p>
        </div>

        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {success ? (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
              <p className="font-medium">Password reset successful!</p>
              <p className="text-sm mt-1">Redirecting to login...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <input type="hidden" {...register('token')} />
              <input type="hidden" {...register('email')} />

              <div>
                <label htmlFor="password" className="block text-sm font-medium mb-1">
                  New Password
                </label>
                <input
                  {...register('password')}
                  id="password"
                  type="password"
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="••••••••"
                />
                {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
              </div>

              <div>
                <label htmlFor="password_confirmation" className="block text-sm font-medium mb-1">
                  Confirm Password
                </label>
                <input
                  {...register('password_confirmation')}
                  id="password_confirmation"
                  type="password"
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="••••••••"
                />
                {errors.password_confirmation && (
                  <p className="text-red-500 text-sm mt-1">{errors.password_confirmation.message}</p>
                )}
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}

              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? 'Resetting...' : 'Reset password'}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
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
      <ResetPasswordContent />
    </Suspense>
  )
}
