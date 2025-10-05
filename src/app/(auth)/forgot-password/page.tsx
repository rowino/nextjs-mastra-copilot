'use client'

/**
 * Forgot Password Page
 *
 * Sends password reset link to user's email
 */

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ForgotPasswordRequestSchema, type ForgotPasswordRequest } from '@/app/contracts/auth'
import { apiClient, handleApiError } from '@/lib/api/client'
import { Button } from '@/app/components/ui/button'
import { useState } from 'react'

export default function ForgotPasswordPage() {
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordRequest>({
    resolver: zodResolver(ForgotPasswordRequestSchema),
  })

  const onSubmit = async (data: ForgotPasswordRequest) => {
    setError(null)
    setSuccess(false)
    setIsLoading(true)

    try {
      await apiClient
        .post('api/auth/password/forgot', {
          json: data,
        })
        .json()

      setSuccess(true)
    } catch (err) {
      await handleApiError(err)
      setError('Failed to send reset link')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-gray-900">Forgot your password?</h2>
          <p className="mt-2 text-sm text-gray-600">
            Enter your email and we&apos;ll send you a reset link.
          </p>
        </div>

        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {success ? (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
              <p className="font-medium">Check your email!</p>
              <p className="text-sm mt-1">We&apos;ve sent you a password reset link.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-1">
                  Email
                </label>
                <input
                  {...register('email')}
                  id="email"
                  type="email"
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="you@example.com"
                />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}

              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? 'Sending...' : 'Send reset link'}
              </Button>

              <div className="text-center text-sm">
                <a href="/login" className="text-blue-600 hover:underline">
                  Back to login
                </a>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
