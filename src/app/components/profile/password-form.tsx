'use client'

/**
 * Password Change Form Component
 *
 * Allows users to change their password using Server Actions
 */

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ChangePasswordRequestSchema, type ChangePasswordRequest } from '@/app/contracts/profile'
import { useAuth } from '@/lib/auth/client'
import { changePassword } from '@/lib/api/profile'
import { Button } from '@/app/components/ui/button'
import { useState } from 'react'

export function PasswordForm() {
  const { session } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ChangePasswordRequest>({
    resolver: zodResolver(ChangePasswordRequestSchema),
  })

  const onSubmit = async (data: ChangePasswordRequest) => {
    if (!session?.token) return

    setIsLoading(true)
    setError(null)
    setSuccess(false)

    try {
      await changePassword(session.token, data)
      setSuccess(true)
      reset()

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to change password')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label htmlFor="current_password" className="block text-sm font-medium text-gray-700">
          Current Password
        </label>
        <input
          {...register('current_password')}
          id="current_password"
          type="password"
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
        {errors.current_password && (
          <p className="mt-1 text-sm text-red-600">{errors.current_password.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
          New Password
        </label>
        <input
          {...register('password')}
          id="password"
          type="password"
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
        {errors.password && (
          <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="password_confirmation" className="block text-sm font-medium text-gray-700">
          Confirm New Password
        </label>
        <input
          {...register('password_confirmation')}
          id="password_confirmation"
          type="password"
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
        {errors.password_confirmation && (
          <p className="mt-1 text-sm text-red-600">{errors.password_confirmation.message}</p>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
          Password changed successfully!
        </div>
      )}

      <div className="flex justify-end">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Changing password...' : 'Change password'}
        </Button>
      </div>
    </form>
  )
}
